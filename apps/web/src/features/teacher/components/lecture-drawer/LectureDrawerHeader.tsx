import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  Circle,
  Eye,
  Split,
  X,
  BookOpen,
  Clapperboard,
  Target,
  HelpCircle,
  Film,
  MessageCircleQuestion,
  Gamepad2,
  BookmarkCheck,
  BrainCircuit,
  Lightbulb,
  ScanSearch,
  Trophy,
  Palette,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { LessonFormat, LectureDraft, JourneyStageDefinition } from '../../lib/authoring'
import { resolveCourseJourneyStages } from '../../lib/authoring'

export type Section =
  | 'basics'
  | 'content'
  | 'game'
  | 'practice'
  | 'check'
  | 'stage-0'
  | 'stage-1'
  | 'stage-2'
  | 'stage-3'
  | 'stage-4'
  | 'stage-5'
  | 'stage-6'

export interface SectionDefinition {
  id: Section
  label: string
  shortLabel: string
  fullTitle: string
  icon: React.ReactNode
}

export const AIKI_SECTIONS: SectionDefinition[] = [
  { id: 'basics', label: 'Thông tin trạm', shortLabel: 'Trạm', fullTitle: 'Thông tin cơ bản của trạm học', icon: <BookOpen size={14} /> },
  { id: 'stage-0', label: '1. Tình huống', shortLabel: 'Tình huống', fullTitle: '1. Tình huống câu chuyện mở đầu', icon: <Clapperboard size={14} /> },
  { id: 'stage-1', label: '2. Câu đố AIKI', shortLabel: 'Câu đố', fullTitle: '2. Câu đố suy luận AIKI tương tác', icon: <BrainCircuit size={14} /> },
  { id: 'stage-2', label: '3. Quy tắc', shortLabel: 'Quy tắc', fullTitle: '3. Quy tắc cốt lõi cần ghi nhớ', icon: <Lightbulb size={14} /> },
  { id: 'stage-3', label: '4. Giải thích', shortLabel: 'Giải thích', fullTitle: '4. Giải thích chi tiết và ví dụ thực tế', icon: <ScanSearch size={14} /> },
  { id: 'stage-4', label: '5. Chốt', shortLabel: 'Chốt', fullTitle: '5. Chốt bài học, tặng sao và vinh danh', icon: <Trophy size={14} /> },
]

export const ISLAND_6_STAGE_SECTIONS: SectionDefinition[] = [
  { id: 'basics', label: 'Thông tin trạm', shortLabel: 'Trạm', fullTitle: 'Thông tin cơ bản của trạm học', icon: <BookOpen size={14} /> },
  { id: 'stage-0', label: '1. 🎯 Mục tiêu', shortLabel: 'Mục tiêu', fullTitle: '1. 🎯 Mục tiêu bài học (Ảnh minh họa)', icon: <Target size={14} /> },
  { id: 'stage-1', label: '2. ❓ Xác nhận', shortLabel: 'Khởi động', fullTitle: '2. ❓ Xác nhận (1 câu hỏi khởi động)', icon: <HelpCircle size={14} /> },
  { id: 'stage-2', label: '3. 🎬 Video', shortLabel: 'Video', fullTitle: '3. 🎬 Video bài giảng YouTube / MP4', icon: <Film size={14} /> },
  { id: 'stage-3', label: '4. 🧩 Trắc nghiệm', shortLabel: 'Câu hỏi', fullTitle: '4. 🧩 Bộ câu hỏi trắc nghiệm kiểm tra', icon: <MessageCircleQuestion size={14} /> },
  { id: 'stage-4', label: '5. 🎨 Thực hành', shortLabel: 'Thực hành', fullTitle: '5. 🎨 Kịch bản thực hành AI Studio', icon: <Palette size={14} /> },
  { id: 'stage-5', label: '6. 🏆 Kết thúc', shortLabel: 'Kết thúc', fullTitle: '6. 🏆 Màn kết thúc, trao sao & huy hiệu', icon: <Trophy size={14} /> },
]

export const STANDARD_SECTIONS: SectionDefinition[] = [
  { id: 'basics', label: 'Thông tin trạm', shortLabel: 'Trạm', fullTitle: 'Thông tin cơ bản của trạm học', icon: <BookOpen size={14} /> },
  { id: 'content', label: '1. Kiến thức', shortLabel: 'Kiến thức', fullTitle: '1. Khám phá kiến thức bài học', icon: <Clapperboard size={14} /> },
  { id: 'game', label: '2. Trò chơi', shortLabel: 'Trò chơi', fullTitle: '2. Trò chơi tương tác cùng Mee', icon: <Gamepad2 size={14} /> },
  { id: 'practice', label: '3. Sáng tạo', shortLabel: 'Sáng tạo', fullTitle: '3. Tự tay sáng tạo & thực hành', icon: <BookmarkCheck size={14} /> },
  { id: 'check', label: '4. Thử tài', shortLabel: 'Thử tài', fullTitle: '4. Thử thách & đánh giá năng lực', icon: <Trophy size={14} /> },
]

export interface LectureDrawerHeaderProps {
  uid: string
  draft: LectureDraft
  isEdit: boolean
  readOnly?: boolean
  archived?: boolean
  isIslandCourse: boolean
  lessonFormat: LessonFormat
  activeSection: Section
  readiness: {
    completed: number
    total: number
    complete: boolean
  }
  showInlinePreview: boolean
  recovery: {
    savedAt: number | string
    draft: LectureDraft
  } | null
  draftStorageKey: string
  onRestore?: () => void
  onArchive?: () => void
  onRequestClose: () => void
  onShowFullPreview: () => void
  onToggleInlinePreview: () => void
  onFormatChange: (format: LessonFormat) => void
  onSelectSection: (section: Section) => void
  onDiscardRecovery: () => void
  onApplyRecovery: () => void
  sectionStatus: (section: Section) => boolean
  sectionMissing: (section: Section) => string[]
  customJourneyStages?: JourneyStageDefinition[]
}

export function LectureDrawerHeader({
  uid,
  draft,
  isEdit,
  readOnly = false,
  archived = false,
  isIslandCourse,
  lessonFormat,
  activeSection,
  readiness,
  showInlinePreview,
  recovery,
  draftStorageKey: _draftStorageKey,
  onRestore,
  onArchive,
  onRequestClose,
  onShowFullPreview,
  onToggleInlinePreview,
  onFormatChange,
  onSelectSection,
  onDiscardRecovery,
  onApplyRecovery,
  sectionStatus,
  sectionMissing,
  customJourneyStages,
}: LectureDrawerHeaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const activeTabRef = useRef<HTMLButtonElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const dragDistanceRef = useRef(0)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollOverflow = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const hasOverflow = el.scrollWidth > el.clientWidth + 2
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    checkScrollOverflow()

    const handleScroll = () => {
      checkScrollOverflow()
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', checkScrollOverflow)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        checkScrollOverflow()
      })
      ro.observe(el)
    }

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkScrollOverflow)
      ro?.disconnect()
    }
  }, [checkScrollOverflow, activeSection, isIslandCourse, lessonFormat])

  // Tự động cuộn active tab vào giữa tầm mắt khi chuyển chặng
  useEffect(() => {
    if (activeTabRef.current && typeof activeTabRef.current.scrollIntoView === 'function') {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [activeSection])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current
    if (!el) return
    isDraggingRef.current = true
    setIsDragging(true)
    startXRef.current = e.pageX - el.offsetLeft
    scrollLeftRef.current = el.scrollLeft
    dragDistanceRef.current = 0
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const el = scrollContainerRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startXRef.current) * 1.5
    dragDistanceRef.current = Math.abs(x - startXRef.current)
    el.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      setIsDragging(false)
      setTimeout(() => {
        dragDistanceRef.current = 0
      }, 100)
    }
  }

  const handleTabClick = (sectionId: Section, e: React.MouseEvent) => {
    if (dragDistanceRef.current > 5) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onSelectSection(sectionId)
  }

  const handleScrollStep = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current
    if (!el) return
    const delta = direction === 'left' ? -200 : 200
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const getStageIcon = (iconName?: string, index?: number): React.ReactNode => {
    switch (iconName?.toLowerCase()) {
      case 'target': return <Target size={14} />
      case 'helpcircle':
      case 'help-circle': return <HelpCircle size={14} />
      case 'film':
      case 'video': return <Film size={14} />
      case 'messagecirclequestion':
      case 'quiz':
      case 'question': return <MessageCircleQuestion size={14} />
      case 'palette':
      case 'practice': return <Palette size={14} />
      case 'trophy':
      case 'reward': return <Trophy size={14} />
      case 'clapperboard': return <Clapperboard size={14} />
      case 'braincircuit':
      case 'brain-circuit': return <BrainCircuit size={14} />
      case 'lightbulb': return <Lightbulb size={14} />
      case 'scansearch':
      case 'scan-search': return <ScanSearch size={14} />
      case 'gamepad2':
      case 'game': return <Gamepad2 size={14} />
      case 'bookmarkcheck':
      case 'bookmark-check': return <BookmarkCheck size={14} />
      default: {
        const fallbackIcons = [
          <Target key="i0" size={14} />,
          <HelpCircle key="i1" size={14} />,
          <Film key="i2" size={14} />,
          <MessageCircleQuestion key="i3" size={14} />,
          <Palette key="i4" size={14} />,
          <Trophy key="i5" size={14} />,
          <Lightbulb key="i6" size={14} />,
        ]
        return fallbackIcons[(index ?? 0) % fallbackIcons.length]
      }
    }
  }

  const islandStages = ISLAND_6_STAGE_SECTIONS.filter((s) => s.id !== 'basics')
  const generalSections = (lessonFormat === 'aiki-rule-5steps' ? AIKI_SECTIONS : STANDARD_SECTIONS).filter((s) => s.id !== 'basics')

  const activeCustomStages = customJourneyStages || draft.customJourneyStages
  const hasCustomStages = Boolean(activeCustomStages && activeCustomStages.length >= 3)
  const resolvedStages = React.useMemo(() => {
    return resolveCourseJourneyStages(draft.id, lessonFormat, activeCustomStages)
  }, [draft.id, lessonFormat, activeCustomStages])

  const customSections: SectionDefinition[] = React.useMemo(() => {
    return resolvedStages.map((s, idx) => ({
      id: (s.id as Section) || (`stage-${idx}` as Section),
      label: s.title,
      shortLabel: s.shortTitle,
      fullTitle: s.desc || s.title,
      icon: getStageIcon(s.iconName, idx),
    }))
  }, [resolvedStages])

  const displaySections = hasCustomStages
    ? customSections
    : (isIslandCourse ? islandStages : generalSections)

  return (
    <>
      {/* Alert Banner lớn khi trạm bị ẩn khỏi lộ trình */}
      {archived && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-300 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-4 py-3 text-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2.5 text-xs font-black sm:text-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-base shadow-inner">
              📦
            </span>
            <span>
              <strong>TRẠM CŨ / ĐÃ ẨN:</strong> Trạm này đang bị ẩn khỏi lộ trình học sinh trên Bản đồ Đảo. Học sinh sẽ không thể nhìn thấy hoặc truy cập.
            </span>
          </div>
          {!readOnly && onRestore && (
            <button
              type="button"
              onClick={onRestore}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-black text-amber-900 shadow-md transition hover:bg-amber-50 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span>👁️ Bật lại trạm này ngay</span>
            </button>
          )}
        </div>
      )}

      {/* Header Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <div className="min-w-0 flex-1 mr-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }} className="shrink-0 whitespace-nowrap">
              {readOnly ? 'Xem trạm học' : isEdit ? 'Chỉnh sửa trạm học' : 'Tạo trạm học mới'}
            </div>
            {readOnly && (
              <span
                className="shrink-0 whitespace-nowrap"
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#92400e',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '0.375rem',
                  padding: '0.125rem 0.5rem',
                }}
              >
                Chỉ xem
              </span>
            )}
            {!readOnly && isEdit && archived && (
              <span
                className="shrink-0 whitespace-nowrap"
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#ea580c',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '0.375rem',
                  padding: '0.125rem 0.5rem',
                }}
              >
                Đang ẩn
              </span>
            )}
          </div>
          {draft.title && (
            <div className="truncate" style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }} title={draft.title}>
              {draft.title}
            </div>
          )}

          {/* Hàng cấu trúc trạm học & Nút Thông tin trạm riêng biệt */}
          <div className="flex items-center gap-2 mt-1.5 min-w-0 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Cấu trúc:</span>
              <select
                disabled={readOnly || isIslandCourse}
                value={lessonFormat}
                onChange={(e) => onFormatChange(e.target.value as LessonFormat)}
                className="rounded-xl border-2 border-brand-200 bg-brand-50/70 px-2.5 py-1 text-xs font-black text-brand-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500 truncate max-w-[220px]"
              >
                {isIslandCourse ? (
                  <option value="aiki-island-6steps">Khóa học · 6 chặng</option>
                ) : (
                  <>
                    <option value="aiki-rule-5steps">Quy tắc AIKI · 5 bước</option>
                    <option value="standard">Khám phá tiêu chuẩn</option>
                  </>
                )}
              </select>
            </div>

            {/* Nút riêng biệt Thông tin trạm - Tách độc lập khỏi Stepper 6 chặng */}
            <button
              type="button"
              onClick={() => onSelectSection('basics')}
              title="Thông tin cơ bản của trạm học (Tiêu đề, mô tả, ảnh bìa, kỹ năng trọng tâm)"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border shrink-0",
                activeSection === 'basics'
                  ? "bg-brand-100 text-brand-900 border-brand-400 font-black ring-2 ring-brand-300/60 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-200"
              )}
            >
              {sectionStatus('basics') ? (
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              ) : (
                <BookOpen size={13} className={cn("shrink-0", activeSection === 'basics' ? "text-brand-600" : "text-slate-500")} />
              )}
              <span>📖 Thông tin trạm</span>
              {!sectionStatus('basics') && sectionMissing('basics').length > 0 && (
                <span
                  title={`Còn thiếu: ${sectionMissing('basics').join(', ')}`}
                  className="grid min-w-4 h-4 place-items-center rounded-full bg-amber-100 px-1 text-[10px] font-black text-amber-700 shrink-0"
                >
                  {sectionMissing('basics').length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onShowFullPreview}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-extrabold text-brand-700 hover:bg-brand-100 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Eye size={14} className="shrink-0" /> Xem toàn bộ
          </button>
          {(isIslandCourse || lessonFormat === 'aiki-rule-5steps' || activeSection === 'basics') && (
            <button
              type="button"
              onClick={onToggleInlinePreview}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-extrabold transition shrink-0 whitespace-nowrap cursor-pointer',
                showInlinePreview
                  ? 'border-sky-300 bg-sky-100 text-sky-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
              aria-pressed={showInlinePreview}
              title={showInlinePreview ? 'Thu gọn cột xem trước' : 'Mở xem trước song song'}
            >
              {showInlinePreview ? <PanelRightClose size={14} className="shrink-0" /> : <Split size={14} className="shrink-0" />}
              <span>{showInlinePreview ? 'Thu gọn preview' : 'Xem song song'}</span>
            </button>
          )}

          {!readOnly && (
            <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-slate-500 shrink-0 whitespace-nowrap">
              <span style={{ color: readiness.complete ? '#10b981' : '#f97316', fontWeight: 700 }}>
                {readiness.completed}/{readiness.total}
              </span>
              <span>bước</span>
            </div>
          )}

          {!readOnly && isEdit && (
            archived ? (
              <button
                type="button"
                onClick={onRestore}
                className="shrink-0 whitespace-nowrap cursor-pointer"
                style={{ padding: '0.375rem 0.75rem', border: '1px solid #6ee7b7', background: '#ecfdf5', borderRadius: '0.5rem', color: '#059669', fontSize: '0.8125rem', fontWeight: 700 }}
              >
                ↩ Khôi phục
              </button>
            ) : (
              <button
                type="button"
                onClick={onArchive}
                className="shrink-0 whitespace-nowrap cursor-pointer"
                style={{ padding: '0.375rem 0.75rem', border: '1px solid #fca5a5', background: '#fff1f2', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 700 }}
              >
                🗃 Ẩn bài
              </button>
            )
          )}

          <button
            type="button"
            id={`${uid}-drawer-close`}
            onClick={onRequestClose}
            className="shrink-0 cursor-pointer"
            style={{ padding: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0.5rem', color: '#64748b' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Section Tabs / Stepper: Full-Width 0-Scroll + Drag-to-Scroll + Arrow Controls */}
      <div className="relative flex items-center bg-slate-50/60 border-b border-border px-3 py-2 shrink-0">
        {/* Nút mũi tên cuộn trái khi tràn mép */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScrollStep('left')}
            aria-label="Cuộn sang trái"
            className="absolute left-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 border border-slate-300 shadow-md text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Khung cuộn hỗ trợ kéo chuột mượt mà */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={cn(
            "w-full overflow-x-auto scroll-smooth custom-scrollbar select-none",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
        >
          {hasCustomStages ? (
            /* Thanh Stepper tùy biến 3-7 chặng linh hoạt theo khóa học */
            <div
              className={cn(
                "grid gap-1.5 w-full min-w-0",
                displaySections.length === 3 ? "grid-cols-3 sm:grid-cols-3" :
                displaySections.length === 4 ? "grid-cols-2 sm:grid-cols-4" :
                displaySections.length === 5 ? "grid-cols-2 sm:grid-cols-5" :
                displaySections.length === 6 ? "grid-cols-3 sm:grid-cols-6" :
                displaySections.length === 7 ? "grid-cols-3 sm:grid-cols-7" :
                "grid-cols-2 sm:grid-cols-4"
              )}
            >
              {displaySections.map((section) => {
                const isActive = activeSection === section.id
                const complete = sectionStatus(section.id)
                const missing = sectionMissing(section.id)
                return (
                  <button
                    key={section.id}
                    ref={isActive ? activeTabRef : null}
                    type="button"
                    onClick={(e) => handleTabClick(section.id, e)}
                    title={section.fullTitle || section.label}
                    className={cn(
                      "group relative flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all cursor-pointer select-none text-center min-w-0 shadow-2xs",
                      isActive
                        ? "bg-brand-50 text-brand-700 border-2 border-brand-300 shadow-xs font-black ring-1 ring-brand-200"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 font-bold hover:border-slate-300"
                    )}
                  >
                    {complete ? (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={13} className={cn("shrink-0", isActive ? "text-brand-500" : "text-slate-300")} />
                    )}
                    <span className="truncate">{section.label}</span>
                    {!complete && missing.length > 0 && (
                      <span
                        title={`Thiếu: ${missing.join(', ')}`}
                        className="grid min-w-4 h-4 place-items-center rounded-full bg-amber-100 px-1 text-[10px] font-black text-amber-700 shrink-0"
                      >
                        {missing.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : isIslandCourse ? (
            /* Thanh Stepper 6 chặng dàn đều trọn vẹn 100% bề ngang: grid-cols-3 trên mobile < 640px, grid-cols-6 trên màn hình >= 640px */
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 w-full min-w-0">
              {islandStages.map((section) => {
                const isActive = activeSection === section.id
                const complete = sectionStatus(section.id)
                const missing = sectionMissing(section.id)
                return (
                  <button
                    key={section.id}
                    ref={isActive ? activeTabRef : null}
                    type="button"
                    onClick={(e) => handleTabClick(section.id, e)}
                    title={section.fullTitle || section.label}
                    className={cn(
                      "group relative flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all cursor-pointer select-none text-center min-w-0 shadow-2xs",
                      isActive
                        ? "bg-brand-50 text-brand-700 border-2 border-brand-300 shadow-xs font-black ring-1 ring-brand-200"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 font-bold hover:border-slate-300"
                    )}
                  >
                    {complete ? (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={13} className={cn("shrink-0", isActive ? "text-brand-500" : "text-slate-300")} />
                    )}
                    <span className="truncate">{section.label}</span>
                    {!complete && missing.length > 0 && (
                      <span
                        title={`Thiếu: ${missing.join(', ')}`}
                        className="grid min-w-4 h-4 place-items-center rounded-full bg-amber-100 px-1 text-[10px] font-black text-amber-700 shrink-0"
                      >
                        {missing.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            /* Dành cho các định dạng khóa học tiêu chuẩn / quy tắc AIKI */
            <div
              className={cn(
                "grid gap-1.5 w-full min-w-0",
                generalSections.length === 5 ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"
              )}
            >
              {generalSections.map((section) => {
                const isActive = activeSection === section.id
                const complete = sectionStatus(section.id)
                const missing = sectionMissing(section.id)
                return (
                  <button
                    key={section.id}
                    ref={isActive ? activeTabRef : null}
                    type="button"
                    onClick={(e) => handleTabClick(section.id, e)}
                    title={section.fullTitle || section.label}
                    className={cn(
                      "group relative flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs transition-all cursor-pointer select-none text-center min-w-0 shadow-2xs",
                      isActive
                        ? "bg-brand-50 text-brand-700 border-2 border-brand-300 shadow-xs font-black ring-1 ring-brand-200"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 font-bold hover:border-slate-300"
                    )}
                  >
                    {complete ? (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={13} className={cn("shrink-0", isActive ? "text-brand-500" : "text-slate-300")} />
                    )}
                    <span className="truncate">{section.label}</span>
                    {!complete && missing.length > 0 && (
                      <span
                        title={`Thiếu: ${missing.join(', ')}`}
                        className="grid min-w-4 h-4 place-items-center rounded-full bg-amber-100 px-1 text-[10px] font-black text-amber-700 shrink-0"
                      >
                        {missing.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Nút mũi tên cuộn phải khi tràn mép */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScrollStep('right')}
            aria-label="Cuộn sang phải"
            className="absolute right-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 border border-slate-300 shadow-md text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Unsaved Draft Recovery Banner */}
      {recovery && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sun-200 bg-sun-50 px-6 py-3 text-sm">
          <div>
            <strong className="text-sun-900">Có bản nháp chưa lưu</strong>
            <span className="ml-2 text-muted">lúc {new Date(recovery.savedAt).toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold"
              onClick={onDiscardRecovery}
            >
              Bỏ bản nháp
            </button>
            <button
              type="button"
              className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-extrabold text-white"
              onClick={onApplyRecovery}
            >
              Khôi phục
            </button>
          </div>
        </div>
      )}
    </>
  )
}

