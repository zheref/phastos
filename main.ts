#!/usr/bin/env -S deno run --allow-env

interface Command {
  name: string;
  description: string;
  execute: () => void;
}

const commands: Map<string, Command> = new Map();

// Register the hello command
commands.set("hello", {
  name: "hello",
  description: "Prints a greeting message",
  execute: () => {
    console.log("Hello from Phastos");
  },
});

// Add more commands here as needed
// Example:
// commands.set("version", {
//   name: "version",
//   description: "Shows the current version",
//   execute: () => {
//     console.log("Phastos v1.0.0");
//   },
// });

function showHelp() {
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

function main() {
  const args = Deno.args;
  
  if (args.length === 0) {
    showHelp();
    Deno.exit(1);
  }
  
  const commandName = args[0];
  
  if (commandName === "--help" || commandName === "-h") {
    showHelp();
    Deno.exit(0);
  }
  
  const command = commands.get(commandName);
  
  if (!command) {
    console.error(`Error: Unknown command '${commandName}'`);
    console.error("");
    showHelp();
    Deno.exit(1);
  }
  
  // Execute the command
  command.execute();
}

if (import.meta.main) {
  main();
}
