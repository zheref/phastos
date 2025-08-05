# Phastos CLI

A command-line tool for Phastos that can be run globally from anywhere.

## Setup

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh
# From source directory
chmod +x main.ts
```

## Installation

To install the CLI globally:

```bash
deno install --allow-env --global --name phastos main.ts
```

Or use the provided task:

```bash
deno task install
```

## Usage

### Basic Commands

```bash
# Print a greeting
phastos hello

# Show version
phastos version

# Show help
phastos --help
```

### Available Commands

- `hello` - Prints a greeting message
- `version` - Shows the current version

## Project Structure

```
phastos/
├── main.ts              # Main CLI entry point
├── types/
│   └── command.ts       # Type definitions
├── commands/
│   ├── index.ts         # Command registry
│   ├── hello.ts         # Hello command implementation
│   └── version.ts       # Version command implementation
└── utils/
    └── cli.ts           # CLI utility functions
```

## Adding New Commands

The project is designed with a modular structure for easy extensibility. To add new commands:

### 1. Create a new command file

Create a new file in the `commands/` directory, e.g., `commands/mycommand.ts`:

```typescript
import { Command } from "../types/command.ts";

export const myCommand: Command = {
  name: "mycommand",
  description: "Description of what your command does",
  execute: () => {
    // Your command logic here
    console.log("Your command output");
  },
};
```

### 2. Register the command

Add the import and registration to `commands/index.ts`:

```typescript
import { myCommand } from "./mycommand.ts";

// Add this line with the other command registrations
commands.set(myCommand.name, myCommand);
```

### 3. Reinstall the CLI

```bash
deno task install
```

## Development

Run in development mode with file watching:

```bash
deno task dev
```

## Uninstallation

To uninstall the CLI:

```bash
deno task uninstall
```

Or manually:

```bash
deno uninstall phastos
``` 