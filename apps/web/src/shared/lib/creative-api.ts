import { api, fetchRemoteBlob, openAuthorizedStream } from './api'

type Job = {
  id?: string
  jobId?: string
  status?: string
  outputUrls?: string[] | string | null
  inputParams?: Record<string, unknown>
  errorMessage?: string | null
}

async function defaultWorkspace(): Promise<string | undefined> {
  const cached = localStorage.getItem('storymee_active_ip_id')
  if (cached) return cached
  try {
    const result = await api<any>('/api/v1/account/workspaces')
    const data = result?.data ?? result
    const ipId = data?.defaultIpId ?? data?.workspaces?.[0]?.ipId ?? data?.childWorkspaces?.[0]?.workspaces?.[0]?.ipId
    if (!ipId) {
      const created = await api<any>('/api/v1/account/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: 'Không gian của tôi' }),
      })
      const createdData = created?.data ?? created
      const id = createdData?.ipId ?? createdData?.id
      if (!id) return undefined
      localStorage.setItem('storymee_active_ip_id', id)
      return id
    }
    localStorage.setItem('storymee_active_ip_id', ipId)
    return ipId
  } catch (error) {
    console.warn('[CreativeAPI] Failed to resolve default workspace, continuing with server default:', error)
    return undefined
  }
}

function outputUrls(value: Job['outputUrls']): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
  } catch {
    return value ? [value] : []
  }
}

async function waitForJob(jobId: string): Promise<Job> {
  try {
    return await waitForJobStream(jobId)
  } catch {
    // SSE can be interrupted by proxies or a deploy. Fall back to bounded,
    // progressively slower polling instead of the old fixed 1.5s loop.
  }
  const delays = [1_000, 1_500, 2_000, 2_500, 3_000]
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const res = await api<any>(`/api/v1/jobs/${encodeURIComponent(jobId)}`)
    const job = (res?.data ?? res) as Job
    const status = String(job.status ?? '').toLowerCase()
    if (['done', 'success', 'completed'].includes(status)) return job
    if (['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
      throw new Error(job.errorMessage || 'StoryMee không hoàn thành được nội dung.')
    }
    await new Promise((resolve) =>
      window.setTimeout(resolve, delays[Math.min(attempt, delays.length - 1)]),
    )
  }
  throw new Error('StoryMee đang xử lý lâu hơn dự kiến. Thử lại sau nhé.')
}

async function waitForJobStream(jobId: string): Promise<Job> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 5 * 60_000)
  try {
    const response = await openAuthorizedStream(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/events`,
      controller.signal,
    )
    if (!response.body) throw new Error('Trình duyệt không hỗ trợ luồng trạng thái.')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) throw new Error('Luồng trạng thái đã đóng trước khi job hoàn tất.')
      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split(/\r?\n\r?\n/)
      buffer = frames.pop() ?? ''
      for (const frame of frames) {
        const data = frame
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('\n')
        if (!data) continue
        const job = JSON.parse(data) as Job
        const status = String(job.status ?? '').toLowerCase()
        if (['done', 'success', 'completed'].includes(status)) {
          controller.abort()
          return job
        }
        if (['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
          throw new Error(job.errorMessage || 'StoryMee không hoàn thành được nội dung.')
        }
      }
    }
  } finally {
    window.clearTimeout(timeout)
    controller.abort()
  }
}

async function createJob(
  jobType: 'image' | 'llm',
  inputParams: Record<string, unknown>,
  ipId?: string
) {
  const finalIpId = ipId ?? (await defaultWorkspace())
  const payload: Record<string, unknown> = { jobType, inputParams }
  if (finalIpId) payload.ipId = finalIpId

  const created = await api<any>('/api/v1/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const data = created?.data ?? created
  const id = data?.id ?? data?.jobId ?? created?.id ?? created?.jobId
  if (!id) throw new Error('Không nhận được Job ID từ StoryMee.')
  return waitForJob(id)
}

export async function generateCreativeImage(input: {
  prompt: string
  imageDataUrl?: string
  refImageUrl?: string
  provider?: string // 'gflow' | 'google-flow'
  aspectRatio?: string
  modelId?: string
  ipId?: string
}): Promise<string> {
  const provider = input.provider || 'gflow'
  const references: string[] = []

  if (input.imageDataUrl) {
    const [header, encoded = ''] = input.imageDataUrl.split(',', 2)
    const mime = header.match(/^data:([^;]+)/)?.[1] ?? 'image/png'
    const binary = atob(encoded)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }
    const blob = new Blob([bytes], { type: mime })
    const form = new FormData()
    form.append('file', blob, 'aikids-reference.png')
    form.append('temporary', '1')
    form.append('assetType', 'aikids-reference')
    const uploaded = await api<{ url?: string; imageUrl?: string }>(
      '/api/v1/media/upload?temporary=1&assetType=aikids-reference',
      { method: 'POST', body: form },
    )
    const url = uploaded.url ?? uploaded.imageUrl
    if (url) references.push(url)
  }

  // Xử lý refImageUrl: Nếu là URL cục bộ (e.g. /assets/...), tải lên media CDN để AI Worker có thể truy cập
  if (input.refImageUrl) {
    if (input.refImageUrl.startsWith('http://') || input.refImageUrl.startsWith('https://')) {
      references.push(input.refImageUrl)
    } else if (typeof window !== 'undefined') {
      try {
        const blob = await fetchRemoteBlob(input.refImageUrl)
        const form = new FormData()
        form.append('file', blob, 'aikids-reference.jpg')
        form.append('temporary', '1')
        form.append('assetType', 'aikids-reference')
        const uploaded = await api<{ url?: string; imageUrl?: string }>(
          '/api/v1/media/upload?temporary=1&assetType=aikids-reference',
          { method: 'POST', body: form },
        )
        const url = uploaded.url ?? uploaded.imageUrl
        if (url) references.push(url)
      } catch (err) {
        console.warn('[CreativeAPI] Failed to upload local refImageUrl to media CDN:', err)
      }
    }
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Creative generation timeout (60s)')), 60000)
  )

  const jobParams: Record<string, unknown> = {
    prompt: input.prompt,
    provider,
    model_id: input.modelId || 'NARWHAL',
    aspect_ratio: input.aspectRatio || '1:1',
    ...(references.length
      ? {
          reference_image_url: references[0],
          reference_image_urls: references,
        }
      : input.refImageUrl
      ? {
          reference_image_url: input.refImageUrl,
          reference_image_urls: [input.refImageUrl],
        }
      : {}),
  }

  console.log('[CreativeAPI] Creating image job with params:', jobParams)

  const job = await Promise.race([
    createJob('image', jobParams, input.ipId),
    timeoutPromise,
  ])
  const url = outputUrls(job.outputUrls)[0]
  if (!url) throw new Error('StoryMee chưa trả về ảnh.')
  return url
}

export async function generateCreativeStory(prompt: string): Promise<string> {
  const job = await createJob('llm', { prompt })
  const text = String(job.inputParams?.outputText ?? '').trim()
  if (!text) throw new Error('StoryMee chưa trả về nội dung truyện.')
  return text
}

export async function fetchCreativeDownload(url: string): Promise<Blob> {
  return fetchRemoteBlob(url)
}
