/**
 * OperationController
 * Orchestrates operations by coordinating between services
 * Implements the core workflows: clean_slate, save, update, install, build, test, run, reset
 */

import type {
	Operation,
	OperationParameters,
	Platform,
	Project,
} from '../models/Project.ts'
import { gitService } from '../services/GitService.ts'
import { Logger } from '../services/Logger.ts'
import { reactNativeService } from '../services/ReactNativeService.ts'

/**
 * Result of an operation execution
 */
export interface OperationResult {
	success: boolean
	message: string
	error?: string
}

/**
 * Controller for executing operations on projects
 */
export class OperationController {
	private logger: Logger

	constructor(logger?: Logger) {
		this.logger = logger || new Logger()
	}

	/**
	 * Gets the logger instance
	 */
	getLogger(): Logger {
		return this.logger
	}

	/**
	 * Sets a new logger instance
	 */
	setLogger(logger: Logger): void {
		this.logger = logger
	}

	/**
	 * Executes a single operation on a project
	 * @param operation - Operation to execute
	 * @param project - Target project
	 * @returns Operation result
	 */
	async execute(
		operation: Operation,
		project: Project,
	): Promise<OperationResult> {
		const { type, parameters = {} } = operation
		const workingDir = project.workingDirectory

		this.logger.info(`Starting operation: ${type} on ${project.name}`)

		try {
			let result: OperationResult

			switch (type) {
				case 'clean_slate':
					result = await this.cleanSlate(workingDir)
					break

				case 'fresh':
					result = await this.freshChangeset(
						workingDir,
						project,
						parameters,
					)
					break

				case 'save':
					result = await this.save(
						workingDir,
						project.configuration.savePreference,
					)
					break

				case 'update':
					result = await this.update(
						workingDir,
						project.configuration.defaultBranch,
					)
					break

				case 'install':
					result = await this.install(workingDir, parameters)
					break

				case 'build':
					result = await this.build(workingDir, parameters)
					break

				case 'test':
					result = await this.test(workingDir, parameters)
					break

				case 'run':
					result = await this.run(
						workingDir,
						project.configuration,
						parameters,
					)
					break

				case 'reset':
					result = await this.reset(workingDir)
					break

				case 'pod_install':
					result = await this.podInstall(workingDir)
					break

				case 'custom':
					result = await this.custom(workingDir, parameters)
					break

				default:
					result = {
						success: false,
						message: `Unknown operation type: ${type}`,
					}
			}

			// Log the result
			if (result.success) {
				this.logger.log(result.message)
			} else {
				this.logger.failure(result.message)
				if (result.error) {
					this.logger.error(result.error)
				}
			}

			return result
		} catch (error) {
			const errorMsg = error instanceof Error
				? error.message
				: 'Unknown error'
			this.logger.error('Operation failed', errorMsg)
			return {
				success: false,
				message: 'Operation failed',
				error: errorMsg,
			}
		}
	}

	/**
	 * Executes multiple operations in sequence
	 * Stops on first failure unless continueOnError is true
	 * @param operations - Array of operations to execute
	 * @param project - Target project
	 * @param continueOnError - Whether to continue if an operation fails
	 * @returns Array of operation results
	 */
	async executeSequence(
		operations: Operation[],
		project: Project,
		continueOnError: boolean = false,
	): Promise<OperationResult[]> {
		const results: OperationResult[] = []

		for (const operation of operations) {
			const result = await this.execute(operation, project)
			results.push(result)

			// Stop on failure if continueOnError is false
			if (!result.success && !continueOnError) {
				break
			}
		}

		return results
	}

	/**
	 * Clean slate operation - discard all uncommitted changes
	 */
	private async cleanSlate(
		workingDir: string,
	): Promise<OperationResult> {
		this.logger.verbose('Checking if directory is a git repository...')

		// Check if git repository
		const isGitRepo = await gitService.isGitRepository(
			workingDir,
			this.logger,
		)
		if (!isGitRepo) {
			this.logger.warning('Not a git repository')
			return {
				success: false,
				message: 'Not a git repository',
			}
		}

		this.logger.verbose('Discarding all uncommitted changes...')
		const result = await gitService.cleanSlate(workingDir, this.logger)

		return {
			success: result.success,
			message: result.output || 'Clean slate completed',
			error: result.error,
		}
	}

	/**
	 * Save operation - stash or branch uncommitted changes
	 */
	private async save(
		workingDir: string,
		savePreference: 'stash' | 'branch',
	): Promise<OperationResult> {
		this.logger.verbose('Checking if directory is a git repository...')

		// Check if git repository
		const isGitRepo = await gitService.isGitRepository(workingDir)
		if (!isGitRepo) {
			this.logger.warning('Not a git repository')
			return {
				success: false,
				message: 'Not a git repository',
			}
		}

		this.logger.verbose('Checking for uncommitted changes...')

		// Check for uncommitted changes
		const hasChanges = await gitService.hasUncommittedChanges(workingDir)
		if (!hasChanges) {
			this.logger.info('No changes to save')
			return {
				success: true,
				message: 'No changes to save',
			}
		}

		this.logger.verbose(
			`Saving changes using ${savePreference} strategy...`,
		)
		const result = await gitService.saveChanges(
			workingDir,
			savePreference,
			undefined,
			undefined,
			this.logger,
		)

		return {
			success: result.success,
			message: result.output || 'Changes saved',
			error: result.error,
		}
	}

	/**
	 * Update operation - pull latest changes from repository
	 */
	private async update(
		workingDir: string,
		defaultBranch?: string,
	): Promise<OperationResult> {
		this.logger.verbose('Checking if directory is a git repository...')

		// Check if git repository
		const isGitRepo = await gitService.isGitRepository(workingDir)
		if (!isGitRepo) {
			this.logger.warning('Not a git repository')
			return {
				success: false,
				message: 'Not a git repository',
			}
		}

		if (defaultBranch) {
			this.logger.verbose(`Updating from branch: ${defaultBranch}`)
		} else {
			this.logger.verbose('Updating current branch...')
		}

		const result = await gitService.update(
			workingDir,
			defaultBranch,
			this.logger,
		)

		return {
			success: result.success,
			message: result.output || 'Repository updated',
			error: result.error,
		}
	}

	/**
	 * Install operation - install project dependencies
	 */
	private async install(
		workingDir: string,
		parameters: OperationParameters,
	): Promise<OperationResult> {
		const pm = parameters.packageManager || 'npm'
		this.logger.verbose(`Installing dependencies using ${pm}...`)

		const result = await reactNativeService.install(
			workingDir,
			parameters.packageManager,
		)

		return {
			success: result.success,
			message: result.output || 'Dependencies installed',
			error: result.error,
		}
	}

	/**
	 * Build operation - build the project
	 */
	private async build(
		workingDir: string,
		parameters: OperationParameters,
	): Promise<OperationResult> {
		const platform = parameters.platform || 'ios'
		const mode = parameters.mode || 'debug'

		this.logger.verbose(`Building for ${platform} in ${mode} mode...`)

		const result = await reactNativeService.build(
			workingDir,
			platform as Platform,
			mode,
		)

		return {
			success: result.success,
			message: result.output || 'Build completed',
			error: result.error,
		}
	}

	/**
	 * Test operation - run project tests
	 */
	private async test(
		workingDir: string,
		parameters: OperationParameters,
	): Promise<OperationResult> {
		this.logger.verbose('Running tests...')
		if (parameters.testFile) {
			this.logger.verbose(`Test file: ${parameters.testFile}`)
		}
		if (parameters.coverage) {
			this.logger.verbose('Coverage enabled')
		}

		const result = await reactNativeService.test(
			workingDir,
			parameters.testFile,
			parameters.coverage,
		)

		return {
			success: result.success,
			message: result.output || 'Tests completed',
			error: result.error,
		}
	}

	/**
	 * Run operation - run the app on simulator/emulator
	 */
	private async run(
		workingDir: string,
		config: Project['configuration'],
		parameters: OperationParameters,
	): Promise<OperationResult> {
		const platform = parameters.platform || config.defaultPlatform || 'ios'
		const device = parameters.device || config.defaultDevice
		const mode = parameters.mode || 'debug'

		this.logger.verbose(
			`Running app on ${platform}/${
				device ? ` (${device})` : ''
			} in ${mode} mode...`,
		)

		const result = await reactNativeService.run(
			workingDir,
			platform as Platform,
			device,
			mode,
		)

		return {
			success: result.success,
			message: result.output || 'App running',
			error: result.error,
		}
	}

	/**
	 * Reset operation - reset React Native cache
	 */
	private async reset(workingDir: string): Promise<OperationResult> {
		this.logger.verbose('Resetting React Native cache...')

		const result = await reactNativeService.reset(workingDir)

		return {
			success: result.success,
			message: result.output || 'Cache reset',
			error: result.error,
		}
	}

	/**
	 * Pod install operation - install iOS CocoaPods dependencies
	 */
	private async podInstall(
		workingDir: string,
	): Promise<OperationResult> {
		this.logger.verbose('Installing CocoaPods dependencies...')

		const result = await reactNativeService.podInstall(workingDir)

		return {
			success: result.success,
			message: result.output || 'Pods installed',
			error: result.error,
		}
	}

	/**
	 * Fresh changeset operation - create a new changeset
	 * @param workingDir - Path to the working directory
	 * @param project - Project configuration
	 * @param parameters - Operation parameters including changesetName
	 * @returns Operation result
	 */
	private async freshChangeset(
		workingDir: string,
		project: Project,
		parameters: OperationParameters,
	): Promise<OperationResult> {
		// Get changeset name from parameters
		const _changesetId: string = parameters.changesetName || 'new-changeset'

		this.logger.verbose('Creating fresh changeset...')
		const currentBranch = await gitService.getCurrentBranch(workingDir)

		// Check if we have uncommited changes
		const isClean = await gitService.hasUncommittedChanges(workingDir)
		if (!isClean) {
			this.logger.verbose('Stashing uncommitted changes...')
			const expectedStashName = `wip-${currentBranch}-${Date.now()}`
			const result = await gitService.saveChanges(
				workingDir,
				'stash',
				expectedStashName,
				undefined,
				this.logger,
			)
			this.logger.verbose(
				`Stashed changes with name: ${expectedStashName}`,
			)
			if (!result.success) {
				return {
					success: false,
					message: 'Failed to stash changes',
					error: result.error,
				}
			}
		}

		this.logger.verbose('Checking latest changes on main branch...')

		// Change to main branch and update to latest changes

		// Identify the main branch name
		const mainBranchName = await gitService.getMainBranch(
			workingDir,
			project.configuration.defaultBranch,
		)
		if (!mainBranchName) {
			this.logger.error('Main branch not found')
			return {
				success: false,
				message: 'Main branch not found',
			}
		}

		// Switch to main branch if not already on it
		if (mainBranchName !== currentBranch) {
			this.logger.verbose(`Changing to main branch: ${mainBranchName}`)
			const result = await gitService.switchToBranch(
				workingDir,
				mainBranchName,
				this.logger,
			)
			if (!result.success) {
				return {
					success: false,
					message: 'Failed to switch to main branch',
					error: result.error,
				}
			}
		}

		// Update to latest changes
		this.logger.verbose('Updating to latest changes...')
		const updateResult = await gitService.update(
			workingDir,
			mainBranchName,
			this.logger,
		)
		if (!updateResult.success) {
			return {
				success: false,
				message: 'Failed to update to latest changes',
				error: updateResult.error,
			}
		} else {
			this.logger.info('Latest changes updated successfully')
		}

		// Create the changeset branch
		const branchName = `changeset/${_changesetId}`

		// Check if the branch already exists
		const doesBranchExist = await gitService.doesBranchExist(
			workingDir,
			branchName,
		)
		if (doesBranchExist) {
			this.logger.warning(
				`Branch ${branchName} already exists. Switching to it...`,
			)
			const result = await gitService.switchToBranch(
				workingDir,
				branchName,
				this.logger,
			)
			if (!result.success) {
				return {
					success: false,
					message: 'Failed to switch to changeset branch',
					error: result.error,
				}
			}
		} else {
			this.logger.verbose(`Creating new branch: ${branchName}`)
			const result = await gitService.createBranch(
				workingDir,
				branchName,
				this.logger,
			)
			if (!result.success) {
				return {
					success: false,
					message: 'Failed to create changeset branch',
					error: result.error,
				}
			}
		}

		return {
			success: true,
			message: 'Changeset created/started successfully',
		}
	}

	/**
	 * Custom operation - execute a custom shell command
	 */
	private async custom(
		workingDir: string,
		parameters: OperationParameters,
	): Promise<OperationResult> {
		if (!parameters.command) {
			this.logger.warning('Custom command requires a "command" parameter')
			return {
				success: false,
				message: 'Custom command requires a "command" parameter',
			}
		}

		const customWorkingDir = parameters.workingDirectory || workingDir

		this.logger.verbose(`Executing custom command: ${parameters.command}`)
		if (customWorkingDir !== workingDir) {
			this.logger.verbose(`Working directory: ${customWorkingDir}`)
		}

		const result = await reactNativeService.executeCustomCommand(
			parameters.command,
			customWorkingDir,
		)

		return {
			success: result.success,
			message: result.output || 'Custom command executed',
			error: result.error,
		}
	}
}

/**
 * Singleton instance of OperationController
 */
export const operationController = new OperationController()
