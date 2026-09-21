import { lazy, Suspense, useMemo } from 'react'
import { Link } from 'react-router'
import { CmsErrorBoundary } from '@/shared/components/CmsErrorBoundary'
import { api } from '@/shared/lib/api'
import {
  DEFAULT_CATALOG_PLANS,
  getCachedBillingPlans,
  normalizePlanDef,
  groupUsersByFamilyList,
  emptyRouting,
  ROLE_LABELS,
  type AdminTab,
  type AdminUser,
  type DisplayAdminUser,
  type PlanDef,
  type BillingStats,
  type SubscriptionRow,
  type PendingIntent,
  type SystemInfo,
  type Analytics,
  type CourseOverview,
  type CourseReadiness,
  type LoginLogItem,
  type LoginLogSummary,
  type ModelRow,
  type RoutingState,
  type AffiliateRow,
  type AffiliateCommissionRow,
  type AffiliateStats,
} from '../types'

// Re-export shared types for backward compatibility across the app
export {
  DEFAULT_CATALOG_PLANS,
  getCachedBillingPlans,
  normalizePlanDef,
  groupUsersByFamilyList,
  emptyRouting,
  ROLE_LABELS,
}
export type {
  AdminTab,
  AdminUser,
  DisplayAdminUser,
  PlanDef,
  BillingStats,
  SubscriptionRow,
  PendingIntent,
  SystemInfo,
  Analytics,
  CourseOverview,
  CourseReadiness,
  LoginLogItem,
  LoginLogSummary,
  ModelRow,
  RoutingState,
  AffiliateRow,
  AffiliateCommissionRow,
  AffiliateStats,
}

// Lazy-loaded tab components for optimal code splitting & speed
const AdminSystemTab = lazy(() =>
  import('../components/tabs/AdminSystemTab').then((m) => ({ default: m.AdminSystemTab })),
)
const AdminAnalyticsTab = lazy(() =>
  import('../components/tabs/AdminAnalyticsTab').then((m) => ({ default: m.AdminAnalyticsTab })),
)
const AdminLogsTab = lazy(() =>
  import('../components/tabs/AdminLogsTab').then((m) => ({ default: m.AdminLogsTab })),
)
const AdminUsersTab = lazy(() =>
  import('../components/tabs/AdminUsersTab').then((m) => ({ default: m.AdminUsersTab })),
)
const AdminStaffTab = lazy(() =>
  import('../components/tabs/AdminStaffTab').then((m) => ({ default: m.AdminStaffTab })),
)
const AdminRolesTab = lazy(() =>
  import('../components/tabs/AdminRolesTab').then((m) => ({ default: m.AdminRolesTab })),
)
const AdminCoursesTab = lazy(() =>
  import('../components/tabs/AdminCoursesTab').then((m) => ({ default: m.AdminCoursesTab })),
)
const AdminClassesTab = lazy(() =>
  import('../components/tabs/AdminClassesTab').then((m) => ({ default: m.AdminClassesTab })),
)
const AdminBillingTab = lazy(() =>
  import('../components/tabs/AdminBillingTab').then((m) => ({ default: m.AdminBillingTab })),
)
const AdminAffiliatesTab = lazy(() =>
  import('../components/tabs/AdminAffiliatesTab').then((m) => ({ default: m.AdminAffiliatesTab })),
)
const AiEngineStudio = lazy(() =>
  import('../components/AiEngineStudio').then((m) => ({ default: m.AiEngineStudio })),
)
const AsmoAdminStudio = lazy(() =>
  import('../components/AsmoAdminStudio').then((m) => ({ default: m.AsmoAdminStudio })),
)
const LegendRewardStudio = lazy(() =>
  import('../components/LegendRewardStudio').then((m) => ({ default: m.LegendRewardStudio })),
)

/**
 * Vidtory settings & model load-balancing routing configuration
 * Endpoint: /api/admin/settings/vidtory with method: 'PUT'
 */
export async function saveRouting(payload: {
  baseURL: string
  image: { aspectRatio: string; models: Array<{ modelId: string; weight: number }> }
  video: { aspectRatio: string; models: Array<{ modelId: string; weight: number }> }
}) {
  return api('/api/admin/settings/vidtory', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

function TabLoadingFallback({ label }: { label: string }) {
  return (
    <div
      className="ui-card p-8 min-h-[320px] flex flex-col justify-center gap-4 border-2 border-brand-100 shadow-clay"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <div className="ui-skeleton h-7 w-56 rounded-xl" />
      </div>
      <div className="ui-skeleton h-32 w-full rounded-2xl" />
      <p className="text-xs font-bold text-muted animate-pulse">Đang tải {label}…</p>
    </div>
  )
}

type TabMeta = {
  group: string
  title: string
  breadcrumb: string[]
  description: string
  badgeCls: string
}

const TAB_METADATA: Record<AdminTab, TabMeta> = {
  system: {
    group: '📊 VẬN HÀNH & GIÁM SÁT',
    title: 'Tổng quan hệ thống',
    breadcrumb: ['Quản trị', 'Vận hành & Giám sát', 'Tổng quan'],
    description: 'Giám sát microservices, hàng đợi NATS, chỉ số học tập và cảnh báo cần xử lý.',
    badgeCls: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  analytics: {
    group: '📊 VẬN HÀNH & GIÁM SÁT',
    title: 'Phân tích hoạt động',
    breadcrumb: ['Quản trị', 'Vận hành & Giám sát', 'Phân tích'],
    description: 'Số liệu học tập, tiến độ hoàn thành trạm, sản phẩm sáng tạo và biểu đồ nhịp 14 ngày.',
    badgeCls: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  logs: {
    group: '📊 VẬN HÀNH & GIÁM SÁT',
    title: 'Nhật ký đăng nhập',
    breadcrumb: ['Quản trị', 'Vận hành & Giám sát', 'Nhật ký đăng nhập'],
    description: 'Kiểm tra audit log, truy vết IP, bảo mật tài khoản và tự động dọn dẹp sau 24h.',
    badgeCls: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  users: {
    group: '👥 NGƯỜI DÙNG & PHÂN QUYỀN',
    title: 'Học sinh & Phụ huynh',
    breadcrumb: ['Quản trị', 'Người dùng & Phân quyền', 'Học sinh & Phụ huynh'],
    description: 'Cấu trúc cây gia đình (Phụ huynh - Con), liên kết tài khoản con, mã PIN học sinh và phân bổ quyền học tập.',
    badgeCls: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  staff: {
    group: '👥 NGƯỜI DÙNG & PHÂN QUYỀN',
    title: 'Cán bộ & Quản trị viên',
    breadcrumb: ['Quản trị', 'Người dùng & Phân quyền', 'Cán bộ & Quản trị'],
    description: 'Quản lý tài khoản quản trị hệ thống, trưởng ban chuyên môn, giáo viên và kiểm soát đặc quyền vận hành.',
    badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  roles: {
    group: '👥 NGƯỜI DÙNG & PHÂN QUYỀN',
    title: 'Quản lý Vai trò & Phân quyền (RBAC)',
    breadcrumb: ['Quản trị', 'Người dùng & Phân quyền', 'Vai trò & Quyền hạn'],
    description: 'Thiết lập ma trận quyền hạn cho từng vai trò, gán quyền quản trị và phân định ranh giới chức năng.',
    badgeCls: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  billing: {
    group: '💳 TÀI CHÍNH & KINH DOANH',
    title: 'Gói cước & POS Thu ngân',
    breadcrumb: ['Quản trị', 'Tài chính & Kinh doanh', 'Gói & Thanh toán'],
    description: 'Duyệt đơn chờ VietQR, POS thu tiền tại quầy, quản lý gói 129k và 5 gói nạp lượt AI.',
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  affiliates: {
    group: '💳 TÀI CHÍNH & KINH DOANH',
    title: 'Cộng Tác Viên & Đối Soát',
    breadcrumb: ['Quản trị', 'Tài chính & Kinh doanh', 'Cộng Tác Viên & Đối Soát'],
    description: 'Quản lý danh sách CTV, cấp mã ref, đối soát đơn hàng và duyệt chi trả hoa hồng.',
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  courses: {
    group: '🎓 ĐÀO TẠO & KHÓA HỌC',
    title: 'Danh mục khóa học & Lộ trình',
    breadcrumb: ['Quản trị', 'Đào tạo & Khóa học', 'Khóa học AI Kids'],
    description: 'Kiểm tra tiêu chuẩn giáo trình, mở/ẩn chặng học và thiết lập học phí phân phối.',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  classes: {
    group: '🎓 ĐÀO TẠO & KHÓA HỌC',
    title: 'Quản lý Lớp học',
    breadcrumb: ['Quản trị', 'Đào tạo & Khóa học', 'Lớp học'],
    description: 'Quản lý danh sách lớp học, phân công giáo viên và theo dõi học sinh.',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  asmo: {
    group: '🎓 ĐÀO TẠO & KHÓA HỌC',
    title: 'Học & Thi Olympic ASMO 3D',
    breadcrumb: ['Quản trị', 'Đào tạo & Khóa học', 'Học & Thi ASMO'],
    description: 'Quản lý kỳ thi ASMO toán học, khoa học không gian và đấu trường trực tuyến.',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  ai: {
    group: '🤖 CÔNG NGHỆ & AI STUDIO',
    title: 'Trung tâm Điều phối Mô hình AI',
    breadcrumb: ['Quản trị', 'Công nghệ & AI Studio', 'Điều phối AI'],
    description: 'Cấu hình định tuyến nhà cung cấp, trọng số tải đa mô hình và safety guardrails.',
    badgeCls: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  legends: {
    group: '🤖 CÔNG NGHỆ & AI STUDIO',
    title: 'Legend & Reward Studio',
    breadcrumb: ['Quản trị', 'Công nghệ & AI Studio', 'Huyền thoại & Reward'],
    description: 'Biên soạn linh vật huyền thoại, kho huy hiệu phần thưởng và sticker sự kiện.',
    badgeCls: 'bg-violet-50 text-violet-700 border-violet-200',
  },
}

export function AdminPage({ tab }: { tab: AdminTab }) {
  const meta = useMemo(() => TAB_METADATA[tab] ?? TAB_METADATA.system, [tab])

  const renderTabContent = () => {
    switch (tab) {
      case 'system':
        return (
          <CmsErrorBoundary name="Hệ thống">
            <Suspense fallback={<TabLoadingFallback label="Tổng quan hệ thống" />}>
              <AdminSystemTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'analytics':
        return (
          <CmsErrorBoundary name="Phân tích">
            <Suspense fallback={<TabLoadingFallback label="Phân tích hoạt động" />}>
              <AdminAnalyticsTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'logs':
        return (
          <CmsErrorBoundary name="Nhật ký">
            <Suspense fallback={<TabLoadingFallback label="Nhật ký đăng nhập" />}>
              <AdminLogsTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'users':
        return (
          <CmsErrorBoundary name="Học sinh & Phụ huynh">
            <Suspense fallback={<TabLoadingFallback label="Quản lý học sinh & phụ huynh" />}>
              <AdminUsersTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'staff':
        return (
          <CmsErrorBoundary name="Cán bộ & Quản trị">
            <Suspense fallback={<TabLoadingFallback label="Quản lý cán bộ & quản trị" />}>
              <AdminStaffTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'roles':
        return (
          <CmsErrorBoundary name="Vai trò & Phân quyền">
            <Suspense fallback={<TabLoadingFallback label="Vai trò & Phân quyền" />}>
              <AdminRolesTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'courses':
        return (
          <CmsErrorBoundary name="Khóa học">
            <Suspense fallback={<TabLoadingFallback label="Danh mục khóa học" />}>
              <AdminCoursesTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'classes':
        return (
          <CmsErrorBoundary name="Quản lý Lớp học">
            <Suspense fallback={<TabLoadingFallback label="Quản lý lớp học" />}>
              <AdminClassesTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'billing':
        return (
          <CmsErrorBoundary name="Gói & Thanh toán">
            <Suspense fallback={<TabLoadingFallback label="Gói & Thanh toán" />}>
              <AdminBillingTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'affiliates':
        return (
          <CmsErrorBoundary name="Cộng Tác Viên & Đối Soát">
            <Suspense fallback={<TabLoadingFallback label="Cộng Tác Viên & Đối Soát" />}>
              <AdminAffiliatesTab />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'ai':
        return (
          <CmsErrorBoundary name="Trung tâm AI">
            <Suspense fallback={<TabLoadingFallback label="Trung tâm AI & Điều phối" />}>
              <AiEngineStudio />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'asmo':
        return (
          <CmsErrorBoundary name="ASMO Studio">
            <Suspense fallback={<TabLoadingFallback label="ASMO Studio" />}>
              <AsmoAdminStudio />
            </Suspense>
          </CmsErrorBoundary>
        )

      case 'legends':
        return (
          <CmsErrorBoundary name="Legend Studio">
            <Suspense fallback={<TabLoadingFallback label="Legend & Reward Studio" />}>
              <LegendRewardStudio />
            </Suspense>
          </CmsErrorBoundary>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header: Breadcrumbs & Badge phân nhóm nghiệp vụ ── */}
      <header className="flex flex-col gap-2 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
            {meta.breadcrumb.map((crumb, idx) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {idx > 0 && <span className="text-border">/</span>}
                <span className={idx === meta.breadcrumb.length - 1 ? 'font-black text-text' : 'font-medium'}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          {/* Title & Description */}
          <div className="pt-1">
            <h1 className="font-display text-2xl font-black text-text tracking-tight">
              {meta.title}
            </h1>
            <p className="text-xs text-muted mt-0.5 max-w-2xl">{meta.description}</p>
          </div>
        </div>

        {/* Business Domain Group Badge */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-black shadow-sm ${meta.badgeCls}`}
          >
            {meta.group}
          </span>
          <Link
            to="/admin"
            className="hidden rounded-xl border border-border bg-page px-3 py-1.5 text-xs font-bold text-muted hover:bg-white hover:text-text sm:inline-block transition"
          >
            Về tổng quan
          </Link>
        </div>
      </header>

      {/* ── Tab Content ── */}
      <main className="min-w-0">{renderTabContent()}</main>
    </div>
  )
}
