import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export function normalizeBackendOrigin(value) {
  let url
  try { url = new URL(String(value ?? '')) } catch { throw new Error('Invalid --backend-origin: not a URL') }
  if (url.protocol !== 'https:') throw new Error('Invalid --backend-origin: https required')
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Invalid --backend-origin: origin only (no credentials, path, query or hash)')
  }
  return url.origin
}

/**
 * Default: every backend family returns 503 (no backend).
 * Opt-in `backendOrigin`: only browser `/api/*` is proxied; payment webhooks and
 * non-browser surfaces (/sepay, /api/sepay, /internal, /worker) stay blocked.
 */
export function frontendPreviewRoutes({ backendOrigin } = {}) {
  const proxyOrigin = backendOrigin === undefined ? null : normalizeBackendOrigin(backendOrigin)
  const blocked = { dest: '/__preview_backend_unavailable.json', status: 503, headers: { 'Cache-Control': 'no-store' } }
  const backendRoutes = proxyOrigin
    ? [
        { src: '/sepay(?:/.*)?', ...blocked },
        { src: '/api/sepay(?:/.*)?', ...blocked },
        { src: '/(?:internal|worker)(?:/.*)?', ...blocked },
        { src: '/api/(.*)', dest: `${proxyOrigin}/api/$1`, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
      ]
    : [
        { src: '/(?:api|internal|worker)(?:/.*)?', ...blocked },
        { src: '/sepay(?:/.*)?', ...blocked },
      ]
  return [
    { src: '/(.*)', headers: { 'X-Robots-Tag': 'noindex, nofollow', 'X-AIKids-Environment': proxyOrigin ? 'frontend-preview-prod-backend' : 'frontend-preview', 'X-Content-Type-Options': 'nosniff' }, continue: true },
    ...backendRoutes,
    { src: '/assets/(.*)', headers: { 'Cache-Control': 'public, max-age=604800' }, continue: true },
    { src: '/(?:index.html|runtime-config.js|version.json)', headers: { 'Cache-Control': 'no-store' }, continue: true },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html', headers: { 'Cache-Control': 'no-store' } },
  ]
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Supply a new absolute output directory')
  const originArg = process.argv.slice(3).find((arg) => arg.startsWith('--backend-origin='))
  const backendOrigin = originArg ? originArg.slice('--backend-origin='.length) : undefined
  const routes = frontendPreviewRoutes({ backendOrigin })
  const target = resolve(process.argv[2])
  if (existsSync(target)) throw new Error('Output directory already exists; refusing to overwrite')
  const root = resolve(import.meta.dirname, '../../..')
  const build = resolve(root, 'apps/web/dist')
  if (!existsSync(resolve(build, 'index.html'))) throw new Error('Build frontend with VITE_APP_ENV=staging first')
  const project = JSON.parse(readFileSync(resolve(root, '.vercel/project.json'), 'utf8'))
  const output = resolve(target, '.vercel/output')
  mkdirSync(output, { recursive: true })
  cpSync(build, resolve(output, 'static'), { recursive: true, filter: (path) => !path.endsWith('.DS_Store') })
  writeFileSync(resolve(target, '.vercel/project.json'), JSON.stringify({ projectId: project.projectId, orgId: project.orgId, projectName: project.projectName }, null, 2))
  writeFileSync(resolve(output, 'config.json'), JSON.stringify({ version: 3, routes }, null, 2))
  writeFileSync(resolve(output, 'static/__preview_backend_unavailable.json'), JSON.stringify({
    status: 'error', code: 'STAGING_BACKEND_NOT_CONFIGURED',
    message: 'Đây là frontend Preview. Backend staging chưa được cấu hình.',
  }))
  console.log(target)
}
