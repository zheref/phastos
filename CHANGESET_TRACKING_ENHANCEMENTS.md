# Changeset Tracking Enhancements

This document describes the enhancements made to properly track and display local changesets and their relationship with remote branches.

## Issues Addressed

### 1. Missing Open Changesets Display

**Problem**: When switching to a changeset from a remote branch, the list of open local changesets was not displayed.

**Solution**: Added a new "Open Changesets" section that displays all local `changeset/` branches with their tracking information.

### 2. Remote Branch Duplication

**Problem**: After creating a local changeset from a remote branch (e.g., `origin/feature/new-ui` → `changeset/feature/new-ui`), the remote branch still appeared in the "Remote Branches Not Synced Locally" list, even though we had a local copy.

**Solution**: Implemented tracking branch detection to filter out remote branches that already have local changesets tracking them.

## Implementation Details

### New GitService Methods

#### 1. `getTrackingBranch(workingDirectory: string, branchName: string)`

Gets the remote tracking branch for a local branch.

```typescript
const tracking = await gitService.getTrackingBranch(
	workingDir,
	'changeset/feature-a',
)
// Returns: 'origin/feature/new-ui' or null
```

Uses `git rev-parse --abbrev-ref ${branchName}@{upstream}` to determine the tracking relationship.

#### 2. `getChangesetsWithTracking(workingDirectory: string, prefix: string)`

Gets all local changesets with their tracking remote branches.

```typescript
const changesets = await gitService.getChangesetsWithTracking(workingDir)
// Returns: [
//   { branch: 'changeset/feature-a', trackingBranch: 'origin/feature/new-ui' },
//   { branch: 'changeset/bugfix-123', trackingBranch: 'origin/bugfix/critical' },
//   { branch: 'changeset/local-work', trackingBranch: null }
// ]
```

### Updated ProjectInfoView

#### New Display Section: "Open Changesets"

Shows all local `changeset/` branches with:

- Branch name highlighted (current branch in green)
- Tracking remote branch (if any) with an arrow indicator
- "(current)" marker for the active changeset

**Example Display:**

```
Open Changesets (3):
  changeset/feature-a → origin/feature/new-ui
  changeset/bugfix-123 → origin/bugfix/critical (current)
  changeset/local-work
```

#### Enhanced Remote Branches List

Remote branches that are already tracked by local changesets are now filtered out, preventing duplicate/confusing entries.

**Before:**

```
Remote Branches Not Synced Locally (3):
  origin/feature/new-ui (2 hours ago)    ← Already have as changeset/feature/new-ui
  origin/bugfix/critical (5 hours ago)   ← Already have as changeset/bugfix-123
  origin/hotfix (1 day ago)
```

**After:**

```
Remote Branches Not Synced Locally (1):
  origin/hotfix (1 day ago)              ← Only truly unsynced branches
```

### Updated InteractiveView

#### 1. Load Changesets with Tracking

When loading project information, now fetches local changesets and their tracking relationships:

```typescript
const localChangesets = await gitService.getChangesetsWithTracking(
	project.workingDirectory,
)
```

#### 2. Filter Remote Branches

Remote branches are filtered based on which ones are already tracked by local changesets:

```typescript
const trackedRemoteBranches = new Set(
	localChangesets
		.map((cs) => cs.trackingBranch)
		.filter((tb) => tb !== null),
)

const unsyncedRemoteBranches = allRemoteBranches
	.filter((item) => !trackedRemoteBranches.has(item.branch))
```

#### 3. Refresh on Navigation

When pressing 'b' (back to operations) from the result screen, project info is automatically reloaded to show updated changeset list:

```typescript
if (input === 'b') {
	if (selectedProject) {
		loadProjectGitInfo(selectedProject) // Refresh!
	}
	setState('operation-selection')
}
```

## Updated Types

### ProjectGitInfo Interface

Added new field for local changesets:

```typescript
export interface ProjectGitInfo {
	// ... existing fields
	localChangesets?: Array<{
		branch: string
		trackingBranch: string | null
	}>
}
```

## User Experience Improvements

### 1. Clear Visibility of Open Work

Users can now see all their open changesets at a glance, including which remote branches they're tracking.

### 2. Accurate Remote Branch List

The remote branch list now accurately shows only branches that don't have local changesets yet, making it clear what's truly "unsynced."

### 3. Seamless Workflow

After switching changesets, the display automatically updates to show the current state, including the new changeset in the list.

### 4. Tracking Transparency

Users can see the relationship between their local changesets and remote branches:

- `changeset/feature-a → origin/feature/new-ui` shows the connection
- `changeset/local-work` (no arrow) shows it's not tracking any remote

## Example Workflow

```
Initial State:
  Open Changesets (1):
    changeset/feature-a → origin/feature/old-work

  Remote Branches Not Synced Locally (2):
    origin/feature/new-ui (2 hours ago)
    origin/hotfix (1 day ago)

User Action: Switch → origin/feature/new-ui
  ↓
  Auto-stashes current work
  ↓
  Creates: changeset/feature/new-ui tracking origin/feature/new-ui
  ↓
  Back to operation selection

Updated State:
  Open Changesets (2):
    changeset/feature-a → origin/feature/old-work
    changeset/feature/new-ui → origin/feature/new-ui (current)

  Remote Branches Not Synced Locally (1):
    origin/hotfix (1 day ago)
```

## Testing

All functionality has been verified:

- ✅ Get local changesets with tracking info
- ✅ Detect tracking relationships correctly
- ✅ Filter remote branches based on local changesets
- ✅ Display updates after changeset operations
- ✅ Current branch indicator works correctly

## Benefits

1. **Reduced Confusion**: Users won't see duplicate entries for branches they already have locally
2. **Better Context**: See all open work and its relationship to remote branches
3. **Accurate State**: Remote branch list accurately reflects what's truly not synced
4. **Automatic Updates**: Information refreshes automatically after operations
5. **Clear Relationships**: Visual indicators show which changesets track which remote branches
