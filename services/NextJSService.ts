/**
 * NextJSService
 * Handles all Next.js React web project operations
 * Supports building, running dev server, testing, and maintenance operations
 */

import type { Logger } from './Logger.ts'
import type {
	PackageManager,
	ToolchainOperationResult,
	ToolchainService,
} from './ToolchainService.ts'

/**
 * Service class for Next.js operations
 */
export class NextJSService implements ToolchainService {
	private logger?: Logger

	/**
	 * Sets the logger instance for command logging
	 */
	setLogger(logger: Logger): void {
		this.logger = logger
	}
	/**
	 * Detects the package manager used in a project
	 * @param workingDirectory - Path to project
	 * @returns Detected package manager
	 */
	async detectPackageManager(
		workingDirectory: string,
	): Promise<PackageManager> {
		try {
			// Check for lock files and config files to determine package manager
			const checks = [
				{ file: 'deno.json', manager: 'deno' as PackageManager },
				{ file: 'deno.jsonc', manager: 'deno' as PackageManager },
				{ file: 'bun.lockb', manager: 'bun' as PackageManager },
				{ file: 'pnpm-lock.yaml', manager: 'pnpm' as PackageManager },
				{ file: 'yarn.lock', manager: 'yarn' as PackageManager },
				{ file: 'package-lock.json', manager: 'npm' as PackageManager },
			]

			for (const { file, manager } of checks) {
				try {
					const path = `${workingDirectory}/${file}`
					await Deno.stat(path)
					return manager
				} catch {
					// File doesn't exist, continue
				}
			}

			// Default to npm if no lock file found
			return 'npm'
		} catch {
			return 'npm'
		}
	}

	/**
	 * Installs project dependencies
	 * @param workingDirectory - Path to project
	 * @param packageManager - Package manager to use
	 * @returns Operation result
	 */
	async install(
		workingDirectory: string,
		packageManager?: PackageManager,
	): Promise<ToolchainOperationResult> {
		try {
			const pm = packageManager ||
				(await this.detectPackageManager(workingDirectory))

			const command = new Deno.Command(pm, {
				args: ['install'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: `Dependencies installed using ${pm}`,
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
	 * Builds the Next.js project
	 * @param workingDirectory - Path to project
	 * @param mode - Build mode (development or production)
	 * @returns Operation result
	 */
	async build(
		workingDirectory: string,
		mode: 'development' | 'production' = 'production',
		_platform?: import('../types/Platform.ts').Platform,
	): Promise<ToolchainOperationResult> {
		try {
			const pm = await this.detectPackageManager(workingDirectory)

			const args = ['run', 'build']
			if (mode === 'development') {
				args.push('--debug')
			}

			const command = new Deno.Command(pm, {
				args,
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: `Next.js build completed in ${mode} mode`,
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
	 * Runs the Next.js dev server
	 * @param workingDirectory - Path to project
	 * @param _platform - Not used for Next.js (web only)
	 * @param _device - Not used for Next.js (web only)
	 * @param _mode - Not used for Next.js (always dev mode)
	 * @returns Operation result
	 */
	async run(
		workingDirectory: string,
		_platform?: import('../types/Platform.ts').Platform,
		_device?: string,
		_mode?: 'development' | 'production',
	): Promise<ToolchainOperationResult> {
		try {
			const pm = await this.detectPackageManager(workingDirectory)
			const command = new Deno.Command(pm, {
				args: ['run', 'dev'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: 'Next.js dev server started',
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
	 * Runs tests for the project
	 * @param workingDirectory - Path to project
	 * @param testFile - Optional specific test file
	 * @param coverage - Whether to generate coverage report
	 * @returns Operation result
	 */
	async test(
		workingDirectory: string,
		testFile?: string,
		coverage: boolean = false,
	): Promise<ToolchainOperationResult> {
		try {
			const pm = await this.detectPackageManager(workingDirectory)
			const args = ['test', '--run']

			if (testFile) {
				args.push(testFile)
			}

			if (coverage) {
				args.push('--coverage')
			}

			const command = new Deno.Command(pm, {
				args,
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: 'Tests completed successfully',
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
	 * Resets Next.js cache
	 * @param workingDirectory - Path to project
	 * @returns Operation result
	 */
	async reset(
		workingDirectory: string,
	): Promise<ToolchainOperationResult> {
		try {
			// Remove Next.js cache directory
			const cacheDir = `${workingDirectory}/.next`
			try {
				await Deno.remove(cacheDir, { recursive: true })
			} catch {
				// Directory might not exist, continue
			}

			return {
				success: true,
				output: 'Next.js cache cleared',
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Performs a deep clean of the project
	 * Removes node_modules, build artifacts, and cache
	 * @param workingDirectory - Path to project
	 * @returns Operation result
	 */
	async clean(
		workingDirectory: string,
	): Promise<ToolchainOperationResult> {
		try {
			// Directories to remove
			const dirsToRemove = [
				'node_modules',
				'.next',
				'out',
				'.cache',
			]

			for (const dir of dirsToRemove) {
				const fullPath = `${workingDirectory}/${dir}`
				try {
					await Deno.remove(fullPath, { recursive: true })
				} catch {
					// Directory might not exist, continue
				}
			}

			return {
				success: true,
				output: 'Project cleaned successfully',
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Runs a package manager script (npm run, yarn, deno task, etc.)
	 * @param workingDirectory - Path to project
	 * @param scriptName - Name of the script to run
	 * @param packageManager - Optional package manager override
	 * @returns Operation result
	 */
	async runScript(
		workingDirectory: string,
		scriptName: string,
		packageManager?: PackageManager,
	): Promise<ToolchainOperationResult> {
		try {
			const pm = packageManager ||
				(await this.detectPackageManager(workingDirectory))

			// Determine the command and args based on package manager
			let command: string
			let args: string[]

			switch (pm) {
				case 'npm':
					command = 'npm'
					args = ['run', scriptName]
					break
				case 'yarn':
					command = 'yarn'
					args = [scriptName]
					break
				case 'pnpm':
					command = 'pnpm'
					args = [scriptName]
					break
				case 'bun':
					command = 'bun'
					args = ['run', scriptName]
					break
				case 'deno':
					command = 'deno'
					args = ['task', scriptName]
					break
				default:
					return {
						success: false,
						error: `Unsupported package manager: ${pm}`,
					}
			}

			const cmd = new Deno.Command(command, {
				args,
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await cmd.output()

			if (result.success) {
				const _output = new TextDecoder().decode(result.stdout)
				return {
					success: true,
					output:
						`Script '${scriptName}' completed successfully using ${pm}`,
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
	 * Executes a custom shell command
	 * @param command - Shell command to execute
	 * @param workingDirectory - Working directory for command
	 * @returns Operation result
	 */
	async executeCustomCommand(
		command: string,
		workingDirectory: string,
	): Promise<ToolchainOperationResult> {
		try {
			const cmd = new Deno.Command('sh', {
				args: ['-c', command],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await cmd.output()
			const output = new TextDecoder().decode(result.stdout)

			if (result.success) {
				return { success: true, output }
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
 * Singleton instance of NextJSService
 */
export const nextJSService = new NextJSService()
