export type LectureVideoSource =
  | { kind: 'youtube'; src: string }
  | { kind: 'file'; src: string }

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

function youtubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  if (host === 'youtu.be') return url.pathname.slice(1).split('/')[0] ?? null

  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null
  if (url.pathname === '/watch') return url.searchParams.get('v')

  const [prefix, id] = url.pathname.split('/').filter(Boolean)
  return prefix === 'embed' || prefix === 'shorts' ? (id ?? null) : null
}

export function resolveLectureVideo(
  value: string | null | undefined,
): LectureVideoSource | null {
  if (!value) return null

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null

  const id = youtubeId(url)
  if (id !== null) {
    if (!YOUTUBE_ID.test(id)) return null
    const params = new URLSearchParams({
      cc_load_policy: '1',
      cc_lang_pref: 'vi',
      controls: '0',
      disablekb: '1',
      enablejsapi: '1',
      fs: '0',
      iv_load_policy: '3',
      modestbranding: '1',
      playsinline: '1',
      rel: '0',
    })
    return {
      kind: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${id}?${params}`,
    }
  }

  return { kind: 'file', src: url.toString() }
}

export function resolveLectureAudio(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}
