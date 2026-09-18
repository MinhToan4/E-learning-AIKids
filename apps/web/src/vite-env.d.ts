/// <reference types="vite/client" />

type RewardAssetFormat = 'avif' | 'png' | 'svg' | 'webp'

interface AikidsRuntimeConfig {
  storagePublicUrl?: string
  rewardAssetTestPath?: string
  rewardAssetBaseUrl?: string
  rewardAssetRelease?: string
  rewardAssetFormat?: RewardAssetFormat
  firebaseConfig?: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
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
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
