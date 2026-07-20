import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { ZodError } from 'zod'
import { env, SESSION_COOKIE } from './config/env.js'
import { loadUserFromRequest } from './infrastructure/session/session.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { courseRoutes } from './modules/catalog/catalog.routes.js'
import { progressRoutes } from './modules/progress/progress.routes.js'
import { portfolioRoutes } from './modules/portfolio/portfolio.routes.js'
import { parentRoutes } from './modules/parent/parent.routes.js'
import { teacherRoutes } from './modules/teacher/teacher.routes.js'
import { adminRoutes } from './modules/admin/admin.routes.js'

export async function buildApp() {
  const app = Fastify({
    logger: env.nodeEnv !== 'test',
    trustProxy: true,
  })

  await app.register(helmet, {
    contentSecurityPolicy: false, // API-only; FE sets its own CSP if needed
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })

  await app.register(cors, {
    origin: env.corsOrigin,
    credentials: true,
  })

  await app.register(cookie, {
    secret: env.jwtSecret,
    hook: 'onRequest',
  })

  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
  })

  // Stricter limit on auth
  app.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url?.startsWith('/api/auth/login') ||
        routeOptions.url?.startsWith('/api/auth/register')) {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: {
          max: env.rateLimitMax,
          timeWindow: env.rateLimitWindowMs,
        },
      }
    }
  })

  app.decorateRequest('user', null)

  app.addHook('onRequest', async (request) => {
    request.user = await loadUserFromRequest(request)
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'Dữ liệu chưa hợp lệ',
        details: error.flatten(),
      })
    }
    const status =
      typeof (error as { statusCode?: number }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : 500
    if (status >= 500) {
      app.log.error(error)
    }
    return reply.code(status).send({
      error:
        status === 401
          ? 'Unauthorized'
          : status === 403
            ? 'Forbidden'
            : (error as Error).message || 'Server error',
    })
  })

  app.get('/api/health', async () => ({
    ok: true,
    service: 'aikids-api',
    time: new Date().toISOString(),
    db: 'postgresql',
    supabaseConfigured: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  }))

  await app.register(authRoutes)
  await app.register(courseRoutes)
  await app.register(progressRoutes)
  await app.register(portfolioRoutes)
  await app.register(parentRoutes)
  await app.register(teacherRoutes)
  await app.register(adminRoutes)

  // Explicit cookie name export for tests
  app.decorate('sessionCookieName', SESSION_COOKIE)

  return app
}
