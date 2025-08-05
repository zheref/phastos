import { Command } from '../../types/command.ts'

export const versionCommand: Command = {
	name: 'version',
	description: 'Shows the current version',
	execute: () => {
		console.log('Phastos v1.0.0')
	},
}
