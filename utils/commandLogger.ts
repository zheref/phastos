/**
 * Command Logger
 * Utility to log commands being executed for debugging purposes
 */

import type { Logger } from '../services/Logger.ts'

/**
 * Logs a command being executed in a readable format
 * @param logger - Logger instance to use
 * @param command - Command to execute
 * @param args - Command arguments
 * @param cwd - Working directory
 */
export function logCommand(
	logger: Logger,
	command: string,
	args: string[],
	cwd: string,
): void {
	const fullCommand = `${command} ${args.join(' ')}`
	logger.verbose(`Executing: ${fullCommand}`)
	logger.verbose(`Working directory: ${cwd}`)
}

/**
 * Logs a command with package manager detection
 * @param logger - Logger instance to use
 * @param packageManager - Detected package manager
 * @param scriptName - Script to run
 * @param cwd - Working directory
 */
export function logPackageScript(
	logger: Logger,
	packageManager: string,
	scriptName: string,
	cwd: string,
): void {
	const args = getPackageScriptArgs(packageManager, scriptName)
	logCommand(logger, packageManager, args, cwd)
}

/**
 * Gets package manager script arguments
 */
function getPackageScriptArgs(
	packageManager: string,
	scriptName: string,
): string[] {
	switch (packageManager) {
		case 'npm':
		case 'bun':
			return ['run', scriptName]
		case 'yarn':
		case 'pnpm':
			return [scriptName]
		case 'deno':
			return ['task', scriptName]
		default:
			return [scriptName]
	}
}
