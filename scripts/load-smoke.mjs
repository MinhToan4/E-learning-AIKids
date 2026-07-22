const target = process.env.LOAD_URL ?? 'http://localhost:4000/api/health'
const concurrency = Math.max(1, Number(process.env.LOAD_CONCURRENCY ?? 50))
const requests = Math.max(concurrency, Number(process.env.LOAD_REQUESTS ?? 500))
const timeoutMs = Math.max(500, Number(process.env.LOAD_TIMEOUT_MS ?? 10_000))
const cookie = process.env.LOAD_COOKIE?.trim()

if (!/^https?:\/\//.test(target)) {
  throw new Error('LOAD_URL must be an absolute http(s) URL')
}

const durations = []
const statuses = new Map()
let cursor = 0
let transportErrors = 0

async function worker() {
  while (cursor < requests) {
    cursor += 1
    const started = performance.now()
    try {
      const response = await fetch(target, {
        headers: cookie ? { cookie } : undefined,
        signal: AbortSignal.timeout(timeoutMs),
      })
      await response.arrayBuffer()
      statuses.set(response.status, (statuses.get(response.status) ?? 0) + 1)
    } catch {
      transportErrors += 1
    } finally {
      durations.push(performance.now() - started)
    }
  }
}

const started = performance.now()
await Promise.all(Array.from({ length: concurrency }, () => worker()))
const elapsedMs = performance.now() - started
durations.sort((a, b) => a - b)

function percentile(percent) {
  const index = Math.min(durations.length - 1, Math.ceil(durations.length * percent) - 1)
  return Math.round(durations[Math.max(0, index)] ?? 0)
}

const successful = [...statuses.entries()]
  .filter(([status]) => status >= 200 && status < 400)
  .reduce((sum, [, count]) => sum + count, 0)
const limited = statuses.get(429) ?? 0
const serverErrors = [...statuses.entries()]
  .filter(([status]) => status >= 500)
  .reduce((sum, [, count]) => sum + count, 0)

const report = {
  target,
  concurrency,
  requests,
  elapsedMs: Math.round(elapsedMs),
  requestsPerSecond: Number((requests / (elapsedMs / 1000)).toFixed(1)),
  latencyMs: { p50: percentile(0.5), p95: percentile(0.95), p99: percentile(0.99) },
  statuses: Object.fromEntries([...statuses.entries()].sort(([a], [b]) => a - b)),
  successful,
  limited,
  serverErrors,
  transportErrors,
}

console.log(JSON.stringify(report, null, 2))

// Rate limiting is reported separately because it is expected protection under
// a single-IP smoke run. Server/transport errors still fail CI or a runbook.
if (serverErrors > 0 || transportErrors > 0) process.exitCode = 1
