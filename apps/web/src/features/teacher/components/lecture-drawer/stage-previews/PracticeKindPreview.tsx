import type { LectureDraft } from '../../../lib/authoring'
import { PRACTICE_OPTIONS } from '../../../lib/authoring'
import { goalLines } from '../lecture-drawer-constants'

export function practiceKindLabel(kind: string) {
  return PRACTICE_OPTIONS.find((option) => option.id === kind)?.label ?? 'Kiểu thực hành cũ'
}

export function PracticeKindPreview({ draft, compact = false }: { draft: LectureDraft; compact?: boolean }) {
  const orderingCards = goalLines(draft.practiceConfigText).map((line, index) => {
    const [title, ...description] = line.split('|')
    return { title: title?.trim() || `Bước ${index + 1}`, description: description.join('|').trim() }
  })
  const shell = 'rounded-2xl border-2 border-mint-200 bg-white p-4 shadow-sm'
  const input = 'min-h-11 w-full rounded-xl border-2 border-border bg-page px-3 text-sm font-semibold text-muted'

  return (
    <section className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-4" aria-label={`Xem trước kiểu thực hành ${practiceKindLabel(draft.practiceKind)}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mint-700">Học sinh sẽ thao tác</p>
          <h4 className="mt-1 font-display text-lg text-text">{practiceKindLabel(draft.practiceKind)}</h4>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-mint-800">Preview trực tiếp</span>
      </div>

      {draft.practiceKind === 'intro' && <div className={shell}>
        <p className="font-extrabold text-text">Nhiệm vụ làm quen</p>
        <p className="mt-2 text-sm font-semibold text-muted">{draft.practiceInstruction || 'Đọc nhiệm vụ ngắn và xác nhận con đã sẵn sàng.'}</p>
        <button type="button" disabled className="mt-4 min-h-11 rounded-xl bg-brand-600 px-5 font-extrabold text-white">Con đã sẵn sàng</button>
      </div>}

      {(draft.practiceKind === 'journal' || draft.practiceKind === 'reflect') && <div className={shell}>
        <p className="font-extrabold text-text">{draft.practiceKind === 'reflect' ? 'Con tự nhìn lại sản phẩm' : 'Sổ tay thực hành của con'}</p>
        <p className="mt-1 text-sm font-semibold text-muted">{draft.reflectionPrompt || 'Con quan sát được gì và vì sao con nghĩ như vậy?'}</p>
        <textarea readOnly className={`${input} mt-3 min-h-28 p-3`} placeholder="Con viết câu trả lời tại đây…" />
      </div>}

      {draft.practiceKind === 'sketch' && <div className={shell}>
        <p className="font-extrabold text-text">Bảng phác thảo</p>
        <div className="mt-3 grid min-h-40 place-items-center rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 text-center">
          <div><span className="text-4xl" aria-hidden="true">✏️</span><p className="mt-2 text-sm font-bold text-brand-700">Vẽ bằng bút, tẩy và chọn màu</p></div>
        </div>
      </div>}

      {draft.practiceKind === 'character' && <div className={shell}>
        <p className="font-extrabold text-text">Xưởng tạo nhân vật</p>
        <div className="mt-3 flex flex-wrap gap-2">{['🐱 Mèo', '🤖 Robot', '🦊 Cáo'].map((item) => <span key={item} className="rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-2 text-sm font-bold">{item}</span>)}</div>
        <div className="mt-2 flex flex-wrap gap-2">{['Tò mò', 'Can đảm', 'Vui tính'].map((item) => <span key={item} className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold">{item}</span>)}</div>
        <input readOnly className={`${input} mt-3`} placeholder="Biệt danh an toàn của nhân vật" />
      </div>}

      {draft.practiceKind === 'style' && <div className={shell}>
        <p className="font-extrabold text-text">So sánh và chọn phong cách</p>
        <div className="mt-3 grid grid-cols-3 gap-2">{['🖍️ Màu sáp', '🎨 Cắt giấy', '✒️ Nét mực'].map((item, index) => <div key={item} className={`rounded-xl border-2 p-3 text-center text-xs font-bold ${index === 0 ? 'border-brand-500 bg-brand-50' : 'border-border'}`}>{item}</div>)}</div>
      </div>}

      {draft.practiceKind === 'ai_pick' && <div className={shell}>
        <p className="font-extrabold text-text">Mô tả ý tưởng và chọn tham chiếu an toàn</p>
        <textarea readOnly className={`${input} mt-3 min-h-24 p-3`} placeholder="Con muốn tạo điều gì? Chi tiết quan trọng là gì?" />
        <div className="mt-3 grid grid-cols-3 gap-2">{['🖼️ Tư liệu 1', '🌈 Tư liệu 2', '🧩 Tư liệu 3'].map((item) => <div key={item} className="rounded-xl border-2 border-border bg-page p-3 text-center text-xs font-bold">{item}</div>)}</div>
      </div>}

      {draft.practiceKind === 'story' && <div className={shell}>
        <p className="font-extrabold text-text">Chọn ba nhịp của câu chuyện</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{[['1', 'Mở đầu'], ['2', 'Sự cố'], ['3', 'Kết thúc']].map(([number, label]) => <div key={number} className="rounded-xl border-2 border-brand-200 bg-brand-50 p-3"><span className="text-xs font-extrabold text-brand-600">NHỊP {number}</span><p className="mt-1 text-sm font-bold">{label}</p><span className="mt-2 block rounded-lg bg-white px-2 py-2 text-xs text-muted">Chọn một thẻ…</span></div>)}</div>
      </div>}

      {draft.practiceKind === 'video' && <div className={shell}>
        <p className="font-extrabold text-text">Kế hoạch cảnh video</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{['🎬 Cảnh mở', '🏃 Chuyển động', '⭐ Cảnh kết'].map((item, index) => <div key={item} className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm font-bold"><span className="block text-xs text-sky-700">CẢNH {index + 1}</span>{item}<span className="mt-2 block text-xs font-semibold text-muted">Mô tả hành động…</span></div>)}</div>
      </div>}

      {draft.practiceKind === 'palette' && <div className={shell}>
        <p className="font-extrabold text-text">Chọn ba màu và giải thích thông điệp</p>
        <div className="mt-3 flex gap-3">{['#6d5dfc', '#ff7a90', '#43d6b3'].map((color) => <span key={color} className="size-12 rounded-2xl border-4 border-white shadow-sm" style={{ backgroundColor: color }} />)}</div>
        <textarea readOnly className={`${input} mt-3 min-h-20 p-3`} placeholder="Vì sao các màu này phù hợp với sản phẩm?" />
      </div>}

      {draft.practiceKind === 'ordering' && <div className={shell}>
        <p className="font-extrabold text-text">Kéo thả để sắp xếp đúng trình tự</p>
        <div className="mt-3 grid gap-2">{(orderingCards.length ? orderingCards : [{ title: 'Thẻ 1', description: 'Nhập ít nhất ba thẻ ở phần cấu hình.' }, { title: 'Thẻ 2', description: 'Các thẻ sẽ được đảo khi học sinh bắt đầu.' }, { title: 'Thẻ 3', description: 'Học sinh kéo thả về đúng thứ tự.' }]).slice(0, compact ? 3 : 6).map((card, index) => <div key={`${card.title}-${index}`} className="flex items-center gap-3 rounded-xl border-2 border-border bg-page px-3 py-2"><span className="text-lg text-muted">⠿</span><span className="grid size-7 place-items-center rounded-lg bg-brand-100 text-xs font-extrabold text-brand-700">{index + 1}</span><div><p className="text-sm font-extrabold">{card.title}</p>{card.description && <p className="text-xs font-semibold text-muted">{card.description}</p>}</div></div>)}</div>
      </div>}
    </section>
  )
}
