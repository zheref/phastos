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
	 * Checks if a branch exists in the repository
	 * @param wd - Path to the working directory
	 * @param branchName - Name of the branch to check
	 * @returns True if the branch exists
	 */
	async doesBranchExist(wd: string, branchName: string): Promise<boolean> {
		try {
			const command = new Deno.Command('git', {
				args: ['rev-parse', '--verify', branchName],
				cwd: wd,
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
	 * Checks if a directory is a Git repository
	 * @param workingDirectory - Path to check
	 * @returns True if directory is a Git repo
	 */
	async isGitRepository(
		workingDirectory: string,
		logger?: Logger,
	): Promise<boolean> {
		try {
			logger?.verbose(
				`Checking if directory (${workingDirectory}) is a Git repository...`,
			)
			const command = new Deno.Command('git', {
				args: ['rev-parse', '--is-inside-work-tree'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const output = await command.output()
			logger?.log(new TextDecoder().decode(output.stdout).trim())
			return output.success
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
	 * Gets the main branch name from the repository
	 * @param wd - Path to the working directory
	 * @param configuredDefaultBranch - Optional configured default branch name
	 * @returns The main branch name or undefined if no branch exists matching the possible branch names
	 */
	async getMainBranch(
		wd: string,
		configuredDefaultBranch: string | undefined = undefined,
	): Promise<string | undefined> {
		let possibleBranchNames = ['develop', 'main', 'master']

		if (configuredDefaultBranch) {
			possibleBranchNames = [
				configuredDefaultBranch,
				...possibleBranchNames,
			]
		}

		// Check if the branch exists in the repository
		for (const branchName of possibleBranchNames) {
			if (await this.doesBranchExist(wd, branchName)) {
				return branchName
			}
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
	 * Switches to a branch
	 * @param wd - Path to the working directory
	 * @param branchName - Name of the branch to switch to
	 * @param logger - Optional logger for operation tracking
	 * @returns Operation result
	 */
	async switchToBranch(
		wd: string,
		branchName: string,
		logger?: Logger,
	): Promise<GitOperationResult> {
		try {
			logger?.verbose(`Switching to branch: ${branchName}`)
			const command = new Deno.Command('git', {
				args: ['checkout', branchName],
				cwd: wd,
				stdout: 'piped',
				stderr: 'piped',
			})
			const result = await command.output()
			if (result.success) {
				logger?.log(`Switched to branch: ${branchName}`)
				return {
					success: true,
					output: `Switched to branch: ${branchName}`,
				}
			} else {
				const error = new TextDecoder().decode(result.stderr)
				logger?.error('Failed to switch to branch', error)
				return { success: false, error }
			}
		} catch (error) {
			const errorMsg = error instanceof Error
				? error.message
				: 'Unknown error'
			logger?.error('Switch to branch operation failed', errorMsg)
			return { success: false, error: errorMsg }
		}
	}

	/**
	 * Creates a new branch with current changes
	 * @param workingDirectory - Path to Git repository
	 * @param branchName - Name for the new branch
	 * @param logger - Optional logger for operation tracking
	 * @returns Operation result
	 */
	async createBranch(
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
	 * Gets the current changeset (uncommitted changes) details
	 * @param workingDirectory - Path to Git repository
	 * @returns Array of changed files with their status
	 */
	async getChangeset(
		workingDirectory: string,
	): Promise<Array<{ status: string; file: string }>> {
		try {
			const command = new Deno.Command('git', {
				args: ['status', '--porcelain'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()
			if (result.success) {
				const output = new TextDecoder().decode(result.stdout).trim()
				if (!output) return []

				return output.split('\n').map((line) => {
					const status = line.substring(0, 2).trim()
					const file = line.substring(3)
					return { status, file }
				})
			}
			return []
		} catch {
			return []
		}
	}

	/**
	 * Gets the last time the current branch was updated from the main branch
	 * @param workingDirectory - Path to Git repository
	 * @param mainBranch - Name of the main branch
	 * @returns Last merge date or null if not found
	 */
	async getLastSyncFromMain(
		workingDirectory: string,
		mainBranch: string,
	): Promise<Date | null> {
		try {
			// Get the last commit that exists in both current branch and main
			const command = new Deno.Command('git', {
				args: [
					'log',
					'--format=%ct',
					'-1',
					`${mainBranch}..HEAD`,
				],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()
			if (result.success) {
				const output = new TextDecoder().decode(result.stdout).trim()

				// If output is empty, current branch is up to date with main
				if (!output) {
					// Get the last commit date from main
					const mainCommand = new Deno.Command('git', {
						args: ['log', '--format=%ct', '-1', mainBranch],
						cwd: workingDirectory,
						stdout: 'piped',
						stderr: 'piped',
					})
					const mainResult = await mainCommand.output()
					if (mainResult.success) {
						const timestamp = new TextDecoder().decode(
							mainResult.stdout,
						).trim()
						if (timestamp) {
							return new Date(parseInt(timestamp) * 1000)
						}
					}
					return null
				}

				// Get merge base - the common ancestor
				const mergeBaseCommand = new Deno.Command('git', {
					args: ['merge-base', mainBranch, 'HEAD'],
					cwd: workingDirectory,
					stdout: 'piped',
					stderr: 'piped',
				})

				const mergeBaseResult = await mergeBaseCommand.output()
				if (mergeBaseResult.success) {
					const mergeBase = new TextDecoder().decode(
						mergeBaseResult.stdout,
					).trim()

					// Get the date of the merge base
					const dateCommand = new Deno.Command('git', {
						args: ['log', '--format=%ct', '-1', mergeBase],
						cwd: workingDirectory,
						stdout: 'piped',
						stderr: 'piped',
					})

					const dateResult = await dateCommand.output()
					if (dateResult.success) {
						const timestamp = new TextDecoder().decode(
							dateResult.stdout,
						).trim()
						if (timestamp) {
							return new Date(parseInt(timestamp) * 1000)
						}
					}
				}
			}
			return null
		} catch {
			return null
		}
	}

	/**
	 * Gets list of remote branches that haven't been synced locally
	 * Sorted by most recent commit date first
	 * @param workingDirectory - Path to Git repository
	 * @param includeDate - Whether to include date information in return value
	 * @returns Array of remote branch names sorted by recency, or array of objects with branch and date if includeDate is true
	 */
	async getUnsyncedRemoteBranches(
		workingDirectory: string,
		includeDate = false,
	): Promise<string[] | Array<{ branch: string; date: Date | null }>> {
		try {
			// First fetch remote refs
			const fetchCommand = new Deno.Command('git', {
				args: ['fetch', '--prune'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})
			await fetchCommand.output()

			// Get all remote branches
			const remoteBranchesCommand = new Deno.Command('git', {
				args: ['branch', '-r', '--format=%(refname:short)'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const remoteBranchesResult = await remoteBranchesCommand.output()
			if (!remoteBranchesResult.success) return []

			const remoteBranches = new TextDecoder().decode(
				remoteBranchesResult.stdout,
			)
				.trim()
				.split('\n')
				.filter((branch) => branch && !branch.includes('HEAD'))

			// Get all local branches
			const localBranchesCommand = new Deno.Command('git', {
				args: ['branch', '--format=%(refname:short)'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const localBranchesResult = await localBranchesCommand.output()
			if (!localBranchesResult.success) return remoteBranches

			const localBranches = new TextDecoder().decode(
				localBranchesResult.stdout,
			)
				.trim()
				.split('\n')
				.filter((branch) => branch)

			// Find remote branches that don't have local equivalents
			const unsyncedBranches = remoteBranches.filter((remoteBranch) => {
				// Remove origin/ prefix
				const branchName = remoteBranch.replace(/^origin\//, '')
				return !localBranches.includes(branchName)
			})

			// Get commit dates for each unsynced branch and sort by recency
			const branchesWithDates = await Promise.all(
				unsyncedBranches.map(async (branch) => {
					try {
						const dateCommand = new Deno.Command('git', {
							args: ['log', '-1', '--format=%ct', branch],
							cwd: workingDirectory,
							stdout: 'piped',
							stderr: 'piped',
						})
						const dateResult = await dateCommand.output()
						if (dateResult.success) {
							const timestamp = new TextDecoder().decode(
								dateResult.stdout,
							).trim()
							const date = timestamp
								? parseInt(timestamp) * 1000
								: 0
							return { branch, date }
						}
						return { branch, date: 0 }
					} catch {
						return { branch, date: 0 }
					}
				}),
			)

			// Sort by date (most recent first)
			const sorted = branchesWithDates.sort((a, b) => b.date - a.date)

			// Return with or without dates based on includeDate parameter
			if (includeDate) {
				return sorted.map((item) => ({
					branch: item.branch,
					date: item.date > 0 ? new Date(item.date) : null,
				}))
			}

			return sorted.map((item) => item.branch)
		} catch {
			return []
		}
	}

	/**
	 * Gets the number of commits ahead/behind from the main branch
	 * @param workingDirectory - Path to Git repository
	 * @param mainBranch - Name of the main branch
	 * @returns Object with ahead and behind counts
	 */
	async getBranchDivergence(
		workingDirectory: string,
		mainBranch: string,
	): Promise<{ ahead: number; behind: number }> {
		try {
			const command = new Deno.Command('git', {
				args: [
					'rev-list',
					'--left-right',
					'--count',
					`${mainBranch}...HEAD`,
				],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()
			if (result.success) {
				const output = new TextDecoder().decode(result.stdout).trim()
				const [behind, ahead] = output.split('\t').map((n) =>
					parseInt(n) || 0
				)
				return { ahead, behind }
			}
			return { ahead: 0, behind: 0 }
		} catch {
			return { ahead: 0, behind: 0 }
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
