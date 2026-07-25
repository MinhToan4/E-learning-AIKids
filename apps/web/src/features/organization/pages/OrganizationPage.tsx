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
          Vai tr├▓: {context.roles.join(', ')}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link className="ui-card p-5" to="/teacher">
          <h2 className="font-display text-lg">Lß╗¢p hß╗ìc</h2>
          <p className="mt-1 text-sm text-muted">Quß║ún l├╜ lß╗¢p v├á hß╗ìc sinh ─æ╞░ß╗úc ph├ón c├┤ng.</p>
        </Link>
        <Link className="ui-card p-5" to="/teacher/courses">
          <h2 className="font-display text-lg">Kh├│a hß╗ìc</h2>
          <p className="mt-1 text-sm text-muted">Nß╗Öi dung thuß╗Öc organization hiß╗çn tß║íi.</p>
        </Link>
        <Link className="ui-card p-5" to="/world">
          <h2 className="font-display text-lg">Hoß║ít ─æß╗Öng chung</h2>
          <p className="mt-1 text-sm text-muted">Game v├á hoß║ít ─æß╗Öng global d├╣ng chung B2C/B2B.</p>
        </Link>
      </div>
    </div>
  )
}
