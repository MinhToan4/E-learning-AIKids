import { useEffect, useId, useState } from 'react'

type JsonObject = Record<string, unknown>

type Choice = {
  value: string
  label: string
}

const fieldLabels: Record<string, string> = {
  label: 'Tên hiển thị',
  allowedCourseTracks: 'Lộ trình được phép',
  uiPolicy: 'Giao diện học tập',
  density: 'Mật độ nội dung',
  maxChoicesPerStep: 'Số lựa chọn tối đa mỗi bước',
  largeControls: 'Dùng nút điều khiển lớn',
  oneActivityPerScreen: 'Mỗi màn hình một hoạt động',
  showDetailedProgress: 'Hiện tiến độ chi tiết',
  copyPolicy: 'Cách viết nội dung',
  instructionLength: 'Độ dài hướng dẫn',
  readingSupport: 'Hỗ trợ đọc hiểu',
  errorTone: 'Giọng điệu khi báo lỗi',
  actionLabels: 'Nhãn hành động',
  back: 'Quay lại',
  done: 'Hoàn tất',
  next: 'Tiếp theo',
  retry: 'Thử lại',
  submit: 'Nộp bài',
  competencyLevelLabels: 'Tên các mức năng lực',
  no_data: 'Chưa có dữ liệu',
  not_met: 'Chưa đạt',
  developing: 'Đang phát triển',
  achieved: 'Đã đạt',
  permissionPolicy: 'Quyền của học viên',
  canDownloadLessons: 'Được tải bài học',
  canShareCredentials: 'Được chia sẻ chứng nhận',
  canEditProfile: 'Được sửa hồ sơ',
  canRequestReschedule: 'Được yêu cầu đổi lịch',
  requireParentConfirmationFor: 'Hành động cần phụ huynh xác nhận',
  assessmentPolicy: 'Chính sách bài test',
  allowedQuestionTypes: 'Dạng câu hỏi được phép',
  maxShortTextLength: 'Độ dài tối đa câu trả lời ngắn',
  preferOneQuestionPerScreen: 'Ưu tiên mỗi màn hình một câu hỏi',
  courseId: 'Khóa học',
  prerequisiteCourseIds: 'Khóa học tiên quyết',
  minCompletionPercent: 'Tiến độ tối thiểu (%)',
  minFinalScore: 'Điểm cuối khóa tối thiểu',
  allowedAgeBands: 'Nhóm tuổi được phép',
  availableFrom: 'Có hiệu lực từ',
  nextCourseId: 'Khóa học tiếp theo',
  code: 'Mã',
  name: 'Tên',
  description: 'Mô tả',
  expectedDomainCount: 'Số miền năng lực dự kiến',
  sourceReference: 'Nguồn tham chiếu',
  alignmentStatement: 'Tuyên bố đối chiếu',
  disclaimer: 'Tuyên bố giới hạn',
  domains: 'Miền và kỹ năng',
  frameworkId: 'Khung năng lực',
  calculationPolicy: 'Cách tính kết quả',
  aggregation: 'Phương pháp tổng hợp',
  attemptStrategy: 'Lần làm bài được tính',
  notMetBelow: 'Chưa đạt dưới mức',
  achievedFrom: 'Đạt từ mức',
  mappings: 'Ánh xạ bằng chứng',
  kind: 'Loại chứng nhận',
  layout: 'Nội dung hiển thị',
  title: 'Tiêu đề',
  issuerName: 'Đơn vị phát hành',
  accentColor: 'Màu nhấn',
  backgroundUrl: 'Ảnh nền',
  bodyTemplate: 'Nội dung chứng nhận',
  allowDownload: 'Cho phép tải xuống',
  allowShare: 'Cho phép chia sẻ',
  publicDisplayName: 'Hiện tên công khai',
  templateId: 'Mẫu sử dụng',
  requirePassedAssessment: 'Yêu cầu đạt bài test',
  requiredSkillLevels: 'Mức kỹ năng bắt buộc',
  classType: 'Loại lớp',
  maxCapacity: 'Sức chứa tối đa',
  changeDeadlineHours: 'Hạn đổi lịch trước giờ học (giờ)',
  maxReschedulesPerPeriod: 'Số lần đổi lịch tối đa mỗi kỳ',
  periodDays: 'Độ dài chu kỳ (ngày)',
  reminderOffsetsMinutes: 'Các mốc nhắc trước giờ học (phút)',
  reminderChannels: 'Kênh nhắc lịch',
  absencePolicy: 'Quy định vắng học',
  makeupPolicy: 'Quy định học bù',
  footerText: 'Nội dung chân trang',
  showScores: 'Hiện điểm số',
  sectionLabels: 'Tên các mục báo cáo',
  requiredSections: 'Mục bắt buộc trong báo cáo',
  timezone: 'Múi giờ',
  requireApproval: 'Yêu cầu duyệt trước khi phát hành',
  deliveryChannels: 'Kênh gửi báo cáo',
  maxDeliveryAttempts: 'Số lần gửi tối đa',
  status: 'Trạng thái',
  reason: 'Lý do thay đổi',
}

const selectChoices: Record<string, Choice[]> = {
  density: [
    { value: 'airy', label: 'Thoáng' },
    { value: 'balanced', label: 'Cân bằng' },
    { value: 'compact', label: 'Gọn' },
  ],
  instructionLength: [
    { value: 'short', label: 'Ngắn' },
    { value: 'balanced', label: 'Vừa đủ' },
    { value: 'detailed', label: 'Chi tiết' },
  ],
  errorTone: [
    { value: 'gentle', label: 'Nhẹ nhàng' },
    { value: 'direct', label: 'Trực tiếp' },
  ],
  status: [
    { value: 'draft', label: 'Bản nháp' },
    { value: 'published', label: 'Công bố' },
  ],
  aggregation: [
    { value: 'weighted_average', label: 'Trung bình có trọng số' },
  ],
  attemptStrategy: [
    { value: 'latest', label: 'Lần gần nhất' },
    { value: 'highest', label: 'Lần có kết quả cao nhất' },
  ],
  kind: [
    { value: 'certificate', label: 'Chứng nhận' },
    { value: 'badge', label: 'Huy hiệu' },
  ],
  classType: [
    { value: 'one_to_one', label: 'Một kèm một' },
    { value: 'group', label: 'Lớp nhóm' },
  ],
}

const arrayChoices: Record<string, Choice[]> = {
  allowedCourseTracks: [
    { value: 'L1', label: 'L1 · 6–8 tuổi' },
    { value: 'L2', label: 'L2 · 9–11 tuổi' },
  ],
  allowedAgeBands: [
    { value: '6_8', label: '6–8 tuổi' },
    { value: '9_11', label: '9–11 tuổi' },
    { value: '11_plus', label: '12–17 tuổi' },
  ],
  allowedQuestionTypes: [
    { value: 'single_choice', label: 'Một đáp án' },
    { value: 'multiple_choice', label: 'Nhiều đáp án' },
    { value: 'drag_drop', label: 'Kéo thả' },
    { value: 'short_text', label: 'Trả lời ngắn' },
    { value: 'ordering', label: 'Sắp xếp' },
    { value: 'artifact', label: 'Nộp sản phẩm' },
  ],
  reminderChannels: [
    { value: 'in_app', label: 'Trong ứng dụng' },
    { value: 'push', label: 'Thông báo đẩy' },
    { value: 'email', label: 'Email' },
    { value: 'zalo', label: 'Zalo' },
  ],
  deliveryChannels: [
    { value: 'in_app', label: 'Trong ứng dụng' },
    { value: 'push', label: 'Thông báo đẩy' },
    { value: 'email', label: 'Email' },
    { value: 'zalo', label: 'Zalo' },
  ],
  requiredSections: [
    { value: 'student', label: 'Học viên' },
    { value: 'courses', label: 'Khóa học' },
    { value: 'assessments', label: 'Bài test' },
    { value: 'competency', label: 'Năng lực' },
    { value: 'portfolio', label: 'Tác phẩm' },
    { value: 'teacher_feedback', label: 'Nhận xét giáo viên' },
    { value: 'strengths', label: 'Điểm mạnh' },
    { value: 'development', label: 'Nội dung cần phát triển' },
    { value: 'next_steps', label: 'Bước tiếp theo' },
    { value: 'credentials', label: 'Chứng nhận' },
  ],
}

const multilineFields = new Set([
  'description',
  'alignmentStatement',
  'disclaimer',
  'bodyTemplate',
  'footerText',
  'reason',
])

const numericArrayFields = new Set(['reminderOffsetsMinutes'])
const nullableNumberFields = new Set(['minFinalScore'])
const structuredCollectionFields = new Set(['domains', 'mappings'])
const dictionaryFields = new Set([
  'absencePolicy',
  'makeupPolicy',
  'requiredSkillLevels',
  'sectionLabels',
])

export function labelFor(key: string) {
  return (
    fieldLabels[key] ??
    key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (character) => character.toUpperCase())
  )
}

export function replaceValue(
  source: JsonObject,
  path: string[],
  nextValue: unknown,
): JsonObject {
  const [head, ...tail] = path
  if (!head) return source
  if (tail.length === 0) return { ...source, [head]: nextValue }
  const child = source[head]
  return {
    ...source,
    [head]: replaceValue(
      child !== null && typeof child === 'object' && !Array.isArray(child)
        ? (child as JsonObject)
        : {},
      tail,
      nextValue,
    ),
  }
}

export function GuidedConfigFields({
  value,
  onChange,
}: {
  value: JsonObject
  onChange: (next: JsonObject) => void
}) {
  return (
    <div className="grid gap-4">
      {Object.entries(value).map(([key, fieldValue]) => (
        <ConfigField
          key={key}
          fieldKey={key}
          path={[key]}
          value={fieldValue}
          onChange={(path, nextValue) =>
            onChange(replaceValue(value, path, nextValue))
          }
        />
      ))}
    </div>
  )
}

function ConfigField({
  fieldKey,
  path,
  value,
  onChange,
}: {
  fieldKey: string
  path: string[]
  value: unknown
  onChange: (path: string[], value: unknown) => void
}) {
  const generatedId = useId().replace(/:/g, '')
  const inputId = `config-${generatedId}`
  const label = labelFor(fieldKey)

  if (typeof value === 'boolean') {
    return (
      <label
        htmlFor={inputId}
        className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold"
      >
        <input
          id={inputId}
          type="checkbox"
          className="h-5 w-5 accent-brand-500"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
        />
        {label}
      </label>
    )
  }

  if (typeof value === 'number') {
    return (
      <FieldShell label={label} inputId={inputId}>
        <input
          id={inputId}
          type="number"
          className="field-input"
          value={value}
          onChange={(event) =>
            onChange(path, Number(event.target.value || 0))
          }
        />
      </FieldShell>
    )
  }

  if (typeof value === 'string') {
    const choices = selectChoices[fieldKey]
    if (choices) {
      return (
        <FieldShell label={label} inputId={inputId}>
          <select
            id={inputId}
            className="field-input"
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
          >
            {choices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </FieldShell>
      )
    }
    if (fieldKey === 'accentColor') {
      return (
        <FieldShell label={label} inputId={inputId}>
          <div className="grid grid-cols-[3.5rem_1fr] gap-2">
            <input
              id={inputId}
              type="color"
              className="min-h-11 w-full rounded-xl border-2 border-border bg-white p-1"
              value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#6D5EFC'}
              onChange={(event) => onChange(path, event.target.value)}
            />
            <input
              aria-label={`${label} dạng mã màu`}
              className="field-input font-mono"
              value={value}
              onChange={(event) => onChange(path, event.target.value)}
            />
          </div>
        </FieldShell>
      )
    }
    const Control = multilineFields.has(fieldKey) ? 'textarea' : 'input'
    return (
      <FieldShell label={label} inputId={inputId}>
        <Control
          id={inputId}
          className={
            Control === 'textarea'
              ? 'min-h-24 rounded-xl border-2 border-border p-3'
              : 'field-input'
          }
          value={value}
          onChange={(event) => onChange(path, event.target.value)}
        />
      </FieldShell>
    )
  }

  if (value === null) {
    return (
      <FieldShell
        label={label}
        inputId={inputId}
        help="Để trống nếu chưa áp dụng."
      >
        <input
          id={inputId}
          type={nullableNumberFields.has(fieldKey) ? 'number' : 'text'}
          className="field-input"
          value=""
          onChange={(event) =>
            onChange(
              path,
              event.target.value
                ? nullableNumberFields.has(fieldKey)
                  ? Number(event.target.value)
                  : event.target.value
                : null,
            )
          }
        />
      </FieldShell>
    )
  }

  if (Array.isArray(value)) {
    const choices = arrayChoices[fieldKey]
    if (choices) {
      const selected = new Set(value.map(String))
      return (
        <fieldset className="rounded-2xl border border-border bg-page p-4">
          <legend className="px-1 text-sm font-extrabold">{label}</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {choices.map((choice) => (
              <label
                key={choice.value}
                className="flex min-h-11 items-center gap-3 rounded-xl bg-white px-3 text-sm font-bold"
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-brand-500"
                  checked={selected.has(choice.value)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selected, choice.value]
                      : [...selected].filter((item) => item !== choice.value)
                    onChange(path, next)
                  }}
                />
                {choice.label}
              </label>
            ))}
          </div>
        </fieldset>
      )
    }
    if (
      structuredCollectionFields.has(fieldKey) ||
      value.some(
        (item) =>
          item !== null && typeof item === 'object' && !Array.isArray(item),
      )
    ) {
      return (
        <StructuredValueField
          label={label}
          value={value}
          onChange={(next) => onChange(path, next)}
        />
      )
    }
    return (
      <FieldShell
        label={label}
        inputId={inputId}
        help="Mỗi dòng là một giá trị."
      >
        <textarea
          id={inputId}
          className="min-h-24 rounded-xl border-2 border-border p-3"
          value={value.join('\n')}
          onChange={(event) => {
            const rows = event.target.value
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
            onChange(
              path,
              numericArrayFields.has(fieldKey)
                ? rows.map((item) => Number(item)).filter(Number.isFinite)
                : rows,
            )
          }}
        />
      </FieldShell>
    )
  }

  if (typeof value === 'object') {
    const objectValue = value as JsonObject
    if (
      dictionaryFields.has(fieldKey) ||
      Object.keys(objectValue).length === 0
    ) {
      return (
        <StructuredValueField
          label={label}
          value={objectValue}
          onChange={(next) => onChange(path, next)}
        />
      )
    }
    return (
      <fieldset className="grid gap-3 rounded-2xl border border-border bg-page p-4">
        <legend className="px-1 text-sm font-extrabold">{label}</legend>
        {Object.entries(objectValue).map(([childKey, childValue]) => (
          <ConfigField
            key={childKey}
            fieldKey={childKey}
            path={[...path, childKey]}
            value={childValue}
            onChange={onChange}
          />
        ))}
      </fieldset>
    )
  }

  return null
}

function StructuredValueField({
  label,
  value,
  onChange,
}: {
  label: string
  value: unknown
  onChange: (next: unknown) => void
}) {
  const inputId = `structured-${useId().replace(/:/g, '')}`
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setText(JSON.stringify(value, null, 2))
    setError(null)
  }, [value])

  function parseText() {
    const parsed: unknown = JSON.parse(text)
    if (Array.isArray(value) !== Array.isArray(parsed)) {
      throw new Error(
        Array.isArray(value)
          ? 'Nội dung phải là một danh sách.'
          : 'Nội dung phải là một đối tượng.',
      )
    }
    if (
      !Array.isArray(value) &&
      (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    ) {
      throw new Error('Nội dung phải là một đối tượng.')
    }
    return parsed
  }

  function validate(control: HTMLTextAreaElement) {
    try {
      parseText()
      control.setCustomValidity('')
      setError(null)
      return true
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : 'Nội dung chưa đúng định dạng.'
      control.setCustomValidity(message)
      setError(message)
      return false
    }
  }

  function commit(control: HTMLTextAreaElement) {
    if (!validate(control)) return
    onChange(parseText())
  }

  return (
    <FieldShell
      label={`${label} · cấu trúc nâng cao`}
      inputId={inputId}
      help="Chỉ phần dữ liệu có cấu trúc phức tạp này cần nhập JSON."
      error={error}
    >
      <textarea
        id={inputId}
        spellCheck={false}
        className="min-h-32 rounded-xl border-2 border-border bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-100 focus:border-brand-400 focus:outline-none"
        value={text}
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          setText(event.target.value)
          event.currentTarget.setCustomValidity('')
          setError(null)
        }}
        onBlur={(event) => commit(event.currentTarget)}
      />
    </FieldShell>
  )
}

function FieldShell({
  label,
  inputId,
  help,
  error,
  children,
}: {
  label: string
  inputId: string
  help?: string
  error?: string | null
  children: React.ReactNode
}) {
  const helpId = `${inputId}-help`
  const errorId = `${inputId}-error`
  return (
    <div className="grid gap-1">
      <label htmlFor={inputId} className="text-sm font-bold">
        {label}
      </label>
      {children}
      {help && (
        <p id={helpId} className="text-xs text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-bold text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
