import { Command } from '../types/command.ts'
import { exampleCommand } from './example/index.tsx'
import { helloCommand } from './hello/index.tsx'
import { interactiveCommand } from './interactive/index.tsx'
import { progressCommand } from './progress/index.tsx'
import { versionCommand } from './version/index.tsx'

// Export all commands
export const commands: Map<string, Command> = new Map()

// Register commands
commands.set(helloCommand.name, helloCommand)
commands.set(versionCommand.name, versionCommand)
commands.set(exampleCommand.name, exampleCommand)
commands.set(interactiveCommand.name, interactiveCommand)
commands.set(progressCommand.name, progressCommand)

// Add more commands here as needed
// Example:
// import { anotherCommand } from "./another/index.tsx";
// commands.set(anotherCommand.name, anotherCommand);
