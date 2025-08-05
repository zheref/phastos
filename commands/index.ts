import { Command } from "../types/command.ts";
import { helloCommand } from "./hello.ts";
import { versionCommand } from "./version.ts";
import { exampleCommand } from "./example.ts";

// Export all commands
export const commands: Map<string, Command> = new Map();

// Register commands
commands.set(helloCommand.name, helloCommand);
commands.set(versionCommand.name, versionCommand);
commands.set(exampleCommand.name, exampleCommand);

// Add more commands here as needed
// Example:
// import { anotherCommand } from "./another.ts";
// commands.set(anotherCommand.name, anotherCommand); 