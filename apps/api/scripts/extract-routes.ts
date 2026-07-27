import { buildApp } from '../src/app.js'
import * as fs from 'fs'

async function run() {
  const app = await buildApp()
  await app.ready()

  const tree = app.printRoutes({ commonPrefix: false, includeHooks: false, includeMeta: ['schema'] })
  fs.writeFileSync('routes-tree.txt', tree)
  console.log('Routes extracted to routes-tree.txt')
}

run().catch(console.error)
