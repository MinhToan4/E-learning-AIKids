import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ShieldCheck } from 'lucide-react'
import { ApiError, api } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'
import { ErrorState } from '@/shared/components/ui/ErrorState'

type SharedProfile = {
  share: {
    expiresAt: string | null
  }
  profile: {
    nickname: string
    avatarUrl?: string | null
    themeKey?: string | null
  }
  achievements: Array<{
    id: string
    name: string
    iconUrl?: string | null
  }>
  works: Array<{
    id: string
    title: string
    description?: string | null
    kind: string
    thumbnailUrl?: string | null
  }>
}

export function PublicProfileSharePage() {
  const { token = '' } = useParams()
  const [data, setData] = useState<SharedProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<'unavailable' | 'generic' | null>(null)

  useEffect(() => {
    let active = true
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const createdRobots = !robots
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    const previousRobots = robots?.content
    if (robots) robots.content = 'noindex, nofollow, noarchive'

    if (!token || token.length > 256) {
      setError('unavailable')
      setLoading(false)
      return () => {
        if (createdRobots) robots?.remove()
        else if (robots && previousRobots !== undefined) robots.content = previousRobots
      }
    }

    void api<SharedProfile>(`/api/public/profile-shares/${encodeURIComponent(token)}`)
      .then((result) => {
        if (!active) return
        setData(result)
        document.title = `Góc sáng tạo của ${result.profile.nickname} · AIKid`
      })
      .catch((reason) => {
        if (!active) return
        setError(reason instanceof ApiError && [404, 410].includes(reason.status)
          ? 'unavailable'
          : 'generic')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      document.title = 'AI Kids Creator Academy'
      if (createdRobots) robots?.remove()
      else if (robots && previousRobots !== undefined) robots.content = previousRobots
    }
  }, [token])

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-5">
        <div className="ui-card w-full p-8">
          <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-brand-100" />
          <div className="mx-auto mt-5 h-8 max-w-sm animate-pulse rounded-xl bg-brand-50" />
        </div>
      </main>
    )
  }

  if (!data || error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-5">
        <ErrorState
          title={error === 'unavailable' ? 'Link không còn hoạt động' : 'Chưa mở được trang này'}
          message={error === 'unavailable'
            ? 'Link có thể đã hết hạn hoặc được gia đình ngừng chia sẻ.'
            : 'Vui lòng thử lại sau hoặc hỏi người đã gửi link cho bạn.'}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <nav className="flex items-center justify-between gap-3" aria-label="Trang chia sẻ AIKid">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-2xl bg-white px-4 shadow-soft">
            <img src={designerAssets.brand.logo} alt="AIKid" className="h-8 w-auto" />
          </Link>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-mint-100 px-4 text-sm font-extrabold text-success">
            <ShieldCheck size={19} aria-hidden="true" /> Gia đình đã duyệt
          </span>
        </nav>

        <header className="ui-card flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-8 border-white bg-brand-100 shadow-clay">
            {data.profile.avatarUrl
              ? <img src={data.profile.avatarUrl} alt="" className="h-full w-full object-cover" />
              : <img src={designerAssets.brand.mascot} alt="" className="h-full w-full object-contain" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-brand-600">Góc sáng tạo trên AIKid</p>
            <h1 className="mt-1 break-words font-display text-3xl sm:text-4xl">{data.profile.nickname}</h1>
            <p className="mt-2 max-w-xl text-muted">
              Những tác phẩm và thành tích dưới đây đã được gia đình chọn để chia sẻ.
            </p>
          </div>
        </header>

        {data.achievements.length > 0 && (
          <section className="ui-card p-5 sm:p-6" aria-labelledby="shared-achievements-title">
            <h2 id="shared-achievements-title" className="font-display text-2xl">Huy hiệu nổi bật</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.achievements.map((achievement) => (
                <article key={achievement.id} className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft">
                    {achievement.iconUrl
                      ? <img src={achievement.iconUrl} alt="" className="h-full w-full object-contain" />
                      : <ShieldCheck size={24} className="text-brand-600" aria-hidden="true" />}
                  </div>
                  <h3 className="font-extrabold">{achievement.name}</h3>
                </article>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="shared-works-title">
          <div className="mb-4">
            <h2 id="shared-works-title" className="font-display text-3xl">Tác phẩm được chia sẻ</h2>
            <p className="text-muted">Chỉ những nội dung đã được gia đình cho phép mới xuất hiện tại đây.</p>
          </div>
          {data.works.length === 0 ? (
            <div className="ui-card p-8 text-center">
              <p className="font-display text-2xl">Chưa có tác phẩm được chia sẻ</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.works.map((work) => (
                <article key={work.id} className="ui-card overflow-hidden">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-brand-50">
                    {work.thumbnailUrl
                      ? <img src={work.thumbnailUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      : <img src={designerAssets.workshop.comic} alt="" className="h-24 w-24 rounded-2xl object-cover" />}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-extrabold text-brand-600">{work.kind}</p>
                    <h3 className="mt-1 font-display text-xl">{work.title}</h3>
                    {work.description && <p className="mt-1 line-clamp-3 text-sm text-muted">{work.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-border py-5 text-center text-sm font-bold text-muted">
          Trang này không hiển thị thông tin cá nhân, trường lớp hoặc tiến độ học tập của trẻ.
        </footer>
      </div>
    </main>
  )
}
