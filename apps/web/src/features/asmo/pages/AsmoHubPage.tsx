import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  Trophy,
  Sparkles,
  Box,
  Compass,
  Play,
  ArrowRight,
  BookOpen,
  Layers,
  Calendar,
  Loader2,
  CheckCircle2,
  Star,
  Zap,
  GraduationCap,
  ChevronRight,
  Search,
  School,
} from 'lucide-react'
import {
  ASMO_SUBJECTS,
  ASMO_GRADES,
  type AsmoGradeTier,
} from '../data/asmo-curriculum'
import {
  ASMO_LMS_STAGES,
  type AsmoLmsStage,
  type AsmoLmsLesson,
  type AsmoLmsProgressState,
  getLmsProgress,
} from '../data/asmo-curriculum-lms'
import { ASMO_JOURNEY_TOPICS, type AsmoJourneyTopic } from '../data/asmo-journey-topics'
import { listAsmoExams } from '@/shared/lib/asmo-api'
import type { AsmoExam, AsmoGrade, AsmoSubject } from '../types'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { AsmoFormula } from '../components/AsmoFormula'
import { AsmoExamAuditModal } from '../components/AsmoExamAuditModal'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

const AVAILABLE_YEARS: Array<number | 'all'> = ['all', 2023, 2022, 2021, 2020, 2018, 2016]

type StageFilterTab = 'auto' | 'primary' | 'secondary' | 'high' | 'all' | string

interface SubjectFilterState {
  grade: AsmoGrade
  year: number | 'all'
}

export function AsmoHubPage() {
  const navigate = useNavigate()
  const lmsCurriculumRef = useRef<HTMLDivElement>(null)
  const examArenaRef = useRef<HTMLDivElement>(null)

  // Current active selections for dynamic exam arena & LMS Academy
  const [selectedSubject, setSelectedSubject] = useState<AsmoSubject>('math')
  const [selectedGrade, setSelectedGrade] = useState<AsmoGrade>(1)
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')

  // Stage filter tab in LMS Academy section
  const [stageFilterTab, setStageFilterTab] = useState<StageFilterTab>('auto')

  // Per-card dropdown filter state
  const [subjectFilters, setSubjectFilters] = useState<Record<AsmoSubject, SubjectFilterState>>({
    math: { grade: 1, year: 'all' },
    science: { grade: 3, year: 'all' },
    english: { grade: 3, year: 'all' },
  })

  const [exams, setExams] = useState<AsmoExam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [auditingExam, setAuditingExam] = useState<AsmoExam | null>(null)
  const [lmsProgress, setLmsProgress] = useState<AsmoLmsProgressState>(getLmsProgress())

  // Refresh LMS progress on mount
  useEffect(() => {
    setLmsProgress(getLmsProgress())
  }, [])

  const currentSubjectMeta = ASMO_SUBJECTS[selectedSubject]
  const currentGradeMeta = ASMO_GRADES.find((g) => g.grade === selectedGrade)

  // Current grade tier: primary (1-5), secondary (6-9), high (10-12)
  const currentTier: AsmoGradeTier = useMemo(() => {
    if (selectedGrade <= 5) return 'primary'
    if (selectedGrade <= 9) return 'secondary'
    return 'high'
  }, [selectedGrade])

  // Fetch dynamic exams from backend gateway or mock fallback
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    listAsmoExams({
      subject: selectedSubject,
      grade: selectedGrade,
      year: selectedYear !== 'all' ? selectedYear : undefined,
    })
      .then((data) => {
        if (isMounted) {
          setExams(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedSubject, selectedGrade, selectedYear])

  // Handle grade change in specific subject card
  const handleCardGradeChange = (subject: AsmoSubject, grade: AsmoGrade) => {
    setSubjectFilters((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], grade },
    }))
    if (selectedSubject === subject) {
      setSelectedGrade(grade)
    }
  }

  // Handle year change in specific subject card
  const handleCardYearChange = (subject: AsmoSubject, year: number | 'all') => {
    setSubjectFilters((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], year },
    }))
    if (selectedSubject === subject) {
      setSelectedYear(year)
    }
  }

  // Smooth scroll helpers
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Action 1 from subject card: [ 📖 Học Lộ Trình LMS ]
  const handleCardLmsClick = (subject: AsmoSubject) => {
    const targetGrade = subjectFilters[subject].grade
    setSelectedSubject(subject)
    setSelectedGrade(targetGrade)
    setStageFilterTab('auto')
    scrollToSection(lmsCurriculumRef)
  }

  // Action 2 from subject card: [ ✍️ Thi Thử Olympic ]
  const handleCardExamClick = (subject: AsmoSubject) => {
    const targetGrade = subjectFilters[subject].grade
    const targetYear = subjectFilters[subject].year
    setSelectedSubject(subject)
    setSelectedGrade(targetGrade)
    setSelectedYear(targetYear)
    scrollToSection(examArenaRef)
  }

  // Filter LMS Stages according to selected tier & tab
  const displayedStages = useMemo(() => {
    const effectiveTier = stageFilterTab === 'auto' ? currentTier : stageFilterTab

    if (effectiveTier === 'primary') {
      // Tiểu học: Chặng 1, 2, 3 (và Chặng 4, 5 nếu lớp 4–5 hoặc xem toàn bộ)
      if (selectedGrade <= 3 && stageFilterTab === 'auto') {
        return ASMO_LMS_STAGES.filter((s) => s.stageNumber <= 3)
      }
      return ASMO_LMS_STAGES.filter((s) => s.stageNumber <= 5)
    }

    if (effectiveTier === 'secondary') {
      // THCS: Chặng 3, 4, 5
      return ASMO_LMS_STAGES.filter((s) => s.stageNumber >= 3)
    }

    if (effectiveTier === 'all') {
      return ASMO_LMS_STAGES
    }

    // Specific stage selected by ID
    const singleStage = ASMO_LMS_STAGES.find((s) => s.id === stageFilterTab)
    if (singleStage) {
      return [singleStage]
    }

    return ASMO_LMS_STAGES
  }, [currentTier, selectedGrade, stageFilterTab])

  // Filter High School Topics (12 Chuyên Đề Olympic)
  const highSchoolTopics = useMemo(() => {
    const effectiveTier = stageFilterTab === 'auto' ? currentTier : stageFilterTab
    if (effectiveTier === 'high' || stageFilterTab === 'high') {
      return ASMO_JOURNEY_TOPICS.filter((t) => t.gradeTier === 'high' || t.gradeTier === 'secondary')
    }
    return []
  }, [currentTier, stageFilterTab])

  // LMS metrics
  const totalCompletedLessons = useMemo(() => {
    return Object.values(lmsProgress.lessons).filter((l) => l.completed).length
  }, [lmsProgress])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 sm:space-y-10 p-4 sm:p-6 lg:p-8">
      {/* ── 1. HERO BANNER (SOFT CLAY & MASCOT MÈO MEE ĐỒNG HÀNH) ── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-brand-200/80 bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 p-6 sm:p-8 text-white shadow-clay">
        {/* Glow & Backdrop sparkles */}
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 size-80 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black backdrop-blur-md border border-white/20">
              <Trophy className="size-4 text-amber-300 fill-amber-300" />
              <span>Cổng Thi Đấu Olympic Quốc Tế ASMO</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Đấu Trường Olympic ASMO Lớp 1 – 12 🏆
            </h1>

            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed max-w-2xl font-medium">
              Hệ thống học tập chuẩn LMS &amp; Đề thi thử Olympic Toán, Khoa Học &amp; Tiếng Anh với mô phỏng 3D Three.js và Trợ giảng AI Mèo Mee đồng hành.
            </p>

            {/* 3 Nút Điều Hướng Nhanh */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={() => scrollToSection(lmsCurriculumRef)}
                className="gap-2 rounded-2xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 shadow-md border-0 px-5 py-2.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Compass className="size-4 text-slate-950" />
                <span>🧭 Lộ Trình Học 5 Chặng (LMS)</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => scrollToSection(examArenaRef)}
                className="gap-2 rounded-2xl bg-white/20 text-white hover:bg-white/30 border border-white/30 font-bold backdrop-blur-md px-5 py-2.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Trophy className="size-4 text-amber-300" />
                <span>🏆 Đấu Trường Thi Thử</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/asmo/journey')}
                className="gap-2 rounded-2xl bg-indigo-950/40 text-indigo-100 hover:bg-indigo-950/60 border border-indigo-300/30 font-bold backdrop-blur-md px-4 py-2.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="size-4 text-amber-300" />
                <span>✨ Chặng Học 3D &amp; Phòng Lab</span>
              </Button>
            </div>
          </div>

          {/* Hero Companion Avatar Badge */}
          <div className="hidden md:flex flex-col items-center shrink-0">
            <div className="relative size-32 lg:size-36 rounded-3xl bg-white/15 backdrop-blur-md border-2 border-white/30 p-2 shadow-clay flex items-center justify-center">
              <AikidCatCharacter pose="welcome" className="size-28 lg:size-32 object-contain drop-shadow-md" />
              <div className="absolute -bottom-2 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black text-slate-950 shadow-xs uppercase tracking-wider">
                Mèo Mee Đồng Hành
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TRỢ GIẢNG MÈO MEE (TINH GỌN, THÂN THIỆN) ── */}
      <AsmoMeeTutor
        pose="welcome"
        speech={`Chào bạn nhỏ! Mee đã sẵn sàng đồng hành cùng con chinh phục Đấu Trường Olympic ASMO môn ${currentSubjectMeta.name} (${currentGradeMeta?.label || 'Lớp ' + selectedGrade}). Hãy chọn lộ trình học LMS hoặc vào đấu trường thi thử ngay nhé! 🚀`}
        hint="Bí kíp Mèo Mee: Con có thể chọn 'Học Lộ Trình LMS' để nắm vững từng đơn vị kiến thức và làm bài tập tương tác trước khi bước vào 'Thi Thử Olympic' tính giờ thật!"
      />

      {/* ── 3. 3 CARD MÔN HỌC TO RÕ RÀNG (GRID 3 CỘT VỚI 2 LỰA CHỌN: HỌC LMS HAY THI THỬ) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-brand-600" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
              Chọn Môn Học Olympic &amp; Khối Lớp Thi Đấu
            </h2>
          </div>
          <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hidden sm:inline-block">
            Toàn diện Khối Lớp 1 – 12 · Năm 2016 – 2023
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* ── CARD 1: TOÁN OLYMPIC ASMO ── */}
          <div
            className={cn(
              'group relative flex flex-col justify-between rounded-3xl border-2 p-5 sm:p-6 transition-all duration-200 shadow-clay',
              selectedSubject === 'math'
                ? 'border-indigo-400 bg-gradient-to-b from-indigo-50/90 via-white to-white ring-2 ring-indigo-300'
                : 'border-indigo-100 bg-white/95 hover:border-indigo-300 hover:shadow-md',
            )}
          >
            <div>
              {/* Header Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-100 border-2 border-indigo-200 shadow-xs text-2xl">
                    📐
                  </div>
                  <div className="size-12 rounded-2xl bg-indigo-50 border border-indigo-100 p-1 flex items-center justify-center">
                    <AikidCatCharacter pose="thinking" className="size-10 object-contain drop-shadow-xs" />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-xl bg-indigo-100 border border-indigo-200 px-2.5 py-1 text-xs font-black text-indigo-700">
                    Lớp 1 – 12
                  </span>
                  {selectedSubject === 'math' && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      Đang chọn
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-display text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Toán Olympic ASMO
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Số học, hình học 3D, đại số &amp; tổ hợp chuyên sâu theo chuẩn quốc tế.
                </p>
              </div>

              {/* Menu Chọn Lớp & Năm Thi Gọn Gàng bằng Select Soft Clay */}
              <div className="mt-4 space-y-3 rounded-2xl bg-indigo-50/60 p-3.5 border-2 border-indigo-100">
                <div className="space-y-1.5">
                  <label htmlFor="math-grade-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Layers className="size-3 text-indigo-600" />
                    <span>Khối Lớp</span>
                  </label>
                  <select
                    id="math-grade-select"
                    value={subjectFilters.math.grade}
                    onChange={(e) => handleCardGradeChange('math', Number(e.target.value) as AsmoGrade)}
                    className="w-full rounded-xl border-2 border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                  >
                    <optgroup label="🎒 Tiểu học (Lớp 1 – 5)">
                      <option value={1}>Lớp 1 (6–7 tuổi)</option>
                      <option value={2}>Lớp 2 (7–8 tuổi)</option>
                      <option value={3}>Lớp 3 (8–9 tuổi)</option>
                      <option value={4}>Lớp 4 (9–10 tuổi)</option>
                      <option value={5}>Lớp 5 (10–11 tuổi)</option>
                    </optgroup>
                    <optgroup label="🏫 THCS (Lớp 6 – 9)">
                      <option value={6}>Lớp 6 (11–12 tuổi)</option>
                      <option value={7}>Lớp 7 (12–13 tuổi)</option>
                      <option value={8}>Lớp 8 (13–14 tuổi)</option>
                      <option value={9}>Lớp 9 (14–15 tuổi)</option>
                    </optgroup>
                    <optgroup label="🎓 THPT (Lớp 10 – 12)">
                      <option value={10}>Lớp 10 (15–16 tuổi)</option>
                      <option value={11}>Lớp 11 (16–17 tuổi)</option>
                      <option value={12}>Lớp 12 (17–18 tuổi)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="math-year-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar className="size-3 text-indigo-600" />
                    <span>Năm Thi</span>
                  </label>
                  <select
                    id="math-year-select"
                    value={subjectFilters.math.year}
                    onChange={(e) => handleCardYearChange('math', e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                  >
                    <option value="all">Tất cả các năm (2016 – 2023)</option>
                    {AVAILABLE_YEARS.filter((y): y is number => y !== 'all').map((yr) => (
                      <option key={yr} value={yr}>
                        Năm {yr} {yr === 2023 ? '(Mới nhất)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2 NÚT HÀNH ĐỘNG RÕ RÀNG */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleCardLmsClick('math')}
                className="gap-1.5 rounded-2xl bg-amber-100/90 text-amber-900 border-2 border-amber-300/80 hover:bg-amber-200 font-extrabold text-xs py-2.5 px-2 shadow-xs transition-transform active:scale-95 cursor-pointer justify-center"
              >
                <Compass className="size-3.5 text-amber-700 shrink-0" />
                <span className="truncate">Học Lộ Trình LMS</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleCardExamClick('math')}
                className="gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 text-white font-extrabold text-xs py-2.5 px-2 shadow-md transition-transform active:scale-95 cursor-pointer justify-center"
              >
                <Play className="size-3 fill-current shrink-0" />
                <span className="truncate">Thi Thử Olympic</span>
              </Button>
            </div>
          </div>

          {/* ── CARD 2: KHOA HỌC TỰ NHIÊN ASMO ── */}
          <div
            className={cn(
              'group relative flex flex-col justify-between rounded-3xl border-2 p-5 sm:p-6 transition-all duration-200 shadow-clay',
              selectedSubject === 'science'
                ? 'border-emerald-400 bg-gradient-to-b from-emerald-50/90 via-white to-white ring-2 ring-emerald-300'
                : 'border-emerald-100 bg-white/95 hover:border-emerald-300 hover:shadow-md',
            )}
          >
            <div>
              {/* Header Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 border-2 border-emerald-200 shadow-xs text-2xl">
                    🔬
                  </div>
                  <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-100 p-1 flex items-center justify-center">
                    <AikidCatCharacter pose="guide" className="size-10 object-contain drop-shadow-xs" />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-xl bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-xs font-black text-emerald-700">
                    Lớp 1 – 12
                  </span>
                  {selectedSubject === 'science' && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      Đang chọn
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-display text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Khoa Học Tự Nhiên ASMO
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sinh học, Vật lý, Hoá học, Thiên văn &amp; Môi trường thực nghiệm.
                </p>
              </div>

              {/* Menu Chọn Lớp & Năm Thi Gọn Gàng bằng Select Soft Clay */}
              <div className="mt-4 space-y-3 rounded-2xl bg-emerald-50/60 p-3.5 border-2 border-emerald-100">
                <div className="space-y-1.5">
                  <label htmlFor="science-grade-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Layers className="size-3 text-emerald-600" />
                    <span>Khối Lớp</span>
                  </label>
                  <select
                    id="science-grade-select"
                    value={subjectFilters.science.grade}
                    onChange={(e) => handleCardGradeChange('science', Number(e.target.value) as AsmoGrade)}
                    className="w-full rounded-xl border-2 border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
                  >
                    <optgroup label="🎒 Tiểu học (Lớp 1 – 5)">
                      <option value={1}>Lớp 1 (6–7 tuổi)</option>
                      <option value={2}>Lớp 2 (7–8 tuổi)</option>
                      <option value={3}>Lớp 3 (8–9 tuổi)</option>
                      <option value={4}>Lớp 4 (9–10 tuổi)</option>
                      <option value={5}>Lớp 5 (10–11 tuổi)</option>
                    </optgroup>
                    <optgroup label="🏫 THCS (Lớp 6 – 9)">
                      <option value={6}>Lớp 6 (11–12 tuổi)</option>
                      <option value={7}>Lớp 7 (12–13 tuổi)</option>
                      <option value={8}>Lớp 8 (13–14 tuổi)</option>
                      <option value={9}>Lớp 9 (14–15 tuổi)</option>
                    </optgroup>
                    <optgroup label="🎓 THPT (Lớp 10 – 12)">
                      <option value={10}>Lớp 10 (15–16 tuổi)</option>
                      <option value={11}>Lớp 11 (16–17 tuổi)</option>
                      <option value={12}>Lớp 12 (17–18 tuổi)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="science-year-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar className="size-3 text-emerald-600" />
                    <span>Năm Thi</span>
                  </label>
                  <select
                    id="science-year-select"
                    value={subjectFilters.science.year}
                    onChange={(e) => handleCardYearChange('science', e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
                  >
                    <option value="all">Tất cả các năm (2016 – 2023)</option>
                    {AVAILABLE_YEARS.filter((y): y is number => y !== 'all').map((yr) => (
                      <option key={yr} value={yr}>
                        Năm {yr} {yr === 2023 ? '(Mới nhất)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2 NÚT HÀNH ĐỘNG RÕ RÀNG */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleCardLmsClick('science')}
                className="gap-1.5 rounded-2xl bg-amber-100/90 text-amber-900 border-2 border-amber-300/80 hover:bg-amber-200 font-extrabold text-xs py-2.5 px-2 shadow-xs transition-transform active:scale-95 cursor-pointer justify-center"
              >
                <Compass className="size-3.5 text-amber-700 shrink-0" />
                <span className="truncate">Học Lộ Trình LMS</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleCardExamClick('science')}
                className="gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs py-2.5 px-2 shadow-md transition-transform active:scale-95 cursor-pointer justify-center"
              >
                <Play className="size-3 fill-current shrink-0" />
                <span className="truncate">Thi Thử Olympic</span>
              </Button>
            </div>
          </div>

          {/* ── CARD 3: TIẾNG ANH HỌC THUẬT ASMO ── */}
          <div
            className={cn(
              'group relative flex flex-col justify-between rounded-3xl border-2 p-5 sm:p-6 transition-all duration-200 shadow-clay',
              selectedSubject === 'english'
                ? 'border-amber-400 bg-gradient-to-b from-amber-50/90 via-white to-white ring-2 ring-amber-300'
                : 'border-amber-100 bg-white/95 hover:border-amber-300 hover:shadow-md',
            )}
          >
            <div>
              {/* Header Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 border-2 border-amber-200 shadow-xs text-2xl">
                    🇬🇧
                  </div>
                  <div className="size-12 rounded-2xl bg-amber-50 border border-amber-100 p-1 flex items-center justify-center">
                    <AikidCatCharacter pose="welcome" className="size-10 object-contain drop-shadow-xs" />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-xl bg-amber-100 border border-amber-200 px-2.5 py-1 text-xs font-black text-amber-800">
                    Lớp 1 – 12
                  </span>
                  {selectedSubject === 'english' && (
                    <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      Đang chọn
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-display text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  Tiếng Anh Học Thuật ASMO
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Từ vựng học thuật, ngữ pháp thi đấu, đọc hiểu &amp; suy luận logic.
                </p>
              </div>

              {/* Menu Chọn Lớp & Năm Thi Gọn Gàng bằng Select Soft Clay */}
              <div className="mt-4 space-y-3 rounded-2xl bg-amber-50/60 p-3.5 border-2 border-amber-100">
                <div className="space-y-1.5">
                  <label htmlFor="english-grade-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Layers className="size-3 text-amber-600" />
                    <span>Khối Lớp</span>
                  </label>
                  <select
                    id="english-grade-select"
                    value={subjectFilters.english.grade}
                    onChange={(e) => handleCardGradeChange('english', Number(e.target.value) as AsmoGrade)}
                    className="w-full rounded-xl border-2 border-amber-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
                  >
                    <optgroup label="🎒 Tiểu học (Lớp 1 – 5)">
                      <option value={1}>Lớp 1 (6–7 tuổi)</option>
                      <option value={2}>Lớp 2 (7–8 tuổi)</option>
                      <option value={3}>Lớp 3 (8–9 tuổi)</option>
                      <option value={4}>Lớp 4 (9–10 tuổi)</option>
                      <option value={5}>Lớp 5 (10–11 tuổi)</option>
                    </optgroup>
                    <optgroup label="🏫 THCS (Lớp 6 – 9)">
                      <option value={6}>Lớp 6 (11–12 tuổi)</option>
                      <option value={7}>Lớp 7 (12–13 tuổi)</option>
                      <option value={8}>Lớp 8 (13–14 tuổi)</option>
                      <option value={9}>Lớp 9 (14–15 tuổi)</option>
                    </optgroup>
                    <optgroup label="🎓 THPT (Lớp 10 – 12)">
                      <option value={10}>Lớp 10 (15–16 tuổi)</option>
                      <option value={11}>Lớp 11 (16–17 tuổi)</option>
                      <option value={12}>Lớp 12 (17–18 tuổi)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="english-year-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar className="size-3 text-amber-600" />
                    <span>Năm Thi</span>
                  </label>
                  <select
                    id="english-year-select"
                    value={subjectFilters.english.year}
                    onChange={(e) => handleCardYearChange('english', e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-amber-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
                  >
                    <option value="all">Tất cả các năm (2016 – 2023)</option>
                    {AVAILABLE_YEARS.filter((y): y is number => y !== 'all').map((yr) => (
                      <option key={yr} value={yr}>
                        Năm {yr} {yr === 2023 ? '(Mới nhất)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2 NÚT HÀNH ĐỘNG RÕ RÀNG */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleCardLmsClick('english')}
                className="gap-1.5 rounded-2xl bg-amber-100/90 text-amber-900 border-2 border-amber-300/80 hover:bg-amber-200 font-extrabold text-xs py-2.5 px-2 shadow-xs transition-transform active:scale-95 cursor-pointer justify-center"
              >
                <Compass className="size-3.5 text-amber-700 shrink-0" />
                <span className="truncate">Học Lộ Trình LMS</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleCardExamClick('english')}
                className="gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs py-2.5 px-2 shadow-md transition-transform active:scale-95 cursor-pointer justify-center"
              >
                <Play className="size-3 fill-current shrink-0" />
                <span className="truncate">Thi Thử Olympic</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. PHÒNG THÍ NGHIỆM 3D: 1 CARD TO CATEGORY DUY NHẤT (BIG FEATURED CATEGORY CARD) ── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-300/40 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 sm:p-8 text-white shadow-clay">
        {/* Glowing lighting backdrop */}
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 size-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 px-3 py-1 text-xs font-black text-indigo-200 backdrop-blur-md">
                <Box className="size-3.5 text-indigo-300 animate-pulse" />
                <span>Phòng Thí Nghiệm 3D (Three.js)</span>
              </span>
              <span className="rounded-full bg-amber-400/20 border border-amber-300/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                ✨ 12 Chuyên đề trực quan
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>Phòng Thí Nghiệm &amp; Mô Phỏng Không Gian 3D</span>
              <span className="text-xl sm:text-2xl">🧭✨</span>
            </h2>

            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Trực quan hóa hình học không gian 3D tương tác xoay 360°, bẻ gập khối đa diện và sơ đồ đường đi theo chuẩn Olympic ASMO.
            </p>

            {/* 4 Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-sm">
                🔄 Xoay 360° tương tác
              </span>
              <span className="rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-sm">
                📦 Khai triển Net Cube &amp; Khối đa diện
              </span>
              <span className="rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-sm">
                🗺️ Mê cung đồ thị &amp; Sơ đồ đường đi
              </span>
              <span className="rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-sm">
                📐 Đa diện &amp; Lượng giác
              </span>
            </div>
          </div>

          {/* Mascot & 2 Nút Hành Động Lớn */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 w-full lg:w-auto shrink-0">
            <div className="hidden lg:flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-3 py-1.5 backdrop-blur-md mb-1">
              <AikidCatCharacter pose="thinking" className="size-8 object-contain drop-shadow-xs" />
              <span className="text-xs font-bold text-indigo-100">Lab 3D chuẩn Quốc tế</span>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/asmo/lab')}
              className="gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-black text-sm px-6 py-3.5 shadow-lg shadow-indigo-500/30 border-0 transition-transform active:scale-95 cursor-pointer text-center justify-center w-full sm:w-auto"
            >
              <span>🚀 Mở Phòng Lab 3D</span>
              <ArrowRight className="size-4" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/asmo/journey')}
              className="gap-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-6 py-3.5 border border-white/30 backdrop-blur-md transition-transform active:scale-95 cursor-pointer text-center justify-center w-full sm:w-auto"
            >
              <Sparkles className="size-4 text-amber-300" />
              <span>✨ Khám Phá 12 Chuyên Đề 3D</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── KHU VỰC 1: 🧭 LỘ TRÌNH HỌC TẬP TUẦN TỰ (LMS ACADEMY - FULL WIDTH) ── */}
      <div
        id="lms-curriculum-section"
        ref={lmsCurriculumRef}
        className="rounded-3xl border-2 border-brand-200 bg-white/95 p-6 sm:p-8 shadow-clay backdrop-blur-md space-y-6"
      >
        {/* Header Khu Vực 1 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-md text-2xl shrink-0">
              🧭
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                  ⭐ LMS Academy Tuần Tự
                </span>
                <span className="rounded-full bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-black text-indigo-800">
                  {currentSubjectMeta.name} · {currentGradeMeta?.label || `Lớp ${selectedGrade}`}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Lộ Trình Học Tập Chuẩn LMS ASMO
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Giáo trình 5 Chặng tuần tự chuẩn quốc tế · Tương tác trực quan cùng Trợ giảng AI Mèo Mee
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Progress Stats */}
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-black text-amber-900 shadow-2xs">
              <Star className="size-4 text-amber-500 fill-amber-500" />
              <span>{lmsProgress.totalStars} Sao ⭐</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-sky-50 border border-sky-200 px-3.5 py-1.5 text-xs font-black text-sky-800 shadow-2xs">
              <Zap className="size-4 text-sky-500 fill-sky-500" />
              <span>{lmsProgress.totalXp} XP</span>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/asmo/curriculum')}
              className="gap-1.5 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-800 border-2 border-brand-200 font-extrabold text-xs py-2 px-3.5 cursor-pointer"
            >
              <Compass className="size-3.5 text-brand-700" />
              <span>🗺️ Bản Đồ Đảo LMS</span>
            </Button>
          </div>
        </div>

        {/* Bộ lọc Chặng Học / Khối Lớp */}
        <div className="flex items-center gap-2 flex-wrap bg-slate-50/80 p-2 rounded-2xl border border-slate-200">
          <span className="text-xs font-extrabold text-slate-500 px-2 flex items-center gap-1">
            <School className="size-3.5 text-slate-600" />
            <span>Phân đoạn:</span>
          </span>

          <button
            type="button"
            onClick={() => setStageFilterTab('auto')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border',
              stageFilterTab === 'auto'
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
            )}
          >
            🎯 Theo Lớp Đang Chọn ({currentGradeMeta?.label || `Lớp ${selectedGrade}`})
          </button>

          <button
            type="button"
            onClick={() => setStageFilterTab('primary')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border',
              stageFilterTab === 'primary'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
            )}
          >
            🎒 Tiểu học (Lớp 1 – 5: Chặng 1, 2, 3)
          </button>

          <button
            type="button"
            onClick={() => setStageFilterTab('secondary')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border',
              stageFilterTab === 'secondary'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
            )}
          >
            🏫 THCS (Lớp 6 – 9: Chặng 3, 4, 5)
          </button>

          <button
            type="button"
            onClick={() => setStageFilterTab('high')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border',
              stageFilterTab === 'high'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
            )}
          >
            🎓 THPT (Lớp 10 – 12: 12 Chuyên Đề Olympic)
          </button>

          <button
            type="button"
            onClick={() => setStageFilterTab('all')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ml-auto',
              stageFilterTab === 'all'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
            )}
          >
            🌟 Tất Cả 5 Chặng
          </button>
        </div>

        {/* Danh Sách Các Chặng Học Chuẩn LMS */}
        <div className="space-y-6">
          {displayedStages.map((stage) => (
            <div
              key={stage.id}
              className="rounded-3xl border-2 border-slate-200/90 bg-slate-50/50 p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 shadow-2xs text-2xl shrink-0">
                    {stage.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-brand-100 text-brand-800 font-black text-[10px] px-2 py-0.5">
                        Chặng {stage.stageNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {stage.lessons.length} Bài học tương tác
                      </span>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {stage.title}
                    </h3>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium sm:text-right max-w-sm">
                  {stage.description}
                </div>
              </div>

              {/* Grid Bài Học Trong Chặng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stage.lessons.map((lesson) => {
                  const lessonProgress = lmsProgress.lessons[lesson.id]
                  const isCompleted = Boolean(lessonProgress?.completed)

                  return (
                    <div
                      key={lesson.id}
                      className={cn(
                        'group relative flex flex-col justify-between rounded-2xl border-2 p-4 transition-all duration-200 shadow-xs hover:shadow-md hover:bg-white',
                        isCompleted
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-slate-200 bg-white/90 hover:border-brand-300',
                      )}
                    >
                      <div>
                        {/* Top Lesson Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-xl group-hover:scale-105 transition-transform">
                              {lesson.icon}
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-500">
                                Bài {stage.stageNumber}.{lesson.lessonNumber}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                <Zap className="size-3 text-amber-500 fill-amber-500" />
                                <span>+{lesson.xpReward} XP</span>
                              </div>
                            </div>
                          </div>

                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              <span>Hoàn thành</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                              Mở khóa
                            </span>
                          )}
                        </div>

                        {/* Title KaTeX & Subtitle */}
                        <div className="mt-3">
                          <AsmoFormula
                            text={lesson.title}
                            className="font-display font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2"
                          />
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {lesson.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => navigate(`/asmo/curriculum/lesson/${lesson.id}`)}
                          className={cn(
                            'w-full gap-1.5 rounded-xl font-black text-xs py-2 shadow-xs transition-transform active:scale-95 cursor-pointer justify-center',
                            isCompleted
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-brand-600 hover:bg-brand-700 text-white',
                          )}
                        >
                          <span>{isCompleted ? 'Ôn Tập Lại ➔' : 'Vào Học Ngay ➔'}</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Nếu chọn THPT (Khối 10 – 12), hiển thị 12 Chuyên Đề Olympic */}
          {highSchoolTopics.length > 0 && (
            <div className="rounded-3xl border-2 border-purple-200 bg-purple-50/40 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-purple-200/60 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-2xs text-2xl shrink-0">
                    🎓
                  </div>
                  <div>
                    <span className="rounded-md bg-purple-200 text-purple-900 font-black text-[10px] px-2 py-0.5 uppercase">
                      Chuyên Đề Chuyên Sâu THPT
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      12 Chuyên Đề Olympic Toán Quốc Tế ASMO
                    </h3>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/asmo/journey')}
                  className="rounded-xl text-xs font-bold py-1.5 px-3 bg-white text-purple-800 border border-purple-200 hover:bg-purple-100"
                >
                  <span>Xem Chi Tiết 12 Chuyên Đề ➔</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {highSchoolTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex flex-col justify-between rounded-2xl border-2 border-purple-200/80 bg-white p-4 transition-all hover:border-purple-400 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{topic.icon}</span>
                        <span className="rounded-md bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5">
                          {topic.topicCode}
                        </span>
                      </div>
                      <AsmoFormula text={topic.title} className="font-bold text-sm text-slate-900 line-clamp-2" />
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{topic.subtitle}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-purple-100">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => navigate(`/asmo/journey?topic=${topic.id}`)}
                        className="w-full gap-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 shadow-xs cursor-pointer justify-center"
                      >
                        <span>Khám Phá Chuyên Đề ➔</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── KHU VỰC 2: 🏆 ĐẤU TRƯỜNG THI THỬ OLYMPIC ASMO (EXAM ARENA - FULL WIDTH) ── */}
      <div
        id="exam-arena-section"
        ref={examArenaRef}
        className="rounded-3xl border-2 border-indigo-200 bg-white/95 p-6 sm:p-8 shadow-clay backdrop-blur-md space-y-6"
      >
        {/* Header Khu Vực 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md text-2xl shrink-0">
              <Trophy className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-100 border border-brand-200 px-2.5 py-0.5 text-[10px] font-black text-brand-800 uppercase">
                  🏆 Đấu Trường Thi Thử
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {currentSubjectMeta.name} · {currentGradeMeta?.label || `Lớp ${selectedGrade}`} · {selectedYear === 'all' ? 'Tất cả năm' : `Năm ${selectedYear}`}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Đấu Trường Thi Thử Olympic ASMO
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-brand-50 border-2 border-brand-100 px-4 py-2 text-xs font-black text-brand-700 shadow-2xs">
              {isLoading ? 'Đang tải đề...' : `${exams.length} bộ đề thi`}
            </span>
            <div className="size-12 rounded-2xl bg-amber-50 border border-amber-100 p-1 flex items-center justify-center">
              <AikidCatCharacter pose="celebrate" className="size-10 object-contain drop-shadow-xs" />
            </div>
          </div>
        </div>

        {/* 3 Tab Môn Học Rõ Ràng */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-100/80 p-2 rounded-2xl border-2 border-slate-200/80">
          <button
            type="button"
            onClick={() => setSelectedSubject('math')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer',
              selectedSubject === 'math'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            )}
          >
            <span>📐</span>
            <span className="hidden sm:inline">Toán Olympic</span>
            <span className="sm:hidden">Toán</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubject('science')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer',
              selectedSubject === 'science'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            )}
          >
            <span>🔬</span>
            <span className="hidden sm:inline">Khoa Học Tự Nhiên</span>
            <span className="sm:hidden">Khoa Học</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubject('english')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer',
              selectedSubject === 'english'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            )}
          >
            <span>🇬🇧</span>
            <span className="hidden sm:inline">Tiếng Anh Học Thuật</span>
            <span className="sm:hidden">Tiếng Anh</span>
          </button>
        </div>

        {/* Bộ Lọc Khối Lớp & Năm Thi Gọn Gàng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/90 p-4 rounded-2xl border-2 border-slate-200">
          <div className="space-y-1.5">
            <label htmlFor="arena-grade-select" className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="size-3.5 text-brand-600" />
              <span>Khối Lớp Thi Đấu</span>
            </label>
            <select
              id="arena-grade-select"
              value={selectedGrade}
              onChange={(e) => {
                const newGrade = Number(e.target.value) as AsmoGrade
                setSelectedGrade(newGrade)
                handleCardGradeChange(selectedSubject, newGrade)
              }}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all cursor-pointer"
            >
              <optgroup label="🎒 Tiểu học (Lớp 1 – 5)">
                <option value={1}>Lớp 1 (6–7 tuổi)</option>
                <option value={2}>Lớp 2 (7–8 tuổi)</option>
                <option value={3}>Lớp 3 (8–9 tuổi)</option>
                <option value={4}>Lớp 4 (9–10 tuổi)</option>
                <option value={5}>Lớp 5 (10–11 tuổi)</option>
              </optgroup>
              <optgroup label="🏫 THCS (Lớp 6 – 9)">
                <option value={6}>Lớp 6 (11–12 tuổi)</option>
                <option value={7}>Lớp 7 (12–13 tuổi)</option>
                <option value={8}>Lớp 8 (13–14 tuổi)</option>
                <option value={9}>Lớp 9 (14–15 tuổi)</option>
              </optgroup>
              <optgroup label="🎓 THPT (Lớp 10 – 12)">
                <option value={10}>Lớp 10 (15–16 tuổi)</option>
                <option value={11}>Lớp 11 (16–17 tuổi)</option>
                <option value={12}>Lớp 12 (17–18 tuổi)</option>
              </optgroup>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="arena-year-select" className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-brand-600" />
              <span>Năm Thi Olympic</span>
            </label>
            <select
              id="arena-year-select"
              value={selectedYear}
              onChange={(e) => {
                const newYear = e.target.value === 'all' ? 'all' : Number(e.target.value)
                setSelectedYear(newYear)
                handleCardYearChange(selectedSubject, newYear)
              }}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all cursor-pointer"
            >
              <option value="all">Tất cả các năm (2016 – 2023)</option>
              {AVAILABLE_YEARS.filter((y): y is number => y !== 'all').map((yr) => (
                <option key={yr} value={yr}>
                  Năm {yr} {yr === 2023 ? '(Mới nhất)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Danh Sách Đề Thi Soft Clay Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/30 p-10 text-center text-brand-700">
              <Loader2 className="size-8 animate-spin text-brand-600 mb-2" />
              <p className="text-sm font-bold">Đang tải ngân hàng đề thi Olympic ASMO...</p>
              <p className="text-xs text-brand-500 mt-1">Hệ thống đang kết nối Gateway LMS và kiểm toán KaTeX</p>
            </div>
          ) : exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col justify-between rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 transition-all hover:bg-brand-50/40 hover:border-brand-300 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-brand-100 text-brand-700 font-mono text-[10px] font-black px-2 py-0.5">
                          {exam.code}
                        </span>
                        <span className="rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5">
                          {exam.year} · {exam.round}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        ⏱️ {exam.durationMinutes} phút · 📝 {exam.questions.length} câu
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {exam.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-600">
                      🎯 Điểm đạt: <strong className="text-emerald-700">{exam.passScore}</strong>/{exam.totalPoints}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setAuditingExam(exam)}
                        className="gap-1 rounded-xl text-xs font-bold py-1.5 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                      >
                        <Sparkles className="size-3 text-indigo-600" />
                        <span>Thẩm định 🔍</span>
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => navigate(`/asmo/exam/${exam.id}`)}
                        className="gap-1.5 rounded-xl text-xs font-bold py-1.5 px-3.5 bg-brand-600 hover:bg-brand-700 text-white shadow-xs cursor-pointer"
                      >
                        <Play className="size-3 fill-current" />
                        <span>Làm Đề Ngay ▶</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center text-slate-500 space-y-3">
              <BookOpen className="size-10 mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-800">Chưa có đề thi cho bộ lọc này</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Vui lòng thử chọn khối lớp khác hoặc chọn &quot;Tất cả các năm&quot; để tìm thấy đề thi phù hợp nhé!
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedYear('all')
                  setSelectedGrade(1)
                }}
                className="rounded-xl text-xs font-bold py-1.5 px-4"
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── AUDIT MODAL ── */}
      {auditingExam && (
        <AsmoExamAuditModal
          isOpen={Boolean(auditingExam)}
          onClose={() => setAuditingExam(null)}
          exam={auditingExam}
        />
      )}
    </div>
  )
}
