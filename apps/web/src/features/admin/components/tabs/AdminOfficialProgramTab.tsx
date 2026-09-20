import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  GraduationCap,
  Sparkles,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Award,
  Star,
  RefreshCw,
  X,
  Lock,
  Unlock,
  Smile,
  UserCheck,
} from 'lucide-react'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

// ── Types ───────────────────────────────────────────────────────────
export interface OfficialStudent {
  id: string
  nickname: string
  level: number
  xp: number
  completedQuests: number
  currentQuest: string | null
  currentPhase: string | null
  lastActiveAt: string | null
  needsSupport: boolean
  supportReason: string | null
  ageGroup: 'preschool' | 'primary' | 'junior'
  hasSafetyBadge: boolean
}

export interface OfficialTeacher {
  id: string
  nickname: string
  email: string | null
  role: string
}

export interface IslandGovernanceItem {
  id: number
  code: string
  name: string
  subtitle: string
  icon: string
  requiredSafetyGate: boolean
  status: 'active' | 'scheduled' | 'locked'
  targetCohort: string
  description: string
}

export interface SchoolShowcaseItem {
  id: string
  title: string
  authorName: string
  authorAge: number
  category: 'art' | 'comic' | 'game'
  status: 'approved' | 'pending'
  stars: number
  submittedAt: string
  imageUrl?: string
}

const DEFAULT_ISLANDS: IslandGovernanceItem[] = [
  {
    id: 1,
    code: 'ISLAND-1',
    name: 'Đảo 10 Quy Tắc Vàng',
    subtitle: 'Bắt buộc hoàn thành - Cổng an toàn AI',
    icon: '🏝️',
    requiredSafetyGate: true,
    status: 'active',
    targetCohort: 'Toàn trường (Bắt buộc)',
    description: 'Trang bị văn hóa số, bảo mật danh tính nhí và quy tắc tương tác đạo đức với AI.',
  },
  {
    id: 2,
    code: 'ISLAND-2',
    name: 'Xưởng Sáng Tạo AI',
    subtitle: 'Tạo tranh vẽ AI & Prompts an toàn',
    icon: '🎨',
    requiredSafetyGate: false,
    status: 'active',
    targetCohort: 'Mầm non & Tiểu học',
    description: 'Học sinh làm quen với ngôn ngữ mô tả hình ảnh an toàn cùng Mèo AIKI.',
  },
  {
    id: 3,
    code: 'ISLAND-3',
    name: 'Thung Lũng Hoạt Hình AI',
    subtitle: 'Biên kịch Comic & Video',
    icon: '🎬',
    requiredSafetyGate: false,
    status: 'active',
    targetCohort: 'Tiểu học & Thiếu nhi',
    description: 'Phát triển năng lực kể chuyện số, storyboard phân cảnh và tạo video hoạt hình.',
  },
  {
    id: 4,
    code: 'ISLAND-4',
    name: 'Đấu Trường Đố Vui AI',
    subtitle: 'Đố vui trí tuệ & Game tương tác',
    icon: '⚔️',
    requiredSafetyGate: false,
    status: 'active',
    targetCohort: 'Tiểu học & Thiếu nhi',
    description: 'Rèn luyện phản xạ logic, truy tìm prompt tối ưu qua các mini-game gamification.',
  },
  {
    id: 5,
    code: 'ISLAND-5',
    name: 'Thành Phố Ứng Dụng Thông Minh',
    subtitle: 'Trợ lý AI & Đời sống',
    icon: '🏙️',
    requiredSafetyGate: false,
    status: 'active',
    targetCohort: 'Thiếu nhi (10-12 tuổi)',
    description: 'Xây dựng trợ lý học tập cá nhân và giải pháp giải quyết vấn đề thực tiễn.',
  },
  {
    id: 6,
    code: 'ISLAND-6',
    name: 'Đảo Vũ Trụ Tương Lai',
    subtitle: 'Dự án Sáng tạo Tốt nghiệp',
    icon: '🌌',
    requiredSafetyGate: false,
    status: 'scheduled',
    targetCohort: 'Khóa Tốt Nghiệp',
    description: 'Đồ án lớn tích hợp liên môn, bảo vệ dự án trước hội đồng sư phạm nhà trường.',
  },
]

const INITIAL_SHOWCASE_ITEMS: SchoolShowcaseItem[] = [
  {
    id: 'sc-1',
    title: 'Phi Thuyền Khám Phá Sao Hỏa Cùng AIKI',
    authorName: 'Bé Miu',
    authorAge: 8,
    category: 'art',
    status: 'approved',
    stars: 5,
    submittedAt: 'Hôm nay',
  },
  {
    id: 'sc-2',
    title: 'Chú Mèo Biết Bay Cứu Khu Rừng Xanh',
    authorName: 'Bé Na',
    authorAge: 6,
    category: 'comic',
    status: 'pending',
    stars: 0,
    submittedAt: 'Hôm qua',
  },
  {
    id: 'sc-3',
    title: 'Thành Phố Năng Lượng Xanh 2050',
    authorName: 'Bé Long',
    authorAge: 11,
    category: 'art',
    status: 'pending',
    stars: 0,
    submittedAt: '2 ngày trước',
  },
  {
    id: 'sc-4',
    title: 'Trò Chơi Vượt Chướng Ngại Vật AI',
    authorName: 'Bé Bin',
    authorAge: 10,
    category: 'game',
    status: 'approved',
    stars: 4,
    submittedAt: '3 ngày trước',
  },
]

export function AdminOfficialProgramTab() {
  const { toasts, showToast, dismissToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<OfficialStudent[]>([])
  const [teachers, setTeachers] = useState<OfficialTeacher[]>([])

  // Pacing & Safety states
  const [pacingMode, setPacingMode] = useState<'self_paced' | 'scheduled'>('self_paced')
  const [safetyShieldEnabled, setSafetyShieldEnabled] = useState(true)
  const [islands, setIslands] = useState<IslandGovernanceItem[]>(DEFAULT_ISLANDS)

  // Mentor assignments per Age Cohort
  const [cohortMentors, setCohortMentors] = useState<Record<string, string>>({
    preschool: '',
    primary: '',
    junior: '',
  })

  // Modals state
  const [selectedCohortModal, setSelectedCohortModal] = useState<string | null>(null)
  const [assignStuckMentorTarget, setAssignStuckMentorTarget] = useState<OfficialStudent | null>(null)
  const [selectedStuckMentorId, setSelectedStuckMentorId] = useState<string>('')

  // Showcase state
  const [showcaseItems, setShowcaseItems] = useState<SchoolShowcaseItem[]>(INITIAL_SHOWCASE_ITEMS)

  // ── Fetch Live Data ────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, classRes, statsRes] = await Promise.allSettled([
        api<{ users?: any[] }>('/api/admin/users'),
        api<{ class: any; students: any[] }>('/api/teacher/class'),
        api<{ stats: any }>('/api/teacher/class/stats'),
      ])

      // 1. Process Teachers
      let loadedTeachers: OfficialTeacher[] = []
      if (usersRes.status === 'fulfilled' && usersRes.value?.users?.length) {
        const staff = usersRes.value.users.filter(
          (u: any) => u.role === 'teacher' || u.role === 'curriculum_lead' || u.role === 'staff',
        )
        loadedTeachers = staff.map((u: any) => ({
          id: u.id,
          nickname: u.nickname || u.name || 'Giáo viên',
          email: u.email || null,
          role: u.role,
        }))
      }
      setTeachers(loadedTeachers)

      // 2. Process Students from teacher/class and stats
      const studentMap = new Map<string, OfficialStudent>()

      // Students from /api/teacher/class
      if (classRes.status === 'fulfilled' && classRes.value?.students?.length) {
        classRes.value.students.forEach((s: any, idx: number) => {
          const lvl = s.level || 1
          const ageGroup: 'preschool' | 'primary' | 'junior' =
            lvl <= 1 ? 'preschool' : lvl <= 3 ? 'primary' : 'junior'
          const completedQuests = s.completedQuests || 0
          studentMap.set(s.id, {
            id: s.id,
            nickname: s.nickname || `Học sinh ${idx + 1}`,
            level: lvl,
            xp: s.xp || 0,
            completedQuests,
            currentQuest: s.currentQuest || `Trạm ${completedQuests + 1}`,
            currentPhase: 'practice',
            lastActiveAt: new Date().toISOString(),
            needsSupport: false,
            supportReason: null,
            ageGroup,
            hasSafetyBadge: completedQuests >= 1,
          })
        })
      }

      // Merge stuck status from /api/teacher/class/stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.stats?.students?.length) {
        statsRes.value.stats.students.forEach((s: any, idx: number) => {
          const existing = studentMap.get(s.id)
          const lvl = s.level || (existing ? existing.level : 1)
          const ageGroup: 'preschool' | 'primary' | 'junior' =
            lvl <= 1 ? 'preschool' : lvl <= 3 ? 'primary' : 'junior'
          const completedQuests = s.completedQuests ?? (existing ? existing.completedQuests : 0)

          studentMap.set(s.id, {
            id: s.id,
            nickname: s.nickname || existing?.nickname || `Học sinh ${idx + 1}`,
            level: lvl,
            xp: s.xp || existing?.xp || 0,
            completedQuests,
            currentQuest: s.currentQuest || existing?.currentQuest || `Trạm ${completedQuests + 1}`,
            currentPhase: s.currentPhase || 'practice',
            lastActiveAt: s.lastActiveAt || new Date().toISOString(),
            needsSupport: Boolean(s.needsSupport),
            supportReason: s.supportReason || (s.needsSupport ? 'Cần hỗ trợ gỡ kẹt bài' : null),
            ageGroup,
            hasSafetyBadge: completedQuests >= 1,
          })
        })
      }

      // Also incorporate users from /api/admin/users if they are children/students
      if (usersRes.status === 'fulfilled' && usersRes.value?.users?.length) {
        const studentUsers = usersRes.value.users.filter(
          (u: any) => u.role === 'student' || u.role === 'child',
        )
        studentUsers.forEach((u: any, idx: number) => {
          if (!studentMap.has(u.id)) {
            const lvl = u.level || 1
            const ageGroup: 'preschool' | 'primary' | 'junior' =
              lvl <= 1 ? 'preschool' : lvl <= 3 ? 'primary' : 'junior'
            studentMap.set(u.id, {
              id: u.id,
              nickname: u.nickname || u.name || `Học sinh ${idx + 1}`,
              level: lvl,
              xp: u.xp || 0,
              completedQuests: u.completedQuests || 0,
              currentQuest: `Trạm ${(u.completedQuests || 0) + 1}`,
              currentPhase: 'explore',
              lastActiveAt: u.createdAt || new Date().toISOString(),
              needsSupport: false,
              supportReason: null,
              ageGroup,
              hasSafetyBadge: (u.completedQuests || 0) >= 1,
            })
          }
        })
      }

      const finalList = Array.from(studentMap.values())
      setStudents(finalList)
    } catch {
      showToast('Không thể đồng bộ dữ liệu học sinh chính thức', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // ── Computed KPIs ──────────────────────────────────────────────────
  const totalOfficialStudents = students.length
  const goldRuleCompletedCount = useMemo(
    () => students.filter((s) => s.hasSafetyBadge || s.completedQuests >= 1).length,
    [students],
  )
  const activeLearnersCount = useMemo(
    () => students.filter((s) => !s.needsSupport).length,
    [students],
  )
  const stuckStudents = useMemo(
    () => students.filter((s) => s.needsSupport),
    [students],
  )

  // Cohort distribution
  const preschoolStudents = useMemo(
    () => students.filter((s) => s.ageGroup === 'preschool'),
    [students],
  )
  const primaryStudents = useMemo(
    () => students.filter((s) => s.ageGroup === 'primary'),
    [students],
  )
  const juniorStudents = useMemo(
    () => students.filter((s) => s.ageGroup === 'junior'),
    [students],
  )

  // ── Actions ────────────────────────────────────────────────────────
  const handleTogglePacing = () => {
    const nextMode = pacingMode === 'self_paced' ? 'scheduled' : 'self_paced'
    setPacingMode(nextMode)
    showToast(
      nextMode === 'self_paced'
        ? 'Đã chuyển sang: Tự do theo nhịp bé (Self-paced)'
        : 'Đã chuyển sang: Mở khóa tuần tự theo lịch trường (Scheduled)',
      'success',
    )
  }

  const handleToggleSafetyShield = () => {
    const next = !safetyShieldEnabled
    setSafetyShieldEnabled(next)
    showToast(
      next
        ? '🛡️ Đã KÍCH HOẠT khiên bảo vệ Safe AI Child-Safety Shield!'
        : '⚠️ Đã TẮT khiên bảo vệ AI Child-Safety Shield',
      next ? 'success' : 'info',
    )
  }

  const handleToggleIslandStatus = (id: number) => {
    setIslands((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.requiredSafetyGate) {
            showToast('Đảo 10 Quy Tắc Vàng là Cổng An Toàn bắt buộc, không thể khóa!', 'info')
            return item
          }
          const nextStatus = item.status === 'active' ? 'locked' : 'active'
          showToast(`Đã cập nhật trạng thái ${item.name} sang: ${nextStatus === 'active' ? 'Mở trạm' : 'Khóa trạm'}`, 'success')
          return { ...item, status: nextStatus }
        }
        return item
      }),
    )
  }

  const handleAssignCohortMentor = (cohort: string, teacherId: string) => {
    setCohortMentors((prev) => ({ ...prev, [cohort]: teacherId }))
    const teacher = teachers.find((t) => t.id === teacherId)
    showToast(
      `Đã phân công ${teacher ? teacher.nickname : 'giáo viên'} phụ trách khối này!`,
      'success',
    )
  }

  const handleSendCheerSticker = (student: OfficialStudent) => {
    showToast(`🌟 Đã gửi sticker 'Cố lên bé ơi!' và lời nhắn động viên tới ${student.nickname}!`, 'success')
  }

  const handleSaveStuckMentor = () => {
    if (!assignStuckMentorTarget) return
    const teacher = teachers.find((t) => t.id === selectedStuckMentorId)
    showToast(
      `Đã gán ${teacher ? teacher.nickname : 'Mentor'} đồng hành gỡ kẹt bài cho ${assignStuckMentorTarget.nickname}!`,
      'success',
    )
    setStudents((prev) =>
      prev.map((s) =>
        s.id === assignStuckMentorTarget.id
          ? { ...s, needsSupport: false, supportReason: null }
          : s,
      ),
    )
    setAssignStuckMentorTarget(null)
    setSelectedStuckMentorId('')
  }

  const handleApproveShowcase = (id: string) => {
    setShowcaseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item)),
    )
    showToast('Đã phê duyệt tác phẩm lên Bảng Vinh Danh cấp trường!', 'success')
  }

  const handleAwardStar = (id: string) => {
    setShowcaseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stars: item.stars + 1 } : item)),
    )
    showToast('⭐ Đã tặng thêm Sao Vinh Dự cho tác phẩm xuất sắc!', 'success')
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Banner Giới Thiệu Phân Hệ Chính Thức ────────────────────── */}
      <div className="rounded-3xl border border-sky-200/80 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-100/80 border border-sky-300/60 text-sky-800 text-[11px] font-black uppercase tracking-wider mb-1">
                <span>🌟 Chương Trình AIKids Chính Thức (Core Official Program)</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Quản Trị Lộ Trình Đào Tạo Chuẩn & Điều Hành Toàn Trường
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1 max-w-2xl leading-relaxed">
                Khung đào tạo AI chuẩn hóa 6 Vùng Đảo cho 100% học sinh chính quy. Kiểm soát điều phối mở trạm, phân bổ giáo viên đồng hành và giám sát radar can thiệp sư phạm kịp thời.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              aria-label="Làm mới"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── A. Thanh KPI Quản Trị Hệ Thống ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Sĩ số chính quy */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-sky-500 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Học sinh chính quy</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{totalOfficialStudents}</span>
              <span className="text-xs font-semibold text-slate-600">bạn</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Hoàn thành 10 Quy Tắc Vàng */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-purple-500 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đạt 10 Quy Tắc Vàng</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {totalOfficialStudents > 0
                  ? Math.round((goldRuleCompletedCount / totalOfficialStudents) * 100)
                  : 100}%
              </span>
              <span className="text-xs font-semibold text-slate-600">
                ({goldRuleCompletedCount}/{totalOfficialStudents})
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Học sinh tích cực */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-emerald-500 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang tích cực học tập</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{activeLearnersCount}</span>
              <span className="text-xs font-semibold text-slate-600">bạn</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Kẹt bài cần hỗ trợ */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm',
              stuckStudents.length > 0 ? 'bg-rose-500' : 'bg-slate-400',
            )}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cần hỗ trợ sư phạm</p>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-2xl font-black',
                  stuckStudents.length > 0 ? 'text-rose-600' : 'text-slate-900',
                )}
              >
                {stuckStudents.length}
              </span>
              <span className="text-xs font-semibold text-slate-600">bé kẹt bài</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── B. Phân Khu 1: Quản Trị 6 Vùng Đảo & Điều Phối Mở Trạm ──── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-600">
              <Compass className="w-4 h-4" />
              <span>Phân Khu 1: Unlock & Pacing Governance</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              🗺️ Quản Trị 6 Vùng Đảo & Điều Phối Mở Trạm Toàn Trường
            </h3>
          </div>

          {/* Các nút điều phối cấp trường */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle nhịp học */}
            <button
              type="button"
              onClick={handleTogglePacing}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs',
                pacingMode === 'self_paced'
                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-300',
              )}
            >
              <span>{pacingMode === 'self_paced' ? '⚡ Tự do theo nhịp bé (Self-paced)' : '📅 Mở tuần tự theo lịch trường'}</span>
            </button>

            {/* Toggle Child Safety Shield */}
            <button
              type="button"
              onClick={handleToggleSafetyShield}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs',
                safetyShieldEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300',
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{safetyShieldEnabled ? '🛡️ AI Child-Safety Shield: BẬT' : '⚠️ AI Safety Shield: TẮT'}</span>
            </button>
          </div>
        </div>

        {/* Lưới 6 Vùng Đảo Chuẩn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {islands.map((island) => {
            const isUnlocked = island.status === 'active'

            return (
              <div
                key={island.id}
                className={cn(
                  'p-4 rounded-2xl border transition-all relative flex flex-col justify-between',
                  isUnlocked
                    ? 'border-slate-200/90 bg-white hover:border-brand-400 hover:shadow-md'
                    : 'border-slate-200/60 bg-slate-50/60 opacity-80',
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{island.icon}</span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          {island.code}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm leading-tight">
                          {island.name}
                        </h4>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                        isUnlocked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600',
                      )}
                    >
                      {isUnlocked ? 'Đang mở' : 'Khóa trạm'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-brand-600">{island.subtitle}</p>
                  <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">{island.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {island.targetCohort}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleIslandStatus(island.id)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer',
                      isUnlocked
                        ? 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                        : 'bg-brand-500 hover:bg-brand-600 text-white',
                    )}
                  >
                    {isUnlocked ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Khóa trạm</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" />
                        <span>Mở khóa</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── C. Phân Khu 2: Phân Bổ Khối Tuổi & Đồng Hành Sư Phạm ──── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-600">
              <Users className="w-4 h-4" />
              <span>Phân Khu 2: Age Cohorts & Mentors</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              👥 Phân Bổ Khối Tuổi & Phân Công Mentor Đồng Hành
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Giáo viên thực tế sẵn sàng: <strong className="text-slate-900">{teachers.length} người</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Khối Mầm Non */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐥</span>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Khối Mầm Non (4-6 tuổi)</h4>
                    <p className="text-[11px] text-amber-700 font-medium">Khám phá trực quan & làm quen AIKI</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">{preschoolStudents.length}</span>
                <span className="text-xs font-semibold text-slate-600">học sinh đang theo học</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tập trung tương tác giọng nói, thị giác và hình thành phản xạ số văn minh.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Mentor đồng hành phụ trách khối:
              </label>
              <select
                value={cohortMentors.preschool}
                onChange={(e) => handleAssignCohortMentor('preschool', e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">-- Chọn Mentor đồng hành --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nickname} ({t.role})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setSelectedCohortModal('preschool')}
                className="w-full py-1.5 text-xs font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200/70 rounded-xl transition-colors cursor-pointer text-center"
              >
                Xem danh sách ({preschoolStudents.length} bạn)
              </button>
            </div>
          </div>

          {/* Khối Tiểu Học */}
          <div className="rounded-2xl border border-sky-200/80 bg-sky-50/30 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Khối Tiểu Học (7-9 tuổi)</h4>
                    <p className="text-[11px] text-sky-700 font-medium">10 Quy Tắc Vàng, tư duy logic & đố vui</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">{primaryStudents.length}</span>
                <span className="text-xs font-semibold text-slate-600">học sinh đang theo học</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Làm chủ quy chuẩn an toàn AI, tham gia xưởng vẽ và đấu trường mini-game.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Mentor đồng hành phụ trách khối:
              </label>
              <select
                value={cohortMentors.primary}
                onChange={(e) => handleAssignCohortMentor('primary', e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">-- Chọn Mentor đồng hành --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nickname} ({t.role})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setSelectedCohortModal('primary')}
                className="w-full py-1.5 text-xs font-bold text-sky-800 bg-sky-100/70 hover:bg-sky-200/70 rounded-xl transition-colors cursor-pointer text-center"
              >
                Xem danh sách ({primaryStudents.length} bạn)
              </button>
            </div>
          </div>

          {/* Khối Thiếu Nhi */}
          <div className="rounded-2xl border border-purple-200/80 bg-purple-50/30 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Khối Thiếu Nhi (10-12 tuổi)</h4>
                    <p className="text-[11px] text-purple-700 font-medium">Sáng tạo Prompts, Comic & Game</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">{juniorStudents.length}</span>
                <span className="text-xs font-semibold text-slate-600">học sinh đang theo học</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Lập trình trợ lý AI, tạo hoạt hình số và chuẩn bị đề tài Đảo Vũ Trụ Tốt Nghiệp.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Mentor đồng hành phụ trách khối:
              </label>
              <select
                value={cohortMentors.junior}
                onChange={(e) => handleAssignCohortMentor('junior', e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">-- Chọn Mentor đồng hành --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nickname} ({t.role})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setSelectedCohortModal('junior')}
                className="w-full py-1.5 text-xs font-bold text-purple-800 bg-purple-100/70 hover:bg-purple-200/70 rounded-xl transition-colors cursor-pointer text-center"
              >
                Xem danh sách ({juniorStudents.length} bạn)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── D. Phân Khu 3: Radar Kẹt Bài & Hỗ Trợ Sư Phạm Toàn Trường ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Phân Khu 3: School Stuck Radar & Interventions</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              🚨 Radar Kẹt Bài & Can Thiệp Sư Phạm Toàn Trường
            </h3>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            {stuckStudents.length} trường hợp cần can thiệp
          </span>
        </div>

        {stuckStudents.length === 0 ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">
              Tuyệt vời! 100% học sinh đang duy trì nhịp học thuận lợi
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Không có học sinh nào bị kẹt bài quá 48 giờ. Toàn bộ tiến độ các trạm đang diễn ra suôn sẻ.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stuckStudents.map((student) => (
              <div
                key={student.id}
                className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 font-black flex items-center justify-center text-sm shadow-2xs">
                    {student.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{student.nickname}</span>
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        Lv{student.level}
                      </span>
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                        {student.currentQuest || 'Trạm chưa rõ'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lý do: <strong className="text-slate-700 font-medium">{student.supportReason || 'Gặp trở ngại khi thực hành trạm'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleSendCheerSticker(student)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gửi sticker động viên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAssignStuckMentorTarget(student)
                      setSelectedStuckMentorId(teachers[0]?.id || '')
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Gán Mentor hỗ trợ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── E. Phân Khu 4: Bảng Vinh Danh & Triển Lãm Cấp Trường ───── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600">
              <Award className="w-4 h-4" />
              <span>Phân Khu 4: School Showcase & Hall of Fame</span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              🏆 Bảng Vinh Danh & Triển Lãm Tác Phẩm Cấp Trường
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Duyệt các tác phẩm xuất sắc để vinh danh trang chủ AIKids
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {showcaseItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-brand-600 uppercase">
                    {item.category === 'art' ? '🎨 Tranh AI' : item.category === 'comic' ? '🎬 Truyện AI' : '🎮 Game AI'}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                      item.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200',
                    )}
                  >
                    {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tác giả: <strong className="text-slate-700">{item.authorName}</strong> ({item.authorAge} tuổi)
                </p>

                <div className="flex items-center gap-1 mt-2 text-amber-500">
                  {Array.from({ length: Math.max(1, item.stars) }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1">({item.stars} ⭐)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.status === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => handleApproveShowcase(item.id)}
                    className="w-full py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Duyệt Showcase
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAwardStar(item.id)}
                    className="w-full py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Star className="w-3 h-3 fill-white" />
                    <span>Tặng sao vinh dự</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL: Danh Sách Học Sinh Khối Tuổi ───────────────────── */}
      {selectedCohortModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedCohortModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
                  Phân Hệ Chương Trình Chính Thức
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Danh Sách Học Sinh - Khối {selectedCohortModal === 'preschool' ? 'Mầm Non (4-6)' : selectedCohortModal === 'primary' ? 'Tiểu Học (7-9)' : 'Thiếu Nhi (10-12)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCohortModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
              {(selectedCohortModal === 'preschool'
                ? preschoolStudents
                : selectedCohortModal === 'primary'
                  ? primaryStudents
                  : juniorStudents
              ).map((student) => (
                <div key={student.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {student.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{student.nickname}</p>
                      <p className="text-[11px] text-slate-500">
                        {student.currentQuest} · {student.xp} XP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.hasSafetyBadge && (
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        🛡️ Đạt 10 Quy Tắc Vàng
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">Lv{student.level}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCohortModal(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Gán Mentor Gỡ Kẹt Bài ─────────────────────────── */}
      {assignStuckMentorTarget && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setAssignStuckMentorTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                  Can Thiệp Sư Phạm Kịp Thời
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Gán Mentor Hỗ Trợ Gỡ Kẹt Bài
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignStuckMentorTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                <p className="text-xs text-slate-500 font-medium">Học sinh kẹt bài:</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{assignStuckMentorTarget.nickname}</p>
                <p className="text-xs text-rose-600 mt-0.5">
                  Vấn đề: {assignStuckMentorTarget.supportReason || 'Đang kẹt trạm'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn Giáo Viên / Mentor can thiệp:
                </label>
                <select
                  value={selectedStuckMentorId}
                  onChange={(e) => setSelectedStuckMentorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nickname} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignStuckMentorTarget(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveStuckMentor}
                  className="px-4 py-1.5 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Xác nhận gán Mentor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
