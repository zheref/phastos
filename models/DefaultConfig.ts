import type { ProjectConfiguration } from '../types/ProjectConfiguration.ts'

/**
 * Default project configuration
 */
export const DEFAULT_PROJECT_CONFIG: ProjectConfiguration = {
	defaultBranch: 'main',
	savePreference: 'stash',
	toolchain: 'react-native', // Default to React Native for backward compatibility
	packageManager: 'npm',
	defaultPlatform: 'ios',
}
