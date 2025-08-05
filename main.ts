#!/usr/bin/env -S deno run --allow-env

import { commands } from "./commands/index.ts";
import { showHelp, handleUnknownCommand } from "./utils/cli.ts";

function main(): void {
  const args = Deno.args;
  
  if (args.length === 0) {
    showHelp(commands);
    Deno.exit(1);
  }
  
  const commandName = args[0];
  
  if (commandName === "--help" || commandName === "-h") {
    showHelp(commands);
    Deno.exit(0);
  }
  
  const command = commands.get(commandName);
  
  if (!command) {
    handleUnknownCommand(commandName, commands);
    return; // This line is unreachable due to Deno.exit in handleUnknownCommand, but TypeScript needs it
  }
  
  // Execute the command
  command.execute();
}

if (import.meta.main) {
  main();
}
