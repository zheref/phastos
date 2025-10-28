import type { Platform } from './Platform.ts'
import type { SavePreference } from './SavePreference.ts'
import type { Toolchain } from './Toolchain.ts'

/**
 * Project configuration settings
 */
export interface ProjectConfiguration {
	defaultBranch: string // e.g., 'main' or 'develop'
	savePreference: SavePreference // How to save uncommitted changes
	toolchain?: Toolchain // Project toolchain (react-native, vite, nextjs) - defaults to react-native
	packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun' // Default package manager
	defaultPlatform?: Platform // Default platform for run commands (React Native only)
	defaultDevice?: string // Default device/simulator (React Native only)
	iosScheme?: string // iOS build scheme (for workspace projects, React Native only)
	androidFlavor?: string // Android build flavor/variant (React Native only)
}
