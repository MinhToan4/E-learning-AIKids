import { test } from 'node:test'
import assert from 'node:assert/strict'
import { frontendPreviewRoutes } from './prepare-frontend-preview.mjs'

test('all API families and webhooks stop at 503 before filesystem or SPA fallback', () => {
  const routes = frontendPreviewRoutes()
  for (const path of ['/api', '/api/auth/me', '/api/v1/billing/me/subscription', '/internal/v1/account/auth/me', '/worker/v1/jobs', '/sepay/ipn', '/api/sepay/ipn']) {
    const route = routes.find((rule) => rule.src && !rule.continue && new RegExp(`^(?:${rule.src})$`).test(path))
    assert.equal(route?.status, 503, path)
    assert.equal(route?.dest, '/__preview_backend_unavailable.json')
    assert.ok(routes.indexOf(route) < routes.findIndex((rule) => rule.handle === 'filesystem'))
  }
  assert.ok(routes.every((rule) => !rule.dest || rule.dest.startsWith('/')))
  assert.doesNotMatch(JSON.stringify(routes), /https?:\/\/|dev-hub|production/)
  assert.equal(routes[0].headers['X-Robots-Tag'], 'noindex, nofollow')
})

const match = (routes, path) => routes.find((rule) => rule.src && !rule.continue && new RegExp(`^(?:${rule.src})$`).test(path))
const ORIGIN = 'https://backend.example.com'

test('proxy mode maps only browser /api/* to the backend origin', () => {
  const routes = frontendPreviewRoutes({ backendOrigin: `${ORIGIN}/` })
  const fsIndex = routes.findIndex((rule) => rule.handle === 'filesystem')
  for (const path of ['/api/auth/me', '/api/v1/billing/me/subscription']) {
    const route = match(routes, path)
    assert.equal(route.dest, `${ORIGIN}/api/$1`, path)
    assert.equal(route.status, undefined)
    assert.ok(routes.indexOf(route) < fsIndex)
  }
  assert.equal(routes[0].headers['X-AIKids-Environment'], 'frontend-preview-prod-backend')
  assert.equal(routes[0].headers['X-Robots-Tag'], 'noindex, nofollow')
  assert.equal(routes.filter((rule) => rule.dest?.includes(ORIGIN)).length, 1)
})

test('proxy mode keeps webhooks and non-browser surfaces blocked', () => {
  const routes = frontendPreviewRoutes({ backendOrigin: ORIGIN })
  for (const path of ['/api/sepay/ipn', '/sepay/ipn', '/internal/v1/account/auth/me', '/worker/v1/jobs']) {
    const route = match(routes, path)
    assert.equal(route?.status, 503, path)
    assert.equal(route.dest, '/__preview_backend_unavailable.json')
  }
})

test('invalid backend origins are rejected', () => {
  for (const origin of ['', 'http://backend.example.com', `${ORIGIN}/api`, 'https://user:pw@backend.example.com', `${ORIGIN}?x=1`, 'not a url']) {
    assert.throws(() => frontendPreviewRoutes({ backendOrigin: origin }), /backend-origin/, origin)
  }
})
