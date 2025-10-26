import type { Project } from './Project.ts'

/**
 * Root configuration object for node_projects.json
 */
export interface NodeProjectsConfig {
	version?: string // Config file version for future compatibility
	projects: Project[]
}
