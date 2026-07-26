import type { FastifyInstance } from 'fastify'
import { scheduleRoutes } from './schedule.routes.js'

export async function scheduleModule(app: FastifyInstance) {
  await app.register(scheduleRoutes)
}
