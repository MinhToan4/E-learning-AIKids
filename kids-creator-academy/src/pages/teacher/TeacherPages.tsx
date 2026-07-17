import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/Progress'
import { AVATARS } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'
import { cn } from '@/lib/cn'

const stickers = ['🌟 Tuyệt vời', '🧠 Tư duy tốt', '🛡️ An toàn', '🎨 Sáng tạo']

export function TeacherOverviewPage() {
  const students = useDemoStore((s) => s.students)
  const avg =
    Math.round(students.reduce((s, st) => s + st.progress, 0) / students.length) || 0
  const needHelp = students.filter((s) => s.status === 'needs_support').length
  const pendingProjects = students.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Tổng quan lớp</h1>
        <p className="text-muted">
          Khóa: Tạo truyện tranh AI đầu tiên · Không bảng xếp hạng công khai
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Học sinh" value={String(students.length)} />
        <Metric title="Tiến độ TB" value={`${avg}%`} />
        <Metric title="Cần hỗ trợ" value={String(needHelp)} />
        <Metric title="Dự án gần đây" value={String(pendingProjects)} />
      </div>
      <Card>
        <h2 className="font-display text-xl font-semibold">Heatmap kỹ năng (mock)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-3 font-bold">Học sinh</th>
                <th className="py-2 pr-3 font-bold">Prompt</th>
                <th className="py-2 pr-3 font-bold">So sánh</th>
                <th className="py-2 pr-3 font-bold">Kể chuyện</th>
                <th className="py-2 font-bold">An toàn</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id} className="border-b border-border/70">
                  <td className="py-3 pr-3 font-semibold">{st.nickname}</td>
                  {['#6C5CE7', '#45C4F9', '#58D8A3', '#FFD166'].map((c, i) => (
                    <td key={c} className="py-3 pr-3">
                      <span
                        className="inline-block size-8 rounded-lg"
                        style={{
                          background: c,
                          opacity: 0.35 + ((st.progress + i * 7) % 50) / 100,
                        }}
                        title="Mức luyện tập"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Màu thể hiện tần suất luyện — không dùng để xếp hạng công khai.
        </p>
      </Card>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <p className="text-sm font-bold text-muted">{title}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </Card>
  )
}

export function TeacherStudentsPage() {
  const students = useDemoStore((s) => s.students)
  const [filter, setFilter] = useState<'all' | 'needs_support' | 'on_track' | 'ahead'>(
    'all',
  )

  const list = useMemo(
    () => (filter === 'all' ? students : students.filter((s) => s.status === filter)),
    [students, filter],
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Học sinh</h1>
        <p className="text-muted">Dùng biệt danh — không họ tên thật.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', 'Tất cả'],
            ['needs_support', 'Cần hỗ trợ'],
            ['on_track', 'Đúng tiến độ'],
            ['ahead', 'Đi trước'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              'min-h-11 cursor-pointer rounded-full px-4 text-sm font-bold',
              filter === id ? 'bg-brand-500 text-white' : 'bg-white shadow-soft text-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((st) => {
          const avatar = AVATARS.find((a) => a.id === st.avatarId) ?? AVATARS[0]
          return (
            <Card key={st.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img src={avatar.src} alt="" className="size-14 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-semibold">{st.nickname}</p>
                <p className="text-sm text-muted">
                  Dự án: {st.latestProject}
                  {st.skillsNeedHelp.length
                    ? ` · Cần hỗ trợ: ${st.skillsNeedHelp.join(', ')}`
                    : ''}
                </p>
                <ProgressBar className="mt-2" value={st.progress} />
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold',
                  st.status === 'needs_support' && 'bg-coral-100 text-danger',
                  st.status === 'on_track' && 'bg-sky-100 text-brand-600',
                  st.status === 'ahead' && 'bg-mint-100 text-success',
                )}
              >
                {st.status === 'needs_support'
                  ? 'Cần hỗ trợ'
                  : st.status === 'ahead'
                    ? 'Đi trước'
                    : 'Đúng tiến độ'}
              </span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function TeacherProjectsPage() {
  const students = useDemoStore((s) => s.students)
  const project = useDemoStore((s) => s.currentProject)
  const addToast = useDemoStore((s) => s.addToast)
  const [reviews, setReviews] = useState<Record<string, string>>({})

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Dự án lớp</h1>
        <p className="text-muted">Review bằng sticker và câu mẫu — không điểm công khai.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {students.map((st) => (
          <Card key={st.id}>
            <div className="flex gap-3">
              <img
                src={project.cover}
                alt=""
                className="size-20 rounded-2xl object-cover"
              />
              <div>
                <p className="font-display text-lg font-semibold">{st.latestProject}</p>
                <p className="text-sm text-muted">Học sinh: {st.nickname}</p>
                <p className="mt-1 text-xs font-bold text-brand-600">Có AI hỗ trợ</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {stickers.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={cn(
                    'min-h-11 cursor-pointer rounded-full border px-3 text-sm font-bold',
                    reviews[st.id] === s
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-border bg-white',
                  )}
                  onClick={() => {
                    setReviews((r) => ({ ...r, [st.id]: s }))
                    addToast({
                      type: 'success',
                      title: `Đã gửi sticker cho ${st.nickname}`,
                      description: s,
                    })
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {reviews[st.id] ? (
              <p className="mt-3 text-sm font-semibold text-success">
                Đã review: {reviews[st.id]}
              </p>
            ) : null}
            <Button
              className="mt-3"
              size="sm"
              variant="secondary"
              onClick={() =>
                addToast({
                  type: 'info',
                  title: 'Câu mẫu',
                  description: 'Con kể chuyện rất rõ. Hãy thêm một chi tiết kết thúc nhé!',
                })
              }
            >
              Gửi câu mẫu
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
