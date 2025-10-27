/** @jsxImportSource npm:react@18.3.1 */
/**
 * InteractiveView
 * Provides interactive UI for project selection and operation execution
 * Uses Ink for beautiful terminal interfaces
 */
import SelectInput from 'npm:ink-select-input@6.0.0'
import Spinner from 'npm:ink-spinner@5.0.0'
import TextInput from 'npm:ink-text-input@5.0.1'
import { Box, render, Text, useApp, useInput } from 'npm:ink@4.4.1'
import { useEffect, useState } from 'npm:react@18.3.1'
import {
	OperationController,
	type OperationResult,
} from '../controllers/OperationController.ts'
import type {
	CustomCommand,
	NodeProjectsConfig,
	Operation,
	Project,
} from '../models/Project.ts'
import { gitService } from '../services/GitService.ts'
import { Logger } from '../services/Logger.ts'
import {
	type BranchOption,
	ChangesetSwitchView,
} from './ChangesetSwitchView.tsx'
import { CompactLogsView } from './LogsView.tsx'
import { type ProjectGitInfo, ProjectInfoView } from './ProjectInfoView.tsx'

/**
 * Props for InteractiveView component
 */
interface InteractiveViewProps {
	config: NodeProjectsConfig
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
	| 'loading-project-info'
	| 'operation-selection'
	| 'changeset-selection'
	| 'parameter-input'
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
	const [projectGitInfo, setProjectGitInfo] = useState<ProjectGitInfo | null>(
		null,
	)
	const [localChangesets, setLocalChangesets] = useState<string[]>([])
	const [remoteBranchesForSwitch, setRemoteBranchesForSwitch] = useState<
		Array<{ branch: string; date: Date | null }>
	>([])
	const [currentOperation, setCurrentOperation] = useState<string>('')
	const [selectedOperationType, setSelectedOperationType] = useState<string>(
		'',
	)
	const [operationResult, setOperationResult] = useState<
		OperationResult | null
	>(null)
	const [changesetName, setChangesetName] = useState<string>('')
	const [logger] = useState<Logger>(() => new Logger())
	const [operationController] = useState<OperationController>(
		() => new OperationController(logger),
	)
	const { exit } = useApp()

	// Clear logger when switching projects
	useEffect(() => {
		if (selectedProject) {
			logger.clear()
			logger.setContext(selectedProject.name)
		}
	}, [selectedProject, logger])

	/**
	 * Loads git information for a project
	 */
	const loadProjectGitInfo = async (project: Project) => {
		try {
			const isGitRepo = await gitService.isGitRepository(
				project.workingDirectory,
			)
			if (!isGitRepo) {
				setProjectGitInfo(null)
				return
			}

			// Get main branch
			const mainBranch = await gitService.getMainBranch(
				project.workingDirectory,
				project.configuration.defaultBranch,
			)

			// Get current branch
			const currentBranch = await gitService.getCurrentBranch(
				project.workingDirectory,
			)

			const isMainBranch = currentBranch === mainBranch

			// Get changeset (uncommitted changes)
			const changeset = await gitService.getChangeset(
				project.workingDirectory,
			)

			// Get local changesets with tracking info
			const localChangesets = await gitService.getChangesetsWithTracking(
				project.workingDirectory,
			)

			// Get divergence (only if not on main branch)
			let divergence = { ahead: 0, behind: 0 }
			let lastSyncFromMain = null
			if (!isMainBranch && mainBranch) {
				divergence = await gitService.getBranchDivergence(
					project.workingDirectory,
					mainBranch,
				)
				lastSyncFromMain = await gitService.getLastSyncFromMain(
					project.workingDirectory,
					mainBranch,
				)
			}

			// Get all remote branches with dates
			const allRemoteBranchesWithDates = await gitService
				.getUnsyncedRemoteBranches(
					project.workingDirectory,
					true,
				) as Array<{ branch: string; date: Date | null }>

			// Filter out remote branches that already have local changesets
			const trackedRemoteBranches = new Set(
				localChangesets
					.map((cs) => cs.trackingBranch)
					.filter((tb) => tb !== null) as string[],
			)

			const unsyncedRemoteBranchesWithDates = allRemoteBranchesWithDates
				.filter((item) => !trackedRemoteBranches.has(item.branch))

			// Extract just the branch names for backward compatibility
			const unsyncedRemoteBranches = unsyncedRemoteBranchesWithDates.map(
				(item) => item.branch,
			)

			setProjectGitInfo({
				currentBranch,
				isMainBranch,
				mainBranch,
				changeset,
				localChangesets,
				lastSyncFromMain,
				unsyncedRemoteBranches,
				unsyncedRemoteBranchesWithDates,
				divergence,
			})
		} catch (error) {
			console.error('Error loading git info:', error)
			setProjectGitInfo(null)
		}
	}

	/**
	 * Handles project selection
	 */
	const handleProjectSelect = async (item: MenuItem) => {
		const project = config.projects.find((p) => p.name === item.value)
		if (project) {
			setSelectedProject(project)
			setState('loading-project-info')
			await loadProjectGitInfo(project)
			setState('operation-selection')
		}
	}

	/**
	 * Handles operation selection and execution
	 */
	const handleOperationSelect = async (item: MenuItem) => {
		if (!selectedProject) return

		// Check if this is the changeset switch operation
		if (item.value === 'switch_changeset') {
			// Load branches for changeset switching
			await loadChangesetBranches()
			setState('changeset-selection')
			return
		}

		// Check if this operation requires parameters
		if (item.value === 'fresh') {
			// Store the operation and show parameter input
			setSelectedOperationType(item.value)
			setCurrentOperation(item.label)
			setState('parameter-input')
			return
		}

		// Execute operation directly
		await executeOperation(item.value, item.label, {})
	}

	/**
	 * Loads branches for changeset switching
	 */
	const loadChangesetBranches = async () => {
		if (!selectedProject) return

		try {
			// Get local branches with "changeset/" prefix
			const changesets = await gitService.getLocalBranchesByPrefix(
				selectedProject.workingDirectory,
				'changeset/',
			)
			setLocalChangesets(changesets)

			// Get all remote branches with dates, sorted by most recent
			const remoteBranches = (await gitService.getAllRemoteBranches(
				selectedProject.workingDirectory,
				true,
			)) as Array<{ branch: string; date: Date | null }>
			setRemoteBranchesForSwitch(remoteBranches)
		} catch (error) {
			console.error('Error loading changeset branches:', error)
			setLocalChangesets([])
			setRemoteBranchesForSwitch([])
		}
	}

	/**
	 * Handles changeset/branch selection
	 */
	const handleChangesetSelect = async (option: BranchOption) => {
		if (!selectedProject) return

		const operationLabel = option.type === 'local'
			? `Switch - Switching to ${option.value}`
			: `Switch - Creating changeset from ${option.value}`

		// Execute the operation through OperationController
		await executeOperation('switch_changeset', operationLabel, {
			branchName: option.value,
			branchType: option.type,
		})
	}

	/**
	 * Executes an operation with given parameters
	 */
	const executeOperation = async (
		operationType: string,
		operationLabel: string,
		parameters: Record<string, unknown>,
	) => {
		if (!selectedProject) return

		setState('executing')
		setCurrentOperation(operationLabel)

		try {
			let result: OperationResult

			// Check if it's a custom command
			const customCommand = selectedProject.customCommands?.find(
				(cmd: CustomCommand) => cmd.alias === operationType,
			)

			if (customCommand) {
				// Execute custom command sequence
				const results = await operationController.executeSequence(
					customCommand.operations,
					selectedProject,
				)

				// Aggregate results
				const allSuccess = results.every((r: OperationResult) =>
					r.success
				)
				result = {
					success: allSuccess,
					message: allSuccess
						? `Custom command '${customCommand.alias}' completed successfully`
						: `Custom command '${customCommand.alias}' failed`,
					error: results.find((r: OperationResult) => !r.success)
						?.error,
				}
			} else {
				// Execute single operation
				result = await operationController.execute(
					{
						type: operationType,
						description: operationLabel,
						parameters,
					} as Operation,
					selectedProject,
				)
			}

			setOperationResult(result)
			setState('result')
		} catch (error) {
			setOperationResult({
				success: false,
				message: 'Operation failed',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
			setState('result')
		}
	}

	/**
	 * Handles changeset name submission
	 */
	const handleChangesetNameSubmit = async (value: string) => {
		if (!value.trim()) {
			// Use default if empty
			await executeOperation(selectedOperationType, currentOperation, {})
		} else {
			await executeOperation(selectedOperationType, currentOperation, {
				changesetName: value.trim(),
			})
		}
		setChangesetName('') // Reset for next time
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
					// Reload project info when going back to operation selection
					// to refresh changeset list and remote branches
					if (selectedProject) {
						loadProjectGitInfo(selectedProject)
					}
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

				<SelectInput
					items={projectItems}
					onSelect={handleProjectSelect}
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
	 * Render loading project info screen
	 */
	if (state === 'loading-project-info' && selectedProject) {
		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='cyan'>
						<Spinner type='dots' /> Loading project information...
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
			{
				label: 'Clean Slate - Discard uncommitted changes',
				value: 'clean_slate',
			},
			{ label: 'Save - Stash or branch changes', value: 'save' },
			{ label: 'Update - Pull latest changes', value: 'update' },
			{ label: 'Install - Install dependencies', value: 'install' },
			{ label: 'Build - Build the project', value: 'build' },
			{ label: 'Test - Run tests', value: 'test' },
			{ label: 'Run - Run on simulator/emulator', value: 'run' },
			{ label: 'Reset - Reset cache', value: 'reset' },
			{ label: 'Pod Install - Install iOS pods', value: 'pod_install' },
			{ label: 'Fresh - Create a fresh changeset', value: 'fresh' },
			{
				label: 'Switch - Switch or create changeset',
				value: 'switch_changeset',
			},
		]

		// Add custom commands
		const customCommands: MenuItem[] =
			selectedProject.customCommands?.map((cmd: CustomCommand) => ({
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
				{/* Project Git Information */}
				<ProjectInfoView
					projectName={selectedProject.name}
					gitInfo={projectGitInfo}
					isLoading={false}
				/>

				<Box marginBottom={1} marginTop={1}>
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
	 * Render changeset selection screen
	 */
	if (state === 'changeset-selection' && selectedProject) {
		return (
			<ChangesetSwitchView
				projectName={selectedProject.name}
				localChangesets={localChangesets}
				remoteBranches={remoteBranchesForSwitch}
				currentBranch={projectGitInfo?.currentBranch || null}
				onSelect={handleChangesetSelect}
			/>
		)
	}

	/**
	 * Render parameter input screen
	 */
	if (state === 'parameter-input') {
		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='cyan'>
						{currentOperation}
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text>
						Enter changeset name (or press Enter for default):
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color='green'>&gt;</Text>
					<TextInput
						value={changesetName}
						onChange={setChangesetName}
						onSubmit={handleChangesetNameSubmit}
					/>
				</Box>

				<Box marginTop={1}>
					<Text dimColor>
						Press Enter to confirm, Ctrl+C to cancel
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
						<Spinner type='dots' /> Executing: {currentOperation}
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text dimColor>Please wait...</Text>
				</Box>

				<Box marginTop={1}>
					<CompactLogsView logger={logger} maxLines={8} />
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

				{logger.getCount() > 0 && (
					<Box marginTop={1} marginBottom={1}>
						<CompactLogsView logger={logger} maxLines={10} />
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
							<Text color='cyan'>h</Text>{' '}
							- Back to project selection
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
export async function renderInteractiveView(
	config: NodeProjectsConfig,
): Promise<void> {
	const { waitUntilExit } = render(
		<InteractiveViewComponent config={config} />,
	)
	await waitUntilExit()
}
