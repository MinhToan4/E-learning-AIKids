import type { FastifyInstance } from 'fastify'
import { competencyRoutes } from './competency.routes.js'
import { credentialRoutes } from './credential.routes.js'

export async function competencyModule(app: FastifyInstance) {
  await app.register(competencyRoutes)
  await app.register(credentialRoutes)
}
