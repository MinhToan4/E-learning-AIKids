import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'

import { api } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import {
  NavLeaderboardIcon,
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

type SkillLevel = CompetencyMap['frameworks'][number]['domains'][number]['skills'][number]['result']['level']

function skillGrowth(level: SkillLevel) {
  if (level === 'achieved') {
    return {
      label: 'Đã tỏa sáng',
      description: 'Con đã thể hiện kỹ năng này trong nhiều hoạt động.',
      className: 'border-mint-200 bg-mint-50 text-success',
      fillClassName: 'bg-mint-500',
      steps: 3,
    }
  }
  if (level === 'developing') {
    return {
      label: 'Đang lớn lên',
      description: 'Mỗi lần luyện tập đang giúp kỹ năng này mạnh hơn.',
      className: 'border-sun-200 bg-sun-50 text-warning',
      fillClassName: 'bg-sun-400',
      steps: 2,
    }
  }
  if (level === 'not_met') {
    return {
      label: 'Mới nảy mầm',
      description: 'Con đã bắt đầu thử và sẽ còn tiến bộ thêm.',
      className: 'border-sky-200 bg-sky-50 text-sky-700',
      fillClassName: 'bg-sky-400',
      steps: 1,
    }
  }
  return {
    label: 'Sắp khám phá',
    description: 'Kỹ năng này sẽ sáng lên khi con tham gia hoạt động phù hợp.',
    className: 'border-brand-100 bg-brand-50 text-brand-700',
    fillClassName: 'bg-brand-300',
    steps: 0,
  }
}

function courseProgressLabel(percent: number, completed: boolean) {
  if (completed || percent >= 100) return 'Đã hoàn thành'
  if (percent >= 75) return 'Sắp tới đích'
  if (percent >= 35) return 'Đang tiến bước'
  if (percent > 0) return 'Đã bắt đầu'
  return 'Sẵn sàng khám phá'
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

/** Personal learning progress. This is intentionally not a student leaderboard. */
export function ProgressPage() {
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [competency, setCompetency] = useState<CompetencyMap | null>(null)
  const [pathway, setPathway] = useState<Pathway | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ celebration: Celebration }>(
        '/api/gamification/class-celebration',
      )
      const [competencyResult, pathwayResult] = await Promise.allSettled([
        api<CompetencyMap>('/api/competency-map'),
        api<Pathway>('/api/learning/pathway'),
      ])
      setCelebration(data.celebration)
      setCompetency(
        competencyResult.status === 'fulfilled'
          ? competencyResult.value
          : { status: 'configuration_required', frameworks: [] },
      )
      setPathway(pathwayResult.status === 'fulfilled' ? pathwayResult.value : null)
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

  const activeCourses = pathway?.courses.filter((course) =>
    course.status === 'active' || course.status === 'completed') ?? []
  const competencySkills = competency?.frameworks.flatMap((framework) =>
    framework.domains.flatMap((domain) => domain.skills)) ?? []
  const achievedSkills = competencySkills.filter((skill) => skill.result.level === 'achieved').length
  const developingSkills = competencySkills.filter((skill) => skill.result.level === 'developing').length
  const visibleSkills = competencySkills.slice(0, 6)
  const growingSkills = achievedSkills + developingSkills
  const recommendedCourse = pathway?.courses.find((course) => course.id === pathway.recommendedCourseId)
    ?? activeCourses.find((course) => course.status === 'active')

  return (
    <PageMotion className="progress-experience">
      <header className="student-feature-hero progress-hero ui-card" data-tone="mint">
        <div className="progress-hero-copy">
          <div className="eyebrow-chip">
            <NavLeaderboardIcon size={20} aria-hidden="true" />
            Tiến bộ
          </div>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-[1.08] text-text sm:text-4xl">
            Con đang học đến đâu?
          </h1>
          <p className="mt-3 max-w-xl text-base font-semibold leading-relaxed text-muted sm:text-lg">
            Xem khóa học đang đi tới đâu, kỹ năng nào đang lớn lên và bài nào nên học tiếp.
          </p>
          <p className="progress-purpose-note">
            Muốn xem phần thưởng con đã sưu tập? <Link to="/achievements">Mở Huy hiệu</Link>
          </p>
        </div>
        <div className="progress-hero-art" aria-hidden="true">
          <img
            src={designerAssets.achievementExperience.progressValley}
            alt=""
            width="512"
            height="512"
            fetchPriority="high"
          />
          <ImportantCardMascot pose="walking" className="important-card-mascot--scene" />
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && celebration && (
        <>
          <section className="progress-summary-grid grid grid-cols-2 gap-3" aria-label="Những điều đã làm được">
            <StatTile
              icon={NavWorldIcon}
              label="nhiệm vụ đã hoàn thành"
              value={celebration.completedQuests}
              tone="mint"
            />
            <StatTile
              icon={competencySkills.length > 0 ? NavProfileIcon : CourseBookIcon}
              label={competencySkills.length > 0 ? 'kỹ năng đang lớn lên' : 'khóa học đang theo'}
              value={competencySkills.length > 0 ? growingSkills : activeCourses.length}
              tone={competencySkills.length > 0 ? 'sky' : 'sun'}
            />
          </section>

          <section className="progress-next-card next-step-card ui-card relative grid gap-5 overflow-hidden md:grid-cols-[1fr_auto] md:items-center" aria-labelledby="learning-next-title">
            <ImportantCardMascot pose="guide" className="important-card-mascot--compact" />
            <div>
              <p className="text-sm font-extrabold text-brand-600">Việc tiếp theo của con</p>
              <h2 id="learning-next-title" className="font-display text-2xl font-extrabold">
                {recommendedCourse
                  ? `Tiếp tục ${recommendedCourse.shortTitle || recommendedCourse.title}`
                  : 'Chọn hành trình đầu tiên'}
              </h2>
              <p className="mt-2 text-base font-semibold text-muted">
                {recommendedCourse
                  ? `Con đã đi được ${Math.round(recommendedCourse.completionPercent)}%. Học trạm tiếp theo để tiến gần tới đích.`
                  : 'Bắt đầu một khóa học để tạo lộ trình tiến bộ của riêng con.'}
              </p>
              <div className="mt-4">
                <Link to="/world" className="ui-btn bg-coral-400 text-white shadow-clay hover:bg-coral-500 active:shadow-press active:translate-y-0.5">
                  Học tiếp
                </Link>
              </div>
            </div>
          </section>

          <section className="progress-skills-card progress-story-card ui-card p-5 sm:p-6" aria-labelledby="skills-title">
            <p className="text-sm font-extrabold text-brand-600">Kỹ năng của mình</p>
            <h2 id="skills-title" className="font-display text-2xl font-extrabold">
              Điều gì đang lớn lên?
            </h2>
            <p className="mt-1 text-base text-muted">
              Mỗi lần học và luyện tập sẽ giúp một kỹ năng sáng rõ hơn.
            </p>
            {competency?.status === 'configuration_required' || visibleSkills.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-base text-muted">
                Kỹ năng của con sẽ xuất hiện sau những hoạt động học tập đầu tiên.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visibleSkills.map((skill) => {
                  const growth = skillGrowth(skill.result.level)
                  return (
                    <article key={skill.id} className={`rounded-[1.5rem] border-4 p-5 shadow-sm transition-transform hover:-translate-y-1 ${growth.className}`}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-xl font-bold text-text">
                          {skill.learnerLabel || skill.name}
                        </h3>
                        <span className="shrink-0 rounded-xl bg-white px-2 py-1 text-sm font-extrabold">
                          {growth.label}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2" aria-label={`${skill.learnerLabel || skill.name}: ${growth.label}`}>
                        {[1, 2, 3].map((step) => (
                          <span key={step} className={`h-3 rounded-full ${step <= growth.steps ? growth.fillClassName : 'bg-white'}`} />
                        ))}
                      </div>
                      <p className="mt-3 text-base font-semibold leading-relaxed text-muted">
                        {growth.description}
                      </p>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <section className="progress-courses-card progress-story-card ui-card p-5 sm:p-6" aria-labelledby="course-progress-title">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden="true">
                <CourseBookIcon size={28} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-brand-600">Khóa học của mình</p>
                <h2 id="course-progress-title" className="font-display text-2xl font-extrabold">
                  Con đang đi đến đâu?
                </h2>
              </div>
            </div>
            {activeCourses.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-brand-50 p-4">
                <p className="font-bold text-text">Con chưa bắt đầu khóa học nào.</p>
                <Link to="/world" className="mt-2 inline-flex min-h-11 items-center font-extrabold text-brand-600 underline">
                  Chọn hành trình đầu tiên
                </Link>
              </div>
            ) : (
              <ol className="personal-progress-path mt-5" aria-label="Lộ trình khóa học của con">
                {activeCourses.map((course, courseIndex) => {
                  const percent = Math.min(100, Math.max(0, Math.round(course.completionPercent)))
                  return (
                    <li key={course.id} className="personal-progress-step">
                      <span className="personal-progress-node" data-complete={percent >= 100} aria-hidden="true">
                        {percent >= 100 ? '✓' : courseIndex + 1}
                      </span>
                      <article className="personal-progress-step-card">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="font-display text-xl font-bold">{course.shortTitle || course.title}</h3>
                        <span className="rounded-xl bg-brand-50 px-3 py-1 text-sm font-extrabold text-brand-700">
                          {courseProgressLabel(percent, course.status === 'completed')}
                        </span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-50" role="progressbar" aria-label={`Tiến độ ${course.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

        </>
      )}
    </PageMotion>
  )
}
