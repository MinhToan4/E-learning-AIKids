import { Link } from 'react-router'
import { useAuth } from '@/shared/store/auth'

function homeFor(role: 'student' | 'parent' | 'teacher' | 'admin') {
  if (role === 'admin') return '/admin'
  if (role === 'teacher') return '/teacher'
  if (role === 'parent') return '/kids'
  return '/home'
}

export function NotFoundPage() {
  const user = useAuth((state) => state.user)
  const destination = user ? homeFor(user.role) : '/login'

  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-4 py-10">
      <section className="ui-card w-full max-w-lg p-7 text-center" role="alert">
        <p className="text-sm font-black uppercase tracking-wider text-brand-500">404</p>
        <h1 className="font-display mt-2 text-3xl text-ink">Không tìm thấy trang này</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Đường dẫn có thể đã thay đổi hoặc chưa tồn tại. Phiên đăng nhập của bạn vẫn được giữ nguyên.
        </p>
        <Link className="ui-btn ui-btn-primary mt-5" to={destination} replace>
          {user ? 'Về khu vực của tôi' : 'Về trang đăng nhập'}
        </Link>
      </section>
    </main>
  )
}
