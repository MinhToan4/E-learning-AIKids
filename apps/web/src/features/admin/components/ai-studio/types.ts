import { ART_STYLES } from '@/shared/lib/creation/creative'

// ── Types & Provider Metadata ───────────────────────────────
export type AiEngineSubTab = 'providers' | 'routing' | 'prompts' | 'matrix' | 'safety'

export interface ProviderDefinitionMeta {
  id: string
  displayName: string
  kind: 'api_key' | 'service_account' | 'sdk' | 'cookie_pool'
  capabilities: Array<'image' | 'video' | 'llm' | 'audio'>
  defaultModel?: string
  endpoint?: string
  description: string
  badgeTone: 'mint' | 'sky' | 'brand' | 'sun' | 'coral'
  keyPlaceholder?: string
  keyPrefix?: string
}

export interface ImageEngineConfig {
  provider: string
  aspectRatio: string
  resolution: string
  stylePreset: string
  autoCompressWebp: boolean
  promptPrefix: string
  promptSuffix: string
  autoWrapPrompt: boolean
}

export interface VideoEngineConfig {
  provider: string
  aspectRatio: string
  resolution: string
  duration: number
}

export interface LlmEngineConfig {
  model: string
  temperature: number
  maxTokens: number
}

export const KNOWN_PROVIDERS: ProviderDefinitionMeta[] = [
  {
    id: 'gemini-native',
    displayName: 'Google Gemini Native (AI Studio)',
    kind: 'api_key',
    capabilities: ['image', 'llm'],
    defaultModel: 'gemini-2.5-flash-image',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'AI Studio chính hãng từ Google, tốc độ cao, độ trễ cực thấp, tối ưu cho tạo tranh minh họa bài giảng và trợ giảng Mèo Mee.',
    badgeTone: 'sky',
    keyPlaceholder: 'AIzaSy...',
    keyPrefix: 'AIzaSy',
  },
  {
    id: 'vertex',
    displayName: 'Google Vertex AI (Enterprise / Free Trial)',
    kind: 'service_account',
    capabilities: ['image', 'llm'],
    defaultModel: 'gemini-2.5-flash-image',
    endpoint: 'https://us-central1-aiplatform.googleapis.com',
    description: 'Dự án GCP Enterprise & Free Trial $300, quota doanh nghiệp lớn, độ ổn định 99.9% cho các bài toán ASMO chuyên sâu.',
    badgeTone: 'brand',
    keyPlaceholder: 'AQ.ServiceAccountKey...',
    keyPrefix: 'AQ.',
  },
  {
    id: 'vidtory-sdk',
    displayName: 'Vidtory SDK (Generative Core)',
    kind: 'sdk',
    capabilities: ['image', 'video'],
    defaultModel: 'imagen-3',
    endpoint: 'https://bapi.vidtory.net',
    description: 'Cổng điều phối tạo ảnh Imagen-3 và video Veo của Vidtory Network, tự động cân bằng tải đa vùng.',
    badgeTone: 'mint',
    keyPlaceholder: 'vidtory_live_...',
    keyPrefix: 'vidtory_',
  },
  {
    id: 'gflow',
    displayName: 'Google Flow (Worker Extension)',
    kind: 'cookie_pool',
    capabilities: ['image', 'video'],
    defaultModel: 'narwhal / veo-2.0',
    endpoint: 'Internal Worker Mesh (Port 4508)',
    description: 'Worker Pool tự động hóa qua tiện ích Chrome Extension — miễn phí chi phí token, chuyên sinh video Veo và tranh minh họa.',
    badgeTone: 'sun',
  },
  {
    id: 'dreamina',
    displayName: 'Dreamina (Worker Extension)',
    kind: 'cookie_pool',
    capabilities: ['image', 'video'],
    defaultModel: 'dreamina-photo-v3',
    endpoint: 'Internal Worker Mesh (Port 4508)',
    description: 'Worker Pool mở rộng tạo ảnh nghệ thuật chi tiết và hoạt cảnh hoạt hình ngắn phục vụ các bài đọc truyện thiếu nhi.',
    badgeTone: 'coral',
  },
  {
    id: 'openai',
    displayName: 'OpenAI (API Key)',
    kind: 'api_key',
    capabilities: ['llm', 'image'],
    defaultModel: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1',
    description: 'Mô hình ngôn ngữ GPT-4o mini thông minh cho giải bài toán đố logic, hướng dẫn tư duy toán học và tinh chỉnh prompt.',
    badgeTone: 'brand',
    keyPlaceholder: 'sk-proj-...',
    keyPrefix: 'sk-',
  },
  {
    id: 'suno',
    displayName: 'Suno Audio Engine',
    kind: 'cookie_pool',
    capabilities: ['audio'],
    defaultModel: 'chirp-v3-5',
    endpoint: 'Internal Worker Mesh (Port 4508)',
    description: 'Tạo nhạc nền hoạt hình thiếu nhi, bài hát học tập theo lời tự động giúp trẻ tăng hứng thú học tập.',
    badgeTone: 'mint',
  },
]

export const DEFAULT_NEGATIVE_PROMPT =
  'deformed, bad anatomy, disfigured, poorly drawn face, mutated, extra limbs, blurry, violence, blood, gore, scary, NSFW, nudity, adult content, realistic photo of child, horror, weapons, monster teeth'

export const DEFAULT_PROMPT_PREFIX =
  'Study the child-provided reference sketch and identify its main subjects, approximate composition, colors and story. Recreate that same idea as a polished'

export const DEFAULT_PROMPT_SUFFIX =
  'Keep the subjects and composition recognizable while improving clarity, detail and finish like a skilled children’s-book illustrator. Child-safe and wholesome for ages 6-15; friendly mood; no violence, frightening imagery, adult content, text, watermark or border.'

export const AI_KIDS_STYLE_PRESETS = ART_STYLES.map((style) => ({
  id: style.id,
  name: style.labelVi,
  tagline: style.tip,
  prompt: style.promptDescriptor,
  badgeBg: 'bg-brand-100 text-brand-700',
}))

export const PLANS_CONFIG: Array<{ id: string; name: string; badge: string; color: string }> = [
  { id: 'free', name: 'Gói Miễn Phí (Free)', badge: 'Trải nghiệm', color: 'bg-slate-100 text-slate-700' },
  { id: 'starter', name: 'Gói Khởi Đầu (Starter)', badge: 'Cơ bản', color: 'bg-sky-100 text-sky-700' },
  { id: 'premium_family', name: 'Gói Premium Gia Đình', badge: 'Phổ biến nhất', color: 'bg-violet-100 text-violet-700' },
  { id: 'pro', name: 'Gói Pro VIP (ASMO Master)', badge: 'Đỉnh cao', color: 'bg-amber-100 text-amber-800' },
]
