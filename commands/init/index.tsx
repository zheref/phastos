/** @jsxImportSource npm:react@18.3.1 */
/**
 * Init Command
 * Initializes a new node_projects.json file
 */
import React from 'npm:react@18.3.1'
import { Box, render, Text } from 'npm:ink@4.4.1'
import type { Command } from '../../types/command.ts'
import { projectLoader } from '../../services/ProjectLoader.ts'

/**
 * Success component
 */
const SuccessComponent = ({ path }: { path: string }) => (
	<Box flexDirection='column' padding={1}>
		<Box marginBottom={1}>
			<Text bold color='green'>
				✓ node_projects.json created successfully!
			</Text>
		</Box>

		<Box marginBottom={1}>
			<Text>Location: {path}</Text>
		</Box>

		<Box flexDirection='column' marginTop={1}>
			<Text dimColor>Next steps:</Text>
			<Box marginLeft={2}>
				<Text>
					1. Edit node_projects.json to configure your projects
				</Text>
			</Box>
			<Box marginLeft={2}>
				<Text>2. Run 'phastos' to start interactive mode</Text>
			</Box>
			<Box marginLeft={2}>
				<Text>3. Or use 'phastos list' to see available projects</Text>
			</Box>
		</Box>
	</Box>
)

/**
 * Error component
 */
const ErrorComponent = ({ error }: { error: string }) => (
	<Box padding={1}>
		<Text bold color='red'>
			✗ {error}
		</Text>
	</Box>
)

/**
 * Init command implementation
 */
export const initCommand: Command = {
	name: 'init',
	description: 'Creates a new node_projects.json configuration file',
	execute: async () => {
		try {
			// Get project name from args if provided
			const args = Deno.args.slice(1) // Skip 'init' command itself
			const projectName = args[0] || 'my-rn-app'

			const configPath = await projectLoader.createDefaultConfig(
				projectName,
			)
			render(<SuccessComponent path={configPath} />)
		} catch (error) {
			render(
				<ErrorComponent
					error={error instanceof Error
						? error.message
						: 'Unknown error'}
				/>,
			)
		}
	},
	component: () => <SuccessComponent path='/path/to/nprojects.json' />,
}
