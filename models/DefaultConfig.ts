import type { ProjectConfiguration } from '../types/ProjectConfiguration.ts'

/**
 * Default project configuration
 */
export const DEFAULT_PROJECT_CONFIG: ProjectConfiguration = {
	defaultBranch: 'main',
	savePreference: 'stash',
	packageManager: 'npm',
	defaultPlatform: 'ios',
}
