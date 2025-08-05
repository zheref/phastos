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
- `example` - Demonstrates how to create custom commands

## Development

### Code Style

This project follows modern JavaScript/TypeScript conventions:

- **No semicolons** - Semicolons are discouraged and automatically removed
- **Single quotes** - Use single quotes for strings
- **Tab indentation** - Use tabs with 4-space width for indentation
- **80 character line width** - For readability

### Development Tasks

```bash
# Run in development mode with file watching
deno task dev

# Run tests
deno task test

# Run tests in watch mode
deno task test:watch

# Format code (removes semicolons, enforces style)
deno task fmt

# Check formatting without making changes
deno task fmt:check

# Lint code
deno task lint
```

## Project Structure

```
phastos/
├── main.ts                    # Main CLI entry point
├── types/
│   └── command.ts            # Type definitions
├── commands/
│   ├── index.ts              # Command registry
│   ├── hello/
│   │   ├── index.ts          # Hello command implementation
│   │   └── hello.test.ts     # Hello command tests
│   ├── version/
│   │   ├── index.ts          # Version command implementation
│   │   └── version.test.ts   # Version command tests
│   └── example/
│       ├── index.ts          # Example command implementation
│       └── example.test.ts   # Example command tests
└── utils/
    ├── cli.ts                # CLI utility functions
    └── test-utils.ts         # Test utility functions
```

## Testing

Run all tests:

```bash
deno task test
```

Run tests in watch mode:

```bash
deno task test:watch
```

## Adding New Commands

The project is designed with a modular structure for easy extensibility. Each command has its own subfolder with implementation and tests.

### 1. Create a new command subfolder

Create a new directory in `commands/`, e.g., `commands/mycommand/`:

```bash
mkdir commands/mycommand
```

### 2. Create the command implementation

Create `commands/mycommand/index.ts`:

```typescript
import { Command } from '../../types/command.ts'

export const myCommand: Command = {
	name: 'mycommand',
	description: 'Description of what your command does',
	execute: () => {
		// Your command logic here
		console.log('Your command output')
	},
}
```

### 3. Create tests for your command

Create `commands/mycommand/mycommand.test.ts`:

```typescript
import { assertEquals } from '@std/assert'
import { myCommand } from './index.ts'
import { captureConsoleOutput } from '../../utils/test-utils.ts'

Deno.test('mycommand should have correct name', () => {
	assertEquals(myCommand.name, 'mycommand')
})

Deno.test('mycommand should print expected output', () => {
	const { output } = captureConsoleOutput(() => {
		myCommand.execute()
	})

	assertEquals(output, 'Your command output')
})
```

### 4. Register the command

Add the import and registration to `commands/index.ts`:

```typescript
import { myCommand } from './mycommand/index.ts'

// Add this line with the other command registrations
commands.set(myCommand.name, myCommand)
```

### 5. Reinstall the CLI

```bash
deno task install
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
