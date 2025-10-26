/**
 * GitService
 * Handles all Git-related operations for projects
 * Provides a clean interface for Git commands used in workflows
 */

import type { SavePreference } from '../models/Project.ts'

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
	 * @returns Operation result
	 */
	async cleanSlate(
		workingDirectory: string,
	): Promise<GitOperationResult> {
		try {
			// Reset tracked files
			const resetCommand = new Deno.Command('git', {
				args: ['reset', '--hard', 'HEAD'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const resetResult = await resetCommand.output()

			// Clean untracked files
			const cleanCommand = new Deno.Command('git', {
				args: ['clean', '-fd'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const cleanResult = await cleanCommand.output()

			if (resetResult.success && cleanResult.success) {
				return {
					success: true,
					output: 'Successfully discarded all changes',
				}
			} else {
				const error = new TextDecoder().decode(
					resetResult.stderr || cleanResult.stderr,
				)
				return { success: false, error }
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Saves uncommitted changes using specified preference
	 * @param workingDirectory - Path to Git repository
	 * @param preference - Save method ('stash' or 'branch')
	 * @param branchName - Optional branch name (used if preference is 'branch')
	 * @returns Operation result
	 */
	async saveChanges(
		workingDirectory: string,
		preference: SavePreference,
		stashName: string = `Phastos auto-stash ${new Date().toISOString()}`,
		branchName: string | undefined = undefined,
	): Promise<GitOperationResult> {
		try {
			if (preference === 'stash') {
				return await this.stashChanges(workingDirectory, stashName)
			} else {
				const name = branchName || `wip-${Date.now()}`
				return await this.createBranch(workingDirectory, name)
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Stashes uncommitted changes
	 * @param workingDirectory - Path to Git repository
	 * @returns Operation result
	 */
	private async stashChanges(
		workingDirectory: string,
		stashName?: string,
	): Promise<GitOperationResult> {
		try {
			const command = new Deno.Command('git', {
				args: [
					'stash',
					'push',
					'-m',
					`Phastos auto-stash ${new Date().toISOString()}`,
				],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()
			const output = new TextDecoder().decode(result.stdout)

			if (result.success) {
				return {
					success: true,
					output: 'Changes stashed successfully',
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

	/**
	 * Creates a new branch with current changes
	 * @param workingDirectory - Path to Git repository
	 * @param branchName - Name for the new branch
	 * @returns Operation result
	 */
	private async createBranch(
		workingDirectory: string,
		branchName: string,
	): Promise<GitOperationResult> {
		try {
			const command = new Deno.Command('git', {
				args: ['checkout', '-b', branchName],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: `Branch '${branchName}' created successfully`,
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

	/**
	 * Updates the repository by pulling latest changes
	 * @param workingDirectory - Path to Git repository
	 * @param branch - Branch to pull (defaults to current branch)
	 * @returns Operation result
	 */
	async update(
		workingDirectory: string,
		branch?: string,
	): Promise<GitOperationResult> {
		try {
			// If branch specified, checkout first
			if (branch) {
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
					return { success: false, error }
				}
			}

			// Pull latest changes
			const pullCommand = new Deno.Command('git', {
				args: ['pull', '--rebase'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const pullResult = await pullCommand.output()
			const output = new TextDecoder().decode(pullResult.stdout)

			if (pullResult.success) {
				return {
					success: true,
					output: 'Repository updated successfully',
				}
			} else {
				const error = new TextDecoder().decode(pullResult.stderr)
				return { success: false, error }
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
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
			const output = new TextDecoder().decode(result.stdout)

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
