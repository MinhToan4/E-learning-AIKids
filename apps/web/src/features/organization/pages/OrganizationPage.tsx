import { Link } from 'react-router-dom'
import { useAuth } from '@/shared/store/auth'

export function OrganizationPage() {
  const context = useAuth((state) => state.activeContext)
  if (!context || context.type !== 'organization') return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
          Organization workspace
        </p>
        <h1 className="font-display text-3xl">{context.label}</h1>
        <p className="mt-2 text-sm text-muted">
          Vai trò: {context.roles.join(', ')}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link className="ui-card p-5" to="/teacher">
          <h2 className="font-display text-lg">Lớp học</h2>
          <p className="mt-1 text-sm text-muted">Quản lý lớp và học sinh được phân công.</p>
        </Link>
        <Link className="ui-card p-5" to="/teacher/courses">
          <h2 className="font-display text-lg">Khóa học</h2>
          <p className="mt-1 text-sm text-muted">Nội dung thuộc organization hiện tại.</p>
        </Link>
        <Link className="ui-card p-5" to="/world">
          <h2 className="font-display text-lg">Hoạt động chung</h2>
          <p className="mt-1 text-sm text-muted">Game và hoạt động global dùng chung B2C/B2B.</p>
        </Link>
      </div>
    </div>
  )
}
