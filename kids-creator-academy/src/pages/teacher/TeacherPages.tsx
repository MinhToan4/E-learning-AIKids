import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { AVATARS } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'
import { cn } from '@/lib/cn'

const stickers = ['🌟 Tuyệt vời', '🧠 Tư duy tốt', '🛡️ An toàn', '🎨 Sáng tạo']

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 border-b border-slate-200 pb-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>
    </div>
  )
}

function Metric({ title, value, tone }: { title: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className={cn('mt-2 text-3xl font-semibold tabular-nums text-slate-900', tone)}>
        {value}
      </p>
    </div>
  )
}

export function TeacherOverviewPage() {
  const students = useDemoStore((s) => s.students)
  const avg =
    Math.round(students.reduce((s, st) => s + st.progress, 0) / students.length) || 0
  const needHelp = students.filter((s) => s.status === 'needs_support').length

  return (
    <div className="space-y-6">
      <PageTitle
        title="Tổng quan lớp"
        subtitle="Hành trình Mèo Sao · Không bảng xếp hạng công khai gây xấu hổ"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Học sinh" value={String(students.length)} />
        <Metric title="Tiến độ TB" value={`${avg}%`} />
        <Metric title="Cần hỗ trợ" value={String(needHelp)} tone="text-amber-700" />
        <Metric title="Dự án gần đây" value={String(students.length)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Ma trận kỹ năng (tần suất luyện)
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-2.5 pr-3 font-semibold">Học sinh</th>
                <th className="py-2.5 pr-3 font-semibold">Prompt</th>
                <th className="py-2.5 pr-3 font-semibold">So sánh</th>
                <th className="py-2.5 pr-3 font-semibold">Kể chuyện</th>
                <th className="py-2.5 font-semibold">An toàn</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id} className="border-b border-slate-100">
                  <td className="py-3 pr-3 font-medium text-slate-800">{st.nickname}</td>
                  {['#6366F1', '#0EA5E9', '#10B981', '#F59E0B'].map((c, i) => (
                    <td key={c} className="py-3 pr-3">
                      <span
                        className="inline-block size-8 rounded-md"
                        style={{
                          background: c,
                          opacity: 0.3 + ((st.progress + i * 7) % 55) / 100,
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
        <p className="mt-3 text-xs text-slate-400">
          Màu = tần suất luyện tập · Không dùng để xếp hạng học sinh trước lớp.
        </p>
      </div>
    </div>
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
      <PageTitle
        title="Học sinh"
        subtitle="Dùng biệt danh — không họ tên thật trong prototype."
      />
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
              'min-h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold',
              filter === id
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {list.map((st) => {
            const avatar = AVATARS.find((a) => a.id === st.avatarId) ?? AVATARS[0]
            return (
              <li
                key={st.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
              >
                <img src={avatar.src} alt="" className="size-12 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{st.nickname}</p>
                  <p className="text-sm text-slate-500">
                    {st.latestProject}
                    {st.skillsNeedHelp.length
                      ? ` · Hỗ trợ: ${st.skillsNeedHelp.join(', ')}`
                      : ''}
                  </p>
                  <ProgressBar className="mt-2 max-w-md" value={st.progress} />
                </div>
                <span
                  className={cn(
                    'w-fit rounded-full px-2.5 py-1 text-xs font-semibold',
                    st.status === 'needs_support' && 'bg-amber-100 text-amber-800',
                    st.status === 'on_track' && 'bg-sky-100 text-sky-800',
                    st.status === 'ahead' && 'bg-emerald-100 text-emerald-800',
                  )}
                >
                  {st.status === 'needs_support'
                    ? 'Cần hỗ trợ'
                    : st.status === 'ahead'
                      ? 'Đi trước'
                      : 'Đúng tiến độ'}
                </span>
              </li>
            )
          })}
        </ul>
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
      <PageTitle
        title="Dự án lớp"
        subtitle="Review bằng sticker và câu mẫu — không điểm công khai."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {students.map((st) => (
          <article
            key={st.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3">
              <img
                src={project.cover}
                alt=""
                className="size-16 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{st.latestProject}</p>
                <p className="text-sm text-slate-500">{st.nickname}</p>
                <p className="mt-0.5 text-xs font-semibold text-indigo-600">Có AI hỗ trợ</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stickers.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={cn(
                    'min-h-9 cursor-pointer rounded-lg border px-2.5 text-xs font-semibold',
                    reviews[st.id] === s
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300',
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
              <p className="mt-2 text-xs font-medium text-emerald-700">
                Đã review: {reviews[st.id]}
              </p>
            ) : null}
            <Button
              className="mt-auto pt-3"
              size="sm"
              variant="secondary"
              onClick={() =>
                addToast({
                  type: 'info',
                  title: 'Câu mẫu',
                  description:
                    'Con kể chuyện rất rõ. Hãy thêm một chi tiết kết thúc nhé!',
                })
              }
            >
              Gửi câu mẫu
            </Button>
          </article>
        ))}
      </div>
    </div>
  )
}
