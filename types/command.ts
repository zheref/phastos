import type { ReactElement } from 'react'

export interface Command {
	name: string
	description: string
	execute: () => void
	component?: () => ReactElement
}
