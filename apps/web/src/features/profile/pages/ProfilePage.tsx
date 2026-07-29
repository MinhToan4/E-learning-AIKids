import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { explorerLevelForXp } from '@aikids/domain'
import { Button } from '@/shared/components/ui/Button'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { api, type AchievementRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { EquippedProfile } from '@/features/rewards/EquippedProfile'
import { RewardCollection } from '@/features/rewards/RewardCollection'
import {
  profileCardStyle,
  readRewardEquipment,
} from '@/features/rewards/reward-equipment'
import {
  DEFAULT_COMMUNITY_SETTINGS,
  DEMO_CONNECTIONS,
  readCommunitySettings,
  saveCommunitySettings,
  type Audience,
  type SharedSurface,
} from '@/features/community/community-store'
import {
  readProfileAvatar,
  saveProfileAvatar,
  saveProfileShowcase,
  type ProfileAvatar,
  type ShowcaseProject,
} from '../profile-showcase'

type MediaAsset = { id: string; name: string; thumbnail: string; type: string }

export function ProfilePage() {
  const user = useAuth((state) => state.user)
  const logout = useAuth((state) => state.logout)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<'overview' | 'customize'>('overview')
  const [streak, setStreak] = useState(0)
  const [achievements, setAchievements] = useState<AchievementRow[]>([])
  const [projects, setProjects] = useState<ShowcaseProject[]>([])
  const [avatarChoices, setAvatarChoices] = useState<ProfileAvatar[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<ProfileAvatar | null>(
    () => user ? readProfileAvatar(user.id) : null,
  )
  const [explorerXp, setExplorerXp] = useState(0)
  const [equipment, setEquipment] = useState(() =>
    user ? readRewardEquipment(user.id) : {},
  )
  const [sharing, setSharing] = useState(() =>
    user ? readCommunitySettings(user.id) : DEFAULT_COMMUNITY_SETTINGS,
  )

  useEffect(() => {
    void (async () => {
      const [s, a, p, media, g] = await Promise.allSettled([
        api<{ current: number }>('/api/gamification/streak'),
        api<{ achievements: AchievementRow[] }>('/api/gamification/achievements'),
        api<{ projects: ShowcaseProject[] }>('/api/projects'),
        api<{ assets: MediaAsset[] }>('/api/backpack'),
        api<{ celebration: { personal: { xp: number } } }>('/api/gamification/class-celebration'),
      ])
      if (s.status === 'fulfilled') setStreak(s.value.current)
      if (a.status === 'fulfilled') setAchievements(a.value.achievements.filter((row) => row.unlocked))
      if (p.status === 'fulfilled') setProjects(p.value.projects ?? [])
      if (media.status === 'fulfilled') {
        setAvatarChoices((media.value.assets ?? []).filter((asset) => asset.thumbnail).map((asset) => ({
          id: asset.id,
          url: asset.thumbnail,
          label: asset.name,
          source: asset.type.includes('generated') ? 'generated' : 'library',
        })))
      }
      if (g.status === 'fulfilled') setExplorerXp(g.value.celebration.personal.xp)
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    const sync = () => user && setEquipment(readRewardEquipment(user.id))
    window.addEventListener('aikids:reward-equipped', sync)
    return () => window.removeEventListener('aikids:reward-equipped', sync)
  }, [user])

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

  const toggleSharing = (surface: SharedSurface, audience: Audience) => {
    const next = {
      ...sharing,
      [surface]: { ...sharing[surface], [audience]: !sharing[surface][audience] },
    }
    setSharing(next)
    if (user) saveCommunitySettings(user.id, next)
  }

  if (loading) return <PageSkeleton rows={3} className="mx-auto max-w-5xl" />

  return (
    <PageMotion className="mx-auto flex max-w-5xl flex-col gap-5">
      <section className="ui-card overflow-hidden p-5 sm:p-6" style={profileCardStyle(equipment.theme)}>
        <div className="grid items-center gap-5 md:grid-cols-[1fr_auto]">
          {user && <EquippedProfile user={user} xp={explorerXp} compact />}
          <div className="grid grid-cols-3 gap-2">
            {[
              ['🔥', streak, 'Chuỗi'],
              ['🏅', achievements.length, 'Huy hiệu'],
              ['🎨', projects.length, 'Tác phẩm'],
            ].map(([icon, value, label]) => (
              <div key={String(label)} className="min-w-20 rounded-2xl bg-white/80 p-3 text-center text-text shadow-soft backdrop-blur">
                <p aria-hidden>{icon}</p>
                <p className="font-display text-xl">{value}</p>
                <p className="text-[10px] font-bold text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/60 pt-4">
          <div className="flex rounded-full bg-white/75 p-1 text-sm font-extrabold text-brand-700">
            <button type="button" onClick={() => setSection('overview')} className={`rounded-full px-4 py-2 ${section === 'overview' ? 'bg-brand-600 text-white' : ''}`}>Tổng quan</button>
            <button type="button" onClick={() => setSection('customize')} className={`rounded-full px-4 py-2 ${section === 'customize' ? 'bg-brand-600 text-white' : ''}`}>✨ Tùy biến card</button>
          </div>
          {user && <Link to={`/u/${user.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-brand-700 shadow-soft">Xem trang cá nhân ↗</Link>}
        </div>
      </section>

      {section === 'customize' && user && (
        <>
          <section className="ui-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">Ảnh đại diện</p>
                <h2 className="font-display text-2xl">Chọn từ kho sáng tạo</h2>
              </div>
              <Link to="/backpack" className="text-sm font-extrabold text-brand-600">Mở thư viện</Link>
            </div>
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
                    className={`w-24 shrink-0 rounded-2xl border-2 p-2 ${active ? 'border-brand-500 bg-brand-50' : 'border-border'}`}
                  >
                    <img src={choice.url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    <span className="mt-1 block truncate text-xs font-extrabold">{active ? 'Đang dùng ✓' : choice.label}</span>
                  </button>
                )
              })}
            </div>
          </section>
          <div className="ui-card p-5">
            <RewardCollection userId={user.id} xpLevel={explorerLevelForXp(explorerXp).level} />
          </div>
        </>
      )}

      {section === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="ui-card p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">Góc triển lãm</p>
                <h2 className="font-display text-2xl">Tác phẩm gần đây</h2>
              </div>
              <Link to="/backpack" className="text-sm font-extrabold text-brand-600">Xem tất cả</Link>
            </div>
            {projects.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm text-muted">Chưa có tác phẩm — vào Xưởng để sáng tạo nhé!</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {projects.slice(0, 4).map((project) => (
                  <article key={project.id} className="overflow-hidden rounded-2xl bg-brand-50">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden text-4xl">
                      {project.thumbnail ? <img src={project.thumbnail} alt="" className="h-full w-full object-cover" /> : '🎨'}
                    </div>
                    <p className="truncate px-3 py-2 text-sm font-extrabold">{project.title}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-col gap-5">
            <section className="ui-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-brand-600">Vòng tròn an toàn</p>
                  <h2 className="font-display text-2xl">Bạn bè</h2>
                </div>
                <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-extrabold text-success">{DEMO_CONNECTIONS.length} kết nối</span>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {DEMO_CONNECTIONS.map((friend) => (
                  <button key={friend.id} type="button" className="min-w-24 rounded-2xl bg-brand-50 p-3 text-center">
                    <span className="text-3xl">{friend.avatar}</span>
                    <span className="mt-1 block text-xs font-extrabold">{friend.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted">Danh sách mẫu; Social Graph API sẽ cung cấp bạn bè thật.</p>
            </section>

            <details className="ui-card p-5">
              <summary className="cursor-pointer list-none font-display text-xl">⚙️ Quyền xem hồ sơ & workspace</summary>
              <div className="mt-4 space-y-3">
                {(['friends', 'family', 'school'] as Audience[]).map((audience) => (
                  <div key={audience} className="grid grid-cols-[1fr_70px_88px] items-center gap-2 text-sm">
                    <span className="font-extrabold">{audience === 'friends' ? '🧑‍🤝‍🧑 Bạn bè' : audience === 'family' ? '🏡 Gia đình' : '🏫 Trường học'}</span>
                    {(['profile', 'workspace'] as SharedSurface[]).map((surface) => (
                      <button
                        key={surface}
                        type="button"
                        role="switch"
                        aria-checked={sharing[surface][audience]}
                        onClick={() => toggleSharing(surface, audience)}
                        className={`rounded-full px-2 py-1 text-[10px] font-black ${sharing[surface][audience] ? 'bg-mint-100 text-success' : 'bg-slate-100 text-muted'}`}
                      >
                        {surface === 'profile' ? 'Hồ sơ' : 'Workspace'} {sharing[surface][audience] ? '✓' : '—'}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" onClick={async () => { await logout(); navigate('/') }}>Đăng xuất</Button>
      </div>
    </PageMotion>
  )
}
