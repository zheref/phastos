#!/usr/bin/env -S deno run --allow-env --allow-read --allow-run

/**
 * Phastos - React Native Project Manager
 * Main entry point for the CLI
 *
 * Inspired by Alars (Swift/Xcode project manager)
 * Provides interactive and direct command modes for managing React Native projects
 */

import { commands } from './commands/index.ts'
import { renderInteractiveView } from './views/InteractiveView.tsx'
import {
	projectLoader,
	ProjectLoadError,
} from './services/ProjectLoader.ts'
import { Box, render, Text } from 'npm:ink@4.4.1'
import React from 'npm:react@18.3.1'

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
						<Text color='green'>init</Text> - Create a new nprojects.json file
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
					<Text dimColor>• Plus any custom commands from nprojects.json</Text>
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

	// Show help
	if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
		// If no nprojects.json exists, show help
		// Otherwise, launch interactive mode
		try {
			const config = await projectLoader.load()

			// Launch interactive mode
			if (args.length === 0) {
				renderInteractiveView(config)
				return
			}
		} catch (error) {
			if (error instanceof ProjectLoadError) {
				// No config file, show help
				showHelp()
				return
			}
			throw error
		}

		// Explicit help request
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
