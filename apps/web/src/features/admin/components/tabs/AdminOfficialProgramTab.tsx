import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Compass,
  RefreshCw,
} from 'lucide-react'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { AdminIslandsGovernanceView } from '../official/AdminIslandsGovernanceView'
import { AdminCohortsMentorsView } from '../official/AdminCohortsMentorsView'
import { AdminStuckRadarView } from '../official/AdminStuckRadarView'
import { AdminSchoolShowcaseView } from '../official/AdminSchoolShowcaseView'
import { CohortStudentsModal } from '../official/CohortStudentsModal'
import { AssignStuckMentorModal } from '../official/AssignStuckMentorModal'

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
        api<{ users?: any[] }>('/api/admin/users').catch(() => null),
        api<{ class: any; students: any[] }>('/api/teacher/class').catch(() => null),
        api<{ stats: any }>('/api/teacher/class/stats').catch(() => null),
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
            <Compass className="w-6 h-6" />
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
      <AdminIslandsGovernanceView
        islands={islands}
        pacingMode={pacingMode}
        safetyShieldEnabled={safetyShieldEnabled}
        onTogglePacing={handleTogglePacing}
        onToggleSafetyShield={handleToggleSafetyShield}
        onToggleIslandStatus={handleToggleIslandStatus}
      />

      {/* ── C. Phân Khu 2: Phân Bổ Khối Tuổi & Đồng Hành Sư Phạm ──── */}
      <AdminCohortsMentorsView
        teachers={teachers}
        preschoolStudents={preschoolStudents}
        primaryStudents={primaryStudents}
        juniorStudents={juniorStudents}
        cohortMentors={cohortMentors}
        onAssignCohortMentor={handleAssignCohortMentor}
        onOpenCohortModal={(cohort) => setSelectedCohortModal(cohort)}
      />

      {/* ── D. Phân Khu 3: Radar Kẹt Bài & Hỗ Trợ Sư Phạm Toàn Trường ── */}
      <AdminStuckRadarView
        stuckStudents={stuckStudents}
        onSendCheerSticker={handleSendCheerSticker}
        onOpenAssignMentorModal={(student) => {
          setAssignStuckMentorTarget(student)
          setSelectedStuckMentorId(teachers[0]?.id || '')
        }}
      />

      {/* ── E. Phân Khu 4: Bảng Vinh Danh & Triển Lãm Cấp Trường ───── */}
      <AdminSchoolShowcaseView
        showcaseItems={showcaseItems}
        onApproveShowcase={handleApproveShowcase}
        onAwardStar={handleAwardStar}
      />

      {/* ── MODALS ──────────────────────────────────────────────── */}
      {selectedCohortModal && (
        <CohortStudentsModal
          cohort={selectedCohortModal as 'preschool' | 'primary' | 'junior'}
          students={
            selectedCohortModal === 'preschool'
              ? preschoolStudents
              : selectedCohortModal === 'primary'
                ? primaryStudents
                : juniorStudents
          }
          onClose={() => setSelectedCohortModal(null)}
        />
      )}

      {assignStuckMentorTarget && (
        <AssignStuckMentorModal
          targetStudent={assignStuckMentorTarget}
          teachers={teachers}
          selectedMentorId={selectedStuckMentorId}
          onChangeSelectedMentorId={setSelectedStuckMentorId}
          onClose={() => setAssignStuckMentorTarget(null)}
          onSubmit={handleSaveStuckMentor}
        />
      )}
    </div>
  )
}
