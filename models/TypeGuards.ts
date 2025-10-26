import type { OperationType } from '../types/OperationType.ts'
import type { Platform } from '../types/Platform.ts'

/**
 * Type guard to check if a value is a valid Platform
 */
export function isPlatform(value: unknown): value is Platform {
	return (
		typeof value === 'string' &&
		['ios', 'android', 'both'].includes(value)
	)
}

/**
 * Type guard to check if a value is a valid OperationType
 */
export function isOperationType(value: unknown): value is OperationType {
	return (
		typeof value === 'string' &&
		[
			'clean_slate',
			'save',
			'update',
			'install',
			'build',
			'test',
			'run',
			'reset',
			'pod_install',
			'custom',
		].includes(value)
	)
}
