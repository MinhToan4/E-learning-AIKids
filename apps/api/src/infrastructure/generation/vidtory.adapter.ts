/**
 * Server-side Vidtory generation adapter.
 * - API key: SystemSetting encrypted or env VIDTORY_API_KEY (never returned to FE)
 * - Routing: admin-configured models + weights → pick modelId per request
 * - Soft Clay prompt bias; mock fallback when unconfigured / errors
 */
import {
  buildImageGenRefs,
  buildVideoGenRefs,
  DEFAULT_VIDTORY_BASE_URL,
  DEFAULT_VIDTORY_ROUTING,
  pickWeightedModel,
  resolveVideoMode,
  validateVidtoryRouting,
  type ModelWeight,
  type VidtoryRoutingConfig,
} from '@aikids/domain'
import { mockGenerateImage } from '../../shared/generation/mock-image.js'
import { prisma } from '../database/prisma.js'
import { decryptSecret, maskSecret } from '../security/secret-box.js'

export const VIDTORY_API_KEY_SETTING = 'vidtory_api_key'
/** Non-secret routing JSON (modelId + weight + aspect/resolution) */
export const VIDTORY_ROUTING_SETTING = 'vidtory_routing'

export type GenerationMode = 'vidtory' | 'mock' | 'unavailable'

export type GenerateImageResult = {
  id: string
  title: string
  imageUrl: string
  mode: GenerationMode
  source: 'vidtory' | 'mock'
  modelId?: string
  /** How refs were mapped for debugging */
  refStrategy?: 'none' | 'refImageUrl' | 'startImages'
  /** CURRENT: Vidtory CDN URL only — no private re-host yet */
  storageBackend?: 'vidtory_cdn' | 'mock'
}

export type GenerateVideoResult = {
  id: string
  title: string
  videoUrl: string
  mode: GenerationMode
  source: 'vidtory' | 'mock'
  modelId?: string
  videoMode?: string
  refStrategy?: 'none' | 'refImageUrl' | 'startImages'
  storageBackend?: 'vidtory_cdn' | 'mock'
}

/** Injectable client factory for tests */
export type VidtoryClientLike = {
  models: {
    generateImage: (params: {
      prompt: string
      aspectRatio?: string
      modelId?: string
      resolution?: string
      mode?: string
      refImageUrl?: string
      startImages?: string[]
    }) => Promise<{ result?: string | null; id?: string }>
    generateVideo: (params: {
      prompt: string
      duration?: number
      aspectRatio?: string
      modelId?: string
      mode?: string
      refImageUrl?: string
      startImages?: string[]
    }) => Promise<{ result?: string | null; id?: string }>
  }
}

let clientFactory: ((apiKey: string) => VidtoryClientLike) | null = null
/** Test override for routing without DB */
let routingOverride: VidtoryRoutingConfig | null = null

export function setVidtoryClientFactory(
  factory: ((apiKey: string) => VidtoryClientLike) | null,
): void {
  clientFactory = factory
}

export function setVidtoryRoutingOverride(
  config: VidtoryRoutingConfig | null,
): void {
  routingOverride = config
}

export async function getVidtoryApiKey(): Promise<string | null> {
  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: VIDTORY_API_KEY_SETTING },
    })
    if (row?.valueEnc) {
      try {
        return decryptSecret(row.valueEnc)
      } catch {
        return null
      }
    }
  } catch {
    // DB unavailable — fall through to env
  }
  const fromEnv = (process.env.VIDTORY_API_KEY ?? '').trim()
  return fromEnv || null
}

export async function getVidtoryKeyStatus(): Promise<{
  configured: boolean
  maskedHint: string | null
  source: 'database' | 'env' | 'none'
  updatedAt: string | null
}> {
  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: VIDTORY_API_KEY_SETTING },
    })
    if (row?.valueEnc) {
      let masked: string | null = null
      try {
        const meta = JSON.parse(row.metaJson || '{}') as {
          last4?: string
          hint?: string
        }
        masked =
          meta.hint ?? (meta.last4 ? `••••${meta.last4}` : '••••configured')
      } catch {
        masked = '••••configured'
      }
      return {
        configured: true,
        maskedHint: masked,
        source: 'database',
        updatedAt: row.updatedAt.toISOString(),
      }
    }
  } catch {
    /* ignore */
  }
  if ((process.env.VIDTORY_API_KEY ?? '').trim()) {
    return {
      configured: true,
      maskedHint: maskSecret(process.env.VIDTORY_API_KEY!),
      source: 'env',
      updatedAt: null,
    }
  }
  return { configured: false, maskedHint: null, source: 'none', updatedAt: null }
}

/**
 * Load routing config from DB (or default). Never contains API key.
 */
export async function getVidtoryRouting(): Promise<VidtoryRoutingConfig> {
  if (routingOverride) return routingOverride
  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: VIDTORY_ROUTING_SETTING },
    })
    if (row?.metaJson) {
      const parsed = JSON.parse(row.metaJson) as unknown
      // Prefer metaJson; valueEnc unused for non-secret routing
      const v = validateVidtoryRouting(parsed)
      if (v.ok) return v.config
    }
  } catch {
    /* use default */
  }
  return structuredClone(DEFAULT_VIDTORY_ROUTING)
}

export async function saveVidtoryRouting(
  config: VidtoryRoutingConfig,
): Promise<VidtoryRoutingConfig> {
  const v = validateVidtoryRouting(config)
  if (!v.ok) throw Object.assign(new Error(v.message), { statusCode: 400 })
  const metaJson = JSON.stringify(v.config)
  await prisma.systemSetting.upsert({
    where: { key: VIDTORY_ROUTING_SETTING },
    create: {
      key: VIDTORY_ROUTING_SETTING,
      valueEnc: null,
      metaJson,
    },
    update: { metaJson },
  })
  return v.config
}

async function buildClient(
  apiKey: string,
  baseURL?: string,
): Promise<VidtoryClientLike> {
  if (clientFactory) return clientFactory(apiKey)
  const { VidtoryAI } = await import('@vidtory/ai-sdk')
  return new VidtoryAI({
    apiKey,
    baseURL:
      baseURL ||
      process.env.VIDTORY_BASE_URL ||
      DEFAULT_VIDTORY_BASE_URL,
    maxRetries: 1,
    timeout: 90_000,
  }) as unknown as VidtoryClientLike
}

function softClayImagePrompt(prompt: string): string {
  return `${prompt}. Soft clay illustration for children ages 6-11, warm pastel, handmade clay texture, rounded shapes, no plastic neon, no photorealistic chrome, friendly and safe`
}

function softClayVideoPrompt(prompt: string): string {
  return `${prompt}. Soft clay stop-motion style for kids, warm, friendly, safe content`
}

function refStrategyOf(refs: {
  startImages?: string[]
  refImageUrl?: string
}): 'none' | 'refImageUrl' | 'startImages' {
  if (refs.startImages && refs.startImages.length >= 2) return 'startImages'
  if (refs.refImageUrl) return 'refImageUrl'
  return 'none'
}

/**
 * Generate image for student practice.
 * refUrls: 0 → text-only; 1 → refImageUrl; N → startImages (+ primary ref).
 */
export async function generatePracticeImage(
  prompt: string,
  seed: string,
  opts?: { forceMock?: boolean; refUrls?: string[] },
): Promise<GenerateImageResult> {
  const imageRefs = buildImageGenRefs(opts?.refUrls ?? [])
  const strategy = refStrategyOf(imageRefs)

  if (opts?.forceMock) {
    const mock = mockGenerateImage(prompt, seed)
    return {
      id: mock.id,
      title: mock.title,
      imageUrl: mock.imageDataUrl,
      mode: 'mock',
      source: 'mock',
      refStrategy: strategy,
      storageBackend: 'mock',
    }
  }

  const routing = await getVidtoryRouting()
  let picked: ModelWeight
  try {
    picked = pickWeightedModel(routing.image.models)
  } catch {
    picked = routing.image.models[0] ?? {
      modelId: 'gemini-3.1-flash-image-preview',
      weight: 100,
    }
  }

  const genParams = {
    prompt: softClayImagePrompt(prompt),
    aspectRatio: routing.image.aspectRatio,
    modelId: picked.modelId,
    resolution: routing.image.resolution,
    mode: routing.image.mode,
    refImageUrl: imageRefs.refImageUrl,
    startImages: imageRefs.startImages,
  }

  // Injected test double takes priority (no network)
  if (clientFactory) {
    try {
      const client = clientFactory('test-key')
      const res = await client.models.generateImage(genParams)
      const url = res.result
      if (!url) throw new Error('Empty image result')
      return {
        id: res.id ?? `vid-${Date.now()}`,
        title: 'Ảnh AI theo ý con',
        imageUrl: url,
        mode: 'vidtory',
        source: 'vidtory',
        modelId: picked.modelId,
        refStrategy: strategy,
        storageBackend: 'vidtory_cdn',
      }
    } catch {
      const mock = mockGenerateImage(prompt, seed)
      return {
        id: mock.id,
        title: mock.title,
        imageUrl: mock.imageDataUrl,
        mode: 'mock',
        source: 'mock',
        modelId: picked.modelId,
        refStrategy: strategy,
        storageBackend: 'mock',
      }
    }
  }

  const apiKey = await getVidtoryApiKey()
  if (!apiKey) {
    const mock = mockGenerateImage(prompt, seed)
    return {
      id: mock.id,
      title: mock.title,
      imageUrl: mock.imageDataUrl,
      mode: 'unavailable',
      source: 'mock',
      modelId: picked.modelId,
      refStrategy: strategy,
      storageBackend: 'mock',
    }
  }

  try {
    const client = await buildClient(apiKey, routing.baseURL)
    const res = await client.models.generateImage(genParams)
    const url = res.result
    if (!url || typeof url !== 'string') {
      throw new Error('Empty image result')
    }
    // CURRENT STORAGE: keep Vidtory result URL as-is (no private re-host)
    return {
      id: res.id ?? `vid-${Date.now()}`,
      title: 'Ảnh AI theo ý con',
      imageUrl: url,
      mode: 'vidtory',
      source: 'vidtory',
      modelId: picked.modelId,
      refStrategy: strategy,
      storageBackend: 'vidtory_cdn',
    }
  } catch (err) {
    console.error(
      '[Vidtory] image generation failed, using mock:',
      err instanceof Error ? err.message : 'unknown',
      'modelId=',
      picked.modelId,
    )
    const mock = mockGenerateImage(prompt, seed)
    return {
      id: mock.id,
      title: mock.title,
      imageUrl: mock.imageDataUrl,
      mode: 'mock',
      source: 'mock',
      modelId: picked.modelId,
      refStrategy: strategy,
      storageBackend: 'mock',
    }
  }
}

/**
 * Generate video. refUrls: 0 → t2v; 1 → i2v+refImageUrl; N → i2v+startImages.
 */
export async function generatePracticeVideo(
  prompt: string,
  seed: string,
  opts?: { forceMock?: boolean; refImageUrl?: string; refUrls?: string[] },
): Promise<GenerateVideoResult> {
  const urls = [
    ...(opts?.refUrls ?? []),
    ...(opts?.refImageUrl ? [opts.refImageUrl] : []),
  ]
  const videoRefs = buildVideoGenRefs(urls)
  const strategy = refStrategyOf(videoRefs)
  const effectiveMode = resolveVideoMode(videoRefs.hasRef)

  const routing = await getVidtoryRouting()
  let picked: ModelWeight
  try {
    picked = pickWeightedModel(routing.video.models)
  } catch {
    picked = routing.video.models[0] ?? {
      modelId: 'veo-3.1-fast-generate-001',
      weight: 100,
    }
  }

  const genParams = {
    prompt: softClayVideoPrompt(prompt),
    duration: routing.video.duration,
    aspectRatio: routing.video.aspectRatio,
    modelId: picked.modelId,
    mode: effectiveMode,
    refImageUrl: videoRefs.refImageUrl,
    startImages: videoRefs.startImages,
  }

  if (opts?.forceMock) {
    return {
      id: `mock-vid-${seed}`,
      title: 'Video thử Soft Clay',
      videoUrl: '',
      mode: 'mock',
      source: 'mock',
      modelId: picked.modelId,
      videoMode: effectiveMode,
      refStrategy: strategy,
      storageBackend: 'mock',
    }
  }

  if (clientFactory) {
    try {
      const client = clientFactory('test-key')
      const res = await client.models.generateVideo(genParams)
      const url = res.result
      if (!url) throw new Error('Empty video result')
      return {
        id: res.id ?? `vidv-${Date.now()}`,
        title: 'Video AI của con',
        videoUrl: url,
        mode: 'vidtory',
        source: 'vidtory',
        modelId: picked.modelId,
        videoMode: effectiveMode,
        refStrategy: strategy,
        storageBackend: 'vidtory_cdn',
      }
    } catch {
      return {
        id: `mock-vid-${seed}`,
        title: 'Video thử',
        videoUrl: '',
        mode: 'mock',
        source: 'mock',
        modelId: picked.modelId,
        videoMode: effectiveMode,
        refStrategy: strategy,
        storageBackend: 'mock',
      }
    }
  }

  const apiKey = await getVidtoryApiKey()
  if (!apiKey) {
    return {
      id: `mock-vid-${seed}`,
      title: 'Video thử (chưa cấu hình AI)',
      videoUrl: '',
      mode: 'unavailable',
      source: 'mock',
      modelId: picked.modelId,
      videoMode: effectiveMode,
      refStrategy: strategy,
      storageBackend: 'mock',
    }
  }

  try {
    const client = await buildClient(apiKey, routing.baseURL)
    const res = await client.models.generateVideo(genParams)
    const url = res.result
    if (!url) throw new Error('Empty video result')
    // CURRENT STORAGE: Vidtory CDN URL only
    return {
      id: res.id ?? `vidv-${Date.now()}`,
      title: 'Video AI của con',
      videoUrl: url,
      mode: 'vidtory',
      source: 'vidtory',
      modelId: picked.modelId,
      videoMode: effectiveMode,
      refStrategy: strategy,
      storageBackend: 'vidtory_cdn',
    }
  } catch (err) {
    console.error(
      '[Vidtory] video generation failed:',
      err instanceof Error ? err.message : 'unknown',
      'modelId=',
      picked.modelId,
      'mode=',
      effectiveMode,
    )
    return {
      id: `mock-vid-${seed}`,
      title: 'Video thử',
      videoUrl: '',
      mode: 'mock',
      source: 'mock',
      modelId: picked.modelId,
      videoMode: effectiveMode,
      refStrategy: strategy,
      storageBackend: 'mock',
    }
  }
}
