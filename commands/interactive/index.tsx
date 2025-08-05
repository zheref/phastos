import { Box, render, Text, useApp, useInput } from 'npm:ink@4.4.1'
import React, { useState } from 'npm:react@18.3.1'
import { Command } from '../../types/command.ts'

const InteractiveComponent = () => {
	const [count, setCount] = useState(0)
	const [message, setMessage] = useState('')
	const { exit } = useApp()

	useInput((input, _key) => {
		if (input === 'q') {
			exit()
		}
		if (input === '+') {
			setCount((c) => c + 1)
		}
		if (input === '-') {
			setCount((c) => c - 1)
		}
		if (input === 'r') {
			setCount(0)
		}
		if (input === 'h') {
			setMessage('Hello from interactive mode!')
		}
		if (input === 'c') {
			setMessage('')
		}
	})

	return (
		<Box flexDirection='column' padding={1}>
			<Box marginBottom={1}>
				<Text bold color='magenta'>
					Interactive Counter Demo 🎮
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>Count:</Text>
				<Text bold color='cyan'>{count}</Text>
			</Box>

			{message && (
				<Box marginBottom={1}>
					<Text color='yellow'>{message}</Text>
				</Box>
			)}

			<Box flexDirection='column' marginTop={1}>
				<Text dimColor>Controls:</Text>
				<Box marginLeft={2}>
					<Text color='green'>+</Text>
					<Text>- Increment</Text>
				</Box>
				<Box marginLeft={2}>
					<Text color='red'>-</Text>
					<Text>- Decrement</Text>
				</Box>
				<Box marginLeft={2}>
					<Text color='blue'>r</Text>
					<Text>- Reset</Text>
				</Box>
				<Box marginLeft={2}>
					<Text color='yellow'>h</Text>
					<Text>- Show message</Text>
				</Box>
				<Box marginLeft={2}>
					<Text color='gray'>c</Text>
					<Text>- Clear message</Text>
				</Box>
				<Box marginLeft={2}>
					<Text color='red'>q</Text>
					<Text>- Quit</Text>
				</Box>
			</Box>
		</Box>
	)
}

export const interactiveCommand: Command = {
	name: 'interactive',
	description: 'Demonstrates interactive Ink features',
	execute: () => {
		render(<InteractiveComponent />)
	},
	component: InteractiveComponent,
}
