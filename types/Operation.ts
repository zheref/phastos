import type { OperationType } from './OperationType.ts'
import type { OperationParameters } from './OperationParameters.ts'

/**
 * Represents a single operation in a custom command
 */
export interface Operation {
	type: OperationType
	description?: string
	parameters?: OperationParameters
}
