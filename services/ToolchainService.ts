/**
 * ToolchainService Interface
 * Abstract interface for toolchain-specific operations
 * Each toolchain (React Native, Vite, Next.js) implements this interface
 */

import type { Platform } from '../types/Platform.ts'
import type { Logger } from './Logger.ts'

/**
 * Result object for toolchain operations
 */
export interface ToolchainOperationResult {
	success: boolean
	output?: string
	error?: string
}

/**
 * Package manager type
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'deno'

/**
 * Abstract interface for toolchain-specific operations
 */
export interface ToolchainService {
	/**
	 * Sets the logger instance for command logging
	 */
	setLogger(logger: Logger): void

	/**
	 * Detects the package manager used in a project
	 */
	detectPackageManager(workingDirectory: string): Promise<PackageManager>

	/**
	 * Installs project dependencies
	 */
	install(
		workingDirectory: string,
		packageManager?: PackageManager,
	): Promise<ToolchainOperationResult>

	/**
	 * Builds the project
	 */
	build(
		workingDirectory: string,
		mode?: 'development' | 'production',
		platform?: Platform,
	): Promise<ToolchainOperationResult>

	/**
	 * Runs the project (development mode)
	 */
	run(
		workingDirectory: string,
		platform?: Platform,
		device?: string,
		mode?: 'development' | 'production',
	): Promise<ToolchainOperationResult>

	/**
	 * Runs tests for the project
	 */
	test(
		workingDirectory: string,
		testFile?: string,
		coverage?: boolean,
	): Promise<ToolchainOperationResult>

	/**
	 * Runs a package manager script
	 */
	runScript(
		workingDirectory: string,
		scriptName: string,
		packageManager?: PackageManager,
	): Promise<ToolchainOperationResult>

	/**
	 * Executes a custom shell command
	 */
	executeCustomCommand(
		command: string,
		workingDirectory: string,
	): Promise<ToolchainOperationResult>

	/**
	 * Resets/cleans the project cache
	 */
	reset(workingDirectory: string): Promise<ToolchainOperationResult>

	/**
	 * Performs a deep clean of the project
	 */
	clean(workingDirectory: string): Promise<ToolchainOperationResult>
}
