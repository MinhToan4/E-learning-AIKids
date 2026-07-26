import type { FastifyInstance } from 'fastify'
import { reportRoutes } from './report.routes.js'

export async function reportModule(app: FastifyInstance) {
  await app.register(reportRoutes)
}
