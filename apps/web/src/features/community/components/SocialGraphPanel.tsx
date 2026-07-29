import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  FAVORITE_FRIEND_LIMIT,
  canFavoriteFriend,
  isValidFriendCode,
  normalizeFriendCode,
} from '@/shared/lib/creation/social-rules'
import { api } from '@/shared/lib/api'

type Connection = {
  id: string
  friend: {
    id: string
    name: string
    avatarUrl?: string | null
    level: number
    slug: string
  }
  favorite: boolean
}

type Invite = { id: string; status: string; expiresAt: string }
type Graph = { connections: Connection[]; invites: Invite[] }

export function SocialGraphPanel({ childId: _childId }: { childId: string }) {
  const [graph, setGraph] = useState<Graph>({ connections: [], invites: [] })
  const [myCode, setMyCode] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const favorites = useMemo(
    () => graph.connections.filter((connection) => connection.favorite),
    [graph.connections],
  )

  const load = useCallback(async () => {
    try {
      setGraph(await api<Graph>('/api/gamification/social/graph'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chưa tải được vòng tròn bạn bè.')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const createCode = async () => {
    setBusy(true)
    try {
      const result = await api<{ invite: { code: string } }>('/api/gamification/social/invites', { method: 'POST' })
      setMyCode(result.invite.code)
      setMessage('Mã có hiệu lực trong 15 phút.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chưa tạo được mã kết bạn.')
    } finally {
      setBusy(false)
    }
  }

  const toggleFavorite = async (connection: Connection) => {
    if (!connection.favorite && !canFavoriteFriend(favorites.length)) {
      setMessage(`Con chỉ có thể ghim ${FAVORITE_FRIEND_LIMIT} bạn yêu thích.`)
      return
    }
    const favorite = !connection.favorite
    setGraph((current) => ({
      ...current,
      connections: current.connections.map((item) =>
        item.id === connection.id ? { ...item, favorite } : item),
    }))
    try {
      await api(`/api/gamification/social/connections/${connection.id}/favorite`, {
        method: 'PUT',
        body: JSON.stringify({ favorite }),
      })
    } catch (error) {
      await load()
      setMessage(error instanceof Error ? error.message : 'Chưa cập nhật được bạn yêu thích.')
    }
  }

  const acceptCode = async () => {
    if (!isValidFriendCode(code)) {
      setMessage('Mã bạn bè cần đủ 8 chữ hoặc số.')
      return
    }
    setBusy(true)
    try {
      await api('/api/gamification/social/invites/accept', {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
      setMessage('Đã nhận lời mời · đang chờ phụ huynh hai bên xác nhận.')
      setCode('')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không sử dụng được mã này.')
    } finally {
      setBusy(false)
    }
  }

  const block = async (connection: Connection) => {
    if (!window.confirm(`Ẩn ${connection.friend.name} khỏi vòng tròn và bảng hoạt động?`)) return
    try {
      await api(`/api/gamification/social/connections/${connection.id}`, { method: 'DELETE' })
      setMessage('Đã ẩn kết nối. Ba/mẹ có thể hỗ trợ nếu con muốn kết nối lại.')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chưa ẩn được kết nối.')
    }
  }

  return (
    <section className="ui-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Vòng tròn an toàn</p>
          <h2 className="font-display text-2xl">Bạn bè</h2>
          <p className="text-xs text-muted">Ghim tối đa {FAVORITE_FRIEND_LIMIT} bạn lên Profile.</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void createCode()}
          className="rounded-2xl bg-brand-50 px-3 py-2 text-center disabled:opacity-50"
        >
          <span className="block text-[10px] font-black uppercase text-muted">{myCode ? 'Mã của con' : 'Tạo mã 15 phút'}</span>
          <span className="font-mono text-lg font-black tracking-widest text-brand-700">{myCode || '＋＋＋＋'}</span>
        </button>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {graph.connections.length === 0 && (
          <p className="rounded-2xl bg-brand-50 p-4 text-sm text-muted">Chưa có bạn trong vòng tròn. Con có thể tạo hoặc nhập mã kết bạn.</p>
        )}
        {graph.connections.map((connection) => (
          <article key={connection.id} className="relative min-w-28 rounded-2xl bg-brand-50 p-3 text-center">
            <button
              type="button"
              onClick={() => void toggleFavorite(connection)}
              className="absolute right-1 top-1 rounded-full bg-white p-1 text-sm shadow-soft"
              aria-label={`${connection.favorite ? 'Bỏ ghim' : 'Ghim'} ${connection.friend.name}`}
            >
              {connection.favorite ? '⭐' : '☆'}
            </button>
            <Link to={`/u/${connection.friend.slug}`} className="block w-full" aria-label={`Xem hồ sơ ${connection.friend.name}`}>
              {connection.friend.avatarUrl
                ? <img src={connection.friend.avatarUrl} alt="" className="mx-auto h-10 w-10 rounded-full object-cover" />
                : <span className="text-3xl">🧑‍🎨</span>}
              <span className="mt-1 block text-xs font-extrabold">{connection.friend.name}</span>
              <span className="block text-[10px] text-muted">Cấp {connection.friend.level}</span>
            </Link>
            <button type="button" onClick={() => void block(connection)} className="mt-2 text-[10px] font-bold text-muted hover:text-red-600">
              Ẩn kết nối
            </button>
          </article>
        ))}
      </div>

      <details className="mt-4 rounded-2xl border border-border p-3">
        <summary className="cursor-pointer list-none text-sm font-extrabold text-brand-700">＋ Nhập mã kết bạn</summary>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(normalizeFriendCode(event.target.value))}
            placeholder="Nhập mã 8 ký tự"
            maxLength={8}
            className="field-input min-w-0 flex-1 font-mono uppercase"
          />
          <button type="button" disabled={busy} onClick={() => void acceptCode()} className="rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white disabled:opacity-50">
            Gửi
          </button>
        </div>
      </details>

      {graph.invites.some((invite) => invite.status === 'parent_review') && (
        <div className="mt-3 rounded-2xl bg-sun-50 p-3 text-sm">
          <p className="font-extrabold">⏳ Có lời mời chờ phụ huynh hai bên duyệt</p>
        </div>
      )}
      {message && <p className="mt-3 text-xs font-bold text-brand-700" aria-live="polite">{message}</p>}
    </section>
  )
}
