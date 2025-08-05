import { render, Text } from 'npm:ink@4.4.1'
import React from 'npm:react@18.3.1'
import { Command } from '../../types/command.ts'

const HelloComponent = () => <Text>Hello from Phastos! 👋</Text>

export const helloCommand: Command = {
	name: 'hello',
	description: 'Prints a greeting message',
	execute: () => {
		render(<HelloComponent />)
	},
	component: HelloComponent,
}
