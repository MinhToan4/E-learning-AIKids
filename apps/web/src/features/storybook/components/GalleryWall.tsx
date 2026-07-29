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
    <section className="space-y-4" aria-labelledby="gallery-title">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-pink-600">Triển lãm tuần này</p>
        <h2 id="gallery-title" className="font-display text-2xl">Những thế giới khiến Paco mỉm cười</h2>
        <p className="text-sm text-muted">Chỉ tác phẩm đã được phụ huynh duyệt — không cuộn vô tận, không dislike.</p>
      </div>
      {works.length === 0 && (
        <p className="ui-card p-8 text-center text-muted">{message || 'Tuần này chưa có tác phẩm nào được duyệt chia sẻ.'}</p>
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
