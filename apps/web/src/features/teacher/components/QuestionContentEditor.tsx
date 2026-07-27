import { useId, useMemo } from 'react'
import { ArrowDown, ArrowUp, Code2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

export type AuthoringQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'drag_drop'
  | 'short_text'
  | 'ordering'
  | 'artifact'

type OptionRow = {
  id: string
  text: string
}

type RubricCriterion = {
  id: string
  label: string
  maxPoints: number
}

function parseRecord(value: string) {
  const parsed: unknown = JSON.parse(value)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Nội dung phải là một đối tượng JSON.')
  }
  return parsed as Record<string, unknown>
}

function rows(value: unknown): OptionRow[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (row): row is OptionRow =>
      Boolean(
        row &&
          typeof row === 'object' &&
          'id' in row &&
          typeof row.id === 'string' &&
          'text' in row &&
          typeof row.text === 'string',
      ),
  )
}

function criteria(value: unknown): RubricCriterion[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (row): row is RubricCriterion =>
      Boolean(
        row &&
          typeof row === 'object' &&
          'id' in row &&
          typeof row.id === 'string' &&
          'label' in row &&
          typeof row.label === 'string' &&
          'maxPoints' in row &&
          typeof row.maxPoints === 'number',
      ),
  )
}

export function nextRowId(prefix: string, existingIds: string[]) {
  let index = existingIds.length + 1
  while (existingIds.includes(`${prefix}-${index}`)) index += 1
  return `${prefix}-${index}`
}

export function moveRow<T>(values: T[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= values.length) return values
  const next = [...values]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  return next
}

export function QuestionContentEditor({
  type,
  prompt,
  answerKey,
  rubric,
  onPromptChange,
  onAnswerKeyChange,
  onRubricChange,
}: {
  type: AuthoringQuestionType
  prompt: string
  answerKey: string
  rubric: string
  onPromptChange: (value: string) => void
  onAnswerKeyChange: (value: string) => void
  onRubricChange: (value: string) => void
}) {
  const parsed = useMemo(() => {
    try {
      return {
        prompt: parseRecord(prompt),
        answerKey: parseRecord(answerKey),
        rubric: parseRecord(rubric),
        error: null,
      }
    } catch (cause) {
      return {
        prompt: null,
        answerKey: null,
        rubric: null,
        error:
          cause instanceof Error
            ? cause.message
            : 'Cấu hình câu hỏi chưa đúng định dạng.',
      }
    }
  }, [answerKey, prompt, rubric])

  const updatePrompt = (next: Record<string, unknown>) =>
    onPromptChange(JSON.stringify(next, null, 2))
  const updateAnswer = (next: Record<string, unknown>) =>
    onAnswerKeyChange(JSON.stringify(next, null, 2))
  const updateRubric = (next: Record<string, unknown>) =>
    onRubricChange(JSON.stringify(next, null, 2))

  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-page p-4">
      <div>
        <h3 className="font-display text-lg">Nội dung dành cho học viên</h3>
        <p className="text-sm text-muted">
          Điền trực tiếp như khi soạn bài. Mã kỹ thuật được hệ thống quản lý ở chế độ nâng cao.
        </p>
      </div>

      {parsed.error || !parsed.prompt || !parsed.answerKey || !parsed.rubric ? (
        <p className="rounded-xl bg-coral-50 p-3 text-sm font-bold text-danger" role="alert">
          {parsed.error}. Mở “JSON nâng cao” để sửa dữ liệu hiện tại.
        </p>
      ) : (
        <>
          {(type === 'single_choice' || type === 'multiple_choice') && (
            <ChoiceEditor
              type={type}
              prompt={parsed.prompt}
              answerKey={parsed.answerKey}
              onPromptChange={updatePrompt}
              onAnswerKeyChange={updateAnswer}
            />
          )}
          {type === 'ordering' && (
            <OrderingEditor
              prompt={parsed.prompt}
              onPromptChange={updatePrompt}
              onAnswerKeyChange={updateAnswer}
            />
          )}
          {type === 'drag_drop' && (
            <DragDropEditor
              prompt={parsed.prompt}
              answerKey={parsed.answerKey}
              onPromptChange={updatePrompt}
              onAnswerKeyChange={updateAnswer}
            />
          )}
          {type === 'short_text' && (
            <>
              <StemEditor prompt={parsed.prompt} onChange={updatePrompt} />
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberInput
                  label="Số ký tự tối thiểu"
                  value={Number(parsed.prompt.minLength ?? 1)}
                  min={0}
                  max={5_000}
                  onChange={(value) =>
                    updatePrompt({ ...parsed.prompt!, minLength: value })
                  }
                />
                <NumberInput
                  label="Số ký tự tối đa"
                  value={Number(parsed.prompt.maxLength ?? 1_000)}
                  min={1}
                  max={5_000}
                  onChange={(value) =>
                    updatePrompt({ ...parsed.prompt!, maxLength: value })
                  }
                />
              </div>
              <RubricEditor
                rubric={parsed.rubric}
                onChange={updateRubric}
              />
            </>
          )}
          {type === 'artifact' && (
            <>
              <StemEditor prompt={parsed.prompt} onChange={updatePrompt} />
              <ArtifactSources
                value={
                  Array.isArray(parsed.prompt.allowedSources)
                    ? parsed.prompt.allowedSources.map(String)
                    : []
                }
                onChange={(allowedSources) =>
                  updatePrompt({ ...parsed.prompt!, allowedSources })
                }
              />
              <RubricEditor
                rubric={parsed.rubric}
                onChange={updateRubric}
              />
            </>
          )}
        </>
      )}

      <details
        className="rounded-xl border border-border bg-white p-3"
        open={parsed.error ? true : undefined}
      >
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-bold">
          <Code2 size={17} aria-hidden="true" />
          JSON nâng cao
        </summary>
        <div className="mt-3 grid gap-3">
          <JsonEditor
            label="Nội dung câu hỏi"
            value={prompt}
            onChange={onPromptChange}
          />
          <JsonEditor
            label="Đáp án lưu tại máy chủ"
            value={answerKey}
            onChange={onAnswerKeyChange}
          />
          <JsonEditor
            label="Rubric"
            value={rubric}
            onChange={onRubricChange}
          />
        </div>
      </details>
    </section>
  )
}

function ChoiceEditor({
  type,
  prompt,
  answerKey,
  onPromptChange,
  onAnswerKeyChange,
}: {
  type: 'single_choice' | 'multiple_choice'
  prompt: Record<string, unknown>
  answerKey: Record<string, unknown>
  onPromptChange: (value: Record<string, unknown>) => void
  onAnswerKeyChange: (value: Record<string, unknown>) => void
}) {
  const groupName = `correct-answer-${useId().replace(/:/g, '')}`
  const options = rows(prompt.options)
  const correctIds = Array.isArray(answerKey.correctOptionIds)
    ? answerKey.correctOptionIds.map(String)
    : []

  function setOptions(next: OptionRow[]) {
    onPromptChange({ ...prompt, options: next })
    const remainingIds = new Set(next.map((option) => option.id))
    onAnswerKeyChange({
      ...answerKey,
      correctOptionIds: correctIds.filter((id) => remainingIds.has(id)),
    })
  }

  return (
    <>
      <StemEditor prompt={prompt} onChange={onPromptChange} />
      <fieldset className="grid gap-3">
        <legend className="text-sm font-extrabold">
          Lựa chọn và đáp án đúng
        </legend>
        {options.map((option, index) => {
          const checked = correctIds.includes(option.id)
          return (
            <div
              key={option.id}
              className="grid gap-2 rounded-xl border border-border bg-white p-3 sm:grid-cols-[auto_1fr_auto]"
            >
              <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
                <input
                  type={type === 'single_choice' ? 'radio' : 'checkbox'}
                  name={type === 'single_choice' ? groupName : undefined}
                  className="h-5 w-5 accent-sky-500"
                  checked={checked}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? type === 'single_choice'
                        ? [option.id]
                        : [...correctIds, option.id]
                      : correctIds.filter((id) => id !== option.id)
                    onAnswerKeyChange({
                      ...answerKey,
                      correctOptionIds: next,
                    })
                  }}
                />
                Đúng
              </label>
              <label className="grid gap-1 text-sm font-bold">
                Lựa chọn {index + 1}
                <input
                  required
                  className="field-input"
                  value={option.text}
                  onChange={(event) =>
                    setOptions(
                      options.map((row) =>
                        row.id === option.id
                          ? { ...row, text: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </label>
              <IconButton
                label={`Xóa lựa chọn ${index + 1}`}
                disabled={options.length <= 2}
                onClick={() =>
                  setOptions(options.filter((row) => row.id !== option.id))
                }
              >
                <Trash2 size={17} aria-hidden="true" />
              </IconButton>
            </div>
          )
        })}
        <Button
          type="button"
          variant="secondary"
          disabled={options.length >= 20}
          onClick={() => {
            const id = nextRowId(
              'option',
              options.map((option) => option.id),
            )
            setOptions([...options, { id, text: '' }])
          }}
        >
          <Plus size={17} aria-hidden="true" />
          Thêm lựa chọn
        </Button>
        {correctIds.length === 0 && (
          <p className="text-sm font-bold text-warning" role="status">
            Chọn ít nhất một đáp án đúng trước khi lưu.
          </p>
        )}
      </fieldset>
    </>
  )
}

function OrderingEditor({
  prompt,
  onPromptChange,
  onAnswerKeyChange,
}: {
  prompt: Record<string, unknown>
  onPromptChange: (value: Record<string, unknown>) => void
  onAnswerKeyChange: (value: Record<string, unknown>) => void
}) {
  const items = rows(prompt.items)
  function setItems(next: OptionRow[]) {
    onPromptChange({ ...prompt, items: next })
    onAnswerKeyChange({ correctOrder: next.map((item) => item.id) })
  }
  return (
    <>
      <StemEditor prompt={prompt} onChange={onPromptChange} />
      <fieldset className="grid gap-3">
        <legend className="text-sm font-extrabold">
          Thứ tự đúng từ trên xuống
        </legend>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[auto_1fr_auto] items-end gap-2 rounded-xl border border-border bg-white p-3"
          >
            <span className="flex min-h-11 w-8 items-center justify-center font-extrabold text-sky-700">
              {index + 1}
            </span>
            <label className="grid gap-1 text-sm font-bold">
              Bước {index + 1}
              <input
                required
                className="field-input"
                value={item.text}
                onChange={(event) =>
                  setItems(
                    items.map((row) =>
                      row.id === item.id
                        ? { ...row, text: event.target.value }
                        : row,
                    ),
                  )
                }
              />
            </label>
            <div className="flex gap-1">
              <IconButton
                label={`Đưa bước ${index + 1} lên`}
                disabled={index === 0}
                onClick={() => setItems(moveRow(items, index, -1))}
              >
                <ArrowUp size={17} aria-hidden="true" />
              </IconButton>
              <IconButton
                label={`Đưa bước ${index + 1} xuống`}
                disabled={index === items.length - 1}
                onClick={() => setItems(moveRow(items, index, 1))}
              >
                <ArrowDown size={17} aria-hidden="true" />
              </IconButton>
              <IconButton
                label={`Xóa bước ${index + 1}`}
                disabled={items.length <= 2}
                onClick={() =>
                  setItems(items.filter((row) => row.id !== item.id))
                }
              >
                <Trash2 size={17} aria-hidden="true" />
              </IconButton>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          disabled={items.length >= 20}
          onClick={() => {
            const id = nextRowId(
              'step',
              items.map((item) => item.id),
            )
            setItems([...items, { id, text: '' }])
          }}
        >
          <Plus size={17} aria-hidden="true" />
          Thêm bước
        </Button>
      </fieldset>
    </>
  )
}

function DragDropEditor({
  prompt,
  answerKey,
  onPromptChange,
  onAnswerKeyChange,
}: {
  prompt: Record<string, unknown>
  answerKey: Record<string, unknown>
  onPromptChange: (value: Record<string, unknown>) => void
  onAnswerKeyChange: (value: Record<string, unknown>) => void
}) {
  const items = rows(prompt.items)
  const targets = rows(prompt.targets)
  const placements = Object.fromEntries(
    Object.entries(answerKey).filter(([, value]) => typeof value === 'string'),
  ) as Record<string, string>

  function setTargets(next: OptionRow[]) {
    onPromptChange({ ...prompt, targets: next })
    const targetIds = new Set(next.map((target) => target.id))
    const fallback = next[0]?.id ?? ''
    onAnswerKeyChange(
      Object.fromEntries(
        items.map((item) => [
          item.id,
          targetIds.has(placements[item.id] ?? '')
            ? placements[item.id]
            : fallback,
        ]),
      ),
    )
  }

  function setItems(next: OptionRow[]) {
    onPromptChange({ ...prompt, items: next })
    const fallback = targets[0]?.id ?? ''
    onAnswerKeyChange(
      Object.fromEntries(
        next.map((item) => [
          item.id,
          placements[item.id] ?? fallback,
        ]),
      ),
    )
  }

  return (
    <>
      <StemEditor prompt={prompt} onChange={onPromptChange} />
      <fieldset className="grid gap-3">
        <legend className="text-sm font-extrabold">Nhóm đích</legend>
        {targets.map((target, index) => (
          <div
            key={target.id}
            className="grid grid-cols-[1fr_auto] items-end gap-2"
          >
            <label className="grid gap-1 text-sm font-bold">
              Nhóm {index + 1}
              <input
                required
                className="field-input"
                value={target.text}
                onChange={(event) =>
                  setTargets(
                    targets.map((row) =>
                      row.id === target.id
                        ? { ...row, text: event.target.value }
                        : row,
                    ),
                  )
                }
              />
            </label>
            <IconButton
              label={`Xóa nhóm ${index + 1}`}
              disabled={targets.length <= 1}
              onClick={() =>
                setTargets(targets.filter((row) => row.id !== target.id))
              }
            >
              <Trash2 size={17} aria-hidden="true" />
            </IconButton>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          disabled={targets.length >= 20}
          onClick={() => {
            const id = nextRowId(
              'target',
              targets.map((target) => target.id),
            )
            setTargets([...targets, { id, text: '' }])
          }}
        >
          <Plus size={17} aria-hidden="true" />
          Thêm nhóm đích
        </Button>
      </fieldset>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-extrabold">
          Thẻ kéo và nhóm đúng
        </legend>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-2 rounded-xl border border-border bg-white p-3 sm:grid-cols-[1fr_12rem_auto]"
          >
            <label className="grid gap-1 text-sm font-bold">
              Thẻ {index + 1}
              <input
                required
                className="field-input"
                value={item.text}
                onChange={(event) =>
                  setItems(
                    items.map((row) =>
                      row.id === item.id
                        ? { ...row, text: event.target.value }
                        : row,
                    ),
                  )
                }
              />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Nhóm đúng
              <select
                required
                className="field-input"
                value={placements[item.id] ?? ''}
                onChange={(event) =>
                  onAnswerKeyChange({
                    ...placements,
                    [item.id]: event.target.value,
                  })
                }
              >
                <option value="">Chọn nhóm</option>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.text || target.id}
                  </option>
                ))}
              </select>
            </label>
            <IconButton
              label={`Xóa thẻ ${index + 1}`}
              disabled={items.length <= 1}
              onClick={() =>
                setItems(items.filter((row) => row.id !== item.id))
              }
            >
              <Trash2 size={17} aria-hidden="true" />
            </IconButton>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          disabled={items.length >= 30}
          onClick={() => {
            const id = nextRowId(
              'item',
              items.map((item) => item.id),
            )
            setItems([...items, { id, text: '' }])
          }}
        >
          <Plus size={17} aria-hidden="true" />
          Thêm thẻ kéo
        </Button>
      </fieldset>
    </>
  )
}

function StemEditor({
  prompt,
  onChange,
}: {
  prompt: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
}) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      Câu hỏi hoặc yêu cầu
      <textarea
        required
        className="min-h-24 rounded-xl border-2 border-border p-3"
        value={typeof prompt.stem === 'string' ? prompt.stem : ''}
        onChange={(event) =>
          onChange({ ...prompt, stem: event.target.value })
        }
      />
    </label>
  )
}

function RubricEditor({
  rubric,
  onChange,
}: {
  rubric: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
}) {
  const rubricCriteria = criteria(rubric.criteria)
  function setCriteria(next: RubricCriterion[]) {
    onChange({ ...rubric, criteria: next })
  }
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-extrabold">Tiêu chí chấm tay</legend>
      {rubricCriteria.map((criterion, index) => (
        <div
          key={criterion.id}
          className="grid gap-2 rounded-xl border border-border bg-white p-3 sm:grid-cols-[1fr_8rem_auto]"
        >
          <label className="grid gap-1 text-sm font-bold">
            Tiêu chí {index + 1}
            <input
              required
              className="field-input"
              value={criterion.label}
              onChange={(event) =>
                setCriteria(
                  rubricCriteria.map((row) =>
                    row.id === criterion.id
                      ? { ...row, label: event.target.value }
                      : row,
                  ),
                )
              }
            />
          </label>
          <NumberInput
            label="Điểm tối đa"
            value={criterion.maxPoints}
            min={1}
            max={100}
            onChange={(maxPoints) =>
              setCriteria(
                rubricCriteria.map((row) =>
                  row.id === criterion.id ? { ...row, maxPoints } : row,
                ),
              )
            }
          />
          <IconButton
            label={`Xóa tiêu chí ${index + 1}`}
            disabled={rubricCriteria.length <= 1}
            onClick={() =>
              setCriteria(
                rubricCriteria.filter((row) => row.id !== criterion.id),
              )
            }
          >
            <Trash2 size={17} aria-hidden="true" />
          </IconButton>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        disabled={rubricCriteria.length >= 20}
        onClick={() => {
          const id = nextRowId(
            'criterion',
            rubricCriteria.map((criterion) => criterion.id),
          )
          setCriteria([
            ...rubricCriteria,
            { id, label: '', maxPoints: 10 },
          ])
        }}
      >
        <Plus size={17} aria-hidden="true" />
        Thêm tiêu chí
      </Button>
    </fieldset>
  )
}

function ArtifactSources({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) {
  const choices = [
    ['project', 'Dự án trong hệ thống'],
    ['asset', 'Tác phẩm đã lưu'],
    ['upload', 'Tệp tải lên'],
  ] as const
  return (
    <fieldset className="rounded-xl border border-border bg-white p-3">
      <legend className="px-1 text-sm font-extrabold">
        Nguồn sản phẩm được chấp nhận
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {choices.map(([key, label]) => (
          <label key={key} className="flex min-h-11 items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              className="h-5 w-5 accent-sky-500"
              checked={value.includes(key)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...value, key]
                    : value.filter((item) => item !== key),
                )
              }
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input
        required
        type="number"
        min={min}
        max={max}
        className="field-input"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function JsonEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <textarea
        required
        spellCheck={false}
        className="min-h-32 rounded-xl border-2 border-border bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-100 focus:border-sky-400 focus:outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
