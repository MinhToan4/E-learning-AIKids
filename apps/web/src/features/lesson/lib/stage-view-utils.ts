import type { ParsedGoalCard } from '../types/stage-schema'

export const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false
  const trimmed = url.trim()
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  )
}

export function parseGoalCard(raw: string, defaultIdx: number): ParsedGoalCard {
  let text = raw.trim()
  let index = defaultIdx + 1
  const idxMatch = text.match(/^\[(\d+)\]\s*/)
  if (idxMatch) {
    index = parseInt(idxMatch[1], 10)
    text = text.slice(idxMatch[0].length).trim()
  }

  let note: string | undefined
  const noteMatch = text.match(/\s*\(([^)]+)\)\s*$/)
  if (noteMatch) {
    note = noteMatch[1].trim()
    text = text.slice(0, noteMatch.index).trim()
  }

  let title = text
  let content: string | undefined
  if (text.includes('—')) {
    const parts = text.split('—')
    title = parts[0].trim()
    content = parts.slice(1).join('—').trim()
  } else if (text.includes(':')) {
    const parts = text.split(':')
    title = parts[0].trim()
    content = parts.slice(1).join(':').trim()
  }

  return { index, title, content, note }
}

export const GOAL_CARD_STYLES = [
  { bg: 'bg-blue-50/90 border-blue-200 text-blue-950', badge: 'bg-blue-500 text-white shadow-2xs' },
  { bg: 'bg-amber-50/90 border-amber-200 text-amber-950', badge: 'bg-amber-500 text-white shadow-2xs' },
  { bg: 'bg-emerald-50/90 border-emerald-200 text-emerald-950', badge: 'bg-emerald-500 text-white shadow-2xs' },
  { bg: 'bg-orange-50/90 border-orange-200 text-orange-950', badge: 'bg-orange-500 text-white shadow-2xs' },
  { bg: 'bg-rose-50/90 border-rose-200 text-rose-950', badge: 'bg-rose-500 text-white shadow-2xs' },
  { bg: 'bg-purple-50/90 border-purple-200 text-purple-950', badge: 'bg-purple-500 text-white shadow-2xs' },
] as const

export function getYouTubeWatchUrl(url?: string): string {
  if (!url) return 'https://www.youtube.com'
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (youtuBeMatch) return `https://www.youtube.com/watch?v=${youtuBeMatch[1]}`
  const embedMatch = url.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (embedMatch) return `https://www.youtube.com/watch?v=${embedMatch[1]}`
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return `https://www.youtube.com/watch?v=${url.trim()}`
  return url
}

export function buildVideoEmbedUrl(url?: string, seekSec?: number | null): string {
  let raw = url || ''
  let videoId = ''
  let incomingParams: URLSearchParams | null = null

  if (raw) {
    try {
      const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
      incomingParams = parsed.searchParams
      const youtuBeMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
      if (youtuBeMatch) {
        videoId = youtuBeMatch[1]
      } else if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v') || ''
      } else {
        const embedMatch = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/)
        if (embedMatch) {
          videoId = embedMatch[1]
        } else if (/^[a-zA-Z0-9_-]{11}$/.test(raw.trim())) {
          videoId = raw.trim()
        }
      }
    } catch {
      if (/^[a-zA-Z0-9_-]{11}$/.test(raw.trim())) {
        videoId = raw.trim()
      }
    }
  }

  if (!videoId) {
    videoId = 'NMdHhsLY5jc'
  }

  const host = raw.includes('youtube-nocookie.com') ? 'www.youtube-nocookie.com' : 'www.youtube.com'

  try {
    const embed = new URL(`https://${host}/embed/${videoId}`)
    if (incomingParams) {
      incomingParams.forEach((val, key) => {
        if (key !== 'v') {
          embed.searchParams.set(key, val)
        }
      })
    }
    embed.searchParams.set('controls', '1')
    embed.searchParams.set('disablekb', '0')
    embed.searchParams.set('enablejsapi', '1')
    embed.searchParams.set('fs', '1')
    embed.searchParams.set('iv_load_policy', '3')
    embed.searchParams.set('modestbranding', '1')
    embed.searchParams.set('playsinline', '1')
    embed.searchParams.set('rel', '0')
    if (
      typeof window !== 'undefined' &&
      window.location?.origin &&
      window.location.origin !== 'null' &&
      (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ) {
      embed.searchParams.set('origin', window.location.origin)
      embed.searchParams.set('widget_referrer', window.location.origin)
    }
    if (seekSec !== null && seekSec !== undefined) {
      embed.searchParams.set('start', String(Math.max(0, Math.floor(seekSec))))
    }
    return embed.toString()
  } catch {
    return `https://www.youtube-nocookie.com/embed/${videoId}`
  }
}
