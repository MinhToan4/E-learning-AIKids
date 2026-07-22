function databaseIdentity(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
      return null
    }
    return [
      url.protocol,
      url.username,
      url.hostname.toLowerCase(),
      url.port || '5432',
      url.pathname.replace(/\/$/, ''),
    ].join('|')
  } catch {
    return null
  }
}

/**
 * Integration tests may migrate and mutate data, so an explicit database with
 * a different identity from the application database is mandatory.
 */
export function selectIsolatedTestDatabase(
  testDatabaseUrl: string | undefined,
  applicationDatabaseUrl: string | undefined,
): string | null {
  const candidate = testDatabaseUrl?.trim()
  if (!candidate) return null

  const testIdentity = databaseIdentity(candidate)
  if (!testIdentity) return null

  const applicationIdentity = applicationDatabaseUrl
    ? databaseIdentity(applicationDatabaseUrl)
    : null
  if (applicationIdentity && applicationIdentity === testIdentity) return null

  return candidate
}
