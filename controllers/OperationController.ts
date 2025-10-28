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
import { ToolchainServiceFactory } from '../services/ToolchainServiceFactory.ts'

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
	 * Injects logger into toolchain service if it supports it
	 */
	private injectLogger(service: any): void {
		if (service && typeof service.setLogger === 'function') {
			service.setLogger(this.logger)
		}
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

				case 'switch_changeset':
					result = await this.switchChangeset(
						workingDir,
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
					result = await this.install(workingDir, parameters, project)
					break

				case 'build':
					result = await this.build(workingDir, parameters, project)
					break

				case 'test':
					result = await this.test(workingDir, parameters, project)
					break

				case 'run':
					result = await this.run(
						workingDir,
						project,
						parameters,
					)
					break

				case 'reset':
					result = await this.reset(workingDir, project)
					break

				case 'pod_install':
					result = await this.podInstall(workingDir)
					break

				case 'run_script':
					result = await this.runScript(
						workingDir,
						parameters,
						project,
					)
					break

				case 'custom':
					result = await this.custom(workingDir, parameters, project)
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
		project?: Project,
	): Promise<OperationResult> {
		const service = ToolchainServiceFactory.getService(
			project?.configuration.toolchain,
		)
		this.injectLogger(service)
		const pm = parameters.packageManager || 'npm'
		this.logger.verbose(`Installing dependencies using ${pm}...`)

		const result = await service.install(
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
		project?: Project,
	): Promise<OperationResult> {
		const service = ToolchainServiceFactory.getService(
			project?.configuration.toolchain,
		)
		this.injectLogger(service)

		const platform = parameters.platform ||
			project?.configuration.defaultPlatform || 'ios'
		const mode = parameters.mode || 'debug'

		this.logger.verbose(`Building for ${platform} in ${mode} mode...`)

		const buildMode = mode === 'release' ? 'production' : 'development'
		const result = await service.build(
			workingDir,
			buildMode,
			platform as Platform,
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
		project?: Project,
	): Promise<OperationResult> {
		const service = ToolchainServiceFactory.getService(
			project?.configuration.toolchain,
		)
		this.injectLogger(service)
		this.logger.verbose('Running tests...')
		if (parameters.testFile) {
			this.logger.verbose(`Test file: ${parameters.testFile}`)
		}
		if (parameters.coverage) {
			this.logger.verbose('Coverage enabled')
		}

		const result = await service.test(
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
	 * Run operation - run the app on simulator/emulator or dev server
	 */
	private async run(
		workingDir: string,
		project: Project,
		parameters: OperationParameters,
	): Promise<OperationResult> {
		const service = ToolchainServiceFactory.getService(
			project.configuration.toolchain,
		)
		this.injectLogger(service)
		const platform = parameters.platform ||
			project.configuration.defaultPlatform || 'ios'
		const device = parameters.device || project.configuration.defaultDevice
		const mode = parameters.mode || 'debug'

		this.logger.verbose(
			`Running app on ${platform}/${
				device ? ` (${device})` : ''
			} in ${mode} mode...`,
		)

		// For web projects (Vite/Next.js), use appropriate run method
		const runMode = mode === 'release' ? 'production' : 'development'
		const result = await service.run(
			workingDir,
			platform as Platform,
			device,
			runMode,
		)

		return {
			success: result.success,
			message: result.output || 'App running',
			error: result.error,
		}
	}

	/**
	 * Reset operation - reset project cache
	 */
	private async reset(
		workingDir: string,
		project?: Project,
	): Promise<OperationResult> {
		const service = ToolchainServiceFactory.getService(
			project?.configuration.toolchain,
		)
		this.injectLogger(service)
		const toolchain = project?.configuration.toolchain || 'react-native'
		this.logger.verbose(`Resetting ${toolchain} cache...`)

		const result = await service.reset(workingDir)

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
	 * Switch changeset operation - switch to local changeset or checkout remote branch
	 * Stashes uncommitted changes before switching to prevent data loss
	 * @param workingDir - Path to the working directory
	 * @param parameters - Operation parameters including branchName and branchType
	 * @returns Operation result
	 */
	private async switchChangeset(
		workingDir: string,
		parameters: OperationParameters,
	): Promise<OperationResult> {
		if (!parameters.branchName) {
			this.logger.warning(
				'Switch changeset requires a "branchName" parameter',
			)
			return {
				success: false,
				message: 'Branch name is required',
			}
		}

		// Check if we have uncommitted changes and stash them
		this.logger.verbose('Checking for uncommitted changes...')
		const hasChanges = await gitService.hasUncommittedChanges(workingDir)

		if (hasChanges) {
			this.logger.verbose('Stashing uncommitted changes...')
			const currentBranch = await gitService.getCurrentBranch(workingDir)
			const stashName =
				`auto-stash-before-switch-${currentBranch}-${Date.now()}`

			const stashResult = await gitService.saveChanges(
				workingDir,
				'stash',
				stashName,
				undefined,
				this.logger,
			)

			if (!stashResult.success) {
				this.logger.error('Failed to stash changes before switching')
				return {
					success: false,
					message: 'Failed to stash uncommitted changes',
					error: stashResult.error,
				}
			}

			this.logger.log(`Changes stashed as: ${stashName}`)
		} else {
			this.logger.verbose('Working directory is clean')
		}

		const branchType = parameters.branchType || 'local'

		if (branchType === 'local') {
			// Switch to existing local branch
			this.logger.verbose(
				`Switching to local branch: ${parameters.branchName}`,
			)
			const result = await gitService.switchToBranch(
				workingDir,
				parameters.branchName,
				this.logger,
			)

			return {
				success: result.success,
				message: result.output ||
					`Switched to ${parameters.branchName}`,
				error: result.error,
			}
		} else {
			// Checkout remote branch as new local changeset
			// Always follow the pattern: changeset/${remoteBranchName}
			const remoteBranch = parameters.branchName

			// Remove origin/ prefix
			let branchName = remoteBranch.replace(/^origin\//, '')

			// Remove any existing changeset/ prefix to avoid double prefixing
			branchName = branchName.replace(/^changeset\//, '')

			// Always create with changeset/ prefix
			const localBranchName = `changeset/${branchName}`

			this.logger.verbose(
				`Checking out remote branch ${remoteBranch} as ${localBranchName}`,
			)

			const result = await gitService.checkoutRemoteBranch(
				workingDir,
				remoteBranch,
				localBranchName,
				this.logger,
			)

			return {
				success: result.success,
				message: result.output ||
					`Created changeset ${localBranchName}`,
				error: result.error,
			}
		}
	}

	/**
	 * Run script operation - execute a package manager script
	 */
	private async runScript(
		workingDir: string,
		parameters: OperationParameters,
		project?: Project,
	): Promise<OperationResult> {
		if (!parameters.scriptName) {
			this.logger.warning(
				'Run script operation requires a "scriptName" parameter',
			)
			return {
				success: false,
				message:
					'Run script operation requires a "scriptName" parameter',
			}
		}

		const service = ToolchainServiceFactory.getService(
			project?.configuration.toolchain,
		)
		this.injectLogger(service)
		this.logger.verbose(`Running script: ${parameters.scriptName}`)
		if (parameters.packageManager) {
			this.logger.verbose(
				`Using package manager: ${parameters.packageManager}`,
			)
		}

		const result = await service.runScript(
			workingDir,
			parameters.scriptName,
			parameters.packageManager,
		)

		return {
			success: result.success,
			message: result.output ||
				`Script '${parameters.scriptName}' executed`,
			error: result.error,
		}
	}

	/**
	 * Custom operation - execute a custom shell command
	 */
	private async custom(
		workingDir: string,
		parameters: OperationParameters,
		project?: Project,
	): Promise<OperationResult> {
		if (!parameters.command) {
			this.logger.warning('Custom command requires a "command" parameter')
			return {
				success: false,
				message: 'Custom command requires a "command" parameter',
			}
		}

		const service = ToolchainServiceFactory.getService(
			project?.configuration.toolchain,
		)
		this.injectLogger(service)
		const customWorkingDir = parameters.workingDirectory || workingDir

		this.logger.verbose(`Executing custom command: ${parameters.command}`)
		if (customWorkingDir !== workingDir) {
			this.logger.verbose(`Working directory: ${customWorkingDir}`)
		}

		const result = await service.executeCustomCommand(
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
