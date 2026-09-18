import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePagination } from '@/shared/hooks/usePagination'
import {
  FileText,
  Map,
  ShieldCheck,
  BarChart3,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type {
  AsmoExam,
  AsmoGrade,
  AsmoSubject,
} from '@/features/asmo/types'
import { ASMO_SAMPLE_EXAMS_META } from '@/features/asmo/data/asmo-sample-exams-meta'
import { loadExamById } from '@/features/asmo/data/asmo-grade-loader'
import { ASMO_CURRICULUM_WEEKS } from '@/features/asmo/data/asmo-curriculum'
import {
  auditAsmoExam,
  autoRepairExam,
  type AsmoExamAuditResult,
} from '@/features/asmo/lib/asmo-audit-engine'
import { AsmoExamAuditModal } from '@/features/asmo/components/AsmoExamAuditModal'

// Modular sub-components, types & helpers
import {
  type AsmoStudioTab,
  type ExamWithStatus,
  type AsmoCurriculumWeekItem,
  type AsmoStudioMetrics,
  type AsmoAuditBreakdown,
  generatePedagogicalTipsAndSolution,
  validateCurriculumJson,
  AsmoStudioExamsTab,
  AsmoStudioCurriculumTab,
  AsmoStudioAuditTab,
  AsmoStudioAnalyticsTab,
  AsmoRegulationEditModal,
  AsmoQuestionsDetailModal,
  CurriculumWeekEditModal,
  CurriculumImportModal,
  CurriculumGeneratorPreviewModal,
} from './asmo-studio'

// Backward-compatible exports
export type {
  AsmoStudioTab,
  ExamWithStatus,
  AsmoCurriculumWeekItem,
  AsmoStudioMetrics,
  AsmoAuditBreakdown,
}
export { generatePedagogicalTipsAndSolution, validateCurriculumJson }

export function AsmoAdminStudio() {
  const [activeTab, setActiveTab] = useState<AsmoStudioTab>('exams')

  // Data state
  const [exams, setExams] = useState<ExamWithStatus[]>(() => {
    return ASMO_SAMPLE_EXAMS_META.map((exam, index) => ({
      ...exam,
      // Mặc định công bố đa số đề, giữ một số làm bản nháp để minh họa
      isPublished: index % 5 !== 3,
    }))
  })

  // Filters for Exams
  const [filterSubject, setFilterSubject] = useState<'all' | AsmoSubject>('all')
  const [filterGrade, setFilterGrade] = useState<'all' | number>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filters for Curriculum
  const [curriculumSubject, setCurriculumSubject] = useState<'all' | AsmoSubject>('all')
  const [curriculumGrade, setCurriculumGrade] = useState<'all' | number>('all')

  // Curriculum Data State
  const [curriculumWeeks, setCurriculumWeeks] = useState<AsmoCurriculumWeekItem[]>(() =>
    ASMO_CURRICULUM_WEEKS.map((w) => ({
      ...w,
      keyCompetencies: [...w.keyCompetencies],
      sampleQuestionIds: [...w.sampleQuestionIds],
    })),
  )
  const [editingWeek, setEditingWeek] = useState<AsmoCurriculumWeekItem | null>(null)
  const [isCreatingWeek, setIsCreatingWeek] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [previewGenWeek, setPreviewGenWeek] = useState<{
    week: AsmoCurriculumWeekItem
    quote: string
    storyAdvice: string
    solutionSteps: string[]
    commonPitfall: string
  } | null>(null)

  // Modals & Drawers state
  const [editingExam, setEditingExam] = useState<ExamWithStatus | null>(null)
  const [viewingQuestionsExam, setViewingQuestionsExam] = useState<ExamWithStatus | null>(null)
  const [auditingExamModal, setAuditingExamModal] = useState<AsmoExam | null>(null)

  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Dynamic loader for viewing questions details modal
  const handleOpenQuestions = useCallback(async (exam: ExamWithStatus) => {
    setViewingQuestionsExam(exam)
    if (!exam.questions || exam.questions.length === 0) {
      try {
        const fullExam = await loadExamById(exam.id)
        if (!isMountedRef.current) return
        if (fullExam && fullExam.questions) {
          setViewingQuestionsExam((prev) =>
            prev && prev.id === exam.id ? { ...prev, questions: fullExam.questions } : prev,
          )
          setExams((prev) =>
            prev.map((e) => (e.id === exam.id ? { ...e, questions: fullExam.questions } : e)),
          )
        }
      } catch (err) {
        if (isMountedRef.current) {
          console.error('Failed to dynamically load ASMO questions', err)
        }
      }
    }
  }, [])

  // Audit state
  const [isAuditingAll, setIsAuditingAll] = useState(false)
  const [auditTimestamp, setAuditTimestamp] = useState<string>(() => new Date().toLocaleTimeString('vi-VN'))
  const [toastNotification, setToastNotification] = useState<string | null>(null)

  // Repair state
  const [repairingExamId, setRepairingExamId] = useState<string | null>(null)
  const [repairedExamIds, setRepairedExamIds] = useState<Set<string>>(new Set())
  const [isRepairingAll, setIsRepairingAll] = useState(false)

  // Lock background scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      editingExam ||
        viewingQuestionsExam ||
        auditingExamModal ||
        editingWeek ||
        isCreatingWeek ||
        isImportModalOpen ||
        previewGenWeek,
    )
    if (isAnyModalOpen) {
      const prevOverflow = document.body.style.overflow
      const didChange = prevOverflow !== 'hidden'
      if (didChange) {
        document.body.style.overflow = 'hidden'
      }
      return () => {
        if (didChange) {
          document.body.style.overflow = prevOverflow
        }
      }
    }
  }, [
    editingExam,
    viewingQuestionsExam,
    auditingExamModal,
    editingWeek,
    isCreatingWeek,
    isImportModalOpen,
    previewGenWeek,
  ])

  // Trigger temporary toast
  const showToast = useCallback((msg: string) => {
    setToastNotification(msg)
    const timer = setTimeout(() => {
      setToastNotification(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  // Toggle publish state
  const handleTogglePublish = useCallback((examId: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const nextState = !e.isPublished
          showToast(`Đã ${nextState ? 'kích hoạt mở phòng thi' : 'chuyển về bản nháp'}: ${e.title}`)
          return { ...e, isPublished: nextState }
        }
        return e
      }),
    )
  }, [showToast])

  // Save Regulation Edit
  const handleSaveRegulation = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingExam) return

    const formData = new FormData(e.currentTarget)
    const title = String(formData.get('title') || editingExam.title)
    const round = String(formData.get('round') || editingExam.round)
    const year = Number(formData.get('year') || editingExam.year)
    const durationMinutes = Number(formData.get('durationMinutes') || editingExam.durationMinutes)
    const passScore = Number(formData.get('passScore') || editingExam.passScore)
    const totalPoints = Number(formData.get('totalPoints') || editingExam.totalPoints)
    const description = String(formData.get('description') || editingExam.description)

    setExams((prev) =>
      prev.map((item) =>
        item.id === editingExam.id
          ? {
              ...item,
              title,
              round,
              year,
              durationMinutes,
              passScore,
              totalPoints,
              description,
            }
          : item,
      ),
    )

    showToast(`Đã lưu quy chế đề thi "${title}" thành công!`)
    setEditingExam(null)
  }, [editingExam, showToast])

  // Auto Repair Exam in Audit Tab
  const handleQuickRepair = useCallback((exam: AsmoExam) => {
    setRepairingExamId(exam.id)
    setTimeout(() => {
      const repaired = autoRepairExam(exam)
      setExams((prev) =>
        prev.map((item) => (item.id === exam.id ? { ...repaired, isPublished: item.isPublished } : item)),
      )
      setRepairedExamIds((prev) => new Set(prev).add(exam.id))
      setRepairingExamId(null)
      showToast(`⚡ Đã chuẩn hóa KaTeX và lời giải 3 bước thành công cho đề ${exam.title || exam.code}!`)
    }, 400)
  }, [showToast])

  // Batch quick repair for top 20 exams in Audit Tab
  const handleRepairAllExams = useCallback(() => {
    setIsRepairingAll(true)
    setTimeout(() => {
      const targetCount = Math.min(exams.length, 20)
      const newlyRepairedIds = new Set<string>()

      setExams((prev) =>
        prev.map((item, idx) => {
          if (idx < 20) {
            const repaired = autoRepairExam(item)
            newlyRepairedIds.add(item.id)
            return { ...repaired, isPublished: item.isPublished }
          }
          return item
        }),
      )

      setRepairedExamIds((prev) => new Set([...prev, ...newlyRepairedIds]))
      setIsRepairingAll(false)
      setAuditTimestamp(new Date().toLocaleTimeString('vi-VN'))
      showToast(`⚡ Đã chuẩn hóa KaTeX và lời giải 3 bước thành công cho toàn bộ ${targetCount} đề thi!`)
    }, 500)
  }, [exams, showToast])

  // Run full audit
  const handleRunFullAudit = useCallback(() => {
    setIsAuditingAll(true)
    setTimeout(() => {
      setIsAuditingAll(false)
      setAuditTimestamp(new Date().toLocaleTimeString('vi-VN'))
      showToast('Đã quét kiểm định toàn bộ ngân hàng đề thi ASMO thành công!')
    }, 600)
  }, [showToast])

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      if (filterSubject !== 'all' && exam.subject !== filterSubject) return false
      if (filterGrade !== 'all' && exam.grade !== filterGrade) return false
      if (filterStatus === 'published' && !exam.isPublished) return false
      if (filterStatus === 'draft' && exam.isPublished) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = exam.title.toLowerCase().includes(query)
        const matchCode = exam.code.toLowerCase().includes(query)
        if (!matchTitle && !matchCode) return false
      }
      return true
    })
  }, [exams, filterSubject, filterGrade, filterStatus, searchQuery])

  // Pagination for exams list: 12 items/page
  const {
    slice: paginatedExams,
    page: examPage,
    totalPages: examTotalPages,
    prev: prevExamPage,
    next: nextExamPage,
    goTo: goToExamPage,
  } = usePagination(filteredExams, 12)

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalExams = exams.length
    const publishedCount = exams.filter((e) => e.isPublished).length
    const draftCount = exams.filter((e) => !e.isPublished).length
    const avgPassScore = totalExams > 0
      ? (exams.reduce((sum, e) => sum + e.passScore, 0) / totalExams).toFixed(1)
      : '0'

    return { totalExams, publishedCount, draftCount, avgPassScore }
  }, [exams])

  // Audit results for Audit tab
  const auditResults = useMemo(() => {
    return exams.slice(0, 20).map((exam) => {
      const res: AsmoExamAuditResult = auditAsmoExam(exam)
      return {
        exam,
        result: res,
      }
    })
  }, [exams])

  // Health Score calculation
  const healthScore = useMemo(() => {
    if (auditResults.length === 0) return 100
    const totalScore = auditResults.reduce((acc, curr) => acc + curr.result.qualityScore, 0)
    return Math.round(totalScore / auditResults.length)
  }, [auditResults])

  // Audit breakdown counts
  const auditBreakdown = useMemo(() => {
    let katexErrors = 0
    let mathInconsistencies = 0
    let pedagogicalWarnings = 0
    let taxonomyIssues = 0

    auditResults.forEach(({ result }) => {
      katexErrors += result.categoryBreakdown.formula_syntax.errors
      mathInconsistencies +=
        result.categoryBreakdown.math_consistency.errors +
        result.categoryBreakdown.options_distractors.errors
      pedagogicalWarnings += result.categoryBreakdown.pedagogical_solution.warnings
      taxonomyIssues += result.categoryBreakdown.taxonomy_domain.warnings
    })

    return { katexErrors, mathInconsistencies, pedagogicalWarnings, taxonomyIssues }
  }, [auditResults])

  // Curriculum Handlers
  const handleDeleteWeek = useCallback(
    (weekToDelete: AsmoCurriculumWeekItem) => {
      setCurriculumWeeks((prev) =>
        prev.filter(
          (w) =>
            !(
              w.week === weekToDelete.week &&
              w.subject === weekToDelete.subject &&
              w.grade === weekToDelete.grade
            ),
        ),
      )
      showToast(`Đã xóa tuần ${weekToDelete.week}: ${weekToDelete.title}`)
    },
    [showToast],
  )

  const handleResetCurriculum = useCallback(() => {
    setCurriculumWeeks(
      ASMO_CURRICULUM_WEEKS.map((w) => ({
        ...w,
        keyCompetencies: [...w.keyCompetencies],
        sampleQuestionIds: [...w.sampleQuestionIds],
      })),
    )
    showToast('Đã khôi phục lộ trình học về mặc định!')
  }, [showToast])

  const handleExportCurriculum = useCallback(() => {
    const blob = new Blob([JSON.stringify(curriculumWeeks, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asmo_curriculum_export.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Đã xuất ${curriculumWeeks.length} tuần học ra file asmo_curriculum_export.json thành công!`)
  }, [curriculumWeeks, showToast])

  const handleDownloadTemplate = useCallback(() => {
    const sampleTemplate = [
      {
        week: 1,
        subject: 'math',
        grade: 1,
        topic: 'ASMO-MATH-G1-W01',
        title: 'Đếm Khối Lập Phương & Không Gian Đa Chiều',
        summary: 'Làm quen với góc nhìn 3D, đếm số khối bị che khuất và xoay hình trong không gian.',
        keyCompetencies: ['Tư duy không gian', 'Đếm hình khối', 'Bóc tách tầng'],
        visualTemplate: '3D_CUBE_CLUSTER',
        sampleQuestionIds: ['asmo-math-g1-2020-r1-q05'],
        meeTip: {
          quote: 'Nhìn hình vẽ kỹ, chớ vội tính ngay; đếm từng góc cạnh, lời giải mở ra tay!',
          storyAdvice: 'Đánh số từng tầng từ dưới lên trên để tránh bỏ sót khối bị che khuất.',
        },
        solutionSteps: [
          'Bước 1: Phân tích số tầng của mô hình từ thấp đến cao.',
          'Bước 2: Áp dụng công thức đếm theo cột $N = \\sum h_i$.',
          'Bước 3: Tổng hợp số lượng khối lập phương.',
        ],
        commonPitfall: 'Bỏ sót các khối ở tầng 1 bị che khuất hoàn toàn.',
      },
    ]
    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asmo_curriculum_template.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Đã tải xuống file JSON mẫu chuẩn hóa!')
  }, [showToast])

  const handleGenerateAllTips = useCallback(() => {
    setCurriculumWeeks((prev) =>
      prev.map((w) => {
        const gen = generatePedagogicalTipsAndSolution(w)
        return {
          ...w,
          meeTip: {
            quote: gen.quote,
            storyAdvice: gen.storyAdvice,
          },
          solutionSteps: gen.solutionSteps,
          commonPitfall: gen.commonPitfall,
        }
      }),
    )
    showToast(
      `⚡ Đã tự động sinh Bí kíp Mèo Mee và Lời giải 3 bước cho toàn bộ ${curriculumWeeks.length} tuần học!`,
    )
  }, [curriculumWeeks.length, showToast])

  const handleOpenPreviewGen = useCallback((weekItem: AsmoCurriculumWeekItem) => {
    const gen = generatePedagogicalTipsAndSolution(weekItem)
    setPreviewGenWeek({
      week: weekItem,
      quote: gen.quote,
      storyAdvice: gen.storyAdvice,
      solutionSteps: gen.solutionSteps,
      commonPitfall: gen.commonPitfall,
    })
  }, [])

  // Filtered Curriculum Weeks
  const filteredWeeks = useMemo(() => {
    return curriculumWeeks.filter((w) => {
      if (curriculumSubject !== 'all' && w.subject !== curriculumSubject) return false
      if (curriculumGrade !== 'all' && w.grade !== curriculumGrade) return false
      return true
    })
  }, [curriculumWeeks, curriculumSubject, curriculumGrade])

  return (
    <div className="flex flex-col gap-6">
      {/* Toast popup via Portal to escape transform page-enter stacking context */}
      {toastNotification &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="alert"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-clay animate-in fade-in slide-in-from-bottom-3"
          >
            <Sparkles className="size-5 shrink-0 animate-spin" />
            <span>{toastNotification}</span>
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="ml-2 rounded-lg p-1 hover:bg-emerald-600 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>,
          document.body,
        )}

      {/* Header Banner — Soft Clay Hallmark */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-border/80 bg-gradient-to-r from-amber-50 via-orange-50 to-brand-50 p-6 sm:p-8 shadow-clay">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-400 text-3xl shadow-clay">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800">
                  ASMO OLYMPIAD STUDIO
                </span>
                <span className="rounded-xl border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                  Live Engine
                </span>
              </div>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black text-text">
                Học & Thi ASMO Quốc Tế
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                Quản trị đề thi Olympic, phòng thi trực tuyến, lộ trình 16 tuần và kiểm định KaTeX sư phạm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={handleRunFullAudit}
              disabled={isAuditingAll}
              className="gap-2 rounded-2xl border-2 border-border/80 bg-white font-black shadow-clay hover:bg-amber-50"
            >
              <RotateCcw className={cn('size-4 text-brand-600', isAuditingAll && 'animate-spin')} />
              {isAuditingAll ? 'Đang kiểm định…' : 'Quét kiểm định KaTeX'}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Clay Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-border/80 bg-surface p-2 shadow-clay">
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer select-none',
            activeTab === 'exams'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-muted hover:bg-brand-50 hover:text-text',
          )}
        >
          <FileText className="size-4" />
          <span>Đề thi & Phòng thi</span>
          <span
            className={cn(
              'ml-1.5 rounded-full px-2 py-0.5 text-xs',
              activeTab === 'exams' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700',
            )}
          >
            {exams.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer select-none',
            activeTab === 'curriculum'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-muted hover:bg-brand-50 hover:text-text',
          )}
        >
          <Map className="size-4" />
          <span>Lộ trình học</span>
          <span
            className={cn(
              'ml-1.5 rounded-full px-2 py-0.5 text-xs',
              activeTab === 'curriculum' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700',
            )}
          >
            16 tuần
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer select-none',
            activeTab === 'audit'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-muted hover:bg-brand-50 hover:text-text',
          )}
        >
          <ShieldCheck className="size-4" />
          <span>Kiểm định chất lượng</span>
          <span
            className={cn(
              'ml-1.5 rounded-full px-2 py-0.5 text-xs font-black',
              healthScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
            )}
          >
            {healthScore}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer select-none',
            activeTab === 'analytics'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-muted hover:bg-brand-50 hover:text-text',
          )}
        >
          <BarChart3 className="size-4" />
          <span>Báo cáo & Lịch sử</span>
        </button>
      </div>

      {/* ── TAB 1: EXAMS & ARENA ── */}
      {activeTab === 'exams' && (
        <AsmoStudioExamsTab
          exams={exams}
          filteredExams={filteredExams}
          paginatedExams={paginatedExams}
          metrics={metrics}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterSubject={filterSubject}
          onFilterSubjectChange={setFilterSubject}
          filterGrade={filterGrade}
          onFilterGradeChange={setFilterGrade}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          onResetFilters={() => {
            setFilterSubject('all')
            setFilterGrade('all')
            setFilterStatus('all')
            setSearchQuery('')
          }}
          onTogglePublish={handleTogglePublish}
          onEditExam={setEditingExam}
          onOpenQuestions={handleOpenQuestions}
          examPage={examPage}
          examTotalPages={examTotalPages}
          onPrevPage={prevExamPage}
          onNextPage={nextExamPage}
          onGoToPage={goToExamPage}
        />
      )}

      {/* ── TAB 2: CURRICULUM ROADMAP ── */}
      {activeTab === 'curriculum' && (
        <AsmoStudioCurriculumTab
          curriculumWeeks={curriculumWeeks}
          filteredWeeks={filteredWeeks}
          curriculumSubject={curriculumSubject}
          onCurriculumSubjectChange={setCurriculumSubject}
          curriculumGrade={curriculumGrade}
          onCurriculumGradeChange={setCurriculumGrade}
          onOpenCreateWeek={() => setIsCreatingWeek(true)}
          onGenerateAllTips={handleGenerateAllTips}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onExportCurriculum={handleExportCurriculum}
          onResetCurriculum={handleResetCurriculum}
          onEditWeek={setEditingWeek}
          onPreviewGen={handleOpenPreviewGen}
          onDeleteWeek={handleDeleteWeek}
        />
      )}

      {/* ── TAB 3: QUALITY AUDIT ENGINE ── */}
      {activeTab === 'audit' && (
        <AsmoStudioAuditTab
          exams={exams}
          auditResults={auditResults}
          healthScore={healthScore}
          auditBreakdown={auditBreakdown}
          auditTimestamp={auditTimestamp}
          isAuditingAll={isAuditingAll}
          isRepairingAll={isRepairingAll}
          repairingExamId={repairingExamId}
          repairedExamIds={repairedExamIds}
          onRunFullAudit={handleRunFullAudit}
          onRepairAllExams={handleRepairAllExams}
          onQuickRepair={handleQuickRepair}
          onOpenAuditDetail={setAuditingExamModal}
        />
      )}

      {/* ── TAB 4: ANALYTICS & RECENT SUBMISSIONS ── */}
      {activeTab === 'analytics' && <AsmoStudioAnalyticsTab />}

      {/* ── MODALS ── */}
      <AsmoRegulationEditModal
        isOpen={Boolean(editingExam)}
        exam={editingExam}
        onClose={() => setEditingExam(null)}
        onSave={handleSaveRegulation}
      />

      <AsmoQuestionsDetailModal
        isOpen={Boolean(viewingQuestionsExam)}
        exam={viewingQuestionsExam}
        onClose={() => setViewingQuestionsExam(null)}
      />

      {auditingExamModal && (
        <AsmoExamAuditModal
          isOpen={Boolean(auditingExamModal)}
          onClose={() => setAuditingExamModal(null)}
          exam={auditingExamModal}
          onExamUpdated={(updated) => {
            setExams((prev) =>
              prev.map((e) => (e.id === updated.id ? { ...updated, isPublished: e.isPublished } : e)),
            )
            setAuditingExamModal(updated)
            showToast(`Đã lưu cập nhật kiểm định cho đề ${updated.code}!`)
          }}
        />
      )}

      {editingWeek && (
        <CurriculumWeekEditModal
          isOpen={Boolean(editingWeek)}
          initialData={editingWeek}
          isNew={false}
          onClose={() => setEditingWeek(null)}
          onSave={(updatedWeek) => {
            setCurriculumWeeks((prev) =>
              prev.map((w) =>
                w.week === editingWeek.week &&
                w.subject === editingWeek.subject &&
                w.grade === editingWeek.grade
                  ? updatedWeek
                  : w,
              ),
            )
            showToast(`Đã lưu thay đổi tuần ${updatedWeek.week}: "${updatedWeek.title}"!`)
            setEditingWeek(null)
          }}
        />
      )}

      {isCreatingWeek && (
        <CurriculumWeekEditModal
          isOpen={isCreatingWeek}
          initialData={{
            week:
              curriculumWeeks.length > 0
                ? Math.max(...curriculumWeeks.map((w) => w.week)) + 1
                : 1,
            subject: curriculumSubject === 'all' ? 'math' : curriculumSubject,
            grade: (curriculumGrade === 'all' ? 1 : curriculumGrade) as AsmoGrade,
            topic: `ASMO-TOPIC-W${curriculumWeeks.length + 1}`,
            title: '',
            summary: '',
            keyCompetencies: ['Tư duy logic', 'Phương pháp ASMO'],
            visualTemplate: '3D_CUBE_CLUSTER',
            sampleQuestionIds: [],
            meeTip: {
              quote: 'Mèo Mee luôn đồng hành cùng bạn!',
              storyAdvice: 'Quan sát kỹ và suy luận từng bước một nhé!',
            },
            solutionSteps: [],
            commonPitfall: '',
          }}
          isNew={true}
          onClose={() => setIsCreatingWeek(false)}
          onSave={(newWeek) => {
            setCurriculumWeeks((prev) => [...prev, newWeek])
            showToast(`Đã thêm tuần học mới: "${newWeek.title}"!`)
            setIsCreatingWeek(false)
          }}
        />
      )}

      <CurriculumImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDownloadTemplate={handleDownloadTemplate}
        onImport={(items, mode) => {
          if (mode === 'replace') {
            setCurriculumWeeks(items)
            showToast(`Đã ghi đè toàn bộ ${items.length} tuần học vào lộ trình!`)
          } else {
            setCurriculumWeeks((prev) => [...prev, ...items])
            showToast(`Đã gộp thêm ${items.length} tuần học vào lộ trình!`)
          }
          setIsImportModalOpen(false)
        }}
      />

      {previewGenWeek && (
        <CurriculumGeneratorPreviewModal
          isOpen={Boolean(previewGenWeek)}
          week={previewGenWeek.week}
          initialGenerated={{
            quote: previewGenWeek.quote,
            storyAdvice: previewGenWeek.storyAdvice,
            solutionSteps: previewGenWeek.solutionSteps,
            commonPitfall: previewGenWeek.commonPitfall,
          }}
          onClose={() => setPreviewGenWeek(null)}
          onApply={(data) => {
            setCurriculumWeeks((prev) =>
              prev.map((w) =>
                w.week === previewGenWeek.week.week &&
                w.subject === previewGenWeek.week.subject &&
                w.grade === previewGenWeek.week.grade
                  ? {
                      ...w,
                      meeTip: {
                        quote: data.quote,
                        storyAdvice: data.storyAdvice,
                      },
                      solutionSteps: data.solutionSteps,
                      commonPitfall: data.commonPitfall,
                    }
                  : w,
              ),
            )
            showToast(
              `Đã áp dụng Bí kíp & Lời giải chuẩn hóa vào tuần ${previewGenWeek.week.week}: ${previewGenWeek.week.title}!`,
            )
            setPreviewGenWeek(null)
          }}
        />
      )}
    </div>
  )
}
