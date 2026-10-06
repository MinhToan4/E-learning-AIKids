import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeHar } from './summarize-performance-har.mjs'

test('aggregates routes and percentiles without exposing HAR secrets or resource IDs', () => {
  const entries = [10, 20, 30, 40].map((time, i) => ({
    time, request: { method: 'GET', url: `https://private.example/api/parent/children/secret-child-${i}/progress?token=secret-token`, cookies: [{ value: 'secret-cookie' }] },
    response: { status: i === 0 ? 403 : 200, content: { text: 'secret-pii' }, headers: [{ name: 'Server-Timing', value: 'lms;dur=5, hub_connection;dur=1, unknown_person;dur=999' }] },
    timings: { wait: time - 1, ssl: -1 },
  }))
  const output = summarizeHar({ log: { entries } })
  const route = output.routes[0]
  assert.equal(route.route, 'GET parent/children/:id/progress')
  assert.equal(route.requests, 4)
  assert.equal(route.errors, 1)
  assert.deepEqual(route.timings.total, { samples: 4, p50: 20, p95: 40, p99: 40 })
  assert.equal(route.timings.lms.p95, 5)
  assert.equal(route.timings.ssl, undefined)
  assert.doesNotMatch(JSON.stringify(output), /secret|private\.example|unknown_person/)
})

test('unknown paths are redacted and missing timings are not reported as zero', () => {
  const result = summarizeHar({ log: { entries: [
    { request: { method: 'GET', url: 'https://app.example/api/custom/private-name' }, response: { status: 0 }, time: -1 },
    { request: { url: 'https://app.example/assets/private-name.png' } },
    { request: { url: 'not a URL' } },
  ] } })
  assert.deepEqual(result.routes, [{ route: 'GET api/other', requests: 1, errors: 1, timings: {} }])
  assert.throws(() => summarizeHar({}), /Expected HAR/)
})


test('keeps overlapping DB durations separate from operation counts', () => {
  const result = summarizeHar({ log: { entries: [{
    request: { method: 'GET', url: 'https://app.example/api/v1/lms/compat/pathway' },
    response: { status: 200, headers: [{ name: 'Server-Timing', value:
      'lms;dur=20, lms_db_busy;dur=15, lms_db_sum;dur=25, lms_db_calls;desc="3", lms_db_errors;desc="1", private;desc="999"',
    }] },
  }] } })
  const route = result.routes[0]
  assert.equal(route.timings.lms_db_busy.p95, 15)
  assert.equal(route.timings.lms_db_sum.p95, 25)
  assert.equal(route.timings.lms_db_calls, undefined)
  assert.equal(route.counts.lms_db_calls.p95, 3)
  assert.equal(route.counts.lms_db_errors.p95, 1)
  assert.equal(route.counts.private, undefined)
})
