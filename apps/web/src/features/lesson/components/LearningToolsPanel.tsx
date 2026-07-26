import { useCallback, useEffect, useState } from 'react'
import { Bookmark, Download, NotebookPen, Search, Trash2, Wifi } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { useAgeExperience } from '@/shared/age-experience/AgeExperienceProvider'
import { api } from '@/shared/lib/api'
import {
  cacheOfflineManifest,
  hasOfflineGrant,
  learningDeviceId,
  syncOfflineProgress,
  type OfflineManifest,
} from '../lib/offline-learning'

type Note = {
  id: string
  body: string
  anchorType: string
  anchorValue: string
  version: number
}
type BookmarkRow = {
  id: string
  label: string | null
  anchorType: string
  anchorValue: string
}
type SearchResult = {
  kind: string
  title: string
  excerpt: string
  anchorType: string
  anchorValue: string
}

export function LearningToolsPanel({
  questId,
  phase,
}: {
  questId: string
  phase: string
}) {
  const { policy: agePolicy, status: agePolicyStatus, actionLabel } =
    useAgeExperience()
  const [notes, setNotes] = useState<Note[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([])
  const [note, setNote] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [offline, setOffline] = useState(() => hasOfflineGrant(questId))
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    const data = await api<{ notes: Note[]; bookmarks: BookmarkRow[] }>(
      `/api/learning/quests/${questId}/notes`,
    )
    setNotes(data.notes)
    setBookmarks(data.bookmarks)
  }, [questId])

  useEffect(() => {
    void load().catch(() => undefined)
  }, [load])

  useEffect(() => {
    const online = () => {
      void syncOfflineProgress(questId)
        .then((result) => {
          if (result.accepted > 0) {
            setMessage(`Đã đồng bộ ${result.accepted} mốc tiến độ ngoại tuyến.`)
          }
        })
        .catch(() => undefined)
    }
    window.addEventListener('online', online)
    if (navigator.onLine) online()
    return () => window.removeEventListener('online', online)
  }, [questId])

  async function addNote(event: React.FormEvent) {
    event.preventDefault()
    setBusy('note')
    try {
      await api(`/api/learning/quests/${questId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          anchorType: 'section',
          anchorValue: phase,
          body: note,
        }),
      })
      setNote('')
      setMessage('Đã lưu ghi chú vào tài khoản của con.')
      await load()
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Không lưu được ghi chú.')
    } finally {
      setBusy(null)
    }
  }

  async function removeNote(noteId: string) {
    setBusy(noteId)
    try {
      await api(`/api/learning/notes/${noteId}`, { method: 'DELETE' })
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function addBookmark() {
    setBusy('bookmark')
    try {
      await api(`/api/learning/quests/${questId}/bookmarks`, {
        method: 'POST',
        body: JSON.stringify({
          anchorType: 'section',
          anchorValue: phase,
          label: `Phần ${phase}`,
        }),
      })
      setMessage('Đã đánh dấu phần đang học.')
      await load()
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Không đánh dấu được.')
    } finally {
      setBusy(null)
    }
  }

  async function search(event: React.FormEvent) {
    event.preventDefault()
    if (query.trim().length < 2) return
    setBusy('search')
    try {
      const data = await api<{ results: SearchResult[] }>(
        `/api/learning/quests/${questId}/search?q=${encodeURIComponent(query)}`,
      )
      setResults(data.results)
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Không tìm được nội dung.')
    } finally {
      setBusy(null)
    }
  }

  async function downloadOffline() {
    setBusy('offline')
    try {
      const data = await api<{ manifest: OfflineManifest }>(
        `/api/learning/quests/${questId}/offline-manifest`,
        {
          method: 'POST',
          body: JSON.stringify({ deviceId: learningDeviceId() }),
        },
      )
      await cacheOfflineManifest(data.manifest)
      setOffline(true)
      setMessage('Đã lưu bài học để mở khi mất mạng.')
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : 'Bài học chưa thể lưu ngoại tuyến.',
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <details className="ui-card group overflow-hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-extrabold">
        <span className="flex items-center gap-2">
          <NotebookPen size={19} className="text-brand-500" aria-hidden="true" />
          Công cụ học tập
        </span>
        <span className="text-xs text-muted">
          {notes.length} ghi chú · {bookmarks.length} đánh dấu
        </span>
      </summary>
      <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-3">
        <section>
          <h2 className="font-bold">Ghi chú riêng</h2>
          <form className="mt-2 grid gap-2" onSubmit={(event) => void addNote(event)}>
            <textarea
              required
              minLength={1}
              maxLength={2_000}
              className="min-h-24 rounded-xl border-2 border-border p-3 text-sm"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Viết điều con muốn nhớ…"
            />
            <Button type="submit" variant="secondary" disabled={busy === 'note'}>
              Lưu ghi chú
            </Button>
          </form>
          <div className="mt-2 space-y-2">
            {notes.slice(0, 5).map((row) => (
              <div key={row.id} className="flex gap-2 rounded-xl bg-brand-50 p-2 text-sm">
                <p className="min-w-0 flex-1">{row.body}</p>
                <button
                  type="button"
                  className="min-h-11 min-w-11 rounded-xl text-danger hover:bg-coral-100"
                  disabled={busy === row.id}
                  onClick={() => void removeNote(row.id)}
                  aria-label="Xóa ghi chú"
                >
                  <Trash2 className="mx-auto" size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-bold">Tìm trong bài</h2>
          <form className="mt-2 flex gap-2" onSubmit={(event) => void search(event)}>
            <input
              type="search"
              minLength={2}
              maxLength={100}
              className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-border px-3"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nhập ít nhất 2 ký tự"
            />
            <Button type="submit" variant="secondary" disabled={busy === 'search'}>
              <Search size={17} aria-label="Tìm" />
            </Button>
          </form>
          <div className="mt-2 space-y-2">
            {results.map((result) => (
              <article key={`${result.anchorType}:${result.anchorValue}`} className="rounded-xl bg-sky-50 p-3">
                <p className="text-sm font-bold">{result.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{result.excerpt}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-bold">Đánh dấu & ngoại tuyến</h2>
          <div className="mt-2 grid gap-2">
            <Button
              variant="secondary"
              disabled={busy === 'bookmark'}
              onClick={() => void addBookmark()}
            >
              <Bookmark size={17} aria-hidden="true" />
              Đánh dấu phần {phase}
            </Button>
            {agePolicy?.permissionPolicy.canDownloadLessons && (
              <Button
                variant="secondary"
                disabled={busy === 'offline'}
                onClick={() => void downloadOffline()}
              >
                {offline ? <Wifi size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
                {busy === 'offline'
                  ? actionLabel('offlineSaving', 'Đang lưu…')
                  : offline
                    ? actionLabel('offlineUpdate', 'Cập nhật bản ngoại tuyến')
                    : actionLabel('offlineDownload', 'Lưu để học khi mất mạng')}
              </Button>
            )}
          </div>
          {agePolicyStatus === 'configuration_required' && (
            <p className="mt-3 rounded-xl bg-sun-50 px-3 py-2 text-sm text-warning">
              Nhà trường chưa công bố quyền học ngoại tuyến cho nhóm tuổi của con.
            </p>
          )}
          {message && (
            <p className="mt-3 rounded-xl bg-mint-50 px-3 py-2 text-sm" role="status">
              {message}
            </p>
          )}
        </section>
      </div>
    </details>
  )
}
