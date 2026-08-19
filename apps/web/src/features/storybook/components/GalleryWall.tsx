import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'
import type { SocialActivity } from '@/features/community/components/ActivityFeed'
import { ReactionBar } from './ReactionBar'

export function GalleryWall() {
  const [works, setWorks] = useState<SocialActivity[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    void api<{ gallery: SocialActivity[] }>('/api/gamification/social/discover')
      .then((result) => setWorks(result.gallery))
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Chưa mở được triển lãm.'))
  }, [])

  return (
    <section className="space-y-5" aria-labelledby="gallery-title">
      <header className="storybook-section-intro" data-tone="gallery">
        <span className="storybook-section-symbol" aria-hidden="true">🎨</span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--section-accent)]">Ngắm · Học hỏi · Lấy cảm hứng</p>
          <h2 id="gallery-title" className="mt-1 font-display text-3xl text-text">Phòng triển lãm tuần này</h2>
          <p className="mt-2 max-w-2xl text-base font-semibold leading-relaxed text-muted">Mỗi tác phẩm là một cách nghĩ khác nhau. Con hãy khám phá, tìm điều mình thích và gửi một lời động viên.</p>
          <p className="mt-3 inline-flex rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-[var(--section-accent)]">🛡️ Chỉ hiển thị tác phẩm đã được phụ huynh duyệt</p>
        </div>
      </header>
      {works.length === 0 && (
        <div className="storybook-empty-state ui-card" role="status">
          <span aria-hidden="true">🖼️</span>
          <h3 className="font-display text-xl text-text">Phòng tranh đang chờ tác phẩm mới</h3>
          <p>{message || 'Tuần này chưa có tác phẩm nào được phụ huynh duyệt để chia sẻ. Con có thể quay lại sau nhé!'}</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {works.map((work) => (
          <article key={work.id} className="ui-card overflow-hidden">
            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-sky-100 to-violet-100 text-7xl">
              {work.icon || '🎨'}
            </div>
            <div className="space-y-2 p-4">
              <div>
                <h3 className="font-display text-lg">{work.title}</h3>
                <p className="text-xs font-semibold text-muted">{work.actor.name} · Cấp {work.actor.level}</p>
                {work.summary && <p className="mt-1 line-clamp-2 text-xs text-muted">{work.summary}</p>}
              </div>
              <ReactionBar activityId={work.id} initialMine={work.mine as never} initialCounts={work.counts} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
