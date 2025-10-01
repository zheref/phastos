# Changelog

## [Unreleased]

### Changed
- **BREAKING**: Renamed configuration file from `nprojects.json` to `node_projects.json`
- **BREAKING**: Renamed TypeScript interface from `NProjectsConfig` to `NodeProjectsConfig`
- Updated all documentation to reflect new configuration filename
- Updated README with corrected installation commands and examples

### Added
- Interactive prompt when `node_projects.json` is not found (inspired by Alars)
  - Asks user if they want to create a configuration file (y/n)
  - Prompts for project name with default value
  - Creates `node_projects.json` automatically
  - Shows success message with next steps
- New `InitPromptView.tsx` component for interactive configuration creation
- Support for `ink-text-input` for user input in prompts

### Fixed
- Interactive mode now properly waits for user input (using `waitUntilExit()`)
- Main entry point renamed from `main.ts` to `main.tsx` for proper JSX support
- Updated all JSX pragmas to be at the top of files
- Added `--allow-write` permission to all tasks in `deno.json`
- Updated shebang in `main.tsx` to include all required permissions

## Migration Guide

If you have an existing `nprojects.json` file, simply rename it:

```bash
mv nprojects.json node_projects.json
```

The structure remains identical - only the filename has changed.

## New User Experience

When running `phastos` for the first time:

1. If no `node_projects.json` is found, you'll see:
   ```
   ⚠️  No node_projects.json found
   Would you like to create a configuration file? (y/n)
   ```

2. Press `y` to create one:
   ```
   Creating node_projects.json
   Enter project name (or press Enter for default):
   → my-rn-app
   ```

3. File is created and you can run `phastos` again to start interactive mode

This matches the behavior of Alars with xprojects.json!
