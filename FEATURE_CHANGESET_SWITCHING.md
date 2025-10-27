# Changeset Switching Feature

This document describes the Changeset Switching feature added to Phastos.

## Overview

The "Switch" operation allows you to quickly switch between local changeset branches or create new changesets from remote branches. This feature streamlines the workflow of managing multiple branches and work-in-progress code.

## What Are Changesets?

In this context, a "changeset" refers to any local branch with the `changeset/` prefix. These are typically work-in-progress branches that you want to organize separately from your main development branches.

## Features

### 1. Switch to Local Changesets

- View all local branches that start with `changeset/`
- See which changeset is currently active (marked with "current")
- Quickly switch to any existing local changeset

### 2. Create Changeset from Remote Branch

- Browse all remote branches (sorted by most recent activity)
- See when each remote branch was last updated (relative timestamps)
- Checkout a remote branch as a new local changeset
- Automatically prefixes the local branch with `changeset/` if not already present

### 3. Smart Sorting

- Remote branches are sorted by most recent commit date (newest first)
- Shows up to 20 remote branches with an indicator if more exist
- Helps you prioritize which branches to work on

## Usage

1. Run Phastos in interactive mode:
   ```bash
   phastos
   ```

2. Select your project

3. Choose "Switch - Switch or create changeset" from the operations menu (located right after "Fresh")

4. You'll see two sections:
   - **Local Changesets**: Your existing `changeset/` branches
   - **Remote Branches**: All remote branches available to checkout

5. Select a branch:
   - **Local changeset**: Switches to that branch immediately
   - **Remote branch**: Creates a new local changeset with the `changeset/` prefix

## Example Workflow

```
Project: MyApp

Switch to an existing changeset or create one from a remote branch:

--- Local Changesets ---
❯ changeset/feature-xyz (current)
  changeset/bugfix-123

--- Remote Branches (Create New Changeset) ---
  origin/feature/new-ui (2 hours ago)
  origin/bugfix/critical-fix (5 hours ago)
  origin/feature/api-integration (1 day ago)
  ... and 15 more

Use arrow keys to navigate, Enter to select, Esc to cancel
```

### Selecting a Local Changeset

When you select `changeset/bugfix-123`:

- Phastos switches to that branch
- Shows success message with logs
- Returns to result screen where you can perform other operations

### Selecting a Remote Branch

When you select `origin/feature/new-ui`:

- Phastos checks out the remote branch
- Creates local branch as `changeset/feature/new-ui`
- Shows success message
- You can now work on this branch locally

## Technical Details

### Architecture

The changeset switching functionality follows the standard Phastos architecture pattern:

1. **OperationController** (`controllers/OperationController.ts`)
   - Contains the `switchChangeset()` method that orchestrates the operation
   - Handles both local branch switching and remote branch checkout
   - Coordinates with GitService for git operations
   - Manages logging and error handling

2. **GitService** (`services/GitService.ts`)
   - Provides low-level git operations used by OperationController
   - New methods added for changeset management

3. **InteractiveView** (`views/InteractiveView.tsx`)
   - Handles UI and user interaction
   - Shows ChangesetSwitchView for branch selection
   - Delegates to OperationController for execution

### New Types

**OperationType** - Added `switch_changeset` operation type

**OperationParameters** - Extended with:

- `branchName?: string` - Branch name to switch to
- `branchType?: 'local' | 'remote'` - Whether it's local or remote
- `localChangesetName?: string` - Custom name for local changeset

### New GitService Methods

1. **`getLocalBranches(workingDirectory: string)`**
   - Returns all local branches in the repository

2. **`getLocalBranchesByPrefix(workingDirectory: string, prefix: string)`**
   - Filters local branches by a prefix (e.g., "changeset/")
   - Used to find all changeset branches

3. **`getAllRemoteBranches(workingDirectory: string, includeDate?: boolean)`**
   - Returns all remote branches sorted by most recent commit date
   - Can optionally include date information for each branch
   - Fetches remote refs to ensure up-to-date information

4. **`checkoutRemoteBranch(workingDirectory: string, remoteBranch: string, localBranchName?: string, logger?: Logger)`**
   - Checks out a remote branch as a new local branch
   - Allows specifying custom local branch name
   - Automatically tracks the remote branch

### OperationController Method

**`switchChangeset(workingDir: string, parameters: OperationParameters)`**

- Validates parameters (requires `branchName`)
- For local branches: calls `gitService.switchToBranch()`
- For remote branches: calls `gitService.checkoutRemoteBranch()`
- Automatically adds `changeset/` prefix to remote branches if not present
- Returns standardized `OperationResult`

### Components

- **`ChangesetSwitchView`**: React component for selecting branches
  - Displays local changesets with current branch indicator
  - Shows remote branches with timestamps
  - Handles separator items for section headers
  - Limits remote branches display to 20 for better UX

### Branch Naming Convention

When creating a changeset from a remote branch:

- Remote branch: `origin/feature/new-ui`
- Local changeset: `changeset/feature/new-ui`

If the remote branch already has a `changeset/` prefix:

- Remote branch: `origin/changeset/existing`
- Local changeset: `changeset/existing` (no double prefix)

## Benefits

- **Quick Context Switching**: Easily jump between different work streams
- **Organized Branches**: Keep changesets separate with clear naming
- **Discovery**: Find and work on remote branches without manual git commands
- **Recency Priority**: See which remote branches are most active
- **Time Awareness**: Know when remote branches were last updated

## Integration with Other Operations

After switching to a changeset, you can:

- View the branch's uncommitted changes
- Run operations like Install, Build, Test, or Run
- Save changes (stash or branch)
- Create fresh changesets from the current state

## Example Usage Flow

1. **Start working on a new feature branch**:
   - Select "Switch"
   - Choose `origin/feature/new-dashboard (3 hours ago)`
   - Phastos creates `changeset/feature/new-dashboard`

2. **Switch between changesets**:
   - Working on feature A, need to check bugfix B
   - Select "Switch"
   - Choose `changeset/bugfix-urgent` from local changesets
   - Instantly switch context

3. **Return to previous work**:
   - Select "Switch"
   - Choose `changeset/feature/new-dashboard (current)` to verify, or another changeset
   - Continue where you left off

## Notes

- The feature fetches remote refs to ensure branch information is current
- If no local changesets exist, only the remote branches section is shown
- If no remote branches exist, only the local changesets section is shown
- The operation tracks and logs all git commands for debugging
- Failed operations show detailed error messages
