/// <reference types="vite/client" />

type RewardAssetFormat = 'avif' | 'png' | 'svg' | 'webp'

interface AikidsRuntimeConfig {
  storagePublicUrl?: string
  rewardAssetTestPath?: string
  rewardAssetBaseUrl?: string
  rewardAssetRelease?: string
  rewardAssetFormat?: RewardAssetFormat
}

interface Window {
  __AIKIDS_RUNTIME_CONFIG__?: AikidsRuntimeConfig
}

interface ImportMetaEnv {
  readonly VITE_REWARD_ASSET_BASE_URL?: string
  readonly VITE_REWARD_ASSET_RELEASE?: string
  readonly VITE_REWARD_ASSET_FORMAT?: RewardAssetFormat
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production'
  readonly VITE_STORAGE_PUBLIC_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
