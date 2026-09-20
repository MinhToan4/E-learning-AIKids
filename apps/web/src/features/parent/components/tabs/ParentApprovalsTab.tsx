import { useCallback, useEffect, useState } from 'react'
import { BookOpen, Check, Lock, Palette, PartyPopper, Sparkles, Video } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { ProfileSharingPanel } from '@/features/parent/components/ProfileSharingPanel'
import { LoadingSkeleton } from '@/features/parent/components/ParentStatCard'
import type { Approval } from '@/features/parent/types/parent.types'

export function ParentApprovalsTab() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [friendInvites, setFriendInvites] = useState<
    Array<{
      id: string
      sender: { name: string; avatarUrl?: string | null }
      recipient: { name: string; avatarUrl?: string | null }
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    try {
      const [sharing, friends] = await Promise.allSettled([
        api<{ approvals: Approval[] }>('/api/parent/approvals?status=pending'),
        api<{ invites: typeof friendInvites }>('/api/gamification/social/invites/pending-review'),
      ])
      if (sharing.status === 'fulfilled') setApprovals(sharing.value.approvals)
      if (friends.status === 'fulfilled') setFriendInvites(friends.value.invites)
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function decide(id: string, decision: 'approved' | 'rejected') {
    try {
      await api(`/api/parent/approvals/${id}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision }),
      })
      showToast(
        decision === 'approved' ? 'Đã cho phép chia sẻ' : 'Đã giữ riêng tư',
        decision === 'approved' ? 'success' : 'info',
      )
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi', 'error')
    }
  }

  async function decideFriend(id: string, approved: boolean) {
    try {
      await api(`/api/gamification/social/invites/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ approved }),
      })
      showToast(approved ? 'Đã duyệt lời mời kết bạn' : 'Đã từ chối lời mời', approved ? 'success' : 'info')
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi', 'error')
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/60 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-black text-brand-700">
              <Sparkles size={12} /> 👨👩👧 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Phê duyệt an toàn
            </span>
          </div>
        </div>
        <h1 className="font-display text-2xl font-black text-slate-900 mt-3 sm:text-3xl">
          Yêu cầu chia sẻ & Kết nối bạn bè
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          Xem và duyệt các yêu cầu kết bạn, chia sẻ sản phẩm sáng tạo từ các con nhằm bảo đảm môi trường học tập an toàn.
        </p>
      </header>

      <ProfileSharingPanel />

      {approvals.length === 0 && friendInvites.length === 0 && (
        <div className="ui-card p-8 text-center">
          <PartyPopper className="mx-auto text-brand-500" size={40} aria-hidden="true" />
          <p className="mt-2 font-bold">Không có yêu cầu nào</p>
        </div>
      )}

      {friendInvites.map((invite) => (
        <div key={invite.id} className="ui-card flex flex-wrap items-center gap-4 p-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-violet-50 text-3xl">🧑‍🤝‍🧑</span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Lời mời kết bạn</p>
            <p className="text-sm text-muted">
              <strong>{invite.sender.name}</strong> và <strong>{invite.recipient.name}</strong> muốn vào vòng tròn an toàn của nhau.
            </p>
            <p className="text-xs text-muted">Chỉ kích hoạt sau khi phụ huynh hai bên cùng đồng ý.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void decideFriend(invite.id, true)}>
              <Check size={17} /> Đồng ý
            </Button>
            <Button variant="secondary" onClick={() => void decideFriend(invite.id, false)}>
              <Lock size={17} /> Từ chối
            </Button>
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3">
        {approvals.map((a) => (
          <div
            key={a.id}
            className="ui-card flex flex-wrap items-center gap-4 p-4 transition hover:shadow-lg"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              {a.project.kind === 'comic' ? (
                <BookOpen size={30} aria-hidden="true" />
              ) : a.project.kind === 'video' ? (
                <Video size={30} aria-hidden="true" />
              ) : (
                <Palette size={30} aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{a.project.title}</p>
              <p className="text-sm text-muted">
                <span className="font-bold">{a.child.nickname}</span> muốn chia sẻ tới{' '}
                <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-bold text-sky-700">
                  {a.destination === 'family' ? 'Gia đình' : a.destination === 'class' ? 'Lớp học' : 'Công khai'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void decide(a.id, 'approved')}>
                <Check size={17} aria-hidden="true" />
                Cho phép
              </Button>
              <Button variant="secondary" onClick={() => void decide(a.id, 'rejected')}>
                <Lock size={17} aria-hidden="true" />
                Giữ riêng
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ParentApprovalsTab as ApprovalsTab }
