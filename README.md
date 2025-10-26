# Phastos 🚀

**A powerful CLI for managing React Native projects with interactive workflows**

Inspired by [Alars](https://github.com/zheref/Alars) (Xcode project manager), Phastos brings the same seamless workflow automation to React Native development. Manage multiple projects, execute complex build sequences, and streamline your development process with beautiful interactive interfaces.

> _"In the vast cosmos of code, every project is eternal"_

## Features

- 🎨 **Interactive Mode** - Beautiful terminal UI with project and operation selection
- 🎯 **Direct Commands** - Quick execution of operations from the command line
- 📦 **Multi-Project Management** - Configure and manage multiple React Native projects
- 🔄 **Git Integration** - Built-in support for git workflows (stash, branch, pull)
- 🛠️ **Custom Workflows** - Define complex operation sequences in node_projects.json
- 🏗️ **MVC Architecture** - Clean, testable code structure inspired by ExpressJS
- ⚡ **Fast & Lightweight** - Built with Deno for optimal performance
- 🎨 **Beautiful UI** - Powered by Ink for modern terminal interfaces

## Installation

### Prerequisites

- [Deno](https://deno.land/) 1.40+ installed
- React Native development environment set up
- Git (for repository operations)

### Install Globally

```bash
# Clone the repository
git clone https://github.com/zheref/phastos.git
cd phastos

# Install globally
deno task install
```

Or install directly from source:

```bash
deno install --allow-env --allow-read --allow-write --allow-run --global --name phastos --config deno.json main.tsx -f
```

## Quick Start

### 1. Initialize Configuration

Create a `node_projects.json` file in your workspace:

```bash
phastos init
```

This creates a configuration file with a sample project. Edit `node_projects.json` to add your projects:

```json
{
	"version": "1.0",
	"projects": [
		{
			"name": "MyApp",
			"workingDirectory": "./my-app",
			"repositoryURL": "https://github.com/username/my-app.git",
			"configuration": {
				"defaultBranch": "main",
				"savePreference": "stash",
				"packageManager": "npm",
				"defaultPlatform": "ios"
			}
		}
	]
}
```

### 2. Interactive Mode

Launch interactive mode to visually select projects and operations:

```bash
phastos
```

Navigate with arrow keys, select with Enter, and execute operations with beautiful progress indicators.

### 3. Direct Commands

Execute operations directly from the command line:

```bash
# List all configured projects
phastos list

# Run an operation on a specific project
phastos run build --project MyApp
phastos run test --project MyApp
phastos run cosmic-deploy --project MyApp

# Get help
phastos --help
```

## Core Operations

Phastos provides these built-in operations for React Native projects:

| Operation     | Description                                         |
| ------------- | --------------------------------------------------- |
| `clean_slate` | Discard all uncommitted changes (git reset + clean) |
| `save`        | Stash or branch uncommitted changes                 |
| `update`      | Pull latest changes from repository                 |
| `install`     | Install project dependencies (npm/yarn/pnpm/bun)    |
| `pod_install` | Install iOS CocoaPods dependencies                  |
| `build`       | Build the project for iOS/Android                   |
| `test`        | Run test suite                                      |
| `run`         | Run app on simulator/emulator                       |
| `reset`       | Reset React Native Metro bundler cache              |
| `custom`      | Execute custom shell commands                       |

## Custom Commands

Define complex workflows by chaining operations in `node_projects.json`:

```json
{
	"customCommands": [
		{
			"alias": "cosmic-deploy",
			"description": "Complete deployment workflow",
			"operations": [
				{ "type": "clean_slate" },
				{ "type": "update" },
				{ "type": "install" },
				{ "type": "pod_install" },
				{
					"type": "build",
					"parameters": { "platform": "both", "mode": "release" }
				},
				{
					"type": "test",
					"parameters": { "coverage": true }
				}
			]
		},
		{
			"alias": "quick-ios",
			"description": "Quick iOS development setup",
			"operations": [
				{ "type": "install" },
				{ "type": "pod_install" },
				{
					"type": "run",
					"parameters": {
						"platform": "ios",
						"device": "iPhone 15"
					}
				}
			]
		}
	]
}
```

## Configuration Reference

### Project Configuration

```typescript
{
  "name": string,                    // Unique project identifier
  "workingDirectory": string,        // Path to project (relative or absolute)
  "repositoryURL"?: string,          // Git repository URL
  "configuration": {
    "defaultBranch": string,         // Default git branch (e.g., 'main')
    "savePreference": "stash" | "branch",  // How to save changes
    "packageManager"?: "npm" | "yarn" | "pnpm" | "bun",
    "defaultPlatform"?: "ios" | "android" | "both",
    "defaultDevice"?: string,        // Simulator/emulator name
    "iosScheme"?: string,            // iOS build scheme
    "androidFlavor"?: string         // Android build variant
  },
  "customCommands"?: CustomCommand[]
}
```

### Operation Parameters

Operations can be customized with parameters:

```json
{
	"type": "run",
	"description": "Run on iPhone 15",
	"parameters": {
		"platform": "ios",
		"device": "iPhone 15",
		"mode": "debug"
	}
}
```

Available parameters:

- `platform`: `"ios" | "android" | "both"`
- `device`: Simulator/emulator name
- `mode`: `"debug" | "release"`
- `packageManager`: `"npm" | "yarn" | "pnpm" | "bun"`
- `testFile`: Specific test file path
- `coverage`: Enable coverage report (boolean)
- `command`: Shell command (for custom operations)
- `verbose`: Verbose output (boolean)

## Architecture

Phastos follows an MVC architectural pattern similar to ExpressJS:

```
phastos/
├── models/          # Data structures (Project, Operation, etc.)
├── views/           # Ink-based UI components
├── controllers/     # Business logic and operation orchestration
├── services/        # External interactions (Git, React Native, File I/O)
├── commands/        # CLI command implementations
└── types/           # TypeScript type definitions
```

### Key Components

- **Models** (`models/`) - Define data structures for projects and operations
- **Services** (`services/`) - Handle external operations (Git, React Native CLI, File I/O)
- **Controllers** (`controllers/`) - Orchestrate operations using services
- **Views** (`views/`) - Interactive terminal UI components using Ink
- **Commands** (`commands/`) - Individual CLI command implementations

## Development

### Prerequisites

- Deno 1.40+
- Node.js (for React Native operations)

### Setup

```bash
# Clone the repository
git clone https://github.com/zheref/phastos.git
cd phastos

# Run in development mode with file watching
deno task dev

# Run tests
deno task test

# Run tests in watch mode
deno task test:watch

# Format code (enforces style: no semicolons, tabs, single quotes)
deno task fmt

# Lint code
deno task lint
```

### Code Style

This project follows strict formatting conventions:

- **No semicolons** - Automatically removed
- **Single quotes** - For string literals
- **Tab indentation** - 4-space width
- **80 character line width**
- **JSX/TSX support** - Full React component support

### Running Tests

```bash
# All tests
deno task test

# Specific test file
deno test commands/list/list.test.ts --allow-env --allow-read

# Watch mode
deno task test:watch
```

### Adding New Operations

1. Add operation type to `types/OperationType.ts`:

```typescript
export type OperationType =
	| 'existing_types'
	| 'my_new_operation'
```

2. Implement handler in `controllers/OperationController.ts`:

```typescript
case 'my_new_operation':
  return await this.myNewOperation(workingDir, parameters)
```

3. Add service method if needed in `services/`

### Adding New Commands

1. Create command directory: `commands/mycommand/`
2. Implement command in `commands/mycommand/index.tsx`
3. Add tests in `commands/mycommand/mycommand.test.ts`
4. Register in `commands/index.ts`

See existing commands for examples.

## Project Structure

```
phastos/
├── commands/              # CLI commands
│   ├── init/             # Initialize node_projects.json
│   ├── list/             # List projects
│   ├── run/              # Execute operations
│   └── [demo commands]/  # Example commands
├── controllers/          # Operation orchestration
│   └── OperationController.ts
├── models/               # Data models
│   └── Project.ts
├── services/             # External services
│   ├── GitService.ts
│   ├── ReactNativeService.ts
│   └── ProjectLoader.ts
├── views/                # UI components
│   └── InteractiveView.tsx
├── types/                # TypeScript types
│   └── command.ts
├── utils/                # Utility functions
├── main.ts               # Entry point
├── deno.json             # Deno configuration
└── node_projects.example.json # Example configuration
```

## Examples

### Example node_projects.json

See `node_projects.example.json` for a complete configuration example with:

- Multiple projects
- Custom workflows
- Platform-specific configurations
- Advanced operation sequences

### Common Workflows

**Fresh Start (Clean Install)**

```bash
phastos run fresh-start --project MyApp
```

**Quick iOS Development**

```bash
phastos run quick-ios --project MyApp
```

**Release Build**

```bash
phastos run android-release --project MyApp
```

## Comparison with Alars

| Feature         | Alars (Xcode)  | Phastos (React Native) |
| --------------- | -------------- | ---------------------- |
| Platform        | Swift/Xcode    | React Native           |
| Config File     | xprojects.json | node_projects.json     |
| Build System    | Xcode Build    | React Native CLI       |
| Package Manager | CocoaPods      | npm/yarn/pnpm/bun      |
| Runtime         | Swift          | Deno                   |
| UI Framework    | Swift TUI      | Ink (React)            |

## Troubleshooting

### "No node_projects.json found"

Run `phastos init` to create a configuration file.

### Permission Denied

Ensure Deno has the required permissions:

```bash
deno install --allow-env --allow-read --allow-write --allow-run --global --name phastos --config deno.json main.tsx -f
```

### Operation Fails

- Check that your project paths are correct in node_projects.json
- Ensure React Native CLI is properly installed
- Verify Git repository is initialized (for git operations)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes (follow code style)
4. Add tests for new functionality
5. Run `deno task fmt` and `deno task test`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by [Alars](https://github.com/zheref/Alars) by zheref
- Built with [Deno](https://deno.land/)
- UI powered by [Ink](https://github.com/vadimdemedes/ink)
- React Native community for ecosystem tools

## Support

- 📖 [Documentation](https://github.com/zheref/phastos/wiki)
- 🐛 [Issue Tracker](https://github.com/zheref/phastos/issues)
- 💬 [Discussions](https://github.com/zheref/phastos/discussions)

---

**Made with ❤️ for the React Native community**
