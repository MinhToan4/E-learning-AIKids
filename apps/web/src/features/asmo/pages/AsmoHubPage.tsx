import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
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
} from 'lucide-react'
import {
  ASMO_SUBJECTS,
  ASMO_GRADES,
  ASMO_GRADE_TIERS,
  ASMO_CURRICULUM_WEEKS,
} from '../data/asmo-curriculum'
import { ASMO_3D_TEMPLATES } from '../data/asmo-3d-templates'
import { listAsmoExams } from '@/shared/lib/asmo-api'
import type { AsmoExam, AsmoGrade, AsmoSubject } from '../types'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { AsmoExamAuditModal } from '../components/AsmoExamAuditModal'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

const AVAILABLE_YEARS: Array<number | 'all'> = ['all', 2023, 2022, 2021, 2020, 2018, 2016]

const FEATURED_3D_KEYS = [
  '3D_CUBE_CLUSTER',
  'GRID_PATH_MAZE',
  'NET_CUBE_FOLDING',
  'SHADED_AREA_FRACTION',
] as const

export function AsmoHubPage() {
  const navigate = useNavigate()
  const [selectedSubject, setSelectedSubject] = useState<AsmoSubject>('math')
  const [selectedGrade, setSelectedGrade] = useState<AsmoGrade>(1)
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')

  const [exams, setExams] = useState<AsmoExam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [auditingExam, setAuditingExam] = useState<AsmoExam | null>(null)

  const currentSubjectMeta = ASMO_SUBJECTS[selectedSubject]
  const currentGradeMeta = ASMO_GRADES.find((g) => g.grade === selectedGrade)

  // Fetch dynamic exams from backend gateway or safe fallback
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

  const featuredTemplates = useMemo(() => {
    return FEATURED_3D_KEYS.map((key) => ASMO_3D_TEMPLATES[key]).filter(Boolean)
  }, [])

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

          {/* Chỉ 2 Nút Hành Động Rõ Ràng */}
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

      {/* ── 2. TRỢ GIẢNG MÈO MEE (TINH GỌN) ── */}
      <AsmoMeeTutor
        pose="welcome"
        speech={`Chào bạn nhỏ! Mee đã chuẩn bị sẵn hệ thống đề thi Olympic ASMO môn ${currentSubjectMeta.name} cho ${currentGradeMeta?.tierLabel} (${currentGradeMeta?.shortLabel}). Hãy chọn năm thi con muốn thử sức cùng Mèo Mee nhé! 🚀`}
        hint="Bí kíp Mèo Mee: Khi làm bài toán hình học hoặc tư duy không gian, con hãy xoay mô hình 3D 360 độ để quan sát mọi góc nhìn trước khi chọn đáp án nhé!"
      />

      {/* ── 3. BỘ LỌC 3 TẦNG TINH GỌN (SOFT CLAY) ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 sm:p-6 shadow-clay backdrop-blur-md space-y-6">
        {/* Tầng 1: 3 Môn Học Olympic */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
            <Sparkles className="size-3.5 text-brand-600" />
            <span>1. Chọn Môn Học Olympic</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(Object.keys(ASMO_SUBJECTS) as AsmoSubject[]).map((subjKey) => {
              const subj = ASMO_SUBJECTS[subjKey]
              const isSelected = selectedSubject === subjKey
              const subjectEmoji = subjKey === 'math' ? '📐' : subjKey === 'science' ? '🔬' : '🇬🇧'
              return (
                <button
                  key={subjKey}
                  type="button"
                  onClick={() => setSelectedSubject(subjKey)}
                  className={cn(
                    'flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 text-sm font-extrabold transition-all active:scale-95 cursor-pointer',
                    isSelected
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-400'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60',
                  )}
                >
                  <span className="text-xl">{subjectEmoji}</span>
                  <span>{subj.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tầng 2: Cấp Học & Khối Lớp (Grid 3 Cột) */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <Layers className="size-3.5 text-brand-600" />
              <span>2. Khối Lớp (Toàn Diện Lớp 1 – 12 Theo 3 Cấp Học)</span>
            </div>
            {currentGradeMeta && (
              <span className="rounded-xl bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                {currentGradeMeta.tierEmoji} {currentGradeMeta.tierLabel} · {currentGradeMeta.ageRange}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {ASMO_GRADE_TIERS.map((tier) => {
              const isGradeInTier = tier.grades.includes(selectedGrade)
              return (
                <div
                  key={tier.id}
                  className={cn(
                    'rounded-2xl border p-3.5 transition-all flex flex-col justify-between',
                    isGradeInTier
                      ? 'border-brand-300 bg-brand-50/50 shadow-xs ring-1 ring-brand-200'
                      : 'border-slate-200/80 bg-slate-50/60',
                  )}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800">
                      <span>{tier.emoji}</span>
                      <span>{tier.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {tier.description.split('(')[0].trim()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tier.grades.map((gNum) => {
                      const isSelected = selectedGrade === gNum
                      return (
                        <button
                          key={gNum}
                          type="button"
                          onClick={() => setSelectedGrade(gNum)}
                          className={cn(
                            'flex-1 min-w-[52px] rounded-xl py-2 px-2 text-center text-xs font-black transition-all active:scale-95 cursor-pointer',
                            isSelected
                              ? 'bg-slate-900 text-white shadow-sm ring-2 ring-brand-400 scale-[1.02]'
                              : 'bg-white border border-slate-200/90 hover:bg-slate-100 hover:border-slate-300 text-slate-700',
                          )}
                        >
                          Lớp {gNum}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tầng 3: Năm Thi Tuyển Chọn */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
            <Calendar className="size-3.5 text-brand-600" />
            <span>3. Năm Thi Tuyển Chọn</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_YEARS.map((yr) => {
              const isSelected = selectedYear === yr
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer',
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-400'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60',
                  )}
                >
                  {yr === 'all' ? 'Tất cả năm' : `Năm ${yr}`}
                </button>
              )
            })}
          </div>
        </div>

        {/* Thanh Tóm Tắt Kết Quả */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-100">
              {currentSubjectMeta.badgeText}
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-bold text-slate-700">
              {currentSubjectMeta.name} ({currentGradeMeta?.shortLabel})
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-semibold text-slate-500">
              {isLoading ? 'Đang tải đề thi...' : `${exams.length} bộ đề thi sẵn sàng`}
            </span>
          </div>

          {exams.length > 0 && (
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate(`/asmo/exam/${exams[0].id}`)}
              className="gap-1.5 rounded-xl text-xs font-extrabold py-2 px-3.5 shadow-sm cursor-pointer"
            >
              <Play className="size-3.5 fill-current" />
              <span>Bắt đầu làm bài ngay</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── 4. HAI CỘT NỘI DUNG CHÍNH (7/12 & 5/12) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột Trái (Phòng Thí Nghiệm Không Gian 3D - 7/12) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/60 p-5 sm:p-6 shadow-clay">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shrink-0">
                  <Box className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    Phòng Thí Nghiệm Không Gian 3D
                  </h2>
                  <p className="text-xs text-slate-600">
                    Mô phỏng hình học Three.js tương tác xoay 360° trực quan
                  </p>
                </div>
              </div>

              <Link
                to="/asmo/lab"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-700 hover:text-indigo-900"
              >
                <span>Mở phòng Lab</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* 4 Card Mẫu Hình Học 3D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredTemplates.map((tpl) => (
                <Link
                  key={tpl.key}
                  to={`/asmo/lab?template=${tpl.key}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{tpl.icon}</span>
                      <span
                        className={cn(
                          'rounded-lg px-2 py-0.5 text-[10px] font-bold',
                          tpl.difficulty === 'Cơ bản'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tpl.difficulty === 'Trung bình'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-amber-50 text-amber-800',
                        )}
                      >
                        {tpl.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {tpl.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                    <span>Trải nghiệm 3D</span>
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/asmo/journey')}
              className="flex-1 sm:flex-initial gap-2 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm px-4 py-2.5 cursor-pointer"
            >
              <Sparkles className="size-4 text-amber-300" />
              <span>Chặng Học 12 Chuyên Đề 3D</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/asmo/lab')}
              className="flex-1 sm:flex-initial gap-2 rounded-2xl font-bold text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50 px-4 py-2.5 cursor-pointer"
            >
              <Compass className="size-4" />
              <span>Phòng Thí Nghiệm 3D</span>
            </Button>
          </div>
        </div>

        {/* Cột Phải (Đấu Trường Thi Thử ASMO - 5/12) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 sm:p-6 shadow-clay">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm shrink-0">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    Đấu Trường Thi Thử ASMO
                  </h2>
                  <p className="text-xs text-slate-600">
                    Đề thi {currentSubjectMeta.name} · {currentGradeMeta?.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Exam Papers List */}
            <div className="flex flex-col gap-3">
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
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-brand-50/40 hover:border-brand-300"
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

      {/* ── 5. LMS CURRICULUM ROADMAP BANNER & MATRIX ── */}
      <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 p-5 sm:p-6 shadow-clay flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-13 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md text-2xl shrink-0">
            🧭
          </div>
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[11px] font-black text-amber-900 mb-1">
              <span>⭐ DẠY HỌC TUẦN TỰ THEO CHUYÊN ĐỀ QUỐC TẾ</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              Bản Đồ 5 Chặng Học LMS ASMO (Cộng Trừ ➔ Nhân Chia ➔ Phân Số ➔ Đo Lường ➔ 3D)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Học theo lộ trình đảo học tập Duolingo Math / Beast Academy với mô phỏng trực quan &amp; bí kíp Mèo Mee!
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => navigate('/asmo/curriculum')}
          className="shrink-0 gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md px-5 py-2.5 cursor-pointer"
        >
          <span>Khám Phá Lộ Trình LMS</span>
          <ArrowRight className="size-4 text-slate-950" />
        </Button>
      </div>

      {/* ── KHUNG CHƯƠNG TRÌNH HỌC & LUYỆN THI ASMO ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 sm:p-6 shadow-clay backdrop-blur-md">
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
                      className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      ✓ {comp}
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
