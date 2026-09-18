import { ApiError } from './api'
import {
  type GatewayRequest,
  recordValue,
} from './normalizers/common'
import {
  normalizeAuthGatewayRequest,
  normalizeAuthGatewayResponse,
} from './normalizers/auth-normalizer'
import {
  normalizeLearningGatewayRequest,
  normalizeLearningGatewayResponse,
} from './normalizers/learning-normalizer'
import {
  normalizeGamificationGatewayRequest,
  normalizeGamificationGatewayResponse,
} from './normalizers/gamification-normalizer'
import {
  normalizeAsmoGatewayRequest,
  normalizeAsmoGatewayResponse,
} from './normalizers/asmo-normalizer'

export type { GatewayRequest }
export * from './normalizers/common'
export * from './normalizers/auth-normalizer'
export * from './normalizers/learning-normalizer'
export * from './normalizers/gamification-normalizer'
export * from './normalizers/asmo-normalizer'

/** Exposed for route-map diagnostics and contract tests; network calls still use api(). */
export function normalizeGatewayRequest(path: string, options: RequestInit = {}): GatewayRequest {
  if (path.startsWith('/api/v1/')) return { path, options }

  // 1. ASMO domain
  const asmoReq = normalizeAsmoGatewayRequest(path, options)
  if (asmoReq) return asmoReq

  // 2. Gamification domain
  const gamificationReq = normalizeGamificationGatewayRequest(path, options)
  if (gamificationReq) return gamificationReq

  // 3. Auth & Account domain
  const authReq = normalizeAuthGatewayRequest(path, options)
  if (authReq) return authReq

  // 4. Learning & LMS domain
  const learningReq = normalizeLearningGatewayRequest(path, options)
  if (learningReq) return learningReq

  // System & Admin core fallbacks
  if (path === '/api/admin/system' || path === '/api/admin/analytics') {
    return { path: '/api/v1/system/aikids/admin/summary', options }
  }

  throw new ApiError(
    501,
    'Tính năng này đang được chuyển sang StoryMee Backend.',
    { code: 'FEATURE_NOT_AVAILABLE', legacyPath: path },
  )
}

export function normalizeGatewayResponse(path: string, data: unknown): unknown {
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const payload = (body.data && typeof body.data === 'object'
    ? body.data
    : body) as Record<string, unknown>

  // 1. System summary
  if (path === '/api/admin/system') return { system: payload.system }
  if (path === '/api/admin/analytics') return { analytics: payload.analytics }

  // 2. ASMO domain
  const asmoRes = normalizeAsmoGatewayResponse(path, data)
  if (asmoRes !== undefined) return asmoRes

  // 3. Gamification domain
  const gamificationRes = normalizeGamificationGatewayResponse(path, data)
  if (gamificationRes !== undefined) return gamificationRes

  // 4. Auth & Account domain
  const authRes = normalizeAuthGatewayResponse(path, data)
  if (authRes !== undefined) return authRes

  // 5. Learning & LMS domain
  const learningRes = normalizeLearningGatewayResponse(path, data)
  if (learningRes !== undefined) return learningRes

  return payload
}
