import { GALLERY_WORKS } from '../storybook-data'
import { ReactionBar } from './ReactionBar'

export function GalleryWall() {
  return (
    <section className="space-y-4" aria-labelledby="gallery-title">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-pink-600">
          Triển lãm tuần này
        </p>
        <h2 id="gallery-title" className="font-display text-2xl">
          Những thế giới khiến Paco mỉm cười
        </h2>
        <p className="text-sm text-muted">
          Chỉ 3 tác phẩm tuyển chọn — không cuộn vô tận, không dislike.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {GALLERY_WORKS.map((work) => (
          <article key={work.id} className="ui-card overflow-hidden">
            <div
              className="flex aspect-[4/3] items-center justify-center text-7xl"
              style={{ background: work.tone }}
              aria-hidden="true"
            >
              {work.emoji}
            </div>
            <div className="space-y-2 p-4">
              <div>
                <h3 className="font-display text-lg">{work.title}</h3>
                <p className="text-xs font-semibold text-muted">{work.author}</p>
              </div>
              <ReactionBar workId={work.id} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
