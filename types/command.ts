import type { ReactElement } from 'npm:react@18.3.1'

export interface Command {
	name: string
	description: string
	execute: () => void
	component?: () => ReactElement
}
