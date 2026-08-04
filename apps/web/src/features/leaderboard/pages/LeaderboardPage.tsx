import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'

import { api, type AchievementRow } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { useAgeExperience } from '@/shared/age-experience/AgeExperienceProvider'
import {
  NavLeaderboardIcon,
  NavBadgeIcon,
  NavProfileIcon,
  NavWorldIcon,
  CourseBookIcon,
} from '@/shared/components/icons/KidNavIcons'

type Celebration = {
  hasClass: boolean
  learnerCount: number
  completedQuests: number
  projects: number
  teamXp: number
  nextGoal: number
  personal: { level: number; xp: number }
}
type CompetencyMap = {
  status: 'ready' | 'configuration_required'
  frameworks: Array<{
    id: string
    name: string
    disclaimer: string
    domains: Array<{
      id: string
      name: string
      skills: Array<{
        id: string
        name: string
        learnerLabel: string
        result: {
          level: 'no_data' | 'not_met' | 'developing' | 'achieved'
          scorePercent: number | null
          evidenceCount: number
        }
      }>
    }>
  }>
}
type Credential = {
  id: string
  kind: 'certificate' | 'badge'
  verificationCode: string
  issuedAt: string
  course: { title: string }
  template: {
    name: string
    layoutJson: {
      backgroundUrl?: string | null
      allowShare?: boolean
    }
  }
}
type PathwayCourse = {
  id: string
  title: string
  shortTitle?: string
  status: 'active' | 'completed' | 'available' | 'locked'
  completionPercent: number
}
type Pathway = {
  recommendedCourseId: string | null
  courses: PathwayCourse[]
}

const competencySteps = ['no_data', 'not_met', 'developing', 'achieved'] as const

function competencyStep(level: CompetencyMap['frameworks'][number]['domains'][number]['skills'][number]['result']['level']) {
  return Math.max(0, competencySteps.indexOf(level))
}

function competencyTone(level: (typeof competencySteps)[number]) {
  if (level === 'achieved') return 'bg-mint-500'
  if (level === 'developing') return 'bg-sun-400'
  if (level === 'not_met') return 'bg-sky-400'
  return 'bg-border'
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: number
  tone: 'sky' | 'mint' | 'sun' | 'brand'
}) {
  return (
    <div className={`progress-stat progress-stat-${tone}`}>
      <span className="progress-stat-icon" aria-hidden="true">
        <Icon size={28} />
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold leading-none text-text sm:text-3xl">
          {value.toLocaleString('vi-VN')}
        </p>
        <p className="mt-1 text-sm font-bold leading-snug text-muted">{label}</p>
      </div>
    </div>
  )
}

export function LeaderboardPage() {
  const { policy: agePolicy } = useAgeExperience()
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [competency, setCompetency] = useState<CompetencyMap | null>(null)
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [pathway, setPathway] = useState<Pathway | null>(null)
  const [achievements, setAchievements] = useState<AchievementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ celebration: Celebration }>(
        '/api/gamification/class-celebration',
      )
      const [competencyResult, credentialResult, pathwayResult, achievementResult] = await Promise.allSettled([
        api<CompetencyMap>('/api/competency-map'),
        api<{ credentials: Credential[] }>('/api/credentials'),
        api<Pathway>('/api/learning/pathway'),
        api<{ achievements: AchievementRow[] }>('/api/gamification/achievements'),
      ])
      setCelebration(data.celebration)
      setCompetency(
        competencyResult.status === 'fulfilled'
          ? competencyResult.value
          : { status: 'configuration_required', frameworks: [] },
      )
      setCredentials(
        credentialResult.status === 'fulfilled'
          ? credentialResult.value.credentials
          : [],
      )
      setPathway(pathwayResult.status === 'fulfilled' ? pathwayResult.value : null)
      setAchievements(
        achievementResult.status === 'fulfilled'
          ? achievementResult.value.achievements
          : [],
      )
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Khu vườn đang nghỉ một chút. Con thử lại nhé!',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <PageSkeleton rows={4} />

  const safeGoal = Math.max(1, celebration?.nextGoal ?? 1)
  const goalProgress = celebration
    ? Math.min(
        100,
        Math.max(0, Math.round((celebration.completedQuests / safeGoal) * 100)),
      )
    : 0
  const questsNeeded = celebration
    ? Math.max(0, celebration.nextGoal - celebration.completedQuests)
    : 0
  const activeCourses = pathway?.courses.filter((course) =>
    course.status === 'active' || course.status === 'completed') ?? []
  const competencySkills = competency?.frameworks.flatMap((framework) =>
    framework.domains.flatMap((domain) => domain.skills)) ?? []
  const achievedSkills = competencySkills.filter((skill) => skill.result.level === 'achieved').length
  const developingSkills = competencySkills.filter((skill) => skill.result.level === 'developing').length
  const timeline = [
    ...achievements
      .filter((item) => item.unlocked && item.unlockedAt)
      .map((item) => ({
        id: `achievement-${item.type}`,
        title: item.title,
        detail: item.description,
        date: item.unlockedAt as string,
        kind: 'Huy hiệu',
      })),
    ...credentials.map((item) => ({
      id: `credential-${item.id}`,
      title: item.template.name,
      detail: item.course.title,
      date: item.issuedAt,
      kind: item.kind === 'certificate' ? 'Chứng nhận' : 'Huy hiệu',
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  const weeklyMilestones = (() => {
    const now = new Date()
    return Array.from({ length: 4 }, (_, index) => {
      const weeksAgo = 3 - index
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      end.setDate(end.getDate() - weeksAgo * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      return {
        label: weeksAgo === 0 ? 'Tuần này' : `${weeksAgo} tuần trước`,
        count: timeline.filter((item) => {
          const date = new Date(item.date)
          return date >= start && date <= end
        }).length,
      }
    })
  })()
  const maxWeeklyMilestones = Math.max(1, ...weeklyMilestones.map((week) => week.count))

  return (
    <PageMotion className="flex flex-col gap-5 sm:gap-6">
      <header className="progress-hero ui-card">
        <div className="progress-hero-copy">
          <div className="eyebrow-chip">
            <NavLeaderboardIcon size={20} aria-hidden="true" />
            Tiến bộ của con
          </div>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-[1.08] text-text sm:text-4xl">
            Hành trình học tập của con
          </h1>
          <p className="mt-3 max-w-xl text-base font-semibold leading-relaxed text-muted sm:text-lg">
            Bài học, năng lực và chứng nhận của con. XP được theo dõi riêng ở
            Cấp độ khám phá.
          </p>
        </div>
        <div className="progress-hero-art" aria-hidden="true">
          <img
            src={designerAssets.chrome.mascotHero}
            alt=""
            width="512"
            height="512"
            fetchPriority="high"
          />
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && celebration && (
        <>
          <section className="grid grid-cols-2 gap-3" aria-label="Những điều đã làm được">
            <StatTile
              icon={NavProfileIcon}
              label={celebration.hasClass ? 'bạn cùng học' : 'hành trình đang học'}
              value={celebration.learnerCount}
              tone="sky"
            />
            <StatTile
              icon={NavWorldIcon}
              label="nhiệm vụ đã xong"
              value={celebration.completedQuests}
              tone="mint"
            />
          </section>

          <section className="ui-card p-5 sm:p-6" aria-labelledby="course-progress-title">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden="true">
                <CourseBookIcon size={28} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-brand-600">Tiến độ khóa đang học</p>
                <h2 id="course-progress-title" className="font-display text-2xl font-extrabold">
                  Con đang đi đến đâu?
                </h2>
              </div>
            </div>
            {activeCourses.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-brand-50 p-4">
                <p className="font-bold text-text">Chưa có khóa học đang diễn ra.</p>
                <Link to="/world" className="mt-2 inline-flex min-h-11 items-center font-extrabold text-brand-600 underline">
                  Xem hành trình học
                </Link>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {activeCourses.map((course) => {
                  const percent = Math.min(100, Math.max(0, Math.round(course.completionPercent)))
                  return (
                    <article key={course.id} className="rounded-2xl border border-border bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-bold">{course.shortTitle || course.title}</h3>
                        <span className="shrink-0 text-sm font-extrabold text-brand-600">{percent}%</span>
                      </div>
                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-50" role="progressbar" aria-label={`Tiến độ ${course.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {course.status === 'completed'
                          ? 'Đã hoàn thành khóa học.'
                          : percent > 0
                            ? `Còn ${100 - percent}% để hoàn thành.`
                            : 'Sẵn sàng bắt đầu bài đầu tiên.'}
                      </p>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <div className="grid gap-5">
            <section className="progress-garden ui-card" aria-labelledby="garden-title">
              <img
                src={designerAssets.chrome.adventureMap}
                alt=""
                width="1280"
                height="720"
                loading="lazy"
              />
              <div className="progress-garden-shade" />
              <div className="progress-garden-content">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-success">Cùng nhau vun lớn</p>
                    <h2 id="garden-title" className="font-display text-2xl font-extrabold text-text sm:text-3xl">
                      Khu vườn chung
                    </h2>
                  </div>
                  <span className="progress-percent">{goalProgress}% đã nở</span>
                </div>

                <div
                  className="progress-track mt-4"
                  role="progressbar"
                  aria-label="Tiến độ khu vườn chung"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={goalProgress}
                >
                  <div
                    className="progress-track-fill"
                    style={{ width: `${goalProgress}%` }}
                  >
                    <span aria-hidden="true">
                      <NavWorldIcon size={18} />
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm font-bold leading-relaxed text-muted sm:text-base">
                  {questsNeeded > 0
                    ? `Thêm ${questsNeeded} nhiệm vụ nữa, khu vườn sẽ mở một bất ngờ mới.`
                    : 'Tuyệt quá! Khu vườn đã chạm cột mốc mới rồi.'}
                </p>
              </div>
            </section>

          </div>

          <section className="ui-card grid gap-5 overflow-hidden p-5 md:grid-cols-[1fr_auto] md:items-center sm:p-6" aria-labelledby="learning-next-title">
            <div>
              <p className="text-sm font-extrabold text-brand-600">Cột mốc học tập kế tiếp</p>
              <h2 id="learning-next-title" className="font-display text-2xl font-extrabold">
                {questsNeeded > 0
                  ? `Hoàn thành thêm ${questsNeeded} nhiệm vụ`
                  : 'Cột mốc mới đã sẵn sàng!'}
              </h2>
              <p className="mt-2 text-sm font-semibold text-muted">
                Phần thưởng: sticker Storybook mới và mở tiếp hành trình học.
                Đây là tiến độ hoàn thành, không phải XP toàn hệ sinh thái.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/world" className="ui-btn ui-btn-primary">
                  Học tiếp →
                </Link>
                <Link to="/storybook?page=P01" className="ui-btn ui-btn-secondary">
                  Xem sticker huyền thoại
                </Link>
              </div>
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-sun-100 text-sun-700 shadow-inner" aria-hidden>
              <CourseBookIcon size={48} />
            </div>
          </section>

          <section className="ui-card p-5 sm:p-6" aria-labelledby="weekly-progress-title">
            <p className="text-sm font-extrabold text-brand-600">Nhìn lại 4 tuần</p>
            <h2 id="weekly-progress-title" className="font-display text-2xl font-extrabold">
              Dấu mốc được ghi nhận
            </h2>
            <p className="mt-1 text-sm text-muted">
              Biểu đồ chỉ tính huy hiệu và chứng nhận có ngày đạt; chưa thay thế thời gian học.
            </p>
            <div className="mt-5 grid h-44 grid-cols-4 items-end gap-3" aria-label="Số dấu mốc trong bốn tuần gần đây">
              {weeklyMilestones.map((week) => (
                <div key={week.label} className="flex h-full flex-col items-center justify-end gap-2">
                  <span className="text-sm font-extrabold text-brand-700">{week.count}</span>
                  <div className="flex h-28 w-full max-w-16 items-end overflow-hidden rounded-xl bg-brand-50">
                    <div className="w-full rounded-xl bg-brand-500" style={{ height: `${Math.max(8, (week.count / maxWeeklyMilestones) * 100)}%` }} />
                  </div>
                  <span className="text-center text-xs font-bold leading-tight text-muted">{week.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ui-card p-5 sm:p-6" aria-labelledby="skills-title">
            <div>
              <p className="text-sm font-extrabold text-brand-600">Những năng lực con đã thể hiện</p>
              <h2 id="skills-title" className="font-display text-2xl font-extrabold">
                Bản đồ năng lực
              </h2>
              <p className="mt-1 text-sm text-muted">
                Mỗi hoạt động đã hoàn thành giúp bản đồ rõ hơn. “Chưa có dữ liệu” không phải điểm 0.
              </p>
              {competencySkills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
                  <span className="rounded-xl bg-mint-50 px-3 py-2 text-success">{achievedSkills} đã thể hiện tốt</span>
                  <span className="rounded-xl bg-sun-50 px-3 py-2 text-warning">{developingSkills} đang phát triển</span>
                  <span className="rounded-xl bg-brand-50 px-3 py-2 text-brand-700">{competencySkills.length} năng lực</span>
                </div>
              )}
            </div>
            {competency?.status === 'configuration_required' ? (
              <p className="mt-4 rounded-2xl bg-sun-50 p-4 text-sm font-semibold text-warning">
                Nhà trường đang hoàn thiện khung năng lực. Hệ thống không tự đặt tên
                kỹ năng khi chưa có cấu hình đã công bố.
              </p>
            ) : (
              <div className="mt-4 space-y-5">
                {competency?.frameworks.map((framework) => (
                  <article key={framework.id}>
                    <h3 className="font-display text-xl">{framework.name}</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {framework.domains.map((domain) => (
                        <div key={domain.id} className="rounded-2xl bg-brand-50 p-4">
                          <p className="font-extrabold text-brand-700">{domain.name}</p>
                          <div className="mt-3 space-y-2">
                            {domain.skills.map((skill) => (
                              <div key={skill.id} className="rounded-xl bg-white p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-bold">
                                    {skill.learnerLabel || skill.name}
                                  </p>
                                  <span className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-xs font-extrabold text-sky-700">
                                    {agePolicy?.copyPolicy
                                      .competencyLevelLabels[
                                      skill.result.level
                                    ] ??
                                      (skill.result.level === 'achieved'
                                        ? 'Đã thể hiện tốt'
                                        : skill.result.level === 'developing'
                                          ? 'Đang phát triển'
                                          : skill.result.level === 'not_met'
                                            ? 'Cần thêm trải nghiệm'
                                            : 'Chưa có dữ liệu')}
                                  </span>
                                </div>
                                <div className="mt-3 grid grid-cols-4 gap-1" aria-label={`Mức phát triển của ${skill.learnerLabel || skill.name}`}>
                                  {competencySteps.map((step, index) => (
                                    <span key={step} className={`h-2 rounded-full ${index <= competencyStep(skill.result.level) ? competencyTone(skill.result.level) : 'bg-border'}`} />
                                  ))}
                                </div>
                                <p className="mt-2 text-xs text-muted">
                                  {skill.result.evidenceCount} hoạt động đã ghi nhận
                                  {skill.result.scorePercent === null
                                    ? ''
                                    : ` · Kết quả gần nhất ${skill.result.scorePercent}%`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted">
                      {framework.disclaimer}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="ui-card p-5 sm:p-6" aria-labelledby="milestone-timeline-title">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun-50 text-sun-700" aria-hidden="true">
                <NavBadgeIcon size={28} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-sun-700">Dấu mốc đã đạt</p>
                <h2 id="milestone-timeline-title" className="font-display text-2xl font-extrabold">Hành trình của con</h2>
              </div>
            </div>
            {timeline.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-sun-50 p-4 text-sm text-muted">
                Dấu mốc đầu tiên sẽ xuất hiện khi con hoàn thành một mục tiêu học tập.
              </p>
            ) : (
              <ol className="mt-5 space-y-0">
                {timeline.slice(0, 8).map((item, index) => (
                  <li key={item.id} className="grid grid-cols-[2.5rem_1fr] gap-3">
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <span className="mt-1 h-4 w-4 rounded-full border-4 border-sun-100 bg-sun-500" />
                      {index < Math.min(timeline.length, 8) - 1 && <span className="min-h-14 w-0.5 flex-1 bg-sun-100" />}
                    </div>
                    <article className="pb-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-extrabold text-sun-700">{item.kind}</p>
                        <time className="text-xs font-bold text-muted" dateTime={item.date}>{dateLabel(item.date)}</time>
                      </div>
                      <h3 className="font-display text-lg font-bold">{item.title}</h3>
                      <p className="text-sm text-muted">{item.detail}</p>
                    </article>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="ui-card p-5 sm:p-6" aria-labelledby="credentials-title">
            <p className="text-sm font-extrabold text-sun-700">Dấu mốc đã đạt</p>
            <h2 id="credentials-title" className="font-display text-2xl font-extrabold">
              Chứng nhận xác minh được
            </h2>
            {credentials.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Chứng nhận sẽ xuất hiện khi con đạt đủ điều kiện đã được nhà trường công bố.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {credentials.map((credential) => (
                  <article key={credential.id} className="rounded-2xl bg-sun-50 p-4">
                    {credential.kind === 'badge' && credential.template.layoutJson.backgroundUrl && (
                      <img
                        src={credential.template.layoutJson.backgroundUrl}
                        alt=""
                        className="mb-3 h-20 w-20 rounded-2xl object-cover"
                        loading="lazy"
                      />
                    )}
                    <p className="text-xs font-bold uppercase text-sun-700">
                      {credential.kind === 'certificate' ? 'Chứng nhận' : 'Huy hiệu'}
                    </p>
                    <h3 className="mt-1 font-display text-lg">{credential.template.name}</h3>
                    <p className="text-sm text-muted">{credential.course.title}</p>
                    <p className="mt-3 break-all font-mono text-xs">
                      Mã chứng nhận: {credential.verificationCode}
                    </p>
                    {credential.template.layoutJson.allowShare &&
                      agePolicy?.permissionPolicy.canShareCredentials && (
                      <Link
                        className="mt-2 block text-xs font-bold text-brand-600 underline"
                        to={`/verify/credential/${credential.verificationCode}`}
                      >
                        Xác minh / chia sẻ
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PageMotion>
  )
}
