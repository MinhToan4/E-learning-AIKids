import type { GeneratedResult, PromptParts } from '@/types'
import { assemblePrompt } from '@/lib/prompt'
import { buildSceneSvg } from '@/lib/svg-scenes'

const STAGES = [
  'Đọc ý tưởng của con…',
  'Vẽ ba phiên bản an toàn…',
  'Kiểm tra an toàn…',
] as const

export function getGenerationStages() {
  return STAGES
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Deterministic mock image generation — no external AI API. */
export async function generateImages(
  prompt: PromptParts,
  options?: {
    onStage?: (stage: string) => void
    forceFail?: boolean
    signal?: AbortSignal
  },
): Promise<GeneratedResult[]> {
  const seed = assemblePrompt(prompt)

  for (const stage of STAGES) {
    if (options?.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    options?.onStage?.(stage)
    await wait(700)
  }

  if (options?.forceFail) {
    throw new Error('GENERATION_FAILED')
  }

  await wait(200)

  return [
    {
      id: 'result-a',
      title: 'Phiên bản A',
      imageDataUrl: buildSceneSvg(seed, 0),
      matches: { character: true, action: true, environment: true },
    },
    {
      id: 'result-b',
      title: 'Phiên bản B',
      imageDataUrl: buildSceneSvg(seed, 1, true),
      matches: { character: true, action: true, environment: false },
      oddDetail: 'Ba mặt trăng dù câu chuyện chỉ có một',
    },
    {
      id: 'result-c',
      title: 'Phiên bản C',
      imageDataUrl: buildSceneSvg(seed, 2),
      matches: { character: true, action: true, environment: true },
    },
  ]
}

export async function mockRenderVideo(
  onStage?: (stage: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const stages = [
    'Chuẩn bị cảnh…',
    'Ghép giọng kể…',
    'Thêm phụ đề…',
    'Hoàn thành…',
  ]
  for (const stage of stages) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    onStage?.(stage)
    await wait(800)
  }
}
