import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import {
  NavCreativeIcon,
  NavLevelIcon,
} from '@/shared/components/icons/KidNavIcons'
import {
  KidProfileBadgeImageIcon,
  KidProfileStreakImageIcon,
  KidProfileWorkImageIcon,
} from '@/shared/components/icons/KidImageIcons'
import { api, type AchievementRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { EquippedProfile } from '@/features/rewards/EquippedProfile'
import { RewardCollection } from '@/features/rewards/RewardCollection'
import {
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
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import {
  readProfileAvatar,
  saveProfileAvatar,
  saveProfileShowcase,
  type ProfileAvatar,
  type ShowcaseProject,
} from '../profile-showcase'
import { updateMyProfileAvatar } from '@/shared/lib/media-api'
import {
  explorerLevelProgress,
  nextExplorerLevel,
} from '@/shared/lib/creation/xp-levels'
import {
  loadProfileOverview,
  type PublicProfileSettings,
} from '../profile-overview-api'

function friendlyProjectTitle(title: string): string {
  const clean = title
    .replace(/\.(json|png|jpe?g|webp|gif|mp4)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return clean || 'Tác phẩm của con'
}

function ProjectThumbnail({ project }: { project: ShowcaseProject }) {
  const [failed, setFailed] = useState(false)
  if (!project.thumbnail || failed) {
    return <NavCreativeIcon size={44} aria-hidden="true" />
  }
  return (
    <img
      src={project.thumbnail}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
    />
  )
}

function tryGetCachedOverview(userId: string) {
  try {
    const raw = localStorage.getItem(`aiki_profile_overview_${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function ProfilePage() {
  const user = useAuth((state) => state.user)
  
  const cached = user ? tryGetCachedOverview(user.id) : null
  const [loading, setLoading] = useState(!cached)
  
  const [section, setSection] = useState<'overview' | 'customize'>('overview')
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  
  const [streak, setStreak] = useState(cached?.streak || 0)
  const [achievements, setAchievements] = useState<AchievementRow[]>(cached?.achievements || [])
  const [projects, setProjects] = useState<ShowcaseProject[]>(cached?.projects || [])
  const [profileSlug, setProfileSlug] = useState<string | null>(cached?.profileSlug || null)
  const [profileAppearance, setProfileAppearance] = useState(cached?.profileAppearance || {
    themeKey: null, frameKey: null, backgroundKey: null
  })
  
  const [avatarChoices, setAvatarChoices] = useState<ProfileAvatar[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<ProfileAvatar | null>(
    () => user ? readProfileAvatar(user.id) : null,
  )
  const [explorerXp, setExplorerXp] = useState(cached?.explorerXp || 0)
  const [explorerLevel, setExplorerLevel] = useState(cached?.explorerLevel || 1)
  
  const [equipment, setEquipment] = useState(() => user ? readRewardEquipment(user.id) : {})
  const equipmentMutationVersion = useRef(0)
  const [sharing, setSharing] = useState(() => user ? readCommunitySettings(user.id) : DEFAULT_COMMUNITY_SETTINGS)

  useEffect(() => {
    let active = true
    const loadVersion = equipmentMutationVersion.current
    loadProfileOverview()
      .then((overview) => {
        if (!active) return
        setStreak(overview.streak)
        setAchievements(overview.achievements.filter((row) => row.unlocked))
        setProjects(overview.projects)
        setAvatarChoices(overview.avatarChoices
          .filter((asset) => asset.thumbnail)
          .map((asset) => ({
            id: asset.id, url: asset.thumbnail, label: asset.name, source: asset.type.includes('generated') ? 'generated' : 'library',
          })))
        setExplorerXp(overview.totalXp)
        setExplorerLevel(overview.level)

        let appearanceData = profileAppearance
        const profileSettings = overview.profileSettings
        if (profileSettings) {
          setProfileSlug(profileSettings.slug)
          appearanceData = {
            themeKey: profileSettings.themeKey ?? null,
            frameKey: profileSettings.frameKey ?? null,
            backgroundKey: profileSettings.backgroundKey ?? null,
          }
          setProfileAppearance(appearanceData)
          const visibility = new Set(profileSettings.visibility ?? [])
          const modules = new Set(profileSettings.modules ?? [])
          setSharing((current) => {
            const next = {
              ...current,
              profile: { friends: visibility.has('friends'), family: visibility.has('family'), school: visibility.has('school') },
              modules: { storybook: modules.has('storybook'), progress: modules.has('progress'), achievements: modules.has('achievements'), works: modules.has('works'), friends: modules.has('friends'), activity: modules.has('activity') },
            }
            if (user) saveCommunitySettings(user.id, next)
            return next
          })
        }

        if (user && equipmentMutationVersion.current === loadVersion) {
          const synced = rewardEquipmentFromRows(overview.equipment)
          const serverEquipment = syncRewardEquipment(user.id, synced)
          setEquipment(serverEquipment)
        }

        if (user) {
          try {
             localStorage.setItem(`aiki_profile_overview_${user.id}`, JSON.stringify({
                streak: overview.streak,
                achievements: overview.achievements.filter(a => a.unlocked),
                projects: overview.projects,
                explorerXp: overview.totalXp,
                explorerLevel: overview.level,
                profileSlug: profileSettings?.slug || null,
                profileAppearance: appearanceData
             }))
          } catch {}
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [user?.id])

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
      equipmentMutationVersion.current += 1
      const nextEquipment = readRewardEquipment(user.id)
      setEquipment(nextEquipment)
      const appearance = { themeKey: nextEquipment.theme ?? null, frameKey: nextEquipment.frame ?? null, backgroundKey: nextEquipment.background ?? null }
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
      projects: projects.filter((project) => ['approved', 'public', 'shared'].includes(project.shareStatus)),
      updatedAt: new Date().toISOString(),
    })
  }, [projects, selectedAvatar, user])

  async function persistProfileSettings(next: typeof sharing, appearance = profileAppearance) {
    const visibility = (['friends', 'family', 'school'] as Audience[]).filter((audience) => next.profile[audience])
    const modules = (Object.keys(next.modules) as ProfileModule[]).filter((module) => next.modules[module])
    const saved = await api<PublicProfileSettings>('/api/profile/settings', {
      method: 'PUT',
      body: JSON.stringify({ enabled: visibility.length > 0, visibility, modules, ...appearance }),
    })
    setProfileSlug(saved.slug)
  }

  const hasBasicInfo = user && equipment
  if (loading && !hasBasicInfo) return <PageSkeleton rows={3} className="mx-auto max-w-5xl" />

  const nextLevel = nextExplorerLevel(explorerXp, explorerLevel)
  const levelProgress = explorerLevelProgress(explorerXp, explorerLevel)
  const xpToNextLevel = Math.max(0, nextLevel.xpRequired - explorerXp)
  
  return (
    <PageMotion className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col gap-5 relative">
      {loading && <div className="absolute top-4 right-4 z-50 animate-pulse bg-white/80 px-3 py-1 rounded-full text-xs font-bold shadow">Đang đồng bộ...</div>}
      <section
        className="aikid-flat-panel overflow-hidden shadow-soft rounded-3xl"
        data-profile-composition="simple"
        style={{
          ...profileCardBackgroundStyle(equipment.background),
          backgroundPosition: 'center',
          border: 'none',
        }}
      >
        <div className="grid items-center gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_18rem] lg:grid-cols-[minmax(0,1fr)_21rem] md:px-5 lg:px-6 lg:py-5">
          {user && (
            <EquippedProfile
              user={user}
              xp={explorerXp}
              level={explorerLevel}
              compact
              equipment={equipment}
              onAvatarClick={() => setAvatarPickerOpen(true)}
            />
          )}
          <div className="profile-summary-strip grid grid-cols-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50" aria-label="Thành quả học tập">
            {[
              { value: streak, label: 'Ngày học', to: '/level', icon: KidProfileStreakImageIcon },
              { value: achievements.length, label: 'Huy hiệu', to: '/achievements', icon: KidProfileBadgeImageIcon },
              { value: projects.length, label: 'Tác phẩm', to: '/backpack', icon: KidProfileWorkImageIcon },
            ].map(({ value, label, to, icon: Icon }) => (
              <Link key={label} to={to} className="profile-summary-item flex min-h-20 min-w-0 flex-col items-center justify-center px-2 py-2 text-center text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:min-h-24 hover:scale-105 transition-transform">
                <Icon size={24} aria-hidden="true" />
                <span className="font-display text-xl text-brand-700">{value}</span>
                <span className="text-[11px] font-extrabold text-muted uppercase tracking-wide sm:text-xs">{label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="profile-section-bar flex flex-col gap-2 bg-white/40 backdrop-blur-sm border-t border-white/70 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="profile-section-tabs grid grid-cols-2 bg-white rounded-xl p-1 shadow-sm" role="tablist" aria-label="Nội dung hồ sơ">
            <button type="button" role="tab" aria-selected={section === 'overview'} onClick={() => setSection('overview')} className="py-2 px-4 rounded-lg font-bold text-sm ui-selected:bg-brand-100 ui-selected:text-brand-700 transition-colors">Hồ sơ</button>
            <button type="button" role="tab" aria-selected={section === 'customize'} onClick={() => setSection('customize')} className="py-2 px-4 rounded-lg font-bold text-sm ui-selected:bg-brand-100 ui-selected:text-brand-700 transition-colors">Trang trí</button>
          </div>
          {profileSlug && <Link to={`/u/${profileSlug}`} className="flex min-h-11 items-center justify-center rounded-2xl border border-brand-200 bg-white px-4 py-2 text-sm font-extrabold text-brand-700 shadow-sm hover:shadow-clay transition-shadow">Xem bản chia sẻ</Link>}
        </div>
      </section>

      <Link
        to="/level"
        className="aikid-flat-panel group grid min-h-32 gap-4 p-5 shadow-soft rounded-3xl border border-border bg-white hover:border-brand-300 hover:shadow-clay transition-all focus-visible:outline-focus sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6"
        aria-label={`Xem hành trình Cấp ${explorerLevel}`}
      >
        <span className="student-nav-icon !h-14 !w-14 !rounded-2xl" aria-hidden="true">
          <NavLevelIcon size={32} />
        </span>
        <span>
          <span className="block text-sm font-extrabold text-brand-600 uppercase tracking-wide">Hành trình cấp độ</span>
          <span className="mt-1 block font-display text-2xl text-text">
            Cấp {explorerLevel} · {explorerXp.toLocaleString('vi-VN')} XP
          </span>
          <CuteProgress className="mt-3" value={levelProgress} label={`Tiến độ lên Cấp ${nextLevel.level}`} tone="violet" />
          <span className="mt-2 block text-sm font-bold text-muted">
            {xpToNextLevel > 0 ? `Còn ${xpToNextLevel} XP để lên Cấp ${nextLevel.level}` : 'Con đã sẵn sàng cho cấp tiếp theo'}
          </span>
        </span>
        <span className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-coral-400 px-4 font-extrabold text-white group-hover:bg-coral-500 shadow-sm">
          Xem hành trình
        </span>
      </Link>

      {section === 'customize' && user && (
        <div className="aikid-flat-panel p-5 sm:p-6 shadow-soft rounded-3xl bg-white border border-border">
          <div className="mb-5 flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between border border-brand-100">
            <div>
              <p className="font-display text-lg text-text">Chỉnh phong cách hồ sơ</p>
              <p className="text-sm font-bold text-brand-700">Chọn từng món bên dưới; thay đổi sẽ cập nhật ngay lập tức.</p>
            </div>
            <button type="button" onClick={() => setSection('overview')} className="min-h-11 shrink-0 rounded-xl bg-white px-4 text-sm font-extrabold text-brand-700 shadow-sm hover:shadow-clay">Xem hồ sơ</button>
          </div>
          <Link
            to="/profile/avatar-studio"
            className="profile-studio-invite mb-6 grid gap-4 p-5 rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-400 transition-colors bg-white focus-visible:outline-focus sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <ImportantCardMascot pose="welcome" className="important-card-mascot--compact" />
            <span>
              <span className="block font-display text-2xl text-text">Tạo avatar của con</span>
              <span className="mt-1 block text-sm font-bold text-muted">Chọn tóc, mắt, trang phục, phụ kiện và phối một Mee thật riêng.</span>
            </span>
            <span className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brand-50 px-5 font-extrabold text-brand-700 shadow-sm hover:bg-brand-100">Mở Studio</span>
          </Link>
          <RewardCollection userId={user.id} xpLevel={explorerLevel} />
        </div>
      )}

      {section === 'overview' && (
        <section className="aikid-flat-panel p-5 sm:p-7 shadow-soft rounded-3xl bg-white border border-border" aria-labelledby="recent-works-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="recent-works-title" className="font-display text-2xl sm:text-3xl">Tác phẩm gần đây</h2>
              <p className="mt-1 text-sm font-bold text-muted">Những tác phẩm đã sẵn sàng để giới thiệu.</p>
            </div>
            <Link to="/backpack" className="flex min-h-11 items-center rounded-xl px-4 py-2 bg-brand-50 text-sm font-extrabold text-brand-700 hover:bg-brand-100 transition-colors shadow-sm">Xem tất cả</Link>
          </div>
          {projects.length === 0 ? (
            <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-3xl bg-brand-50 border border-brand-100 px-5 text-center">
              <span className="student-nav-icon !h-16 !w-16" aria-hidden="true"><NavCreativeIcon size={36} /></span>
              <p className="mt-3 font-display text-xl text-text">Chưa có tác phẩm</p>
              <p className="mt-1 text-sm font-bold text-muted">Vào Xưởng để tạo tác phẩm đầu tiên nhé!</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <article key={project.id} className="group overflow-hidden rounded-3xl border border-border bg-white shadow-sm hover:shadow-clay transition-shadow cursor-pointer">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-brand-50 text-brand-600 relative">
                    <ProjectThumbnail project={project} />
                  </div>
                  <p className="truncate px-4 py-3.5 text-sm font-extrabold text-text">{friendlyProjectTitle(project.title)}</p>
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
