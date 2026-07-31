import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  GAME_DIFFICULTIES,
  GAME_OPTIONS,
  PRACTICE_OPTIONS,
  lectureDraftReadiness,
  slugifyAuthoringId,
  type LectureDraft,
} from '../lib/authoring'

// WHY: Import cùng set với authoring.ts để ẩn JSON config textarea khi game tự-chứa.
// Duplicate nhỏ — tránh circular dependency nếu export từ authoring.
const SELF_CONTAINED_GAME_IDS = new Set(['battle-math', 'blockly', 'edukiz', 'math-kids'])

type Props = {
  value: LectureDraft
  onChange: (value: LectureDraft) => void
  onSubmit: (event: FormEvent) => void
  submitLabel: string
  idEditable?: boolean
  onCancel?: () => void
  secondaryActions?: ReactNode
}

const inputClass = 'min-h-11 w-full rounded-xl border-2 border-border bg-white px-3 text-sm text-text outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100'
const textareaClass = `${inputClass} py-2 leading-relaxed`
const labelClass = 'flex flex-col gap-1.5 text-sm font-bold text-text'

export function LectureAuthoringForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  idEditable = false,
  onCancel,
  secondaryActions,
}: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const readiness = useMemo(() => lectureDraftReadiness(value), [value])
  const activeStep = readiness.steps[stepIndex]!
  const isSelfContained = SELF_CONTAINED_GAME_IDS.has(value.gameType)

  function setField<Key extends keyof LectureDraft>(key: Key, nextValue: LectureDraft[Key]) {
    onChange({ ...value, [key]: nextValue })
  }

  function changeTitle(title: string) {
    const previousAutomaticId = slugifyAuthoringId(value.title)
    onChange({
      ...value,
      title,
      id: idEditable && (!value.id || value.id === previousAutomaticId) ? slugifyAuthoringId(title) : value.id,
    })
  }

  function changeGameType(gameType: string) {
    onChange({
      ...value,
      gameType,
      gameAllowedTypes:
        value.gameMode === 'required'
          ? [gameType]
          : [...new Set([gameType, ...value.gameAllowedTypes])],
    })
  }

  function changeGameMode(gameMode: LectureDraft['gameMode']) {
    onChange({
      ...value,
      gameMode,
      gameAllowedTypes:
        gameMode === 'required'
          ? [value.gameType]
          : [...new Set([value.gameType, ...value.gameAllowedTypes])],
    })
  }

  function toggleAllowedGame(gameType: string) {
    const selected = value.gameAllowedTypes.includes(gameType)
    const next = selected
      ? value.gameAllowedTypes.filter((item) => item !== gameType)
      : [...value.gameAllowedTypes, gameType]
    onChange({
      ...value,
      gameAllowedTypes: next.includes(value.gameType)
        ? next
        : [value.gameType, ...next],
    })
  }

  return (
    <form className="ui-card overflow-hidden" onSubmit={onSubmit} noValidate>
      <div className="border-b border-border bg-sky-50/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">Soạn bài học</p>
            <h2 className="mt-1 font-display text-2xl text-text">{value.title || 'Bài học mới'}</h2>
            <p className="mt-1 text-sm text-muted">Hoàn thiện bốn trạm theo đúng trải nghiệm của học sinh.</p>
          </div>
          {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Đóng</Button>}
        </div>

        <ol className="mt-4 grid gap-2 sm:grid-cols-4" aria-label="Các trạm của bài học">
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
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs shadow-sm" aria-hidden="true">{item.complete ? '✓' : index + 1}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Trạm {stepIndex + 1} / {readiness.total}</p>
            <h3 className="font-display text-xl text-text">{activeStep.label}</h3>
          </div>
          <p className={cn('rounded-full px-3 py-1 text-xs font-bold', activeStep.complete ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning')} role="status">
            {activeStep.complete ? 'Đã hoàn thiện' : `Còn ${activeStep.missing.length} mục`}
          </p>
        </div>

        {stepIndex === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Tên bài học
              <input className={inputClass} value={value.title} onChange={(event) => changeTitle(event.target.value)} placeholder="Ví dụ: Prompt rõ ràng" autoFocus />
            </label>
            {idEditable && (
              <label className={`${labelClass} sm:col-span-2`}>
                Đường dẫn bài học
                <input className={`${inputClass} font-mono`} value={value.id} onChange={(event) => setField('id', slugifyAuthoringId(event.target.value))} placeholder="prompt-ro-rang" maxLength={64} />
                <span className="text-xs font-normal text-muted">Được tạo tự động; chỉ sửa nếu có tên trùng.</span>
              </label>
            )}
            <label className={labelClass}>
              Kỹ năng trọng tâm
              <input className={inputClass} value={value.skill} onChange={(event) => setField('skill', event.target.value)} placeholder="Viết hướng dẫn rõ ràng cho AI" />
            </label>
            <label className={labelClass}>
              Thời lượng
              <input className={inputClass} value={value.duration} onChange={(event) => setField('duration', event.target.value)} placeholder="25–35 phút" />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Câu hỏi khởi động
              <textarea className={`${textareaClass} min-h-20`} value={value.hook} onChange={(event) => setField('hook', event.target.value)} placeholder="Một câu hỏi gần gũi khiến học sinh muốn khám phá" />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Video bài giảng (không bắt buộc)
              <input className={inputClass} type="url" inputMode="url" value={value.videoUrl} onChange={(event) => setField('videoUrl', event.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              <span className="text-xs font-normal text-muted">Chỉ dùng liên kết HTTPS. Có thể thêm hoặc thay video sau.</span>
            </label>
            <label className={labelClass}>
              Mục tiêu bài học
              <textarea className={`${textareaClass} min-h-32`} value={value.goalsText} onChange={(event) => setField('goalsText', event.target.value)} placeholder={'Nhận ra hướng dẫn còn mơ hồ\nViết được prompt đủ ba phần'} />
              <span className="text-xs font-normal text-muted">Mỗi dòng một mục tiêu.</span>
            </label>
            <label className={labelClass}>
              Kiến thức cốt lõi
              <textarea className={`${textareaClass} min-h-32`} value={value.concept} onChange={(event) => setField('concept', event.target.value)} placeholder="Điều quan trọng nhất học sinh cần hiểu" />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Ví dụ minh họa
              <textarea className={`${textareaClass} min-h-24`} value={value.example} onChange={(event) => setField('example', event.target.value)} placeholder="Một ví dụ cụ thể, gần gũi và an toàn" />
            </label>
          </div>
        )}

        {stepIndex === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Quyền chọn game
                <select
                  className={inputClass}
                  value={value.gameMode}
                  onChange={(event) =>
                    changeGameMode(event.target.value as LectureDraft['gameMode'])
                  }
                >
                  <option value="required">Bắt buộc game giáo viên chọn</option>
                  <option value="student_choice">Học sinh chọn trong danh sách</option>
                </select>
                <span className="text-xs font-normal text-muted">
                  Bài đặc thù nên khóa game; bài luyện tập có thể cho trẻ tự chọn.
                </span>
              </label>
              <label className={labelClass}>
                Nhịp thử thách
                <select
                  className={inputClass}
                  value={value.gameDifficulty}
                  onChange={(event) =>
                    setField(
                      'gameDifficulty',
                      event.target.value as LectureDraft['gameDifficulty'],
                    )
                  }
                >
                  {GAME_DIFFICULTIES.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} · {option.description}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className={labelClass}>
              Game chính
              <select
                className={inputClass}
                value={value.gameType}
                onChange={(event) => changeGameType(event.target.value)}
              >
                {GAME_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label} · {option.description}</option>)}
              </select>
            </label>
            {value.gameMode === 'student_choice' && (
              <fieldset className="rounded-2xl border-2 border-brand-100 bg-brand-50/50 p-4">
                <legend className="px-2 text-sm font-extrabold text-text">
                  Những game học sinh được chọn
                </legend>
                <p className="mb-3 text-xs text-muted">
                  Game chính luôn được giữ. Chọn thêm ít nhất một cách chơi cùng phục vụ mục tiêu AI của bài.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {GAME_OPTIONS.filter(
                    (option) => option.choiceReady || option.id === value.gameType,
                  ).map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        'flex min-h-12 items-center gap-3 rounded-xl border-2 bg-white px-3 text-sm font-bold',
                        value.gameAllowedTypes.includes(option.id)
                          ? 'border-brand-300 text-brand-700'
                          : 'border-border text-muted',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={value.gameAllowedTypes.includes(option.id)}
                        disabled={option.id === value.gameType}
                        onChange={() => toggleAllowedGame(option.id)}
                        className="size-5 accent-brand-500"
                      />
                      <span aria-hidden="true">
                        {option.id === 'data-runner' ? '🏃' : option.id === 'truth-patrol' ? '🔎' : '🎮'}
                      </span>
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <label className={labelClass}>
              Hướng dẫn chơi
              <textarea className={`${textareaClass} min-h-28`} value={value.gameInstruction} onChange={(event) => setField('gameInstruction', event.target.value)} placeholder="Nói rõ học sinh cần làm gì và khi nào hoàn thành" autoFocus />
            </label>
            <label className={labelClass}>
              Điều học sinh hiểu sau trò chơi
              <input className={inputClass} value={value.gameOutcome} onChange={(event) => setField('gameOutcome', event.target.value)} placeholder="Ví dụ: Phân biệt prompt rõ và prompt mơ hồ" />
            </label>
            <label className={labelClass}>
              Ghi chú nội dung bổ sung (không bắt buộc)
              <textarea className={`${textareaClass} min-h-36`} value={value.gameCardsText} onChange={(event) => setField('gameCardsText', event.target.value)} placeholder={'Vẽ một con mèo\nVẽ một con mèo cam đang ngủ trên mái nhà'} />
              <span className="text-xs font-normal text-muted">
                Mỗi dòng một ghi chú cho giáo viên. Gameplay không đọc dữ liệu mẫu từ frontend.
              </span>
            </label>
            {!isSelfContained && (
              <label className={labelClass}>
                Dữ liệu game trong DB (JSON)
                <textarea
                  className={`${textareaClass} min-h-72 font-mono text-xs`}
                  value={value.gameStructuredText}
                  onChange={(event) => setField('gameStructuredText', event.target.value)}
                  spellCheck={false}
                  placeholder={'{\n  "lobby": { ... },\n  "catalog": [ ... ],\n  "runnerLevels": [ ... ],\n  "patrolWaves": [ ... ]\n}'}
                />
                <span className="text-xs font-normal leading-relaxed text-muted">
                  Tên game, ảnh, nhiệm vụ, level, wave và phản hồi đều được lưu tại trạm game trong LMS. Backend sẽ từ chối URL ngoài thư mục asset và cấu hình sai schema.
                </span>
              </label>
            )}
            {isSelfContained && (
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm leading-relaxed text-muted">
                <strong className="text-text">Game tự-chứa.</strong>{' '}
                {value.gameType === 'math-kids'
                  ? 'Bạn có thể thêm câu hỏi trắc nghiệm tùy chỉnh trong phần Dữ liệu game nâng cao (tùy chọn).'
                  : 'Engine game tự quản lý nội dung — không cần cấu hình JSON thêm.'}
              </div>
            )}
          </div>
        )}

        {stepIndex === 2 && (
          <div className="grid gap-4">
            <label className={labelClass}>
              Kiểu thực hành
              <select className={inputClass} value={value.practiceKind} onChange={(event) => setField('practiceKind', event.target.value)}>
                {PRACTICE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label} · {option.description}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Nhiệm vụ thực hành
              <textarea className={`${textareaClass} min-h-36`} value={value.practiceInstruction} onChange={(event) => setField('practiceInstruction', event.target.value)} placeholder="Chia nhiệm vụ thành các bước ngắn, có điểm dừng để học sinh tự kiểm tra" autoFocus />
            </label>
            <label className={labelClass}>
              Sản phẩm cần hoàn thành
              <input className={inputClass} value={value.product} onChange={(event) => setField('product', event.target.value)} placeholder="Ví dụ: Một prompt đã được cải thiện" />
            </label>
            <label className={labelClass}>
              Ghi nhận sau bài học (không bắt buộc)
              <input className={inputClass} value={value.reward} onChange={(event) => setField('reward', event.target.value)} placeholder="Ví dụ: Huy hiệu Prompt sáng" />
            </label>
          </div>
        )}

        {stepIndex === 3 && (
          <div className="grid gap-4">
            <label className={labelClass}>
              Câu hỏi kiểm tra
              <textarea className={`${textareaClass} min-h-24`} value={value.checkQuestion} onChange={(event) => setField('checkQuestion', event.target.value)} placeholder="Một câu hỏi kiểm tra đúng mục tiêu bài học" autoFocus />
            </label>
            <fieldset className="grid gap-3 rounded-2xl border border-border p-4">
              <legend className="px-2 text-sm font-bold text-text">Ba lựa chọn trả lời</legend>
              {([1, 2, 3] as const).map((number) => {
                const key = `checkOption${number}` as const
                return (
                  <label key={key} className={labelClass}>
                    Lựa chọn {number}
                    <input className={inputClass} value={value[key]} onChange={(event) => setField(key, event.target.value)} />
                  </label>
                )
              })}
            </fieldset>
            <label className={labelClass}>
              Đáp án đúng
              <select className={inputClass} value={value.correctIndex} onChange={(event) => setField('correctIndex', event.target.value)}>
                <option value="0">Lựa chọn 1</option>
                <option value="1">Lựa chọn 2</option>
                <option value="2">Lựa chọn 3</option>
              </select>
            </label>
            <label className={labelClass}>
              Giải thích sau khi trả lời
              <textarea className={`${textareaClass} min-h-24`} value={value.checkExplain} onChange={(event) => setField('checkExplain', event.target.value)} placeholder="Giải thích ngắn gọn vì sao đáp án đúng và khuyến khích thử lại" />
            </label>
          </div>
        )}

        {!activeStep.complete && (
          <div className="mt-5 rounded-xl border border-sun-200 bg-sun-50 p-3" role="status">
            <p className="text-sm font-bold text-warning">Cần bổ sung:</p>
            <p className="mt-1 text-sm text-muted">{activeStep.missing.join(' · ')}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Button type="button" variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>Trạm trước</Button>
          {stepIndex < readiness.total - 1 ? (
            <Button type="button" disabled={!activeStep.complete} onClick={() => setStepIndex((current) => Math.min(readiness.total - 1, current + 1))}>Trạm tiếp theo</Button>
          ) : (
            <Button type="submit" disabled={!readiness.complete}>{submitLabel}</Button>
          )}
        </div>

        {secondaryActions && <div className="mt-4 border-t border-border pt-4">{secondaryActions}</div>}
      </div>
    </form>
  )
}
