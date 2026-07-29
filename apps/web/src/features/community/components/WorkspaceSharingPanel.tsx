import { useState } from 'react'
import type { ShowcaseProject } from '@/features/profile/profile-showcase'
import type { Audience } from '../community-store'
import {
  readWorkspaceShares,
  saveWorkspaceShares,
  type WorkspaceShare,
} from '../workspace-sharing'

const audiences: Array<{ id: Audience; label: string }> = [
  { id: 'friends', label: '🧑‍🤝‍🧑 Bạn bè' },
  { id: 'family', label: '🏡 Gia đình' },
  { id: 'school', label: '🏫 Trường học' },
]

export function WorkspaceSharingPanel({
  childId,
  projects,
}: {
  childId: string
  projects: ShowcaseProject[]
}) {
  const [shares, setShares] = useState<WorkspaceShare[]>(() => readWorkspaceShares(childId))
  const safeProjects = projects.filter((project) => !/video|film|movie/i.test(project.kind))

  const toggle = (projectId: string, audience: Audience) => {
    const current = shares.find((share) => share.projectId === projectId) ??
      { projectId, audiences: [] }
    const nextAudience = current.audiences.includes(audience)
      ? current.audiences.filter((item) => item !== audience)
      : [...current.audiences, audience]
    const next = [
      ...shares.filter((share) => share.projectId !== projectId),
      { projectId, audiences: nextAudience },
    ]
    setShares(next)
    saveWorkspaceShares(childId, next)
  }

  return (
    <details className="ui-card p-5">
      <summary className="cursor-pointer list-none font-display text-xl">🗂️ Chia sẻ workspace</summary>
      <p className="mt-2 text-xs text-muted">Chọn từng nhóm được vào xem workspace. Video Storybook luôn bị loại trừ.</p>
      {safeProjects.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-brand-50 p-3 text-sm text-muted">Chưa có workspace phù hợp để chia sẻ.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {safeProjects.slice(0, 4).map((project) => {
            const active = shares.find((share) => share.projectId === project.id)?.audiences ?? []
            return (
              <article key={project.id} className="rounded-2xl border border-border p-3">
                <p className="font-extrabold">{project.title}</p>
                <p className="text-xs text-muted">{project.kind}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {audiences.map((audience) => (
                    <button
                      key={audience.id}
                      type="button"
                      onClick={() => toggle(project.id, audience.id)}
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                        active.includes(audience.id) ? 'bg-mint-100 text-success' : 'bg-slate-100 text-muted'
                      }`}
                    >
                      {active.includes(audience.id) ? '✓ ' : ''}{audience.label}
                    </button>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </details>
  )
}
