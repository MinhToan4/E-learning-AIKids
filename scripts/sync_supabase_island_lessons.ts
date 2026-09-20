import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const targetScript = path.resolve(rootDir, 'apps/web/scripts/sync_supabase_island_lessons.ts')
const tsconfig = path.resolve(rootDir, 'apps/web/tsconfig.json')

const result = spawnSync('npx', ['tsx', '--tsconfig', tsconfig, targetScript], {
  cwd: rootDir,
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 0)
