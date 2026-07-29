import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/shared/store/auth'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import {
  DEFAULT_COMMUNITY_SETTINGS,
  DEMO_CONNECTIONS,
  readCommunitySettings,
  saveCommunitySettings,
  type Audience,
  type SharedSurface,
} from '../community-store'

const audienceCopy: Record<Audience, { icon: string; title: string; note: string }> = {
  friends: { icon: '🧑‍🤝‍🧑', title: 'Bạn bè', note: 'Bạn đã được phụ huynh chấp thuận' },
  family: { icon: '🏡', title: 'Gia đình', note: 'Thành viên trong Family Space' },
  school: { icon: '🏫', title: 'Trường học', note: 'Giáo viên và lớp đang theo học' },
}

export function CommunityPage() {
  const user = useAuth((state) => state.user)
  const childId = user?.id ?? ''
  const [settings, setSettings] = useState(() =>
    childId ? readCommunitySettings(childId) : DEFAULT_COMMUNITY_SETTINGS,
  )
  const [message, setMessage] = useState('')

  const toggle = (surface: SharedSurface, audience: Audience) => {
    const next = {
      ...settings,
      [surface]: {
        ...settings[surface],
        [audience]: !settings[surface][audience],
      },
    }
    setSettings(next)
    if (childId) saveCommunitySettings(childId, next)
  }

  const copyProfile = async () => {
    const url = `${window.location.origin}/u/${childId}`
    await navigator.clipboard?.writeText(url)
    setMessage('Đã sao chép link trang cá nhân!')
  }

  return (
    <PageMotion className="mx-auto flex max-w-5xl flex-col gap-5">
      <header className="ui-card overflow-hidden bg-gradient-to-br from-brand-600 to-sky-600 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[.2em] text-sun-200">Vòng tròn an toàn</p>
        <h1 className="mt-1 font-display text-4xl">Bạn bè & Chia sẻ</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/85">
          Con chọn ai được xem hồ sơ và workspace. Kết bạn mới luôn cần phụ huynh hoặc nhà trường xác nhận.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to={`/u/${childId}`} className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-brand-700">
            Xem trang cá nhân
          </Link>
          <button type="button" onClick={() => void copyProfile()} className="rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold text-white">
            🔗 Sao chép link
          </button>
        </div>
        {message && <p className="mt-3 text-xs font-bold text-sun-100" aria-live="polite">{message}</p>}
      </header>

      <section className="ui-card p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Kết nối của con</p>
            <h2 className="font-display text-2xl">Bạn bè và cộng đồng</h2>
          </div>
          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-extrabold text-success">3 kết nối</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {DEMO_CONNECTIONS.map((connection) => (
            <article key={connection.id} className="rounded-3xl border border-border bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-3xl">{connection.avatar}</span>
                <div>
                  <h3 className="font-extrabold">{connection.name}</h3>
                  <p className="text-xs text-muted">{connection.label}</p>
                </div>
              </div>
              <button type="button" className="mt-3 w-full rounded-xl bg-brand-50 px-3 py-2 text-xs font-extrabold text-brand-700">
                Xem trang cá nhân
              </button>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Dữ liệu mẫu UI — danh sách thật sẽ được đồng bộ từ Social Graph API của StoryMee Hub.
        </p>
      </section>

      <section className="ui-card p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-wider text-brand-600">Quyền riêng tư</p>
        <h2 className="font-display text-2xl">Ai được xem gì?</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[1fr_92px_92px] gap-2 bg-brand-50 px-4 py-3 text-xs font-black uppercase text-muted">
            <span>Nhóm người xem</span><span className="text-center">Hồ sơ</span><span className="text-center">Workspace</span>
          </div>
          {(Object.keys(audienceCopy) as Audience[]).map((audience) => (
            <div key={audience} className="grid grid-cols-[1fr_92px_92px] items-center gap-2 border-t border-border px-4 py-4">
              <div className="min-w-0">
                <p className="font-extrabold">{audienceCopy[audience].icon} {audienceCopy[audience].title}</p>
                <p className="truncate text-xs text-muted">{audienceCopy[audience].note}</p>
              </div>
              {(['profile', 'workspace'] as SharedSurface[]).map((surface) => (
                <button
                  key={surface}
                  type="button"
                  role="switch"
                  aria-checked={settings[surface][audience]}
                  aria-label={`${surface === 'profile' ? 'Hồ sơ' : 'Workspace'} cho ${audienceCopy[audience].title}`}
                  onClick={() => toggle(surface, audience)}
                  className={`mx-auto h-8 w-14 rounded-full p-1 transition ${settings[surface][audience] ? 'bg-mint-400' : 'bg-slate-200'}`}
                >
                  <span className={`block h-6 w-6 rounded-full bg-white shadow transition ${settings[surface][audience] ? 'translate-x-6' : ''}`} />
                </button>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-2xl bg-sun-50 p-3 text-xs font-bold text-sun-700">
          🛡️ Bật chia sẻ không tự động công khai tác phẩm. Mỗi tác phẩm vẫn cần phụ huynh duyệt riêng.
        </p>
      </section>
    </PageMotion>
  )
}
