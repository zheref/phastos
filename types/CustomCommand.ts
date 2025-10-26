import type { Operation } from './Operation.ts'

/**
 * Represents a custom command that can be defined in nprojects.json
 */
export interface CustomCommand {
	alias: string // Command identifier
	description: string // Human-readable description
	operations: Operation[] // Sequence of operations to execute
}
