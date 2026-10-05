/** In-memory epoch; never an identity or authorization credential. */
export let sessionGeneration = 0

export function advanceSessionScope(): void {
  sessionGeneration += 1
}
