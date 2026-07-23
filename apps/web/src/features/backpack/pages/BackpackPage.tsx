import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { designerAssets } from '@/shared/config/assets'

type Asset = {
  id: string
  type: string
  name: string
  thumbnail: string
  private: boolean
  questId?: string | null
  createdAt: string
}

type Project = {
  id: string
  title: string
  kind: string
  thumbnail: string
  content?: string
  shareStatus: string
}

function isImgUrl(src: string) {
  return (
    src.startsWith('data:') ||
    src.startsWith('/') ||
    src.startsWith('http://') ||
    src.startsWith('https://')
  )
}

function MediaThumbnail({
  src,
  kind,
  className,
}: {
  src: string
  kind: string
  className: string
}) {
  const [failed, setFailed] = useState(false)
  if (!isImgUrl(src) || failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-brand-50 text-3xl`}>
        {kind === 'comic' ? '🖼️' : kind === 'story' ? '📖' : '🎨'}
      </div>
    )
  }
  return <img src={src} alt="" className={className} onError={() => setFailed(true)} />
}

export function BackpackPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [a, p] = await Promise.allSettled([
        api<{ assets: Asset[] }>('/api/backpack'),
        api<{ projects: Project[] }>('/api/projects'),
      ])
      setAssets(a.status === 'fulfilled' ? a.value.assets : [])
      setProjects(p.status === 'fulfilled' ? p.value.projects : [])
      if (a.status === 'rejected' && p.status === 'rejected') {
        setError('Ba lô đang được kết nối với kho media StoryMee.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function requestShare(projectId: string) {
    try {
      await api(`/api/projects/${projectId}/request-share`, {
        method: 'POST',
        body: JSON.stringify({ destination: 'family' }),
      })
      setMsg('Đã gửi ba/mẹ duyệt chia sẻ!')
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Lỗi')
    }
  }

  if (loading) {
    return <PageSkeleton rows={4} />
  }

  return (
    <PageMotion className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl">Ba lô sáng tạo</h1>
        <p className="text-muted">
          Ba lô lưu những sản phẩm con đã tạo trong bài học — mặc định chỉ con xem.
          tùy ý từ máy.
        </p>
      </div>
      {msg && (
        <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm text-success">{msg}</p>
      )}
      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      <section>
        <h2 className="font-display mb-3 text-2xl">Vật phẩm từ bài học</h2>
        {assets.length === 0 ? (
          <EmptyState
            compact
            title="Ba lô còn trống"
            description="Hoàn thành trạm vẽ, gen ảnh hoặc truyện tranh để nhận vật phẩm nhé!"
            imageSrc={designerAssets.lobby.cardArt}
            action={
              <Link to="/world">
                <Button variant="secondary">Đi học tiếp</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {assets.map((a) => (
              <div key={a.id} className="ui-card overflow-hidden p-2">
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                  <MediaThumbnail
                    src={a.thumbnail}
                    kind={a.type}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 truncate text-sm font-extrabold">{a.name}</p>
                <p className="text-xs text-muted">
                  {a.type}
                  {a.questId ? ' · từ bài học' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display mb-3 text-2xl">Tác phẩm</h2>
        {projects.length === 0 ? (
          <EmptyState
            compact
            title="Chưa có tác phẩm"
            description="Làm truyện ở trạm Comic để có tác phẩm trong ba lô!"
            imageSrc={designerAssets.workshop.comic}
            action={
              <Link to="/home">
                <Button variant="secondary">Chọn khóa học</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <div key={p.id} className="ui-card flex gap-3 p-3">
                <MediaThumbnail
                  src={p.thumbnail}
                  kind={p.kind}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{p.title}</p>
                  <p className="text-xs text-muted">
                    {p.kind} · {p.shareStatus}
                  </p>
                  {p.content && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{p.content}</p>
                  )}
                  {p.shareStatus === 'private' && (
                    <Button
                      className="mt-2 !min-h-9 !text-xs"
                      variant="secondary"
                      onClick={() => void requestShare(p.id)}
                    >
                      Xin ba/mẹ chia sẻ
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageMotion>
  )
}
