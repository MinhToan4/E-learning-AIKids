import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { api, type AchievementRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { explorerLevelForXp } from '@aikids/domain'
import { EquippedProfile } from '@/features/rewards/EquippedProfile'
import { RewardCollection } from '@/features/rewards/RewardCollection'
import {
  readProfileAvatar,
  saveProfileAvatar,
  saveProfileShowcase,
  type ProfileAvatar,
  type ShowcaseProject,
} from '../profile-showcase'

type MediaAsset = {
  id: string
  name: string
  thumbnail: string
  type: string
}

export function ProfilePage() {
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [achievements, setAchievements] = useState<AchievementRow[]>([])
  const [projectCount, setProjectCount] = useState(0)
  const [projects, setProjects] = useState<ShowcaseProject[]>([])
  const [avatarChoices, setAvatarChoices] = useState<ProfileAvatar[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<ProfileAvatar | null>(
    () => user ? readProfileAvatar(user.id) : null,
  )
  const [explorerXp, setExplorerXp] = useState(0)

  useEffect(() => {
    void (async () => {
      try {
        const [s, a, p, media, g] = await Promise.all([
          api<{ current: number; longest: number }>('/api/gamification/streak'),
          api<{ achievements: AchievementRow[] }>(
            '/api/gamification/achievements',
          ),
          api<{ projects: ShowcaseProject[] }>('/api/projects'),
          api<{ assets: MediaAsset[] }>('/api/backpack'),
          api<{ celebration: { personal: { xp: number } } }>(
            '/api/gamification/class-celebration',
          ),
        ])
        setStreak({ current: s.current, longest: s.longest })
        setAchievements(a.achievements.filter((x) => x.unlocked))
        setProjects(p.projects ?? [])
        setProjectCount(p.projects?.length ?? 0)
        setAvatarChoices((media.assets ?? [])
          .filter((asset) => asset.thumbnail)
          .map((asset) => ({
            id: asset.id,
            url: asset.thumbnail,
            label: asset.name,
            source: asset.type.includes('generated') ? 'generated' : 'library',
          })))
        setExplorerXp(g.celebration.personal.xp)
      } catch {
        /* non-blocking */
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!user) return
    saveProfileShowcase({
      childId: user.id,
      nickname: user.nickname ?? 'Nhà sáng tạo nhí',
      avatar: selectedAvatar,
      projects: projects.filter((project) =>
        ['approved', 'public', 'shared'].includes(project.shareStatus),
      ),
      updatedAt: new Date().toISOString(),
    })
  }, [projects, selectedAvatar, user])

  if (loading) {
    return <PageSkeleton rows={3} className="mx-auto max-w-lg" />
  }

  return (
    <PageMotion className="mx-auto flex max-w-5xl flex-col gap-5">
      <section className="ui-card relative overflow-hidden p-5 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.9),transparent_35%),linear-gradient(135deg,rgba(235,232,255,.9),rgba(227,246,255,.85),rgba(255,244,214,.8))]" />
        <div className="relative grid items-center gap-7 lg:grid-cols-[1.1fr_.9fr]">
          {user && <EquippedProfile user={user} xp={explorerXp} />}
          <div className="rounded-3xl border border-white/80 bg-white/70 p-5 text-left shadow-soft backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-brand-600">
              Hành trình của con
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-coral-50 p-3 text-center">
                <p className="text-xl" aria-hidden>🔥</p>
                <p className="font-display text-2xl">{streak.current}</p>
                <p className="text-[11px] font-bold text-muted">Chuỗi ngày</p>
              </div>
              <div className="rounded-2xl bg-sun-50 p-3 text-center">
                <p className="text-xl" aria-hidden>🏅</p>
                <p className="font-display text-2xl">{achievements.length}</p>
                <p className="text-[11px] font-bold text-muted">Huy hiệu</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-3 text-center">
                <p className="text-xl" aria-hidden>🎨</p>
                <p className="font-display text-2xl">{projectCount}</p>
                <p className="text-[11px] font-bold text-muted">Tác phẩm</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-muted">
              <span className="font-extrabold text-text">Mục tiêu sáng tạo: </span>
          {user?.goal === 'world'
            ? 'Vẽ thế giới (K1)'
            : user?.goal === 'character'
              ? 'Nhân vật (K2)'
              : user?.goal === 'story'
                ? 'Kể chuyện (K3)'
                : user?.goal === 'comic'
                  ? 'Truyện tranh (K4)'
                  : user?.goal === 'motion'
                    ? 'Chuyển động (K5)'
                    : user?.goal === 'film' || user?.goal === 'video'
                      ? 'Phim ngắn (K6)'
                      : 'Chưa chọn'}
            </p>
          </div>
        </div>
      </section>

      {user && (
        <section className="ui-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Ảnh đại diện</p>
              <h2 className="font-display text-2xl">Chọn từ kho sáng tạo</h2>
              <p className="text-sm text-muted">Ảnh upload, ảnh AI tạo và ảnh trong thư viện của con.</p>
            </div>
            <Link to="/backpack" className="text-sm font-extrabold text-brand-600 hover:underline">
              Mở thư viện
            </Link>
          </div>
          {avatarChoices.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm text-muted">
              Chưa có ảnh trong thư viện. Hãy tạo hoặc upload ảnh từ App AIKids trước nhé.
            </p>
          ) : (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {avatarChoices.map((choice) => {
                const active = selectedAvatar?.id === choice.id
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      saveProfileAvatar(user.id, choice)
                      setSelectedAvatar(choice)
                    }}
                    className={`w-24 shrink-0 rounded-2xl border-2 p-2 text-left ${
                      active ? 'border-brand-500 bg-brand-50' : 'border-border bg-white'
                    }`}
                  >
                    <img src={choice.url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    <span className="mt-1 block truncate text-xs font-extrabold">
                      {active ? 'Đang dùng ✓' : choice.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {user && (
        <div className="ui-card p-5 sm:p-6">
          <RewardCollection
            userId={user.id}
            xpLevel={explorerLevelForXp(explorerXp).level}
          />
        </div>
      )}

      <div className="ui-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-xl">Huy hiệu</h2>
          <Link
            to="/achievements"
            className="text-sm font-bold text-brand-500 hover:underline"
          >
            Tất cả
          </Link>
        </div>
        {achievements.length === 0 ? (
          <p className="text-sm text-muted">Chưa có huy hiệu — học để mở nhé!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <span
                key={a.type}
                className="inline-flex items-center gap-1 rounded-full bg-sun-100 px-2 py-1 text-sm font-bold"
                title={a.description}
              >
                <span className="ui-badge-clay !h-8 !w-8 !text-base" aria-hidden>
                  {a.icon}
                </span>
                {a.title}
              </span>
            ))}
          </div>
        )}
      </div>

      <section className="ui-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Góc triển lãm</p>
            <h2 className="font-display text-2xl">Tác phẩm của con</h2>
          </div>
          {user && (
            <Link to={`/u/${user.id}`} className="rounded-full bg-brand-600 px-4 py-2 text-sm font-extrabold text-white">
              Xem trang cá nhân
            </Link>
          )}
        </div>
        {projects.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Chưa có tác phẩm — vào Xưởng để sáng tạo nhé!</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {projects.slice(0, 4).map((project) => (
              <article key={project.id} className="overflow-hidden rounded-2xl bg-brand-50">
                <div className="flex aspect-square items-center justify-center overflow-hidden text-4xl">
                  {project.thumbnail
                    ? <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
                    : '🎨'}
                </div>
                <p className="truncate px-3 pt-2 text-sm font-extrabold">{project.title}</p>
                <p className="px-3 pb-3 text-[11px] text-muted">{project.shareStatus}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="ui-card flex flex-wrap gap-2 p-4">
          <Link to="/backpack" className="min-w-0 flex-1">
            <Button variant="secondary" className="w-full">
              Ba lô sáng tạo
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={async () => {
              await logout()
              navigate('/')
            }}
          >
            Đăng xuất
          </Button>
      </div>

    </PageMotion>
  )
}
