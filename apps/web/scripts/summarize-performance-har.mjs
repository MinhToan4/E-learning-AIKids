import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// Deliberately enumerate route templates: unknown/dynamic paths never enter output.
const routes = [
  [/^\/api\/(?:v1\/account\/)?auth\/me$/, 'auth/me'],
  [/^\/api\/(?:v1\/account\/)?auth\/access$/, 'auth/access'],
  [/^\/api\/(?:v1\/account\/)?auth\/context$/, 'auth/context'],
  [/^\/api\/(?:v1\/account\/)?auth\//, 'auth/other'],
  [/^\/api\/parent\/children$/, 'parent/children'],
  [/^\/api\/parent\/children\/[^/]+\/courses$/, 'parent/children/:id/courses'],
  [/^\/api\/parent\/children\/[^/]+\/progress$/, 'parent/children/:id/progress'],
  [/^\/api\/v1\/account\/family\/children$/, 'account/family/children'],
  [/^\/api\/v1\/lms\/family\/teacher-feedback\/summary$/, 'lms/feedback-summary'],
  [/^\/api\/v1\/lms\/compat\/pathway$/, 'lms/pathway'],
  [/^\/api\/(?:parent\/subscription|v1\/billing\/me\/subscription)$/, 'billing/subscription'],
  [/^\/api\/(?:gamification\/profile|v1\/gamification\/me\/profile)$/, 'gamification/profile'],
  [/^\/api\/(?:admin\/system|v1\/system\/aikids\/admin\/summary)$/, 'admin/summary'],
  [/^\/api\/v1\/lms\//, 'lms/other'],
  [/^\/api\/v1\/jobs(?:\/|$)/, 'jobs'],
]
const serverMetrics = new Set(['lms', 'account', 'system', 'hub_upstream_headers', 'hub_connection', 'lms_db_busy', 'lms_db_sum'])
const serverCounters = new Set(['lms_db_calls', 'lms_db_errors'])
const browserMetrics = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive']
const valid = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0

function percentiles(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const percentile = (p) => Number(sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)].toFixed(2))
  return { samples: sorted.length, p50: percentile(0.5), p95: percentile(0.95), p99: percentile(0.99) }
}

export function summarizeHar(har) {
  if (!Array.isArray(har?.log?.entries)) throw new Error('Expected HAR log.entries')
  const groups = new Map()
  for (const entry of har.log.entries) {
    let path
    try { path = new URL(entry.request?.url).pathname.replace(/\/$/, '') } catch { continue }
    if (!path.startsWith('/api/')) continue
    const route = routes.find(([pattern]) => pattern.test(path))?.[1] ?? 'api/other'
    const method = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].includes(entry.request?.method)
      ? entry.request.method : 'OTHER'
    const key = `${method} ${route}`
    const group = groups.get(key) ?? { route: key, requests: 0, errors: 0, metrics: new Map(), counters: new Map() }
    group.requests++
    if (!entry.response?.status || entry.response.status >= 400) group.errors++
    const add = (name, value, target = group.metrics) => {
      if (!valid(value)) return
      const values = target.get(name) ?? []
      values.push(value)
      target.set(name, values)
    }
    add('total', entry.time)
    for (const name of browserMetrics) add(name, entry.timings?.[name])
    for (const header of entry.response?.headers ?? []) {
      if (String(header.name).toLowerCase() !== 'server-timing') continue
      for (const metric of String(header.value).split(',')) {
        const match = metric.trim().match(/^([a-z_]+)\s*;\s*dur=([\d.]+)(?:\s*;.*)?$/)
        if (match && serverMetrics.has(match[1])) add(match[1], Number(match[2]))
        const counter = metric.trim().match(/^([a-z_]+)\s*;\s*desc="(\d+)"$/)
        if (counter && serverCounters.has(counter[1])) add(counter[1], Number(counter[2]), group.counters)
      }
    }
    groups.set(key, group)
  }
  return {
    unit: 'ms',
    note: 'Request timings only, not LCP or navigation time. Metrics overlap; do not add them. Compare separate cold/warm captures under the same conditions. Small samples do not establish production percentiles.',
    routes: [...groups.values()].sort((a, b) => a.route.localeCompare(b.route)).map((group) => ({
      route: group.route, requests: group.requests, errors: group.errors,
      ...(group.counters.size ? { counts: Object.fromEntries([...group.counters].map(([name, values]) => [name, percentiles(values)])) } : {}),
      timings: Object.fromEntries([...group.metrics].map(([name, values]) => [name, percentiles(values)])),
    })),
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) throw new Error('Expected one HAR file')
    console.log(JSON.stringify(summarizeHar(JSON.parse(readFileSync(process.argv[2], 'utf8'))), null, 2))
  } catch {
    // Parser exceptions can include snippets of sensitive input; never echo them.
    console.error('Cannot summarize HAR. Supply one valid local HAR file.')
    process.exitCode = 1
  }
}
