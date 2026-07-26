import type { FastifyInstance } from 'fastify'
import { assessmentAuthoringRoutes } from './assessment-authoring.routes.js'
import { assessmentAttemptRoutes } from './assessment-attempt.routes.js'
import { assessmentGradingRoutes } from './assessment-grading.routes.js'

export async function assessmentRoutes(app: FastifyInstance) {
  await app.register(assessmentAuthoringRoutes)
  await app.register(assessmentAttemptRoutes)
  await app.register(assessmentGradingRoutes)
}
