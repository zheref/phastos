/**
 * InteractiveView
 * Provides interactive UI for project selection and operation execution
 * Uses Ink for beautiful terminal interfaces
 */

import { Box, render, Text, useApp, useInput } from 'npm:ink@4.4.1'
import SelectInput from 'npm:ink-select-input@6.0.0'
import Spinner from 'npm:ink-spinner@5.0.0'
import React, { useState } from 'npm:react@18.3.1'
import type {
	CustomCommand,
	NProjectsConfig,
	Project,
} from '../models/Project.ts'
import {
	operationController,
	type OperationResult,
} from '../controllers/OperationController.ts'

/**
 * Props for InteractiveView component
 */
interface InteractiveViewProps {
	config: NProjectsConfig
}

/**
 * Menu option item
 */
interface MenuItem {
	label: string
	value: string
}

/**
 * Application state
 */
type ViewState =
	| 'project-selection'
	| 'operation-selection'
	| 'executing'
	| 'result'
	| 'exiting'

/**
 * Main interactive view component
 */
const InteractiveViewComponent = ({ config }: InteractiveViewProps) => {
	const [state, setState] = useState<ViewState>('project-selection')
	const [selectedProject, setSelectedProject] = useState<Project | null>(
		null,
	)
	const [currentOperation, setCurrentOperation] = useState<string>('')
	const [operationResult, setOperationResult] =
		useState<OperationResult | null>(null)
	const { exit } = useApp()

	/**
	 * Handles project selection
	 */
	const handleProjectSelect = (item: MenuItem) => {
		const project = config.projects.find((p) => p.name === item.value)
		if (project) {
			setSelectedProject(project)
			setState('operation-selection')
		}
	}

	/**
	 * Handles operation selection and execution
	 */
	const handleOperationSelect = async (item: MenuItem) => {
		if (!selectedProject) return

		setState('executing')
		setCurrentOperation(item.label)

		try {
			let result: OperationResult

			// Check if it's a custom command
			const customCommand = selectedProject.customCommands?.find(
				(cmd) => cmd.alias === item.value,
			)

			if (customCommand) {
				// Execute custom command sequence
				const results = await operationController.executeSequence(
					customCommand.operations,
					selectedProject,
				)

				// Aggregate results
				const allSuccess = results.every((r) => r.success)
				result = {
					success: allSuccess,
					message: allSuccess
						? `Custom command '${customCommand.alias}' completed successfully`
						: `Custom command '${customCommand.alias}' failed`,
					error: results.find((r) => !r.success)?.error,
				}
			} else {
				// Execute single operation
				result = await operationController.execute(
					{
						type: item.value as any,
						description: item.label,
					},
					selectedProject,
				)
			}

			setOperationResult(result)
			setState('result')
		} catch (error) {
			setOperationResult({
				success: false,
				message: 'Operation failed',
				error: error instanceof Error
					? error.message
					: 'Unknown error',
			})
			setState('result')
		}
	}

	/**
	 * Handle keyboard input for result screen
	 */
	useInput(
		(input, _key) => {
			if (state === 'result') {
				if (input === 'q') {
					setState('exiting')
					setTimeout(() => exit(), 100)
				} else if (input === 'b') {
					setState('operation-selection')
					setOperationResult(null)
				} else if (input === 'h') {
					setState('project-selection')
					setSelectedProject(null)
					setOperationResult(null)
				}
			}
		},
		{ isActive: state === 'result' },
	)

	/**
	 * Render project selection screen
	 */
	if (state === 'project-selection') {
		const projectItems: MenuItem[] = config.projects.map((p) => ({
			label: `${p.name} (${p.workingDirectory})`,
			value: p.name,
		}))

		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='cyan'>
						🚀 Phastos - React Native Project Manager
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text>Select a project to work with:</Text>
				</Box>

				<SelectInput items={projectItems} onSelect={handleProjectSelect} />

				<Box marginTop={1}>
					<Text dimColor>
						Use arrow keys to navigate, Enter to select
					</Text>
				</Box>
			</Box>
		)
	}

	/**
	 * Render operation selection screen
	 */
	if (state === 'operation-selection' && selectedProject) {
		// Core operations
		const coreOperations: MenuItem[] = [
			{ label: 'Clean Slate - Discard uncommitted changes', value: 'clean_slate' },
			{ label: 'Save - Stash or branch changes', value: 'save' },
			{ label: 'Update - Pull latest changes', value: 'update' },
			{ label: 'Install - Install dependencies', value: 'install' },
			{ label: 'Build - Build the project', value: 'build' },
			{ label: 'Test - Run tests', value: 'test' },
			{ label: 'Run - Run on simulator/emulator', value: 'run' },
			{ label: 'Reset - Reset cache', value: 'reset' },
			{ label: 'Pod Install - Install iOS pods', value: 'pod_install' },
		]

		// Add custom commands
		const customCommands: MenuItem[] =
			selectedProject.customCommands?.map((cmd) => ({
				label: `${cmd.alias} - ${cmd.description}`,
				value: cmd.alias,
			})) || []

		const allOperations = [
			...coreOperations,
			...(customCommands.length > 0
				? [
					{ label: '--- Custom Commands ---', value: 'separator' },
					...customCommands,
				]
				: []),
		]

		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='green'>
						Project: {selectedProject.name}
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text>Select an operation:</Text>
				</Box>

				<SelectInput
					items={allOperations}
					onSelect={handleOperationSelect}
				/>

				<Box marginTop={1}>
					<Text dimColor>
						Use arrow keys to navigate, Enter to select
					</Text>
				</Box>
			</Box>
		)
	}

	/**
	 * Render executing screen
	 */
	if (state === 'executing') {
		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='yellow'>
						<Spinner type='dots' />
						{' '}
						Executing: {currentOperation}
					</Text>
				</Box>

				<Box>
					<Text dimColor>Please wait...</Text>
				</Box>
			</Box>
		)
	}

	/**
	 * Render result screen
	 */
	if (state === 'result' && operationResult) {
		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text
						bold
						color={operationResult.success ? 'green' : 'red'}
					>
						{operationResult.success ? '✓' : '✗'}{' '}
						{operationResult.message}
					</Text>
				</Box>

				{operationResult.error && (
					<Box marginBottom={1}>
						<Text color='red'>Error: {operationResult.error}</Text>
					</Box>
				)}

				<Box flexDirection='column' marginTop={1}>
					<Text dimColor>Options:</Text>
					<Box marginLeft={2}>
						<Text>
							<Text color='cyan'>b</Text> - Back to operations
						</Text>
					</Box>
					<Box marginLeft={2}>
						<Text>
							<Text color='cyan'>h</Text> - Back to project selection
						</Text>
					</Box>
					<Box marginLeft={2}>
						<Text>
							<Text color='red'>q</Text> - Quit
						</Text>
					</Box>
				</Box>
			</Box>
		)
	}

	/**
	 * Render exiting screen
	 */
	if (state === 'exiting') {
		return (
			<Box padding={1}>
				<Text color='cyan'>Goodbye! 👋</Text>
			</Box>
		)
	}

	return null
}

/**
 * Renders the interactive view
 * @param config - Projects configuration
 */
export function renderInteractiveView(config: NProjectsConfig): void {
	render(<InteractiveViewComponent config={config} />)
}
