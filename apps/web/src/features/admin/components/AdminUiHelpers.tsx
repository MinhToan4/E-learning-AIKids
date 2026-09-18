import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import type { AdminUser, Analytics } from '../types'

// ── Stat card ────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: number | string
  icon: ReactNode
  sub?: string
}) {
  return (
    <div className="ui-card flex flex-col gap-1 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="font-display text-3xl text-brand-600">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  )
}

// ── Mini bar chart (no deps) ─────────────────────────────────
export function MiniBar({
  value,
  max,
  color = 'bg-brand-500',
  label,
}: {
  value: number
  max: number
  color?: string
  label: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 truncate text-xs text-muted sm:w-28">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-extrabold">{value}</span>
    </div>
  )
}

// ── Trend chart ──────────────────────────────────────────────
export function TrendChart({ rows }: { rows: Analytics['trends'] }) {
  const width = 700
  const height = 230
  const padX = 38
  const padY = 24
  const max = Math.max(
    1,
    ...rows.flatMap((row) => [row.newUsers, row.completedQuests, row.projects]),
  )
  const x = (index: number) =>
    padX + (index * (width - padX * 2)) / Math.max(1, rows.length - 1)
  const y = (value: number) =>
    height - padY - (value * (height - padY * 2)) / max
  const points = (key: 'newUsers' | 'completedQuests' | 'projects') =>
    rows.map((row, index) => `${x(index)},${y(row[key])}`).join(' ')
  const series = [
    { key: 'completedQuests' as const, label: 'Bài hoàn thành', color: '#6d5efc' },
    { key: 'newUsers' as const, label: 'Tài khoản mới', color: '#37b9d5' },
    { key: 'projects' as const, label: 'Sản phẩm mới', color: '#39a77e' },
  ]

  return (
    <div className="ui-card p-5 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-muted">
            Nhịp hoạt động 14 ngày
          </p>
          <p className="mt-1 text-xs text-muted">
            Theo dõi học tập, tăng trưởng và sản phẩm trên cùng một trục thời gian.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-bold">
          {series.map((item) => (
            <span key={item.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-page p-6 text-center text-sm text-muted">
          Chưa có dữ liệu theo ngày.
        </p>
      ) : (
        <div className="mt-4 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Biểu đồ hoạt động hệ thống trong 14 ngày gần nhất"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const lineY = padY + ratio * (height - padY * 2)
              const value = Math.round(max * (1 - ratio))
              return (
                <g key={ratio}>
                  <line x1={padX} y1={lineY} x2={width - padX} y2={lineY} stroke="#e8e5f2" strokeWidth="1" />
                  <text x={padX - 8} y={lineY + 4} textAnchor="end" fontSize="10" fill="#726f80">{value}</text>
                </g>
              )
            })}
            {series.map((item) => (
              <polyline
                key={item.key}
                points={points(item.key)}
                fill="none"
                stroke={item.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {rows.map((row, index) =>
              series.map((item) => (
                <circle key={`${row.date}-${item.key}`} cx={x(index)} cy={y(row[item.key])} r="4" fill="white" stroke={item.color} strokeWidth="3">
                  <title>{`${row.date} · ${item.label}: ${row[item.key]}`}</title>
                </circle>
              )),
            )}
            {[...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])].map((index) => (
              <text key={index} x={x(index)} y={height - 3} textAnchor="middle" fontSize="10" fill="#726f80">
                {new Date(`${rows[index].date}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Outcome badge ────────────────────────────────────────────
export function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    success: { label: 'Thành công', cls: 'bg-mint-100 text-success' },
    failed: { label: 'Thất bại', cls: 'bg-coral-100 text-danger' },
    locked: { label: 'Bị khóa', cls: 'bg-sun-100 text-warning' },
  }
  const style = map[outcome] ?? { label: outcome, cls: 'bg-brand-100 text-brand-600' }
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold', style.cls)}>{style.label}</span>
  )
}

// ── User authentication badges ────────────────────────────────
export function UserAuthBadges({ user }: { user: AdminUser }) {
  const isStudent = user.role === 'student' || user.role === 'child' || Boolean(user.authProviders?.includes('pin'))
  const hasFirebase = Boolean(user.isFirebaseLinked || user.firebaseUid || user.authProviders?.includes('firebase'))
  const hasGoogle = Boolean(user.isGoogleLinked || user.googleSub || user.authProviders?.includes('google') || user.authProviders?.includes('google.com') || user.authProviders?.includes('firebase_google'))
  const hasLocal = !isStudent && Boolean(user.loginUsername || !hasFirebase)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {hasFirebase && (
        <span
          title={user.firebaseUid ? `Firebase UID: ${user.firebaseUid}` : 'Đã xác thực qua Firebase Auth'}
          className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700 shadow-sm"
        >
          <span>🟠</span> Firebase Auth
        </span>
      )}
      {hasGoogle && (
        <span
          title={user.googleSub ? `Google Sub: ${user.googleSub}` : 'Đăng nhập bằng Google'}
          className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 shadow-sm"
        >
          <span>🔵</span> Google
        </span>
      )}
      {hasLocal && (
        <span
          title={user.loginUsername ? `Tên đăng nhập alias: ${user.loginUsername}` : 'Tài khoản nội bộ'}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm"
        >
          <span>⚪</span> {user.loginUsername ? `Nội bộ (${user.loginUsername})` : 'Nội bộ'}
        </span>
      )}
      {isStudent && (
        <span
          title="Đăng nhập bằng mã PIN học sinh"
          className="inline-flex items-center gap-1 rounded-full border border-sun-200 bg-sun-100 px-2 py-0.5 text-xs font-bold text-sun-800 shadow-sm"
        >
          <span>🟡</span> {user.loginUsername ? `Mã PIN (${user.loginUsername})` : 'Mã PIN'}
        </span>
      )}
    </div>
  )
}
