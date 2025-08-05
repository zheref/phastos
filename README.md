# Phastos CLI

A command-line tool for Phastos that can be run globally from anywhere. Enhanced with **Ink** for beautiful, interactive terminal interfaces using React components and JSX.

## Features

- 🎨 **Beautiful UI** - Enhanced with Ink and React for modern terminal interfaces
- 🎮 **Interactive Commands** - Real-time input handling and state management
- 📊 **Progress Visualization** - Animated progress bars and status updates
- 🎯 **Modular Architecture** - Easy to extend with new commands
- 🧪 **Comprehensive Testing** - Full test coverage for all commands
- 🚀 **Enhanced User Experience** - Better formatting and visual feedback

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
deno install --allow-env --allow-read --global --name phastos main.ts --config deno.json
```

Or use the provided task:

```bash
deno task install
```

## Usage

### Basic Commands

```bash
# Print a greeting with enhanced UI
phastos hello

# Show version with styled output
phastos version

# Show help with beautiful formatting
phastos --help

# Run interactive demo
phastos interactive

# Watch progress animation
phastos progress
```

### Available Commands

- `hello` - Prints a greeting message with enhanced styling
- `version` - Shows the current version with beautiful formatting
- `example` - Demonstrates how to create custom commands
- `interactive` - Interactive counter demo with real-time input handling
- `progress` - Animated progress bar demonstration

## Enhanced UI Features

### Interactive Commands

The `interactive` command demonstrates real-time input handling:

- Press `+` to increment counter
- Press `-` to decrement counter
- Press `r` to reset counter
- Press `h` to show a message
- Press `c` to clear message
- Press `q` to quit

### Progress Visualization

The `progress` command shows animated progress bars with:

- Real-time progress updates with spinning indicators
- Status messages that change based on progress
- Visual progress bar with Unicode characters
- Completion indicators

### Colored Output

All commands now feature:

- Color-coded output for better readability
- Bold text for emphasis
- Dimmed text for secondary information
- Consistent styling across all commands

## Development

### Code Style

This project follows modern JavaScript/TypeScript conventions:

- **No semicolons** - Semicolons are discouraged and automatically removed
- **Single quotes** - Use single quotes for strings
- **Tab indentation** - Use tabs with 4-space width for indentation
- **80 character line width** - For readability
- **JSX Support** - Full React JSX support for Ink components

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
│   └── command.ts            # Type definitions with React component support
├── commands/
│   ├── index.ts              # Command registry
│   ├── hello/
│   │   ├── index.tsx         # Hello command with Ink components
│   │   └── hello.test.ts     # Hello command tests
│   ├── version/
│   │   ├── index.tsx         # Version command with Ink components
│   │   └── version.test.ts   # Version command tests
│   ├── example/
│   │   ├── index.tsx         # Example command with Ink components
│   │   └── example.test.ts   # Example command tests
│   ├── interactive/
│   │   └── index.tsx         # Interactive command with state management
│   └── progress/
│       └── index.tsx         # Progress bar command with animations
└── utils/
    ├── cli.ts                # Legacy CLI utility functions
    ├── ink-cli.tsx           # Ink-based CLI utility functions
    └── test-utils.ts         # Test utility functions
```

## Adding New Commands with Ink

The project now supports React components for enhanced UI. Here's how to create a new command with Ink:

### 1. Create a new command subfolder

Create a new directory in `commands/`, e.g., `commands/mycommand/`:

```bash
mkdir commands/mycommand
```

### 2. Create the command implementation with Ink

Create `commands/mycommand/index.tsx`:

```typescript
import { Box, render, Text } from 'npm:ink@4.4.1'
import { Command } from '../../types/command.ts'

const MyCommandComponent = () => (
	<Box flexDirection='column' padding={1}>
		<Box marginBottom={1}>
			<Text bold color='green'>
				My Command Output 🚀
			</Text>
		</Box>

		<Box>
			<Text>This is rendered with Ink and React!</Text>
		</Box>
	</Box>
)

export const myCommand: Command = {
	name: 'mycommand',
	description: 'Description of what your command does',
	execute: () => {
		render(<MyCommandComponent />)
	},
	component: MyCommandComponent,
}
```

### 3. Create tests for your command

Create `commands/mycommand/mycommand.test.ts`:

```typescript
import { assertEquals } from '@std/assert'
import { myCommand } from './index.tsx'

Deno.test('mycommand should have correct name', () => {
	assertEquals(myCommand.name, 'mycommand')
})

Deno.test('mycommand should have a component', () => {
	assertEquals(typeof myCommand.component, 'function')
})
```

### 4. Register the command

Add the import and registration to `commands/index.ts`:

```typescript
import { myCommand } from './mycommand/index.tsx'

// Add this line with the other command registrations
commands.set(myCommand.name, myCommand)
```

### 5. Reinstall the CLI

```bash
deno install --allow-env --allow-read --global --name phastos main.ts -f --config deno.json
```

## Dependencies

This project uses:

- **Deno** - Runtime and package manager
- **Ink** - React for interactive command-line apps
- **React** - UI library for component-based development

## Testing

Run all tests:

```bash
deno task test
```

Run tests in watch mode:

```bash
deno task test:watch
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
