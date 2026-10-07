import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  BarChart3,
  BookOpen,
  Copy,
  Check,
  Plus,
  Settings,
  RefreshCw,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import {
  type StudentRow,
  type ClassStatsStudent,
  type ClassStats,
  type ClassInfo,
  type StudentProgressData,
  type ClassManagementConsoleProps,
  ClassStudentsTab,
  ClassStatsTab,
  ClassGuideTab,
  AddStudentModal,
  ClassSettingsModal,
  RemoveStudentModal,
  StudentProgressModal,
} from './class-console'

export type {
  StudentRow,
  ClassStatsStudent,
  ClassStats,
  ClassInfo,
  StudentProgressData,
  ClassManagementConsoleProps,
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
        api<{ class: ClassInfo | null; students: StudentRow[] }>('/api/teacher/class').catch(() => null),
        api<{ stats: ClassStats | null }>('/api/teacher/class/stats').catch(() => null),
      ])

      if (classRes.status === 'fulfilled' && classRes.value) {
        setClassInfo(classRes.value.class)
        setStudents(classRes.value.students ?? [])
        if (classRes.value.class) {
          setClassForm({
            name: classRes.value.class.name,
            code: classRes.value.class.code,
          })
        }
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
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
          <Lightbulb className="h-4 w-4" />
          <span>⚡ Ghi danh & Thông tin lớp</span>
        </button>
      </nav>

      {/* ── 3. TAB 1: DANH SÁCH HỌC SINH ── */}
      {activeTab === 'students' && (
        <ClassStudentsTab
          students={students}
          filteredStudents={filteredStudents}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
          statsStudentMap={statsStudentMap}
          studentPagination={studentPagination}
          canManageClass={canManageClass}
          handleOpenProgress={handleOpenProgress}
          setRemoveTarget={setRemoveTarget}
        />
      )}

      {/* ── 4. TAB 2: THỐNG KÊ & HỖ TRỢ ── */}
      {activeTab === 'stats' && (
        <ClassStatsTab
          stats={stats}
          students={students}
          handleOpenProgress={handleOpenProgress}
        />
      )}

      {/* ── 5. TAB 3: THÔNG TIN & HƯỚNG DẪN LỚP ── */}
      {activeTab === 'guide' && (
        <ClassGuideTab
          classInfo={classInfo}
          students={students}
          loadData={loadData}
          isRefreshing={isRefreshing}
          handleCopyCode={handleCopyCode}
          copiedCode={copiedCode}
        />
      )}

      {/* ── MODALS TÍCH HỢP ── */}
      <AddStudentModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        classInfo={classInfo}
        newStudentNickname={newStudentNickname}
        setNewStudentNickname={setNewStudentNickname}
        handleAddStudent={handleAddStudent}
        submittingStudent={submittingStudent}
      />

      <ClassSettingsModal
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        classForm={classForm}
        setClassForm={setClassForm}
        handleSaveClassSettings={handleSaveClassSettings}
        savingClass={savingClass}
      />

      <RemoveStudentModal
        removeTarget={removeTarget}
        onClose={() => setRemoveTarget(null)}
        classInfo={classInfo}
        handleRemoveStudent={handleRemoveStudent}
        removingStudent={removingStudent}
      />

      <StudentProgressModal
        progressTargetId={progressTargetId}
        onClose={handleCloseProgress}
        progressLoading={progressLoading}
        studentProgress={studentProgress}
      />
    </div>
  )
}
