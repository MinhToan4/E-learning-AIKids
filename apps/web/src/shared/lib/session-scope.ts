/** In-memory epoch; never an identity or authorization credential. */
export let sessionGeneration = 0
export let sessionOwnerId: string | null = null

const sessionResetHandlers = new Set<() => void>()

export function registerSessionResetHandler(handler: () => void): () => void {
  sessionResetHandlers.add(handler)
  return () => {
    sessionResetHandlers.delete(handler)
  }
}

export function setSessionOwner(id: string | null): void {
  sessionOwnerId = id
}

export function advanceSessionScope(): void {
  sessionGeneration += 1
  for (const handler of sessionResetHandlers) {
    try {
      handler()
    } catch {
      // Safe no-op on handler errors
    }
  }
}
