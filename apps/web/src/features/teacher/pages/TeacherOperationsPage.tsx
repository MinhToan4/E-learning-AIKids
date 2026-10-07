import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookOpenCheck,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  Users,
} from 'lucide-react'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/shared/store/auth'
import {
  type ConsoleData,
  type CourseOption,
  type ReportPolicy,
  type Review,
  type ScheduleClass,
  type Section,
  type TeacherReport,
  OverviewSection,
  GradingSection,
  AttendanceSection,
  ReportWorkflowSection,
} from '../components/operations'

export function TeacherOperationsPage() {
  const [section, setSection] = useState<Section>('overview')
  const [consoleData, setConsoleData] = useState<ConsoleData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [schedule, setSchedule] = useState<ScheduleClass[]>([])
  const [policies, setPolicies] = useState<ReportPolicy[]>([])
  const [reports, setReports] = useState<TeacherReport[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const role = useAuth((state) => state.user?.role)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        consoleResult,
        reviewResult,
        scheduleResult,
        policyResult,
        reportResult,
        courseResult,
      ] = await Promise.all([
        api<ConsoleData>('/api/teacher/console'),
        api<{ reviews: Review[] }>('/api/teacher/grading/queue?limit=100'),
        api<{ classes: ScheduleClass[] }>('/api/schedule'),
        api<{ policies: ReportPolicy[] }>('/api/report-policies/active'),
        api<{ reports: TeacherReport[] }>('/api/reports'),
        api<{ courses: CourseOption[] }>('/api/teacher/lectures'),
      ])
      setConsoleData(consoleResult)
      setReviews(reviewResult.reviews)
      setSchedule(scheduleResult.classes)
      setPolicies(policyResult.policies)
      setReports(reportResult.reports)
      setCourses(courseResult.courses)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được bàn làm việc.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const learners = useMemo(
    () =>
      [
        ...new Map(
          (consoleData?.classes ?? [])
            .flatMap((classroom) => classroom.learners)
            .map((learner) => [learner.id, learner]),
        ).values(),
      ],
    [consoleData],
  )

  if (loading) return <PageSkeleton rows={6} />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!consoleData) return null

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="ui-card p-5 sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-sky-600">
          Điều hành lớp học
        </p>
        <h1 className="font-display text-2xl sm:text-3xl">Bàn làm việc giáo viên</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Một nơi để theo dõi lớp, chấm bài, điểm danh, nhận xét và phát hành báo
          cáo phụ huynh.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Lớp phụ trách" value={consoleData.classes.length} icon={Users} />
          <Metric label="Học viên" value={learners.length} icon={BookOpenCheck} />
          <Metric label="Bài chờ chấm" value={consoleData.pendingReviews} icon={ClipboardCheck} />
          <Metric label="Báo cáo" value={reports.length} icon={FileCheck2} />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {(
          [
            ['overview', 'Tổng quan & nhận xét', Users],
            ['grading', 'Chấm bài', ClipboardCheck],
            ['attendance', 'Điểm danh', CalendarCheck],
            ['reports', 'Báo cáo phụ huynh', FileCheck2],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={section === key}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold',
              section === key
                ? 'bg-sky-500 text-white shadow-soft'
                : 'bg-white text-muted hover:bg-sky-50',
            )}
            onClick={() => setSection(key)}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {section === 'overview' && (
        <OverviewSection
          data={consoleData}
          learners={learners}
          courses={courses}
          canWriteObservation={role === 'teacher'}
          onDone={() => void load()}
          showToast={showToast}
        />
      )}
      {section === 'grading' && (
        <GradingSection reviews={reviews} onDone={() => void load()} showToast={showToast} />
      )}
      {section === 'attendance' && (
        <AttendanceSection
          classes={schedule}
          onDone={() => void load()}
          showToast={showToast}
        />
      )}
      {section === 'reports' && (
        <ReportWorkflowSection
          learners={learners}
          policies={policies}
          reports={reports}
          onDone={() => void load()}
          showToast={showToast}
        />
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof Users
}) {
  return (
    <div className="rounded-2xl bg-sky-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-muted">{label}</span>
        <Icon size={17} className="text-sky-500" aria-hidden="true" />
      </div>
      <p className="mt-1 font-display text-2xl text-sky-700">{value}</p>
    </div>
  )
}
