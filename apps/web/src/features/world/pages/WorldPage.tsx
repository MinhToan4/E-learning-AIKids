import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
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
import { RulesRoadmapContent } from '@/features/rules/components/RulesRoadmapContent'
import { useRulesProgress } from '@/features/rules/hooks/useRulesProgress'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'

export type PathwayCourse = {
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
  isGatekeeper?: boolean
  lockMessage?: string
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
  const navigate = useNavigate()
  const [quests, setQuests] = useState<QuestProgress[]>([])
  const [meta, setMeta] = useState({ totalStars: 0, completedCount: 0 })
  const [courseTitle, setCourseTitle] = useState('Hành trình sáng tạo')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pathway, setPathway] = useState<Pathway | null>(null)
  const [enrollmentRequired, setEnrollmentRequired] = useState(false)
  const [regionIndex, setRegionIndex] = useState(0)

  useEffect(() => {
    if (courseId && (courseId === 'aiki-rules' || courseId.toLowerCase().includes('rule'))) {
      setCourseTitle('Module 0 — Mười quy tắc của Xưởng sáng tạo')
      setLoading(false)
      return
    }
    void (async () => {
      setLoading(true)
      setError(null)
      setEnrollmentRequired(false)
      setQuests([])
      setMeta({ totalStars: 0, completedCount: 0 })
      try {
        if (!courseId) {
          const journey = await learningApi.getPathway()
          const initialCourses = applyGatekeeperRules(journey.courses)
          setPathway({ ...journey, courses: initialCourses })
          setLoading(false)
          const coursesWithStations = await Promise.all(
            initialCourses.map(async (course) => {
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
          const finalCourses = applyGatekeeperRules(coursesWithStations)
          setPathway({ ...journey, courses: finalCourses })
          return
        }
        let courseTitle = ''
        let pathRow: PathwayCourse | undefined

        const journey = await learningApi.getPathway()
        const processedCourses = applyGatekeeperRules(journey.courses)
        const courseResp = await learningApi.getCourse<{ course: { title: string } }>(courseId)
        courseTitle = courseResp.course.title
        pathRow = processedCourses.find((row) => row.id === courseId)
        setRegionIndex(Math.max(0, processedCourses.findIndex((row) => row.id === courseId)))

        if (!pathRow || pathRow.status === 'locked') {
          throw new Error(pathRow?.lockMessage || 'Khóa học này chưa được mở trong lộ trình của con.')
        }
        setPathway({ ...journey, courses: processedCourses })
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

  if (courseId && (courseId === 'aiki-rules' || courseId.toLowerCase().includes('rule') || isAikiRuleCourse({ id: courseId, title: courseTitle }, regionIndex))) {
    return (
      <RulesRoadmapContent
        courseId={courseId}
        backUrl="/world"
        onSelectRule={(ruleNum) => navigate(`/lesson/rule-${ruleNum}`)}
        ruleUrlPattern={(ruleNum) => `/lesson/rule-${ruleNum}`}
      />
    )
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




export function isAikiRuleCourse(course: { id: string; title: string }, index?: number): boolean {
  if (course.id === 'aiki-rules' || course.id.toLowerCase().includes('rule')) return true
  const lowerTitle = (course.title || '').toLowerCase()
  if (lowerTitle.includes('quy tắc') || lowerTitle.includes('quy tac') || lowerTitle.includes('rule')) return true
  return index === 0
}

export function isCourseRuleCompleted(course: PathwayCourse): boolean {
  if (course.status === 'completed') return true
  if (typeof course.questCount === 'number' && course.questCount > 0 && typeof course.completedCount === 'number') {
    return course.completedCount >= course.questCount
  }
  return false
}

export function applyGatekeeperRules(courses: PathwayCourse[]): PathwayCourse[] {
  if (courses.length === 0) return []

  const ruleCourseIndex = courses.findIndex((c, i) => isAikiRuleCourse(c, i))
  const targetRuleIndex = ruleCourseIndex >= 0 ? ruleCourseIndex : 0
  const ruleCourse = courses[targetRuleIndex]

  const isRuleDone = ruleCourse ? isCourseRuleCompleted(ruleCourse) : false

  return courses.map((course, idx) => {
    const isThisRuleCourse = idx === targetRuleIndex
    if (isThisRuleCourse) {
      // Đảo Quy Tắc LUÔN LUÔN mở sẵn cho học sinh mới vào, không bao giờ bị khóa
      const status = course.status === 'locked' ? 'available' : course.status
      return {
        ...course,
        status,
        isGatekeeper: true,
      }
    }

    if (!isRuleDone) {
      // Đảo Quy Tắc CHƯA HOÀN THÀNH: Tất cả các đảo khác bị KHÓA
      return {
        ...course,
        status: 'locked' as const,
        reasonCode: 'gatekeeper_rule_incomplete',
        lockMessage: 'Bé hãy hoàn thành Đảo Quy Tắc Vàng AIKI trước để nhận Huy hiệu Hiệp Sĩ và mở khóa toàn bộ hành trình sáng tạo nhé!',
      }
    } else {
      // Đảo Quy Tắc ĐÃ HOÀN THÀNH: Mở khóa đồng thời (Song song / Parallel)
      const status = course.status === 'locked' ? 'available' : course.status
      return {
        ...course,
        status,
        reasonCode: 'requirements_met',
        lockMessage: undefined,
      }
    }
  })
}

export function isPathwayCourseVisible(course: PathwayCourse): boolean {
  // A locked region is part of the learner's pathway: hiding it removes the
  // goal and the server-authored condition needed to unlock it.
  return ['completed', 'active', 'available', 'locked'].includes(course.status)
}

export const WORLD_REGIONS = [
  {
    name: 'Đảo 0: Mười Quy Tắc Vàng',
    description: 'Đảo Tiên Quyết — Nắm vững 10 nguyên tắc an toàn, đạo đức và làm chủ AI của Xưởng sáng tạo.',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.aiValley,
    ribbon: '#7c3aed',
    trailLabel: 'Đường mòn 10 Quy Tắc Vàng',
    pose: 'guide' as const,
    sceneLabel: 'AKI đang hướng dẫn 10 quy tắc an toàn sáng tạo AI',
  },
  {
    name: 'Đảo 1: Nhà Thám Hiểm AI',
    description: '4 Chìa Khóa Lệnh — Tạo hình ảnh đơn lẻ đúng ý mình và sửa câu lệnh như một kỹ sư AI thực thụ.',
    background: designerAssets.lobby.bgArt,
    scene: designerAssets.worldScenes.storyIsland,
    ribbon: '#10b981',
    trailLabel: 'Đường thám hiểm 4 chìa khoá lệnh',
    pose: 'thinking' as const,
    sceneLabel: 'AKI đang cùng con mở 4 chiếc chìa khoá lệnh',
  },
  {
    name: 'Đảo 2: Tớ Là Hoạ Sĩ AI!',
    description: 'Sắc Màu & Kể Chuyện — Bố cục ngôi sao 3 lớp, ánh sáng cảm xúc và tạo ra bức tranh biết nói.',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.creativeMountain,
    ribbon: '#f59e0b',
    trailLabel: 'Đường mòn sắc màu hoạ sĩ',
    pose: 'celebrate' as const,
    sceneLabel: 'AKI đang cầm cọ vẽ kiệt tác nghệ thuật',
  },
  {
    name: 'Đảo 3: Biệt Đội Nhân Vật AI',
    description: 'Hồ Sơ & 6 Biểu Cảm — Khoá mật mã nhận diện 3 điểm, biến hoá 6 biểu cảm và căn cứ bí mật.',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.aiValley,
    ribbon: '#0284c7',
    trailLabel: 'Đường mật mã nhân vật',
    pose: 'support' as const,
    sceneLabel: 'AKI đang cùng con thiết kế hồ sơ nhân vật độc quyền',
  },
  {
    name: 'Đảo 4: Vương Quốc Truyện Tranh AI',
    description: 'Storyboard 8 Ô & Comic — Kịch bản 3 cổng, khung xương 4 nhịp và xuất bản cuốn truyện tranh 8 trang.',
    background: designerAssets.lobby.bgArt,
    scene: designerAssets.worldScenes.storyIsland,
    ribbon: '#ec4899',
    trailLabel: 'Đường vương quốc truyện tranh 8 ô',
    pose: 'thinking' as const,
    sceneLabel: 'AKI đang xem bản thảo truyện tranh 8 ô',
  },
  {
    name: 'Đảo 5: Nhà Phát Minh Trò Chơi AI',
    description: 'Đấu Trường Thẻ Bài — Bộ 12 thẻ bài cân bằng chỉ số Sức-Nhanh-Khéo, bàn cờ A3 và luật chơi công bằng.',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.creativeMountain,
    ribbon: '#8b5cf6',
    trailLabel: 'Đấu trường thẻ bài đỉnh cao',
    pose: 'celebrate' as const,
    sceneLabel: 'AKI đang thi đấu trận chung kết thẻ bài',
  },
] as const

export function getRegionForCourse(course: { id: string; title: string; shortTitle?: string }, index: number) {
  const lower = `${course.id} ${course.title} ${course.shortTitle ?? ''}`.toLowerCase()
  if (lower.includes('quy tắc') || lower.includes('quy tac') || lower.includes('module 0') || lower.includes('rule')) return WORLD_REGIONS[0]
  if (lower.includes('nha-tham-hiem') || lower.includes('nhà thám hiểm') || lower.includes('module 1') || lower.includes('chìa khoá')) return WORLD_REGIONS[1]
  if (lower.includes('hoa-si') || lower.includes('hoạ sĩ') || lower.includes('module 2')) return WORLD_REGIONS[2]
  if (lower.includes('nhan-vat') || lower.includes('nhân vật') || lower.includes('module 3')) return WORLD_REGIONS[3]
  if (lower.includes('truyen-tranh') || lower.includes('truyện tranh') || lower.includes('module 4')) return WORLD_REGIONS[4]
  if (lower.includes('tro-choi') || lower.includes('trò chơi') || lower.includes('module 5')) return WORLD_REGIONS[5]
  return WORLD_REGIONS[index % WORLD_REGIONS.length]
}

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
  const region = getRegionForCourse(course, index);
  const isRule = isAikiRuleCourse(course, index);
  const { progress: rulesProgress, completedCount: rulesCompletedCount } = useRulesProgress();
  const currentRuleId = AIKI_RULES_DATA.find((r) => rulesProgress.rules[r.id]?.status === 'available')?.id ?? 1;

  const isCompleted = isRule ? rulesCompletedCount >= 10 : course.status === 'completed';
  const isActive = isRule ? (rulesCompletedCount > 0 && rulesCompletedCount < 10) : course.status === 'active';
  const isLocked = isRule ? false : course.status === 'locked';
  const stationCount = isRule ? 10 : Math.max(0, Math.round(course.questCount ?? 0));
  const completedStations = isRule
    ? rulesCompletedCount
    : Math.min(
        stationCount,
        Math.max(0, course.completedCount ?? Math.floor(stationCount * course.completionPercent / 100)),
      );
  const nextStation = course.stations?.find(
    (station) => station.status === 'available' || station.status === 'in_progress',
  );
  const previousRegion = index > 0 ? WORLD_REGIONS[(index - 1) % WORLD_REGIONS.length] : null;

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
        {course.isGatekeeper ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-black text-amber-950 shadow-2xs">
            🛡️ Đảo Tiên Quyết
          </span>
        ) : isRecommended && !isCompleted && (
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
            value={isRule ? Math.round((rulesCompletedCount / 10) * 100) : course.completionPercent}
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
              const stationNumber = stationIndex + 1;
              if (isRule) {
                const ruleProgress = rulesProgress.rules[stationNumber];
                const isRuleDone = ruleProgress?.status === 'completed';
                const isRuleCurrent = (ruleProgress?.status === 'available' && stationNumber === currentRuleId) || (!isRuleDone && stationNumber === currentRuleId);
                const isRuleUnlocked = isRuleDone || isRuleCurrent || ruleProgress?.status === 'available' || stationNumber === 1;
                const dotClassName = cn(
                  'world-station-dot',
                  isRuleDone && 'world-station-dot-done',
                  isRuleCurrent && 'world-station-dot-current',
                );
                const stationLabel = `Trạm ${stationNumber}: Quy tắc ${stationNumber}${isRuleDone ? ', đã xong' : isRuleCurrent ? ', tiếp theo' : ', chưa mở'}`;
                return (
                  <li key={stationNumber}>
                    {isRuleUnlocked ? (
                      <Link
                        to={`/lesson/rule-${stationNumber}`}
                        className={dotClassName}
                        aria-label={stationLabel}
                        title={`Quy tắc ${stationNumber}`}
                      >
                        {stationNumber}
                      </Link>
                    ) : (
                      <span className={dotClassName} aria-label={stationLabel} aria-disabled="true">
                        {stationNumber}
                      </span>
                    )}
                  </li>
                );
              }

              const station = course.stations?.[stationIndex];
              const isDone = station?.status === 'completed' || stationNumber <= completedStations;
              const isCurrent = station?.status === 'available' || station?.status === 'in_progress' || (stationNumber === completedStations + 1 && !isCompleted);
              const dotClassName = cn(
                'world-station-dot',
                isDone && 'world-station-dot-done',
                isCurrent && 'world-station-dot-current',
              );
              const stationLabel = `Trạm ${stationNumber}: ${station?.title ?? ''}${isDone ? ', đã xong' : isCurrent ? ', tiếp theo' : ', chưa mở'}`;
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
              );
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
              {course.lockMessage || (course.reasonCode === 'prerequisite_incomplete' && previousRegion
                ? `Hoàn thành ${previousRegion.name} để mở vùng này.`
                : 'Hoàn thành điều kiện trong hành trình để mở vùng này.')}
            </p>
          </div>
        </div>
      )}

      {!isLocked && (
        <div className="flex flex-wrap items-center gap-2">
          {isRule ? (
            <Link
              to={`/lesson/rule-${currentRuleId}`}
              className="world-course-primary-action"
            >
              Học tiếp
            </Link>
          ) : nextStation ? (
            <Link
              to={`/lesson/${nextStation.id}`}
              className="world-course-primary-action"
            >
              Học tiếp
            </Link>
          ) : null}
          <Link
            to={isRule ? `/world/${course.id || 'aiki-rules'}` : courseHref}
            className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-extrabold text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
          >
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
          {course.isGatekeeper && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-950 shadow-sm animate-pop">
              <span>🛡️ Đảo Tiên Quyết — Cửa ngõ mở khóa toàn bộ thế giới</span>
            </div>
          )}
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
  const { progress: rulesProgress } = useRulesProgress()
  const currentRuleId = AIKI_RULES_DATA.find((r) => rulesProgress.rules[r.id]?.status === 'available')?.id ?? 1

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
  const courseHref = (course: PathwayCourse) => {
    if (isAikiRuleCourse(course)) return `/world/${course.id || 'aiki-rules'}`
    return course.status === 'active' || course.status === 'completed'
      ? `/world/${course.id}`
      : `/course/${course.id}`
  }

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
            <Link to={isAikiRuleCourse(sourceRecommended) ? `/lesson/rule-${currentRuleId}` : (nextStation ? `/lesson/${nextStation.id}` : courseHref(sourceRecommended))}>
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
