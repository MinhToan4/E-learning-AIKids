import { api, ApiError } from '@/shared/lib/api'
import { queryClient } from '@/shared/lib/query-client'
import { sessionGeneration } from '@/shared/lib/session-scope'
import { useAuth } from '@/shared/store/auth'

/** Display-only household projections. Mutations still validate on the server. */
export function readParentResource<T>(path: '/api/parent/children' | '/api/parent/subscription'): Promise<T> {
  const { user, activeContext } = useAuth.getState()
  if (!user || user.role !== 'parent') return api<T>(path)
  return queryClient.fetchQuery({
    queryKey: ['parent-read', user.id, activeContext?.id, sessionGeneration, path],
    queryFn: ({ signal }) => api<T>(path, { signal }),
    staleTime: path === '/api/parent/children' ? 30_000 : 0,
    retry: (count, error) => !(error instanceof ApiError && [401, 403].includes(error.status)) && count < 1,
  })
}
