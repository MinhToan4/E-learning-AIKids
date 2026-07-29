import type { Audience } from './community-store'

export type WorkspaceShare = {
  projectId: string
  audiences: Audience[]
}

const key = (childId: string) => `aikids.workspace-sharing.${childId}`

export function readWorkspaceShares(childId: string): WorkspaceShare[] {
  try {
    return JSON.parse(localStorage.getItem(key(childId)) ?? '[]') as WorkspaceShare[]
  } catch {
    return []
  }
}

export function saveWorkspaceShares(childId: string, shares: WorkspaceShare[]): void {
  localStorage.setItem(key(childId), JSON.stringify(shares))
}
