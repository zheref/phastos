#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-run
/**
 * Phastos - React Native Project Manager
 * Main entry point for the CLI
 *
 * Inspired by Alars (Swift/Xcode project manager)
 * Provides interactive and direct command modes for managing React Native projects
 *
 * @jsxImportSource npm:react@18.3.1
 */
import React from 'npm:react@18.3.1'
import { Box, render, Text } from 'npm:ink@4.4.1'
import { commands } from './commands/index.ts'
import { renderInteractiveView } from './views/InteractiveView.tsx'
import { renderInitPrompt } from './views/InitPromptView.tsx'
import {
	projectLoader,
	ProjectLoadError,
} from './services/ProjectLoader.ts'

/**
 * Renders help/usage information
 */
function showHelp(): void {
	const HelpComponent = () => (
		<Box flexDirection='column' padding={1}>
			<Box marginBottom={1}>
				<Text bold color='cyan'>
					🚀 Phastos - React Native Project Manager
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>
					A powerful CLI for managing React Native projects with interactive workflows
				</Text>
			</Box>

			<Box flexDirection='column' marginBottom={1}>
				<Text bold>Usage:</Text>
				<Box marginLeft={2}>
					<Text>phastos [command] [options]</Text>
				</Box>
			</Box>

			<Box flexDirection='column' marginBottom={1}>
				<Text bold>Commands:</Text>
				<Box marginLeft={2} flexDirection='column'>
					<Text>
						<Text color='green'>init</Text> - Create a new node_projects.json file
					</Text>
					<Text>
						<Text color='green'>list</Text> - List all configured projects
					</Text>
					<Text>
						<Text color='green'>run</Text> - Run an operation on a project
					</Text>
					<Text dimColor>
						      phastos run &lt;operation&gt; --project &lt;name&gt;
					</Text>
				</Box>
			</Box>

			<Box flexDirection='column' marginBottom={1}>
				<Text bold>Interactive Mode:</Text>
				<Box marginLeft={2}>
					<Text>Run 'phastos' without arguments to enter interactive mode</Text>
				</Box>
			</Box>

			<Box flexDirection='column'>
				<Text bold>Available Operations:</Text>
				<Box marginLeft={2} flexDirection='column'>
					<Text>• clean_slate - Discard uncommitted changes</Text>
					<Text>• save - Stash or branch changes</Text>
					<Text>• update - Pull latest repository changes</Text>
					<Text>• install - Install dependencies</Text>
					<Text>• build - Build the project</Text>
					<Text>• test - Run tests</Text>
					<Text>• run - Run on simulator/emulator</Text>
					<Text>• reset - Reset React Native cache</Text>
					<Text>• pod_install - Install iOS CocoaPods</Text>
					<Text dimColor>• Plus any custom commands from node_projects.json</Text>
				</Box>
			</Box>
		</Box>
	)

	render(<HelpComponent />)
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
	const args = Deno.args

	// Handle no arguments (interactive mode or init prompt)
	if (args.length === 0) {
		try {
			const config = await projectLoader.load()
			// Launch interactive mode
			await renderInteractiveView(config)
			return
		} catch (error) {
			if (error instanceof ProjectLoadError) {
				// No config file found - offer to create one (like Alars)
				await renderInitPrompt(
					async (projectName: string) => {
						try {
							const configPath =
								await projectLoader.createDefaultConfig(
									projectName,
								)

							const SuccessComponent = () => (
								<Box flexDirection='column' padding={1}>
									<Box marginBottom={1}>
										<Text bold color='green'>
											✓ node_projects.json created!
										</Text>
									</Box>
									<Box>
										<Text>
											Run 'phastos' again to start
											interactive mode
										</Text>
									</Box>
								</Box>
							)

							render(<SuccessComponent />)
						} catch (err) {
							const ErrorComponent = () => (
								<Box padding={1}>
									<Text bold color='red'>
										✗ Failed to create config:{' '}
										{err instanceof Error
											? err.message
											: 'Unknown error'}
									</Text>
								</Box>
							)

							render(<ErrorComponent />)
							Deno.exit(1)
						}
					},
					() => {
						// User cancelled - show help
						showHelp()
					},
				)
				return
			}
			throw error
		}
	}

	// Explicit help request
	if (args[0] === '--help' || args[0] === '-h') {
		showHelp()
		return
	}

	const commandName = args[0]

	// Check for registered commands
	const command = commands.get(commandName)

	if (!command) {
		// Unknown command
		const ErrorComponent = () => (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='red'>
						✗ Unknown command: {commandName}
					</Text>
				</Box>

				<Box>
					<Text>Run 'phastos --help' to see available commands</Text>
				</Box>
			</Box>
		)

		render(<ErrorComponent />)
		Deno.exit(1)
	}

	// Execute the command
	await command.execute()
}

if (import.meta.main) {
	main()
}
