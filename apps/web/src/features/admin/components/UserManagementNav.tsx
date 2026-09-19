import { Link } from 'react-router'
import { Users, ShieldCheck, KeyRound, History } from 'lucide-react'

interface UserManagementNavProps {
  activeTab: 'users' | 'staff' | 'roles' | 'logs'
}

export function UserManagementNav({ activeTab }: UserManagementNavProps) {
  const tabs = [
    {
      id: 'users',
      to: '/admin/users',
      title: 'Học sinh & Phụ huynh',
      icon: Users,
      subtitle: 'Cây gia đình, hồ sơ con & mã PIN',
    },
    {
      id: 'staff',
      to: '/admin/staff',
      title: 'Cán bộ & Quản trị',
      icon: ShieldCheck,
      subtitle: 'Quản trị viên, Ban chuyên môn & Giáo viên',
    },
    {
      id: 'roles',
      to: '/admin/roles',
      title: 'Vai trò & Phân quyền',
      icon: KeyRound,
      subtitle: 'Ma trận đặc quyền & hạn mức RBAC',
    },
    {
      id: 'logs',
      to: '/admin/logs',
      title: 'Nhật ký bảo mật',
      icon: History,
      subtitle: 'Lịch sử đăng nhập & audit log',
    },
  ] as const

  return (
    <nav className="ui-card grid grid-cols-1 gap-2 p-2.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Phân hệ Quản trị Người dùng & Phân quyền">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <Link
            key={tab.id}
            to={tab.to}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
              isActive
                ? 'border-brand-500 bg-brand-50 text-brand-950 shadow-xs'
                : 'border-transparent text-slate-700 hover:border-border hover:bg-slate-50'
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                isActive ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold tracking-tight">{tab.title}</div>
              <div
                className={`mt-0.5 text-xs line-clamp-1 ${
                  isActive ? 'font-medium text-brand-700' : 'text-muted'
                }`}
              >
                {tab.subtitle}
              </div>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
