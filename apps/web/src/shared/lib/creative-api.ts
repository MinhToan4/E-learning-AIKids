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

async function pollJob(jobId: string, signal: AbortSignal): Promise<Job> {
  while (!signal.aborted) {
    let job: Job | null = null
    try {
      const res = await api<any>(`/api/v1/jobs/${encodeURIComponent(jobId)}`)
      job = (res?.data ?? res) as Job
    } catch (err) {
      if (err instanceof Error && err.message.includes('StoryMee không hoàn thành')) throw err
    }

    if (job) {
      const status = String(job.status ?? '').toLowerCase()
      if (['done', 'success', 'completed'].includes(status)) return job
      if (['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
        throw new Error(job.errorMessage || 'StoryMee không hoàn thành được nội dung.')
      }
    }

    if (signal.aborted) break
    await new Promise((r) => {
      const timer = window.setTimeout(r, 1500)
      signal.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timer)
          r(undefined)
        },
        { once: true },
      )
    })
  }
  throw new Error('Polling aborted')
}

async function waitForJobStream(jobId: string, signal?: AbortSignal): Promise<Job> {
  const controller = new AbortController()
  const onParentAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onParentAbort, { once: true })
  }
  const timeout = window.setTimeout(() => controller.abort(), 120_000)
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
          const err = new Error(job.errorMessage || 'StoryMee không hoàn thành được nội dung.')
          ;(err as any).isJobError = true
          throw err
        }
      }
    }
  } finally {
    window.clearTimeout(timeout)
    if (signal) {
      signal.removeEventListener('abort', onParentAbort)
    }
    controller.abort()
  }
}

async function waitForJob(jobId: string): Promise<Job> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, 120_000)

  // Bọc stream để nếu SSE gặp sự cố kết nối/proxy ngắt, pollJob vẫn tiếp tục kiểm tra
  const streamPromise = waitForJobStream(jobId, controller.signal).catch((err) => {
    if (
      (err as any)?.isJobError ||
      (err instanceof Error && err.message.includes('StoryMee không hoàn thành'))
    ) {
      throw err
    }
    console.warn('[CreativeAPI] SSE stream interrupted, continuing with polling:', err)
    return new Promise<Job>(() => {})
  })

  try {
    return await Promise.race([
      streamPromise,
      pollJob(jobId, controller.signal),
    ])
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error('Thời gian vẽ tranh kéo dài hơn dự kiến (120s). Bé vui lòng thử lại nhé!')
    }
    throw err
  } finally {
    window.clearTimeout(timeoutId)
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
    try {
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
      if (url) {
        const origin = typeof window !== 'undefined'
          ? (window.location.origin.includes('localhost') ? 'https://dev-hub.storymee.com' : window.location.origin)
          : 'https://dev-hub.storymee.com'
        const absoluteUrl = url.startsWith('http') ? url : `${origin}${url}`
        references.push(absoluteUrl)
      }
    } catch (err) {
      console.warn('[CreativeAPI] Failed to upload canvas imageDataUrl to media CDN:', err)
    }
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
        if (url) {
          const origin = typeof window !== 'undefined'
            ? (window.location.origin.includes('localhost') ? 'https://dev-hub.storymee.com' : window.location.origin)
            : 'https://dev-hub.storymee.com'
          const absoluteUrl = url.startsWith('http') ? url : `${origin}${url}`
          references.push(absoluteUrl)
        }
      } catch (err) {
        console.warn('[CreativeAPI] Failed to upload local refImageUrl to media CDN:', err)
      }
    }
  }

  // QUAN TRỌNG NHẤT: Luôn đưa cả input.imageDataUrl (chuỗi data:image/png;base64,...) vào đầu danh sách references
  if (input.imageDataUrl) {
    references.unshift(input.imageDataUrl)
  }

  let safePrompt = (input.prompt || '').trim()
  const pLower = safePrompt.toLowerCase()
  if (!pLower.includes('cartoon') && !pLower.includes('illustration') && !pLower.includes('soft clay')) {
    safePrompt = `Cute 3D cartoon animation style, soft clay storybook illustration, vibrant warm pastel colors: ${safePrompt}. Friendly playful children's art, strictly non-realistic.`
  }

  const jobParams: Record<string, unknown> = {
    prompt: safePrompt,
    negative_prompt: 'realistic photo, photorealism, real life photo, camera photography, human photograph, horror, violence, deformed',
    provider,
    model_id: input.modelId || 'NARWHAL',
    aspect_ratio: input.aspectRatio || '4:3',
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

  // Bắt đầu tính timeout 120s ngay khi createJob bắt đầu, tránh bị hết giờ sớm do upload ảnh
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('Thời gian vẽ tranh kéo dài hơn dự kiến (120s). Bé vui lòng thử lại nhé!')),
      120000,
    ),
  )

  const job = await Promise.race([
    createJob('image', jobParams, input.ipId),
    timeoutPromise,
  ])
  const rawUrls = job.outputUrls ?? (job as any).output_urls ?? (job as any).imageUrl ?? (job as any).url
  const url = outputUrls(rawUrls)[0]
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

export async function saveCreativeArt(params: {
  title?: string
  url: string
  kind?: string
  creativeKind?: string
}): Promise<{ id?: string; url: string }> {
  const { title = 'Bức tranh của con', url, kind = 'art', creativeKind = 'art' } = params

  // 1. Promote media: Gọi /api/media/promote để lưu vĩnh viễn
  try {
    await api('/api/media/promote', {
      method: 'POST',
      body: JSON.stringify({ url, purpose: 'creative_workshop', creativeKind }),
    })
  } catch (err) {
    console.warn('[CreativeAPI] Media promote warning:', err)
  }

  // 2. Tự động lưu vào /api/projects để lập tức xuất hiện trong tab "Ảnh đã tạo" của Hồ sơ học sinh (ProfilePage)
  let projectRes: any
  try {
    projectRes = await api('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title,
        thumbnail: url,
        url,
        kind,
        creativeKind,
      }),
    })
  } catch (err) {
    console.warn('[CreativeAPI] /api/projects save warning:', err)
  }

  return { id: projectRes?.id ?? projectRes?.project?.id, url }
}
