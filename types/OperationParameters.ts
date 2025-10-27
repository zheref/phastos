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

	// For 'fresh' operation
	changesetName?: string

	// For 'switch_changeset' operation
	branchName?: string // Branch name to switch to
	branchType?: 'local' | 'remote' // Whether it's a local or remote branch
	localChangesetName?: string // Custom name for local changeset when checking out remote

	// General parameters
	verbose?: boolean
	skipConfirmation?: boolean
}
