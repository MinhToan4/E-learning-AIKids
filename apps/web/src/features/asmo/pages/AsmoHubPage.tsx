import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Trophy,
  Sparkles,
  Box,
  Compass,
  CheckCircle,
  Play,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  Calendar,
  Loader2,
} from 'lucide-react'
import { ASMO_SUBJECTS, ASMO_GRADES, ASMO_CURRICULUM_WEEKS } from '../data/asmo-curriculum'
import { ASMO_3D_TEMPLATES } from '../data/asmo-3d-templates'
import { listAsmoExams } from '@/shared/lib/asmo-api'
import type { AsmoExam, AsmoGrade, AsmoSubject } from '../types'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

const AVAILABLE_YEARS: Array<number | 'all'> = ['all', 2023, 2022, 2021, 2020, 2018, 2016, 2015, 2014]

export function AsmoHubPage() {
  const navigate = useNavigate()
  const [selectedSubject, setSelectedSubject] = useState<AsmoSubject>('math')
  const [selectedGrade, setSelectedGrade] = useState<AsmoGrade>(1)
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')

  const [exams, setExams] = useState<AsmoExam[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentSubjectMeta = ASMO_SUBJECTS[selectedSubject]

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

  const templateList = Object.values(ASMO_3D_TEMPLATES)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-200/80 bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-600 p-6 text-white shadow-clay sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
            <Trophy className="size-3.5 text-sun-300" />
            <span>Đấu Trường Olympic Quốc Tế ASMO</span>
          </div>

          <h1 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Chinh Phục ASMO Với Không Gian 3D & Mèo Mee 🚀
          </h1>

          <p className="mt-3 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Ngân hàng đề thi chuẩn hóa quốc tế 3 Môn (Toán · Khoa Học · Tiếng Anh) kết hợp công nghệ mô phỏng hình học Three.js 3D và trợ giảng AI đồng hành từng bước!
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/asmo/lab')}
              className="gap-2 rounded-2xl bg-sun-400 text-slate-950 hover:bg-sun-300 font-extrabold shadow-md border-0"
            >
              <Box className="size-4" />
              <span>Phòng Thí Nghiệm 3D</span>
            </Button>

            {exams.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/asmo/exam/${exams[0].id}`)}
                className="gap-2 rounded-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 font-bold backdrop-blur-md"
              >
                <Play className="size-4 fill-current" />
                <span>Làm Đề Thi Thử Ngay</span>
              </Button>
            )}
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-20 lg:opacity-30 pointer-events-none">
          <Trophy className="size-96 text-white" />
        </div>
      </div>

      {/* ── MÈO MEE INTRO ── */}
      <AsmoMeeTutor
        pose="welcome"
        speech={`Chào bạn nhỏ! Mee đã chuẩn bị sẵn các mô hình 3D xoay 360 độ và bộ đề thi Olympic ASMO môn ${currentSubjectMeta.name}. Con hãy chọn lớp và năm thi để bắt đầu thử sức nhé!`}
        hint="Bí kíp của Mee: Khi làm bài toán hình học, con hãy bấm nút 'Phòng Thí Nghiệm 3D' để xem khối xoay thực tế trước khi chọn đáp án nhé!"
      />

      {/* ── SUBJECT, GRADE & YEAR SELECTOR TABS ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-clay backdrop-blur-md">
        <div className="flex flex-col gap-5 border-b border-slate-100 pb-5">
          {/* Subject Pills */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              1. Chọn Môn Học Olympic
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ASMO_SUBJECTS) as AsmoSubject[]).map((subjKey) => {
                const subj = ASMO_SUBJECTS[subjKey]
                const isSelected = selectedSubject === subjKey
                return (
                  <button
                    key={subjKey}
                    type="button"
                    onClick={() => setSelectedSubject(subjKey)}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all active:scale-95 cursor-pointer',
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                    )}
                  >
                    <span>{subj.icon}</span>
                    <span>{subj.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Grade Pills */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                2. Khối Lớp
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ASMO_GRADES.map((g) => {
                  const isSelected = selectedGrade === g.grade
                  return (
                    <button
                      key={g.grade}
                      type="button"
                      onClick={() => setSelectedGrade(g.grade)}
                      className={cn(
                        'rounded-xl px-3 py-2 text-xs font-extrabold transition-all active:scale-95 cursor-pointer',
                        isSelected
                          ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                      )}
                    >
                      Lớp {g.grade}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Year Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Calendar className="size-3.5 text-brand-600" />
                <span>3. Năm Thi</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_YEARS.map((yr) => {
                  const isSelected = selectedYear === yr
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setSelectedYear(yr)}
                      className={cn(
                        'rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer',
                        isSelected
                          ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-400'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                      )}
                    >
                      {yr === 'all' ? 'Tất cả' : yr}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Subject Banner Info */}
        <div className="mt-4 flex items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-brand-700">{currentSubjectMeta.badgeText}</span>
            <span>·</span>
            <span>{currentSubjectMeta.description}</span>
          </div>
          <span className="shrink-0 font-semibold text-slate-500">
            {isLoading ? 'Đang tải đề thi...' : `${exams.length} Bộ đề thi sẵn sàng`}
          </span>
        </div>
      </div>

      {/* ── TWO MAIN TRACKS ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 3D Visual Lab Highlight (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/80 p-6 shadow-clay">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <Box className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                  Phòng Thí Nghiệm Không Gian 3D
                </h2>
                <p className="text-xs text-slate-600">
                  7 Dạng toán hình học ASMO mô phỏng Three.js xoay 360°
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

          {/* 3D Template Cards Mini Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {templateList.slice(0, 4).map((tpl) => (
              <Link
                key={tpl.key}
                to={`/asmo/lab?template=${tpl.key}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{tpl.icon}</span>
                    <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
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

          <div className="mt-2 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/asmo/lab')}
              className="w-full sm:w-auto gap-2 rounded-2xl font-bold text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50"
            >
              <Compass className="size-4" />
              <span>Xem tất cả 7 Dạng Mô Hình 3D</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Real Exam Papers (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-clay">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
                <Trophy className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                  Đấu Trường Thi Thử
                </h2>
                <p className="text-xs text-slate-600">
                  Đề thi chuẩn quốc tế {currentSubjectMeta.name}
                </p>
              </div>
            </div>
          </div>

          {/* Exam Papers List */}
          <div className="flex flex-col gap-3 mt-1">
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
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => navigate(`/asmo/exam/${exam.id}`)}
                      className="gap-1.5 rounded-xl text-xs font-bold py-1.5 px-3"
                    >
                      <Play className="size-3 fill-current" />
                      <span>Vào thi</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                <BookOpen className="size-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold">Đang cập nhật thêm đề thi cho bộ lọc này</p>
                <p className="text-xs text-slate-400 mt-1">Vui lòng thử chọn khối lớp hoặc năm thi khác nhé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CURRICULUM ROADMAP MATRIX ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-clay backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="size-5 text-brand-600" />
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            Khung Chương Trình Học & Luyện Thi ASMO ({currentSubjectMeta.name})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWeeks.map((weekItem) => (
            <div
              key={weekItem.week}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-white hover:border-brand-200 hover:shadow-xs"
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
    </div>
  )
}
