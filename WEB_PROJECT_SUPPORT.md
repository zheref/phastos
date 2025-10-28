# Web Project Support Implementation

This document describes the implementation of web project support (Vite and Next.js) for Phastos.

## Overview

Phastos CLI now supports three toolchain types:

- **react-native**: React Native mobile apps (iOS/Android) - original support
- **vite**: Vite-based React web applications
- **nextjs**: Next.js React web applications

## Architecture Changes

### 1. New Type System

**`types/Toolchain.ts`**

- Defines the `Toolchain` type: `'react-native' | 'vite' | 'nextjs'`

**`types/ProjectConfiguration.ts`**

- Added optional `toolchain` field to project configuration
- Defaults to `'react-native'` for backward compatibility
- Toolchain-specific fields marked for clarity

**`types/Platform.ts`**

- Extended `Platform` type to include `'web'` option
- Supports: `'ios' | 'android' | 'web' | 'both'`

### 2. Service Layer Architecture

**`services/ToolchainService.ts`** (NEW)

- Abstract interface defining common operations across all toolchains
- Implemented by ReactNativeService, ViteService, and NextJSService
- Standardizes: `install`, `build`, `run`, `test`, `reset`, `clean`, `runScript`, `executeCustomCommand`

**`services/ToolchainServiceFactory.ts`** (NEW)

- Factory pattern to get appropriate toolchain service
- Routes to correct service based on `project.configuration.toolchain`

**`services/ViteService.ts`** (NEW)

- Implements `ToolchainService` for Vite projects
- Handles: dev server, production builds, testing, cache clearing
- Removes `.vite` cache and `dist` folders on clean

**`services/NextJSService.ts`** (NEW)

- Implements `ToolchainService` for Next.js projects
- Handles: dev server, production builds, testing, cache clearing
- Removes `.next` cache and `out` folders on clean

**`services/ReactNativeService.ts`** (UPDATED)

- Now implements `ToolchainService` interface
- Updated method signatures to match interface:
  - `build(mode, platform)` instead of `build(platform, mode)`
  - `run(platform, device, mode)` accepts `'development' | 'production'` instead of `'debug' | 'release'`
- Converts development/production modes to debug/release internally for React Native

### 3. Controller Updates

**`controllers/OperationController.ts`**

- Updated to be toolchain-aware
- All operation methods now receive `project` parameter
- Uses `ToolchainServiceFactory.getService()` to get appropriate service
- Maintains backward compatibility with React Native projects

### 4. Default Configuration

**`models/DefaultConfig.ts`**

- Added `toolchain: 'react-native'` to default configuration
- Ensures backward compatibility for existing projects

## Usage Examples

### React Native Project

```json
{
	"name": "MyRNApp",
	"workingDirectory": "./my-app",
	"configuration": {
		"toolchain": "react-native",
		"defaultPlatform": "ios",
		"defaultDevice": "iPhone 15 Pro"
	}
}
```

### Vite Project

```json
{
	"name": "MyViteApp",
	"workingDirectory": "./my-vite-app",
	"configuration": {
		"toolchain": "vite",
		"packageManager": "pnpm"
	}
}
```

### Next.js Project

```json
{
	"name": "MyNextApp",
	"workingDirectory": "./my-next-app",
	"configuration": {
		"toolchain": "nextjs",
		"packageManager": "npm"
	}
}
```

## Operation Mapping

### Universal Operations (All Toolchains)

- `clean_slate`: Git reset + clean
- `save`: Stash or branch changes
- `update`: Pull latest changes
- `install`: Install dependencies
- `build`: Build for production
- `test`: Run test suite
- `run`: Start development server/simulator
- `reset`: Clear project cache
- `run_script`: Run package.json scripts
- `custom`: Execute custom commands

### React Native Specific

- `pod_install`: Install CocoaPods dependencies (iOS only)

## Implementation Notes

### Mode Conversion

- Web tools use: `development` or `production`
- React Native uses: `debug` or `release`
- ReactNativeService converts internally:
  - `production` → `release`
  - `development` → `debug`

### Platform Handling

- React Native: `ios`, `android`, or `both`
- Vite/Next.js: Platform parameter ignored (always web)

### Build Outputs

- Vite: Builds to `dist/` directory
- Next.js: Builds to `.next/` and optionally `out/` (static export)
- React Native: Platform-specific build directories

### Development Servers

- Vite: `http://localhost:5173` (default)
- Next.js: `http://localhost:3000` (default)
- React Native: Launches on simulator/emulator

## Testing the Implementation

To add a Vite or Next.js project:

1. Create the project (outside of Phastos)
2. Add configuration to `node_projects.json`:

```json
{
	"name": "MyWebApp",
	"workingDirectory": "../path/to/project",
	"configuration": {
		"toolchain": "vite", // or "nextjs"
		"packageManager": "npm"
	}
}
```

3. Use it via CLI:

```bash
phastos run build --project MyWebApp
phastos run run --project MyWebApp
phastos run test --project MyWebApp
```

## Backward Compatibility

- All existing React Native projects continue to work without changes
- Default `toolchain` value is `'react-native'`
- Projects without `toolchain` field default to React Native behavior
- All existing operations remain functional

## Future Enhancements

Possible additions:

- [ ] Remix support
- [ ] SvelteKit support
- [ ] Nuxt.js support
- [ ] Project auto-detection (automatically set toolchain from project structure)
- [ ] Build mode customization per project
- [ ] Deployment operations (Vercel, Netlify, etc.)
