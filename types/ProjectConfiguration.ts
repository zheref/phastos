import type { Platform } from './Platform.ts'
import type { SavePreference } from './SavePreference.ts'

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
