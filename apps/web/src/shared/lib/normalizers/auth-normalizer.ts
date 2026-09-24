import { clearAccessToken, setAccessToken, type User } from '../api'
import { createUuid } from '../uuid'
import {
  type GatewayRequest,
  jsonBody,
  withJson,
  recordValue,
  mapUser,
} from './common'

export function normalizeAuthGatewayRequest(
  path: string,
  options: RequestInit = {},
): GatewayRequest | null {
  const body = jsonBody(options)

  const direct: Record<string, string> = {
    '/api/auth/me': '/api/v1/account/me',
    '/api/auth/logout': '/api/v1/account/logout',
    '/api/auth/forgot-password': '/api/v1/account/forgot-password',
    '/api/auth/reset-password': '/api/v1/account/reset-password',
    '/api/auth/change-password': '/api/v1/account/me/password',
    '/api/auth/access': '/api/v1/account/me/access',
    '/api/auth/context': '/api/v1/account/me/contexts/select',
    '/api/auth/tenant': '/api/v1/account/tenant/resolve',
  }

  if (direct[path]) {
    if (path === '/api/auth/reset-password') {
      return {
        path: direct[path],
        options: withJson(options, {
          token: body.token,
          newPassword: body.password,
        }),
      }
    }
    if (path === '/api/auth/change-password') {
      return {
        path: direct[path],
        options: withJson(options, {
          oldPassword: body.currentPassword,
          newPassword: body.newPassword,
        }),
      }
    }
    return { path: direct[path], options }
  }

  if (path === '/api/auth/login/student') {
    return {
      path: '/api/v1/account/family/child-login',
      options: withJson(options, {
        familyCode: body.familyCode,
        nickname: body.nickname,
        pin: body.pin,
      }),
    }
  }

  if (path === '/api/auth/google/config') {
    return { path: '/api/v1/account/auth/google/config', options }
  }

  if (path === '/api/auth/firebase/config') {
    return { path: '/api/v1/account/auth/firebase/config', options }
  }

  if (path === '/api/auth/firebase/custom-token') {
    return { path: '/api/v1/account/auth/firebase/custom-token', options }
  }

  if (path === '/api/auth/login/firebase') {
    return { path: '/api/v1/account/auth/firebase/session', options }
  }

  if (path === '/api/auth/login/google') {
    return { path: '/api/v1/account/auth/google', options }
  }

  if (path === '/api/auth/login/child-profile') {
    const childId = String(body.childId ?? '').trim()
    return {
      path: `/api/v1/account/family/children/${encodeURIComponent(childId)}/session`,
      options,
    }
  }

  if (path === '/api/auth/login/adult') {
    return {
      path: '/api/v1/account/login',
      options: withJson(options, {
        login: body.login ?? body.email,
        password: body.password,
      }),
    }
  }

  if (path === '/api/auth/register/adult') {
    return {
      path: '/api/v1/account/register',
      options: withJson(options, {
        email: body.email,
        password: body.password,
        name: body.nickname,
        asParent: true,
        parentalConsentAccepted: body.parentalConsentAccepted === true,
      }),
    }
  }

  if (path === '/api/profile/settings') {
    return { path: '/api/v1/account/profiles/me/settings', options }
  }

  const publicProfile = path.match(/^\/api\/public\/profiles\/([^/?]+)$/)
  if (publicProfile) {
    return {
      path: `/api/v1/account/profiles/${encodeURIComponent(publicProfile[1])}`,
      options,
    }
  }

  const publicProfileShare = path.match(/^\/api\/public\/profile-shares\/([^/?]+)$/)
  if (publicProfileShare) {
    return {
      path: `/api/v1/account/public/profile-shares/${encodeURIComponent(publicProfileShare[1])}`,
      options,
    }
  }

  if (path === '/api/account/workspaces') {
    return { path: '/api/v1/account/workspaces', options }
  }

  const workspaceGrants = path.match(/^\/api\/account\/workspaces\/([^/?]+)\/grants$/)
  if (workspaceGrants) {
    return {
      path: `/api/v1/account/workspaces/${encodeURIComponent(workspaceGrants[1])}/grants`,
      options,
    }
  }

  const sharedWorkspace = path.match(/^\/api\/public\/workspaces\/([^/?]+)$/)
  if (sharedWorkspace) {
    return {
      path: `/api/v1/account/shared-workspaces/${encodeURIComponent(sharedWorkspace[1])}`,
      options,
    }
  }

  if (path === '/api/parent/plans') {
    return { path: '/api/v1/billing/plans', options }
  }

  if (path === '/api/parent/subscription') {
    if ((options.method ?? 'GET').toUpperCase() === 'POST') {
      const plan = String(body.planCode ?? '')
      const headers = new Headers(options.headers)
      const key = `aikids-plan-${plan}-${createUuid()}`
      headers.set('Idempotency-Key', key)
      const refCode = body.refCode ?? body.ref_code
      return {
        path: '/api/v1/billing/me/checkout',
        options: {
          ...withJson(options, {
            plan,
            idempotencyKey: key,
            ...(refCode !== undefined ? { refCode } : {}),
          }),
          headers,
        },
      }
    }
    return { path: '/api/v1/billing/me/subscription', options }
  }

  if (path === '/api/parent/course-checkout') {
    const headers = new Headers(options.headers)
    if (!headers.has('Idempotency-Key')) {
      headers.set('Idempotency-Key', createUuid())
    }
    return {
      path: '/api/v1/billing/me/course-checkout',
      options: { ...options, headers },
    }
  }

  const courseCheckout = path.match(/^\/api\/parent\/course-checkout\/([^/?]+)$/)
  if (courseCheckout) {
    return {
      path: `/api/v1/billing/me/course-checkout/${encodeURIComponent(courseCheckout[1])}`,
      options,
    }
  }

  if (path === '/api/parent/children') {
    const childPin = typeof body.pin === 'string' ? body.pin.trim() : ''
    return {
      path: '/api/v1/account/family/children',
      options: options.method === 'POST'
        ? withJson(options, {
          name: body.nickname,
          ageBand: body.ageBand ?? '8-11',
          avatarUrl: body.avatarId,
          language: 'vi',
          allowAiCreate: true,
          allowPhoto: true,
          allowExport: true,
          password: createUuid(),
          ...(childPin ? { pin: childPin } : {}),
        })
        : options,
    }
  }

  if (path === '/api/parent/family-login-code') {
    return { path: '/api/v1/account/family/login-code', options }
  }

  if (path === '/api/parent/profile') {
    return { path: '/api/v1/account/parent-profile', options }
  }

  if (path === '/api/parent/gate/verify') {
    return { path: '/api/v1/account/family/gate-verify', options }
  }

  if (path === '/api/parent/profile-shares') {
    return { path: '/api/v1/account/family/profile-shares', options }
  }

  const parentProfileShare = path.match(/^\/api\/parent\/profile-shares\/([^/?]+)$/)
  if (parentProfileShare) {
    return {
      path: `/api/v1/account/family/profile-shares/${encodeURIComponent(parentProfileShare[1])}`,
      options,
    }
  }

  const child = path.match(/^\/api\/parent\/children\/([^/?]+)$/)
  if (child) {
    return {
      path: `/api/v1/account/family/children/${encodeURIComponent(child[1])}`,
      options: options.method === 'PATCH'
        ? withJson(options, {
          name: body.nickname,
          avatarUrl: body.avatarId,
          ageBand: body.ageBand,
        })
        : options,
    }
  }

  const childPin = path.match(/^\/api\/parent\/children\/([^/?]+)\/pin$/)
  if (childPin) {
    return {
      path: `/api/v1/account/family/children/${encodeURIComponent(childPin[1])}/pin`,
      options,
    }
  }

  const childConsentEvents = path.match(/^\/api\/parent\/children\/([^/?]+)\/consent\/events$/)
  if (childConsentEvents) {
    return {
      path: `/api/v1/account/family/children/${encodeURIComponent(childConsentEvents[1])}/consent/events`,
      options,
    }
  }

  const childConsent = path.match(/^\/api\/parent\/children\/([^/?]+)\/consent$/)
  if (childConsent) {
    return {
      path: `/api/v1/account/family/children/${encodeURIComponent(childConsent[1])}/consent`,
      options,
    }
  }

  if (/^\/api\/admin\/users(?:\/[^/?]+)*(?:\?.*)?$/.test(path) ||
      /^\/api\/admin\/login-logs(?:\?.*)?$/.test(path)) {
    const isAdminUserPatch = /^\/api\/admin\/users\/[^/?]+$/.test(path) &&
      (options.method ?? 'GET').toUpperCase() === 'PATCH'
    return {
      path: path.replace('/api/admin', '/api/v1/account/admin'),
      options: path === '/api/admin/users' &&
        (options.method ?? 'GET').toUpperCase() === 'POST'
        ? withJson(options, { ...body, name: body.nickname })
        : isAdminUserPatch
          ? withJson(options, {
            ...body,
            name: body.nickname,
            role: body.role === 'student' ? 'user' : body.role,
          })
          : options,
    }
  }

  if (/^\/api\/admin\/billing(?:\/.*)?$/.test(path)) {
    return {
      path: path.replace('/api/admin/billing', '/api/v1/billing/admin'),
      options,
    }
  }

  return null
}

export function normalizeAuthGatewayResponse(
  path: string,
  data: unknown,
): unknown | undefined {
  const isAuthRoute =
    path.startsWith('/api/auth') ||
    path.startsWith('/api/profile') ||
    path.startsWith('/api/public/profile') ||
    path.startsWith('/api/public/workspace') ||
    path.startsWith('/api/account') ||
    path.startsWith('/api/parent/profile') ||
    path.startsWith('/api/parent/gate') ||
    path.startsWith('/api/parent/family') ||
    path.startsWith('/api/parent/course-checkout') ||
    path.startsWith('/api/parent/plans') ||
    path.startsWith('/api/parent/subscription') ||
    path.startsWith('/api/admin/users') ||
    path.startsWith('/api/admin/login-logs') ||
    path.startsWith('/api/admin/billing') ||
    path.startsWith('/api/v1/billing/admin') ||
    (path.startsWith('/api/parent/children') && !path.includes('/courses') && !path.includes('/progress'))

  if (!isAuthRoute) return undefined

  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const payload = (body.data && typeof body.data === 'object'
    ? body.data
    : body) as Record<string, unknown>

  if (path === '/api/parent/course-checkout') {
    return {
      ...payload,
      checkout: recordValue(body.checkout),
      ...(body.message ? { message: String(body.message) } : {}),
    }
  }

  if (path === '/api/auth/login/child-profile') {
    const token = String(payload.token ?? payload.accessToken ?? '')
    if (token) setAccessToken(token)
    const child = recordValue(payload.child)
    const consent = (child.parentalConsent && typeof child.parentalConsent === 'object'
      ? child.parentalConsent
      : child.consent && typeof child.consent === 'object'
        ? child.consent
        : child) as Record<string, unknown>
    return {
      user: {
        ...mapUser({
          ...child,
          actor: 'child',
          name: child.name,
          parentId: recordValue(payload.parent).id,
          onboarded: true,
        }),
        allowAiCreate: consent.allowAiCreate === true,
        allowPhoto: consent.allowPhoto === true,
        allowExport: consent.allowExport === true,
      },
    }
  }

  if (path.startsWith('/api/auth/login/') || path === '/api/auth/register/adult') {
    const token = String(payload.token ?? payload.accessToken ?? body.token ?? body.accessToken ?? '')
    if (token) setAccessToken(token)
    const rawUser = (payload.user ?? body.user ?? payload) as Record<string, unknown>
    const baseUser = mapUser(rawUser)
    const childPayload = (payload.child && typeof payload.child === 'object' ? payload.child : null) as Record<string, unknown> | null
    if (childPayload) {
      const consent = (childPayload.parentalConsent && typeof childPayload.parentalConsent === 'object'
        ? childPayload.parentalConsent
        : childPayload.consent && typeof childPayload.consent === 'object'
          ? childPayload.consent
          : childPayload) as Record<string, unknown>
      return {
        user: {
          ...baseUser,
          allowAiCreate: consent.allowAiCreate === true,
          allowPhoto: consent.allowPhoto === true,
          allowExport: consent.allowExport === true,
        },
      }
    }
    return { user: baseUser }
  }

  if (path === '/api/auth/me' && (payload.user || payload.id)) {
    return { user: mapUser((payload.user ?? payload) as Record<string, unknown>) }
  }

  if (path === '/api/auth/logout') {
    clearAccessToken()
    return payload
  }

  if (path === '/api/auth/context') {
    const token = String(payload.accessToken ?? payload.token ?? '')
    if (token) setAccessToken(token)
    return payload
  }

  if (path === '/api/parent/gate/verify') {
    const token = String(payload.token ?? payload.accessToken ?? '')
    if (token) setAccessToken(token)
    return {
      user: mapUser(recordValue(payload.user)),
      message: String(payload.message ?? 'Parent password verified'),
    }
  }

  if (path === '/api/parent/profile') {
    return {
      profile: {
        ...recordValue(payload.profile),
        ...recordValue(payload.user),
        maxChildren: Number(recordValue(payload.profile).maxChildren ?? 0),
      },
      familyCode: payload.familyCode ? String(payload.familyCode) : undefined,
    }
  }

  if (path === '/api/parent/family-login-code') {
    return { familyCode: String(payload.familyCode ?? body.familyCode ?? '') }
  }

  if (path === '/api/parent/children' && Array.isArray(payload.children)) {
    return {
      children: payload.children.map((item) => {
        const row = item as Record<string, unknown>
        const consent = (row.parentalConsent && typeof row.parentalConsent === 'object'
          ? row.parentalConsent
          : row.consent && typeof row.consent === 'object'
            ? row.consent
            : {}) as Record<string, unknown>
        return {
          ...row,
          nickname: row.name ? String(row.name) : null,
          avatarId: row.avatarUrl ? String(row.avatarUrl) : null,
          active: true,
          level: Number(row.level ?? 1),
          xp: Number(row.xp ?? 0),
          hasPin: row.hasPin === true,
          allowAiCreate: consent.allowAiCreate === true,
          allowPhoto: consent.allowPhoto === true,
          allowExport: consent.allowExport === true,
        }
      }),
    }
  }

  const childPinMatch = path.match(/^\/api\/parent\/children\/([^/?]+)\/pin$/)
  if (childPinMatch) {
    return {
      id: childPinMatch[1],
      pinSet: true,
      message: 'Mã PIN đã được cập nhật thành công.',
    }
  }

  if ((path === '/api/parent/children' || /^\/api\/parent\/children\/[^/?]+$/.test(path)) && payload.child) {
    const row = payload.child as Record<string, unknown>
    const consent = (row.parentalConsent && typeof row.parentalConsent === 'object'
      ? row.parentalConsent
      : row.consent && typeof row.consent === 'object'
        ? row.consent
        : {}) as Record<string, unknown>
    return {
      child: {
        ...row,
        nickname: row.name ? String(row.name) : null,
        avatarId: row.avatarUrl ? String(row.avatarUrl) : null,
        allowAiCreate: consent.allowAiCreate === true,
        allowPhoto: consent.allowPhoto === true,
        allowExport: consent.allowExport === true,
      },
    }
  }

  // Admin Billing
  if (
    path === '/api/v1/billing/admin/plans' ||
    path === '/api/admin/billing/plans' ||
    /^\/api\/(?:v1\/billing\/admin|admin\/billing)\/plans(?:\/[^/?]+\/toggle)?(?:\?.*)?$/.test(path)
  ) {
    if (Array.isArray(body.data)) return body.data
    if (Array.isArray(payload)) return payload
    if (body.data && typeof body.data === 'object') {
      return {
        ...body.data,
        ...(body.message ? { message: String(body.message) } : {}),
      }
    }
    return payload
  }
  if (path === '/api/v1/billing/admin/subscriptions/stats' || path === '/api/admin/billing/subscriptions/stats') {
    return {
      stats: recordValue(payload.stats),
      plans: Array.isArray(payload.plans) ? payload.plans : [],
    }
  }
  if (/^\/api\/(?:v1\/billing\/admin|admin\/billing)\/subscriptions(?:\?.*)?$/.test(path)) {
    return Array.isArray(body.data) ? body.data : (Array.isArray(payload) ? payload : [])
  }
  if (path === '/api/v1/billing/admin/subscriptions/pending-intents' || path === '/api/admin/billing/subscriptions/pending-intents') {
    return Array.isArray(body.data) ? body.data : (Array.isArray(payload) ? payload : [])
  }
  if (
    path === '/api/v1/billing/admin/subscriptions/checkout' ||
    path === '/api/admin/billing/subscriptions/checkout' ||
    path === '/api/v1/billing/admin/subscriptions/grant' ||
    path === '/api/admin/billing/subscriptions/grant' ||
    /^\/api\/(?:v1\/billing\/admin|admin\/billing)\/subscriptions\/intents\/[^/?]+\/complete$/.test(path)
  ) {
    return {
      status: String(body.status ?? payload.status ?? 'success'),
      message: String(body.message ?? payload.message ?? ''),
      data: (body.data && typeof body.data === 'object' ? body.data : payload) as Record<string, unknown>,
    }
  }
  if (path === '/api/parent/plans') {
    const rows = Array.isArray(body.data) ? body.data as Array<Record<string, unknown>> : []
    return {
      plans: rows.map((row) => ({
        code: String(row.id ?? ''),
        name: String(row.name ?? ''),
        tagline: String(row.tagline ?? ''),
        maxChildren: Number(row.maxChildren ?? 0),
        maxOpenCoursesPerChild: Number(row.maxOpenCoursesPerChild ?? 0),
        priceMonthly: Number(row.amountMinor ?? 0),
        currency: String(row.currency ?? 'vnd').toUpperCase(),
        features: Array.isArray(row.features) ? row.features.map(String) : [],
      })),
    }
  }
  if (path === '/api/parent/subscription') {
    const subscription = recordValue(payload.subscription ?? payload)
    const plan = recordValue(subscription.planDef)
    const planCode = String(subscription.plan ?? plan.id ?? 'free')
    const maxChildren = Number(plan.maxChildren ?? 0)
    return {
      subscription: {
        planCode,
        planName: String(plan.name ?? planCode),
        status: String(subscription.status ?? 'pending'),
        maxChildren,
        maxOpenCoursesPerChild: Number(plan.maxOpenCoursesPerChild ?? 0),
        childCount: 0,
        seatsRemaining: maxChildren,
        features: Array.isArray(plan.features) ? plan.features.map(String) : [],
        currentPeriodEnd: subscription.expiresAt
          ? String(subscription.expiresAt)
          : null,
      },
      message: typeof body.message === 'string' ? body.message : '',
      checkout: body.checkout,
    }
  }

  // Admin users
  if (/^\/api\/admin\/users(?:\?.*)?$/.test(path)) {
    const rows = (
      Array.isArray(body.data)
        ? body.data
        : Array.isArray(payload.users)
          ? payload.users
          : Array.isArray(body.users)
            ? body.users
            : Array.isArray(data)
              ? data
              : []
    ) as Array<Record<string, unknown>>
    return {
      users: rows.map((row) => ({
        ...row,
        nickname: row.name ? String(row.name) : null,
        level: Number(row.level ?? 1),
        xp: Number(row.xp ?? 0),
        guardianParent: (row.guardianParent && typeof row.guardianParent === 'object')
          ? row.guardianParent
          : null,
        children: Array.isArray(row.children) ? row.children : [],
        childrenCount: typeof row.childrenCount === 'number'
          ? row.childrenCount
          : (Array.isArray(row.children) ? row.children.length : 0),
      })),
    }
  }
  if (path === '/api/admin/login-logs' &&
      (body.data && typeof body.data === 'object') &&
      'deleted' in recordValue(body.data)) {
    const deleted = Number(recordValue(body.data).deleted ?? 0)
    return { deleted, message: `Đã xóa ${deleted} bản ghi đăng nhập` }
  }
  if (/^\/api\/admin\/login-logs(?:\?.*)?$/.test(path)) {
    const rows = Array.isArray(body.data) ? body.data as Array<Record<string, unknown>> : []
    const byOutcome = rows.reduce<Record<string, number>>((summary, row) => {
      const outcome = String(row.outcome ?? 'unknown')
      summary[outcome] = (summary[outcome] ?? 0) + 1
      return summary
    }, {})
    return {
      logs: rows.map((row) => ({
        ...row,
        email: row.login ?? null,
        ipAddress: row.ip ?? null,
        reason: null,
      })),
      summary: {
        total: rows.length,
        byOutcome,
        windowHours: 24 * 30,
        purgedAt: new Date().toISOString(),
      },
    }
  }

  if (/^\/api\/admin\/users\/[^/?]+$/.test(path)) {
    const rawUser = recordValue(payload.user ?? payload)
    const mapped = mapUser(rawUser)
    const actor = String(rawUser.actor ?? rawUser.role ?? 'parent')
    const role = actor === 'child' || actor === 'student' ? 'student' :
      actor === 'teacher' ? 'teacher' :
        actor === 'admin' ? 'admin' : 'parent'
    return {
      ...mapped,
      role,
      email: rawUser.email ? String(rawUser.email) : null,
      createdAt: String(rawUser.createdAt ?? ''),
      lastLoginAt: rawUser.lastLoginAt ? String(rawUser.lastLoginAt) : null,
      loginCount: Number(rawUser.loginCount ?? 0),
    }
  }

  return payload
}
