import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Users,
  BarChart3,
  BookOpen,
  Copy,
  Check,
  Plus,
  Settings,
  RefreshCw,
  Search,
  X,
  Shield,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  Palette,
  CheckCircle2,
  Trash2,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Paginator } from '@/shared/components/ui/Paginator'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

// ── Types ───────────────────────────────────────────────────
export type StudentRow = {
  id: string
  nickname: string | null
  level: number
  xp: number
  completedQuests: number
  totalStars: number
  projectCount: number
}

export type ClassStatsStudent = {
  id: string
  nickname: string | null
  level: number
  xp: number
  completedQuests: number
  currentQuest: string | null
  currentPhase: string | null
  lastActiveAt: string | null
  needsSupport: boolean
  supportReason: string | null
}

export type ClassStats = {
  className: string
  code: string
  studentCount: number
  totalCompletedQuests: number
  openQuestCount: number
  projectCount: number
  students: ClassStatsStudent[]
}

export type ClassInfo = {
  id: string
  name: string
  code: string
}

export type StudentProgressData = {
  student: { nickname: string | null }
  progress: Array<{ questTitle: string; status: string; stars: number }>
}

export interface ClassManagementConsoleProps {
  canManageClass?: boolean
}

const AVATAR_BG_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-sky-100 text-sky-700 border-sky-200',
]

function getAvatarColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length]
}

export function ClassManagementConsole({ canManageClass = true }: ClassManagementConsoleProps) {
  const { toasts, showToast, dismissToast } = useToast()

  // Main data states
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [stats, setStats] = useState<ClassStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Sub-nav active tab: 'students' | 'stats' | 'guide'
  const [activeTab, setActiveTab] = useState<'students' | 'stats' | 'guide'>('students')

  // Filter & Sort states (Tab 1)
  const [searchQuery, setSearchQuery] = useState('')
  const [quickFilter, setQuickFilter] = useState<'all' | 'knight' | 'support'>('all')
  const [sortOption, setSortOption] = useState<'xp' | 'quests' | 'name'>('xp')

  // Copy code feedback state
  const [copiedCode, setCopiedCode] = useState(false)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<StudentRow | null>(null)
  const [progressTargetId, setProgressTargetId] = useState<string | null>(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [studentProgress, setStudentProgress] = useState<StudentProgressData | null>(null)

  // Form states
  const [newStudentNickname, setNewStudentNickname] = useState('')
  const [submittingStudent, setSubmittingStudent] = useState(false)
  const [removingStudent, setRemovingStudent] = useState(false)

  // Class settings form
  const [classForm, setClassForm] = useState({ name: '', code: '' })
  const [savingClass, setSavingClass] = useState(false)

  // Create class form (when no class exists yet)
  const [createForm, setCreateForm] = useState({ name: '', code: '' })
  const [creatingClass, setCreatingClass] = useState(false)

  // ── Data Fetching ───────────────────────────────────────────
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    setIsRefreshing(true)
    setLoadError(null)

    try {
      const [classRes, statsRes] = await Promise.allSettled([
        api<{ class: ClassInfo | null; students: StudentRow[] }>('/api/teacher/class'),
        api<{ stats: ClassStats | null }>('/api/teacher/class/stats'),
      ])

      if (classRes.status === 'fulfilled') {
        setClassInfo(classRes.value.class)
        setStudents(classRes.value.students ?? [])
        if (classRes.value.class) {
          setClassForm({
            name: classRes.value.class.name,
            code: classRes.value.class.code,
          })
        }
      } else {
        throw classRes.reason
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.stats ?? null)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu lớp học'
      setLoadError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // ── Copy Code to Clipboard ──────────────────────────────────
  const handleCopyCode = async (codeToCopy?: string) => {
    const code = codeToCopy || classInfo?.code
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      showToast(`Đã sao chép mã lớp: ${code}`, 'success')
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      showToast('Không thể sao chép tự động. Vui lòng copy thủ công.', 'error')
    }
  }

  // ── Stats student map for quick lookup ─────────────────────
  const statsStudentMap = useMemo(() => {
    const map = new Map<string, ClassStatsStudent>()
    if (stats?.students) {
      for (const s of stats.students) {
        map.set(s.id, s)
      }
    }
    return map
  }, [stats])

  // ── Metrics Calculation ─────────────────────────────────────
  const knightCount = useMemo(() => {
    return students.filter((s) => s.completedQuests > 0).length
  }, [students])

  const needsSupportCount = useMemo(() => {
    return students.filter((s) => statsStudentMap.get(s.id)?.needsSupport ?? false).length
  }, [students, statsStudentMap])

  const avgLevel = useMemo(() => {
    if (students.length === 0) return '0'
    const sum = students.reduce((acc, s) => acc + s.level, 0)
    return (sum / students.length).toFixed(1)
  }, [students])

  const avgXp = useMemo(() => {
    if (students.length === 0) return 0
    const sum = students.reduce((acc, s) => acc + s.xp, 0)
    return Math.round(sum / students.length)
  }, [students])

  // ── Filtering and Sorting (Tab 1) ───────────────────────────
  const filteredStudents = useMemo(() => {
    let result = [...students]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (s) =>
          (s.nickname && s.nickname.toLowerCase().includes(q)) ||
          s.id.toLowerCase().includes(q),
      )
    }

    // Quick filter chips
    if (quickFilter === 'knight') {
      result = result.filter((s) => s.completedQuests > 0)
    } else if (quickFilter === 'support') {
      result = result.filter((s) => statsStudentMap.get(s.id)?.needsSupport ?? false)
    }

    // Sorting
    if (sortOption === 'xp') {
      result.sort((a, b) => b.xp - a.xp || b.level - a.level)
    } else if (sortOption === 'quests') {
      result.sort((a, b) => b.completedQuests - a.completedQuests || b.totalStars - a.totalStars)
    } else if (sortOption === 'name') {
      result.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || ''))
    }

    return result
  }, [students, searchQuery, quickFilter, sortOption, statsStudentMap])

  // Pagination for Student list
  const studentPagination = usePagination(filteredStudents, 10)

  // ── Student Progress Modal Handlers ─────────────────────────
  const handleOpenProgress = async (studentId: string) => {
    setProgressTargetId(studentId)
    setProgressLoading(true)
    try {
      const data = await api<StudentProgressData>(`/api/teacher/students/${studentId}/progress`)
      setStudentProgress(data)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không tải được tiến trình học sinh', 'error')
      setProgressTargetId(null)
    } finally {
      setProgressLoading(false)
    }
  }

  const handleCloseProgress = () => {
    setProgressTargetId(null)
    setStudentProgress(null)
  }

  // ── Modal Actions ───────────────────────────────────────────
  // 1. Add student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    const nickname = newStudentNickname.trim()
    if (!nickname) return

    setSubmittingStudent(true)
    try {
      await api('/api/teacher/class/students', {
        method: 'POST',
        body: JSON.stringify({ nickname }),
      })
      showToast(`Đã thêm học sinh "${nickname}" vào lớp`, 'success')
      setNewStudentNickname('')
      setShowAddModal(false)
      await loadData(true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể thêm học sinh. Vui lòng kiểm tra biệt danh.', 'error')
    } finally {
      setSubmittingStudent(false)
    }
  }

  // 2. Remove student
  const handleRemoveStudent = async () => {
    if (!removeTarget) return

    setRemovingStudent(true)
    try {
      await api(`/api/teacher/class/students/${removeTarget.id}`, { method: 'DELETE' })
      showToast(`Đã gỡ "${removeTarget.nickname || 'học sinh'}" khỏi lớp`, 'success')
      setRemoveTarget(null)
      await loadData(true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể gỡ học sinh khỏi lớp', 'error')
    } finally {
      setRemovingStudent(false)
    }
  }

  // 3. Save class settings
  const handleSaveClassSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = classForm.name.trim()
    const code = classForm.code.trim().toUpperCase()

    if (name.length < 2 || code.length < 3) {
      showToast('Tên lớp tối thiểu 2 ký tự, Mã lớp tối thiểu 3 ký tự.', 'error')
      return
    }

    setSavingClass(true)
    try {
      await api('/api/teacher/class', {
        method: 'POST',
        body: JSON.stringify({ name, code }),
      })
      showToast('Cập nhật thông tin lớp học thành công!', 'success')
      setShowSettingsModal(false)
      await loadData(true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể lưu cài đặt lớp học', 'error')
    } finally {
      setSavingClass(false)
    }
  }

  // 4. Create class (when none exists)
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = createForm.name.trim()
    const code = createForm.code.trim().toUpperCase()

    if (name.length < 2 || code.length < 3) {
      showToast('Tên lớp tối thiểu 2 ký tự, Mã lớp tối thiểu 3 ký tự.', 'error')
      return
    }

    setCreatingClass(true)
    try {
      await api('/api/teacher/class', {
        method: 'POST',
        body: JSON.stringify({ name, code }),
      })
      showToast('Tạo lớp học mới thành công!', 'success')
      await loadData(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tạo lớp học', 'error')
    } finally {
      setCreatingClass(false)
    }
  }

  // ── Render: Loading State ───────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-busy="true" aria-label="Đang tải dữ liệu lớp học">
        <div className="ui-card p-6 flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-sm font-bold text-muted">Đang tải dữ liệu quản lý lớp học…</span>
        </div>
        <div className="ui-skeleton h-48 rounded-3xl" />
        <div className="ui-skeleton h-64 rounded-3xl" />
      </div>
    )
  }

  // ── Render: No Class State ──────────────────────────────────
  if (!classInfo) {
    if (!canManageClass) {
      return (
        <EmptyState
          title="Chưa có lớp học để theo dõi"
          description="Khi giáo viên phụ trách khởi tạo lớp, toàn bộ bảng điều khiển và danh sách học sinh sẽ xuất hiện tại đây."
        />
      )
    }

    return (
      <div className="space-y-6">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <section className="ui-card max-w-xl mx-auto p-6 sm:p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-slate-900">Khởi tạo lớp học mới</h2>
            <p className="mt-1 text-sm text-muted">
              Tạo lớp học để cấp mã mời cho học sinh, theo dõi lộ trình làm chủ quy tắc AI và các trạm học.
            </p>
          </div>

          <form onSubmit={(e) => void handleCreateClass(e)} className="space-y-4 text-left">
            <label className="block text-sm font-bold text-slate-800">
              Tên lớp học
              <input
                type="text"
                required
                minLength={2}
                placeholder="Ví dụ: Lớp Phi Hành Gia Nhí 3A"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1.5 w-full min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              />
            </label>

            <label className="block text-sm font-bold text-slate-800">
              Mã mời lớp học (Học sinh dùng để tham gia)
              <input
                type="text"
                required
                minLength={3}
                pattern="[A-Za-z0-9-]+"
                placeholder="Ví dụ: AIKI-3A"
                value={createForm.code}
                onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="mt-1.5 w-full min-h-11 rounded-xl border-2 border-border bg-white px-3 font-mono text-sm uppercase outline-none transition focus:border-brand-400"
              />
            </label>

            <Button
              type="submit"
              disabled={creatingClass}
              className="w-full min-h-11 flex items-center justify-center gap-2"
            >
              {creatingClass ? 'Đang tạo lớp…' : 'Tạo lớp học'}
            </Button>
          </form>
        </section>
      </div>
    )
  }

  // ── Render: Full Dashboard ──────────────────────────────────
  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm font-bold text-rose-800 flex items-center justify-between">
          <span>{loadError}</span>
          <Button variant="ghost" className="!text-xs text-rose-800" onClick={() => void loadData()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* ── 1. KPI METRIC HEADER OVERVIEW ── */}
      <section
        className="ui-card flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 shadow-xs border border-border"
        aria-label="Thanh chỉ số lớp học"
      >
        <div className="mr-auto min-w-[200px]">
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">QUẢN LÝ LỚP HỌC</p>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <h1 className="font-display text-xl text-slate-900">{classInfo.name}</h1>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/70 px-2.5 py-1 text-xs font-bold text-brand-800">
              <span>Mã lớp:</span>
              <strong className="font-mono tracking-wider text-brand-700">{classInfo.code}</strong>
              <button
                type="button"
                onClick={() => void handleCopyCode()}
                className="ml-1 text-brand-600 hover:text-brand-800 transition cursor-pointer p-0.5 rounded hover:bg-brand-100"
                title="Sao chép mã lớp"
                aria-label={`Sao chép mã lớp ${classInfo.code}`}
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Visual Metric Dots */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <strong>{students.length}</strong>
            <span className="text-muted">học sinh</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            <strong>Lv{avgLevel}</strong>
            <span className="text-muted">· {avgXp} XP tb</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-mint-500" />
            <strong>{knightCount}</strong>
            <span className="text-muted">Hiệp Sĩ AIKI</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-coral-500" />
            <strong className={needsSupportCount > 0 ? 'text-coral-600' : ''}>{needsSupportCount}</strong>
            <span className="text-muted">cần hỗ trợ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {canManageClass && (
            <>
              <Button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 shadow-sm !min-h-10 !px-3.5"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>+ Thêm học sinh</span>
              </Button>

              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-1.5 min-h-10 rounded-xl border-2 border-border bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer shadow-xs"
                title="Cài đặt lớp"
                aria-label="Cài đặt lớp"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cài đặt</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={isRefreshing}
            className="flex items-center justify-center h-10 w-10 rounded-xl border-2 border-border bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
            aria-label="Làm mới"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin text-brand-600')} />
          </button>
        </div>
      </section>

      {/* ── 2. SUB-NAV VIEW SWITCHER ── */}
      <nav
        className="flex items-center gap-2 border-b border-border/70 pb-2 overflow-x-auto"
        aria-label="Chuyển chế độ xem quản lý lớp"
      >
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap',
            activeTab === 'students'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-brand-50/50 hover:text-brand-700',
          )}
        >
          <Users className="h-4 w-4" />
          <span>👥 Danh sách học sinh ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap',
            activeTab === 'stats'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-brand-50/50 hover:text-brand-700',
          )}
        >
          <BarChart3 className="h-4 w-4" />
          <span>📊 Thống kê & Hỗ trợ</span>
          {needsSupportCount > 0 && (
            <span className="rounded-full bg-coral-500 px-1.5 py-0.2 text-[11px] font-black text-white">
              {needsSupportCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap',
            activeTab === 'guide'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-brand-50/50 hover:text-brand-700',
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>⚡ Ghi danh & Thông tin lớp</span>
        </button>
      </nav>

      {/* ── 3. TAB 1: DANH SÁCH HỌC SINH ── */}
      {activeTab === 'students' && (
        <section className="ui-card overflow-hidden border border-border shadow-xs">
          {/* Smart Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3.5 bg-slate-50/50">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                <Search size={16} aria-hidden="true" />
              </span>
              <input
                type="search"
                aria-label="Tìm học sinh"
                placeholder="Tìm biệt danh hoặc ID học sinh…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-8 text-sm outline-none transition focus:border-brand-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-1.5" role="group" aria-label="Bộ lọc nhanh">
              <button
                type="button"
                onClick={() => setQuickFilter('all')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition border cursor-pointer',
                  quickFilter === 'all'
                    ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                    : 'bg-white text-slate-600 border-border hover:bg-slate-50',
                )}
              >
                Tất cả
              </button>

              <button
                type="button"
                onClick={() => setQuickFilter('knight')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition border cursor-pointer flex items-center gap-1',
                  quickFilter === 'knight'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-border hover:bg-emerald-50 hover:text-emerald-700',
                )}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                <span>Đạt Hiệp Sĩ</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickFilter('support')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition border cursor-pointer flex items-center gap-1',
                  quickFilter === 'support'
                    ? 'bg-coral-600 text-white border-coral-600 shadow-xs'
                    : 'bg-white text-slate-600 border-border hover:bg-coral-50 hover:text-coral-700',
                )}
              >
                <span className="h-2 w-2 rounded-full bg-coral-500 inline-block" />
                <span>Cần hỗ trợ</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              aria-label="Sắp xếp danh sách học sinh"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'xp' | 'quests' | 'name')}
              className="min-h-10 rounded-xl border-2 border-border bg-white px-3 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="xp">Theo XP cao nhất</option>
              <option value="quests">Theo số trạm hoàn thành</option>
              <option value="name">Biệt danh A-Z</option>
            </select>

            {/* Filter Results Count Indicator */}
            {(searchQuery || quickFilter !== 'all') && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 border border-brand-200">
                {filteredStudents.length} / {students.length} học sinh
              </span>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm" aria-label="Bảng học sinh">
              <thead className="bg-sky-50/70 text-slate-700 text-xs font-extrabold uppercase tracking-wide border-b border-border">
                <tr>
                  <th className="px-4 py-3">Học sinh</th>
                  <th className="px-4 py-3">Cấp độ & XP</th>
                  <th className="px-4 py-3">Thành tích</th>
                  <th className="px-4 py-3">Quy tắc Vàng</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-white">
                {studentPagination.slice.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      {students.length === 0 ? (
                        <div className="space-y-2">
                          <p className="font-bold text-slate-700">Chưa có học sinh nào trong lớp</p>
                          <p className="text-xs">Nhấn "+ Thêm học sinh" hoặc chia sẻ mã lớp để các bé tham gia.</p>
                        </div>
                      ) : (
                        'Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại'
                      )}
                    </td>
                  </tr>
                ) : (
                  studentPagination.slice.map((s) => {
                    const isKnight = s.completedQuests > 0
                    const statInfo = statsStudentMap.get(s.id)
                    const needsSupport = statInfo?.needsSupport ?? false
                    const nickname = s.nickname || 'Học sinh'
                    const initial = (nickname.trim()[0] || 'K').toUpperCase()

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        {/* Student Name & Avatar */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-base font-black',
                                getAvatarColor(nickname),
                              )}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 truncate">{nickname}</span>
                                {needsSupport && (
                                  <span
                                    className="rounded-full bg-coral-100 px-1.5 py-0.2 text-[10px] font-bold text-coral-700 border border-coral-200"
                                    title={statInfo?.supportReason || 'Cần hỗ trợ sư phạm'}
                                  >
                                    Cần hỗ trợ
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted font-mono">ID: {s.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>

                        {/* Level & XP */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-black text-purple-700 border border-purple-200">
                                Lv{s.level}
                              </span>
                              <span className="text-xs font-bold text-slate-700">{s.xp} XP</span>
                            </div>
                            <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-brand-500"
                                style={{ width: `${Math.min((s.xp % 100), 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Achievements */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-slate-700">
                            {s.completedQuests} trạm · {s.totalStars} ⭐ · {s.projectCount} 🎨
                          </span>
                        </td>

                        {/* Golden Rule Knight Status */}
                        <td className="px-4 py-3">
                          {isKnight ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                              <Shield className="h-3.5 w-3.5 text-emerald-600" />
                              <span>🛡️ Hiệp Sĩ AIKI</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              <span>⏳ Đang học quy tắc</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              className="!min-h-8 !px-2.5 !text-xs font-bold text-brand-700 hover:bg-brand-50"
                              onClick={() => void handleOpenProgress(s.id)}
                            >
                              🔍 Chi tiết
                            </Button>
                            {canManageClass && (
                              <Button
                                variant="ghost"
                                className="!min-h-8 !px-2.5 !text-xs font-bold text-danger hover:bg-rose-50"
                                onClick={() => setRemoveTarget(s)}
                              >
                                🗑️ Gỡ
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="divide-y divide-border/60 sm:hidden">
            {studentPagination.slice.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                {students.length === 0 ? 'Chưa có học sinh nào' : 'Không có học sinh khớp tìm kiếm'}
              </p>
            ) : (
              studentPagination.slice.map((s) => {
                const isKnight = s.completedQuests > 0
                const statInfo = statsStudentMap.get(s.id)
                const needsSupport = statInfo?.needsSupport ?? false
                const nickname = s.nickname || 'Học sinh'
                const initial = (nickname.trim()[0] || 'K').toUpperCase()

                return (
                  <article key={s.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black',
                            getAvatarColor(nickname),
                          )}
                        >
                          {initial}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{nickname}</p>
                          <p className="text-[11px] text-muted font-mono">ID: {s.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-black text-purple-700 border border-purple-200">
                        Lv{s.level} · {s.xp} XP
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">
                        {s.completedQuests} trạm · {s.totalStars} ⭐ · {s.projectCount} 🎨
                      </span>
                      {needsSupport && (
                        <span className="rounded-full bg-coral-100 px-2 py-0.5 font-bold text-coral-800 border border-coral-200">
                          Cần hỗ trợ
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      {isKnight ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                          🛡️ Hiệp Sĩ AIKI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                          ⏳ Đang học quy tắc
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        variant="secondary"
                        className="w-full !text-xs !min-h-9"
                        onClick={() => void handleOpenProgress(s.id)}
                      >
                        🔍 Chi tiết
                      </Button>
                      {canManageClass && (
                        <Button
                          variant="ghost"
                          className="w-full !text-xs !min-h-9 text-danger"
                          onClick={() => setRemoveTarget(s)}
                        >
                          🗑️ Gỡ
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>

          {/* Pagination */}
          <Paginator
            page={studentPagination.page}
            totalPages={studentPagination.totalPages}
            totalItems={filteredStudents.length}
            pageSize={10}
            onPrev={studentPagination.prev}
            onNext={studentPagination.next}
            onGoTo={studentPagination.goTo}
          />
        </section>
      )}

      {/* ── 4. TAB 2: THỐNG KÊ & HỖ TRỢ ── */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* 4 Stat Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="ui-card p-4 border border-border bg-white shadow-xs space-y-1">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Học sinh</span>
                <Users className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-2xl font-display text-slate-900">{stats?.studentCount ?? students.length}</p>
              <p className="text-xs text-muted">Trong danh sách lớp</p>
            </div>

            <div className="ui-card p-4 border border-border bg-white shadow-xs space-y-1">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Trạm hoàn thành</span>
                <Award className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-display text-slate-900">{stats?.totalCompletedQuests ?? 0}</p>
              <p className="text-xs text-muted">Lượt bài hoàn thành</p>
            </div>

            <div className="ui-card p-4 border border-border bg-white shadow-xs space-y-1">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Bài học đang mở</span>
                <BookOpen className="h-4 w-4 text-mint-500" />
              </div>
              <p className="text-2xl font-display text-slate-900">{stats?.openQuestCount ?? 8}</p>
              <p className="text-xs text-muted">Trạm sẵn sàng trải nghiệm</p>
            </div>

            <div className="ui-card p-4 border border-border bg-white shadow-xs space-y-1">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Sản phẩm</span>
                <Palette className="h-4 w-4 text-coral-500" />
              </div>
              <p className="text-2xl font-display text-slate-900">{stats?.projectCount ?? 0}</p>
              <p className="text-xs text-muted">Tác phẩm sáng tạo AI</p>
            </div>
          </div>

          {/* Montessori Pedagogical Support Section */}
          <section className="ui-card border border-border shadow-xs overflow-hidden">
            <div className="border-b border-border bg-amber-50/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h2 className="font-display text-base text-slate-900">
                  Học sinh cần hỗ trợ sư phạm & Khuyến nghị Montessori
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted">
                Phương pháp Montessori tôn trọng nhịp độ tự nhiên của trẻ: Không hối thúc, đồng hành quan sát và chỉ can thiệp tối thiểu khi trẻ gặp bế tắc.
              </p>
            </div>

            {(() => {
              const supportStudents = (stats?.students ?? []).filter((s) => s.needsSupport)

              if (supportStudents.length === 0) {
                return (
                  <div className="p-8 text-center space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-slate-800">Tất cả học sinh đang tiến bộ thuận lợi!</p>
                    <p className="text-xs text-muted max-w-md mx-auto">
                      Không có học sinh nào bị kẹt tại các trạm học. Tiếp tục khuyến khích các em tự do khám phá và sáng tạo.
                    </p>
                  </div>
                )
              }

              return (
                <div className="divide-y divide-border/60">
                  {supportStudents.map((st) => (
                    <article key={st.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{st.nickname || 'Học sinh'}</span>
                          <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-black text-purple-700 border border-purple-200">
                            Lv{st.level}
                          </span>
                          <span className="text-xs text-muted font-mono">ID: {st.id.slice(0, 8)}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span>
                            Trạm đang học:{' '}
                            <strong className="text-slate-800">
                              {st.currentQuest || 'Đang ở bước khởi đầu'}
                            </strong>
                            {st.currentPhase && ` (${st.currentPhase})`}
                          </span>
                          <span>
                            Hoạt động gần nhất:{' '}
                            <strong>
                              {st.lastActiveAt ? new Date(st.lastActiveAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}
                            </strong>
                          </span>
                        </div>

                        {/* Montessori Pedagogical Recommendation */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-xs text-amber-900">
                          <p className="font-bold flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                            <span>Khuyến nghị sư phạm:</span>
                          </p>
                          <p className="mt-0.5 leading-relaxed">
                            {st.supportReason ||
                              'Bé có thể đang phân vân trong phần thử thách. Thầy/Cô nên hỏi mở: "Con đang muốn nhân vật của mình làm gì tiếp theo nè?" để khơi gợi ý tưởng.'}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Button
                          variant="secondary"
                          className="!text-xs !min-h-9"
                          onClick={() => void handleOpenProgress(st.id)}
                        >
                          🔍 Xem chi tiết lộ trình
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )
            })()}
          </section>
        </div>
      )}

      {/* ── 5. TAB 3: THÔNG TIN & HƯỚNG DẪN LỚP ── */}
      {activeTab === 'guide' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Cơ Chế Ghi Danh Tự Động (Auto-Enrollment System) */}
          <section className="ui-card p-6 border border-border space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-600">CƠ CHẾ TỰ ĐỘNG HÓA</p>
              <h2 className="font-display text-2xl text-slate-900 mt-1">Ghi danh & Xếp lớp {classInfo.name}</h2>
            </div>

            <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                ⚡ TỰ ĐỘNG GHI DANH 100% HỌC SINH MỚI
              </span>
              <p className="text-sm text-slate-700 leading-relaxed">
                Tất cả học sinh khi đăng ký tài khoản hoặc được phụ huynh mở hồ sơ con sẽ được hệ thống <strong>TỰ ĐỘNG GHI DANH</strong> vào Lớp học AIKids Chính thức. Bé đăng nhập là vào học ngay Bản Đồ 6 Vùng Đảo mà <strong>không cần nhập mã lớp</strong>.
              </p>
              <Button
                onClick={() => void loadData()}
                className="mx-auto flex items-center gap-2 !min-h-10 !px-5"
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                <span>Đồng bộ danh sách học sinh</span>
              </Button>
            </div>

            <div className="space-y-2 text-xs text-muted">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span>Khóa học liên kết:</span>
                <span className="font-bold text-slate-700 text-right">Chương trình Chuẩn AIKids<br/>(6 Vùng Đảo - 32 Trạm Học)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span>Sĩ số lớp hiện tại:</span>
                <span className="font-bold text-slate-700">{students.length} bạn</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span>Trạng thái:</span>
                <span className="font-bold text-emerald-700">🟢 Tự động đồng bộ học sinh: Đang kích hoạt</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Mã định danh lớp (ID):</span>
                <span className="font-mono text-slate-700">{classInfo.id}</span>
              </div>
            </div>
          </section>

          {/* Card 2: Mã Lớp Mở Rộng & Trường Liên Kết (Optional Class Code) */}
          <section className="ui-card p-6 border border-border space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-600">TÙY CHỌN MỞ RỘNG</p>
              <h2 className="font-display text-xl text-slate-900 mt-1">Mã lớp dự phòng & Trường liên kết</h2>
            </div>

            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5 text-center space-y-4">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>CHỈ DÀNH CHO TRƯỜNG LIÊN KẾT NGOÀI HOẶC LỚP NGOẠI KHÓA</span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Học sinh học chương trình AIKids tiêu chuẩn <strong>KHÔNG CẦN</strong> mã này. Mã này chỉ dành riêng cho các trường đối tác liên kết hoặc khi mở lớp workshop ngoại khóa đặc thù.
              </p>
              <div className="inline-block rounded-xl bg-white px-6 py-2 shadow-sm border border-amber-100">
                <p className="font-mono text-3xl font-black tracking-widest text-slate-800 select-all">
                  {classInfo.code}
                </p>
              </div>
              <Button
                variant="secondary"
                type="button"
                onClick={() => void handleCopyCode()}
                className="mx-auto flex items-center gap-2 !min-h-9 !px-4 text-xs"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Đã sao chép mã!' : 'Sao chép mã mời dự phòng'}</span>
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-700 border-b border-border/60 pb-1">Hướng dẫn vận hành 3 bước chuẩn:</p>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-700 text-[11px]">
                    1
                  </span>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900">Tự động xếp lớp</strong>
                    <span className="text-[11px] text-muted leading-relaxed">
                      Hệ thống tự động nhận diện và xếp học sinh mới vào lớp.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-700 text-[11px]">
                    2
                  </span>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900">Đồng hành & Theo dõi</strong>
                    <span className="text-[11px] text-muted leading-relaxed">
                      Thầy cô theo dõi tiến độ trên Radar lớp học và chấm sản phẩm sáng tạo.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 font-bold text-amber-700 text-[11px]">
                    3
                  </span>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900">Học sinh trường ngoài (Tùy chọn)</strong>
                    <span className="text-[11px] text-muted leading-relaxed">
                      Chỉ học sinh từ các dự án trường đối tác liên kết mới dùng mã dự phòng này để phân loại nguồn tuyển sinh.
                    </span>
                  </div>
                </li>
              </ol>
            </div>
          </section>
        </div>
      )}

      {/* ── MODALS TÍCH HỢP ── */}

      {/* 1. AddStudentModal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-student-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false)
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">THÊM HỌC SINH</p>
                <h3 id="add-student-title" className="font-display text-lg text-slate-900">
                  Ghi danh học sinh vào lớp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleAddStudent(e)} className="space-y-4">
              <label className="block text-sm font-bold text-slate-800">
                Biệt danh học sinh
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bé Bo, Minh Quân, Bắp Nhí…"
                  value={newStudentNickname}
                  onChange={(e) => setNewStudentNickname(e.target.value)}
                  className="mt-1.5 w-full min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
                  autoFocus
                />
              </label>

              <p className="text-xs text-muted">
                Hệ thống sẽ liên kết tài khoản học sinh tương ứng với biệt danh này vào lớp {classInfo.name}.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={submittingStudent}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submittingStudent}>
                  {submittingStudent ? 'Đang thêm…' : 'Thêm vào lớp'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ClassSettingsModal */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="class-settings-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettingsModal(false)
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">CÀI ĐẶT LỚP HỌC</p>
                <h3 id="class-settings-title" className="font-display text-lg text-slate-900">
                  Đổi tên & mã mời lớp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSaveClassSettings(e)} className="space-y-4">
              <label className="block text-sm font-bold text-slate-800">
                Tên lớp học
                <input
                  type="text"
                  required
                  minLength={2}
                  value={classForm.name}
                  onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1.5 w-full min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
                />
              </label>

              <label className="block text-sm font-bold text-slate-800">
                Mã lớp (Chữ in hoa và số)
                <input
                  type="text"
                  required
                  minLength={3}
                  pattern="[A-Za-z0-9-]+"
                  value={classForm.code}
                  onChange={(e) => setClassForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="mt-1.5 w-full min-h-11 rounded-xl border-2 border-border bg-white px-3 font-mono text-sm uppercase outline-none transition focus:border-brand-400"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowSettingsModal(false)}
                  disabled={savingClass}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={savingClass}>
                  {savingClass ? 'Đang lưu…' : 'Lưu cài đặt'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RemoveStudentModal */}
      {removeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-student-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRemoveTarget(null)
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <Trash2 className="h-6 w-6" />
              <h3 id="remove-student-title" className="font-display text-lg text-slate-900">
                Xác nhận gỡ học sinh
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn gỡ học sinh{' '}
              <strong className="text-slate-900">{removeTarget.nickname || removeTarget.id}</strong> khỏi lớp{' '}
              <strong className="text-slate-900">{classInfo.name}</strong> không?
            </p>
            <p className="text-xs text-muted">
              Lưu ý: Thao tác này chỉ hủy liên kết của bé với lớp học hiện tại, không xóa tài khoản hay dữ liệu tiến độ của bé.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRemoveTarget(null)}
                disabled={removingStudent}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="bg-danger text-white hover:bg-rose-700"
                onClick={() => void handleRemoveStudent()}
                disabled={removingStudent}
              >
                {removingStudent ? 'Đang gỡ…' : 'Gỡ khỏi lớp'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. StudentProgressModal */}
      {progressTargetId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="progress-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseProgress()
          }}
        >
          <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">LỘ TRÌNH HỌC TẬP</p>
                <h3 id="progress-modal-title" className="font-display text-lg text-slate-900">
                  {studentProgress?.student?.nickname || 'Học sinh'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseProgress}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {progressLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                <span className="text-xs font-bold text-muted">Đang tải chi tiết lộ trình…</span>
              </div>
            ) : studentProgress ? (
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Status Golden Rules Island */}
                {(() => {
                  const quests = studentProgress.progress
                  const ruleQuests = quests.filter((q) => {
                    const t = q.questTitle.toLowerCase()
                    return t.includes('quy tắc') || t.includes('quy tac') || t.includes('rule')
                  })
                  const isRuleDone =
                    ruleQuests.length > 0
                      ? ruleQuests.every((q) => q.status === 'completed')
                      : quests.some((q) => q.status === 'completed')

                  const stuckQuest = quests.find(
                    (q) => q.status === 'in_progress' || q.status === 'available',
                  )

                  return (
                    <div className="space-y-2">
                      <div
                        className={cn(
                          'flex items-center gap-2 rounded-2xl p-3 text-xs font-black border',
                          isRuleDone
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-amber-200 bg-amber-50 text-amber-900',
                        )}
                      >
                        <Shield className="h-4 w-4 shrink-0" />
                        <span>
                          {isRuleDone
                            ? '🛡️ Đã hoàn thành Đảo Quy Tắc Vàng AIKI (Huy hiệu Hiệp Sĩ)'
                            : '⏳ Chưa hoàn thành Đảo Quy Tắc — Chưa mở khóa thế giới sáng tạo'}
                        </span>
                      </div>

                      {stuckQuest && (
                        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-bold text-rose-900">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                          <span>
                            📍 Trạm đang học / kẹt:{' '}
                            <strong className="text-rose-950">{stuckQuest.questTitle}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Stations List */}
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-muted mb-2">
                    Các trạm học ({studentProgress.progress.length})
                  </p>

                  {studentProgress.progress.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted">Bé chưa bắt đầu trạm nào</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {studentProgress.progress.map((q, idx) => {
                        const isCompleted = q.status === 'completed'
                        return (
                          <li
                            key={idx}
                            className={cn(
                              'flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs transition border',
                              isCompleted
                                ? 'bg-emerald-50/50 border-emerald-100 text-slate-800'
                                : 'bg-slate-50 border-border text-slate-600',
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={cn(
                                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                  isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600',
                                )}
                              >
                                {idx + 1}
                              </span>
                              <span className="truncate font-medium">{q.questTitle}</span>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {q.stars > 0 && (
                                <span className="font-bold text-amber-600">{q.stars} ⭐</span>
                              )}
                              <span
                                className={cn(
                                  'rounded-lg px-2 py-0.5 text-[10px] font-extrabold',
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-700',
                                )}
                              >
                                {isCompleted ? 'Hoàn thành' : q.status}
                              </span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}

            <div className="border-t border-border pt-3 flex justify-end shrink-0">
              <Button variant="secondary" onClick={handleCloseProgress}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
