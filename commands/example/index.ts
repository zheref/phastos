import { Command } from '../../types/command.ts'

export const exampleCommand: Command = {
	name: 'example',
	description: 'Demonstrates how to create custom commands',
	execute: () => {
		console.log('This is an example command!')
		console.log('You can add any logic here:')
		console.log('- API calls')
		console.log('- File operations')
		console.log('- Data processing')
		console.log('- And much more!')
	},
}
