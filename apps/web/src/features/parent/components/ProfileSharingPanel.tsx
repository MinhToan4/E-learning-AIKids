import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, ExternalLink, Link2, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { api } from '@/shared/lib/api'

type ChildSummary = {
  id: string
  nickname: string | null
  avatarId: string | null
}

type ProfileShare = {
  id: string
  childId: string
  url: string
  expiresAt: string | null
  status: 'active' | 'expired' | 'revoked'
  approvedWorkCount: number
}

function safeShareUrl(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin)
    return url.origin === window.location.origin ? url.toString() : null
  } catch {
    return null
  }
}

function expiryLabel(value: string | null): string {
  if (!value) return 'Không đặt ngày hết hạn'
  return `Hết hạn ${new Intl.DateTimeFormat('vi-VN').format(new Date(value))}`
}

export function ProfileSharingPanel() {
  const [children, setChildren] = useState<ChildSummary[]>([])
  const [shares, setShares] = useState<ProfileShare[]>([])
  const [loading, setLoading] = useState(true)
  const [busyChildId, setBusyChildId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [childResult, shareResult] = await Promise.all([
        api<{ children: ChildSummary[] }>('/api/parent/children'),
        api<{ shares: ProfileShare[] }>('/api/parent/profile-shares'),
      ])
      setChildren(childResult.children ?? [])
      setShares(shareResult.shares ?? [])
    } catch {
      setError('Chưa tải được phần chia sẻ hồ sơ. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const activeShares = useMemo(() => new Map(
    shares
      .filter((share) => share.status === 'active')
      .map((share) => [share.childId, share]),
  ), [shares])

  async function createShare(childId: string) {
    setBusyChildId(childId)
    setNotice(null)
    try {
      const result = await api<{ share: ProfileShare }>('/api/parent/profile-shares', {
        method: 'POST',
        body: JSON.stringify({
          childId,
          expiresInDays: 30,
          modules: ['works', 'achievements'],
        }),
      })
      setShares((current) => [
        ...current.filter((share) => share.childId !== childId),
        result.share,
      ])
      setNotice('Đã tạo link an toàn trong 30 ngày.')
    } catch {
      setNotice('Chưa tạo được link. Vui lòng thử lại.')
    } finally {
      setBusyChildId(null)
    }
  }

  async function revokeShare(share: ProfileShare) {
    setBusyChildId(share.childId)
    setNotice(null)
    try {
      await api(`/api/parent/profile-shares/${encodeURIComponent(share.id)}`, {
        method: 'DELETE',
      })
      setShares((current) => current.filter((item) => item.id !== share.id))
      setNotice('Link đã ngừng hoạt động.')
    } catch {
      setNotice('Chưa ngừng được link. Vui lòng thử lại.')
    } finally {
      setBusyChildId(null)
    }
  }

  async function copyShare(share: ProfileShare) {
    const url = safeShareUrl(share.url)
    if (!url) {
      setNotice('Link chia sẻ không hợp lệ.')
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Đã sao chép link chia sẻ.')
    } catch {
      setNotice('Không sao chép được. Vui lòng mở link rồi sao chép từ trình duyệt.')
    }
  }

  async function shareProfile(child: ChildSummary, share: ProfileShare) {
    const url = safeShareUrl(share.url)
    if (!url) {
      setNotice('Link chia sẻ không hợp lệ.')
      return
    }
    if (!navigator.share) {
      await copyShare(share)
      return
    }
    try {
      await navigator.share({
        title: `Góc sáng tạo của ${child.nickname ?? 'con'}`,
        text: 'Mời bạn xem những tác phẩm đã được gia đình chọn chia sẻ trên AIKid.',
        url,
      })
    } catch {
      // Người dùng đóng bảng chia sẻ không phải là lỗi cần cảnh báo.
    }
  }

  return (
    <section className="ui-card p-5 sm:p-6" aria-labelledby="profile-sharing-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-coral-700">Dành cho Ba / Mẹ</p>
          <h2 id="profile-sharing-title" className="font-display text-2xl">Trang chia sẻ của con</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Link chỉ hiển thị biệt danh, avatar, huy hiệu và tác phẩm đã được duyệt. Người xem không cần tài khoản AIKid.
          </p>
        </div>
        <span className="inline-flex min-h-11 items-center gap-2 self-start rounded-2xl bg-mint-100 px-4 text-sm font-extrabold text-success">
          <ShieldCheck size={20} aria-hidden="true" /> Riêng tư mặc định
        </span>
      </div>

      {notice && <p role="status" className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">{notice}</p>}
      {error && <ErrorState inline message={error} onRetry={() => void load()} className="mt-4" />}

      {loading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[0, 1].map((item) => <div key={item} className="h-36 animate-pulse rounded-3xl bg-brand-50" />)}
        </div>
      ) : children.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-brand-50 p-4 text-sm font-bold text-muted">
          Chưa có hồ sơ trẻ trong gia đình.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {children.map((child) => {
            const share = activeShares.get(child.id)
            const url = share ? safeShareUrl(share.url) : null
            const busy = busyChildId === child.id
            return (
              <article key={child.id} className="rounded-3xl border border-border bg-white p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100">
                    {child.avatarId
                      ? <img src={child.avatarId} alt="" className="h-full w-full object-cover" />
                      : <Link2 size={26} className="text-brand-600" aria-hidden="true" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-xl">{child.nickname ?? 'Hồ sơ của con'}</h3>
                    <p className="text-sm text-muted">
                      {share ? `${share.approvedWorkCount} tác phẩm · ${expiryLabel(share.expiresAt)}` : 'Chưa có link dành cho khách'}
                    </p>
                  </div>
                </div>

                {share && url ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" onClick={() => void shareProfile(child, share)} disabled={busy}>
                      <ExternalLink size={18} aria-hidden="true" /> Chia sẻ
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => void copyShare(share)} disabled={busy}>
                      <Copy size={18} aria-hidden="true" /> Sao chép
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => void revokeShare(share)} disabled={busy}>
                      <Trash2 size={18} aria-hidden="true" /> Ngừng chia sẻ
                    </Button>
                  </div>
                ) : (
                  <Button type="button" className="mt-4" onClick={() => void createShare(child.id)} disabled={busy}>
                    <Link2 size={18} aria-hidden="true" /> {busy ? 'Đang tạo…' : 'Tạo link 30 ngày'}
                  </Button>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
