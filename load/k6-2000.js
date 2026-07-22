import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { SharedArray } from 'k6/data'

const baseUrl = __ENV.BASE_URL || 'http://localhost:4000'
const tokenFile = __ENV.SESSION_TOKENS_FILE || './session-tokens.json'
const tokens = new SharedArray('sessions', () => JSON.parse(open(tokenFile)))
const target = Number(__ENV.MAX_VUS || 2000)

export const options = {
  scenarios: {
    learners: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: Math.ceil(target * 0.1) },
        { duration: '5m', target: Math.ceil(target * 0.5) },
        { duration: '5m', target },
        { duration: '10m', target },
        { duration: '3m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1200'],
    'http_req_duration{endpoint:health}': ['p(95)<150'],
    'http_req_duration{endpoint:courses}': ['p(95)<400'],
    'http_req_duration{endpoint:notifications}': ['p(95)<400'],
    'http_req_duration{endpoint:backpack}': ['p(95)<600'],
    checks: ['rate>0.99'],
  },
}

export default function () {
  if (tokens.length === 0) throw new Error('session-tokens.json is empty')
  const token = tokens[(__VU - 1) % tokens.length]
  const params = { headers: { Cookie: `aikids_session=${token}` } }

  group('learner journey', () => {
    const courses = http.get(`${baseUrl}/api/courses`, { ...params, tags: { endpoint: 'courses' } })
    check(courses, { 'courses 200': (response) => response.status === 200 })

    const notifications = http.get(`${baseUrl}/api/notifications?limit=15`, {
      ...params,
      tags: { endpoint: 'notifications' },
    })
    check(notifications, { 'notifications 200': (response) => response.status === 200 })

    if (__ITER % 3 === 0) {
      const backpack = http.get(`${baseUrl}/api/backpack?limit=40`, {
        ...params,
        tags: { endpoint: 'backpack' },
      })
      check(backpack, { 'backpack 200': (response) => response.status === 200 })
    }
  })
  sleep(2 + Math.random() * 4)
}

export function setup() {
  const health = http.get(`${baseUrl}/api/health`, { tags: { endpoint: 'health' } })
  check(health, { 'health ready': (response) => response.status === 200 })
}
