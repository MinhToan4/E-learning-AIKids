import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError, api } from '@/shared/lib/api'

type PublicProfileProjection = {
  profile: {
    slug: string
    name: string
    avatarUrl?: string | null
    level: number
    xp: number
    modules: string[]
    themeKey?: string | null
    frameKey?: string | null
    backgroundKey?: string | null
  }
  works: Array<{
    id: string
    name: string
    description?: string | null
    kind: string
    updatedAt: string
    permission: 'view' | 'remix'
  }>
}

const moduleCards = [
  { id: 'storybook', icon: '📖', title: 'Storybook', detail: 'Hành trình huyền thoại con chọn chia sẻ' },
  { id: 'progress', icon: '📈', title: 'Tiến bộ học tập', detail: 'Những cột mốc học tập đã hoàn thành' },
  { id: 'achievements', icon: '🏅', title: 'Danh hiệu', detail: 'Bộ sưu tập thành tựu đáng tự hào' },
]

export function PublicProfilePage() {
  const { childId = '' } = useParams()
  const [projection, setProjection] = useState<PublicProfileProjection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<'login' | 'not-found' | 'generic' | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    void api<PublicProfileProjection>(`/api/public/profiles/${encodeURIComponent(childId)}`)
      .then((result) => {
        if (active) setProjection(result)
      })
      .catch((reason) => {
        if (!active) return
        setError(reason instanceof ApiError && reason.status === 401
          ? 'login'
          : reason instanceof ApiError && reason.status === 404
            ? 'not-found'
            : 'generic')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [childId])

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-5">
        <div className="ui-card w-full p-8 text-center">
          <p className="animate-pulse text-5xl" aria-hidden>✨</p>
          <p className="mt-3 font-extrabold text-muted">Đang mở triển lãm…</p>
        </div>
      </main>
    )
  }

  if (!projection || error) {
    const loginRequired = error === 'login'
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-5">
        <div className="ui-card w-full p-8 text-center">
          <p className="text-5xl" aria-hidden>{loginRequired ? '🔐' : '🌱'}</p>
          <h1 className="mt-3 font-display text-3xl">
            {loginRequired ? 'Đăng nhập để xem trang này' : 'Trang này chưa được chia sẻ'}
          </h1>
          <p className="mt-2 text-muted">
            {loginRequired
              ? 'Trang cá nhân của trẻ chỉ dành cho bạn bè, gia đình hoặc trường học đã được cho phép.'
              : 'Trang có thể chưa xuất bản hoặc tài khoản của bạn chưa nằm trong vòng tròn được phép xem.'}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to={loginRequired ? `/login?returnTo=${encodeURIComponent(`/u/${childId}`)}` : '/profile'}
              className="rounded-full bg-brand-600 px-4 py-2 font-extrabold text-white"
            >
              {loginRequired ? 'Đăng nhập' : '← Hồ sơ của con'}
            </Link>
            <Link to="/" className="rounded-full bg-brand-50 px-4 py-2 font-extrabold text-brand-600">Về AIKid.vn</Link>
          </div>
        </div>
      </main>
    )
  }

  const { profile, works } = projection
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e3f6ff,transparent_38%),linear-gradient(#f7f5ff,#fff)] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <nav className="flex flex-wrap items-center justify-between gap-2" aria-label="Điều hướng trang cá nhân">
          <Link to="/profile" className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-brand-700 shadow-soft">
            ← Quay lại hồ sơ
          </Link>
          <Link to="/home" className="text-sm font-extrabold text-brand-600">Về sảnh AIKid</Link>
        </nav>
        <header className="ui-card flex flex-col items-center gap-4 overflow-hidden p-7 text-center sm:flex-row sm:text-left">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-8 border-white bg-brand-100 text-5xl shadow-clay">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
              : '🎨'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">Nhà sáng tạo AIKid</p>
            <h1 className="font-display text-4xl">{profile.name}</h1>
            <p className="text-muted">Cấp {profile.level} · {profile.xp} XP toàn hệ sinh thái</p>
          </div>
          {profile.frameKey && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">✨ {profile.frameKey}</span>
          )}
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {moduleCards
            .filter((card) => profile.modules.includes(card.id))
            .map((card) => (
              <section key={card.id} className="ui-card p-4">
                <p className="text-2xl" aria-hidden>{card.icon}</p>
                <h2 className="font-display text-xl">{card.title}</h2>
                <p className="text-sm text-muted">{card.detail}</p>
              </section>
            ))}
        </div>

        {profile.modules.includes('works') && (
          <section>
            <h2 className="mb-4 font-display text-3xl">Triển lãm của con</h2>
            {works.length === 0 ? (
              <div className="ui-card p-8 text-center text-muted">Chưa có tác phẩm đã được phụ huynh duyệt.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {works.map((work) => (
                  <article key={work.id} className="ui-card overflow-hidden">
                    <div className="flex aspect-[4/3] items-center justify-center bg-brand-50 text-5xl">🎨</div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black uppercase text-brand-600">{work.kind}</p>
                        <span className="text-xs font-bold text-muted">{work.permission === 'remix' ? 'Cho phép remix' : 'Chỉ xem'}</span>
                      </div>
                      <h3 className="font-display text-xl">{work.name}</h3>
                      {work.description && <p className="mt-1 line-clamp-3 text-sm text-muted">{work.description}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        <footer className="text-center text-xs font-bold text-muted">
          Chỉ hiển thị nội dung đã được phụ huynh phê duyệt · AIKid.vn
        </footer>
      </div>
    </main>
  )
}
