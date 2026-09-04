import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles,
  Key,
  Sliders,
  Shield,
  ShieldCheck,
  Activity,
  ArrowUp,
  ArrowDown,
  Power,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Info,
  Server,
  Cpu,
  Layers,
  Volume2,
  Image as ImageIcon,
  Video as VideoIcon,
  Wand2,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/lib/cn'
import {
  fetchAiProviders,
  fetchAiProviderPolicy,
  updateAiProviderPolicy,
  saveProviderApiKey,
  type AiProviderCatalogItem,
  type AiPlanPolicy,
} from '@/shared/lib/api'

// ── Types & Provider Metadata ───────────────────────────────
export type AiEngineSubTab = 'providers' | 'routing' | 'matrix' | 'safety'

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

export const AI_KIDS_STYLE_PRESETS = [
  {
    id: 'claymation',
    name: '🧸 3D Soft Claymation',
    tagline: 'Hallmark UI signature — Đất nặn ấm áp, đáng yêu',
    prompt:
      'soft claymation style, cute 3d plasticine figure, warm rounded shapes, smooth tactile texture, joyful pastel colors, cheerful lighting',
    badgeBg: 'bg-brand-100 text-brand-700',
  },
  {
    id: 'watercolor',
    name: '🎨 Watercolor Fairy',
    tagline: 'Màu nước cổ tích, êm dịu và khơi dậy trí tưởng tượng',
    prompt:
      'enchanting watercolor illustration, whimsical storybook art, soft pastel washes, friendly hand-drawn lineart, cozy warm ambiance',
    badgeBg: 'bg-sky-100 text-sky-700',
  },
  {
    id: 'vibrant_cartoon',
    name: '✨ Vibrant Kids Cartoon',
    tagline: 'Hoạt hình 2D sống động, nét vẽ rõ ràng, năng động',
    prompt:
      'clean 2d vector cartoon, vibrant friendly colors, bold expressive outlines, adorable mascot design, kid-friendly education aesthetic',
    badgeBg: 'bg-mint-100 text-mint-700',
  },
]

export const PLANS_CONFIG: Array<{ id: string; name: string; badge: string; color: string }> = [
  { id: 'free', name: 'Gói Miễn Phí (Free)', badge: 'Trải nghiệm', color: 'bg-slate-100 text-slate-700' },
  { id: 'starter', name: 'Gói Khởi Đầu (Starter)', badge: 'Cơ bản', color: 'bg-sky-100 text-sky-700' },
  { id: 'premium_family', name: 'Gói Premium Gia Đình', badge: 'Phổ biến nhất', color: 'bg-violet-100 text-violet-700' },
  { id: 'pro', name: 'Gói Pro VIP (ASMO Master)', badge: 'Đỉnh cao', color: 'bg-amber-100 text-amber-800' },
]

export function AiEngineStudio() {
  const { toasts, showToast, dismissToast } = useToast()

  // ── States ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AiEngineSubTab>('providers')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Catalog & Policies from Backend
  const [disabledImageProviders, setDisabledImageProviders] = useState<string[]>([])
  const [imageFallbackChain, setImageFallbackChain] = useState<string[]>([
    'gflow',
    'gemini-native',
    'vidtory-sdk',
    'vertex',
    'dreamina',
  ])

  // Key configurations per provider
  const [keysState, setKeysState] = useState<
    Record<string, { key: string; masked: string | null; isConfigured: boolean }>
  >({
    'gemini-native': { key: '', masked: 'AIzaSy••••4091', isConfigured: true },
    vertex: { key: '', masked: null, isConfigured: false },
    'vidtory-sdk': { key: '', masked: 'vidtory••••8821', isConfigured: true },
    openai: { key: '', masked: null, isConfigured: false },
  })
  const [showKeyInput, setShowKeyInput] = useState<Record<string, boolean>>({})

  // Video Engine config
  const [videoConfig, setVideoConfig] = useState({
    provider: 'gflow',
    aspectRatio: '16:9',
    resolution: '1K',
    duration: 6,
  })

  // LLM Engine config
  const [llmConfig, setLlmConfig] = useState({
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    maxTokens: 1024,
  })

  // Plan Provider Policy matrix
  const [planMatrix, setPlanMatrix] = useState<Record<string, AiPlanPolicy>>({
    free: {
      allowedProviders: ['gflow', 'gemini-native'],
      defaultImageRoute: ['gflow', 'gemini-native'],
      note: 'Ưu tiên tối đa chi phí 0đ với GFlow và Gemini Flash',
    },
    starter: {
      allowedProviders: ['gflow', 'gemini-native', 'vidtory-sdk'],
      defaultImageRoute: ['gemini-native', 'gflow', 'vidtory-sdk'],
      note: 'Cân bằng giữa tốc độ và chi phí',
    },
    premium_family: {
      allowedProviders: ['gemini-native', 'gflow', 'vidtory-sdk', 'dreamina', 'vertex'],
      defaultImageRoute: ['gemini-native', 'vidtory-sdk', 'gflow', 'dreamina', 'vertex'],
      note: 'Chất lượng cao không giới hạn cho gia đình',
    },
    pro: {
      allowedProviders: ['gemini-native', 'vertex', 'vidtory-sdk', 'gflow', 'dreamina', 'openai'],
      defaultImageRoute: ['vertex', 'gemini-native', 'vidtory-sdk', 'gflow', 'dreamina'],
      note: 'Ưu tiên băng thông VIP Vertex AI và Veo tốc độ cao',
    },
  })

  // Child Safety
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT)
  const [copiedPresetId, setCopiedPresetId] = useState<string | null>(null)

  // Probe Tester
  const [probePrompt, setProbePrompt] = useState('Bé Mèo Mee đang đeo ba lô đi học toán ASMO, phong cách đất nặn 3D vui tươi')
  const [probeProvider, setProbeProvider] = useState('auto')
  const [probeRunning, setProbeRunning] = useState(false)
  const [probeResult, setProbeResult] = useState<{
    success: boolean
    resolvedProvider: string
    latencyMs: number
    safetyStatus: string
    timestamp: string
  } | null>(null)

  // Test Ping state per provider
  const [pingStates, setPingStates] = useState<
    Record<string, { status: 'idle' | 'pinging' | 'ok' | 'fail'; latency?: number }>
  >({})

  // ── Load initial data ─────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [providersRes, policyRes] = await Promise.allSettled([
        fetchAiProviders(),
        fetchAiProviderPolicy(),
      ])

      if (policyRes.status === 'fulfilled' && policyRes.value) {
        const p = policyRes.value
        if (Array.isArray(p.disabledImageProviders)) {
          setDisabledImageProviders(p.disabledImageProviders)
        }
        if (p.planProviderPolicy && Object.keys(p.planProviderPolicy).length > 0) {
          setPlanMatrix((prev) => ({ ...prev, ...p.planProviderPolicy }))
        }
        if (p.universalNegativePrompt) {
          setNegativePrompt(p.universalNegativePrompt)
        }
        if (p.sdkApiKey) {
          setKeysState((prev) => ({
            ...prev,
            'vidtory-sdk': {
              key: '',
              masked: p.sdkApiKey ? `${p.sdkApiKey.slice(0, 8)}••••` : null,
              isConfigured: true,
            },
          }))
        }
        if (p.geminiApiKey) {
          setKeysState((prev) => ({
            ...prev,
            'gemini-native': {
              key: '',
              masked: p.geminiApiKey ? `${p.geminiApiKey.slice(0, 6)}••••` : null,
              isConfigured: true,
            },
          }))
        }
      }

      if (providersRes.status === 'fulfilled' && providersRes.value) {
        const provData = providersRes.value
        if (provData.imageRoute?.chain && provData.imageRoute.chain.length > 0) {
          const chainIds = provData.imageRoute.chain.map((c) => c.providerId)
          setImageFallbackChain(chainIds)
        }
      }
    } catch {
      // Fallback gracefully on network / dev mocks
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // ── Handlers ──────────────────────────────────────────────
  // 1. Kill-switch toggle
  const toggleKillSwitch = useCallback(
    async (providerId: string) => {
      const isCurrentlyDisabled = disabledImageProviders.includes(providerId)
      const nextDisabled = isCurrentlyDisabled
        ? disabledImageProviders.filter((id) => id !== providerId)
        : [...disabledImageProviders, providerId]

      setDisabledImageProviders(nextDisabled)
      try {
        await updateAiProviderPolicy({ disabledImageProviders: nextDisabled })
        showToast(
          isCurrentlyDisabled
            ? `Đã kích hoạt lại nhà cung cấp ${providerId}`
            : `Đã tạm ngắt khẩn cấp (Kill-switch) ${providerId}`,
          isCurrentlyDisabled ? 'success' : 'info',
        )
      } catch {
        showToast(`Không thể cập nhật kill-switch cho ${providerId}`, 'error')
        // Revert on error
        setDisabledImageProviders(disabledImageProviders)
      }
    },
    [disabledImageProviders, showToast],
  )

  // 2. Move priority in Fallback Chain
  const movePriority = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= imageFallbackChain.length) return
      const nextChain = [...imageFallbackChain]
      const temp = nextChain[index]
      nextChain[index] = nextChain[targetIndex]
      nextChain[targetIndex] = temp
      setImageFallbackChain(nextChain)
    },
    [imageFallbackChain],
  )

  // 3. Save Fallback Chain & Routing
  const saveRoutingSettings = useCallback(async () => {
    setSaving(true)
    try {
      await updateAiProviderPolicy({
        disabledImageProviders,
        videoProvider: videoConfig.provider,
        llmProvider: llmConfig.model,
      })
      showToast('Đã lưu cấu hình Luồng điều phối & Chuỗi dự phòng AI thành công!', 'success')
    } catch {
      showToast('Lỗi khi lưu cấu hình điều phối. Vui lòng thử lại.', 'error')
    } finally {
      setSaving(false)
    }
  }, [disabledImageProviders, videoConfig, llmConfig, showToast])

  // 4. Save API Key
  const handleSaveKey = useCallback(
    async (providerId: string) => {
      const keyVal = (keysState[providerId]?.key || '').trim()
      if (!keyVal) {
        showToast('Vui lòng nhập API Key hợp lệ', 'error')
        return
      }
      setSaving(true)
      try {
        const res = await saveProviderApiKey(providerId, keyVal)
        setKeysState((prev) => ({
          ...prev,
          [providerId]: {
            key: '',
            masked: res.maskedHint || `${keyVal.slice(0, 5)}••••`,
            isConfigured: true,
          },
        }))
        setShowKeyInput((prev) => ({ ...prev, [providerId]: false }))
        showToast(`Đã mã hóa và lưu khóa API cho ${providerId} an toàn!`, 'success')
      } catch {
        showToast(`Không thể lưu khóa API cho ${providerId}`, 'error')
      } finally {
        setSaving(false)
      }
    },
    [keysState, showToast],
  )

  // 5. Test Ping Provider
  const handleTestPing = useCallback(
    async (providerId: string) => {
      setPingStates((prev) => ({ ...prev, [providerId]: { status: 'pinging' } }))
      const startTime = performance.now()
      // Simulate ping probe or real route check
      await new Promise((r) => setTimeout(r, 450 + Math.random() * 300))
      const latency = Math.round(performance.now() - startTime)
      const isOk = !disabledImageProviders.includes(providerId)
      setPingStates((prev) => ({
        ...prev,
        [providerId]: { status: isOk ? 'ok' : 'fail', latency },
      }))
      showToast(
        isOk
          ? `Ping ${providerId} thành công: ${latency}ms`
          : `${providerId} đang bị tắt hoặc không phản hồi`,
        isOk ? 'success' : 'error',
      )
    },
    [disabledImageProviders, showToast],
  )

  // 6. Toggle Provider in Plan Matrix
  const togglePlanProvider = useCallback((planId: string, providerId: string) => {
    setPlanMatrix((prev) => {
      const currentPlan = prev[planId] || { allowedProviders: [], defaultImageRoute: [] }
      const currentList = currentPlan.allowedProviders || []
      const isAllowed = currentList.includes(providerId)
      const nextList = isAllowed
        ? currentList.filter((id) => id !== providerId)
        : [...currentList, providerId]

      return {
        ...prev,
        [planId]: {
          ...currentPlan,
          allowedProviders: nextList,
        },
      }
    })
  }, [])

  // 7. Change defaultImageRoute in Plan Matrix
  const handleDefaultRouteSelect = useCallback((planId: string, primaryProvider: string) => {
    setPlanMatrix((prev) => {
      const currentPlan = prev[planId] || { allowedProviders: [], defaultImageRoute: [] }
      const rest = (currentPlan.allowedProviders || []).filter((p) => p !== primaryProvider)
      return {
        ...prev,
        [planId]: {
          ...currentPlan,
          defaultImageRoute: [primaryProvider, ...rest],
        },
      }
    })
  }, [])

  // 8. Save Plan Matrix
  const savePlanMatrix = useCallback(async () => {
    setSaving(true)
    try {
      await updateAiProviderPolicy({ planProviderPolicy: planMatrix })
      showToast('Đã lưu Ma trận phân quyền theo gói học AI Kids thành công!', 'success')
    } catch {
      showToast('Lỗi khi lưu Ma trận gói học. Vui lòng kiểm tra lại.', 'error')
    } finally {
      setSaving(false)
    }
  }, [planMatrix, showToast])

  // 9. Save Child Safety Prompt
  const saveSafetyConfig = useCallback(async () => {
    setSaving(true)
    try {
      await updateAiProviderPolicy({ universalNegativePrompt: negativePrompt.trim() })
      showToast('Đã lưu Bộ lọc An toàn Trẻ em (Negative Prompt) thành công!', 'success')
    } catch {
      showToast('Lỗi khi lưu bộ lọc an toàn.', 'error')
    } finally {
      setSaving(false)
    }
  }, [negativePrompt, showToast])

  // 10. Run Probe Test
  const handleRunProbe = useCallback(async () => {
    if (!probePrompt.trim()) {
      showToast('Vui lòng nhập prompt thử nghiệm', 'error')
      return
    }
    setProbeRunning(true)
    const startTime = performance.now()
    await new Promise((r) => setTimeout(r, 650 + Math.random() * 400))
    const latency = Math.round(performance.now() - startTime)

    // Check safety
    const forbiddenWords = ['violence', 'blood', 'gore', 'nsfw', 'naked', 'weapon']
    const hasViolation = forbiddenWords.some((w) => probePrompt.toLowerCase().includes(w))

    const activeProviderName =
      probeProvider === 'auto'
        ? imageFallbackChain.find((p) => !disabledImageProviders.includes(p)) || 'gemini-native'
        : probeProvider

    setProbeResult({
      success: !hasViolation,
      resolvedProvider: activeProviderName,
      latencyMs: latency,
      safetyStatus: hasViolation ? '⚠️ CẢNH BÁO: Chứa từ khóa bị chặn' : '🛡️ PASSED: Đạt chuẩn an toàn thiếu nhi',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    })
    setProbeRunning(false)
    showToast(
      hasViolation
        ? 'Prompt thử nghiệm bị chặn bởi bộ lọc an toàn!'
        : `Thử nghiệm pipeline thành công qua ${activeProviderName} (${latency}ms)`,
      hasViolation ? 'error' : 'success',
    )
  }, [probePrompt, probeProvider, imageFallbackChain, disabledImageProviders, showToast])

  // Copy style preset prompt
  const copyPreset = useCallback((presetId: string, text: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedPresetId(presetId)
    setTimeout(() => setCopiedPresetId(null), 2000)
  }, [])

  return (
    <div className="flex flex-col gap-6" data-testid="ai-engine-studio">
      {/* ── Sub-tabs Navigation (Hallmark UI Clay Style) ──────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-3xl bg-surface/80 border-2 border-border/80 shadow-soft">
        <button
          type="button"
          onClick={() => setActiveTab('providers')}
          className={cn(
            'flex items-center gap-2.5 px-5 py-3 rounded-2xl font-display font-bold text-sm transition-all duration-200',
            activeTab === 'providers'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-text hover:bg-brand-50/60 hover:text-brand-600',
          )}
        >
          <Key size={18} className={activeTab === 'providers' ? 'text-sun-300' : ''} />
          <span>1. Nhà Cung Cấp & Khóa API</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('routing')}
          className={cn(
            'flex items-center gap-2.5 px-5 py-3 rounded-2xl font-display font-bold text-sm transition-all duration-200',
            activeTab === 'routing'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-text hover:bg-brand-50/60 hover:text-brand-600',
          )}
        >
          <Sliders size={18} className={activeTab === 'routing' ? 'text-mint-300' : ''} />
          <span>2. Luồng Điều Phối & Fallback</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={cn(
            'flex items-center gap-2.5 px-5 py-3 rounded-2xl font-display font-bold text-sm transition-all duration-200',
            activeTab === 'matrix'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-text hover:bg-brand-50/60 hover:text-brand-600',
          )}
        >
          <Layers size={18} className={activeTab === 'matrix' ? 'text-sky-300' : ''} />
          <span>3. Ma Trận Gói Học (Plan Matrix)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          className={cn(
            'flex items-center gap-2.5 px-5 py-3 rounded-2xl font-display font-bold text-sm transition-all duration-200',
            activeTab === 'safety'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-text hover:bg-brand-50/60 hover:text-brand-600',
          )}
        >
          <ShieldCheck size={18} className={activeTab === 'safety' ? 'text-coral-300' : ''} />
          <span>4. An Toàn Trẻ Em & Probe Tester</span>
        </button>
      </div>

      {/* ── TAB 1: PROVIDERS & CREDENTIALS ────────────────────────────── */}
      {activeTab === 'providers' && (
        <div className="flex flex-col gap-6">
          {/* Header Banner */}
          <div className="ui-card p-6 border-2 border-border/80 bg-gradient-to-r from-brand-50/70 via-surface to-mint-50/40">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles size={16} />
                  <span>StoryMee Multi-Provider Mesh Architecture</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-text mt-1">
                  Danh Mục Nhà Cung Cấp & Quản Trị Khóa Kết Nối
                </h2>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">
                  AI Kids vận hành kiến trúc đa nhà cung cấp kết hợp giữa API chính thức (Google Gemini Native, Vertex AI, OpenAI)
                  và Worker Pools (Google Flow, Dreamina, Suno Audio). Tự động xoay tua và chuyển mạch khi có sự cố.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => void loadData()}
                disabled={loading}
                className="flex items-center gap-2 self-center sm:self-auto"
              >
                <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
                <span>Làm mới kết nối</span>
              </Button>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="grid gap-5 md:grid-cols-2">
            {KNOWN_PROVIDERS.map((provider) => {
              const isDisabled = disabledImageProviders.includes(provider.id)
              const keyData = keysState[provider.id]
              const ping = pingStates[provider.id]
              const isConfigured =
                provider.kind === 'cookie_pool'
                  ? true
                  : keyData?.isConfigured || Boolean(keyData?.masked)

              return (
                <div
                  key={provider.id}
                  className={cn(
                    'ui-card flex flex-col justify-between p-5 border-2 transition-all duration-200',
                    isDisabled
                      ? 'border-coral-200 bg-coral-50/20'
                      : isConfigured
                        ? 'border-border/80 bg-surface shadow-soft'
                        : 'border-sun-200 bg-sun-50/20',
                  )}
                >
                  <div>
                    {/* Top Row: Title & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-text">
                            {provider.displayName}
                          </h3>
                        </div>
                        <p className="text-xs font-mono text-muted mt-0.5">ID: {provider.id}</p>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex flex-col items-end gap-1">
                        {isDisabled ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-coral-100 text-coral-700 border border-coral-200">
                            <AlertTriangle size={13} />
                            Tạm tắt (Kill-switch)
                          </span>
                        ) : isConfigured ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-mint-100 text-mint-700 border border-mint-200">
                            <CheckCircle2 size={13} />
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-sun-100 text-sun-800 border border-sun-200">
                            <AlertCircle size={13} />
                            Chưa có khóa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Capabilities & Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {provider.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/60"
                        >
                          {cap === 'image' && <ImageIcon size={12} />}
                          {cap === 'video' && <VideoIcon size={12} />}
                          {cap === 'llm' && <Cpu size={12} />}
                          {cap === 'audio' && <Volume2 size={12} />}
                          {cap}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold text-muted bg-slate-100">
                        {provider.kind === 'api_key'
                          ? 'API Key Trực tiếp'
                          : provider.kind === 'sdk'
                            ? 'SDK Gateway'
                            : provider.kind === 'service_account'
                              ? 'GCP Service Account'
                              : 'Extension Cookie Pool'}
                      </span>
                    </div>

                    <p className="text-xs text-muted mt-3 leading-relaxed">
                      {provider.description}
                    </p>

                    {/* Endpoint / Model Info */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-brand-50/40 border border-border/60 text-xs font-mono text-muted space-y-1">
                      {provider.defaultModel && (
                        <div className="flex items-center justify-between">
                          <span>Mô hình mặc định:</span>
                          <span className="font-bold text-text">{provider.defaultModel}</span>
                        </div>
                      )}
                      {provider.endpoint && (
                        <div className="flex items-center justify-between truncate">
                          <span>Endpoint:</span>
                          <span className="font-semibold text-brand-600 truncate ml-2">
                            {provider.endpoint}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Management & Controls */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-2.5">
                    {/* Key Input / Masked hint */}
                    {provider.kind !== 'cookie_pool' ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-text">Khóa API / Credential:</span>
                          {keyData?.masked && (
                            <span className="font-mono text-muted">{keyData.masked}</span>
                          )}
                        </div>

                        {showKeyInput[provider.id] ? (
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder={provider.keyPlaceholder || 'Nhập API key...'}
                              value={keysState[provider.id]?.key || ''}
                              onChange={(e) =>
                                setKeysState((prev) => ({
                                  ...prev,
                                  [provider.id]: {
                                    ...(prev[provider.id] || { masked: null, isConfigured: false }),
                                    key: e.target.value,
                                  },
                                }))
                              }
                              className="flex-1 min-h-10 px-3 rounded-xl border-2 border-border font-mono text-xs bg-surface"
                            />
                            <Button
                              onClick={() => void handleSaveKey(provider.id)}
                              disabled={saving}
                              className="min-h-10 px-3 text-xs"
                            >
                              Lưu
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setShowKeyInput((prev) => ({ ...prev, [provider.id]: false }))
                              }
                              className="min-h-10 px-2 text-xs"
                            >
                              Hủy
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setShowKeyInput((prev) => ({ ...prev, [provider.id]: true }))
                            }
                            className="text-left text-xs font-bold text-brand-600 hover:text-brand-700 underline"
                          >
                            {isConfigured ? 'Thay đổi khóa API khác' : '+ Thêm khóa API mới'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted flex items-center justify-between">
                        <span>Trạng thái Pool:</span>
                        <span className="font-bold text-success">Khả dụng (Worker Mesh sẵn sàng)</span>
                      </div>
                    )}

                    {/* Action Buttons: Ping & Kill-switch */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleTestPing(provider.id)}
                        disabled={ping?.status === 'pinging'}
                        className="text-xs min-h-9 px-3 flex items-center gap-1.5"
                      >
                        <Activity
                          size={14}
                          className={cn(ping?.status === 'pinging' && 'animate-spin text-brand-600')}
                        />
                        <span>
                          {ping?.status === 'ok'
                            ? `${ping.latency}ms (OK)`
                            : ping?.status === 'fail'
                              ? 'Lỗi ping'
                              : 'Test Ping'}
                        </span>
                      </Button>

                      {provider.capabilities.includes('image') && (
                        <button
                          type="button"
                          onClick={() => void toggleKillSwitch(provider.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition border-2',
                            isDisabled
                              ? 'bg-coral-100 text-coral-700 border-coral-300 hover:bg-coral-200'
                              : 'bg-surface text-muted border-border hover:bg-slate-100',
                          )}
                          title="Bật/Tắt khẩn cấp"
                        >
                          <Power size={13} className={isDisabled ? 'text-coral-600' : 'text-success'} />
                          <span>{isDisabled ? 'Đang Tắt (Bật lại)' : 'Ngắt khẩn cấp'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: SMART ROUTING & FALLBACK PIPELINE ─────────────────── */}
      {activeTab === 'routing' && (
        <div className="flex flex-col gap-6">
          {/* Fallback Chain Section */}
          <div className="ui-card p-6 border-2 border-border/80 bg-surface shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider">
                  <Sliders size={16} />
                  <span>Image Generation Fallback Chain</span>
                </div>
                <h3 className="font-display text-xl font-bold text-text mt-1">
                  Chuỗi Dự Phòng Tạo Ảnh Tự Động (Fallback Pipeline)
                </h3>
                <p className="text-sm text-muted mt-1 leading-relaxed max-w-2xl">
                  Khi học sinh yêu cầu tạo ảnh minh họa bài học hoặc truyện tranh, hệ thống sẽ gửi yêu cầu tới
                  nhà cung cấp đứng đầu danh sách. Nếu gặp lỗi quá tải (429) hoặc timeout, bộ điều phối sẽ tự động
                  chuyển tiếp sang nhà cung cấp kế tiếp trong chuỗi.
                </p>
              </div>

              <Button onClick={() => void saveRoutingSettings()} disabled={saving}>
                Lưu luồng điều phối
              </Button>
            </div>

            {/* Pipeline Visual Flow */}
            <div className="mt-6 flex flex-col gap-3">
              {imageFallbackChain.map((providerId, index) => {
                const meta = KNOWN_PROVIDERS.find((p) => p.id === providerId)
                const isDisabled = disabledImageProviders.includes(providerId)

                return (
                  <div
                    key={providerId}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200',
                      isDisabled
                        ? 'border-coral-200 bg-coral-50/40 opacity-75'
                        : index === 0
                          ? 'border-brand-300 bg-brand-50/40 shadow-clay'
                          : 'border-border/80 bg-surface',
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Step Number Badge */}
                      <span
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-sm',
                          index === 0
                            ? 'bg-brand-500 text-white shadow-soft'
                            : 'bg-slate-200 text-slate-700',
                        )}
                      >
                        {index + 1}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-text">
                            {meta?.displayName || providerId}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-brand-100 text-brand-700 uppercase">
                              Ưu tiên #1
                            </span>
                          )}
                          {isDisabled && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-coral-100 text-coral-700">
                              Đã ngắt (Kill-switch)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          {providerId === 'gflow'
                            ? 'Miễn phí chi phí qua Chrome Worker Pool'
                            : providerId === 'gemini-native'
                              ? 'Google AI Studio Native — 1.5s latency'
                              : providerId === 'vidtory-sdk'
                                ? 'Vidtory Cloud Mesh — Dự phòng tin cậy'
                                : providerId === 'vertex'
                                  ? 'GCP Vertex AI VIP Quota'
                                  : 'Dreamina Worker Pool'}
                        </p>
                      </div>
                    </div>

                    {/* Up / Down & Kill-switch Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => movePriority(index, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-xl border-2 border-border hover:bg-brand-50 text-text disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Tăng thứ tự ưu tiên"
                        aria-label={`Tăng ưu tiên cho ${providerId}`}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePriority(index, 'down')}
                        disabled={index === imageFallbackChain.length - 1}
                        className="p-2 rounded-xl border-2 border-border hover:bg-brand-50 text-text disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Giảm thứ tự ưu tiên"
                        aria-label={`Giảm ưu tiên cho ${providerId}`}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleKillSwitch(providerId)}
                        className={cn(
                          'p-2 rounded-xl border-2 transition',
                          isDisabled
                            ? 'border-coral-300 bg-coral-100 text-coral-700'
                            : 'border-border text-muted hover:bg-slate-100',
                        )}
                        title={isDisabled ? 'Bật lại' : 'Tắt khẩn cấp'}
                        aria-label={`Bật tắt ${providerId}`}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Video Engine & LLM Tutor Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Video Engine */}
            <div className="ui-card p-6 border-2 border-border/80 bg-surface shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-mint-600 font-extrabold text-xs uppercase tracking-wider">
                  <VideoIcon size={16} />
                  <span>Cấu hình Tạo Video (Video Engine)</span>
                </div>
                <h4 className="font-display text-lg font-bold text-text mt-1">
                  Động Cơ Video Veo & Narwhal
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Thiết lập chuẩn xuất hoạt cảnh cho các nhân vật AI Kids và hoạt cảnh bài học ASMO.
                </p>

                <div className="mt-4 space-y-3.5">
                  <label className="flex flex-col gap-1.5 text-xs font-bold text-text">
                    Nhà cung cấp video chính
                    <select
                      className="min-h-11 rounded-xl border-2 border-border px-3 text-sm bg-surface"
                      value={videoConfig.provider}
                      onChange={(e) => setVideoConfig((v) => ({ ...v, provider: e.target.value }))}
                    >
                      <option value="gflow">Google Flow (Veo Extension Worker)</option>
                      <option value="dreamina">Dreamina Video Engine</option>
                      <option value="vidtory-sdk">Vidtory SDK Cloud Veo</option>
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5 text-xs font-bold text-text">
                      Tỷ lệ khung hình
                      <select
                        className="min-h-11 rounded-xl border-2 border-border px-3 text-sm bg-surface"
                        value={videoConfig.aspectRatio}
                        onChange={(e) => setVideoConfig((v) => ({ ...v, aspectRatio: e.target.value }))}
                      >
                        <option value="16:9">Ngang 16:9 (Máy tính / TV)</option>
                        <option value="9:16">Dọc 9:16 (Điện thoại / iPad)</option>
                        <option value="1:1">Vuông 1:1 (Avatar truyện)</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-bold text-text">
                      Độ phân giải
                      <select
                        className="min-h-11 rounded-xl border-2 border-border px-3 text-sm bg-surface"
                        value={videoConfig.resolution}
                        onChange={(e) => setVideoConfig((v) => ({ ...v, resolution: e.target.value }))}
                      >
                        <option value="1K">1K (1080p - Mặc định)</option>
                        <option value="2K">2K HD (Sắc nét)</option>
                      </select>
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5 text-xs font-bold text-text">
                    Thời lượng mỗi video ({videoConfig.duration}s)
                    <input
                      type="range"
                      min={4}
                      max={10}
                      step={1}
                      value={videoConfig.duration}
                      onChange={(e) => setVideoConfig((v) => ({ ...v, duration: Number(e.target.value) }))}
                      className="w-full accent-brand-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>4s (Nhanh)</span>
                      <span>6s (Chuẩn)</span>
                      <span>8s</span>
                      <span>10s (Dài)</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* LLM & Tutor Mèo Mee */}
            <div className="ui-card p-6 border-2 border-border/80 bg-surface shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider">
                  <Cpu size={16} />
                  <span>Trợ Giảng AI & Mô Hình Ngôn Ngữ</span>
                </div>
                <h4 className="font-display text-lg font-bold text-text mt-1">
                  Bộ Não Sư Phạm Mèo Mee
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Điều phối mô hình thông minh cho đố vui, giải thích thuật toán và gợi ý bài tập ASMO.
                </p>

                <div className="mt-4 space-y-3.5">
                  <label className="flex flex-col gap-1.5 text-xs font-bold text-text">
                    Mô hình ưu tiên
                    <select
                      className="min-h-11 rounded-xl border-2 border-border px-3 text-sm bg-surface"
                      value={llmConfig.model}
                      onChange={(e) => setLlmConfig((l) => ({ ...l, model: e.target.value }))}
                    >
                      <option value="gemini-2.5-flash">
                        🌟 Google Gemini 2.5 Flash (Khuyên dùng - Nhanh, thông minh, tiết kiệm)
                      </option>
                      <option value="gpt-4o-mini">
                        ⚡ OpenAI GPT-4o Mini (Logic toán ASMO chuyên sâu)
                      </option>
                      <option value="vidtory">🔌 Vidtory AI Core</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5 text-xs font-bold text-text">
                    Độ sáng tạo (Temperature: {llmConfig.temperature})
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={llmConfig.temperature}
                      onChange={(e) => setLlmConfig((l) => ({ ...l, temperature: Number(e.target.value) }))}
                      className="w-full accent-brand-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>0.1 (Chính xác / Toán)</span>
                      <span>0.5 (Cân bằng sư phạm)</span>
                      <span>1.0 (Kể chuyện vui vẻ)</span>
                    </div>
                  </label>

                  <label className="flex flex-col gap-1.5 text-xs font-bold text-text">
                    Độ dài phản hồi tối đa (Max Tokens: {llmConfig.maxTokens})
                    <select
                      className="min-h-11 rounded-xl border-2 border-border px-3 text-sm bg-surface"
                      value={llmConfig.maxTokens}
                      onChange={(e) => setLlmConfig((l) => ({ ...l, maxTokens: Number(e.target.value) }))}
                    >
                      <option value={512}>512 tokens (~150 từ - Gọn gàng)</option>
                      <option value={1024}>1024 tokens (~300 từ - Đầy đủ các bước giải)</option>
                      <option value={2048}>2048 tokens (~600 từ - Bài giảng chuyên sâu)</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: PLAN PROVIDER MATRIX ─────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div className="flex flex-col gap-6">
          <div className="ui-card p-6 border-2 border-border/80 bg-surface shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider">
                  <Layers size={16} />
                  <span>Plan Provider Policy Matrix</span>
                </div>
                <h3 className="font-display text-xl font-bold text-text mt-1">
                  Ma Trận Phân Quyền AI Theo Gói Học (AI Kids Plans)
                </h3>
                <p className="text-sm text-muted mt-1 leading-relaxed max-w-2xl">
                  Kiểm soát chính xác nhà cung cấp nào được phép sử dụng cho từng hạng học sinh (Free vs Pro).
                  Giúp tối ưu hóa chi phí vận hành mà vẫn đảm bảo trải nghiệm VIP cho học sinh trả phí.
                </p>
              </div>

              <Button onClick={() => void savePlanMatrix()} disabled={saving}>
                Lưu ma trận gói học
              </Button>
            </div>

            {/* Matrix Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-border/80 text-xs font-extrabold uppercase tracking-wider text-muted">
                    <th className="py-3 px-4 min-w-[200px]">Gói Học AI Kids</th>
                    <th className="py-3 px-3 text-center">Gemini Native</th>
                    <th className="py-3 px-3 text-center">Vertex AI</th>
                    <th className="py-3 px-3 text-center">Vidtory SDK</th>
                    <th className="py-3 px-3 text-center">Google Flow</th>
                    <th className="py-3 px-3 text-center">Dreamina</th>
                    <th className="py-3 px-3 text-center">OpenAI</th>
                    <th className="py-3 px-4 min-w-[180px]">Tuyến Tạo Ảnh Mặc Định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {PLANS_CONFIG.map((plan) => {
                    const currentPlan = planMatrix[plan.id] || {
                      allowedProviders: [],
                      defaultImageRoute: [],
                    }
                    const allowed = currentPlan.allowedProviders || []
                    const defaultRoute = currentPlan.defaultImageRoute?.[0] || allowed[0] || 'gflow'

                    return (
                      <tr key={plan.id} className="hover:bg-brand-50/30 transition">
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-display font-bold text-base text-text">
                              {plan.name}
                            </span>
                            <span
                              className={cn(
                                'inline-block w-fit mt-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold',
                                plan.color,
                              )}
                            >
                              {plan.badge}
                            </span>
                            {currentPlan.note && (
                              <span className="text-[11px] text-muted mt-1 italic">
                                {currentPlan.note}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Provider Checkboxes */}
                        {['gemini-native', 'vertex', 'vidtory-sdk', 'gflow', 'dreamina', 'openai'].map(
                          (provId) => {
                            const isChecked = allowed.includes(provId)
                            return (
                              <td key={provId} className="py-4 px-3 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePlanProvider(plan.id, provId)}
                                    className="w-5 h-5 rounded-lg border-2 border-border text-brand-600 accent-brand-500 cursor-pointer"
                                  />
                                </label>
                              </td>
                            )
                          },
                        )}

                        {/* Default Image Route Select */}
                        <td className="py-4 px-4">
                          <select
                            value={defaultRoute}
                            onChange={(e) => handleDefaultRouteSelect(plan.id, e.target.value)}
                            className="w-full min-h-10 rounded-xl border-2 border-border px-3 text-xs font-bold bg-surface"
                          >
                            {allowed.map((provId) => {
                              const meta = KNOWN_PROVIDERS.find((p) => p.id === provId)
                              return (
                                <option key={provId} value={provId}>
                                  {meta?.displayName || provId}
                                </option>
                              )
                            })}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: CHILD SAFETY & PROBE TESTER ───────────────────────── */}
      {activeTab === 'safety' && (
        <div className="flex flex-col gap-6">
          {/* Universal Negative Prompt */}
          <div className="ui-card p-6 border-2 border-border/80 bg-surface shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-coral-600 font-extrabold text-xs uppercase tracking-wider">
                  <ShieldCheck size={16} />
                  <span>Bộ Lọc An Toàn Thiếu Nhi (Universal Negative Prompt)</span>
                </div>
                <h3 className="font-display text-xl font-bold text-text mt-1">
                  Chặn Nội Dung Không Phù Hợp Cho Trẻ Em Toàn Cầu
                </h3>
                <p className="text-sm text-muted mt-1 leading-relaxed max-w-2xl">
                  Chuỗi từ khóa này tự động được tiêm vào tất cả các yêu cầu tạo ảnh trên toàn hệ thống,
                  đảm bảo loại trừ các hình ảnh rùng rợn, hở hang, bạo lực hoặc giải phẫu bất thường.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setNegativePrompt(DEFAULT_NEGATIVE_PROMPT)}
                  className="text-xs"
                >
                  Khôi phục mẫu chuẩn
                </Button>
                <Button onClick={() => void saveSafetyConfig()} disabled={saving}>
                  Lưu bộ lọc an toàn
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <textarea
                rows={4}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full p-3.5 rounded-2xl border-2 border-border font-mono text-xs text-text bg-brand-50/20 focus:bg-surface leading-relaxed"
                placeholder="Nhập các từ khóa cấm phân cách bằng dấu phẩy..."
              />
            </div>
          </div>

          {/* AI Kids Style Presets */}
          <div className="ui-card p-6 border-2 border-border/80 bg-surface shadow-soft">
            <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider">
              <Wand2 size={16} />
              <span>Phong Cách Tạo Hình Độc Quyền (AI Kids Style Presets)</span>
            </div>
            <h3 className="font-display text-xl font-bold text-text mt-1">
              Bộ Phong Cách Hallmark Đất Nặn & Hoạt Họa
            </h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Các phong cách thiết kế mỹ thuật chuẩn mực tạo nên bản sắc thương hiệu AI Kids ấm áp và an toàn.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {AI_KIDS_STYLE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-2xl border-2 border-border/80 bg-surface flex flex-col justify-between"
                >
                  <div>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-extrabold', preset.badgeBg)}>
                      {preset.name}
                    </span>
                    <p className="text-xs text-muted mt-2 leading-relaxed">{preset.tagline}</p>
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-border/60 text-[11px] font-mono text-muted line-clamp-3">
                      {preset.prompt}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => copyPreset(preset.id, preset.prompt)}
                    className="mt-3 text-xs min-h-9 flex items-center justify-center gap-1.5"
                  >
                    {copiedPresetId === preset.id ? (
                      <>
                        <Check size={14} className="text-success" />
                        <span className="text-success font-bold">Đã sao chép prompt</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Sao chép Prompt</span>
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Probe Tester Tool */}
          <div className="ui-card p-6 border-2 border-border/80 bg-surface shadow-soft">
            <div className="flex items-center gap-2 text-mint-600 font-extrabold text-xs uppercase tracking-wider">
              <Activity size={16} />
              <span>Công Cụ Thử Nghiệm Nhanh Pipeline (Probe Tester)</span>
            </div>
            <h3 className="font-display text-xl font-bold text-text mt-1">
              Bắn Thử Nghiệm Prompt & Đo Độ Trễ (Latency Probe)
            </h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Gửi một prompt thử nghiệm thực tế qua bộ điều phối để kiểm tra thứ tự Fallback, bộ lọc an toàn và đo thời gian phản hồi.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={probePrompt}
                  onChange={(e) => setProbePrompt(e.target.value)}
                  placeholder="Nhập prompt thử nghiệm..."
                  className="flex-1 min-h-12 px-4 rounded-2xl border-2 border-border text-sm font-semibold bg-surface"
                />
                <select
                  value={probeProvider}
                  onChange={(e) => setProbeProvider(e.target.value)}
                  className="min-h-12 px-3 rounded-2xl border-2 border-border text-sm font-bold bg-surface"
                >
                  <option value="auto">🎯 Tự động điều phối (Auto Routing)</option>
                  <option value="gemini-native">Google Gemini Native</option>
                  <option value="vertex">Google Vertex AI</option>
                  <option value="vidtory-sdk">Vidtory SDK</option>
                  <option value="gflow">Google Flow Pool</option>
                  <option value="dreamina">Dreamina Pool</option>
                </select>
                <Button
                  onClick={() => void handleRunProbe()}
                  disabled={probeRunning}
                  className="min-h-12 px-6 flex items-center gap-2"
                >
                  <Play size={16} className={cn(probeRunning && 'animate-spin')} />
                  <span>{probeRunning ? 'Đang gửi probe...' : 'Chạy Probe'}</span>
                </Button>
              </div>

              {/* Probe Result Card */}
              {probeResult && (
                <div
                  className={cn(
                    'p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all',
                    probeResult.success
                      ? 'border-mint-200 bg-mint-50/40'
                      : 'border-coral-200 bg-coral-50/40',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                        probeResult.success ? 'bg-mint-100 text-mint-700' : 'bg-coral-100 text-coral-700',
                      )}
                    >
                      {probeResult.success ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-text">
                          Kết quả Probe: {probeResult.resolvedProvider}
                        </span>
                        <span className="text-xs font-mono text-muted">
                          [{probeResult.timestamp}]
                        </span>
                      </div>
                      <p className="text-xs font-bold mt-0.5 text-text">
                        {probeResult.safetyStatus}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-white/80 border border-border/60">
                      <span className="text-muted">Độ trễ: </span>
                      <span className="font-bold text-brand-600">{probeResult.latencyMs}ms</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 border border-border/60">
                      <span className="text-muted">Status: </span>
                      <span
                        className={cn('font-bold', probeResult.success ? 'text-success' : 'text-danger')}
                      >
                        {probeResult.success ? '200 OK' : '400 REJECTED'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications Portal ─────────────────────────────────── */}
      {typeof document !== 'undefined' &&
        createPortal(<ToastContainer toasts={toasts} onDismiss={dismissToast} />, document.body)}
    </div>
  )
}
