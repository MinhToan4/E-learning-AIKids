/** In-memory epoch; never an identity or authorization credential. */
export let sessionGeneration = 0
export let sessionOwnerId: string | null = null

export function setSessionOwner(id: string | null): void {
  sessionOwnerId = id
}

export function advanceSessionScope(): void {
  sessionGeneration += 1
}
