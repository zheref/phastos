/**
 * ProjectLoader
 * Responsible for loading and validating node_projects.json configuration
 * Provides utilities for finding and managing project configurations
 */

import type {
	DEFAULT_PROJECT_CONFIG,
	NodeProjectsConfig,
	Project,
} from '../models/Project.ts'
import { join } from 'jsr:@std/path@1.0.8'

/**
 * Error class for project loading issues
 */
export class ProjectLoadError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ProjectLoadError'
	}
}

/**
 * Service class for loading project configurations
 */
export class ProjectLoader {
	private static readonly CONFIG_FILE_NAME = 'node_projects.json'

	/**
	 * Finds the node_projects.json file by searching up the directory tree
	 * @param startPath - Starting directory path (defaults to current directory)
	 * @returns Path to node_projects.json or null if not found
	 */
	async findConfigFile(startPath?: string): Promise<string | null> {
		let currentPath = startPath || Deno.cwd()

		// Search up to root directory
		while (true) {
			const configPath = join(
				currentPath,
				ProjectLoader.CONFIG_FILE_NAME,
			)

			try {
				const stat = await Deno.stat(configPath)
				if (stat.isFile) {
					return configPath
				}
			} catch {
				// File doesn't exist, continue searching
			}

			// Get parent directory
			const parentPath = join(currentPath, '..')

			// Stop if we've reached the root
			if (parentPath === currentPath) {
				break
			}

			currentPath = parentPath
		}

		return null
	}

	/**
	 * Loads and parses the node_projects.json configuration
	 * @param configPath - Path to node_projects.json (optional, will search if not provided)
	 * @returns Parsed configuration object
	 * @throws ProjectLoadError if file not found or invalid
	 */
	async load(configPath?: string): Promise<NodeProjectsConfig> {
		try {
			// Find config file if path not provided
			const path = configPath || (await this.findConfigFile())

			if (!path) {
				throw new ProjectLoadError(
					`No ${ProjectLoader.CONFIG_FILE_NAME} found. Run 'phastos init' to create one.`,
				)
			}

			// Read and parse file
			const content = await Deno.readTextFile(path)
			const config = JSON.parse(content) as NodeProjectsConfig

			// Validate configuration
			this.validate(config)

			// Normalize paths to absolute
			config.projects = config.projects.map((project) =>
				this.normalizeProjectPaths(project, path)
			)

			return config
		} catch (error) {
			if (error instanceof ProjectLoadError) {
				throw error
			}

			throw new ProjectLoadError(
				`Failed to load configuration: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
			)
		}
	}

	/**
	 * Validates the node_projects.json configuration structure
	 * @param config - Configuration object to validate
	 * @throws ProjectLoadError if configuration is invalid
	 */
	private validate(config: NodeProjectsConfig): void {
		if (!config.projects || !Array.isArray(config.projects)) {
			throw new ProjectLoadError(
				'Invalid configuration: "projects" array is required',
			)
		}

		if (config.projects.length === 0) {
			throw new ProjectLoadError(
				'Invalid configuration: At least one project is required',
			)
		}

		// Validate each project
		const projectNames = new Set<string>()

		for (const project of config.projects) {
			// Check required fields
			if (!project.name || typeof project.name !== 'string') {
				throw new ProjectLoadError(
					'Invalid project: "name" is required',
				)
			}

			if (
				!project.workingDirectory ||
				typeof project.workingDirectory !== 'string'
			) {
				throw new ProjectLoadError(
					`Invalid project "${project.name}": "workingDirectory" is required`,
				)
			}

			if (!project.configuration) {
				throw new ProjectLoadError(
					`Invalid project "${project.name}": "configuration" is required`,
				)
			}

			// Check for duplicate project names
			if (projectNames.has(project.name)) {
				throw new ProjectLoadError(
					`Duplicate project name: "${project.name}"`,
				)
			}
			projectNames.add(project.name)

			// Validate custom commands if present
			if (project.customCommands) {
				this.validateCustomCommands(
					project.customCommands,
					project.name,
				)
			}
		}
	}

	/**
	 * Validates custom commands structure
	 * @param customCommands - Array of custom commands
	 * @param projectName - Name of the project (for error messages)
	 * @throws ProjectLoadError if custom commands are invalid
	 */
	private validateCustomCommands(
		customCommands: unknown,
		projectName: string,
	): void {
		if (!Array.isArray(customCommands)) {
			throw new ProjectLoadError(
				`Invalid project "${projectName}": customCommands must be an array`,
			)
		}

		for (const cmd of customCommands) {
			if (typeof cmd !== 'object' || cmd === null) {
				throw new ProjectLoadError(
					`Invalid custom command in project "${projectName}"`,
				)
			}

			const command = cmd as Record<string, unknown>

			if (!command.alias || typeof command.alias !== 'string') {
				throw new ProjectLoadError(
					`Invalid custom command in project "${projectName}": "alias" is required`,
				)
			}

			if (
				!command.operations || !Array.isArray(command.operations)
			) {
				throw new ProjectLoadError(
					`Invalid custom command "${command.alias}" in project "${projectName}": "operations" array is required`,
				)
			}
		}
	}

	/**
	 * Normalizes project paths to be absolute
	 * @param project - Project configuration
	 * @param configPath - Path to the config file
	 * @returns Project with normalized paths
	 */
	private normalizeProjectPaths(
		project: Project,
		configPath: string,
	): Project {
		const configDir = join(configPath, '..')

		// Convert relative paths to absolute
		if (!project.workingDirectory.startsWith('/')) {
			project.workingDirectory = join(
				configDir,
				project.workingDirectory,
			)
		}

		return project
	}

	/**
	 * Finds a project by name in the configuration
	 * @param config - Configuration object
	 * @param projectName - Name of project to find
	 * @returns Project or null if not found
	 */
	findProject(
		config: NodeProjectsConfig,
		projectName: string,
	): Project | null {
		return (
			config.projects.find((p) => p.name === projectName) || null
		)
	}

	/**
	 * Creates a default node_projects.json file in the current directory
	 * @param projectName - Name for the initial project
	 * @param workingDirectory - Working directory path
	 * @returns Path to created config file
	 */
	async createDefaultConfig(
		projectName: string = 'my-rn-app',
		workingDirectory: string = '.',
	): Promise<string> {
		const configPath = join(Deno.cwd(), ProjectLoader.CONFIG_FILE_NAME)

		// Check if file already exists
		try {
			await Deno.stat(configPath)
			throw new ProjectLoadError(
				`${ProjectLoader.CONFIG_FILE_NAME} already exists`,
			)
		} catch (error) {
			// File doesn't exist, which is what we want
			if (error instanceof ProjectLoadError) {
				throw error
			}
		}

		const defaultConfig: NodeProjectsConfig = {
			version: '1.0',
			projects: [
				{
					name: projectName,
					workingDirectory,
					configuration: {
						defaultBranch: 'main',
						savePreference: 'stash',
						packageManager: 'npm',
						defaultPlatform: 'ios',
					},
					customCommands: [
						{
							alias: 'cosmic-deploy',
							description:
								'Complete deployment workflow: clean, update, install, build, and test',
							operations: [
								{
									type: 'clean_slate',
									description: 'Clean uncommitted changes',
								},
								{
									type: 'update',
									description: 'Pull latest changes',
								},
								{
									type: 'install',
									description: 'Install dependencies',
								},
								{
									type: 'build',
									description: 'Build the project',
									parameters: { platform: 'both' },
								},
								{
									type: 'test',
									description: 'Run tests',
								},
							],
						},
					],
				},
			],
		}

		// Write config file
		await Deno.writeTextFile(
			configPath,
			JSON.stringify(defaultConfig, null, 2),
		)

		return configPath
	}

	/**
	 * Saves configuration to file
	 * @param config - Configuration to save
	 * @param configPath - Path where to save (defaults to current directory)
	 */
	async save(
		config: NodeProjectsConfig,
		configPath?: string,
	): Promise<void> {
		const path = configPath ||
			join(Deno.cwd(), ProjectLoader.CONFIG_FILE_NAME)

		await Deno.writeTextFile(
			path,
			JSON.stringify(config, null, 2),
		)
	}
}

/**
 * Singleton instance of ProjectLoader
 */
export const projectLoader = new ProjectLoader()
