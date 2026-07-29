import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import type { Audience } from '../community-store'

export type AccountWorkspace = {
  ipId: string
  name: string
  type: string
  role: string
  isDefault: boolean
}

type WorkspaceGrant = {
  audience: Audience
  permission: 'view' | 'remix'
  status: 'pending' | 'approved' | 'declined'
}

const audiences: Array<{ id: Audience; label: string }> = [
  { id: 'friends', label: '🧑‍🤝‍🧑 Bạn bè' },
  { id: 'family', label: '🏡 Gia đình' },
  { id: 'school', label: '🏫 Trường học' },
]

export function WorkspaceSharingPanel({
  workspaces,
}: {
  workspaces: AccountWorkspace[]
}) {
  const [grants, setGrants] = useState<Record<string, WorkspaceGrant[]>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const safeWorkspaces = workspaces.filter((workspace) =>
    !/video|film|movie/i.test(workspace.type),
  )

  useEffect(() => {
    void Promise.allSettled(
      safeWorkspaces.map(async (workspace) => {
        const rows = await api<WorkspaceGrant[]>(
          `/api/account/workspaces/${workspace.ipId}/grants`,
        )
        setGrants((current) => ({ ...current, [workspace.ipId]: rows }))
      }),
    )
  }, [workspaces])

  const toggle = async (workspaceId: string, audience: Audience) => {
    const current = grants[workspaceId] ?? []
    const exists = current.some(
      (grant) => grant.audience === audience && grant.status !== 'declined',
    )
    const next = exists
      ? current.filter((grant) => grant.audience !== audience)
      : [...current, { audience, permission: 'view' as const, status: 'pending' as const }]
    setGrants((all) => ({ ...all, [workspaceId]: next }))
    setBusy(`${workspaceId}:${audience}`)
    setMessage('')
    try {
      const saved = await api<WorkspaceGrant[]>(
        `/api/account/workspaces/${workspaceId}/grants`,
        {
          method: 'PUT',
          body: JSON.stringify({
            grants: next.map(({ audience: itemAudience, permission }) => ({
              audience: itemAudience,
              permission,
            })),
          }),
        },
      )
      setGrants((all) => ({ ...all, [workspaceId]: saved }))
      setMessage('Đã gửi thay đổi để phụ huynh duyệt.')
    } catch (error) {
      setGrants((all) => ({ ...all, [workspaceId]: current }))
      setMessage(error instanceof Error ? error.message : 'Không cập nhật được quyền chia sẻ.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <details className="ui-card p-5">
      <summary className="cursor-pointer list-none font-display text-xl">🗂️ Chia sẻ workspace</summary>
      <p className="mt-2 text-xs text-muted">Chọn từng nhóm được vào xem workspace. Video Storybook luôn bị loại trừ.</p>
      {safeWorkspaces.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-brand-50 p-3 text-sm text-muted">Chưa có workspace phù hợp để chia sẻ.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {safeWorkspaces.slice(0, 4).map((workspace) => {
            const active = grants[workspace.ipId] ?? []
            return (
              <article key={workspace.ipId} className="rounded-2xl border border-border p-3">
                <p className="font-extrabold">{workspace.name}</p>
                <p className="text-xs text-muted">{workspace.type}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {audiences.map((audience) => {
                    const grant = active.find((item) => item.audience === audience.id)
                    return (
                      <button
                        key={audience.id}
                        type="button"
                        disabled={busy === `${workspace.ipId}:${audience.id}`}
                        onClick={() => void toggle(workspace.ipId, audience.id)}
                        className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                          grant ? 'bg-mint-100 text-success' : 'bg-slate-100 text-muted'
                        } disabled:opacity-50`}
                      >
                        {grant ? `${grant.status === 'approved' ? '✓' : '⏳'} ` : ''}
                        {audience.label}
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      )}
      {message && <p className="mt-3 text-xs font-bold text-brand-700">{message}</p>}
    </details>
  )
}
