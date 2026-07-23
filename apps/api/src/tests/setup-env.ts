// Hermetic unit-test defaults. Integration tests replace DATABASE_URL with the
// explicitly isolated TEST_DATABASE_URL before importing the application.
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL ??=
  'postgresql://aikids_test:aikids_test@127.0.0.1:65432/aikids_test'
process.env.JWT_SECRET ??=
  'test-secret-aikids-creator-academy-at-least-32-characters'
process.env.STORYMEE_HUB_URL ??= 'http://127.0.0.1:5100'
process.env.HUB_API_KEY ??= 'test-hub-api-key'
process.env.HUB_MEDIA_POLL_MS ??= '1'
process.env.HUB_MEDIA_TIMEOUT_MS ??= '1000'
