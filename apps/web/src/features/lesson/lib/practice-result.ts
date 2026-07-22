export type PracticePreview = {
  url: string
  title: string
  mediaKind: 'image' | 'video'
}

export type PracticeResult = {
  generated?: {
    title?: unknown
    imageDataUrl?: unknown
    imageUrl?: unknown
    videoUrl?: unknown
  } | null
  asset?: { name?: unknown; url?: unknown } | null
  project?: { title?: unknown; thumbnail?: unknown } | null
  message?: unknown
}

function safeMediaUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const url = value.trim()
  if (!url) return null
  if (/^data:image\/(?:png|jpe?g|webp);base64,/iu.test(url)) return url
  if (url.startsWith('/') && !url.startsWith('//')) return url

  try {
    return new URL(url).protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

function title(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, 120)
    : fallback
}

export function resolvePracticeReview(result: PracticeResult): {
  preview: PracticePreview | null
  feedback: string
} {
  const feedback =
    typeof result.message === 'string' && result.message.trim()
      ? result.message.trim().slice(0, 240)
      : 'Sản phẩm của con đã được lưu riêng tư.'

  const videoUrl = safeMediaUrl(result.generated?.videoUrl)
  if (videoUrl) {
    return {
      feedback,
      preview: {
        url: videoUrl,
        title: title(result.generated?.title, 'Video của con'),
        mediaKind: 'video',
      },
    }
  }

  const generatedImageUrl = safeMediaUrl(
    result.generated?.imageDataUrl ?? result.generated?.imageUrl,
  )
  if (generatedImageUrl) {
    return {
      feedback,
      preview: {
        url: generatedImageUrl,
        title: title(result.generated?.title, 'Hình ảnh của con'),
        mediaKind: 'image',
      },
    }
  }

  const assetUrl = safeMediaUrl(result.asset?.url)
  if (assetUrl) {
    return {
      feedback,
      preview: {
        url: assetUrl,
        title: title(result.asset?.name, 'Sản phẩm của con'),
        mediaKind: 'image',
      },
    }
  }

  const projectUrl = safeMediaUrl(result.project?.thumbnail)
  return {
    feedback,
    preview: projectUrl
      ? {
          url: projectUrl,
          title: title(result.project?.title, 'Dự án của con'),
          mediaKind: 'image',
        }
      : null,
  }
}
