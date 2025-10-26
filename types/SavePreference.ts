/**
 * Represents the save preference for uncommitted changes
 * - 'stash': Use git stash to save changes
 * - 'branch': Create a new branch for changes
 */
export type SavePreference = 'stash' | 'branch'
