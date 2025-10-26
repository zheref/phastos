/** @jsxImportSource npm:react@18.3.1 */
/**
 * LogsView
 * Displays operation logs in a scrollable, auto-updating list
 * Shows logs with color-coding based on level
 */
import { Box, Text } from 'npm:ink@4.4.1'
import { useEffect, useState } from 'npm:react@18.3.1'
import type { LogEntry, Logger, LogLevel } from '../services/Logger.ts'

/**
 * Props for LogsView component
 */
interface LogsViewProps {
	logger: Logger
	maxHeight?: number
	showTimestamps?: boolean
}

/**
 * Gets the color for a log level
 */
const getLogLevelColor = (
	level: LogLevel,
): 'white' | 'blue' | 'yellow' | 'gray' | 'red' | 'redBright' => {
	switch (level) {
		case 'log':
			return 'white'
		case 'info':
			return 'blue'
		case 'warning':
			return 'yellow'
		case 'verbose':
			return 'gray'
		case 'failure':
			return 'red'
		case 'error':
			return 'redBright'
	}
}

/**
 * Gets the icon for a log level
 */
const getLogLevelIcon = (level: LogLevel): string => {
	switch (level) {
		case 'log':
			return '•'
		case 'info':
			return 'ℹ'
		case 'warning':
			return '⚠'
		case 'verbose':
			return '◦'
		case 'failure':
			return '✗'
		case 'error':
			return '❌'
	}
}

/**
 * Formats a timestamp for display
 */
const formatTimestamp = (date: Date): string => {
	return date.toLocaleTimeString('en-US', {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}

/**
 * LogsView component - displays operation logs
 */
export const LogsView = ({
	logger,
	maxHeight = 10,
	showTimestamps = true,
}: LogsViewProps) => {
	const [logs, setLogs] = useState<LogEntry[]>(logger.getLogs())

	useEffect(() => {
		// Subscribe to logger updates
		const unsubscribe = logger.subscribe((entry: LogEntry) => {
			setLogs((prevLogs: LogEntry[]) => [...prevLogs, entry])
		})

		return unsubscribe
	}, [logger])

	// Calculate which logs to display (show last N logs based on maxHeight)
	const displayLogs = logs.slice(-maxHeight)

	if (logs.length === 0) {
		return (
			<Box
				flexDirection='column'
				borderStyle='round'
				borderColor='gray'
				padding={1}
			>
				<Box marginBottom={1}>
					<Text bold color='cyan'>
						📋 Operation Logs
					</Text>
				</Box>
				<Box>
					<Text dimColor>No logs yet...</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box
			flexDirection='column'
			borderStyle='round'
			borderColor='cyan'
			padding={1}
		>
			<Box marginBottom={1}>
				<Text bold color='cyan'>
					📋 Operation Logs ({logs.length})
				</Text>
			</Box>

			<Box flexDirection='column'>
				{displayLogs.map((entry: LogEntry, index: number) => {
					const color = getLogLevelColor(entry.level)
					const icon = getLogLevelIcon(entry.level)
					const timestamp = formatTimestamp(entry.timestamp)
					const isLast = index === displayLogs.length - 1

					return (
						<Box key={entry.id} flexDirection='row'>
							{showTimestamps && (
								<Text dimColor>[{timestamp}]</Text>
							)}
							<Text color={color} bold={isLast}>
								{icon} {entry.message}
							</Text>
						</Box>
					)
				})}
			</Box>

			{logs.length > maxHeight && (
				<Box marginTop={1}>
					<Text dimColor italic>
						... showing last {maxHeight} of {logs.length} logs
					</Text>
				</Box>
			)}

			<Box marginTop={1}>
				<Text dimColor>
					Logs automatically update as operations run
				</Text>
			</Box>
		</Box>
	)
}

/**
 * Compact logs view for inline display
 */
export const CompactLogsView = ({
	logger,
	maxLines = 5,
}: { logger: Logger; maxLines?: number }) => {
	const [logs, setLogs] = useState<LogEntry[]>(logger.getLogs())

	useEffect(() => {
		const unsubscribe = logger.subscribe((entry: LogEntry) => {
			setLogs((prevLogs: LogEntry[]) => [...prevLogs, entry])
		})
		return unsubscribe
	}, [logger])

	const displayLogs = logs.slice(-maxLines)

	if (logs.length === 0) {
		return (
			<Box>
				<Text dimColor>No logs</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection='column'>
			{displayLogs.map((entry: LogEntry) => {
				const color = getLogLevelColor(entry.level)
				const icon = getLogLevelIcon(entry.level)

				return (
					<Box key={entry.id}>
						<Text color={color}>
							{icon} {entry.message}
						</Text>
					</Box>
				)
			})}
			{logs.length > maxLines && (
				<Text dimColor>
					... {logs.length - maxLines} more
				</Text>
			)}
		</Box>
	)
}
