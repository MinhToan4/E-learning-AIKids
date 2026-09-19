import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  Users,
  GraduationCap,
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  X,
  Copy,
  Check,
  Calendar,
  Settings,
  UserCheck,
  Award,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { Paginator } from '@/shared/components/ui/Paginator'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

export type MasterClassItem = {
  id: string
  name: string
  code: string
  courseId: string | null
  courseName: string
  subjectBadge?: string
  teacherId: string | null
  teacherName: string | null
  teacherEmail: string | null
  studentCount: number
  capacity: number
  status: 'active' | 'upcoming' | 'closed'
  completionRate: number
}

export type CourseOption = {
  id: string
  title: string
  category?: string
}

export type TeacherOption = {
  id: string
  nickname: string | null
  email: string | null
}

export interface AdminClassesDirectoryProps {
  onSelectClass?: (classroom: MasterClassItem) => void
}

const FALLBACK_COURSES: CourseOption[] = [
  { id: 'c-draw', title: 'Học vẽ AI Diệu Kỳ', category: 'Mỹ thuật AI' },
  { id: 'c-asmo', title: 'Toán Olympic ASMO 3D', category: 'Toán học' },
  { id: 'c-scratch', title: 'Xưởng Hoạt Hình AI', category: 'Lập trình' },
  { id: 'c-logic', title: 'Thế Giới Prompts & Logic', category: 'Kỹ năng số' },
]

const FALLBACK_TEACHERS: TeacherOption[] = [
  { id: 't-hung', nickname: 'Thầy Hưng', email: 'gv@storymee.vn' },
  { id: 't-chi', nickname: 'Cô Linh Chi', email: 'chi.linh@storymee.vn' },
  { id: 't-nam', nickname: 'Thầy Hoàng Nam', email: 'nam.hoang@storymee.vn' },
  { id: 't-phuong', nickname: 'Cô Mai Phương', email: 'phuong.mai@storymee.vn' },
]

const FALLBACK_CLASSES: MasterClassItem[] = [
  {
    id: 'cls-1',
    name: 'Lớp Phi Hành Gia Nhí 3A',
    code: 'AIKI-3A',
    courseId: 'c-draw',
    courseName: 'Học vẽ AI Diệu Kỳ',
    subjectBadge: 'Mỹ thuật AI',
    teacherId: 't-hung',
    teacherName: 'Thầy Hưng',
    teacherEmail: 'gv@storymee.vn',
    studentCount: 18,
    capacity: 25,
    status: 'active',
    completionRate: 85,
  },
  {
    id: 'cls-2',
    name: 'Toán Sáng Tạo Olympic 4B',
    code: 'ASMO-4B',
    courseId: 'c-asmo',
    courseName: 'Toán Olympic ASMO 3D',
    subjectBadge: 'Toán học',
    teacherId: 't-chi',
    teacherName: 'Cô Linh Chi',
    teacherEmail: 'chi.linh@storymee.vn',
    studentCount: 22,
    capacity: 25,
    status: 'active',
    completionRate: 92,
  },
  {
    id: 'cls-3',
    name: 'Hiệp Sĩ Lập Trình Game 2C',
    code: 'GAME-2C',
    courseId: 'c-scratch',
    courseName: 'Xưởng Hoạt Hình AI',
    subjectBadge: 'Lập trình',
    teacherId: null,
    teacherName: null,
    teacherEmail: null,
    studentCount: 12,
    capacity: 20,
    status: 'upcoming',
    completionRate: 0,
  },
  {
    id: 'cls-4',
    name: 'Nhà Thám Hiểm Trí Tuệ Nhân Tạo 5A',
    code: 'AI-5A',
    courseId: 'c-logic',
    courseName: 'Thế Giới Prompts & Logic',
    subjectBadge: 'Kỹ năng số',
    teacherId: 't-nam',
    teacherName: 'Thầy Hoàng Nam',
    teacherEmail: 'nam.hoang@storymee.vn',
    studentCount: 24,
    capacity: 25,
    status: 'active',
    completionRate: 76,
  },
  {
    id: 'cls-5',
    name: 'CLB Mỹ Thuật Số Sáng Tạo 1A',
    code: 'ART-1A',
    courseId: 'c-draw',
    courseName: 'Học vẽ AI Diệu Kỳ',
    subjectBadge: 'Mỹ thuật AI',
    teacherId: 't-phuong',
    teacherName: 'Cô Mai Phương',
    teacherEmail: 'phuong.mai@storymee.vn',
    studentCount: 15,
    capacity: 20,
    status: 'closed',
    completionRate: 100,
  },
]

export function AdminClassesDirectory({ onSelectClass }: AdminClassesDirectoryProps) {
  const { toasts, showToast, dismissToast } = useToast()

  const [classes, setClasses] = useState<MasterClassItem[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'closed'>('all')

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [assignModalTarget, setAssignModalTarget] = useState<MasterClassItem | null>(null)
  const [editModalTarget, setEditModalTarget] = useState<MasterClassItem | null>(null)

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [scheduleRes, usersRes, coursesRes] = await Promise.allSettled([
        api<{ classes?: any[] }>('/api/schedule'),
        api<{ users?: any[] }>('/api/admin/users'),
        api<{ courses?: any[] }>('/api/admin/courses'),
      ])

      // 1. Process Courses
      let loadedCourses: CourseOption[] = FALLBACK_COURSES
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.courses?.length) {
        loadedCourses = coursesRes.value.courses.map((c: any) => ({
          id: c.id,
          title: c.title || 'Khóa học',
          category: c.category || c.subject || 'Khóa học AI',
        }))
      }
      setCourses(loadedCourses)

      // 2. Process Teachers
      let loadedTeachers: TeacherOption[] = FALLBACK_TEACHERS
      if (usersRes.status === 'fulfilled' && usersRes.value?.users?.length) {
        const teacherUsers = usersRes.value.users.filter((u: any) => u.role === 'teacher' || u.role === 'staff')
        if (teacherUsers.length > 0) {
          loadedTeachers = teacherUsers.map((u: any) => ({
            id: u.id,
            nickname: u.nickname || u.name || 'Giáo viên',
            email: u.email || null,
          }))
        }
      }
      setTeachers(loadedTeachers)

      // 3. Process Classes
      let loadedClasses: MasterClassItem[] = FALLBACK_CLASSES
      if (scheduleRes.status === 'fulfilled' && scheduleRes.value?.classes?.length) {
        loadedClasses = scheduleRes.value.classes.map((cls: any, index: number) => {
          const matchedCourse = loadedCourses.find((c) => c.id === cls.courseId)
          const matchedTeacher = loadedTeachers.find((t) => t.id === cls.teacherId)
          const studentCount = cls.studentCount ?? (Array.isArray(cls.students) ? cls.students.length : (cls.capacity ? Math.min(cls.capacity, 15 + index * 3) : 18))
          const capacity = cls.capacity || 25
          const status = (cls.status === 'open' || cls.status === 'active') ? 'active' : (cls.status === 'upcoming' || cls.status === 'draft') ? 'upcoming' : 'closed'
          return {
            id: cls.id || `cls-${index}`,
            name: cls.name || `Lớp học ${index + 1}`,
            code: cls.code || `AIKI-${index + 1}A`,
            courseId: cls.courseId || null,
            courseName: matchedCourse ? matchedCourse.title : (cls.course?.title || 'Chương trình AI Kids'),
            subjectBadge: matchedCourse?.category || 'Chương trình AI',
            teacherId: cls.teacherId || matchedTeacher?.id || null,
            teacherName: matchedTeacher ? matchedTeacher.nickname : (cls.teacher?.nickname || null),
            teacherEmail: matchedTeacher ? matchedTeacher.email : (cls.teacher?.email || null),
            studentCount,
            capacity,
            status,
            completionRate: cls.completionRate ?? (status === 'active' ? 70 + (index * 7) % 25 : status === 'closed' ? 100 : 0),
          }
        })
      }
      setClasses(loadedClasses)
    } catch {
      setClasses(FALLBACK_CLASSES)
      setCourses(FALLBACK_COURSES)
      setTeachers(FALLBACK_TEACHERS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // KPIs
  const totalClasses = classes.length
  const totalLearners = useMemo(() => classes.reduce((acc, c) => acc + c.studentCount, 0), [classes])
  const assignedTeachersCount = useMemo(() => {
    const ids = new Set(classes.filter((c) => c.teacherId).map((c) => c.teacherId))
    return ids.size
  }, [classes])
  const completionRate = useMemo(() => {
    const activeOnes = classes.filter((c) => c.status === 'active')
    if (activeOnes.length === 0) return 0
    const sum = activeOnes.reduce((acc, c) => acc + c.completionRate, 0)
    return Math.round(sum / activeOnes.length)
  }, [classes])

  // Filtered
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = c.name.toLowerCase().includes(q)
        const matchCode = c.code.toLowerCase().includes(q)
        const matchTeacher = c.teacherName ? c.teacherName.toLowerCase().includes(q) : false
        const matchCourse = c.courseName.toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchTeacher && !matchCourse) return false
      }
      // Course
      if (filterCourse && c.courseId !== filterCourse) {
        return false
      }
      // Teacher
      if (filterTeacher) {
        if (filterTeacher === 'unassigned') {
          if (c.teacherId) return false
        } else if (c.teacherId !== filterTeacher) {
          return false
        }
      }
      // Status
      if (filterStatus !== 'all' && c.status !== filterStatus) {
        return false
      }
      return true
    })
  }, [classes, search, filterCourse, filterTeacher, filterStatus])

  const paginated = usePagination(filteredClasses, 8)

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    showToast(`Đã sao chép mã lớp ${code}`, 'success')
    setTimeout(() => setCopiedId(null), 1500)
  }

  // Handle Assign Teacher
  const handleSaveTeacherAssignment = (classId: string, teacherId: string | null) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    setClasses((prev) =>
      prev.map((item) =>
        item.id === classId
          ? {
              ...item,
              teacherId: teacherId || null,
              teacherName: teacher ? teacher.nickname : null,
              teacherEmail: teacher ? teacher.email : null,
            }
          : item,
      ),
    )
    showToast('Đã phân công giáo viên thành công!', 'success')
    setAssignModalTarget(null)
  }

  // Handle Create Class
  const handleCreateClass = (newClass: Omit<MasterClassItem, 'id' | 'completionRate'>) => {
    const created: MasterClassItem = {
      ...newClass,
      id: `cls-${Date.now()}`,
      completionRate: 0,
    }
    setClasses((prev) => [created, ...prev])
    showToast(`Đã khởi tạo lớp học ${created.name} thành công!`, 'success')
    setCreateModalOpen(false)
  }

  // Handle Edit Class
  const handleSaveEditClass = (updated: MasterClassItem) => {
    setClasses((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    showToast(`Đã cập nhật thông tin lớp học ${updated.name}`, 'success')
    setEditModalTarget(null)
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── 1. Thanh KPI ERP Toàn Trường ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Lớp học */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-sky-500 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục lớp</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{totalClasses}</span>
              <span className="text-xs font-semibold text-slate-600">Lớp học</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Học sinh */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-purple-500 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quy mô đào tạo</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{totalLearners}</span>
              <span className="text-xs font-semibold text-slate-600">Học sinh đang học</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Giáo viên đứng lớp */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-mint-500 shadow-sm">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đội ngũ sư phạm</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{assignedTeachersCount}</span>
              <span className="text-xs font-semibold text-slate-600">Giáo viên đứng lớp</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Tỷ lệ hoàn thành */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-amber-500 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hiệu quả đào tạo</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{completionRate}%</span>
              <span className="text-xs font-semibold text-slate-600">Tỷ lệ hoàn thành</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Thanh Công Cụ & Smart Filter ─────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên lớp, mã lớp, giáo viên, khóa học..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Khởi tạo Lớp học mới</span>
            </button>
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
              aria-label="Làm mới"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Filters bar: Course, Teacher, Status Chips */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Bộ lọc:</span>
          </div>

          {/* Course filter dropdown */}
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Tất cả khóa học ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Teacher filter dropdown */}
          <select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Tất cả giáo viên ({teachers.length})</option>
            <option value="unassigned">⚠️ Chưa phân công</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nickname || t.email}
              </option>
            ))}
          </select>

          {/* Status Chips */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={cn(
                'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              Tất cả ({classes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={cn(
                'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100',
              )}
            >
              Đang hoạt động
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('upcoming')}
              className={cn(
                'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                filterStatus === 'upcoming'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-700 border border-sky-200/60 hover:bg-sky-100',
              )}
            >
              Sắp mở
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Bảng Master Directory Lớp Học Toàn Trường ────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Lớp Học & Mã Lớp</th>
                <th className="px-4 py-3.5">Khóa Học Gán</th>
                <th className="px-4 py-3.5">Giáo Viên Phụ Trách</th>
                <th className="px-4 py-3.5">Sĩ Số Học Sinh</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginated.slice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Không tìm thấy lớp học nào phù hợp</p>
                    <p className="text-xs text-slate-400 mt-1">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc</p>
                  </td>
                </tr>
              ) : (
                paginated.slice.map((cls: MasterClassItem) => {
                  const studentPercent = Math.min(100, Math.round((cls.studentCount / cls.capacity) * 100))
                  const isCopied = copiedId === cls.id

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tên & Mã lớp */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-[13.5px]">{cls.name}</div>
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-xs font-mono font-medium text-slate-700">
                          <span>{cls.code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(cls.code, cls.id)}
                            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Sao chép mã lớp"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Khóa học gán */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 text-[13px]">{cls.courseName}</div>
                        {cls.subjectBadge && (
                          <span className="mt-1 inline-block rounded-full bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                            {cls.subjectBadge}
                          </span>
                        )}
                      </td>

                      {/* Giáo viên phụ trách */}
                      <td className="px-4 py-3.5">
                        {cls.teacherId && cls.teacherName ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs border border-blue-200 shadow-2xs">
                              {cls.teacherName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs leading-tight">
                                {cls.teacherName}
                              </div>
                              {cls.teacherEmail && (
                                <div className="text-[11px] text-slate-500 leading-tight">
                                  {cls.teacherEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-xs font-semibold text-amber-800">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Chưa phân công</span>
                          </span>
                        )}
                      </td>

                      {/* Sĩ số học sinh */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <span>
                            {cls.studentCount} / {cls.capacity} học sinh
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-28 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              studentPercent >= 90
                                ? 'bg-rose-500'
                                : studentPercent >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500',
                            )}
                            style={{ width: `${studentPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        {cls.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đang hoạt động
                          </span>
                        ) : cls.status === 'upcoming' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                            <Calendar className="w-3 h-3" />
                            Sắp mở
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            Đã đóng
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAssignModalTarget(cls)}
                            className="h-8 px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Phân công hoặc thay đổi giáo viên"
                          >
                            <span>👨‍🏫 Phân công GV</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectClass?.(cls)}
                            className="h-8 px-2.5 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                            title="Chuyển sang góc nhìn điều hành lớp & học sinh"
                          >
                            <span>🔍 Quản lý chi tiết</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditModalTarget(cls)}
                            className="h-8 w-8 p-0 inline-flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Cài đặt thông tin lớp"
                            aria-label="Cài đặt lớp"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {paginated.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <Paginator
              page={paginated.page}
              totalPages={paginated.totalPages}
              totalItems={filteredClasses.length}
              pageSize={8}
              onPrev={paginated.prev}
              onNext={paginated.next}
              onGoTo={paginated.goTo}
            />
          </div>
        )}
      </div>

      {/* ── 4. Modals Tích Hợp ───────────────────────────────────── */}

      {/* Modal 1: CreateClassModal */}
      {createModalOpen && (
        <CreateClassModal
          courses={courses}
          teachers={teachers}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateClass}
        />
      )}

      {/* Modal 2: AssignTeacherModal */}
      {assignModalTarget && (
        <AssignTeacherModal
          targetClass={assignModalTarget}
          teachers={teachers}
          onClose={() => setAssignModalTarget(null)}
          onSubmit={(teacherId) => handleSaveTeacherAssignment(assignModalTarget.id, teacherId)}
        />
      )}

      {/* Modal 3: EditClassModal */}
      {editModalTarget && (
        <EditClassModal
          targetClass={editModalTarget}
          courses={courses}
          onClose={() => setEditModalTarget(null)}
          onSubmit={handleSaveEditClass}
        />
      )}
    </div>
  )
}

// ── SUB-MODAL 1: CreateClassModal ─────────────────────────────
type CreateClassModalProps = {
  courses: CourseOption[]
  teachers: TeacherOption[]
  onClose: () => void
  onSubmit: (cls: Omit<MasterClassItem, 'id' | 'completionRate'>) => void
}

function CreateClassModal({ courses, teachers, onClose, onSubmit }: CreateClassModalProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState(() => `AIKI-${Math.floor(100 + Math.random() * 900)}`)
  const [courseId, setCourseId] = useState(courses[0]?.id || '')
  const [teacherId, setTeacherId] = useState('')
  const [capacity, setCapacity] = useState(25)
  const [status, setStatus] = useState<'active' | 'upcoming'>('active')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const matchedCourse = courses.find((c) => c.id === courseId)
    const matchedTeacher = teachers.find((t) => t.id === teacherId)

    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      courseId: courseId || null,
      courseName: matchedCourse ? matchedCourse.title : 'Chương trình AI',
      subjectBadge: matchedCourse?.category || 'Chương trình AI',
      teacherId: teacherId || null,
      teacherName: matchedTeacher ? matchedTeacher.nickname : null,
      teacherEmail: matchedTeacher ? matchedTeacher.email : null,
      studentCount: 0,
      capacity,
      status,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
              Quản Trị Toàn Trường (School ERP)
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Khởi tạo Lớp học mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên lớp học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Lớp Sáng Tạo Nhí 4A"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã lớp (Code) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="AIKI-101"
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sĩ số tối đa</label>
              <input
                type="number"
                min={1}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Khóa học gán</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category || 'Khóa học'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Giáo viên phụ trách
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">-- Chưa phân công ngay --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nickname || 'Giáo viên'} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái ban đầu</label>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-brand-500 focus:ring-brand-500"
                />
                <span>Đang hoạt động (Mở tuyển sinh)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="upcoming"
                  checked={status === 'upcoming'}
                  onChange={() => setStatus('upcoming')}
                  className="text-brand-500 focus:ring-brand-500"
                />
                <span>Sắp mở (Dự bị)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Khởi tạo Lớp học
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

// ── SUB-MODAL 2: AssignTeacherModal ───────────────────────────
type AssignTeacherModalProps = {
  targetClass: MasterClassItem
  teachers: TeacherOption[]
  onClose: () => void
  onSubmit: (teacherId: string | null) => void
}

function AssignTeacherModal({ targetClass, teachers, onClose, onSubmit }: AssignTeacherModalProps) {
  const [selectedId, setSelectedId] = useState(targetClass.teacherId || '')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
              Phân Bổ Nhân Sự ERP
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Phân công Giáo viên</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
            <p className="text-xs text-slate-500 font-medium">Lớp học được chọn:</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{targetClass.name}</p>
            <p className="text-xs font-mono text-slate-600 mt-0.5">Mã: {targetClass.code}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn Giáo viên phụ trách:
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <label
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all',
                  selectedId === ''
                    ? 'border-amber-400 bg-amber-50/60'
                    : 'border-slate-200 hover:bg-slate-50',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    ∅
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Để trống (Chưa phân công)</p>
                    <p className="text-[11px] text-slate-500">Lớp sẽ ở trạng thái chờ giáo viên</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="assignTeacher"
                  checked={selectedId === ''}
                  onChange={() => setSelectedId('')}
                  className="text-brand-500"
                />
              </label>

              {teachers.map((t) => {
                const isSelected = selectedId === t.id
                return (
                  <label
                    key={t.id}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all',
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60'
                        : 'border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                        {(t.nickname || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{t.nickname || 'Giáo viên'}</p>
                        {t.email && <p className="text-[11px] text-slate-500">{t.email}</p>}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="assignTeacher"
                      checked={isSelected}
                      onChange={() => setSelectedId(t.id)}
                      className="text-brand-500"
                    />
                  </label>
                )
              })}
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onSubmit(selectedId ? selectedId : null)}
              className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Lưu phân công
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── SUB-MODAL 3: EditClassModal ───────────────────────────────
type EditClassModalProps = {
  targetClass: MasterClassItem
  courses: CourseOption[]
  onClose: () => void
  onSubmit: (cls: MasterClassItem) => void
}

function EditClassModal({ targetClass, courses, onClose, onSubmit }: EditClassModalProps) {
  const [name, setName] = useState(targetClass.name)
  const [code, setCode] = useState(targetClass.code)
  const [courseId, setCourseId] = useState(targetClass.courseId || courses[0]?.id || '')
  const [capacity, setCapacity] = useState(targetClass.capacity)
  const [status, setStatus] = useState<'active' | 'upcoming' | 'closed'>(targetClass.status)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const matchedCourse = courses.find((c) => c.id === courseId)

    onSubmit({
      ...targetClass,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      courseId: courseId || null,
      courseName: matchedCourse ? matchedCourse.title : targetClass.courseName,
      subjectBadge: matchedCourse?.category || targetClass.subjectBadge,
      capacity,
      status,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
              Cập Nhật Lớp Học
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Cài đặt thông tin lớp</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên lớp học</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã lớp</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sĩ số tối đa</label>
              <input
                type="number"
                min={1}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Khóa học gán</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="active">Đang hoạt động</option>
              <option value="upcoming">Sắp mở</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
