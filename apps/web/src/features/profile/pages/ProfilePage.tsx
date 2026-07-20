import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/store/auth'

export function ProfilePage() {
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md">
      <div className="ui-card flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-5xl">
          {user?.avatarId === 'avatar-cat'
            ? '🐱'
            : user?.avatarId === 'avatar-dragon'
              ? '🐉'
              : user?.avatarId === 'avatar-star'
                ? '⭐'
                : '🤖'}
        </div>
        <h1 className="font-display text-3xl">{user?.nickname}</h1>
        <p className="text-muted">
          Cấp {user?.level} · {user?.xp} XP
        </p>
        <p className="text-sm text-muted">
          Mục tiêu: {user?.goal === 'video' ? 'Video' : user?.goal === 'character' ? 'Nhân vật' : 'Truyện tranh'}
        </p>
        <Button
          variant="secondary"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}
