import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { api, type AchievementRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { EquippedProfile } from '@/features/rewards/EquippedProfile'
import { RewardCollection } from '@/features/rewards/RewardCollection'
import {
  profileCardBackgroundTone,
  profileCardBackgroundStyle,
  readRewardEquipment,
  rewardEquipmentFromRows,
  syncRewardEquipment,
} from '@/features/rewards/reward-equipment'
import {
  DEFAULT_COMMUNITY_SETTINGS,
  readCommunitySettings,
  saveCommunitySettings,
  type Audience,
  type ProfileModule,
} from '@/features/community/community-store'
import { AvatarPickerModal } from '../components/AvatarPickerModal'
import {
  readProfileAvatar,
  saveProfileAvatar,
  saveProfileShowcase,
  type ProfileAvatar,
  type ShowcaseProject,
} from '../profile-showcase'
import { updateMyProfileAvatar } from '@/shared/lib/media-api'
import {
  loadProfileOverview,
  type PublicProfileSettings,
} from '../profile-overview-api'

export function ProfilePage() {
  const user = useAuth((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<'overview' | 'customize'>('overview')
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [streak, setStreak] = useState(0)
  const [achievements, setAchievements] = useState<AchievementRow[]>([])
  const [projects, setProjects] = useState<ShowcaseProject[]>([])
  const [profileSlug, setProfileSlug] = useState<string | null>(null)
  const [profileAppearance, setProfileAppearance] = useState({
    themeKey: null as string | null,
    frameKey: null as string | null,
    backgroundKey: null as string | null,
  })
  const [avatarChoices, setAvatarChoices] = useState<ProfileAvatar[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<ProfileAvatar | null>(
    () => user ? readProfileAvatar(user.id) : null,
  )
  const [explorerXp, setExplorerXp] = useState(0)
  const [explorerLevel, setExplorerLevel] = useState(1)
  const [equipment, setEquipment] = useState(() =>
    user ? readRewardEquipment(user.id) : {},
  )
  const [sharing, setSharing] = useState(() =>
    user ? readCommunitySettings(user.id) : DEFAULT_COMMUNITY_SETTINGS,
  )

  useEffect(() => {
    let active = true
    void loadProfileOverview()
      .then((overview) => {
        if (!active) return
        setStreak(overview.streak)
        setAchievements(overview.achievements.filter((row) => row.unlocked))
        setProjects(overview.projects)
        setAvatarChoices(overview.avatarChoices
          .filter((asset) => asset.thumbnail)
          .map((asset) => ({
            id: asset.id,
            url: asset.thumbnail,
            label: asset.name,
            source: asset.type.includes('generated') ? 'generated' : 'library',
          })))
        setExplorerXp(overview.totalXp)
        setExplorerLevel(overview.level)

        const profileSettings = overview.profileSettings
        if (profileSettings) {
          setProfileSlug(profileSettings.slug)
          setProfileAppearance({
            themeKey: profileSettings.themeKey ?? null,
            frameKey: profileSettings.frameKey ?? null,
            backgroundKey: profileSettings.backgroundKey ?? null,
          })
          const visibility = new Set(profileSettings.visibility ?? [])
          const modules = new Set(profileSettings.modules ?? [])
          setSharing((current) => {
            const next = {
              ...current,
              profile: {
                friends: visibility.has('friends'),
                family: visibility.has('family'),
                school: visibility.has('school'),
              },
              modules: {
                storybook: modules.has('storybook'),
                progress: modules.has('progress'),
                achievements: modules.has('achievements'),
                works: modules.has('works'),
                friends: modules.has('friends'),
                activity: modules.has('activity'),
              },
            }
            if (user) saveCommunitySettings(user.id, next)
            return next
          })
        }

        if (user) {
          const synced = rewardEquipmentFromRows(overview.equipment)
          setEquipment(syncRewardEquipment(user.id, synced))
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user?.id])

  // Avatar trước đây chỉ được giữ trong localStorage của LMS, nên AI Studio
  // không thể thấy. Migrate lựa chọn hiện tại sang child profile chung.
  useEffect(() => {
    if (!user || user.role !== 'student' || !selectedAvatar?.url) return
    if (user.avatarId === selectedAvatar.url) return
    void updateMyProfileAvatar(selectedAvatar).then(() => {
      useAuth.getState().setUser({ ...user, avatarId: selectedAvatar.url })
    }).catch(() => undefined)
  }, [selectedAvatar?.mediaId, selectedAvatar?.url, user?.id])

  useEffect(() => {
    const sync = () => {
      if (!user) return
      const nextEquipment = readRewardEquipment(user.id)
      const appearance = {
        themeKey: nextEquipment.theme ?? null,
        frameKey: nextEquipment.frame ?? null,
        backgroundKey: nextEquipment.background ?? null,
      }
      setEquipment(nextEquipment)
      setProfileAppearance(appearance)
      void persistProfileSettings(sharing, appearance).catch(() => undefined)
    }
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

  async function persistProfileSettings(
    next: typeof sharing,
    appearance = profileAppearance,
  ) {
    const visibility = (['friends', 'family', 'school'] as Audience[]).filter(
      (audience) => next.profile[audience],
    )
    const modules = (Object.keys(next.modules) as ProfileModule[]).filter(
      (module) => next.modules[module],
    )
    const saved = await api<PublicProfileSettings>('/api/profile/settings', {
      method: 'PUT',
      body: JSON.stringify({
        enabled: visibility.length > 0,
        visibility,
        modules,
        ...appearance,
      }),
    })
    setProfileSlug(saved.slug)
  }

  if (loading) return <PageSkeleton rows={3} className="mx-auto max-w-5xl" />

  const profileCardBackground = equipment.background
  const cardTone = profileCardBackgroundTone(profileCardBackground)
  return (
    <PageMotion
      className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col gap-5"
    >
      <section
        className="ui-card relative min-h-[20rem] overflow-hidden p-5 sm:p-6 lg:p-8"
        style={{
          ...profileCardBackgroundStyle(profileCardBackground),
          backgroundPosition: 'center top',
        }}
        data-profile-tone={cardTone}
        data-profile-composition="v1"
      >
        {profileCardBackground === 'background-ai-gate' && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-x-0 bottom-[31%] h-px bg-gradient-to-r from-transparent via-amber-100/55 to-transparent" />
            <div className="absolute bottom-[18%] right-[27%] h-44 w-32 rounded-t-[5rem] border-[7px] border-cyan-200/35 bg-indigo-950/10 shadow-[0_0_28px_rgba(103,232,249,.45),inset_0_0_24px_rgba(251,191,36,.25)] sm:h-52 sm:w-40 lg:right-[31%]">
              <div className="absolute inset-4 rounded-t-[4rem] border-2 border-amber-200/40 bg-gradient-to-b from-cyan-300/10 to-amber-200/20" />
              <div className="absolute left-1/2 top-[38%] h-12 w-12 -translate-x-1/2 rounded-full bg-amber-100/25 shadow-[0_0_30px_rgba(253,224,71,.55)]" />
            </div>
            <span className="absolute left-[44%] top-[18%] text-lg text-cyan-100/60">✦</span>
            <span className="absolute bottom-[22%] right-[12%] text-sm text-amber-100/70">✦</span>
          </div>
        )}
        <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_19rem]">
          {user && (
            <EquippedProfile
              user={user}
              xp={explorerXp}
              level={explorerLevel}
              compact
              tone={cardTone}
              onAvatarClick={() => setAvatarPickerOpen(true)}
            />
          )}
          <div className="grid grid-cols-3 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-soft">
            {[
              [streak, 'Ngày học'],
              [achievements.length, 'Huy hiệu'],
              [projects.length, 'Tác phẩm'],
            ].map(([value, label], index) => (
              <div key={String(label)} className={`min-w-0 px-2 py-4 text-center text-text ${index > 0 ? 'border-l border-border' : ''}`}>
                <p className="font-display text-2xl text-brand-700">{value}</p>
                <p className="mt-0.5 text-xs font-extrabold text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 mt-7 flex flex-col gap-3 border-t border-white/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 rounded-2xl bg-white/75 p-1 text-sm font-extrabold text-brand-700" role="tablist" aria-label="Nội dung hồ sơ">
            <button type="button" role="tab" aria-selected={section === 'overview'} onClick={() => setSection('overview')} className={`min-h-11 rounded-xl px-4 py-2 ${section === 'overview' ? 'bg-brand-600 text-white shadow-press' : ''}`}>Hồ sơ</button>
            <button type="button" role="tab" aria-selected={section === 'customize'} onClick={() => setSection('customize')} className={`min-h-11 rounded-xl px-4 py-2 ${section === 'customize' ? 'bg-brand-600 text-white shadow-press' : ''}`}>Chỉnh sửa</button>
          </div>
          {profileSlug && <Link to={`/u/${profileSlug}`} className="flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-brand-700 shadow-soft">Xem bản chia sẻ</Link>}
        </div>
      </section>

      {section === 'customize' && user && (
        <>
          <div className="ui-card border-white/70 bg-white/90 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg text-text">Chỉnh phong cách hồ sơ</p>
                <p className="text-sm font-bold text-brand-700">
                  Chọn từng slot bên dưới; profile phía trên cập nhật ngay sau khi trang bị.
                </p>
              </div>
              <button type="button" onClick={() => setSection('overview')} className="min-h-11 shrink-0 rounded-xl bg-white px-4 text-sm font-extrabold text-brand-700 shadow-soft">
                Xem hồ sơ
              </button>
            </div>
            <RewardCollection userId={user.id} xpLevel={explorerLevel} />
          </div>
        </>
      )}

      {section === 'overview' && (
        <section className="ui-card border-white/70 bg-white/90 p-5 backdrop-blur-sm sm:p-7" aria-labelledby="recent-works-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Góc sáng tạo</p>
              <h2 id="recent-works-title" className="font-display text-2xl sm:text-3xl">Tác phẩm gần đây</h2>
              <p className="mt-1 text-sm font-bold text-muted">Những tác phẩm đã sẵn sàng để giới thiệu.</p>
            </div>
            <Link to="/backpack" className="flex min-h-11 items-center rounded-xl px-3 text-sm font-extrabold text-brand-600">Xem tất cả</Link>
          </div>
          {projects.length === 0 ? (
            <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-3xl bg-brand-50 px-5 text-center">
              <span className="text-4xl" aria-hidden="true">🎨</span>
              <p className="mt-3 font-display text-xl text-text">Chưa có tác phẩm</p>
              <p className="mt-1 text-sm font-bold text-muted">Vào Xưởng để tạo tác phẩm đầu tiên nhé!</p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <article key={project.id} className="group overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-brand-50 text-4xl">
                    {project.thumbnail
                      ? <img src={project.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      : '🎨'}
                  </div>
                  <p className="truncate px-4 py-3 text-sm font-extrabold text-text">{project.title}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {avatarPickerOpen && user && (
        <AvatarPickerModal
          choices={avatarChoices}
          onClose={() => setAvatarPickerOpen(false)}
          onChoose={async (choice) => {
            if (user.role === 'student') {
              await updateMyProfileAvatar(choice)
              useAuth.getState().setUser({ ...user, avatarId: choice.url })
            }
            saveProfileAvatar(user.id, choice)
            setSelectedAvatar(choice)
            setAvatarPickerOpen(false)
          }}
        />
      )}
    </PageMotion>
  )
}
