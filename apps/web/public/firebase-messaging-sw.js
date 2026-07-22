/* Firebase config is public. The service account is never shipped to the browser. */
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js')

fetch('/api/auth/firebase/config')
  .then((response) => response.json())
  .then((result) => {
    if (!result.enabled || !result.config) return
    firebase.initializeApp(result.config)
    firebase.messaging()
  })
  .catch(() => undefined)
