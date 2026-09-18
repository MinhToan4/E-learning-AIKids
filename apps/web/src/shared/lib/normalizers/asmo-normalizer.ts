import type { GatewayRequest } from './common'

export function normalizeAsmoGatewayRequest(
  path: string,
  options: RequestInit = {},
): GatewayRequest | null {
  if (path === '/api/asmo' || path.startsWith('/api/asmo/')) {
    return {
      path: path.replace('/api/asmo', '/api/v1/lms/asmo'),
      options,
    }
  }

  if (path === '/api/admin/asmo' || path.startsWith('/api/admin/asmo/')) {
    return {
      path: path.replace('/api/admin/asmo', '/api/v1/lms/aikids/admin/asmo'),
      options,
    }
  }

  return null
}

export function normalizeAsmoGatewayResponse(
  path: string,
  data: unknown,
): unknown | undefined {
  if (!path.startsWith('/api/asmo') && !path.startsWith('/api/admin/asmo')) {
    return undefined
  }

  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const payload = (body.data !== undefined ? body.data : body)
  return payload
}
