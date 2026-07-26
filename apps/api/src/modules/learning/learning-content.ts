type SearchableQuest = {
  id: string
  title: string
  hook: string
  skill: string
  videoUrl: string | null
  contentVersion: number
  learnCardsJson: string
  stationsJson: string | null
}

export type LessonSearchResult = {
  kind: 'overview' | 'learn-card' | 'station'
  title: string
  excerpt: string
  anchorType: 'section' | 'activity'
  anchorValue: string
}

function parseArray(value: string): Array<Record<string, unknown>> {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === 'object' && !Array.isArray(item),
        )
      : []
  } catch {
    return []
  }
}

function parseStations(value: string | null): Array<Record<string, unknown>> {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return []
    const stations = (parsed as Record<string, unknown>).stations
    return Array.isArray(stations)
      ? stations.filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === 'object' && !Array.isArray(item),
        )
      : []
  } catch {
    return []
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('vi')
}

export function searchQuestContent(
  quest: SearchableQuest,
  query: string,
): LessonSearchResult[] {
  const needle = normalize(query.trim())
  if (needle.length < 2) return []

  const candidates: LessonSearchResult[] = [
    {
      kind: 'overview',
      title: quest.title,
      excerpt: [quest.hook, quest.skill].filter(Boolean).join(' · '),
      anchorType: 'section',
      anchorValue: 'overview',
    },
    ...parseArray(quest.learnCardsJson).map((card, index) => ({
      kind: 'learn-card' as const,
      title: text(card.title) || `Nội dung ${index + 1}`,
      excerpt: text(card.body) || text(card.content) || text(card.description),
      anchorType: 'section' as const,
      anchorValue: text(card.id) || `learn-card-${index + 1}`,
    })),
    ...parseStations(quest.stationsJson).map((station, index) => ({
      kind: 'station' as const,
      title: text(station.title) || `Hoạt động ${index + 1}`,
      excerpt: [
        text(station.content),
        text(station.instruction),
        text(station.outcome),
      ]
        .filter(Boolean)
        .join(' · '),
      anchorType: 'activity' as const,
      anchorValue: text(station.id) || `station-${index + 1}`,
    })),
  ]

  return candidates
    .filter((item) => normalize(`${item.title} ${item.excerpt}`).includes(needle))
    .slice(0, 30)
}

function directOfflineMedia(value: string | null): string[] {
  if (!value) return []
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return []
    if (
      /(^|\.)youtube(-nocookie)?\.com$|(^|\.)youtu\.be$|(^|\.)vimeo\.com$/i.test(
        url.hostname,
      )
    ) {
      return []
    }
    return /\.(mp4|webm|pdf|png|jpe?g|webp)$/i.test(url.pathname)
      ? [url.toString()]
      : []
  } catch {
    return []
  }
}

export function buildOfflineManifest(
  quest: SearchableQuest,
  grant: { grantId: string; expiresAt: Date },
) {
  return {
    grantId: grant.grantId,
    questId: quest.id,
    contentVersion: quest.contentVersion,
    expiresAt: grant.expiresAt.toISOString(),
    lesson: {
      title: quest.title,
      hook: quest.hook,
      skill: quest.skill,
      learnCards: parseArray(quest.learnCardsJson),
      stations: parseStations(quest.stationsJson),
    },
    media: directOfflineMedia(quest.videoUrl),
  }
}
