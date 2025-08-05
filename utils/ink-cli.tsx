import { Box, render, Text } from 'npm:ink@4.4.1'
import type { ReactElement } from 'npm:react@18.3.1'
import React from 'npm:react@18.3.1'
import type { Command } from '../types/command.ts'

export function renderCommand(component: ReactElement): void {
	render(component)
}

export function showHelpWithInk(commands: Map<string, Command>): void {
	const HelpComponent = () => (
		<Box flexDirection='column' padding={1}>
			<Box marginBottom={1}>
				<Text bold color='cyan'>
					Phastos CLI
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>Usage: phastos &lt;command&gt;</Text>
			</Box>

			<Box marginBottom={1}>
				<Text bold>Available commands:</Text>
			</Box>

			<Box flexDirection='column' marginBottom={1}>
				{Array.from(commands.values()).map((command) => (
					<Box key={command.name} marginLeft={2}>
						<Text color='green'>{command.name}</Text>
						<Text>- {command.description}</Text>
					</Box>
				))}
			</Box>

			<Box>
				<Text dimColor>
					For more information about a command, run: phastos
					&lt;command&gt; --help
				</Text>
			</Box>
		</Box>
	)

	render(<HelpComponent />)
}

export function handleUnknownCommandWithInk(
	commandName: string,
	commands: Map<string, Command>,
): void {
	const ErrorComponent = () => (
		<Box flexDirection='column' padding={1}>
			<Box marginBottom={1}>
				<Text color='red' bold>
					Error: Unknown command '{commandName}'
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>Available commands:</Text>
			</Box>

			<Box flexDirection='column'>
				{Array.from(commands.values()).map((command) => (
					<Box key={command.name} marginLeft={2}>
						<Text color='green'>{command.name}</Text>
						<Text>- {command.description}</Text>
					</Box>
				))}
			</Box>
		</Box>
	)

	render(<ErrorComponent />)
	Deno.exit(1)
}
