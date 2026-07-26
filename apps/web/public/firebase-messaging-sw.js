/* Firebase config is public. The service account is never shipped to the browser. */
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js')

const APP_CACHE = 'aikids-app-shell-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(['/', '/index.html'])),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Authenticated API data must never enter the shared app-shell cache.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            void caches.open(APP_CACHE).then((cache) => cache.put('/', copy))
          }
          return response
        })
        .catch(async () => (await caches.match('/')) || (await caches.match('/index.html'))),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (
            response.ok &&
            url.origin === self.location.origin &&
            ['script', 'style', 'font', 'image'].includes(request.destination)
          ) {
            const copy = response.clone()
            void caches.open(APP_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})

fetch('/api/auth/firebase/config')
  .then((response) => response.json())
  .then((result) => {
    if (!result.enabled || !result.config) return
    firebase.initializeApp(result.config)
    firebase.messaging()
  })
  .catch(() => undefined)
