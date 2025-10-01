/**
 * Command Registry
 * Exports all available commands for the CLI
 */

import { Command } from '../types/command.ts'

// Import core Phastos commands
import { initCommand } from './init/index.tsx'
import { listCommand } from './list/index.tsx'
import { runCommand } from './run/index.tsx'

// Import example/demo commands (can be removed in production)
import { exampleCommand } from './example/index.tsx'
import { helloCommand } from './hello/index.tsx'
import { interactiveCommand } from './interactive/index.tsx'
import { progressCommand } from './progress/index.tsx'
import { versionCommand } from './version/index.tsx'

/**
 * Map of all available commands
 */
export const commands: Map<string, Command> = new Map()

// Register core Phastos commands
commands.set(initCommand.name, initCommand)
commands.set(listCommand.name, listCommand)
commands.set(runCommand.name, runCommand)

// Register demo commands (optional - can be removed)
commands.set(helloCommand.name, helloCommand)
commands.set(versionCommand.name, versionCommand)
commands.set(exampleCommand.name, exampleCommand)
commands.set(interactiveCommand.name, interactiveCommand)
commands.set(progressCommand.name, progressCommand)
