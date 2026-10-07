import { ZoomIn } from 'lucide-react'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import {
  type LearnCardDraft,
  getStageBlocks,
} from '../../../lib/authoring'
import {
  LEARN_KIND_PRESENTATION,
} from '../lecture-drawer-constants'
import { cn } from '@/shared/lib/cn'
import type { PreviewViewportMode } from './types'

export interface AikiStagePreviewContentProps {
  card: LearnCardDraft
  stageIndex: number
  viewport: PreviewViewportMode
  isFs?: boolean
  onImageClick: (img: { url: string; title?: string }) => void
}

export function AikiStagePreviewContent({
  card,
  stageIndex,
  viewport,
  isFs = false,
  onImageClick,
}: AikiStagePreviewContentProps) {
  const isMobile = viewport === 'mobile'
  const presentation =
    LEARN_KIND_PRESENTATION[card.kind] ?? LEARN_KIND_PRESENTATION.example
  const KindIcon = presentation.icon
  const stageBlocks = getStageBlocks(card, stageIndex)

  return (
    <article
      className={cn(
        'rounded-2xl border-2 p-4 shadow-sm',
        presentation.tone,
        isFs ? 'w-full' : 'mt-3',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-white/80">
          <KindIcon size={20} aria-hidden="true" />
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
            {presentation.label}
          </span>
          {stageBlocks.map((b) => (
            <span
              key={b.id}
              className="rounded-full bg-brand-50 border border-brand-200 px-1.5 py-0.5 text-[9px] font-black text-brand-800"
            >
              {b.type === 'versus-ab'
                ? '🖼️ A/B'
                : b.type === 'images'
                ? '📷 Ảnh'
                : b.type === 'dialogue'
                ? '💬 Thoại'
                : b.type === 'compare'
                ? '⚖️ So sánh'
                : b.type === 'poster'
                ? '📜 Poster'
                : b.type === 'voice'
                ? '🐱 Mèo'
                : b.type === 'video'
                ? '🎬 Video'
                : b.type === 'layout-callout'
                ? '💡 Ghi nhớ'
                : b.type === 'layout-formula'
                ? '🔤 KaTeX'
                : b.type === 'layout-split'
                ? '📰 2 Cột'
                : b.type === 'layout-grid'
                ? '🍱 Lưới'
                : b.type === 'layout-storyboard'
                ? '🎬 Storyboard'
                : '📖 Chữ'}
            </span>
          ))}
        </div>
      </div>

      {stageBlocks.length === 0 ? (
        <p className="mt-3 text-center text-xs font-bold text-muted py-4">
          Chặng này chưa có khối nội dung nào.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {stageBlocks.map((block) => {
            if (block.type === 'text' || block.type === 'layout-text') {
              return (
                <div
                  key={block.id}
                  className="rounded-xl border border-current/15 bg-white/70 p-3"
                >
                  {block.title && (
                    <h3 className="font-display text-base leading-snug">
                      {block.title}
                    </h3>
                  )}
                  <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">
                    {block.body?.trim() || 'Nội dung đoạn văn bản sẽ hiển thị ở đây.'}
                  </p>
                  {block.tip && (
                    <p className="mt-2 rounded-xl border border-current/20 bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-900">
                      💡 Ghi nhớ: {block.tip}
                    </p>
                  )}
                </div>
              )
            }

            if (block.type === 'layout-callout') {
              return (
                <div
                  key={block.id}
                  className="rounded-xl border-2 border-amber-300 bg-amber-50/90 p-3 text-amber-950"
                >
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-1">
                    💡 {block.title || 'Hộp Ghi Nhớ Nổi Bật'}
                  </p>
                  <p className="text-xs font-bold leading-relaxed">
                    {block.tip || block.body || 'Bí kíp bỏ túi cho bé...'}
                  </p>
                </div>
              )
            }

            if (block.type === 'layout-formula') {
              return (
                <div
                  key={block.id}
                  className="rounded-xl border border-brand-200 bg-brand-50/70 p-3 text-center"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-800 mb-1">
                    {block.title || 'Công Thức KaTeX'}
                  </p>
                  <div className="font-mono text-xs font-black text-brand-950 py-1.5 px-2 bg-white rounded-lg border border-brand-200 shadow-2xs">
                    {block.formula ||
                      '$$\\text{Ý tưởng con} + \\text{Sức mạnh AI} = \\text{Tác phẩm độc nhất}$$'}
                  </div>
                </div>
              )
            }

            if (block.type === 'layout-split') {
              const isTwoText = block.columns === 2 && !block.imageUrl
              return (
                <div
                  key={block.id}
                  className={cn(
                    'rounded-xl border border-current/15 bg-white/70 p-2.5 items-center',
                    isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2',
                  )}
                >
                  <div>
                    {block.title && (
                      <h4 className="font-display text-xs font-bold text-text">
                        {block.title}
                      </h4>
                    )}
                    <p className="text-[11px] font-semibold text-text mt-0.5">
                      {block.body || 'Nội dung giải thích...'}
                    </p>
                  </div>
                  {isTwoText ? (
                    <div>
                      <p className="text-[11px] font-semibold text-text mt-0.5">
                        {block.tip || 'Nội dung cột phải...'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg aspect-video bg-slate-100 border border-slate-200 grid place-items-center">
                      {block.imageUrl ? (
                        <img
                          src={block.imageUrl}
                          alt={block.imageAlt || 'Media'}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-muted">
                          Ảnh / Media
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            }

            if (block.type === 'layout-grid') {
              const items =
                block.visualItems && block.visualItems.length > 0
                  ? block.visualItems
                  : card.visualItems
              return (
                <div
                  key={block.id}
                  className="rounded-xl border border-current/15 bg-white/70 p-2.5"
                >
                  {block.title && (
                    <h4 className="font-display text-xs font-black text-text mb-1.5">
                      {block.title}
                    </h4>
                  )}
                  <div
                    className={cn(
                      'grid gap-1.5',
                      isMobile ? 'grid-cols-1' : 'grid-cols-3',
                    )}
                  >
                    {items.map((item, vIdx) => (
                      <div
                        key={vIdx}
                        className="rounded-lg border border-brand-200 bg-brand-50/70 p-1.5 text-center"
                      >
                        <p className="text-[10px] font-black text-brand-900 truncate">
                          {item.label}
                        </p>
                        <p className="text-[9px] font-semibold text-brand-800 line-clamp-2 mt-0.5">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            if (block.type === 'layout-storyboard') {
              const items =
                block.visualItems && block.visualItems.length > 0
                  ? block.visualItems
                  : card.visualItems
              return (
                <div
                  key={block.id}
                  className="rounded-xl border border-current/15 bg-white/70 p-2.5"
                >
                  {block.title && (
                    <h4 className="font-display text-xs font-black text-text mb-1.5">
                      {block.title}
                    </h4>
                  )}
                  <div className="grid grid-cols-3 gap-1.5">
                    {items.map((item, sIdx) => (
                      <div
                        key={sIdx}
                        className="rounded-lg border border-brand-200 bg-white p-1.5 text-center"
                      >
                        <span className="inline-block rounded bg-brand-100 px-1 py-0.2 text-[8px] font-black text-brand-800">
                          Cảnh {sIdx + 1}
                        </span>
                        <p className="text-[9.5px] font-bold text-text truncate mt-0.5">
                          {item.label}
                        </p>
                        <p className="text-[8.5px] font-medium text-muted line-clamp-2">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            if (block.type === 'video') {
              return (
                <div
                  key={block.id}
                  className="space-y-1 rounded-xl border border-border/80 bg-white/80 p-2"
                >
                  <p className="text-[10px] font-black uppercase text-brand-800">
                    🎬 Video bài giảng:
                  </p>
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/5">
                    <LectureVideo title={card.title} url={card.videoUrl || ''} />
                  </div>
                </div>
              )
            }

            if (block.type === 'versus-ab') {
              return (
                <div
                  key={block.id}
                  className={cn(
                    'grid gap-2',
                    isMobile ? 'grid-cols-1' : 'grid-cols-2',
                  )}
                >
                  <div className="rounded-xl border border-rose-200 bg-white p-2 text-center">
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-800">
                      {card.optionLabels?.[0] || 'Tranh A: Zico'}
                    </span>
                    {card.optionDescs?.[0] && (
                      <p className="mt-0.5 text-[9px] text-muted line-clamp-1">
                        {card.optionDescs[0]}
                      </p>
                    )}
                    {card.optionImages?.[0] ? (
                      <img
                        src={card.optionImages[0]}
                        alt="Tranh A"
                        className="mt-1.5 aspect-video w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="mt-1.5 aspect-video rounded-lg bg-rose-50 grid place-items-center text-[10px] font-bold text-rose-700">
                        🎨 Minh họa mặc định
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-sky-200 bg-white p-2 text-center">
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-black text-sky-800">
                      {card.optionLabels?.[1] || 'Tranh B: Sonet'}
                    </span>
                    {card.optionDescs?.[1] && (
                      <p className="mt-0.5 text-[9px] text-muted line-clamp-1">
                        {card.optionDescs[1]}
                      </p>
                    )}
                    {card.optionImages?.[1] ? (
                      <img
                        src={card.optionImages[1]}
                        alt="Tranh B"
                        className="mt-1.5 aspect-video w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="mt-1.5 aspect-video rounded-lg bg-sky-50 grid place-items-center text-[10px] font-bold text-sky-700">
                        🎨 Minh họa mặc định
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            if (block.type === 'dialogue') {
              const lines = card.dialogueLines || []
              return (
                <div
                  key={block.id}
                  className="space-y-2 rounded-xl border border-border/80 bg-white/80 p-2.5"
                >
                  <p className="text-[10px] font-black uppercase text-brand-800">
                    💬 Kịch bản Comic ({lines.length} câu)
                  </p>
                  <div className="space-y-1.5">
                    {lines.map((line) => (
                      <div key={line.id} className="flex items-start gap-2 text-xs">
                        <span className="shrink-0 rounded-md bg-brand-100 px-1.5 py-0.5 font-black text-brand-800">
                          {line.speaker}
                        </span>
                        <p className="flex-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-text">
                          {line.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            if (block.type === 'compare') {
              return (
                <div
                  key={block.id}
                  className={cn(
                    'grid gap-2',
                    isMobile ? 'grid-cols-1' : 'grid-cols-2',
                  )}
                >
                  <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                    <span className="text-[10px] font-black text-slate-800">
                      📱 {card.compareData?.leftTitle || 'Trợ lý AI'}
                    </span>
                    {card.compareData?.leftText && (
                      <p className="mt-0.5 text-[9px] text-muted line-clamp-2">
                        {card.compareData.leftText}
                      </p>
                    )}
                    {card.compareData?.leftImage || card.compareImages?.left ? (
                      <img
                        src={
                          card.compareData?.leftImage || card.compareImages?.left
                        }
                        alt="Cột trái"
                        className="mt-1.5 aspect-video w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="mt-1.5 aspect-video rounded-lg bg-slate-100 grid place-items-center text-[10px] font-bold text-slate-600">
                        📁 Đồ họa sẵn sàng
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-brand-200 bg-white p-2 text-center">
                    <span className="text-[10px] font-black text-brand-800">
                      🧠 {card.compareData?.rightTitle || 'Não sáng tạo con'}
                    </span>
                    {card.compareData?.rightText && (
                      <p className="mt-0.5 text-[9px] text-brand-900 line-clamp-2">
                        {card.compareData.rightText}
                      </p>
                    )}
                    {card.compareData?.rightImage || card.compareImages?.right ? (
                      <img
                        src={
                          card.compareData?.rightImage ||
                          card.compareImages?.right
                        }
                        alt="Cột phải"
                        className="mt-1.5 aspect-video w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="mt-1.5 aspect-video rounded-lg bg-brand-50 grid place-items-center text-[10px] font-bold text-brand-700">
                        💡 Đồ họa sẵn sàng
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            if (block.type === 'poster') {
              return (
                <div
                  key={block.id}
                  className="rounded-xl border-2 border-yellow-300 bg-yellow-50/90 p-3 text-center"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-yellow-800">
                    📜 Poster Quy Tắc Vàng
                  </p>
                  <p className="mt-1 font-display text-sm font-black text-yellow-950 uppercase">
                    {card.body || 'HÃY LUÔN TỰ TAY THÊM Ý TƯỞNG CỦA RIÊNG MÌNH!'}
                  </p>
                  {card.tip && (
                    <p className="mt-1.5 text-xs font-bold text-yellow-900">
                      💡 {card.tip}
                    </p>
                  )}
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt="Poster"
                      className="mt-2 aspect-video w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                </div>
              )
            }

            if (block.type === 'images') {
              const heroImage = block.imageUrl || card.imageUrl
              const additionalImgs =
                block.additionalImages || card.additionalImages || []

              return (
                <div key={block.id} className="space-y-3">
                  {heroImage && (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-2 group/art">
                      <img
                        src={heroImage}
                        alt={
                          block.imageAlt ||
                          card.imageAlt ||
                          block.title ||
                          card.title ||
                          'Ảnh chính chặng'
                        }
                        className="w-full max-h-[280px] object-contain rounded-xl mx-auto transition-transform duration-300 group-hover/art:scale-101"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onImageClick({
                            url: heroImage,
                            title:
                              block.title ||
                              card.title ||
                              `Ảnh chính Chặng ${stageIndex + 1}`,
                          })
                        }
                        className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-xs transition hover:bg-black/90 cursor-pointer shadow-xs"
                        title="Phóng to xem ảnh"
                      >
                        <ZoomIn size={12} />
                        <span>🔍 Xem to</span>
                      </button>
                    </div>
                  )}

                  {additionalImgs.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase text-brand-800">
                        📷 Ảnh minh họa bổ sung ({additionalImgs.length}):
                      </p>
                      <div
                        className={cn(
                          'grid gap-2',
                          isMobile ? 'grid-cols-1' : 'grid-cols-2',
                        )}
                      >
                        {additionalImgs.map((imgItem, imgIdx) => (
                          <div
                            key={imgItem.id || imgIdx}
                            className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-white/95 p-1 text-center shadow-2xs"
                          >
                            {imgItem.url ? (
                              <>
                                <img
                                  src={imgItem.url}
                                  alt={imgItem.caption || `Ảnh ${imgIdx + 1}`}
                                  className="aspect-video w-full rounded-lg object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    onImageClick({
                                      url: imgItem.url,
                                      title:
                                        imgItem.caption ||
                                        `Ảnh minh họa ${imgIdx + 1}`,
                                    })
                                  }
                                  className="absolute bottom-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black/90 cursor-pointer"
                                  title="Phóng to"
                                >
                                  <ZoomIn size={10} />
                                </button>
                              </>
                            ) : (
                              <div className="aspect-video rounded-lg bg-emerald-50 grid place-items-center text-[10px] font-bold text-emerald-700">
                                Chưa có ảnh
                              </div>
                            )}
                            {imgItem.caption && (
                              <p className="mt-1 text-[9px] font-bold text-slate-700 line-clamp-1">
                                {imgItem.caption}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            if (block.type === 'voice') {
              return (
                <div
                  key={block.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-sky-300 bg-sky-50/90 p-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-extrabold uppercase text-sky-800">
                      Lời thoại hướng dẫn:
                    </p>
                    <p className="mt-0.5 line-clamp-3 text-xs font-semibold text-sky-950 italic">
                      &quot;
                      {card.mee?.readText?.trim() ||
                        card.body?.trim() ||
                        'Chào các bạn nhỏ!'}
                      &quot;
                    </p>
                  </div>
                </div>
              )
            }

            return null
          })}
        </div>
      )}
    </article>
  )
}
