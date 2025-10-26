/**
 * GitService
 * Handles all Git-related operations for projects
 * Provides a clean interface for Git commands used in workflows
 */

import type { SavePreference } from '../models/Project.ts'
import type { Logger } from './Logger.ts'

/**
 * Result object for Git operations
 */
export interface GitOperationResult {
	success: boolean
	output?: string
	error?: string
}

/**
 * Service class for Git operations
 */
export class GitService {
	/**
	 * Checks if a directory is a Git repository
	 * @param workingDirectory - Path to check
	 * @returns True if directory is a Git repo
	 */
	async isGitRepository(workingDirectory: string): Promise<boolean> {
		try {
			const command = new Deno.Command('git', {
				args: ['rev-parse', '--is-inside-work-tree'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const { success } = await command.output()
			return success
		} catch {
			return false
		}
	}

	/**
	 * Checks if there are uncommitted changes in the repository
	 * @param workingDirectory - Path to Git repository
	 * @returns True if there are uncommitted changes
	 */
	async hasUncommittedChanges(
		workingDirectory: string,
	): Promise<boolean> {
		try {
			const command = new Deno.Command('git', {
				args: ['status', '--porcelain'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const { stdout } = await command.output()
			const output = new TextDecoder().decode(stdout).trim()
			return output.length > 0
		} catch {
			return false
		}
	}

	/**
	 * Discards all uncommitted changes (clean_slate operation)
	 * @param workingDirectory - Path to Git repository
	 * @param logger - Optional logger for operation tracking
	 * @returns Operation result
	 */
	async cleanSlate(
		workingDirectory: string,
		logger?: Logger,
	): Promise<GitOperationResult> {
		try {
			logger?.verbose('Resetting tracked files to HEAD...')

			// Reset tracked files
			const resetCommand = new Deno.Command('git', {
				args: ['reset', '--hard', 'HEAD'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const resetResult = await resetCommand.output()

			logger?.verbose('Cleaning untracked files and directories...')

			// Clean untracked files
			const cleanCommand = new Deno.Command('git', {
				args: ['clean', '-fd'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const cleanResult = await cleanCommand.output()

			if (resetResult.success && cleanResult.success) {
				logger?.log('Successfully discarded all changes')
				return {
					success: true,
					output: 'Successfully discarded all changes',
				}
			} else {
				const error = new TextDecoder().decode(
					resetResult.stderr || cleanResult.stderr,
				)
				logger?.error('Failed to clean slate', error)
				return { success: false, error }
			}
		} catch (error) {
			const errorMsg = error instanceof Error
				? error.message
				: 'Unknown error'
			logger?.error('Clean slate operation failed', errorMsg)
			return {
				success: false,
				error: errorMsg,
			}
		}
	}

	/**
	 * Saves uncommitted changes using specified preference
	 * @param workingDirectory - Path to Git repository
	 * @param preference - Save method ('stash' or 'branch')
	 * @param stashName - Optional stash name
	 * @param branchName - Optional branch name (used if preference is 'branch')
	 * @param logger - Optional logger for operation tracking
	 * @returns Operation result
	 */
	async saveChanges(
		workingDirectory: string,
		preference: SavePreference,
		stashName: string = `Phastos auto-stash ${new Date().toISOString()}`,
		branchName: string | undefined = undefined,
		logger?: Logger,
	): Promise<GitOperationResult> {
		try {
			if (preference === 'stash') {
				logger?.verbose(`Stashing changes: ${stashName}`)
				return await this.stashChanges(
					workingDirectory,
					stashName,
					logger,
				)
			} else {
				const name = branchName || `wip-${Date.now()}`
				logger?.verbose(`Creating branch: ${name}`)
				return await this.createBranch(workingDirectory, name, logger)
			}
		} catch (error) {
			const errorMsg = error instanceof Error
				? error.message
				: 'Unknown error'
			logger?.error('Save changes operation failed', errorMsg)
			return {
				success: false,
				error: errorMsg,
			}
		}
	}

	/**
	 * Stashes uncommitted changes
	 * @param workingDirectory - Path to Git repository
	 * @param stashName - Optional stash name
	 * @param logger - Optional logger for operation tracking
	 * @returns Operation result
	 */
	private async stashChanges(
		workingDirectory: string,
		stashName?: string,
		logger?: Logger,
	): Promise<GitOperationResult> {
		try {
			const message = stashName ||
				`Phastos auto-stash ${new Date().toISOString()}`
			logger?.verbose(`Creating stash with message: ${message}`)

			const command = new Deno.Command('git', {
				args: [
					'stash',
					'push',
					'-m',
					message,
				],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				logger?.log('Changes stashed successfully')
				return {
					success: true,
					output: 'Changes stashed successfully',
				}
			} else {
				const error = new TextDecoder().decode(result.stderr)
				logger?.error('Failed to stash changes', error)
				return { success: false, error }
			}
		} catch (error) {
			const errorMsg = error instanceof Error
				? error.message
				: 'Unknown error'
			logger?.error('Stash operation failed', errorMsg)
			return {
				success: false,
				error: errorMsg,
			}
		}
	}

	/**
	 * Creates a new branch with current changes
	 * @param workingDirectory - Path to Git repository
	 * @param branchName - Name for the new branch
	 * @param logger - Optional logger for operation tracking
	 * @returns Operation result
	 */
	private async createBranch(
		workingDirectory: string,
		branchName: string,
		logger?: Logger,
	): Promise<GitOperationResult> {
		try {
			logger?.verbose(
				`Creating and checking out new branch: ${branchName}`,
			)

			const command = new Deno.Command('git', {
				args: ['checkout', '-b', branchName],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				logger?.log(`Branch '${branchName}' created successfully`)
				return {
					success: true,
					output: `Branch '${branchName}' created successfully`,
				}
			} else {
				const error = new TextDecoder().decode(result.stderr)
				logger?.error('Failed to create branch', error)
				return { success: false, error }
			}
		} catch (error) {
			const errorMsg = error instanceof Error
				? error.message
				: 'Unknown error'
			logger?.error('Branch creation failed', errorMsg)
			return {
				success: false,
				error: errorMsg,
			}
		}
	}

	/**
	 * Updates the repository by pulling latest changes
	 * @param workingDirectory - Path to Git repository
	 * @param branch - Branch to pull (defaults to current branch)
	 * @param logger - Optional logger for operation tracking
	 * @returns Operation result
	 */
	async update(
		workingDirectory: string,
		branch?: string,
		logger?: Logger,
	): Promise<GitOperationResult> {
		try {
			// If branch specified, checkout first
			if (branch) {
				logger?.verbose(`Checking out branch: ${branch}`)

				const checkoutCommand = new Deno.Command('git', {
					args: ['checkout', branch],
					cwd: workingDirectory,
					stdout: 'piped',
					stderr: 'piped',
				})

				const checkoutResult = await checkoutCommand.output()
				if (!checkoutResult.success) {
					const error = new TextDecoder().decode(
						checkoutResult.stderr,
					)
					logger?.error('Failed to checkout branch', error)
					return { success: false, error }
				}
				logger?.log(`Checked out branch: ${branch}`)
			}

			logger?.verbose('Pulling latest changes with rebase...')

			// Pull latest changes
			const pullCommand = new Deno.Command('git', {
				args: ['pull', '--rebase'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const pullResult = await pullCommand.output()

			if (pullResult.success) {
				logger?.log('Repository updated successfully')
				return {
					success: true,
					output: 'Repository updated successfully',
				}
			} else {
				const error = new TextDecoder().decode(pullResult.stderr)
				logger?.error('Failed to pull changes', error)
				return { success: false, error }
			}
		} catch (error) {
			const errorMsg = error instanceof Error
				? error.message
				: 'Unknown error'
			logger?.error('Update operation failed', errorMsg)
			return {
				success: false,
				error: errorMsg,
			}
		}
	}

	/**
	 * Gets the current branch name
	 * @param workingDirectory - Path to Git repository
	 * @returns Current branch name or null if error
	 */
	async getCurrentBranch(
		workingDirectory: string,
	): Promise<string | null> {
		try {
			const command = new Deno.Command('git', {
				args: ['branch', '--show-current'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()
			if (result.success) {
				return new TextDecoder().decode(result.stdout).trim()
			}
			return null
		} catch {
			return null
		}
	}

	/**
	 * Clones a repository to a specified directory
	 * @param repositoryURL - URL of the Git repository
	 * @param targetDirectory - Where to clone the repository
	 * @returns Operation result
	 */
	async clone(
		repositoryURL: string,
		targetDirectory: string,
	): Promise<GitOperationResult> {
		try {
			const command = new Deno.Command('git', {
				args: ['clone', repositoryURL, targetDirectory],
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: 'Repository cloned successfully',
				}
			} else {
				const error = new TextDecoder().decode(result.stderr)
				return { success: false, error }
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}
}

/**
 * Singleton instance of GitService
 */
export const gitService = new GitService()
