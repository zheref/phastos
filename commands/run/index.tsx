/** @jsxImportSource npm:react@18.3.1 */
/**
 * Run Command
 * Executes operations on a specific project
 */
import React, { useEffect, useState } from 'npm:react@18.3.1'
import { Box, render, Text } from 'npm:ink@4.4.1'
import Spinner from 'npm:ink-spinner@5.0.0'
import type { Command } from '../../types/command.ts'
import {
	projectLoader,
	ProjectLoadError,
} from '../../services/ProjectLoader.ts'
import {
	operationController,
	type OperationResult,
} from '../../controllers/OperationController.ts'
import type { Operation } from '../../models/Project.ts'

/**
 * Props for RunComponent
 */
interface RunComponentProps {
	projectName: string
	operationName: string
}

/**
 * Component to display operation execution
 */
const RunComponent = ({ projectName, operationName }: RunComponentProps) => {
	const [status, setStatus] = useState<'loading' | 'running' | 'done'>(
		'loading',
	)
	const [result, setResult] = useState<OperationResult | null>(null)

	useEffect(() => {
		const executeOperation = async () => {
			try {
				// Load config
				const config = await projectLoader.load()

				// Find project
				const project = projectLoader.findProject(config, projectName)
				if (!project) {
					setResult({
						success: false,
						message: `Project '${projectName}' not found`,
					})
					setStatus('done')
					return
				}

				setStatus('running')

				// Check if it's a custom command
				const customCommand = project.customCommands?.find(
					(cmd) => cmd.alias === operationName,
				)

				let operationResult: OperationResult

				if (customCommand) {
					// Execute custom command sequence
					const results = await operationController.executeSequence(
						customCommand.operations,
						project,
					)

					// Aggregate results
					const allSuccess = results.every((r) => r.success)
					operationResult = {
						success: allSuccess,
						message: allSuccess
							? `Custom command '${customCommand.alias}' completed`
							: `Custom command '${customCommand.alias}' failed`,
						error: results.find((r) => !r.success)?.error,
					}
				} else {
					// Execute single operation
					const operation: Operation = {
						type: operationName as any,
						description: operationName,
					}

					operationResult = await operationController.execute(
						operation,
						project,
					)
				}

				setResult(operationResult)
				setStatus('done')
			} catch (error) {
				setResult({
					success: false,
					message: 'Execution failed',
					error: error instanceof Error
						? error.message
						: 'Unknown error',
				})
				setStatus('done')
			}
		}

		executeOperation()
	}, [projectName, operationName])

	if (status === 'loading') {
		return (
			<Box padding={1}>
				<Text>
					<Spinner type='dots' /> Loading configuration...
				</Text>
			</Box>
		)
	}

	if (status === 'running') {
		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='cyan'>
						Running: {operationName}
					</Text>
				</Box>
				<Box>
					<Text>
						<Spinner type='dots' />{' '}
						Executing on project '{projectName}'...
					</Text>
				</Box>
			</Box>
		)
	}

	if (status === 'done' && result) {
		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text
						bold
						color={result.success ? 'green' : 'red'}
					>
						{result.success ? '✓' : '✗'} {result.message}
					</Text>
				</Box>

				{result.error && (
					<Box>
						<Text color='red'>Error: {result.error}</Text>
					</Box>
				)}
			</Box>
		)
	}

	return null
}

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
 * Usage component
 */
const UsageComponent = () => (
	<Box flexDirection='column' padding={1}>
		<Box marginBottom={1}>
			<Text bold color='yellow'>
				Usage:
			</Text>
		</Box>

		<Box marginBottom={1}>
			<Text>
				phastos run &lt;operation&gt; --project &lt;project-name&gt;
			</Text>
		</Box>

		<Box flexDirection='column'>
			<Text dimColor>Examples:</Text>
			<Box marginLeft={2}>
				<Text>phastos run build --project my-app</Text>
			</Box>
			<Box marginLeft={2}>
				<Text>phastos run test --project my-app</Text>
			</Box>
			<Box marginLeft={2}>
				<Text>phastos run cosmic-deploy --project my-app</Text>
			</Box>
		</Box>
	</Box>
)

/**
 * Run command implementation
 */
export const runCommand: Command = {
	name: 'run',
	description: 'Runs an operation on a specific project',
	execute: async () => {
		const args = Deno.args.slice(1) // Skip 'run' command itself

		// Parse arguments
		const operationName = args[0]
		const projectFlagIndex = args.indexOf('--project')
		const projectName = projectFlagIndex >= 0
			? args[projectFlagIndex + 1]
			: null

		if (!operationName) {
			render(<UsageComponent />)
			return
		}

		if (!projectName) {
			render(<ErrorComponent error='--project flag is required' />)
			return
		}

		render(
			<RunComponent
				projectName={projectName}
				operationName={operationName}
			/>,
		)
	},
	component: () => (
		<RunComponent projectName='example' operationName='build' />
	),
}
