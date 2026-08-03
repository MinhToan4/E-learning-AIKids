/**
 * Runtime deployment configuration.
 *
 * Deployment may replace this small file after the frontend has been built.
 * To move storage/CDN, change these origins without rebuilding application JS.
 */
window.__AIKIDS_RUNTIME_CONFIG__ = Object.assign({
  storagePublicUrl: 'https://storage.storymee.com',
  rewardAssetTestPath: '/test-imports/2026.07.31-antigravity',
  rewardAssetBaseUrl: 'https://storage.storymee.com/reward-assets',
  rewardAssetRelease: '2026.07.31',
  rewardAssetFormat: 'svg',
}, window.__AIKIDS_RUNTIME_CONFIG__ || {})
