import { Command } from "../types/command.ts";

export function showHelp(commands: Map<string, Command>): void {
  console.log("Phastos CLI");
  console.log("");
  console.log("Usage: phastos <command>");
  console.log("");
  console.log("Available commands:");
  
  for (const command of commands.values()) {
    console.log(`  ${command.name} - ${command.description}`);
  }
  
  console.log("");
  console.log("For more information about a command, run: phastos <command> --help");
}

export function handleUnknownCommand(commandName: string, commands: Map<string, Command>): void {
  console.error(`Error: Unknown command '${commandName}'`);
  console.error("");
  showHelp(commands);
  Deno.exit(1);
} 