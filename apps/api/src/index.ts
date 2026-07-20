import { buildApp } from './app.js'
import { env } from './config/env.js'

const app = await buildApp()

try {
  await app.listen({ port: env.port, host: env.host })
  console.log(`AIKids API listening on http://${env.host}:${env.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
