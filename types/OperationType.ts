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
	| 'fresh'
	| 'custom' // Custom shell command
