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
	private printMsg?: (msg: string) => void

	constructor(printMsg?: (msg: string) => void) {
		this.printMsg = printMsg
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

		try {
			switch (type) {
				case 'clean_slate':
					return await this.cleanSlate(workingDir)

				case 'save':
					return await this.save(
						workingDir,
						project.configuration.savePreference,
					)

				case 'update':
					return await this.update(
						workingDir,
						project.configuration.defaultBranch,
					)

				case 'install':
					return await this.install(workingDir, parameters)

				case 'build':
					return await this.build(workingDir, parameters)

				case 'test':
					return await this.test(workingDir, parameters)

				case 'run':
					return await this.run(
						workingDir,
						project.configuration,
						parameters,
					)

				case 'reset':
					return await this.reset(workingDir)

				case 'pod_install':
					return await this.podInstall(workingDir)

				case 'custom':
					return await this.custom(workingDir, parameters)

				default:
					return {
						success: false,
						message: `Unknown operation type: ${type}`,
					}
			}
		} catch (error) {
			return {
				success: false,
				message: 'Operation failed',
				error: error instanceof Error ? error.message : 'Unknown error',
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
		// Check if git repository
		const isGitRepo = await gitService.isGitRepository(workingDir)
		if (!isGitRepo) {
			return {
				success: false,
				message: 'Not a git repository',
			}
		}

		const result = await gitService.cleanSlate(workingDir)

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
		// Check if git repository
		const isGitRepo = await gitService.isGitRepository(workingDir)
		if (!isGitRepo) {
			return {
				success: false,
				message: 'Not a git repository',
			}
		}

		// Check for uncommitted changes
		const hasChanges = await gitService.hasUncommittedChanges(workingDir)
		if (!hasChanges) {
			return {
				success: true,
				message: 'No changes to save',
			}
		}

		const result = await gitService.saveChanges(
			workingDir,
			savePreference,
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
		// Check if git repository
		const isGitRepo = await gitService.isGitRepository(workingDir)
		if (!isGitRepo) {
			return {
				success: false,
				message: 'Not a git repository',
			}
		}

		const result = await gitService.update(workingDir, defaultBranch)

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
		const result = await reactNativeService.podInstall(workingDir)

		return {
			success: result.success,
			message: result.output || 'Pods installed',
			error: result.error,
		}
	}

	private async freshChangeset(workingDir: string): Promise<OperationResult> {
		// Prompt user for a changeset name
		const changesetId: string = 'new-changeset'

		const currentBranch = await gitService.getCurrentBranch(workingDir)

		// Check if we have uncommited changes
		const isClean = await gitService.hasUncommittedChanges(workingDir)
		if (!isClean) {
			const result = await gitService.saveChanges(
				workingDir,
				'stash',
				`wip-${currentBranch}-${Date.now()}`,
			)
			if (!result.success) {
				return {
					success: false,
					message: 'Failed to stash changes',
					error: result.error,
				}
			}
		}

		// Change to main branch and update to latest changes
	}

	/**
	 * Custom operation - execute a custom shell command
	 */
	private async custom(
		workingDir: string,
		parameters: OperationParameters,
	): Promise<OperationResult> {
		if (!parameters.command) {
			return {
				success: false,
				message: 'Custom command requires a "command" parameter',
			}
		}

		const customWorkingDir = parameters.workingDirectory || workingDir

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
