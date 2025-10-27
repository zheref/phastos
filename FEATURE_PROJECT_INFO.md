# Project Information Feature

This document describes the Project Information feature added to Phastos.

## Overview

When you select a project in the interactive CLI, Phastos now displays comprehensive Git information about the project before showing the operation selection menu.

## Information Displayed

### 1. Current Branch

- Shows the name of the currently checked out branch
- Indicates if you're on the main branch

### 2. Branch Status (when not on main branch)

- **Commits Ahead**: Number of commits your branch is ahead of the main branch
- **Commits Behind**: Number of commits your branch is behind the main branch
- Shows "Up to date" if your branch matches the main branch

### 3. Last Sync from Main Branch

- Shows when the current branch was last updated from the main branch
- Displayed in a human-readable relative format (e.g., "2 days ago", "3 hours ago")

### 4. Uncommitted Changes (Current Changeset)

- Lists all files with uncommitted changes
- Shows the status of each file (Modified, Added, Deleted, Untracked, etc.)
- Displays up to 5 files with a count of additional files if more exist

### 5. Remote Branches Not Synced Locally

- Lists all branches that exist on the remote repository but haven't been checked out locally
- **Sorted by most recent activity** - branches with the newest commits appear first
- Shows up to 5 branches with a count of additional branches if more exist

### 6. Clean State Message

- When there are no uncommitted changes and no unsynced remote branches, displays a "Working directory clean" message

## Usage

Simply run Phastos in interactive mode:

```bash
phastos
```

Then select a project. The project information will be displayed automatically before you choose an operation.

## Related Features

- **Changeset Switching**: See [FEATURE_CHANGESET_SWITCHING.md](FEATURE_CHANGESET_SWITCHING.md) for details on switching between changesets and remote branches

## Technical Details

### New GitService Methods

The following methods were added to `GitService`:

1. **`getChangeset(workingDirectory: string)`**
   - Returns array of changed files with their status

2. **`getLastSyncFromMain(workingDirectory: string, mainBranch: string)`**
   - Returns the date when the current branch was last updated from main
   - Uses git merge-base to find the common ancestor

3. **`getUnsyncedRemoteBranches(workingDirectory: string)`**
   - Returns array of remote branches not synced locally
   - Fetches remote refs first to ensure up-to-date information
   - Retrieves last commit date for each branch
   - Sorts branches by most recent commit date (newest first)

4. **`getBranchDivergence(workingDirectory: string, mainBranch: string)`**
   - Returns object with `ahead` and `behind` commit counts
   - Compares current branch with main branch

### Components

- **`ProjectInfoView`**: React component that displays all the git information in a clean, formatted way
- **`InteractiveView`**: Updated to load and display project information when a project is selected

### Type Definitions

```typescript
export interface ProjectGitInfo {
	currentBranch: string | null
	isMainBranch: boolean
	mainBranch: string | null
	changeset: Array<{ status: string; file: string }>
	lastSyncFromMain: Date | null
	unsyncedRemoteBranches: string[]
	divergence: { ahead: number; behind: number }
}
```

## Example Output

```
Project: MyApp

Branch: feature/new-feature

Status: ↑ 3 commits ahead ↓ 1 commit behind

Last synced with main: 2 days ago

Uncommitted Changes (3):
  [Modified] src/App.tsx
  [Modified] src/components/Button.tsx
  [Untracked] src/utils/helpers.ts

Remote Branches Not Synced Locally (2):
  origin/hotfix/bug-123 (3 hours ago)
  origin/feature/experimental (2 days ago)

Select an operation:
```

## Benefits

- **Better Context**: Know the state of your project before running operations
- **Avoid Mistakes**: See uncommitted changes before running destructive operations
- **Stay Informed**: Keep track of branches and divergence from main
- **Efficient Workflow**: Quickly identify unsynced remote branches
