import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/Progress'
import { AVATARS } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'

export function ProfilePage() {
  const navigate = useNavigate()
  const child = useDemoStore((s) => s.child)
  const badges = useDemoStore((s) => s.badges)
  const skills = useDemoStore((s) => s.skills)
  const completed = useDemoStore((s) => s.completedQuestIds)
  const setRole = useDemoStore((s) => s.setRole)
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const demoErrorMode = useDemoStore((s) => s.demoErrorMode)
  const setDemoErrorMode = useDemoStore((s) => s.setDemoErrorMode)
  const addToast = useDemoStore((s) => s.addToast)

  const avatar = AVATARS.find((a) => a.id === child.avatarId) ?? AVATARS[0]

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <img src={avatar.src} alt="" className="size-24 rounded-[1.5rem] shadow-soft" />
        <div className="text-center sm:text-left">
          <h1 className="font-display text-3xl font-semibold">{child.nickname}</h1>
          <p className="text-muted">
            Cấp {child.level} · {child.xp} XP · {child.currentCourse}
          </p>
          <ProgressBar
            className="mt-3 max-w-sm"
            value={(completed.length / 8) * 100}
            label={`Nhiệm vụ ${completed.length}/8`}
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-semibold">Huy hiệu</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => (
            <li
              key={b}
              className="rounded-full bg-sun-100 px-3 py-1.5 text-sm font-bold text-text"
            >
              {b}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-semibold">Kỹ năng (mock mastery)</h2>
        <ul className="mt-3 space-y-3">
          {skills.map((s) => (
            <li key={s.skillId}>
              <div className="mb-1 flex justify-between text-sm font-bold">
                <span>{s.label}</span>
                <span className="text-muted">Lv {s.level}</span>
              </div>
              <ProgressBar value={s.confidence * 100} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-dashed">
        <h2 className="font-display text-lg font-semibold text-muted">Demo controls (ẩn với trẻ)</h2>
        <p className="mt-1 text-sm text-muted">Chỉ dùng khi trình bày prototype.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setRole('parent')
              navigate('/parent/overview')
            }}
          >
            Vai phụ huynh
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setRole('teacher')
              navigate('/teacher/overview')
            }}
          >
            Vai giáo viên
          </Button>
          <Button
            size="sm"
            variant={demoErrorMode ? 'danger' : 'soft'}
            onClick={() => {
              setDemoErrorMode(!demoErrorMode)
              addToast({
                type: 'info',
                title: !demoErrorMode ? 'Bật demo lỗi generation' : 'Tắt demo lỗi',
              })
            }}
          >
            Demo lỗi AI: {demoErrorMode ? 'ON' : 'OFF'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              resetDemo()
              navigate('/welcome')
            }}
          >
            Reset demo
          </Button>
        </div>
      </Card>
    </div>
  )
}
