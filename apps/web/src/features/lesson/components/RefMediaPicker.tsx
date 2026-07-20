import { useCallback, useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

type MineAsset = {
  id: string
  name: string
  url: string
  type: string
  questId?: string | null
}

/**
 * Only course-created assets (vẽ/gen trong bài) — no free photo upload.
 * Optional promote to Vidtory CDN for better i2v/startImages.
 */
export function RefMediaPicker({
  selectedIds,
  onChange,
  max = 4,
}: {
  questId?: string
  selectedIds: string[]
  onChange: (ids: string[]) => void
  max?: number
}) {
  const [mine, setMine] = useState<MineAsset[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await api<{ assets: MineAsset[] }>('/api/media/refs')
      setMine(data.assets)
    } catch {
      setMine([])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
      return
    }
    if (selectedIds.length >= max) return
    onChange([...selectedIds, id])
  }

  async function promoteSelected() {
    if (selectedIds.length === 0) return
    setBusy(true)
    setErr(null)
    setMsg(null)
    try {
      for (const assetId of selectedIds) {
        await api('/api/media/promote', {
          method: 'POST',
          body: JSON.stringify({ assetId, purpose: 'course_ref_promote' }),
        })
      }
      setMsg('Đã đẩy sản phẩm khóa học lên Vidtory (tag aikids_user_id).')
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không promote được')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-100 bg-brand-50/40 p-3">
      <p className="text-sm font-extrabold text-brand-600">
        Ảnh tham chiếu từ bài học (không upload ảnh ngoài)
      </p>
      <p className="mb-2 text-xs text-muted">
        Chỉ chọn sản phẩm con đã vẽ/gen trong khóa (quest). 0 ảnh = text · 1 = refImageUrl ·
        nhiều = startImages. Không cho ảnh tùy ý từ máy.
      </p>
      {err && (
        <p className="mb-2 text-xs font-bold text-danger" role="alert">
          {err}
        </p>
      )}
      {msg && (
        <p className="mb-2 text-xs font-bold text-success">{msg}</p>
      )}
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedIds.length > 0 && (
          <>
            <Button
              type="button"
              variant="secondary"
              className="!min-h-9 !px-3 !text-xs"
              disabled={busy}
              onClick={() => void promoteSelected()}
            >
              {busy ? 'Đang gửi…' : 'Gửi lên Vidtory để xử lý'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="!min-h-9 !px-3 !text-xs"
              onClick={() => onChange([])}
            >
              Bỏ chọn ({selectedIds.length})
            </Button>
          </>
        )}
      </div>
      {mine.length === 0 ? (
        <p className="text-xs text-muted">
          Chưa có sản phẩm trong khóa — hoàn thành trạm vẽ/gen trước, rồi quay lại chọn làm
          ref.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {mine.map((a) => {
            const on = selectedIds.includes(a.id)
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                className={cn(
                  'overflow-hidden rounded-xl border-2 bg-white transition',
                  on ? 'border-brand-500 shadow-clay' : 'border-border opacity-80',
                )}
                title={a.name}
              >
                <img
                  src={a.url}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
