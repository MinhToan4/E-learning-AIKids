/**
 * Prisma client is generated under src/generated/prisma (Windows-safe).
 * tsc does not emit those prebuilt runtime files — copy into dist for `node dist/index.js`.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'src/generated')
const dest = resolve(root, 'dist/generated')

if (!existsSync(src)) {
  console.error('[copy-generated] missing', src, '— run: npx prisma generate')
  process.exit(1)
}
mkdirSync(dirname(dest), { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('[copy-generated] copied src/generated → dist/generated')
