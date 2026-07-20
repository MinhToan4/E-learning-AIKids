import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'

type Asset = {
  id: string
  type: string
  name: string
  thumbnail: string
  private: boolean
  createdAt: string
}

type Project = {
  id: string
  title: string
  kind: string
  thumbnail: string
  shareStatus: string
}

export function BackpackPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    const [a, p] = await Promise.all([
      api<{ assets: Asset[] }>('/api/backpack'),
      api<{ projects: Project[] }>('/api/projects'),
    ])
    setAssets(a.assets)
    setProjects(p.projects)
  }

  useEffect(() => {
    void load().catch(() => setMsg('Chưa tải được ba lô'))
  }, [])

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl">Ba lô sáng tạo</h1>
        <p className="text-muted">Đồ con kiếm được — mặc định chỉ con xem.</p>
      </div>
      {msg && (
        <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm text-success">{msg}</p>
      )}

      <section>
        <h2 className="font-display mb-3 text-2xl">Vật phẩm</h2>
        {assets.length === 0 ? (
          <p className="text-muted">Chưa có vật phẩm — hoàn thành trạm để nhận thưởng!</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {assets.map((a) => (
              <div key={a.id} className="ui-card overflow-hidden p-2">
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                  {a.thumbnail.startsWith('data:') || a.thumbnail.startsWith('/') ? (
                    <img src={a.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl">🎒</span>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-extrabold">{a.name}</p>
                <p className="text-xs text-muted">{a.type}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display mb-3 text-2xl">Tác phẩm</h2>
        {projects.length === 0 ? (
          <p className="text-muted">Làm truyện ở trạm Comic để có tác phẩm nhé!</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <div key={p.id} className="ui-card flex gap-3 p-3">
                <img
                  src={p.thumbnail}
                  alt=""
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{p.title}</p>
                  <p className="text-xs text-muted">
                    {p.kind} · {p.shareStatus === 'private' ? 'Riêng tư' : p.shareStatus === 'pending' ? 'Chờ duyệt' : 'Đã chia sẻ'}
                  </p>
                  {p.shareStatus === 'private' && (
                    <Button
                      className="mt-2 min-h-10 px-3 text-sm"
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
    </div>
  )
}
