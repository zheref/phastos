/** @jsxImportSource npm:react@18.3.1 */
/**
 * List Command
 * Lists all projects from node_projects.json
 */
import React from 'npm:react@18.3.1'
import { Box, render, Text } from 'npm:ink@4.4.1'
import type { Command } from '../../types/command.ts'
import {
	projectLoader,
	ProjectLoadError,
} from '../../services/ProjectLoader.ts'

/**
 * Component to display project list
 */
const ListComponent = ({ projects }: { projects: any[] }) => (
	<Box flexDirection='column' padding={1}>
		<Box marginBottom={1}>
			<Text bold color='cyan'>
				📋 Available Projects
			</Text>
		</Box>

		{projects.length === 0
			? (
				<Box>
					<Text color='yellow'>No projects found</Text>
				</Box>
			)
			: (
				projects.map((project, index) => (
					<Box key={index} flexDirection='column' marginBottom={1}>
						<Box>
							<Text bold color='green'>
								{project.name}
							</Text>
						</Box>
						<Box marginLeft={2}>
							<Text dimColor>
								Path: {project.workingDirectory}
							</Text>
						</Box>
						{project.repositoryURL && (
							<Box marginLeft={2}>
								<Text dimColor>
									Repo: {project.repositoryURL}
								</Text>
							</Box>
						)}
						<Box marginLeft={2}>
							<Text dimColor>
								Platform:{' '}
								{project.configuration.defaultPlatform || 'ios'}
							</Text>
						</Box>
					</Box>
				))
			)}
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
 * List command implementation
 */
export const listCommand: Command = {
	name: 'list',
	description: 'Lists all projects from node_projects.json',
	execute: async () => {
		try {
			const config = await projectLoader.load()
			render(<ListComponent projects={config.projects} />)
		} catch (error) {
			if (error instanceof ProjectLoadError) {
				render(<ErrorComponent error={error.message} />)
			} else {
				render(
					<ErrorComponent
						error={error instanceof Error
							? error.message
							: 'Unknown error'}
					/>,
				)
			}
		}
	},
	component: () => <ListComponent projects={[]} />,
}
