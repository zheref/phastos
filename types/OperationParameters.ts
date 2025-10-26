import type { Platform } from './Platform.ts'

/**
 * Parameters for operation execution
 */
export interface OperationParameters {
	// For 'run' operation
	platform?: Platform
	device?: string // Specific device/simulator name
	mode?: 'debug' | 'release'

	// For 'test' operation
	testFile?: string // Specific test file to run
	coverage?: boolean // Enable coverage report

	// For 'custom' operation
	command?: string // Shell command to execute
	workingDirectory?: string // Custom working directory

	// For 'install' operation
	packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun'

	// General parameters
	verbose?: boolean
	skipConfirmation?: boolean
}
