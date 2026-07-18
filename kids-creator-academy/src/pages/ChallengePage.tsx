import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { MissionBanner } from '@/components/ui/MissionBanner'
import { CheerOverlay, useCheer } from '@/components/game/CheerBurst'
import { CHALLENGES } from '@/data/challenges'
import { resolveChallengeExit } from '@/lib/flow'
import { useDemoStore } from '@/store/demo-store'

export function ChallengePage() {
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const challenge = CHALLENGES.find((c) => c.id === challengeId)
  const passChallenge = useDemoStore((s) => s.passChallenge)
  const addStars = useDemoStore((s) => s.addStars)
  const completeQuest = useDemoStore((s) => s.completeQuest)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const addToast = useDemoStore((s) => s.addToast)
  const { cheer, fire } = useCheer()

  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [advancing, setAdvancing] = useState(false)

  const total = challenge?.questions.length ?? 0
  const done = !!challenge && qi >= total
  const q = !done && challenge ? challenge.questions[qi] : undefined

  if (!challenge) {
    return (
      <Card>
        <p className="font-bold">Không tìm thấy thử thách.</p>
        <Button className="mt-3" onClick={() => navigate('/world')}>
          Về bản đồ
        </Button>
      </Card>
    )
  }

  const finishChallenge = () => {
    const exit = resolveChallengeExit(challenge.id)
    passChallenge(challenge.id)
    addStars(challenge.starsReward)
    for (const id of exit.completeQuestIds) {
      completeQuest(id)
    }
    if (exit.nextQuestId) setCurrentQuest(exit.nextQuestId)
    addToast({
      type: 'success',
      title: 'Vượt ải xong!',
      description: 'Tiếp theo: nhiệm vụ mới.',
    })
    navigate(exit.nextPath)
  }

  if (done) {
    const exit = resolveChallengeExit(challenge.id)
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <CheerOverlay message={cheer} />
        <p className="text-5xl" aria-hidden>
          🏆
        </p>
        <h1 className="font-display text-3xl text-brand-600">Vượt ải thành công!</h1>
        <p className="font-semibold text-muted">
          Đúng {score}/{total} câu · +{challenge.starsReward} sao
        </p>
        <Button size="lg" fullWidth onClick={finishChallenge}>
          {exit.nextPath.includes('comic')
            ? 'Làm truyện 4 khung'
            : exit.nextPath.includes('quest')
              ? 'Nhiệm vụ tiếp theo'
              : 'Tiếp tục'}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <CheerOverlay message={cheer} />
      <MissionBanner
        stepLabel={`Thử thách · Câu ${qi + 1}/${total}`}
        doing={challenge.title}
        why={challenge.intro}
        reward={`+${challenge.starsReward} sao khi xong`}
      />
      <Card className="space-y-4">
        <h1 className="font-display text-xl sm:text-2xl">{q!.prompt}</h1>
        <div className="grid gap-2">
          {q!.options.map((opt) => (
            <ChoiceCard
              key={opt.id}
              selected={picked === opt.id}
              onClick={() => {
                if (feedback || advancing) return
                setPicked(opt.id)
              }}
            >
              <span className="font-bold">{opt.label}</span>
            </ChoiceCard>
          ))}
        </div>
        {feedback ? (
          <p
            className={`rounded-2xl px-3 py-2 text-sm font-bold ${
              feedback.startsWith('Đúng')
                ? 'bg-mint-100 text-success'
                : 'bg-sun-100 text-text'
            }`}
            role="status"
          >
            {feedback}
          </p>
        ) : null}
        <Button
          size="lg"
          fullWidth
          disabled={!picked || advancing}
          onClick={() => {
            if (!picked || !q || advancing) return
            const opt = q.options.find((o) => o.id === picked)!
            setAdvancing(true)
            if (opt.correct) {
              setScore((s) => s + 1)
              setFeedback(`Đúng! ${q.explain}`)
              fire('Giỏi quá!')
              addStars(5)
            } else {
              setFeedback(`Thử cách khác nhé. ${q.explain}`)
              addToast({
                type: 'info',
                title: 'Chưa đúng — không sao!',
                description: 'Con vẫn được học và tiếp tục.',
              })
            }
            window.setTimeout(() => {
              setFeedback(null)
              setPicked(null)
              setAdvancing(false)
              setQi((i) => i + 1)
            }, 1400)
          }}
        >
          Kiểm tra đáp án
        </Button>
      </Card>
      <Button
        variant="ghost"
        fullWidth
        onClick={() => {
          // Skip quiz but still advance correctly (no loop)
          finishChallenge()
        }}
      >
        Bỏ qua thử thách · tiếp tục
      </Button>
    </div>
  )
}
