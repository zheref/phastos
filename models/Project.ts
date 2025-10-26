/**
 * Project Models
 * Defines the data structures for nprojects.json configuration
 * Mirrors the structure from Alars' xprojects.json
 */

// Re-export all types from the new type files for backward compatibility
export type { CustomCommand } from '../types/CustomCommand.ts'
export type { NodeProjectsConfig } from '../types/NodeProjectsConfig.ts'
export type { Operation } from '../types/Operation.ts'
export type { OperationParameters } from '../types/OperationParameters.ts'
export type { OperationType } from '../types/OperationType.ts'
export type { Platform } from '../types/Platform.ts'
export type { Project } from '../types/Project.ts'
export type { ProjectConfiguration } from '../types/ProjectConfiguration.ts'
export type { SavePreference } from '../types/SavePreference.ts'

// Re-export type guards and constants from models
export { DEFAULT_PROJECT_CONFIG } from './DefaultConfig.ts'
export { isOperationType, isPlatform } from './TypeGuards.ts'
