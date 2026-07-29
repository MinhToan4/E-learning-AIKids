import { useMemo, useState } from 'react'
import {
  FAVORITE_FRIEND_LIMIT,
  canFavoriteFriend,
  isValidFriendCode,
  normalizeFriendCode,
} from '@aikids/domain'
import {
  readSocialGraph,
  saveSocialGraph,
  type SocialGraphState,
} from '../community-store'

export function SocialGraphPanel({ childId }: { childId: string }) {
  const [graph, setGraph] = useState<SocialGraphState>(() => readSocialGraph(childId))
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const favorites = useMemo(
    () => graph.connections.filter((connection) => connection.favorite),
    [graph.connections],
  )

  const update = (next: SocialGraphState) => {
    setGraph(next)
    saveSocialGraph(childId, next)
  }

  const toggleFavorite = (id: string) => {
    const target = graph.connections.find((connection) => connection.id === id)
    if (!target?.favorite && !canFavoriteFriend(favorites.length)) {
      setMessage(`Con chỉ có thể ghim ${FAVORITE_FRIEND_LIMIT} bạn yêu thích.`)
      return
    }
    update({
      ...graph,
      connections: graph.connections.map((connection) =>
        connection.id === id
          ? { ...connection, favorite: !connection.favorite }
          : connection,
      ),
    })
  }

  const sendInvite = () => {
    if (!isValidFriendCode(code)) {
      setMessage('Mã bạn bè cần đủ 8 chữ hoặc số.')
      return
    }
    setMessage('Đã gửi lời mời · đang chờ phụ huynh xác nhận.')
    setCode('')
  }

  return (
    <section className="ui-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Vòng tròn an toàn</p>
          <h2 className="font-display text-2xl">Bạn bè</h2>
          <p className="text-xs text-muted">Ghim tối đa {FAVORITE_FRIEND_LIMIT} bạn lên Profile.</p>
        </div>
        <div className="rounded-2xl bg-brand-50 px-3 py-2 text-center">
          <p className="text-[10px] font-black uppercase text-muted">Mã của con</p>
          <p className="font-mono text-lg font-black tracking-widest text-brand-700">{graph.friendCode}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {graph.connections.map((friend) => (
          <article key={friend.id} className="relative min-w-28 rounded-2xl bg-brand-50 p-3 text-center">
            <button
              type="button"
              onClick={() => toggleFavorite(friend.id)}
              className="absolute right-1 top-1 rounded-full bg-white p-1 text-sm shadow-soft"
              aria-label={`${friend.favorite ? 'Bỏ ghim' : 'Ghim'} ${friend.name}`}
            >
              {friend.favorite ? '⭐' : '☆'}
            </button>
            <button type="button" className="w-full" aria-label={`Xem hồ sơ ${friend.name}`}>
              <span className="text-3xl">{friend.avatar}</span>
              <span className="mt-1 block text-xs font-extrabold">{friend.name}</span>
              <span className="block text-[10px] text-muted">{friend.label}</span>
            </button>
          </article>
        ))}
      </div>

      <details className="mt-4 rounded-2xl border border-border p-3">
        <summary className="cursor-pointer list-none text-sm font-extrabold text-brand-700">
          ＋ Thêm bạn bằng mã hoặc QR
        </summary>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(normalizeFriendCode(event.target.value))}
            placeholder="Nhập mã 8 ký tự"
            maxLength={8}
            className="field-input min-w-0 flex-1 font-mono uppercase"
          />
          <button type="button" onClick={sendInvite} className="rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white">
            Gửi
          </button>
          <button type="button" onClick={() => setMessage('Camera QR sẽ dùng Social Graph API trên thiết bị thật.')} className="rounded-xl bg-sky-100 px-3 text-xl" aria-label="Quét mã QR">
            ▦
          </button>
        </div>
      </details>

      {graph.requests.some((request) => request.status === 'parent_review') && (
        <div className="mt-3 rounded-2xl bg-sun-50 p-3 text-sm">
          <p className="font-extrabold">⏳ 1 lời mời chờ phụ huynh duyệt</p>
          <p className="text-xs text-muted">Lan Chi muốn kết bạn với con.</p>
        </div>
      )}
      {message && <p className="mt-3 text-xs font-bold text-brand-700" aria-live="polite">{message}</p>}
    </section>
  )
}
