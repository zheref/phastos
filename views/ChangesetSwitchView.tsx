/** @jsxImportSource npm:react@18.3.1 */
/**
 * ChangesetSwitchView
 * Allows users to switch between local changeset branches or checkout remote branches
 */
import SelectInput from 'npm:ink-select-input@6.0.0'
import { Box, render, Text } from 'npm:ink@4.4.1'
import React from 'npm:react@18.3.1'

/**
 * Branch option item for selection
 */
export interface BranchOption {
	label: string
	value: string
	type: 'local' | 'remote'
	date?: Date | null
}

/**
 * Props for ChangesetSwitchView component
 */
interface ChangesetSwitchViewProps {
	projectName: string
	localChangesets: string[]
	remoteBranches: Array<{ branch: string; date: Date | null }>
	currentBranch: string | null
	onSelect: (option: BranchOption) => void
	onCancel?: () => void
}

/**
 * Formats a date to a relative time string
 */
function formatRelativeTime(date: Date): string {
	const now = new Date()
	const diff = now.getTime() - date.getTime()
	const seconds = Math.floor(diff / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)
	const months = Math.floor(days / 30)
	const years = Math.floor(days / 365)

	if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
	if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
	if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
	if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
	if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
	return 'just now'
}

/**
 * Component for selecting a changeset to switch to
 */
export const ChangesetSwitchView = ({
	projectName,
	localChangesets,
	remoteBranches,
	currentBranch,
	onSelect,
}: ChangesetSwitchViewProps) => {
	// Build menu items
	const items: Array<{ label: string; value: string }> = []

	// Add local changesets section
	if (localChangesets.length > 0) {
		items.push({
			label: '--- Local Changesets ---',
			value: 'separator-local',
		})

		localChangesets.forEach((branch) => {
			const isCurrent = branch === currentBranch
			const label = isCurrent ? `${branch} (current)` : branch
			items.push({
				label,
				value: `local:${branch}`,
			})
		})
	}

	// Add remote branches section
	if (remoteBranches.length > 0) {
		items.push({
			label: '--- Remote Branches (Create New Changeset) ---',
			value: 'separator-remote',
		})

		remoteBranches.slice(0, 20).forEach(({ branch, date }) => {
			const dateStr = date ? ` (${formatRelativeTime(date)})` : ''
			items.push({
				label: `${branch}${dateStr}`,
				value: `remote:${branch}`,
			})
		})

		if (remoteBranches.length > 20) {
			items.push({
				label: `... and ${remoteBranches.length - 20} more`,
				value: 'separator-more',
			})
		}
	}

	// Handle no changesets or branches
	if (items.length === 0) {
		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='green'>
						Project: {projectName}
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color='yellow'>
						No local changesets or remote branches available
					</Text>
				</Box>

				<Box>
					<Text dimColor>Press 'q' to go back</Text>
				</Box>
			</Box>
		)
	}

	const handleSelect = (item: { label: string; value: string }) => {
		// Skip separator items
		if (
			item.value.startsWith('separator')
		) {
			return
		}

		const [type, ...branchParts] = item.value.split(':')
		const branchValue = branchParts.join(':')

		onSelect({
			label: item.label,
			value: branchValue,
			type: type as 'local' | 'remote',
		})
	}

	return (
		<Box flexDirection='column' padding={1}>
			<Box marginBottom={1}>
				<Text bold color='green'>
					Project: {projectName}
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>
					Switch to an existing changeset or create one from a remote
					branch:
				</Text>
			</Box>

			<SelectInput items={items} onSelect={handleSelect} />

			<Box marginTop={1}>
				<Text dimColor>
					Use arrow keys to navigate, Enter to select, Esc to cancel
				</Text>
			</Box>
		</Box>
	)
}

/**
 * Renders the changeset switch view
 */
export async function renderChangesetSwitchView(
	props: ChangesetSwitchViewProps,
): Promise<void> {
	const { waitUntilExit } = render(<ChangesetSwitchView {...props} />)
	await waitUntilExit()
}
