import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { ZodError } from 'zod'
import { randomUUID } from 'node:crypto'
import { env, SESSION_COOKIE } from './config/env.js'
import { initCache, getRedisCache, closeCache } from './infrastructure/cache/cache.js'
import { loadUserFromRequest } from './infrastructure/session/session.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { courseRoutes } from './modules/catalog/catalog.routes.js'
import { progressRoutes } from './modules/progress/progress.routes.js'
import { portfolioRoutes } from './modules/portfolio/portfolio.routes.js'
import { parentRoutes } from './modules/parent/parent.routes.js'
import { teacherRoutes } from './modules/teacher/teacher.routes.js'
import { adminRoutes } from './modules/admin/admin.routes.js'
import { gamificationRoutes } from './modules/gamification/gamification.routes.js'
import { notificationRoutes } from './modules/notification/notification.routes.js'
import { mediaRoutes } from './modules/media/media.routes.js'
import {
  normalizeApiAliasPrefix,
  rewriteAliasToPrimaryApi,
  seamHealthMeta,
} from './shared/seams/storymee-compat.js'

export async function buildApp() {
  // ── 1. Initialise cache (Redis if available, else InMemory) ──
  await initCache(env.redisUrl)

  const app = Fastify({
    logger: env.nodeEnv !== 'test',
    trustProxy: true,
    // Add request ID for tracing
    genReqId: () => randomUUID(),
  })

  // ── 2. Security middleware ──────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // API-only; FE sets its own CSP if needed
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Allow Google GIS popup postMessage (default same-origin breaks Sign-In)
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })

  // Explicit methods: browser preflight for PATCH /api/auth/me was blocked when
  // Access-Control-Allow-Methods omitted PATCH (onboarding stuck).
  await app.register(cors, {
    origin: env.corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Set-Cookie'],
  })

  await app.register(cookie, {
    secret: env.jwtSecret,
    hook: 'onRequest',
  })

  // ── 3. Rate limiting — Redis backend when available ─────────
  const redisCache = getRedisCache()
  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
    ...(redisCache
      ? {
          redis: redisCache.raw,
        }
      : {}),
  })

  // Stricter limit on auth routes
  app.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url?.startsWith('/api/auth/login') ||
        routeOptions.url?.startsWith('/api/auth/register') ||
        routeOptions.url?.startsWith('/api/auth/forgot') ||
        routeOptions.url?.startsWith('/api/auth/reset') ||
        routeOptions.url === '/api/auth/login/google') {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: {
          max: env.rateLimitMax,
          timeWindow: env.rateLimitWindowMs,
        },
      }
    }
  })

  // ── 4. Auth hook ────────────────────────────────────────────
  app.decorateRequest('user', null)

  app.addHook('onRequest', async (request) => {
    request.user = await loadUserFromRequest(request)
  })

  // ── 5. Error handler: friendly client copy + detailed server logs ─
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      request.log.warn(
        {
          path: request.url,
          method: request.method,
          issues: error.flatten(),
          userId: request.user?.id,
        },
        'validation_error',
      )
      return reply.code(400).send({
        success: false,
        message: 'Thông tin chưa hợp lệ. Kiểm tra lại giúp nhé.',
        error: 'Thông tin chưa hợp lệ. Kiểm tra lại giúp nhé.',
        data: null,
        timestamp: new Date().toISOString(),
      })
    }

    const status =
      typeof (error as { statusCode?: number }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : 500

    const rawMessage = (error as Error).message || 'unknown'
    const logCode = (error as { logCode?: string }).logCode

    if (status >= 500) {
      request.log.error(
        {
          err: error,
          path: request.url,
          method: request.method,
          userId: request.user?.id,
          role: request.user?.role,
          logCode,
          stack: (error as Error).stack,
        },
        'server_error',
      )
    } else {
      request.log.warn(
        {
          path: request.url,
          method: request.method,
          status,
          userId: request.user?.id,
          role: request.user?.role,
          logCode,
          err: rawMessage,
        },
        'client_error',
      )
    }

    // User-facing: friendly Vietnamese, no stack / vendor names
    const friendly =
      status === 401
        ? 'Bạn cần đăng nhập lại nhé.'
        : status === 403
          ? 'Bạn chưa được phép làm việc này.'
          : status === 404
            ? 'Không tìm thấy nội dung này.'
            : status === 402
              ? rawMessage ||
                'Gói học chưa đủ. Ba/mẹ kiểm tra gói gia đình giúp nhé.'
              : status === 429
                ? 'Bạn thao tác hơi nhanh. Chờ một chút rồi thử lại nhé.'
                : status >= 500
                  ? 'Úi, có chút trục trặc. Thử lại sau một lát nhé.'
                  : rawMessage || 'Có lỗi xảy ra. Thử lại giúp nhé.'

    return reply.code(status).send({
      success: false,
      message: friendly,
      error: friendly,
      data: null,
      timestamp: new Date().toISOString(),
    })
  })

  // ── 6. Health check (dual shape: success/data + legacy ok/db) ─
  app.get('/api/health', async () => {
    const redisOk = redisCache ? await redisCache.ping() : false
    const time = new Date().toISOString()
    const seams = seamHealthMeta({
      cookieDomain: env.cookieDomain,
      apiAliasPrefix: env.apiAliasPrefix,
    })
    const data = {
      service: 'aikids-api',
      time,
      db: 'postgresql' as const,
      redis: redisOk,
      supabaseConfigured: Boolean(env.supabaseUrl && env.supabaseAnonKey),
      seams,
    }
    return {
      success: true,
      ok: true,
      message: 'OK',
      data,
      // Legacy top-level fields (tests + older clients)
      service: data.service,
      time: data.time,
      db: data.db,
      redis: data.redis,
      supabaseConfigured: data.supabaseConfigured,
      seams,
      timestamp: time,
    }
  })

  // ── 7. Feature routes ───────────────────────────────────────
  await app.register(authRoutes)
  await app.register(courseRoutes)
  await app.register(progressRoutes)
  await app.register(portfolioRoutes)
  await app.register(parentRoutes)
  await app.register(teacherRoutes)
  await app.register(adminRoutes)
  await app.register(gamificationRoutes)
  await app.register(notificationRoutes)
  await app.register(mediaRoutes)

  /**
   * StoryMee gateway alias (optional).
   * Fastify does not re-route when raw.url is mutated, so we proxy via inject
   * under the configured prefix (default off). Edge rewrite is preferred in prod.
   */
  const apiAlias = normalizeApiAliasPrefix(env.apiAliasPrefix)
  if (apiAlias) {
    app.route({
      method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      url: `${apiAlias}/*`,
      handler: async (request, reply) => {
        const rewritten = rewriteAliasToPrimaryApi(request.url, apiAlias)
        if (!rewritten) {
          return reply.code(404).send({ error: 'Not found' })
        }
        const res = await app.inject({
          method: request.method as
            | 'GET'
            | 'POST'
            | 'PUT'
            | 'PATCH'
            | 'DELETE'
            | 'OPTIONS'
            | 'HEAD',
          url: rewritten,
          headers: request.headers as Record<string, string>,
          payload: request.body as never,
        })
        reply.code(res.statusCode)
        for (const [k, v] of Object.entries(res.headers)) {
          if (v !== undefined && k.toLowerCase() !== 'transfer-encoding') {
            reply.header(k, v as string)
          }
        }
        return reply.send(res.payload)
      },
    })
    // Exact alias root → /api
    app.route({
      method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      url: apiAlias,
      handler: async (request, reply) => {
        const res = await app.inject({
          method: request.method as 'GET',
          url: '/api/health',
          headers: request.headers as Record<string, string>,
        })
        reply.code(res.statusCode)
        return reply.send(res.payload)
      },
    })
  }

  // Explicit cookie name export for tests
  app.decorate('sessionCookieName', SESSION_COOKIE)

  // ── 8. Graceful shutdown ────────────────────────────────────
  app.addHook('onClose', async () => {
    await closeCache()
  })

  return app
}

