/** @jsxImportSource react */

import { Box, render, Text } from 'npm:ink@4.4.1'
import { Command } from '../../types/command.ts'

const ExampleComponent = () => (
	<Box flexDirection='column' padding={1}>
		<Box marginBottom={1}>
			<Text bold color='yellow'>
				This is an example command! 🚀
			</Text>
		</Box>

		<Box marginBottom={1}>
			<Text>You can add any logic here:</Text>
		</Box>

		<Box flexDirection='column' marginLeft={2}>
			<Box>
				<Text color='green'>• API calls</Text>
			</Box>
			<Box>
				<Text color='green'>• File operations</Text>
			</Box>
			<Box>
				<Text color='green'>• Data processing</Text>
			</Box>
			<Box>
				<Text color='green'>• And much more!</Text>
			</Box>
		</Box>

		<Box marginTop={1}>
			<Text dimColor>
				Enhanced with Ink and React components
			</Text>
		</Box>
	</Box>
)

export const exampleCommand: Command = {
	name: 'example',
	description: 'Demonstrates how to create custom commands',
	execute: () => {
		render(<ExampleComponent />)
	},
	component: ExampleComponent,
}
