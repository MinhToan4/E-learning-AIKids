import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  courseDraftReadiness,
  slugifyAuthoringId,
  type CourseDraft,
} from '../lib/authoring'

type Props = {
  value: CourseDraft
  onChange: (value: CourseDraft) => void
  onSubmit: (event: FormEvent) => void
}

const inputClass = 'min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm text-text outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100'
const textareaClass = `${inputClass} py-2 leading-relaxed`
const labelClass = 'flex flex-col gap-1.5 text-sm font-bold text-text'

export function CourseAuthoringWizard({ value, onChange, onSubmit }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const readiness = useMemo(() => courseDraftReadiness(value), [value])
  const activeStep = readiness.steps[stepIndex]!

  function setField<Key extends keyof CourseDraft>(key: Key, nextValue: CourseDraft[Key]) {
    onChange({ ...value, [key]: nextValue })
  }

  function changeTitle(title: string) {
    const previousAutomaticId = slugifyAuthoringId(value.title)
    onChange({
      ...value,
      title,
      id: !value.id || value.id === previousAutomaticId ? slugifyAuthoringId(title) : value.id,
    })
  }

  return (
    <form className="ui-card overflow-hidden" onSubmit={onSubmit} noValidate>
      <div className="border-b border-border/60 bg-sky-50/60 p-5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">Tạo khóa học mới</p>
        <h2 className="mt-1 font-display text-2xl text-text">Đi từng bước, không bỏ sót</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">Khóa được lưu ở trạng thái bản nháp. Bạn sẽ thêm bài học và kiểm tra lần cuối trước khi mở cho học sinh.</p>

        <ol className="mt-4 grid gap-2 sm:grid-cols-3" aria-label="Tiến trình tạo khóa học">
          {readiness.steps.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  'flex min-h-12 w-full items-center gap-2 rounded-xl border-2 px-3 text-left text-sm font-bold transition',
                  index === stepIndex && 'border-sky-400 bg-white text-sky-700',
                  index !== stepIndex && item.complete && 'border-mint-200 bg-mint-100/70 text-success',
                  index !== stepIndex && !item.complete && 'border-transparent bg-white/70 text-muted hover:border-border',
                )}
                onClick={() => setStepIndex(index)}
                aria-current={index === stepIndex ? 'step' : undefined}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs shadow-sm" aria-hidden="true">
                  {item.complete ? '✓' : index + 1}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Bước {stepIndex + 1} / {readiness.total}</p>
            <h3 className="font-display text-xl text-text">{activeStep.label}</h3>
          </div>
          <p className={cn('rounded-full px-3 py-1 text-xs font-bold', activeStep.complete ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning')} role="status">
            {activeStep.complete ? 'Đã đủ thông tin' : `Còn ${activeStep.missing.length} mục`}
          </p>
        </div>

        {stepIndex === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Tên khóa học
              <input className={inputClass} value={value.title} onChange={(event) => changeTitle(event.target.value)} placeholder="Ví dụ: Kể chuyện cùng AI" autoFocus />
              <span className="text-xs font-normal text-muted">Dùng tên rõ ràng để giáo viên và phụ huynh hiểu ngay nội dung.</span>
            </label>
            <label className={labelClass}>
              Tên ngắn trên thẻ khóa học
              <input className={inputClass} value={value.shortTitle} onChange={(event) => setField('shortTitle', event.target.value)} placeholder="Kể chuyện AI" />
            </label>
            <label className={labelClass}>
              Thời lượng dự kiến
              <input className={inputClass} value={value.durationLabel} onChange={(event) => setField('durationLabel', event.target.value)} placeholder="8 tuần" />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Câu giới thiệu ngắn
              <input className={inputClass} value={value.tagline} onChange={(event) => setField('tagline', event.target.value)} placeholder="Biến ý tưởng thành câu chuyện đáng nhớ" />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Mô tả khóa học
              <textarea className={`${textareaClass} min-h-28`} value={value.description} onChange={(event) => setField('description', event.target.value)} placeholder="Học sinh sẽ trải nghiệm gì và vì sao khóa học này hữu ích?" />
            </label>
            <label className={labelClass}>
              Nhóm tuổi
              <select className={inputClass} value={value.ageTrack} onChange={(event) => setField('ageTrack', event.target.value)}>
                <option value="L1">8–9 tuổi · Có hướng dẫn</option>
                <option value="L2">10–11 tuổi · Tự chủ hơn</option>
              </select>
            </label>
            <label className={labelClass}>
              Chặng trong lộ trình
              <select className={inputClass} value={value.courseKey} onChange={(event) => setField('courseKey', event.target.value)}>
                {['K1', 'K2', 'K3', 'K4', 'K5', 'K6'].map((key) => <option key={key}>{key}</option>)}
              </select>
            </label>
            <details className="rounded-xl border border-border bg-surface-soft p-3 sm:col-span-2">
              <summary className="min-h-8 cursor-pointer text-sm font-bold text-muted">Tùy chọn nâng cao: đường dẫn khóa học</summary>
              <label className={`${labelClass} mt-3`}>
                Đường dẫn duy nhất
                <input className={`${inputClass} font-mono`} value={value.id} onChange={(event) => setField('id', slugifyAuthoringId(event.target.value))} placeholder="ke-chuyen-cung-ai" maxLength={40} />
                <span className="text-xs font-normal text-muted">Được tạo tự động từ tên khóa học; chỉ cần sửa khi có tên trùng.</span>
              </label>
            </details>
          </div>
        )}

        {stepIndex === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Sản phẩm cuối khóa
              <textarea className={`${textareaClass} min-h-24`} value={value.productLabel} onChange={(event) => setField('productLabel', event.target.value)} placeholder="Ví dụ: Một truyện tranh bốn khung có bản nháp và bản đã sửa" autoFocus />
            </label>
            <label className={labelClass}>
              Kỹ năng đạt được
              <textarea className={`${textareaClass} min-h-36`} value={value.skillsText} onChange={(event) => setField('skillsText', event.target.value)} placeholder={'Viết hướng dẫn rõ ràng cho AI\nKiểm tra và cải thiện kết quả'} />
              <span className="text-xs font-normal text-muted">Mỗi dòng một kỹ năng có thể quan sát.</span>
            </label>
            <label className={labelClass}>
              Kết quả đầu ra
              <textarea className={`${textareaClass} min-h-36`} value={value.outcomesText} onChange={(event) => setField('outcomesText', event.target.value)} placeholder={'Hoàn thành một sản phẩm cuối khóa\nGiải thích được lựa chọn của mình'} />
              <span className="text-xs font-normal text-muted">Mỗi dòng một điều học sinh làm được.</span>
            </label>
          </div>
        )}

        {stepIndex === 2 && (
          <div className="grid gap-4">
            <label className={labelClass}>
              Chứng nhận hoặc huy hiệu
              <input className={inputClass} value={value.credential} onChange={(event) => setField('credential', event.target.value)} placeholder="Huy hiệu Nhà kể chuyện có trách nhiệm" autoFocus />
            </label>
            <label className={labelClass}>
              Yêu cầu hoàn thành cuối khóa
              <textarea className={`${textareaClass} min-h-32`} value={value.finalAssessment} onChange={(event) => setField('finalAssessment', event.target.value)} placeholder="Học sinh trình bày sản phẩm, giải thích lựa chọn và cải thiện theo phản hồi." />
            </label>
            <div className="rounded-2xl bg-sky-50 p-4 text-sm leading-relaxed text-muted">
              <strong className="text-text">Đơn vị ghi nhận: AI Kids Creator Academy.</strong> Sau khi tạo bản nháp, bạn sẽ thêm ít nhất một bài học đủ bốn trạm trước khi mở khóa.
            </div>
          </div>
        )}

        {!activeStep.complete && (
          <div className="mt-5 rounded-xl border border-sun-200 bg-sun-50 p-3" role="status">
            <p className="text-sm font-bold text-warning">Cần bổ sung trước khi tiếp tục:</p>
            <p className="mt-1 text-sm text-muted">{activeStep.missing.join(' · ')}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Button type="button" variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>Quay lại</Button>
          {stepIndex < readiness.total - 1 ? (
            <Button type="button" disabled={!activeStep.complete} onClick={() => setStepIndex((current) => Math.min(readiness.total - 1, current + 1))}>Tiếp tục</Button>
          ) : (
            <Button type="submit" disabled={!readiness.complete}>Tạo bản nháp khóa học</Button>
          )}
        </div>
      </div>
    </form>
  )
}
