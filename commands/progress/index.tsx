/** @jsxImportSource react */

import { Box, render, Text } from 'npm:ink@4.4.1'
import { useEffect, useState } from 'npm:react@18.3.1'
import { Command } from '../../types/command.ts'

const ProgressComponent = () => {
	const [progress, setProgress] = useState(0)
	const [status, setStatus] = useState('Starting...')

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					setStatus('Complete!')
					clearInterval(interval)
					return 100
				}

				const newProgress = prev + Math.random() * 10
				if (newProgress > 50 && status === 'Starting...') {
					setStatus('Processing...')
				} else if (newProgress > 80 && status === 'Processing...') {
					setStatus('Finalizing...')
				}

				return Math.min(newProgress, 100)
			})
		}, 200)

		return () => clearInterval(interval)
	}, [])

	const progressBar = '█'.repeat(Math.floor(progress / 2)) +
		'░'.repeat(50 - Math.floor(progress / 2))

	return (
		<Box flexDirection='column' padding={1}>
			<Box marginBottom={1}>
				<Text bold color='cyan'>
					Progress Demo 📊
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>Status:</Text>
				<Text color='yellow'>{status}</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>Progress:</Text>
				<Text color='green'>{Math.round(progress)}%</Text>
			</Box>

			<Box marginBottom={1}>
				<Text color='blue'>[{progressBar}]</Text>
			</Box>

			{progress >= 100 && (
				<Box marginTop={1}>
					<Text color='green' bold>
						✅ Task completed successfully!
					</Text>
				</Box>
			)}
		</Box>
	)
}

export const progressCommand: Command = {
	name: 'progress',
	description: 'Demonstrates progress bar visualization',
	execute: () => {
		render(<ProgressComponent />)
	},
	component: ProgressComponent,
}
