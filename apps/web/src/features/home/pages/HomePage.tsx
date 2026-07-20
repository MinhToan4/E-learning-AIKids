import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { api, type CourseSummary } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { designerAssets } from '@/shared/config/assets'

/** AIkid xưởng hub — deep-links into course stations that teach the same mechanics */
const WORKSHOP_HUB = [
  {
    to: '/lesson/character',
    img: designerAssets.workshop.character,
    title: 'Nhân vật',
    sub: 'Xưởng character',
  },
  {
    to: '/lesson/style-pick',
    img: designerAssets.workshop.style,
    title: 'Phong cách',
    sub: 'Art style Soft Clay',
  },
  {
    to: '/lesson/comic',
    img: designerAssets.workshop.comic,
    title: 'Truyện tranh',
    sub: '4 khung comic',
  },
  {
    to: '/course/course-robot',
    img: designerAssets.workshop.mee,
    title: 'Mee · Robot',
    sub: 'Khóa robot sáng tạo',
  },
] as const

export function HomePage() {
  const user = useAuth((s) => s.user)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<{ courses: CourseSummary[] }>('/api/courses')
        setCourses(data.courses)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải khóa học')
      }
    })()
  }, [])

  const open = courses.filter((c) => c.status === 'open')
  const enrolled = open.filter((c) => c.enrolled)
  const explore = open.filter((c) => !c.enrolled)

  return (
    <div className="flex flex-col gap-6">
      <header className="ui-card relative overflow-hidden p-0">
        <div className="absolute inset-0">
          <img
            src={designerAssets.lobby.homeExplore}
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
        </div>
        <div className="relative flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <img
            src={designerAssets.brand.mascot}
            alt=""
            className="h-20 w-20 rounded-2xl object-cover shadow-clay"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand-500">
              Xin chào, {user?.nickname}!
            </p>
            <h1 className="font-display text-3xl leading-tight">
              Sảnh sáng tạo AIkid
            </h1>
            <p className="text-sm text-muted">
              Cấp {user?.level} · {user?.xp} XP · {open.length} khóa đang mở
            </p>
          </div>
          <Link to="/course/course-comic">
            <Button>Làm tiếp bản đồ</Button>
          </Link>
        </div>
      </header>

      <section>
        <h2 className="font-display mb-3 text-2xl">Xưởng sáng tạo</h2>
        <p className="mb-3 text-sm text-muted">
          Cùng cơ chế AIkid: nhân vật · art style · comic — trong lộ trình khóa học.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WORKSHOP_HUB.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="ui-card group overflow-hidden transition hover:-translate-y-0.5"
            >
              <img
                src={card.img}
                alt=""
                className="h-28 w-full object-cover transition group-hover:scale-[1.03]"
              />
              <div className="p-3">
                <p className="font-extrabold">{card.title}</p>
                <p className="text-xs text-muted">{card.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-danger" role="alert">
          {error}
        </p>
      )}

      {enrolled.length > 0 && (
        <section>
          <h2 className="font-display mb-3 text-2xl">Đang học</h2>
          <div className="grid gap-4 sm:grid-cols-2">{enrolled.map(courseCard)}</div>
        </section>
      )}

      <section>
        <h2 className="font-display mb-3 text-2xl">Khám phá khóa học</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(explore.length ? explore : open).map(courseCard)}
        </div>
      </section>
    </div>
  )
}

function courseCard(c: CourseSummary) {
  const cover =
    c.coverImage ||
    (c.id === 'course-comic'
      ? designerAssets.course.comic
      : c.id === 'course-safety'
        ? designerAssets.course.safety
        : c.id === 'course-voice'
          ? designerAssets.course.voice
          : c.id === 'course-robot'
            ? designerAssets.course.robot
            : null)

  return (
    <Link
      key={c.id}
      to={`/course/${c.id}`}
      className="ui-card group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div
        className="relative h-36 bg-brand-100"
        style={{
          background: `linear-gradient(135deg, ${c.coverFrom}, ${c.coverTo})`,
        }}
      >
        {cover && (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-95"
          />
        )}
        {c.recommended && (
          <span className="absolute left-3 top-3 rounded-full bg-sun-400 px-2 py-1 text-xs font-extrabold text-text">
            Gợi ý
          </span>
        )}
        {c.enrolled && (
          <span className="absolute right-3 top-3 rounded-full bg-mint-400 px-2 py-1 text-xs font-extrabold text-white">
            Đã ghi danh
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-xl">{c.title}</h3>
        <p className="text-sm text-muted">{c.tagline}</p>
        <p className="mt-2 text-xs font-bold text-brand-500">
          {c.ageLabel} · {c.durationLabel} · {c.questCount} trạm
        </p>
        {c.skills?.length > 0 && (
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {c.skills.slice(0, 3).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}
