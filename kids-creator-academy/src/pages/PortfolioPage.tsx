import { useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, Lock, Share2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useDemoStore } from '@/store/demo-store'

export function PortfolioPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const project = useDemoStore((s) => s.currentProject)
  const child = useDemoStore((s) => s.child)
  const comic = useDemoStore((s) => s.comicPages[0])
  const videoRendered = useDemoStore((s) => s.videoRendered)
  const scenes = useDemoStore((s) => s.videoScenes)
  const requestShare = useDemoStore((s) => s.requestShare)
  const addToast = useDemoStore((s) => s.addToast)
  const subtitlesOn = useDemoStore((s) => s.subtitlesOn)
  const setRole = useDemoStore((s) => s.setRole)

  const title = projectId === 'star-cat' || !projectId ? project.title : project.title

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
            <Sparkles className="size-3.5" aria-hidden />
            Có AI hỗ trợ
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{title}</h1>
          <p className="text-muted">
            Tác giả: {child.nickname} · Trạng thái:{' '}
            {project.shareStatus === 'private' ? 'Riêng tư' : project.shareStatus}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex min-h-11 items-center gap-1 rounded-full bg-white px-3 text-sm font-bold shadow-soft">
            <Lock className="size-4 text-brand-500" aria-hidden />
            {project.approvalStatus === 'approved'
              ? 'Phụ huynh đã duyệt'
              : project.approvalStatus === 'pending'
                ? 'Chờ duyệt'
                : 'Chưa gửi duyệt'}
          </span>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <img src={project.cover} alt={`Bìa ${title}`} className="max-h-72 w-full object-cover" />
      </Card>

      <section aria-labelledby="comic-heading">
        <h2 id="comic-heading" className="mb-3 font-display text-2xl font-semibold">
          Truyện tranh
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {comic.panels.map((panel) => {
            const els = comic.elements
              .filter((e) => e.panelId === panel.id)
              .sort((a, b) => a.zIndex - b.zIndex)
            return (
              <div
                key={panel.id}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-sky-50"
              >
                <span className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 text-xs font-bold">
                  {panel.label}
                </span>
                {els.length === 0 ? (
                  <img
                    src={project.cover}
                    alt=""
                    className="size-full object-cover opacity-80"
                  />
                ) : (
                  els.map((el) => (
                    <div
                      key={el.id}
                      className="absolute"
                      style={{
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        zIndex: el.zIndex,
                      }}
                    >
                      {el.type === 'image' ? (
                        <img src={el.content} alt="" className="size-full rounded-lg object-cover" />
                      ) : el.type === 'bubble' ? (
                        <div className="flex size-full items-center justify-center rounded-xl border bg-white p-1 text-center text-[10px] font-bold">
                          {el.content}
                        </div>
                      ) : (
                        <span className="text-2xl">{el.content}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="video-heading">
        <h2 id="video-heading" className="mb-3 font-display text-2xl font-semibold">
          Video kể chuyện
        </h2>
        <Card>
          {videoRendered ? (
            <div>
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-brand-600">
                <img
                  src={scenes[0]?.thumbnail || project.cover}
                  alt="Preview video"
                  className="size-full object-cover"
                />
                {subtitlesOn ? (
                  <p className="absolute inset-x-4 bottom-4 rounded-xl bg-black/70 px-3 py-2 text-center text-sm text-white">
                    {scenes[0]?.narration}
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-muted">
                Preview mô phỏng · Transcript: {scenes.map((s) => s.narration).join(' ')}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted">Chưa có video. Hãy hoàn thành Rạp phim mini.</p>
              <Button className="mt-3" onClick={() => navigate('/studio/video')}>
                Mở Rạp phim mini
              </Button>
            </div>
          )}
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold">Kỹ năng đã luyện</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.skillsLearned.map((s) => (
              <li
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-3 py-1.5 text-sm font-bold text-success"
              >
                <BadgeCheck className="size-4" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-xl font-semibold">Suy ngẫm</h2>
          <p className="mt-2 text-muted">{project.reflection}</p>
        </Card>
      </div>

      <Card className="bg-brand-50">
        <h2 className="font-display text-xl font-semibold">Gửi duyệt chia sẻ</h2>
        <p className="mt-1 text-sm text-muted">
          Không có chia sẻ công khai trên web. Chỉ Gia đình hoặc Lớp học riêng tư.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              requestShare('family')
              addToast({
                type: 'success',
                title: 'Đã gửi phụ huynh duyệt',
                description: 'Phạm vi: Chỉ gia đình',
              })
            }}
          >
            <Share2 className="size-4" aria-hidden />
            Gửi gia đình
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              requestShare('class')
              addToast({
                type: 'success',
                title: 'Đã gửi duyệt lớp học riêng tư',
              })
            }}
          >
            Gửi lớp học riêng tư
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setRole('parent')
              navigate('/parent/approvals')
            }}
          >
            Xem phía phụ huynh (demo)
          </Button>
        </div>
      </Card>
    </div>
  )
}
