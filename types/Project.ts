import type { ProjectConfiguration } from './ProjectConfiguration.ts'
import type { CustomCommand } from './CustomCommand.ts'

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
