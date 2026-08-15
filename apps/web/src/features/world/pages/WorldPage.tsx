import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CheckCircle2, Star, Trophy, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { KidLockImageIcon } from '@/shared/components/icons/KidImageIcons'
import {
  CourseBookIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import { type QuestProgress } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'

type PathwayCourse = {
  id: string
  title: string
  shortTitle: string
  status: 'completed' | 'active' | 'available' | 'locked'
  reasonCode: string
  completionPercent: number
  missingPrerequisites: string[]
  coverImage: string | null
  enrolled: boolean
  questCount?: number
  completedCount?: number
  totalStars?: number
  stations?: QuestProgress[]
  programSource?: 'aikid_official' | 'workspace' | 'creator_marketplace'
  workspaceId?: string | null
  programUnlockMode?: 'sequential' | 'parallel' | 'graph'
}

type Pathway = {
  student: { nickname: string | null; ageBand: string }
  policy: { label: string } | null
  regionUnlockMode?: 'sequential' | 'parallel'
  regionUnlockModeSource?: 'course' | 'classroom' | 'learner_override'
  recommendedCourseId: string | null
  courses: PathwayCourse[]
}

function StarDisplay({ count }: { count: number }) {
  const safeCount = Math.max(0, Math.min(3, count))
  return (
    <div className="flex items-center gap-1" aria-label={`${safeCount} trên 3 sao`}>
      <div className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            size={19}
            className={i <= safeCount ? 'fill-sun-400 text-sun-400' : 'fill-white text-slate-300'}
          />
        ))}
      </div>
      <span className="text-[10px] font-extrabold text-muted">{safeCount}/3</span>
    </div>
  )
}

const STATION_X_POSITIONS = [28, 68, 74, 43, 25, 52, 72, 42, 24, 61] as const

function getStationPoint(index: number, total: number) {
  return {
    x: STATION_X_POSITIONS[index % STATION_X_POSITIONS.length],
    y: total <= 1 ? 50 : 10 + (index * 80) / (total - 1),
  }
}

function buildStationPath(total: number) {
  if (total === 0) return ''
  const points = Array.from({ length: total }, (_, index) => getStationPoint(index, total))
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const middleY = (previous.y + point.y) / 2
    return `${path} C ${previous.x} ${middleY}, ${point.x} ${middleY}, ${point.x} ${point.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}

function QuestNode({ quest, index, total }: { quest: QuestProgress; index: number; total: number }) {
  const locked = quest.status === 'locked'
  const done = quest.status === 'completed'
  const available = quest.status === 'available' || quest.status === 'in_progress'

  const nodeEl = (
    <div className="quest-node-compact-wrap">
      <div
        className={cn(
          'quest-node',
          locked && 'quest-node-locked',
          available && 'quest-node-available',
          done && 'quest-node-completed',
        )}
        aria-label={`Trạm ${quest.order}: ${quest.title}`}
      >
        {locked ? (
          <KidLockImageIcon size={46} />
        ) : done ? (
          <CheckCircle2 size={32} className="text-text" aria-hidden />
        ) : (
          <span className="font-display text-2xl text-text" aria-hidden="true">
            {quest.order}
          </span>
        )}
      </div>
      {!locked && (
        <div className={cn('quest-node-caption', available && 'quest-node-caption-current')}>
          <span>Trạm {quest.order}</span>
          {done ? <StarDisplay count={quest.stars} /> : <strong>Đang học</strong>}
        </div>
      )}
    </div>
  )

  return (
    <li
      className="quest-map-point"
      style={{
        left: `${getStationPoint(index, total).x}%`,
        top: `${getStationPoint(index, total).y}%`,
      }}
    >
      {locked ? (
        <div className="cursor-not-allowed">{nodeEl}</div>
      ) : (
        <Link to={`/lesson/${quest.id}`} className="block">
          {nodeEl}
        </Link>
      )}
    </li>
  )
}

export function WorldPage() {
  const { courseId } = useParams()
  const [quests, setQuests] = useState<QuestProgress[]>([])
  const [meta, setMeta] = useState({ totalStars: 0, completedCount: 0 })
  const [courseTitle, setCourseTitle] = useState('Hành trình sáng tạo')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pathway, setPathway] = useState<Pathway | null>(null)
  const [enrollmentRequired, setEnrollmentRequired] = useState(false)
  const [regionIndex, setRegionIndex] = useState(0)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      setEnrollmentRequired(false)
      setQuests([])
      setMeta({ totalStars: 0, completedCount: 0 })
      try {
        if (!courseId) {
          const journey = await learningApi.getPathway()
          setPathway(journey)
          setLoading(false)
          const coursesWithStations = await Promise.all(
            journey.courses.map(async (course) => {
              try {
                const progress = await learningApi.getCourseProgress(course.id)
                return {
                  ...course,
                  questCount: progress.quests.length,
                  completedCount: progress.completedCount,
                  totalStars: progress.totalStars,
                  stations: progress.quests,
                }
              } catch {
                return course
              }
            }),
          )
          setPathway({ ...journey, courses: coursesWithStations })
          return
        }
        let courseTitle = ''
        let pathRow: PathwayCourse | undefined

        const journey = await learningApi.getPathway()
        const courseResp = await learningApi.getCourse<{ course: { title: string } }>(courseId)
        courseTitle = courseResp.course.title
        pathRow = journey.courses.find((row) => row.id === courseId)
        setRegionIndex(Math.max(0, journey.courses.findIndex((row) => row.id === courseId)))

        if (!pathRow || pathRow.status === 'locked') {
          throw new Error('Khóa học này chưa được mở trong lộ trình của con.')
        }
        setPathway(journey)
        setCourseTitle(courseTitle)
        if (pathRow.status === 'available') {
          setEnrollmentRequired(true)
          return
        }
        const data = await learningApi.getCourseProgress(courseId)
        setQuests(data.quests)
        setMeta({ totalStars: data.totalStars, completedCount: data.completedCount })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được bản đồ')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId])

  const next = quests.find(
    (q) => q.status === 'available' || q.status === 'in_progress',
  )
  const progressPct = quests.length > 0 ? Math.round((meta.completedCount / quests.length) * 100) : 0
  const currentRegion = WORLD_REGIONS[regionIndex % WORLD_REGIONS.length]

  if (!courseId) {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="ui-skeleton h-32 rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ui-skeleton h-40 rounded-3xl" />
            <div className="ui-skeleton h-40 rounded-3xl" />
          </div>
        </div>
      )
    }
    if (error || !pathway) {
      return (
        <p className="ui-card p-5 text-danger" role="alert">
          {error ?? 'Chưa tải được lộ trình học.'}
        </p>
      )
    }
    return <PathwayOverview pathway={pathway} />
  }

  return (
    <div className="flex flex-col gap-6 page-enter">
      <header className="course-map-hero">
        <div className="course-map-heading">
          <p className="mb-1 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold text-brand-700">
            <Link to="/world" className="inline-flex min-h-11 items-center gap-1 hover:text-brand-900">
              <NavWorldIcon size={21} aria-hidden="true" /> World
            </Link>
            <span aria-hidden="true">›</span>
            <span>{currentRegion.name}</span>
            <span aria-hidden="true">›</span>
            <span>Bản đồ trạm</span>
          </p>
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{courseTitle}</h1>
          <p className="mt-1 text-base font-bold text-muted">
            Đi cùng Mee và mở từng trạm trong {currentRegion.name}.
          </p>
        </div>

        <div className="course-map-scene" aria-label={currentRegion.sceneLabel}>
          <img src={currentRegion.scene} alt="" className="course-map-scene-art" />
          <AikidCatCharacter pose={currentRegion.pose} className="course-map-scene-cat" />
        </div>

        <div className="course-map-ribbon" style={{ backgroundColor: currentRegion.ribbon }}>
          <div className="course-map-ribbon-main">
            <div>
              <p className="text-sm font-extrabold text-white/85">Hành trình trong khóa</p>
              <p className="font-display text-2xl text-white">
                {meta.completedCount}/{quests.length} trạm đã chinh phục
              </p>
            </div>
            {next && (
              <aside className="course-map-next-ticket">
                <div>
                  <p className="text-xs font-extrabold text-mint-700">TRẠM TIẾP THEO</p>
                  <h2 className="font-display text-xl text-text">{next.title}</h2>
                  <p className="text-sm font-bold text-muted">Trạm {next.order} · {next.duration}</p>
                </div>
                <Link to={`/lesson/${next.id}`} className="course-map-primary-action animate-pop">
                  {next.status === 'in_progress' ? 'Tiếp tục học' : 'Bắt đầu học'}
                </Link>
              </aside>
            )}
          </div>

          {quests.length > 0 && (
            <CuteProgress
              value={progressPct}
              label="Tiến độ khóa học"
              tone="mint"
              className="course-map-progress"
            />
          )}

          <div className="course-map-stats">
            <span><Trophy size={17} aria-hidden /> {meta.totalStars}/{quests.length * 3} sao</span>
            <span><CheckCircle2 size={17} aria-hidden /> {meta.completedCount} trạm xong</span>
            <Link to={`/course/${courseId}`}>
              <CourseBookIcon size={19} aria-hidden="true" /> Giới thiệu khóa
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-danger text-sm" role="alert">
          {error}
        </p>
      )}

      {enrollmentRequired && !loading && (
        <section className="ui-card mx-auto w-full max-w-xl p-6 text-center">
          <CourseBookIcon size={42} className="mx-auto text-brand-500" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl">Hành trình chưa bắt đầu</h2>
          <p className="mt-2 text-sm text-muted">
            Xem giới thiệu và bắt đầu khóa học để mở trạm đầu tiên.
          </p>
          <Link className="mt-4 inline-block" to={`/course/${courseId}`}>
            <Button>Bắt đầu hành trình</Button>
          </Link>
        </section>
      )}

      {/* Quest Node Map */}
      {loading ? (
        <div className="flex flex-col items-center gap-5 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 w-full max-w-sm" style={{ justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
              <div className="ui-skeleton rounded-full" style={{ width: 80, height: 80, flexShrink: 0 }} />
              <div className="ui-skeleton rounded-2xl" style={{ width: 160, height: 72 }} />
            </div>
          ))}
        </div>
      ) : !enrollmentRequired && !error ? (
        <section
          className="course-station-map"
          style={{
            backgroundColor: currentRegion.ribbon,
            backgroundImage: `linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.08)), url(${currentRegion.background})`,
          }}
          aria-label="Lộ trình bài học"
        >
          <div
            className="course-station-canvas"
            style={{
              minHeight: `${Math.max(40, quests.length * 7.6)}rem`,
            }}
          >
            <svg
              className="course-game-path"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className="course-game-path-shadow" d={buildStationPath(quests.length)} />
              <path className="course-game-path-road" d={buildStationPath(quests.length)} />
              <path className="course-game-path-dashes" d={buildStationPath(quests.length)} />
            </svg>
            <ol className="course-game-stations">
            {quests.map((q, i) => (
              <QuestNode key={q.id} quest={q} index={i} total={quests.length} />
            ))}
            </ol>
          </div>

          {/* Completion trophy at bottom */}
          {quests.length > 0 && meta.completedCount === quests.length && (
            <div className="relative z-10 flex flex-col items-center mt-8 animate-pop">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sun-400 to-coral-400 shadow-clay">
                <Trophy size={48} className="text-white" aria-hidden="true" />
              </div>
              <p className="mt-3 font-display text-xl text-text">Xuất sắc!</p>
              <p className="text-sm text-muted">Con đã hoàn thành toàn bộ hành trình!</p>
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}




export function isPathwayCourseVisible(course: PathwayCourse): boolean {
  // A locked region is part of the learner's pathway: hiding it removes the
  // goal and the server-authored condition needed to unlock it.
  return ['completed', 'active', 'available', 'locked'].includes(course.status)
}

const WORLD_REGIONS = [
  {
    name: 'Thung lũng AI',
    description: 'Làm quen với AI và khám phá cách máy học hỏi.',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.aiValley,
    ribbon: 'var(--color-mint-600)',
    trailLabel: 'Đường mòn thung lũng',
    pose: 'guide',
    sceneLabel: 'Mee đang chỉ con cách AI học hỏi',
  },
  {
    name: 'Đảo kể chuyện',
    description: 'Biến ý tưởng thành nhân vật, câu chuyện và tranh.',
    background: designerAssets.lobby.bgArt,
    scene: designerAssets.worldScenes.storyIsland,
    ribbon: 'var(--color-sun-600)',
    trailLabel: 'Đường qua đảo',
    pose: 'thinking',
    sceneLabel: 'Mee đang nghĩ ra một câu chuyện mới',
  },
  {
    name: 'Dãy núi sáng tạo',
    description: 'Chinh phục thử thách phim, chuyển động và dự án AI.',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.creativeMountain,
    ribbon: 'var(--color-sky-600)',
    trailLabel: 'Đường vượt núi',
    pose: 'celebrate',
    sceneLabel: 'Mee đang nhảy mừng sau thử thách',
  },
  {
    name: 'Phòng Lab Thử Nghiệm',
    description: 'Nơi thử nghiệm 10 loại trạm thực hành khác nhau.',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.aiValley,
    ribbon: 'var(--color-violet-600)',
    trailLabel: 'Đường khám phá Lab',
    pose: 'support',
    sceneLabel: 'Mee đang hỗ trợ bạn trong phòng lab',
  },
] as const

function RoadmapCourseNode({
  course,
  index,
  isRecommended,
  courseHref,
}: {
  course: PathwayCourse
  index: number
  isRecommended: boolean
  courseHref: string
}) {
  const region = WORLD_REGIONS[index % WORLD_REGIONS.length];

  const isCompleted = course.status === 'completed'
  const isActive = course.status === 'active'
  const isLocked = course.status === 'locked'
  const stationCount = Math.max(0, Math.round(course.questCount ?? 0))
  const completedStations = Math.min(
    stationCount,
    Math.max(0, course.completedCount ?? Math.floor(stationCount * course.completionPercent / 100)),
  )
  const nextStation = course.stations?.find(
    (station) => station.status === 'available' || station.status === 'in_progress',
  )
  const previousRegion = index > 0 ? WORLD_REGIONS[(index - 1) % WORLD_REGIONS.length] : null

  const cardInner = (
    <div
      className={cn(
        'world-region-ribbon flex w-full flex-col gap-3 px-5 py-4 text-white transition-transform duration-200 sm:px-8 sm:py-5',
        isLocked && 'opacity-60',
        !isLocked && 'hover:-translate-y-0.5',
      )}
      style={{ backgroundColor: region.ribbon }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {isRecommended && !isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-brand-700">
            <Zap size={9} aria-hidden /> Tiếp theo
          </span>
        )}
        <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-extrabold text-white">
          {isCompleted ? 'Hoàn thành' : isActive ? 'Đang học' : isLocked ? 'Chưa mở' : 'Sẵn sàng'}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 truncate">
          {course.shortTitle}
        </p>
        <h3 className="font-display text-xl leading-snug text-white line-clamp-2">
          {course.title}
        </h3>
      </div>

      {(isActive || isCompleted) && (
        <div>
          <CuteProgress
            value={course.completionPercent}
            label="Hoàn thành khóa"
            tone={isCompleted ? 'mint' : 'violet'}
          />
        </div>
      )}

      {stationCount > 0 && (
        <div className="world-station-preview" aria-label={`${completedStations}/${stationCount} trạm hoàn thành`}>
          <div className="world-station-preview-head">
            <span>{region.trailLabel}</span>
            <strong>{completedStations}/{stationCount} trạm</strong>
          </div>
          <ol className="world-station-path">
            {Array.from({ length: stationCount }, (_, stationIndex) => {
              const stationNumber = stationIndex + 1
              const station = course.stations?.[stationIndex]
              const isDone = station?.status === 'completed' || stationNumber <= completedStations
              const isCurrent = station?.status === 'available' || station?.status === 'in_progress' || (stationNumber === completedStations + 1 && !isCompleted)
              const dotClassName = cn(
                'world-station-dot',
                isDone && 'world-station-dot-done',
                isCurrent && 'world-station-dot-current',
              )
              const stationLabel = `Trạm ${stationNumber}: ${station?.title ?? ''}${isDone ? ', đã xong' : isCurrent ? ', tiếp theo' : ', chưa mở'}`
              return (
                <li key={station?.id ?? stationNumber}>
                  {station && station.status !== 'locked' ? (
                    <Link
                      to={`/lesson/${station.id}`}
                      className={dotClassName}
                      aria-label={stationLabel}
                      title={station.title}
                    >
                      {stationNumber}
                    </Link>
                  ) : (
                    <span className={dotClassName} aria-label={stationLabel} aria-disabled="true">
                      {stationNumber}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {isLocked && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-black/10 p-3 text-left">
          <KidLockImageIcon size={42} className="shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-extrabold text-white">Vùng sẽ mở khi con sẵn sàng</p>
            <p className="mt-0.5 text-xs font-semibold leading-relaxed text-white/90">
              {course.reasonCode === 'prerequisite_incomplete' && previousRegion
                ? `Hoàn thành ${previousRegion.name} để mở vùng này.`
                : 'Hoàn thành điều kiện trong hành trình để mở vùng này.'}
            </p>
          </div>
        </div>
      )}

      {!isLocked && (
        <div className="flex flex-wrap items-center gap-2">
          {nextStation && (
            <Link to={`/lesson/${nextStation.id}`} className="world-course-primary-action">
              Học tiếp
            </Link>
          )}
          <Link to={courseHref} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-extrabold text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white">
            {isCompleted ? 'Học lại' : 'Xem toàn bộ trạm'}
            <ChevronRight size={16} aria-hidden />
          </Link>
        </div>
      )}
    </div>
  )

  const card = <div className={cn('w-full', isLocked && 'cursor-not-allowed')}>{cardInner}</div>

  return (
    <li
      className={cn(
        'world-region-card relative overflow-visible',
        isCompleted && 'world-region-card-completed',
        (isActive || isRecommended) && !isCompleted && 'world-region-card-current',
        isLocked && 'world-region-card-locked grayscale-[.35]',
      )}
    >
      <div className="relative flex min-h-[29rem] flex-col justify-between pt-6 sm:min-h-[32rem] sm:pt-7">
        <div className="relative z-10 px-5 text-center sm:px-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-700">Vùng {index + 1}</p>
          <h2 className="mt-1 font-display text-4xl text-text">{course.title}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm font-bold leading-relaxed text-muted">
            {course.shortTitle && course.shortTitle !== course.title
              ? course.shortTitle
              : region.description}
          </p>
        </div>
        <div className="world-region-scene relative z-10 flex flex-1 items-end justify-center overflow-hidden px-4 pt-2" aria-label={region.sceneLabel}>
          <img
            src={region.scene}
            alt=""
            className="world-region-art"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <AikidCatCharacter pose={region.pose} className="world-region-scene-cat" />
        </div>
        <div className="relative z-20">{card}</div>
      </div>
      <svg
        className="world-region-road"
        viewBox="0 0 100 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="world-region-road-edge" d="M50 0 C18 42 82 102 50 160" />
        <path className="world-region-road-surface" d="M50 0 C18 42 82 102 50 160" />
        <path className="world-region-road-centre" d="M50 0 C18 42 82 102 50 160" />
      </svg>
    </li>
  )
}

type LearningWorldKind = 'aikid_official' | 'workspace' | 'creator_marketplace'

const LEARNING_WORLD_SCENES: Record<LearningWorldKind, string> = {
  aikid_official: designerAssets.worldLibrary.aikidOfficial,
  workspace: designerAssets.worldLibrary.school,
  creator_marketplace: designerAssets.worldLibrary.creator,
}

function LearningWorldScene({ kind }: { kind: LearningWorldKind }) {
  const pose = kind === 'aikid_official' ? 'guide' : kind === 'workspace' ? 'walking' : 'thinking'
  return (
    <div className="learning-world-scene" aria-hidden="true">
      <img src={LEARNING_WORLD_SCENES[kind]} alt="" className="learning-world-scene-art" draggable={false} />
      <AikidCatCharacter pose={pose} className="learning-world-scene-cat" />
    </div>
  )
}

function PathwayOverview({ pathway }: { pathway: Pathway }) {
  const [selectedSource, setSelectedSource] = useState<PathwayCourse['programSource'] | null>(null)
  // Canonical pathway responses include `enrolled`; status is retained as a
  // defensive fallback for older cached/deployed gateway responses.
  const visibleCourses = pathway.courses.filter(isPathwayCourseVisible)
  const sourceOf = (course: PathwayCourse) => course.programSource ?? 'aikid_official'
  const categories = [
    {
      id: 'aikid_official' as const,
      title: 'AiKid của em',
      description: 'Giáo trình chính thức và hành trình được AiKid đề xuất.',
      eyebrow: 'Giáo trình chính thức',
      tone: 'bg-mint-50 border-mint-200 text-success',
    },
    {
      id: 'workspace' as const,
      title: 'Trường học',
      description: 'Chương trình từ trường, lớp và workspace con đang tham gia.',
      eyebrow: 'Theo workspace',
      tone: 'bg-sky-50 border-sky-200 text-sky-700',
    },
    {
      id: 'creator_marketplace' as const,
      title: 'Khóa học tự do',
      description: 'Khóa của giáo viên và chương trình gia đình đã đăng ký.',
      eyebrow: 'Thư viện của con',
      tone: 'bg-sun-50 border-sun-200 text-warning',
    },
  ]
  const selectedCategory = categories.find((category) => category.id === selectedSource)
  const selectedCourses = selectedSource
    ? visibleCourses.filter((course) => sourceOf(course) === selectedSource)
    : []
  const sourceRecommended = selectedCourses.find(
    (course) => course.id === pathway.recommendedCourseId,
  ) ?? selectedCourses.find((course) => course.status === 'active')
    ?? selectedCourses.find((course) => course.status === 'available')
  const nextStation = sourceRecommended?.stations?.find(
    (station) => station.status === 'in_progress' || station.status === 'available',
  )
  const courseHref = (course: PathwayCourse) =>
    course.status === 'active' || course.status === 'completed'
      ? `/world/${course.id}`
      : `/course/${course.id}`

  const completedCount = selectedCourses.filter((c) => c.status === 'completed').length
  const totalStations = selectedCourses.reduce((sum, course) => sum + Math.max(0, course.questCount ?? 0), 0)
  const completedStations = selectedCourses.reduce(
    (sum, course) => sum + Math.max(0, course.completedCount ?? 0),
    0,
  )
  const totalProgress = totalStations > 0
    ? Math.round((completedStations / totalStations) * 100)
    : 0

  return (
    <div className="page-enter flex flex-col gap-5">
      <header className="world-guide-panel">
        {selectedSource && (
          <img
            src={LEARNING_WORLD_SCENES[selectedSource]}
            alt=""
            className="world-guide-scene"
            aria-hidden="true"
          />
        )}
        <AikidCatCharacter pose="walking" className="world-guide-mascot" />
        <div className="world-guide-copy">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
              {selectedCategory ? `Học · ${selectedCategory.title}` : 'Học · Thư viện hành trình'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl leading-tight">
              {selectedCategory
                ? selectedCategory.title
                : `Hành trình của ${pathway.student.nickname ?? 'con'}`}
            </h1>
            <p className="mt-1 text-base text-muted">
              {selectedCategory
                ? selectedCategory.description
                : 'Chọn nơi con muốn tiếp tục học hôm nay.'}
            </p>

            {selectedCategory && (
              <button
                type="button"
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-brand-100 bg-white/90 px-3 py-2 text-sm font-extrabold text-brand-800 shadow-soft focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                onClick={() => setSelectedSource(null)}
              >
                <NavWorldIcon size={22} aria-hidden="true" />
                Xem tất cả nguồn học
              </button>
            )}

            {/* Progress is scoped to the selected learning space. */}
            {selectedCategory && selectedCourses.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
                  <CheckCircle2 size={13} className="text-mint-600" aria-hidden />
                  {completedStations}/{totalStations} trạm đã hoàn thành
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
                  <Trophy size={13} className="text-sun-600" aria-hidden />
                  {totalProgress}% không gian này
                </div>
              </div>
            )}
            {selectedCategory && selectedCourses.length > 0 && (
              <CuteProgress
                value={totalProgress}
                label={`Lộ trình ${selectedCategory.title}`}
                tone="mint"
                className="mt-4"
              />
            )}
          </div>
        </div>

        {selectedCategory && sourceRecommended && (
          <div className="world-next-ticket">
            <div>
              <p className="flex items-center gap-1 text-xs font-extrabold uppercase text-mint-700">
                <Star size={11} className="fill-mint-500 text-mint-500" aria-hidden />
                Trạm tiếp theo
              </p>
              <p className="mt-1 font-display text-xl">{nextStation?.title ?? sourceRecommended.title}</p>
              <p className="mt-1 text-sm font-bold text-muted">
                {nextStation
                  ? `${sourceRecommended.shortTitle} · Trạm ${nextStation.order}`
                  : `${sourceRecommended.completedCount ?? 0}/${sourceRecommended.questCount ?? 0} trạm đã hoàn thành`}
              </p>
            </div>
            <Link to={nextStation ? `/lesson/${nextStation.id}` : courseHref(sourceRecommended)}>
              <Button>
                {sourceRecommended.status === 'available' && !nextStation ? 'Xem & bắt đầu' : 'Học tiếp'}
              </Button>
            </Link>
          </div>
        )}
        {!selectedCategory && (
          <div className="world-next-ticket">
            <div>
              <p className="flex items-center gap-1 text-xs font-extrabold uppercase text-brand-700">
                <NavWorldIcon size={16} aria-hidden="true" />
                Chọn không gian học
              </p>
              <p className="mt-1 font-display text-xl">Mỗi nơi, một hành trình riêng</p>
              <p className="mt-1 text-sm font-bold leading-relaxed text-muted">
                Tiến độ và trạm tiếp theo sẽ đổi theo nơi con chọn.
              </p>
            </div>
          </div>
        )}
      </header>

      {!selectedSource ? (
        <section aria-labelledby="learning-library-title" className="space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Ba không gian học tập</p>
            <h2 id="learning-library-title" className="mt-1 font-display text-2xl text-text sm:text-3xl">Con muốn học ở đâu?</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {categories.map((category) => {
              const courses = visibleCourses.filter((course) => sourceOf(course) === category.id)
              const active = courses.filter((course) => course.status === 'active').length
              const stations = courses.reduce((sum, course) => sum + Math.max(0, course.questCount ?? 0), 0)
              const doneStations = courses.reduce((sum, course) => sum + Math.max(0, course.completedCount ?? 0), 0)
              const progress = stations > 0 ? Math.round(doneStations / stations * 100) : 0
              return (
                <button
                  key={category.id}
                  type="button"
                  className={cn(
                    'learning-world-card ui-card border-2 text-left transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus',
                    category.tone,
                  )}
                  onClick={() => setSelectedSource(category.id)}
                >
                  <LearningWorldScene kind={category.id} />
                  <span className="learning-world-copy">
                    <span className="block text-xs font-extrabold uppercase tracking-wide opacity-80">{category.eyebrow}</span>
                    <span className="mt-1 block font-display text-2xl text-text">{category.title}</span>
                    <span className="mt-1 block text-sm font-bold leading-relaxed text-muted">{category.description}</span>
                    <span className="mt-3 flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-white/85 px-3 py-2 text-sm font-extrabold text-text shadow-soft">
                      {courses.length > 0
                        ? <>
                            <span>{doneStations}/{stations} trạm</span>
                            <span aria-hidden="true" className="text-border">·</span>
                            <span>{progress}% hoàn thành</span>
                            {active > 0 && <span className="text-brand-700">{active} đang học</span>}
                          </>
                        : 'Chưa có chương trình'}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : selectedCourses.length === 0 ? (
        <div className="ui-card p-6 text-center">
          <CourseBookIcon size={44} className="mx-auto text-brand-500" aria-hidden="true" />
          <p className="mt-3 font-display text-xl">Chưa có chương trình trong mục này</p>
          <p className="mt-2 text-sm text-muted">
            Chương trình được trường giao hoặc gia đình đăng ký sẽ xuất hiện tại đây.
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => setSelectedSource(null)}>
            Quay lại thư viện
          </Button>
        </div>
      ) : visibleCourses.length === 0 ? (
        <div className="ui-card p-6 text-center">
          <p className="font-display text-xl">Cha mẹ chưa chọn khóa học</p>
          <p className="mt-2 text-sm text-muted">
            Nhờ cha mẹ vào mục Con của tôi để chọn và mở khóa học cho con nhé.
          </p>
        </div>
      ) : (
        <section aria-label="Lộ trình khóa học" className="relative px-2">
          {/* ── Section label ── */}
          <p className="mb-5 text-xs font-extrabold uppercase tracking-widest text-brand-500 flex items-center gap-2">
            <span className="inline-block h-px flex-1 bg-brand-100" />
            🗺️ Các vùng trong thế giới AIKid
            <span className="inline-block h-px flex-1 bg-brand-100" />
          </p>

          <div className="relative">
            <ol className="relative z-10 flex flex-col gap-6" aria-label="Danh sách vùng và bản đồ khóa học">
              {selectedCourses.map((course, index) => (
                <RoadmapCourseNode
                  key={course.id}
                  course={course}
                  index={index}
                  isRecommended={course.id === sourceRecommended?.id}
                  courseHref={courseHref(course)}
                />
              ))}
            </ol>

            {/* ── Finish line at bottom ── */}
            {completedCount === selectedCourses.length && selectedCourses.length > 0 && (
              <div className="relative z-10 flex flex-col items-center mt-8 animate-pop">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sun-400 to-coral-400 shadow-clay">
                  <Trophy size={40} className="text-white" aria-hidden="true" />
                </div>
                <p className="mt-3 font-display text-xl text-text">🎉 Xuất sắc!</p>
                <p className="text-sm text-muted">Con đã hoàn thành toàn bộ lộ trình!</p>
              </div>
            )}

            {/* Finish flag at bottom (always shown) */}
            {selectedCourses.length > 0 && completedCount < selectedCourses.length && (
              <div
                className="world-pathway-destination relative z-10 mx-auto flex w-fit items-center gap-2 text-xs font-extrabold text-muted"
                aria-hidden
              >
                <span className="world-pathway-destination-flag">🏁</span>
                Đích đến
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
