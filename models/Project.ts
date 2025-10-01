/**
 * Project Models
 * Defines the data structures for nprojects.json configuration
 * Mirrors the structure from Alars' xprojects.json
 */

/**
 * Represents the save preference for uncommitted changes
 * - 'stash': Use git stash to save changes
 * - 'branch': Create a new branch for changes
 */
export type SavePreference = 'stash' | 'branch'

/**
 * Platform target for React Native projects
 */
export type Platform = 'ios' | 'android' | 'both'

/**
 * Type of operation for custom commands
 */
export type OperationType =
	| 'clean_slate' // Discard uncommitted changes
	| 'save' // Stash or branch work
	| 'update' // Pull latest repository changes
	| 'install' // Install dependencies (npm/yarn install)
	| 'build' // Build the project
	| 'test' // Run tests
	| 'run' // Run the app on simulator/emulator
	| 'reset' // Reset React Native cache and dependencies
	| 'pod_install' // Run pod install (iOS only)
	| 'custom' // Custom shell command

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

/**
 * Represents a single operation in a custom command
 */
export interface Operation {
	type: OperationType
	description?: string
	parameters?: OperationParameters
}

/**
 * Represents a custom command that can be defined in nprojects.json
 */
export interface CustomCommand {
	alias: string // Command identifier
	description: string // Human-readable description
	operations: Operation[] // Sequence of operations to execute
}

/**
 * Project configuration settings
 */
export interface ProjectConfiguration {
	defaultBranch: string // e.g., 'main' or 'develop'
	savePreference: SavePreference // How to save uncommitted changes
	packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun' // Default package manager
	defaultPlatform?: Platform // Default platform for run commands
	defaultDevice?: string // Default device/simulator
	iosScheme?: string // iOS build scheme (for workspace projects)
	androidFlavor?: string // Android build flavor/variant
}

/**
 * Represents a single Node.js/React Native project
 */
export interface Project {
	name: string // Unique project identifier
	workingDirectory: string // Absolute or relative path to project
	repositoryURL?: string // Git repository URL
	configuration: ProjectConfiguration
	customCommands?: CustomCommand[] // User-defined command sequences
}

/**
 * Root configuration object for nprojects.json
 */
export interface NProjectsConfig {
	version?: string // Config file version for future compatibility
	projects: Project[]
}

/**
 * Type guard to check if a value is a valid Platform
 */
export function isPlatform(value: unknown): value is Platform {
	return (
		typeof value === 'string' &&
		['ios', 'android', 'both'].includes(value)
	)
}

/**
 * Type guard to check if a value is a valid OperationType
 */
export function isOperationType(value: unknown): value is OperationType {
	return (
		typeof value === 'string' &&
		[
			'clean_slate',
			'save',
			'update',
			'install',
			'build',
			'test',
			'run',
			'reset',
			'pod_install',
			'custom',
		].includes(value)
	)
}

/**
 * Default project configuration
 */
export const DEFAULT_PROJECT_CONFIG: ProjectConfiguration = {
	defaultBranch: 'main',
	savePreference: 'stash',
	packageManager: 'npm',
	defaultPlatform: 'ios',
}
