import { Box, render, Text } from 'npm:ink@4.4.1'
import React from 'npm:react@18.3.1'
import { Command } from '../../types/command.ts'

const VersionComponent = () => (
	<Box flexDirection='column' padding={1}>
		<Box marginBottom={1}>
			<Text bold color='blue'>
				Phastos v1.0.0
			</Text>
		</Box>

		<Box marginBottom={1}>
			<Text>Enhanced with Ink rendering</Text>
		</Box>

		<Box>
			<Text dimColor>
				Built with Deno and React
			</Text>
		</Box>
	</Box>
)

export const versionCommand: Command = {
	name: 'version',
	description: 'Shows the current version',
	execute: () => {
		render(<VersionComponent />)
	},
	component: VersionComponent,
}
