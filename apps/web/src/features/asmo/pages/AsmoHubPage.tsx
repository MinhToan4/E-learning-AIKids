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
} from 'lucide-react'
import {
  ASMO_SUBJECTS,
  ASMO_GRADES,
  ASMO_CURRICULUM_WEEKS,
} from '../data/asmo-curriculum'
import { listAsmoExams } from '@/shared/lib/asmo-api'
import type { AsmoExam, AsmoGrade, AsmoSubject } from '../types'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { AsmoExamAuditModal } from '../components/AsmoExamAuditModal'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

const AVAILABLE_YEARS: Array<number | 'all'> = ['all', 2023, 2022, 2021, 2020, 2018, 2016]

interface SubjectFilterState {
  grade: AsmoGrade
  year: number | 'all'
}

export function AsmoHubPage() {
  const navigate = useNavigate()
  const examArenaRef = useRef<HTMLDivElement>(null)

  // Current active selections for dynamic exam arena
  const [selectedSubject, setSelectedSubject] = useState<AsmoSubject>('math')
  const [selectedGrade, setSelectedGrade] = useState<AsmoGrade>(1)
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')

  // Per-card dropdown filter state
  const [subjectFilters, setSubjectFilters] = useState<Record<AsmoSubject, SubjectFilterState>>({
    math: { grade: 1, year: 'all' },
    science: { grade: 3, year: 'all' },
    english: { grade: 3, year: 'all' },
  })

  const [exams, setExams] = useState<AsmoExam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [auditingExam, setAuditingExam] = useState<AsmoExam | null>(null)

  const currentSubjectMeta = ASMO_SUBJECTS[selectedSubject]
  const currentGradeMeta = ASMO_GRADES.find((g) => g.grade === selectedGrade)

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

  // Filter curriculum weeks
  const filteredWeeks = useMemo(() => {
    return ASMO_CURRICULUM_WEEKS.filter((w) => w.subject === selectedSubject)
  }, [selectedSubject])

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

  // Handle entering subject exam arena
  const handleEnterSubjectArena = (subject: AsmoSubject) => {
    const targetGrade = subjectFilters[subject].grade
    const targetYear = subjectFilters[subject].year
    setSelectedSubject(subject)
    setSelectedGrade(targetGrade)
    setSelectedYear(targetYear)

    // Smooth scroll down to Exam Arena
    if (examArenaRef.current) {
      examArenaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* ── 1. HERO BANNER (TINH GỌN & SANG TRỌNG) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-200/60 bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 p-6 text-white shadow-clay sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
            <Trophy className="size-3.5 text-amber-300" />
            <span>Cổng Thi Đấu Olympic Quốc Tế</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Đấu Trường Olympic ASMO Lớp 1 – 12 🏆
          </h1>

          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed max-w-2xl">
            Hệ thống đề thi Olympic Toán, Khoa Học &amp; Tiếng Anh với mô phỏng 3D Three.js và Trợ giảng AI Mèo Mee đồng hành.
          </p>

          {/* 2 Nút Hành Động Rõ Ràng */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/asmo/curriculum')}
              className="gap-2 rounded-2xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 shadow-md border-0 px-5 py-2.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Compass className="size-4 text-slate-950" />
              <span>🧭 Lộ Trình Học 5 Chặng (LMS)</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/asmo/journey')}
              className="gap-2 rounded-2xl bg-white/20 text-white hover:bg-white/30 border border-white/30 font-bold backdrop-blur-md px-5 py-2.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="size-4 text-amber-300" />
              <span>✨ Chặng Học 3D &amp; Phòng Lab</span>
            </Button>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-15 lg:opacity-25 pointer-events-none">
          <Trophy className="size-80 text-white" />
        </div>
      </div>

      {/* ── 2. TRỢ GIẢNG MÈO MEE (TINH GỌN, THÂN THIỆN) ── */}
      <AsmoMeeTutor
        pose="welcome"
        speech={`Chào bạn nhỏ! Mee đã sẵn sàng đồng hành cùng con chinh phục Đấu Trường Olympic ASMO môn ${currentSubjectMeta.name} (${currentGradeMeta?.label}). Hãy chọn lớp và năm thi để bắt đầu làm bài nhé! 🚀`}
        hint="Bí kíp Mèo Mee: Khi làm bài toán hình học hoặc tư duy không gian, con hãy xoay mô hình 3D 360 độ để quan sát mọi góc nhìn trước khi chọn đáp án nhé!"
      />

      {/* ── 3. 3 CARD MÔN HỌC TO RÕ RÀNG (GRID 3 CỘT VỚI DROPDOWN CHỌN LỚP & NĂM THI) ── */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-brand-600" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
              Chọn Môn Học Olympic &amp; Khối Lớp Thi Đấu
            </h2>
          </div>
          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hidden sm:inline-block">
            Toàn diện Lớp 1 – 12
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* ── CARD 1: TOÁN OLYMPIC ASMO ── */}
          <div
            className={cn(
              'group relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-200 shadow-clay',
              selectedSubject === 'math'
                ? 'border-indigo-400 bg-gradient-to-b from-indigo-50/90 via-white to-white ring-2 ring-indigo-300'
                : 'border-slate-200/80 bg-white/95 hover:border-indigo-300 hover:shadow-md',
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-13 items-center justify-center rounded-2xl bg-indigo-100 border border-indigo-200/80 shadow-xs text-2xl">
                  📐
                </div>
                <div className="flex items-center gap-1.5">
                  {selectedSubject === 'math' && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      Đang chọn
                    </span>
                  )}
                  <span className="rounded-xl bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-xs font-black text-indigo-700">
                    Lớp 1 – 12
                  </span>
                </div>
              </div>

              <div className="mt-3.5">
                <h3 className="font-display text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Toán Olympic ASMO
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Số học, hình học 3D, đại số &amp; tổ hợp chuyên sâu.
                </p>
              </div>

              {/* Menu Chọn Lớp & Năm Thi Gọn Gàng bằng Select Soft Clay */}
              <div className="mt-4 space-y-3 rounded-2xl bg-slate-50/90 p-3.5 border border-slate-200/70">
                <div className="space-y-1.5">
                  <label htmlFor="math-grade-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Layers className="size-3 text-indigo-600" />
                    <span>Khối Lớp</span>
                  </label>
                  <select
                    id="math-grade-select"
                    value={subjectFilters.math.grade}
                    onChange={(e) => handleCardGradeChange('math', Number(e.target.value) as AsmoGrade)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
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

            <Button
              type="button"
              variant="primary"
              onClick={() => handleEnterSubjectArena('math')}
              className="mt-5 w-full gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 text-white font-extrabold text-sm py-3 shadow-md shadow-indigo-500/20 transition-transform active:scale-95 cursor-pointer justify-center"
            >
              <Play className="size-3.5 fill-current" />
              <span>▶ Vào Luyện Đề Toán</span>
            </Button>
          </div>

          {/* ── CARD 2: KHOA HỌC TỰ NHIÊN ASMO ── */}
          <div
            className={cn(
              'group relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-200 shadow-clay',
              selectedSubject === 'science'
                ? 'border-emerald-400 bg-gradient-to-b from-emerald-50/90 via-white to-white ring-2 ring-emerald-300'
                : 'border-slate-200/80 bg-white/95 hover:border-emerald-300 hover:shadow-md',
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-13 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200/80 shadow-xs text-2xl">
                  🔬
                </div>
                <div className="flex items-center gap-1.5">
                  {selectedSubject === 'science' && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      Đang chọn
                    </span>
                  )}
                  <span className="rounded-xl bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-black text-emerald-700">
                    Lớp 1 – 12
                  </span>
                </div>
              </div>

              <div className="mt-3.5">
                <h3 className="font-display text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Khoa Học Tự Nhiên ASMO
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sinh học, Vật lý, Hoá học, Thiên văn &amp; Môi trường.
                </p>
              </div>

              {/* Menu Chọn Lớp & Năm Thi Gọn Gàng bằng Select Soft Clay */}
              <div className="mt-4 space-y-3 rounded-2xl bg-slate-50/90 p-3.5 border border-slate-200/70">
                <div className="space-y-1.5">
                  <label htmlFor="science-grade-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Layers className="size-3 text-emerald-600" />
                    <span>Khối Lớp</span>
                  </label>
                  <select
                    id="science-grade-select"
                    value={subjectFilters.science.grade}
                    onChange={(e) => handleCardGradeChange('science', Number(e.target.value) as AsmoGrade)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
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

            <Button
              type="button"
              variant="primary"
              onClick={() => handleEnterSubjectArena('science')}
              className="mt-5 w-full gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm py-3 shadow-md shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer justify-center"
            >
              <Play className="size-3.5 fill-current" />
              <span>▶ Vào Luyện Đề Khoa Học</span>
            </Button>
          </div>

          {/* ── CARD 3: TIẾNG ANH HỌC THUẬT ASMO ── */}
          <div
            className={cn(
              'group relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-200 shadow-clay',
              selectedSubject === 'english'
                ? 'border-amber-400 bg-gradient-to-b from-amber-50/90 via-white to-white ring-2 ring-amber-300'
                : 'border-slate-200/80 bg-white/95 hover:border-amber-300 hover:shadow-md',
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-13 items-center justify-center rounded-2xl bg-amber-100 border border-amber-200/80 shadow-xs text-2xl">
                  🇬🇧
                </div>
                <div className="flex items-center gap-1.5">
                  {selectedSubject === 'english' && (
                    <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      Đang chọn
                    </span>
                  )}
                  <span className="rounded-xl bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-black text-amber-700">
                    Lớp 1 – 12
                  </span>
                </div>
              </div>

              <div className="mt-3.5">
                <h3 className="font-display text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  Tiếng Anh Học Thuật ASMO
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Từ vựng học thuật, ngữ pháp thi đấu, đọc hiểu &amp; suy luận.
                </p>
              </div>

              {/* Menu Chọn Lớp & Năm Thi Gọn Gàng bằng Select Soft Clay */}
              <div className="mt-4 space-y-3 rounded-2xl bg-slate-50/90 p-3.5 border border-slate-200/70">
                <div className="space-y-1.5">
                  <label htmlFor="english-grade-select" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Layers className="size-3 text-amber-600" />
                    <span>Khối Lớp</span>
                  </label>
                  <select
                    id="english-grade-select"
                    value={subjectFilters.english.grade}
                    onChange={(e) => handleCardGradeChange('english', Number(e.target.value) as AsmoGrade)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
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

            <Button
              type="button"
              variant="primary"
              onClick={() => handleEnterSubjectArena('english')}
              className="mt-5 w-full gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm py-3 shadow-md shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer justify-center"
            >
              <Play className="size-3.5 fill-current" />
              <span>▶ Vào Luyện Đề Tiếng Anh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── 4. PHÒNG THÍ NGHIỆM 3D: 1 CARD TO CATEGORY DUY NHẤT (BIG FEATURED CATEGORY CARD) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white shadow-clay">
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

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-xl bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-semibold text-slate-200 backdrop-blur-sm">
                🔄 Xoay 360° tương tác
              </span>
              <span className="rounded-xl bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-semibold text-slate-200 backdrop-blur-sm">
                📦 Khai triển Net Cube &amp; Khối đa diện
              </span>
              <span className="rounded-xl bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-semibold text-slate-200 backdrop-blur-sm">
                🗺️ Mê cung đồ thị &amp; Sơ đồ đường đi
              </span>
              <span className="rounded-xl bg-white/10 border border-white/15 px-2.5 py-1 text-xs font-semibold text-slate-200 backdrop-blur-sm">
                📐 Đa diện &amp; Lượng giác
              </span>
            </div>
          </div>

          {/* 2 Nút Hành Động Lớn */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/asmo/lab')}
              className="gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-black text-sm px-6 py-3.5 shadow-lg shadow-indigo-500/30 border-0 transition-transform active:scale-95 cursor-pointer text-center justify-center"
            >
              <span>🚀 Mở Phòng Lab 3D</span>
              <ArrowRight className="size-4" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/asmo/journey')}
              className="gap-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-6 py-3.5 border border-white/30 backdrop-blur-md transition-transform active:scale-95 cursor-pointer text-center justify-center"
            >
              <Sparkles className="size-4 text-amber-300" />
              <span>✨ Khám Phá 12 Chuyên Đề 3D</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── 5. ĐẤU TRƯỜNG THI THỬ & LỘ TRÌNH LMS (GRID 2 CỘT TINH GỌN, CHUẨN SOFT CLAY) ── */}
      <div ref={examArenaRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* CỘT 1: LỘ TRÌNH 5 CHẶNG LMS ASMO (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-amber-100/60 p-5 sm:p-6 shadow-clay">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm text-2xl shrink-0">
                🧭
              </div>
              <div>
                <span className="inline-block rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-900 mb-0.5">
                  ⭐ DẠY HỌC TUẦN TỰ QUỐC TẾ
                </span>
                <h2 className="font-display text-base sm:text-lg font-black text-slate-900 leading-snug">
                  Lộ Trình 5 Chặng LMS ASMO
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Học theo mô hình đảo học tập Duolingo Math &amp; Beast Academy với mô phỏng trực quan &amp; bí kíp Mèo Mee!
            </p>

            {/* Danh Sách 5 Chặng Rõ Ràng */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/80 p-2.5 border border-amber-200/60">
                <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500 text-white text-xs font-black">
                  1
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Cộng Trừ Cơ Bản &amp; Dãy Số
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/80 p-2.5 border border-amber-200/60">
                <span className="flex size-6 items-center justify-center rounded-lg bg-indigo-500 text-white text-xs font-black">
                  2
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Nhân Chia &amp; Bảng Cửu Chương
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/80 p-2.5 border border-amber-200/60">
                <span className="flex size-6 items-center justify-center rounded-lg bg-purple-500 text-white text-xs font-black">
                  3
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Phân Số &amp; Tỉ Số Phần Trăm
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/80 p-2.5 border border-amber-200/60">
                <span className="flex size-6 items-center justify-center rounded-lg bg-orange-500 text-white text-xs font-black">
                  4
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Đo Lường &amp; Chu Vi, Diện Tích
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/80 p-2.5 border border-amber-200/60">
                <span className="flex size-6 items-center justify-center rounded-lg bg-sky-500 text-white text-xs font-black">
                  5
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Hình Học Không Gian 3D &amp; Logic
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => navigate('/asmo/curriculum')}
            className="mt-5 w-full gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm py-3 shadow-md border-0 transition-transform active:scale-95 cursor-pointer justify-center"
          >
            <span>Khám Phá Lộ Trình LMS</span>
            <ArrowRight className="size-4 text-slate-950" />
          </Button>
        </div>

        {/* CỘT 2: ĐẤU TRƯỜNG ĐỀ THI THỬ MÔN & LỚP ĐANG CHỌN (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/95 p-5 sm:p-6 shadow-clay">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm shrink-0">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                    Đấu Trường Thi Thử ASMO
                  </h2>
                  <p className="text-xs text-slate-600">
                    {currentSubjectMeta.name} · {currentGradeMeta?.label} · {selectedYear === 'all' ? 'Tất cả năm' : `Năm ${selectedYear}`}
                  </p>
                </div>
              </div>

              <span className="rounded-xl bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-extrabold text-brand-700">
                {isLoading ? 'Đang tải...' : `${exams.length} bộ đề`}
              </span>
            </div>

            {/* Exam Papers List */}
            <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-50/30 p-8 text-center text-brand-700">
                  <Loader2 className="size-8 animate-spin text-brand-600 mb-2" />
                  <p className="text-sm font-bold">Đang tải ngân hàng đề thi ASMO...</p>
                  <p className="text-xs text-brand-500 mt-1">Hệ thống đang kết nối Gateway LMS</p>
                </div>
              ) : exams.length > 0 ? (
                exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 transition-all hover:bg-brand-50/40 hover:border-brand-300"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            {exam.code}
                          </span>
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">
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

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-medium text-slate-500">
                        Điểm đạt: {exam.passScore}/{exam.totalPoints}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setAuditingExam(exam)}
                          className="gap-1 rounded-xl text-xs font-bold py-1.5 px-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                        >
                          <Sparkles className="size-3 text-indigo-600" />
                          <span>Thẩm định</span>
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => navigate(`/asmo/exam/${exam.id}`)}
                          className="gap-1.5 rounded-xl text-xs font-bold py-1.5 px-3 cursor-pointer"
                        >
                          <Play className="size-3 fill-current" />
                          <span>Làm Đề Ngay ▶</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  <BookOpen className="size-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold">Chưa có đề thi cho bộ lọc này</p>
                  <p className="text-xs text-slate-400 mt-1">Vui lòng thử chọn khối lớp hoặc năm thi khác nhé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. KHUNG CHƯƠNG TRÌNH HỌC & LUYỆN THI ASMO (SOFT CLAY) ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 sm:p-6 shadow-clay backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-brand-600" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
              Khung Chương Trình Học &amp; Luyện Thi ASMO ({currentSubjectMeta.name})
            </h2>
          </div>
          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {filteredWeeks.length} Chủ đề chuyên sâu Lớp 1 – 12
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWeeks.map((weekItem) => (
            <div
              key={weekItem.week}
              className={cn(
                'flex flex-col justify-between rounded-2xl border p-4 transition-all hover:bg-white hover:border-brand-200 hover:shadow-xs',
                weekItem.grade === selectedGrade
                  ? 'border-brand-300 bg-brand-50/40 ring-1 ring-brand-200'
                  : 'border-slate-100 bg-slate-50/70',
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-lg bg-brand-100 px-2 py-0.5 text-xs font-extrabold text-brand-700">
                    Tuần {weekItem.week}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Lớp {weekItem.grade}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {weekItem.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {weekItem.summary}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <div className="flex flex-wrap gap-1">
                  {weekItem.keyCompetencies.map((comp) => (
                    <span
                      key={comp}
                      className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 flex items-center gap-1"
                    >
                      <CheckCircle2 className="size-2.5 text-emerald-600 shrink-0" />
                      <span>{comp}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
