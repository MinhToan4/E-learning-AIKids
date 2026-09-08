import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, CheckCircle2, ChevronRight, Clock3, Compass, Loader2, Play, Star, Trophy, Zap } from 'lucide-react'
import { ASMO_SUBJECTS } from '../data/asmo-curriculum'
import { getLmsProgress, type AsmoLmsProgressState } from '../data/asmo-curriculum-lms'
import { AsmoIslandWorldMap } from '../components/AsmoIslandWorldMap'
import { AsmoFormula } from '../components/AsmoFormula'
import { FlatClayIcon } from '../components/AsmoFlatClayIcons'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { Button } from '@/shared/components/ui/Button'
import { listAsmoExams } from '@/shared/lib/asmo-api'
import { cn } from '@/shared/lib/cn'
import type { AsmoExam, AsmoGrade, AsmoSubject } from '../types'

type PortalMode = 'learn' | 'exam'

const YEARS: Array<number | 'all'> = ['all', 2023, 2022, 2021, 2020, 2018, 2016]
const SUBJECTS: AsmoSubject[] = ['math', 'science', 'english']

export function getStageIdForGrade(grade: AsmoGrade): string {
  if (grade <= 2) return 'stage-1'
  if (grade === 3) return 'stage-2'
  if (grade <= 5) return 'stage-3'
  if (grade <= 8) return 'stage-4'
  return 'stage-5'
}

export function AsmoHubPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<PortalMode>('learn')
  const [subject, setSubject] = useState<AsmoSubject>('math')
  const [grade, setGrade] = useState<AsmoGrade>(1)
  const [year, setYear] = useState<number | 'all'>('all')
  const [selectedStageId, setSelectedStageId] = useState('stage-1')
  const [progress] = useState<AsmoLmsProgressState>(() => getLmsProgress())
  const [exams, setExams] = useState<AsmoExam[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (mode !== 'exam') return
    let active = true
    setIsLoading(true)
    listAsmoExams({ subject, grade, year: year === 'all' ? undefined : year })
      .then((items) => {
        if (active) setExams(items)
      })
      .catch(() => {
        if (active) setExams([])
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [mode, subject, grade, year])

  const completedLessons = useMemo(
    () => Object.values(progress.lessons).filter((item) => item.completed).length,
    [progress.lessons],
  )

  const selectGrade = (nextGrade: AsmoGrade) => {
    setGrade(nextGrade)
    setSelectedStageId(getStageIdForGrade(nextGrade))
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-sky-500 px-5 py-5 text-white shadow-clay sm:px-7">
        <div className="relative z-10 flex items-center justify-between gap-5">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-indigo-100">
              <Trophy className="size-4 text-amber-300" aria-hidden="true" /> Cổng ASMO
            </p>
            <h1 className="mt-1 font-display text-2xl font-black sm:text-3xl">Hôm nay con muốn làm gì?</h1>
            <p className="mt-1.5 text-sm font-semibold text-indigo-100">Chọn một hoạt động. Mee sẽ dẫn con đi từng bước.</p>
          </div>
          <AikidCatCharacter pose="welcome" animated={false} className="hidden size-24 shrink-0 drop-shadow-md sm:flex" />
        </div>
      </header>

      <nav className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Chọn hoạt động ASMO">
        <button
          type="button"
          onClick={() => setMode('learn')}
          aria-pressed={mode === 'learn'}
          className={cn(
            'group relative min-h-44 overflow-hidden rounded-3xl border-2 p-5 text-left transition-all duration-200 active:scale-[0.98]',
            mode === 'learn'
              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-sky-100 shadow-clay ring-2 ring-emerald-100'
              : 'border-slate-200 bg-gradient-to-br from-white to-emerald-50/50 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-clay',
          )}
        >
          <span className="absolute -bottom-12 -right-8 size-36 rounded-full bg-sky-200/50" aria-hidden="true" />
          <span className="absolute right-4 top-4 z-10 flex min-h-7 items-center rounded-full bg-white/90 px-2.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 shadow-xs">
            {mode === 'learn' ? <><CheckCircle2 className="mr-1 size-3.5" />Đang chọn</> : '5 chặng'}
          </span>
          <span className="relative z-10 flex h-full items-center justify-between gap-4">
            <span className="min-w-0">
              <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-clay"><BookOpen className="size-5" /></span>
              <strong className="block font-display text-xl font-black text-slate-950">Học theo lộ trình</strong>
              <small className="mt-1 block text-sm font-bold text-slate-600">Khám phá · Luyện tập · Nhận sao</small>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-emerald-700">Vào chặng học <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
            </span>
            <span className="relative flex size-24 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-soft sm:size-28">
              <FlatClayIcon name="island-forest" size={82} />
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode('exam')}
          aria-pressed={mode === 'exam'}
          className={cn(
            'group relative min-h-44 overflow-hidden rounded-3xl border-2 p-5 text-left transition-all duration-200 active:scale-[0.98]',
            mode === 'exam'
              ? 'border-amber-400 bg-gradient-to-br from-amber-50 via-white to-rose-100 shadow-clay ring-2 ring-amber-100'
              : 'border-slate-200 bg-gradient-to-br from-white to-amber-50/60 hover:-translate-y-1 hover:border-amber-300 hover:shadow-clay',
          )}
        >
          <span className="absolute -bottom-12 -right-8 size-36 rounded-full bg-rose-200/50" aria-hidden="true" />
          <span className="absolute right-4 top-4 z-10 flex min-h-7 items-center rounded-full bg-white/90 px-2.5 text-[10px] font-black uppercase tracking-wide text-amber-700 shadow-xs">
            {mode === 'exam' ? <><CheckCircle2 className="mr-1 size-3.5" />Đang chọn</> : 'Theo lớp'}
          </span>
          <span className="relative z-10 flex h-full items-center justify-between gap-4">
            <span className="min-w-0">
              <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-clay"><Trophy className="size-5" /></span>
              <strong className="block font-display text-xl font-black text-slate-950">Thi thử</strong>
              <small className="mt-1 block text-sm font-bold text-slate-600">Chọn đề · Làm bài · Xem kết quả</small>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-amber-700">Vào phòng thi <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
            </span>
            <span className="relative flex size-24 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-soft sm:size-28">
              <FlatClayIcon name="trophy" size={82} />
            </span>
          </span>
        </button>
      </nav>

      {mode === 'learn' ? (
        <section className="space-y-5 rounded-3xl bg-white p-4 shadow-clay sm:p-6" aria-labelledby="learn-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-brand-700">Toán Olympic · Lớp {grade}</p>
              <h2 id="learn-heading" className="font-display text-xl font-black text-slate-950">Chặng học của con</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800"><Star className="mr-1 inline size-4 fill-current" />{progress.totalStars}</span>
              <span className="rounded-xl bg-sky-50 px-3 py-2 text-sky-800"><Zap className="mr-1 inline size-4 fill-current" />{progress.totalXp} XP</span>
              <span className="hidden rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800 sm:inline"><CheckCircle2 className="mr-1 inline size-4" />{completedLessons} bài</span>
            </div>
          </div>

          <label className="block max-w-xs text-xs font-black text-slate-700">
            Lớp của con
            <select value={grade} onChange={(event) => selectGrade(Number(event.target.value) as AsmoGrade)} className="mt-1 min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-bold">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>Lớp {item}</option>)}
            </select>
          </label>

          <AsmoIslandWorldMap
            selectedStageId={selectedStageId}
            onSelectStage={setSelectedStageId}
            progress={progress}
            onOpenLesson={(lesson) => navigate(`/asmo/curriculum/lesson/${lesson.id}`)}
            onOpenMapDetail={(stageId) => navigate(`/asmo/curriculum?stage=${stageId}`)}
            hideStationTrail
          />
        </section>
      ) : (
        <section className="space-y-5 rounded-3xl bg-white p-4 shadow-clay sm:p-6" aria-labelledby="exam-heading">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-amber-700">Thi thử ASMO</p>
            <h2 id="exam-heading" className="font-display text-xl font-black text-slate-950">Chọn đề phù hợp</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Chọn môn thi">
            {SUBJECTS.map((item) => (
              <button key={item} type="button" onClick={() => setSubject(item)} aria-pressed={subject === item} className={cn('min-h-12 shrink-0 rounded-2xl px-4 text-sm font-black', subject === item ? 'bg-brand-500 text-white shadow-clay' : 'bg-slate-100 text-slate-700')}>
                {ASMO_SUBJECTS[item].name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-black text-slate-700">Lớp
              <select value={grade} onChange={(event) => selectGrade(Number(event.target.value) as AsmoGrade)} className="mt-1 min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-bold">
                {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>Lớp {item}</option>)}
              </select>
            </label>
            <label className="text-xs font-black text-slate-700">Năm đề
              <select value={year} onChange={(event) => setYear(event.target.value === 'all' ? 'all' : Number(event.target.value))} className="mt-1 min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm font-bold">
                {YEARS.map((item) => <option key={item} value={item}>{item === 'all' ? 'Tất cả năm' : item}</option>)}
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="flex min-h-44 flex-col items-center justify-center text-brand-700"><Loader2 className="mb-2 size-7 animate-spin" /><p className="text-sm font-bold">Đang tìm đề phù hợp…</p></div>
          ) : exams.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {exams.map((exam) => (
                <article key={exam.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2 text-xs font-black text-slate-500"><span>{exam.year} · {exam.round}</span><span><Clock3 className="mr-1 inline size-3.5" />{exam.durationMinutes} phút</span></div>
                  <h3 className="mt-2 font-display text-base font-black text-slate-950"><AsmoFormula text={exam.title} /></h3>
                  <p className="mt-1 text-xs font-bold text-slate-600">{exam.questions.length} câu · Điểm đạt {exam.passScore}/{exam.totalPoints}</p>
                  <Button type="button" variant="primary" onClick={() => navigate(`/asmo/exam/${exam.id}`)} className="mt-4 min-h-12 w-full rounded-2xl bg-brand-600 font-black text-white"><Play className="size-4 fill-current" />Làm đề<ChevronRight className="size-4" /></Button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-8 text-center"><Compass className="mx-auto size-8 text-slate-400" /><p className="mt-2 text-sm font-black text-slate-800">Chưa có đề phù hợp</p><p className="mt-1 text-xs font-semibold text-slate-500">Con thử chọn lớp hoặc năm khác nhé.</p></div>
          )}
        </section>
      )}

      <button type="button" onClick={() => navigate('/asmo/lab')} className="mx-auto flex min-h-12 items-center gap-2 rounded-2xl px-4 text-sm font-black text-brand-700 hover:bg-brand-50">
        <FlatClayIcon name="cube" size={24} /> Khám phá Phòng Lab 3D <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
