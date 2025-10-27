/** @jsxImportSource npm:react@18.3.1 */
/**
 * ProjectInfoView
 * Displays detailed Git information for a selected project
 */
import { Box, Text } from 'npm:ink@4.4.1'
import React from 'npm:react@18.3.1'

/**
 * Git information for a project
 */
export interface ProjectGitInfo {
	currentBranch: string | null
	isMainBranch: boolean
	mainBranch: string | null
	changeset: Array<{ status: string; file: string }>
	lastSyncFromMain: Date | null
	unsyncedRemoteBranches: string[]
	divergence: { ahead: number; behind: number }
}

/**
 * Props for ProjectInfoView component
 */
interface ProjectInfoViewProps {
	projectName: string
	gitInfo: ProjectGitInfo | null
	isLoading: boolean
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
 * Gets a human-readable status description
 */
function getStatusDescription(status: string): string {
	switch (status) {
		case 'M':
			return 'Modified'
		case 'A':
			return 'Added'
		case 'D':
			return 'Deleted'
		case 'R':
			return 'Renamed'
		case 'C':
			return 'Copied'
		case '??':
			return 'Untracked'
		default:
			return status
	}
}

/**
 * Component that displays project git information
 */
export const ProjectInfoView = ({
	projectName,
	gitInfo,
	isLoading,
}: ProjectInfoViewProps) => {
	if (isLoading) {
		return (
			<Box flexDirection='column' marginBottom={1}>
				<Box marginBottom={1}>
					<Text bold color='green'>
						Project: {projectName}
					</Text>
				</Box>
				<Box>
					<Text dimColor>Loading git information...</Text>
				</Box>
			</Box>
		)
	}

	if (!gitInfo) {
		return (
			<Box flexDirection='column' marginBottom={1}>
				<Box marginBottom={1}>
					<Text bold color='green'>
						Project: {projectName}
					</Text>
				</Box>
				<Box>
					<Text color='yellow'>
						⚠️ Not a git repository or git information unavailable
					</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box flexDirection='column' marginBottom={1}>
			{/* Project Name */}
			<Box marginBottom={1}>
				<Text bold color='green'>
					Project: {projectName}
				</Text>
			</Box>

			{/* Current Branch */}
			<Box marginBottom={1}>
				<Box marginRight={1}>
					<Text bold>Branch:</Text>
				</Box>
				<Text color='cyan'>{gitInfo.currentBranch || 'unknown'}</Text>
				{gitInfo.isMainBranch && (
					<Box marginLeft={1}>
						<Text color='yellow'>(main)</Text>
					</Box>
				)}
			</Box>

			{/* Branch Divergence (only if not on main branch) */}
			{!gitInfo.isMainBranch && gitInfo.mainBranch && (
				<Box marginBottom={1} flexDirection='column'>
					<Box>
						<Text bold>Status:</Text>
						{gitInfo.divergence.ahead > 0 && (
							<Box marginLeft={1}>
								<Text color='green'>
									↑ {gitInfo.divergence.ahead} commit
									{gitInfo.divergence.ahead !== 1 ? 's' : ''}
									{' '}
									ahead
								</Text>
							</Box>
						)}
						{gitInfo.divergence.behind > 0 && (
							<Box marginLeft={1}>
								<Text color='yellow'>
									↓ {gitInfo.divergence.behind} commit
									{gitInfo.divergence.behind !== 1 ? 's' : ''}
									{' '}
									behind
								</Text>
							</Box>
						)}
						{gitInfo.divergence.ahead === 0 &&
							gitInfo.divergence.behind === 0 && (
							<Box marginLeft={1}>
								<Text color='green'>
									✓ Up to date with {gitInfo.mainBranch}
								</Text>
							</Box>
						)}
					</Box>
				</Box>
			)}

			{/* Last Sync from Main */}
			{!gitInfo.isMainBranch && gitInfo.lastSyncFromMain && (
				<Box marginBottom={1}>
					<Text bold>Last synced with main:</Text>
					<Box marginLeft={1}>
						<Text color='cyan'>
							{formatRelativeTime(gitInfo.lastSyncFromMain)}
						</Text>
					</Box>
				</Box>
			)}

			{/* Current Changeset */}
			{gitInfo.changeset.length > 0 && (
				<Box marginBottom={1} flexDirection='column'>
					<Box marginBottom={0}>
						<Text bold color='yellow'>
							Uncommitted Changes ({gitInfo.changeset.length}):
						</Text>
					</Box>
					<Box flexDirection='column' marginLeft={2}>
						{gitInfo.changeset.slice(0, 5).map((change, idx) => (
							<Box key={idx}>
								<Text color='gray'>
									[{getStatusDescription(change.status)}]
								</Text>
								<Box marginLeft={1}>
									<Text>{change.file}</Text>
								</Box>
							</Box>
						))}
						{gitInfo.changeset.length > 5 && (
							<Text dimColor>
								... and {gitInfo.changeset.length - 5} more
							</Text>
						)}
					</Box>
				</Box>
			)}

			{/* Remote Branches Not Synced Locally */}
			{gitInfo.unsyncedRemoteBranches.length > 0 && (
				<Box marginBottom={1} flexDirection='column'>
					<Box marginBottom={0}>
						<Text bold color='magenta'>
							Remote Branches Not Synced Locally (
							{gitInfo.unsyncedRemoteBranches.length}):
						</Text>
					</Box>
					<Box flexDirection='column' marginLeft={2}>
						{gitInfo.unsyncedRemoteBranches.slice(0, 5).map(
							(branch, idx) => (
								<Box key={idx}>
									<Text color='cyan'>{branch}</Text>
								</Box>
							),
						)}
						{gitInfo.unsyncedRemoteBranches.length > 5 && (
							<Text dimColor>
								... and{' '}
								{gitInfo.unsyncedRemoteBranches.length - 5} more
							</Text>
						)}
					</Box>
				</Box>
			)}

			{/* Clean State Message */}
			{gitInfo.changeset.length === 0 &&
				gitInfo.unsyncedRemoteBranches.length === 0 && (
				<Box marginBottom={1}>
					<Text color='green'>✓ Working directory clean</Text>
				</Box>
			)}
		</Box>
	)
}
