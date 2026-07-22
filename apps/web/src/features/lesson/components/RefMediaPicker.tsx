import { useCallback, useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
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

  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-100 bg-brand-50/40 p-3">
      <p className="text-sm font-extrabold text-brand-600">
        Sản phẩm đồng hành
      </p>
      <p className="mb-2 text-xs text-muted">
        Con có thể chọn tối đa {max} sản phẩm đã tạo trong các bài học để tiếp tục
        phát triển ý tưởng. Bước này không bắt buộc.
      </p>
      {selectedIds.length > 0 && (
        <button
          type="button"
          className="mb-2 min-h-11 rounded-xl px-3 text-xs font-bold text-brand-600 hover:bg-brand-50"
          onClick={() => onChange([])}
        >
          Bỏ chọn ({selectedIds.length})
        </button>
      )}
      {mine.length === 0 ? (
        <p className="text-xs text-muted">
          Chưa có sản phẩm phù hợp. Con hãy hoàn thành một nhiệm vụ vẽ hoặc sáng
          tạo trước, rồi quay lại đây nhé!
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
