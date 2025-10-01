/** @jsxImportSource npm:react@18.3.1 */
/**
 * InitPromptView
 * Prompts user to create a node_projects.json file when not found
 * Similar to Alars' xprojects.json creation prompt
 */

import React, { useState } from 'npm:react@18.3.1'
import { Box, render, Text, useApp, useInput } from 'npm:ink@4.4.1'
import TextInput from 'npm:ink-text-input@6.0.0'

/**
 * Props for InitPromptView
 */
interface InitPromptViewProps {
	onConfirm: (projectName: string) => void
	onCancel: () => void
}

/**
 * Component to prompt user for config creation
 */
const InitPromptComponent = ({
	onConfirm,
	onCancel,
}: InitPromptViewProps) => {
	const [step, setStep] = useState<'confirm' | 'input'>('confirm')
	const [projectName, setProjectName] = useState('')
	const { exit } = useApp()

	useInput(
		(input, _key) => {
			if (step === 'confirm') {
				if (input === 'y' || input === 'Y') {
					setStep('input')
				} else if (input === 'n' || input === 'N') {
					onCancel()
					exit()
				}
			}
		},
		{ isActive: step === 'confirm' },
	)

	const handleSubmit = (value: string) => {
		const name = value.trim() || 'my-rn-app'
		onConfirm(name)
		exit()
	}

	if (step === 'confirm') {
		return (
			<Box flexDirection='column' padding={1}>
				<Box marginBottom={1}>
					<Text bold color='yellow'>
						⚠️  No node_projects.json found
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text>
						Would you like to create a configuration file? (y/n)
					</Text>
				</Box>

				<Box>
					<Text dimColor>
						Press 'y' to create, 'n' to exit
					</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box flexDirection='column' padding={1}>
			<Box marginBottom={1}>
				<Text bold color='cyan'>
					Creating node_projects.json
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>Enter project name (or press Enter for default): </Text>
			</Box>

			<Box>
				<Text color='green'>→ </Text>
				<TextInput
					value={projectName}
					onChange={setProjectName}
					onSubmit={handleSubmit}
					placeholder='my-rn-app'
				/>
			</Box>
		</Box>
	)
}

/**
 * Renders the init prompt and waits for user response
 * @param onConfirm - Callback when user confirms creation
 * @param onCancel - Callback when user cancels
 */
export async function renderInitPrompt(
	onConfirm: (projectName: string) => void,
	onCancel: () => void,
): Promise<void> {
	const { waitUntilExit } = render(
		<InitPromptComponent onConfirm={onConfirm} onCancel={onCancel} />,
	)
	await waitUntilExit()
}
