/**
 * ReactNativeService
 * Handles all React Native-specific operations
 * Supports iOS, Android, building, running, testing, and maintenance operations
 */

import type { Platform } from '../models/Project.ts'

/**
 * Result object for React Native operations
 */
export interface RNOperationResult {
	success: boolean
	output?: string
	error?: string
}

/**
 * Package manager type
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'deno'

/**
 * Service class for React Native operations
 */
export class ReactNativeService {
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
	): Promise<RNOperationResult> {
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
	 * Runs pod install for iOS dependencies
	 * @param workingDirectory - Path to project
	 * @returns Operation result
	 */
	async podInstall(
		workingDirectory: string,
	): Promise<RNOperationResult> {
		try {
			const iosPath = `${workingDirectory}/ios`

			// Check if iOS directory exists
			try {
				await Deno.stat(iosPath)
			} catch {
				return {
					success: false,
					error: 'iOS directory not found',
				}
			}

			const command = new Deno.Command('pod', {
				args: ['install'],
				cwd: iosPath,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: 'CocoaPods dependencies installed',
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
	 * Builds the React Native project
	 * @param workingDirectory - Path to project
	 * @param platform - Target platform
	 * @param mode - Build mode (debug or release)
	 * @returns Operation result
	 */
	async build(
		workingDirectory: string,
		platform: Platform,
		mode: 'debug' | 'release' = 'debug',
	): Promise<RNOperationResult> {
		try {
			const platforms = platform === 'both'
				? ['ios', 'android']
				: [platform]

			for (const p of platforms) {
				const result = await this.buildPlatform(
					workingDirectory,
					p as 'ios' | 'android',
					mode,
				)
				if (!result.success) {
					return result
				}
			}

			return {
				success: true,
				output: `Build completed for ${platform}`,
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Builds for a specific platform
	 * @param workingDirectory - Path to project
	 * @param platform - Target platform (ios or android)
	 * @param mode - Build mode
	 * @returns Operation result
	 */
	private async buildPlatform(
		workingDirectory: string,
		platform: 'ios' | 'android',
		mode: 'debug' | 'release',
	): Promise<RNOperationResult> {
		try {
			const args = ['run-' + platform]
			if (mode === 'release') {
				args.push('--configuration', 'Release')
			}

			const pm = await this.detectPackageManager(workingDirectory)
			const command = new Deno.Command(pm, {
				args: pm === 'npm' ? ['run', ...args] : args,
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: `${platform} build completed`,
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
	 * Runs the React Native app on a simulator/emulator
	 * @param workingDirectory - Path to project
	 * @param platform - Target platform
	 * @param device - Specific device/simulator name
	 * @param mode - Run mode
	 * @returns Operation result
	 */
	async run(
		workingDirectory: string,
		platform: Platform,
		device?: string,
		mode: 'debug' | 'release' = 'debug',
	): Promise<RNOperationResult> {
		try {
			const p = platform === 'both' ? 'ios' : platform
			const args = [`run-${p}`]

			if (device) {
				args.push('--simulator', device)
			}

			if (mode === 'release') {
				args.push('--configuration', 'Release')
			}

			const pm = await this.detectPackageManager(workingDirectory)
			const command = new Deno.Command(pm, {
				args: pm === 'npm' ? ['run', ...args] : args,
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: `App running on ${p}`,
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
	): Promise<RNOperationResult> {
		try {
			const args = ['test']

			if (testFile) {
				args.push(testFile)
			}

			if (coverage) {
				args.push('--coverage')
			}

			const pm = await this.detectPackageManager(workingDirectory)
			const command = new Deno.Command(pm, {
				args: pm === 'npm' ? ['run', ...args] : args,
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
	 * Resets React Native cache and dependencies
	 * This is equivalent to a deep clean operation
	 * @param workingDirectory - Path to project
	 * @returns Operation result
	 */
	async reset(
		workingDirectory: string,
	): Promise<RNOperationResult> {
		try {
			const pm = await this.detectPackageManager(workingDirectory)

			// Start Metro bundler with reset cache option
			const command = new Deno.Command(pm, {
				args: pm === 'npm'
					? ['run', 'start', '--', '--reset-cache']
					: ['start', '--reset-cache'],
				cwd: workingDirectory,
				stdout: 'piped',
				stderr: 'piped',
			})

			const result = await command.output()

			if (result.success) {
				return {
					success: true,
					output: 'React Native cache reset',
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
	 * Performs a deep clean of the project
	 * Removes node_modules, build artifacts, and cache
	 * @param workingDirectory - Path to project
	 * @returns Operation result
	 */
	async clean(
		workingDirectory: string,
	): Promise<RNOperationResult> {
		try {
			// Directories to remove
			const dirsToRemove = [
				'node_modules',
				'ios/build',
				'ios/Pods',
				'android/build',
				'android/app/build',
				'.gradle',
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
	 * Executes a custom shell command
	 * @param command - Shell command to execute
	 * @param workingDirectory - Working directory for command
	 * @returns Operation result
	 */
	async executeCustomCommand(
		command: string,
		workingDirectory: string,
	): Promise<RNOperationResult> {
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
	): Promise<RNOperationResult> {
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
}

/**
 * Singleton instance of ReactNativeService
 */
export const reactNativeService = new ReactNativeService()
