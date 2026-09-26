import React, { useState, useMemo, useCallback } from 'react'
import { BookOpen, Save, CheckCircle2, X, ClipboardCopy } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeNotebookConfig, CreativeNotebookField } from '../types'

export interface CreativeNotebookEngineProps extends EngineProps {
  className?: string
  notebookConfig?: CreativeNotebookConfig
  onSubmitNotebook?: (content: string, structuredData?: Record<string, string>) => void
  onSaveDraft?: (content: string, structuredData?: Record<string, string>) => void
}

const DEFAULT_NOTEBOOK_FIELDS: CreativeNotebookField[] = [
  {
    id: 'section-1',
    label: '1. Khởi đầu câu chuyện / Ý tưởng chính',
    prefix: 'Ý tưởng: ',
    placeholder: 'Ý tưởng của con là gì? Hãy chia sẻ thật chi tiết nhé...',
    rows: 1,
  },
  {
    id: 'section-2',
    label: '2. Chi tiết và diễn biến',
    prefix: 'Chi tiết: ',
    placeholder: 'Có chuyện gì đặc biệt xảy ra tiếp theo?...',
    rows: 1,
  },
  {
    id: 'section-3',
    label: '3. Kết thúc & Cảm xúc cất Ba Lô',
    prefix: 'Kết thúc: ',
    placeholder: 'Bài học hoặc cảm xúc đáng nhớ của con...',
    rows: 1,
  },
]

interface StageTheme {
  cardBg: string
  cardBorder: string
  badgeBg: string
  badgeText: string
  titleColor: string
  prefixTextColor: string
  subtextColor: string
}

const STAGE_THEMES: StageTheme[] = [
  // 0: Sky
  {
    cardBg: 'bg-sky-50/70',
    cardBorder: 'border-sky-200/90',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    titleColor: 'text-sky-950',
    prefixTextColor: 'text-sky-700',
    subtextColor: 'text-sky-800',
  },
  // 1: Rose
  {
    cardBg: 'bg-rose-50/70',
    cardBorder: 'border-rose-200/90',
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    titleColor: 'text-rose-950',
    prefixTextColor: 'text-rose-600',
    subtextColor: 'text-rose-800',
  },
  // 2: Emerald
  {
    cardBg: 'bg-emerald-50/70',
    cardBorder: 'border-emerald-200/90',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    titleColor: 'text-emerald-950',
    prefixTextColor: 'text-emerald-700',
    subtextColor: 'text-emerald-800',
  },
  // 3: Amber
  {
    cardBg: 'bg-amber-50/70',
    cardBorder: 'border-amber-200/90',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    titleColor: 'text-amber-950',
    prefixTextColor: 'text-amber-700',
    subtextColor: 'text-amber-800',
  },
  // 4: Purple
  {
    cardBg: 'bg-purple-50/70',
    cardBorder: 'border-purple-200/90',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    titleColor: 'text-purple-950',
    prefixTextColor: 'text-purple-700',
    subtextColor: 'text-purple-800',
  },
  // 5: Indigo
  {
    cardBg: 'bg-indigo-50/70',
    cardBorder: 'border-indigo-200/90',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-white',
    titleColor: 'text-indigo-950',
    prefixTextColor: 'text-indigo-700',
    subtextColor: 'text-indigo-800',
  },
  // 6: Pink
  {
    cardBg: 'bg-pink-50/70',
    cardBorder: 'border-pink-200/90',
    badgeBg: 'bg-pink-500',
    badgeText: 'text-white',
    titleColor: 'text-pink-950',
    prefixTextColor: 'text-pink-700',
    subtextColor: 'text-pink-800',
  },
]

// Hàm xác định tiêu đề ngắn viết hoa (MUỐN, CẢN, LÀM, KẾT, TÊN...)
const getShortTitle = (field: CreativeNotebookField): string => {
  if (field.prefix && field.prefix.includes(':')) {
    const beforeColon = field.prefix.slice(0, field.prefix.indexOf(':')).trim()
    const cleaned = beforeColon.replace(/^\d+[\.\)]\s*/, '').trim()
    if (cleaned) return cleaned.toUpperCase()
  }

  let label = field.label.replace(/^\d+[\.\)]\s*/, '').trim()
  const parenIdx = label.indexOf('(')
  if (parenIdx !== -1) {
    label = label.slice(0, parenIdx).trim()
  }
  const slashIdx = label.indexOf('/')
  if (slashIdx !== -1) {
    label = label.slice(0, slashIdx).trim()
  }
  const dashIdx = label.indexOf('-')
  if (dashIdx !== -1) {
    label = label.slice(0, dashIdx).trim()
  }

  const words = label.split(/\s+/)
  if (words.length > 2) {
    label = words.slice(0, 2).join(' ')
  }

  return label.toUpperCase() || 'Ý TƯỞNG'
}

// Hàm xác định Tiền tố hiển thị in đậm trong Khối 3 (Muốn: , Cản: , Tên: ...)
const getFieldPrefixLabel = (field: CreativeNotebookField, shortTitle: string): string => {
  if (field.prefix && field.prefix.includes(':')) {
    const beforeColon = field.prefix.slice(0, field.prefix.indexOf(':')).trim()
    const cleaned = beforeColon.replace(/^\d+[\.\)]\s*/, '').trim()
    const cap = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    return `${cap}: `
  }
  if (field.prefix) {
    const cleaned = field.prefix.trim().replace(/^\d+[\.\)]\s*/, '')
    return `${cleaned}: `
  }
  const cap = shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1).toLowerCase()
  return `${cap}: `
}

// Hàm xác định Placeholder hiển thị inline trong Khối 3 (bạn ấy muốn ......, nhưng ......)
const getFieldInlinePlaceholder = (field: CreativeNotebookField): string => {
  if (field.prefix && field.prefix.includes(':')) {
    const afterColon = field.prefix.slice(field.prefix.indexOf(':') + 1).trim()
    if (afterColon) {
      return afterColon.endsWith('...') || afterColon.endsWith('......')
        ? afterColon
        : `${afterColon} ......`
    }
  }
  if (field.placeholder) {
    return field.placeholder
  }
  return 'điền tiếp phần của con nhé...'
}

// Kiểm tra trường quan trọng (đính icon ⭐)
const checkIsImportant = (field: CreativeNotebookField): boolean => {
  if (field.badge) {
    const b = field.badge.toLowerCase()
    if (
      b.includes('quan trọng') ||
      b.includes('thử thách') ||
      b.includes('bắt buộc') ||
      b.includes('sợ') ||
      b.includes('dở')
    ) {
      return true
    }
  }
  if (
    field.id.includes('obstacle') ||
    field.id.includes('fears') ||
    field.id.includes('weakness')
  ) {
    return true
  }
  return false
}

export const CreativeNotebookEngine: React.FC<CreativeNotebookEngineProps> = ({
  className,
  lessonId: _lessonId,
  currentPrompt = '',
  onPromptChange,
  notebookConfig,
  onSubmitNotebook,
  onSaveDraft,
}) => {
  // Config bài học
  const title = notebookConfig?.notebookTitle || 'Sổ Tay Sáng Tạo Ba Lô'
  const advice =
    notebookConfig?.akiAdvice ||
    'Hãy viết bằng chính suy nghĩ của con! Câu chuyện này là của riêng con!'
  const backpackTag =
    notebookConfig?.backpackTag ||
    notebookConfig?.backpackCategory ||
    'Hồ sơ nhân vật'
  const fields = useMemo(() => {
    return notebookConfig?.fields && notebookConfig.fields.length > 0
      ? notebookConfig.fields
      : DEFAULT_NOTEBOOK_FIELDS
  }, [notebookConfig?.fields])

  const sampleTemplate =
    notebookConfig?.sampleTemplate ||
    'Muốn: bạn ấy muốn hái bông hoa tuyết trên đỉnh núi cao\nCản: nhưng dòng suối băng lạnh buốt và bạn ấy rất sợ tối\nLàm: bạn ấy thử làm ván trượt và mang ngọn đuốc sưởi ấm\nKết: cuối cùng đã hái được hoa tuyết thành công'
  const sampleHelperTitle =
    notebookConfig?.sampleHelperTitle || 'Kịch bản câu chuyện mẫu'
  const challengeSummary = notebookConfig?.challengeSummary || []
  const checklist = notebookConfig?.checklist || []

  // Trạng thái các mục tiêu chí tự kiểm tra
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const handleToggleChecklistItem = (id: string) => {
    playInstantSound('click')
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Nhận diện bài học theo dạng Chặng hay theo Ô
  const isStageMode = useMemo(() => {
    const t = title.toLowerCase()
    return (
      t.includes('chặng') ||
      fields.some(
        (f) =>
          f.id.toLowerCase().includes('stage') ||
          f.label.toLowerCase().includes('chặng')
      )
    )
  }, [title, fields])

  const stageUnitName = isStageMode ? 'chặng' : 'ô'
  const stageUnitCapitalized = isStageMode ? 'Chặng' : 'Ô'

  // Tiêu đề Profile Card: Hồ sơ mẫu hoặc Kịch bản mẫu
  const profileCardTitle = isStageMode
    ? 'KỊCH BẢN MẪU CỦA AIKI'
    : 'HỒ SƠ MẪU CỦA AIKI'

  // Icon đại diện Profile Card
  const profileIcon = useMemo(() => {
    const textToCheck = `${title} ${sampleHelperTitle} ${advice}`.toLowerCase()
    const hasCharKeywords =
      textToCheck.includes('nhân vật') ||
      textToCheck.includes('sóc') ||
      textToCheck.includes('bông') ||
      fields.some(
        (f) =>
          f.id.toLowerCase().includes('char') ||
          f.label.toLowerCase().includes('nhân vật') ||
          f.label.toLowerCase().includes('tên')
      )
    if (hasCharKeywords && !isStageMode) {
      return '🐿️'
    }
    if (isStageMode) {
      return '📋'
    }
    return '🎒'
  }, [title, sampleHelperTitle, advice, fields, isStageMode])

  // Phân giải sampleTemplate thành từng giá trị mẫu theo field
  const sampleValues = useMemo(() => {
    const lines = sampleTemplate
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const map: Record<string, string> = {}

    fields.forEach((field, idx) => {
      if (idx < lines.length) {
        const line = lines[idx]
        if (line.includes(':')) {
          const colonIdx = line.indexOf(':')
          map[field.id] = line.slice(colonIdx + 1).trim()
        } else {
          map[field.id] = line
        }
      } else {
        map[field.id] = ''
      }
    })
    return map
  }, [fields, sampleTemplate])

  // Modal xem câu mẫu
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false)

  // Trạng thái đã lưu bản nháp
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [showCelebrateStars, setShowCelebrateStars] = useState<boolean>(false)

  // Dữ liệu từng ô
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    fields.forEach((f) => {
      initial[f.id] = f.defaultValue || ''
    })
    return initial
  })

  // Biên dịch dữ liệu form thành văn bản hoàn chỉnh
  const compileNotebookContent = useCallback(
    (data: Record<string, string>) => {
      return fields
        .map((field) => {
          const val = (data[field.id] || '').trim()
          if (!val) return ''

          if (field.prefix) {
            // Nếu giá trị đã bắt đầu bằng tiền tố đầy đủ
            if (val.toLowerCase().startsWith(field.prefix.toLowerCase().trim())) {
              return val
            }
            // Nếu prefix có dạng "Muốn: bạn ấy muốn " và val đã bắt đầu bằng "bạn ấy muốn"
            if (field.prefix.includes(':')) {
              const before = field.prefix.slice(0, field.prefix.indexOf(':')).trim()
              const after = field.prefix.slice(field.prefix.indexOf(':') + 1).trim()
              if (after && val.toLowerCase().startsWith(after.toLowerCase())) {
                return `${before}: ${val}`
              }
            }
            return `${field.prefix}${val}`
          }

          return `【${field.label}】: ${val}`
        })
        .filter(Boolean)
        .join('\n')
    },
    [fields]
  )

  // Thay đổi input ở một ô
  const handleFieldChange = (fieldId: string, value: string) => {
    const nextData = { ...formData, [fieldId]: value }
    setFormData(nextData)
    const compiled = compileNotebookContent(nextData)
    onPromptChange?.(compiled, [])
  }

  // Lưu bản nháp
  const handleSaveDraftAction = () => {
    playInstantSound('click')
    const content = compileNotebookContent(formData)
    const timeStr = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    setDraftSavedAt(`Đã lưu lúc ${timeStr}`)
    onSaveDraft?.(content, formData)
  }

  // Nộp bài & Cất vào Ba Lô
  const handleSubmitAction = () => {
    playInstantSound('star')
    setShowCelebrateStars(true)

    const content = compileNotebookContent(formData)
    onSubmitNotebook?.(content, formData)

    setTimeout(() => {
      setShowCelebrateStars(false)
    }, 2000)
  }

  // Áp dụng khung kịch bản mẫu vào bài
  const handleApplySampleTemplate = () => {
    playInstantSound('click')
    const lines = sampleTemplate
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const nextData: Record<string, string> = { ...formData }

    fields.forEach((field, idx) => {
      if (idx < lines.length) {
        let lineVal = lines[idx]
        if (
          field.prefix &&
          lineVal.toLowerCase().startsWith(field.prefix.toLowerCase().trim())
        ) {
          lineVal = lineVal.slice(field.prefix.length).trim()
        } else if (lineVal.includes(':')) {
          const colonIdx = lineVal.indexOf(':')
          const afterColon = lineVal.slice(colonIdx + 1).trim()
          if (field.prefix && field.prefix.includes(':')) {
            const fieldAfter = field.prefix
              .slice(field.prefix.indexOf(':') + 1)
              .trim()
            if (
              fieldAfter &&
              afterColon.toLowerCase().startsWith(fieldAfter.toLowerCase())
            ) {
              lineVal = afterColon.slice(fieldAfter.length).trim()
            } else {
              lineVal = afterColon
            }
          } else {
            lineVal = afterColon
          }
        }
        nextData[field.id] = lineVal
      }
    })

    setFormData(nextData)
    const compiled = compileNotebookContent(nextData)
    onPromptChange?.(compiled, [])
    setIsSampleModalOpen(false)
  }

  // Tiến độ viết (số ô/chặng đã điền)
  const completedCount = useMemo(() => {
    return fields.filter((f) => (formData[f.id] || '').trim().length > 0).length
  }, [fields, formData])

  // Danh sách tóm tắt thử thách cho Khối 1
  const summaryItems = useMemo(() => {
    if (challengeSummary && challengeSummary.length > 0) {
      return challengeSummary
    }
    if (checklist && checklist.length > 0) {
      return checklist.map((item) => item.label)
    }
    if (advice) {
      return [advice]
    }
    return ['Viết các câu trả lời sáng tạo bằng chính suy nghĩ của con.']
  }, [challengeSummary, checklist, advice])

  // Highlight các từ khóa quan trọng trong Tóm tắt thử thách
  const renderFormattedSummaryText = (text: string) => {
    const regex =
      /(MUỐN\s*–\s*CẢN\s*–\s*LÀM\s*–\s*KẾT|MUỐN|CẢN|LÀM|KẾT|TÊN|THÍCH|SỢ|GIỎI|DỞ|ƯỚC MƠ|"[^"]+"|[0-9]+\s*chặng|[0-9]+\s*dòng)/g

    const parts = text.split(regex)
    return parts.map((part, idx) => {
      if (regex.test(part)) {
        return (
          <strong key={idx} className="text-amber-950 font-bold">
            {part}
          </strong>
        )
      }
      return <span key={idx}>{part}</span>
    })
  }

  return (
    <div
      data-testid="creative-notebook-engine"
      className={cn("w-full flex flex-col md:grid md:grid-cols-12 gap-3.5 sm:gap-4 rounded-3xl bg-linear-to-b from-amber-50/50 via-white to-sky-50/30 p-2 sm:p-4 border border-amber-200/60 text-left relative overflow-hidden items-start", className)}
    >
      {/* Hiệu ứng pháo hoa sao bay khi nộp bài */}
      {showCelebrateStars && (
        <div
          data-testid="celebrate-stars-burst"
          className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center bg-amber-500/10 backdrop-blur-xs transition-all duration-500"
        >
          <div className="relative flex items-center justify-center animate-bounce">
            <span className="text-6xl sm:text-7xl drop-shadow-lg">✨</span>
            <span className="absolute -top-6 -left-8 text-4xl animate-pulse">⭐</span>
            <span className="absolute -bottom-6 -right-8 text-4xl animate-pulse">🌟</span>
            <span className="absolute top-8 -right-6 text-3xl">🎒</span>
          </div>
        </div>
      )}

      {/* ── BANNER LỜI DẶN DÒ CỦA AIKI (HIỂN THỊ ĐẦU SỔ TAY) ── */}
      {advice && (
        <div
          data-testid="aki-advice-banner"
          className="w-full md:col-span-12 rounded-2xl sm:rounded-3xl border border-amber-300/80 bg-linear-to-r from-amber-100/90 via-orange-50/70 to-amber-50/90 p-3 sm:p-4 shadow-2xs flex items-start sm:items-center gap-3 sm:gap-4 relative overflow-hidden"
        >
          <div className="size-10 sm:size-12 rounded-2xl bg-amber-200/90 border border-amber-300/80 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-clay-xs select-none">
            🦉
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-black text-amber-950 text-xs sm:text-sm tracking-wide uppercase">
                Lời dặn dò của AIKI
              </span>
              <span
                data-testid="aki-banner-backpack-badge"
                className="bg-amber-200/90 text-amber-900 border border-amber-400/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              >
                🎒 {backpackTag}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
              {advice}
            </p>
          </div>
        </div>
      )}

      {/* ── CỘT TRÁI: HƯỚNG DẪN & MẪU THAM KHẢO (5/12 CỘT ~ 42%) ── */}
      <div className="w-full md:col-span-5 flex flex-col gap-3">
        {/* KHỐI 1: 📌 TÓM TẮT THỬ THÁCH */}
        <div
          data-testid="challenge-summary-card"
          className="rounded-2xl sm:rounded-3xl border border-amber-200/90 bg-white/95 p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-full bg-amber-100 flex items-center justify-center text-sm shrink-0">
                📌
              </span>
              <h3 className="font-black text-amber-950 text-sm sm:text-base tracking-wide uppercase">
                TÓM TẮT THỬ THÁCH
              </h3>
            </div>
            <span className="bg-amber-100/90 text-amber-900 border border-amber-300/80 text-xs font-bold px-3 py-1 rounded-full shrink-0">
              AIKI vừa dặn đấy!
            </span>
          </div>

          {/* Body: Danh sách gạch đầu dòng gọn gàng, súc tích */}
          <div className="flex flex-col gap-2 pt-0.5">
            {summaryItems.map((item, idx) => (
              <div
                key={idx}
                data-testid={`challenge-summary-item-${idx}`}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
              >
                <span className="size-5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0 font-medium">
                  {renderFormattedSummaryText(item)}
                </div>
              </div>
            ))}
          </div>

          {/* Bảng tiêu chí tự kiểm tra (Checklist) */}
          {checklist && checklist.length > 0 && (
            <div
              data-testid="notebook-checklist-section"
              className="mt-2 pt-2.5 border-t border-amber-200/80 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                  <h4 className="font-black text-amber-950 text-xs sm:text-sm tracking-wide uppercase">
                    TIÊU CHÍ TỰ KIỂM TRA
                  </h4>
                </div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {checklist.length} tiêu chí
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {checklist.map((checkItem) => {
                  const isChecked = checkedItems[checkItem.id] ?? false
                  return (
                    <label
                      key={checkItem.id}
                      data-testid={`checklist-item-${checkItem.id}`}
                      className={cn(
                        "flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none text-xs sm:text-sm",
                        isChecked
                          ? "bg-emerald-50/60 border-emerald-300/80 text-emerald-950"
                          : "bg-amber-50/40 border-amber-200/60 text-slate-700 hover:bg-amber-50/80"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleChecklistItem(checkItem.id)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "size-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 text-xs font-black transition-all",
                          isChecked
                            ? "bg-emerald-500 border-emerald-600 text-white shadow-2xs"
                            : "bg-white border-amber-300 text-transparent"
                        )}
                      >
                        ✓
                      </span>
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "font-medium leading-relaxed block",
                            isChecked && "line-through text-slate-500 font-normal"
                          )}
                        >
                          {checkItem.label}
                        </span>
                        {checkItem.hint && (
                          <span className="text-[11px] text-slate-500 italic block mt-0.5">
                            {checkItem.hint}
                          </span>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* KHỐI 2: 🐿️ HỒ SƠ MẪU CỦA AIKI / KỊCH BẢN MẪU CỦA AIKI (PROFILE CARD) */}
        <div
          data-testid="instructions-card"
          className="rounded-2xl sm:rounded-3xl border border-sky-200/90 bg-white/95 p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5"
        >
          {/* Header của Profile Card */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="size-8 rounded-2xl bg-sky-100 flex items-center justify-center text-base shrink-0 shadow-2xs">
                {profileIcon}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sky-950 text-sm sm:text-base tracking-wide uppercase">
                  {profileCardTitle}
                </h3>
                <span className="bg-sky-100/90 text-sky-900 border border-sky-300/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                  Mẫu tham khảo
                </span>
              </div>
            </div>

            {/* Nút tiện ích 1-chạm: Dùng mẫu này */}
            <button
              type="button"
              data-testid="btn-use-sample-quick"
              onClick={handleApplySampleTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-clay-xs border-b-2 border-amber-700 hover:border-amber-800 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Bấm để tự động điền toàn bộ mẫu sang Ô Viết Của Con"
            >
              <span>📋 Dùng mẫu này</span>
            </button>
          </div>

          {/* Dòng phụ (Subtitle) */}
          <p className="text-xs text-slate-500 font-medium">
            Bé tham khảo mẫu của AIKI rồi gõ tiếp hoặc bấm vào từng dòng để viết nhé!
          </p>

          {/* Body của Profile Card: Danh sách các dòng mẫu */}
          <div className="flex flex-col gap-2">
            {fields.map((field, idx) => {
              const theme = STAGE_THEMES[idx % STAGE_THEMES.length]
              const shortTitle = getShortTitle(field)
              const prefixLabel = getFieldPrefixLabel(field, shortTitle)
              const labelText = isStageMode
                ? shortTitle
                : prefixLabel.replace(/:\s*$/, '')
              const isImportant = checkIsImportant(field)
              const sampleVal = sampleValues[field.id] || ''

              return (
                <div
                  key={field.id}
                  data-testid={`instruction-card-${field.id}`}
                  title={field.label}
                  onClick={(e) => {
                    const rootEl = e.currentTarget.closest('[data-testid="creative-notebook-engine"]') || document
                    const inputEl = (rootEl.querySelector(`#field-${field.id}`) || rootEl.querySelector(`[data-testid="notebook-field-${field.id}"]`)) as HTMLElement | null
                    inputEl?.focus()
                  }}
                  className={cn(
                    'flex items-start gap-2.5 p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer hover:bg-slate-50/90 active:scale-[0.99]',
                    theme.cardBg,
                    theme.cardBorder
                  )}
                >
                  {/* Badge số thứ tự: [Ô 1], [Chặng 1] */}
                  <span
                    className={cn(
                      'text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 mt-0.5',
                      theme.badgeBg,
                      theme.badgeText
                    )}
                  >
                    {stageUnitCapitalized} {idx + 1}
                  </span>

                  {/* Nội dung thuộc tính và mẫu */}
                  <div className="flex-1 min-w-0 text-xs sm:text-sm leading-relaxed">
                    {/* Nhãn thuộc tính in đậm màu sắc tương ứng */}
                    <span className={cn('font-black mr-1.5', theme.prefixTextColor)}>
                      {labelText}
                      {isImportant && (
                        <span
                          data-testid={`field-star-${field.id}`}
                          className="text-amber-500 ml-1 inline-block select-none"
                          title="Quan trọng"
                        >
                          ⭐
                        </span>
                      )}
                      :
                    </span>

                    {/* Giá trị mẫu cụ thể */}
                    <span className={cn('font-medium text-slate-700 break-words', theme.subtextColor)}>
                      {sampleVal || '......'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CỘT PHẢI: KHU VỰC VIẾT BÀI CỦA HỌC SINH (7/12 CỘT ~ 58%) ── */}
      <div className="w-full md:col-span-7 flex flex-col gap-3">
        {/* KHỐI 3: 🎒 Ô VIẾT CỦA CON */}
        <div
          data-testid="student-writing-card"
          className="rounded-2xl sm:rounded-3xl border border-purple-200/90 bg-white/95 p-3.5 sm:p-5 shadow-2xs flex flex-col gap-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-7 rounded-full bg-purple-100 flex items-center justify-center text-sm shrink-0">
                🎒
              </span>
              <h3 className="font-black text-purple-950 text-sm sm:text-base tracking-wide uppercase">
                Ô VIẾT CỦA CON
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                data-testid="backpack-tag-badge"
                className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0"
              >
                🎒 {backpackTag}
              </span>
              <span
                data-testid="notebook-title"
                className="text-xs text-purple-700 font-bold truncate max-w-[200px] sm:max-w-none"
              >
                “{title}”
              </span>
            </div>
          </div>

          {/* Khung giấy viết */}
          <div className="border-2 border-dashed border-purple-200 rounded-2xl p-3 sm:p-4 bg-purple-50/20 flex flex-col gap-3">
            {fields.map((field, idx) => {
              const theme = STAGE_THEMES[idx % STAGE_THEMES.length]
              const shortTitle = getShortTitle(field)
              const prefixLabel = getFieldPrefixLabel(field, shortTitle)
              const inlinePlaceholder = getFieldInlinePlaceholder(field)
              const hasMultipleRows = Boolean(field.rows && field.rows > 1)

              return (
                <div
                  key={field.id}
                  data-testid={`student-field-card-${field.id}`}
                  className={cn(
                    "flex flex-col gap-2 p-3 sm:p-3.5 rounded-2xl border transition-all shadow-2xs bg-white/95",
                    theme.cardBorder,
                    "hover:border-purple-300 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-300"
                  )}
                >
                  {/* Dòng 1: STT ô / Badge màu (Ô 1, Ô 2... Ô 7) + Tiêu đề nhãn field.label + Badge field.badge nếu có */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={cn(
                          "text-[11px] font-black px-2 py-0.5 rounded-full shrink-0",
                          theme.badgeBg,
                          theme.badgeText
                        )}
                      >
                        {stageUnitCapitalized} {idx + 1}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-slate-800 break-words">
                        {field.label}
                      </span>
                    </div>

                    {field.badge && (
                      <span
                        data-testid={`field-badge-${field.id}`}
                        className={cn(
                          "text-[11px] font-black px-2.5 py-0.5 rounded-full shrink-0 border",
                          field.badge.toLowerCase().includes('quan trọng')
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : field.badge.toLowerCase().includes('hỏi')
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-purple-100 text-purple-800 border-purple-200"
                        )}
                      >
                        {field.badge === 'Quan trọng' ? '⭐ Quan trọng' : field.badge}
                      </span>
                    )}
                  </div>

                  {/* Dòng 2 (nếu có field.helperTip): Hộp ghi chú mẹo sư phạm 💡 field.helperTip màu vàng nhạt ấm áp */}
                  {field.helperTip && (
                    <div
                      data-testid={`field-helper-tip-${field.id}`}
                      className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900 font-medium leading-relaxed"
                    >
                      <span className="shrink-0 select-none">💡</span>
                      <span className="flex-1 min-w-0">
                        {field.helperTip.replace(/^💡\s*/, '')}
                      </span>
                    </div>
                  )}

                  {/* Dòng 3: Tiền tố in đậm (field-prefix-...) + Input/Textarea tương ứng số rows */}
                  {hasMultipleRows ? (
                    <div className="flex flex-col gap-1 w-full">
                      <span
                        data-testid={`field-prefix-${field.id}`}
                        className={cn(
                          "font-bold text-xs sm:text-sm select-none",
                          theme.prefixTextColor
                        )}
                      >
                        {prefixLabel}
                      </span>
                      <textarea
                        id={`field-${field.id}`}
                        data-testid={`notebook-field-${field.id}`}
                        aria-label={field.label}
                        title={field.label}
                        rows={field.rows}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || inlinePlaceholder}
                        className="w-full rounded-xl bg-white border border-purple-200 p-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:italic focus:border-purple-400 focus:ring-1 focus:ring-purple-300 outline-none resize-none shadow-2xs transition-colors leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <span
                        data-testid={`field-prefix-${field.id}`}
                        className={cn(
                          "font-bold text-xs sm:text-sm select-none shrink-0",
                          theme.prefixTextColor
                        )}
                      >
                        {prefixLabel}
                      </span>
                      <input
                        type="text"
                        id={`field-${field.id}`}
                        data-testid={`notebook-field-${field.id}`}
                        aria-label={field.label}
                        title={field.label}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || inlinePlaceholder}
                        className="w-full rounded-xl bg-white border border-purple-200 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:italic focus:border-purple-400 focus:ring-1 focus:ring-purple-300 outline-none shadow-2xs transition-colors"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer hành động */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-purple-100">
            {/* Trái: Nút Xem câu mẫu và Lưu nháp (nếu có prop onSaveDraft) */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
              <button
                type="button"
                data-testid="btn-view-sample"
                onClick={() => {
                  playInstantSound('click')
                  setIsSampleModalOpen(true)
                }}
                className="rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold px-3 py-2 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <BookOpen size={14} className="text-purple-700" />
                <span>📖 Xem câu mẫu</span>
              </button>

              {onSaveDraft && (
                <button
                  type="button"
                  data-testid="btn-save-draft"
                  onClick={handleSaveDraftAction}
                  className="rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-2.5 py-2 transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                  title="Lưu bản nháp"
                >
                  <Save size={13} />
                  <span className="hidden sm:inline">Lưu nháp</span>
                </button>
              )}
            </div>

            {/* Giữa: Bộ đếm tiến độ */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                data-testid="writing-progress-indicator"
                className="text-xs text-slate-600 font-bold"
              >
                Đã viết {completedCount} / {fields.length} {stageUnitName}
              </div>
              {draftSavedAt && (
                <span
                  data-testid="draft-saved-indicator"
                  className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]"
                >
                  <CheckCircle2 size={12} />
                  <span>{draftSavedAt}</span>
                </span>
              )}
            </div>

            {/* CTA chính: hoàn tất thực hành và lưu sản phẩm. */}
            <button
              type="button"
              data-testid="btn-submit-notebook"
              onClick={handleSubmitAction}
              className="min-h-[48px] w-full sm:w-auto border-2 border-brand-600 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-clay transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Hoàn tất thực hành</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL XEM CÂU MẪU (SAMPLE TEMPLATE) ── */}
      {isSampleModalOpen && (
        <div
          data-testid="sample-template-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-purple-300 shadow-2xl p-4 sm:p-6 text-left flex flex-col gap-3 relative animate-in fade-in duration-200">
            {/* Header modal */}
            <div className="flex items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-xl bg-purple-100 flex items-center justify-center text-xl shrink-0">
                  📖
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {sampleHelperTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Bài mẫu gợi ý từ kịch bản bài học để con tham khảo
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="modal-close-btn"
                onClick={() => {
                  playInstantSound('click')
                  setIsSampleModalOpen(false)
                }}
                className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nội dung câu mẫu */}
            <div className="rounded-2xl bg-purple-50/50 border border-purple-200 p-3.5 max-h-[320px] overflow-y-auto">
              <pre className="text-xs sm:text-sm text-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
                {sampleTemplate}
              </pre>
            </div>

            {/* Footer modal */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                data-testid="modal-use-sample-btn"
                onClick={handleApplySampleTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-clay-xs transition-all active:scale-95 cursor-pointer"
              >
                <ClipboardCopy size={14} />
                <span>Áp dụng mẫu này vào bài</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSampleModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
