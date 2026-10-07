export type BackpackProject = {
  id: string
  title: string
  kind: string
  thumbnail: string
  content?: string
  shareStatus: string
  jobId?: string | null
  questId?: string | null
}

/**
 * Lọc loại bỏ 100% file rác nội bộ, draft hỏng hoặc file không có hình ảnh hiển thị hợp lệ
 */
export function isCleanDisplayableWork(project: { title?: string; thumbnail?: string }): boolean {
  if (!project) return false
  const title = (project.title || '').trim()
  if (!title) return false

  const lowerTitle = title.toLowerCase()
  if (lowerTitle.endsWith('.json')) return false
  if (/storyplot[-_\s]?comic/i.test(lowerTitle)) return false
  if (/prompt[-_\s]?schema/i.test(lowerTitle)) return false
  if (/^temp[-_\s]|draft[-_\s]|untitled[-_\s]internal/i.test(lowerTitle)) return false

  const thumb = (project.thumbnail || '').trim()
  if (!thumb) return false
  if (thumb.endsWith('.json')) return false
  const isImageLike =
    thumb.startsWith('data:image/') ||
    thumb.startsWith('blob:') ||
    thumb.startsWith('http://') ||
    thumb.startsWith('https://') ||
    thumb.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(thumb)
  if (!isImageLike) return false

  return true
}

/**
 * Chuyển tên tác phẩm thành tiếng Việt thân thiện, trong sáng cho học sinh
 */
export function friendlyProjectTitle(title: string): string {
  if (!title) return 'Tác phẩm của con'
  const clean = title
    .replace(/\.(json|png|jpe?g|webp|gif|mp4)$/i, '')
    .replace(/^storyPlot[-_\s]?comic[-_\s]?\d*/i, 'Truyện tranh')
    .replace(/^prompt[-_\s]?schema[-_\s]?\d*/i, 'Ý tưởng sáng tạo')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return clean || 'Tác phẩm của con'
}

/**
 * Đọc toàn bộ tác phẩm được tạo cục bộ trên trình duyệt:
 * 1. aiki_backpack_saved_works (lưu từ bài học hoặc xưởng sáng tạo)
 * 2. aikids_studio_recent_creations (tranh vừa tạo từ Xưởng Sáng Tạo)
 * 3. aiki_backpack_items_* (ghi chú & kỷ vật bài học)
 * 4. aiki_studio_session_* (phiên vẽ trong các trạm bài học)
 */
export function readLocalBackpackWorks(): BackpackProject[] {
  const works: BackpackProject[] = []
  if (typeof window === 'undefined' || !window.localStorage) return works

  // 1. Tác phẩm đã lưu từ bài học hoặc xưởng sáng tạo
  try {
    const raw = localStorage.getItem('aiki_backpack_saved_works')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const thumb = item.url || item.thumbnail || ''
          if (thumb) {
            works.push({
              id: item.id || `bp-${Date.now()}-${Math.random()}`,
              title: item.title || 'Tác phẩm tranh vẽ',
              kind: item.kind || 'image',
              thumbnail: thumb,
              content: item.prompt || item.content || '',
              shareStatus: item.shareStatus || 'private',
              questId: item.lessonId || item.stationLabel || null,
            })
          }
        }
      }
    }
  } catch {}

  // 2. Tranh mới vẽ từ Xưởng Sáng Tạo (aikids_studio_recent_creations)
  try {
    const studioRaw = localStorage.getItem('aikids_studio_recent_creations')
    if (studioRaw) {
      const parsedStudio = JSON.parse(studioRaw)
      if (Array.isArray(parsedStudio)) {
        for (const item of parsedStudio) {
          const thumb = item?.url || item?.thumbnail || ''
          if (thumb && !works.some((w) => w.thumbnail === thumb || w.id === item.id)) {
            works.push({
              id: item.id || `studio-${item.createdAt || Math.random()}`,
              title: item.title || (item.styleName ? `Tranh ${item.styleName}` : 'Tranh sáng tạo'),
              kind: 'image',
              thumbnail: thumb,
              content: item.title || '',
              shareStatus: 'private',
              questId: 'workshop',
            })
          }
        }
      }
    }
  } catch {}

  // 3. Các kỷ vật và ghi chú bài học (aiki_backpack_items_*)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('aiki_backpack_items_')) {
        const rawItems = localStorage.getItem(key)
        if (rawItems) {
          const parsed = JSON.parse(rawItems)
          if (Array.isArray(parsed)) {
            for (const it of parsed) {
              const thumb = it.url || it.thumbnail || ''
              if (thumb && !works.some((w) => w.thumbnail === thumb || w.id === it.id)) {
                works.push({
                  id: it.id || `lesson-item-${Math.random()}`,
                  title: it.lessonTitle ? `Bài học: ${it.lessonTitle}` : 'Ghi chú bài học',
                  kind: it.category === 'notebook' ? 'story' : 'image',
                  thumbnail: thumb,
                  content: it.prompt || '',
                  shareStatus: 'private',
                  questId: it.lessonId || 'lesson',
                })
              }
            }
          }
        }
      }
    }
  } catch {}

  // 4. Tranh vẽ từ các phiên học (aiki_studio_session_*)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('aiki_studio_session_')) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            for (const it of parsed) {
              const thumb = it?.url || it?.thumbnail || ''
              if (thumb && !works.some((w) => w.thumbnail === thumb || w.id === it.id)) {
                works.push({
                  id: it.id || `session-${Math.random()}`,
                  title: it.prompt ? `Tranh: ${it.prompt}` : 'Tranh bài học',
                  kind: 'image',
                  thumbnail: thumb,
                  content: it.prompt || '',
                  shareStatus: 'private',
                  questId: key.replace('aiki_studio_session_', '') || 'lesson',
                })
              }
            }
          }
        }
      }
    }
  } catch {}

  return works
}

/**
 * Trộn tác phẩm cục bộ và từ máy chủ, ưu tiên giữ các tác phẩm mới vẽ và tránh trùng lặp
 */
export function mergeBackpackWorks<T extends { id?: string; thumbnail?: string }>(
  localWorks: T[],
  remoteWorks: T[],
): T[] {
  const merged: T[] = [...localWorks]
  const localIds = new Set(localWorks.map((l) => l.id).filter(Boolean))
  const localThumbs = new Set(localWorks.map((l) => l.thumbnail).filter(Boolean))

  for (const r of remoteWorks) {
    if (!r) continue
    if (r.id && localIds.has(r.id)) continue
    if (r.thumbnail && localThumbs.has(r.thumbnail)) continue
    merged.push(r)
  }

  return merged
}
