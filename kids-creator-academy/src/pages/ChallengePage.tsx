import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { MissionBanner } from '@/components/ui/MissionBanner'
import { CheerOverlay, useCheer } from '@/components/game/CheerBurst'
import { CHALLENGES } from '@/data/challenges'
import { useDemoStore } from '@/store/demo-store'
import { questRoute } from '@/data/mock'
import { QUESTS } from '@/data/mock'

export function ChallengePage() {
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const challenge = CHALLENGES.find((c) => c.id === challengeId)
  const passChallenge = useDemoStore((s) => s.passChallenge)
  const addStars = useDemoStore((s) => s.addStars)
  const completeQuest = useDemoStore((s) => s.completeQuest)
  const addToast = useDemoStore((s) => s.addToast)
  const { cheer, fire } = useCheer()

  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const q = challenge?.questions[qi]
  const done = challenge ? qi >= challenge.questions.length : false

  const nextQuestId = useMemo(() => {
    if (!challenge) return null
    const idx = QUESTS.findIndex((x) => x.id === challenge.afterQuestId)
    return QUESTS[idx + 1]?.id ?? null
  }, [challenge])

  if (!challenge || !q && !done) {
    return (
      <Card>
        <p className="font-bold">Không tìm thấy thử thách.</p>
        <Button className="mt-3" onClick={() => navigate('/world')}>
          Về nhà
        </Button>
      </Card>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <CheerOverlay message={cheer} />
        <p className="text-5xl" aria-hidden>
          🏆
        </p>
        <h1 className="font-display text-3xl text-brand-600">Vượt ải thành công!</h1>
        <p className="font-semibold text-muted">
          Đúng {score}/{challenge.questions.length} câu · +{challenge.starsReward} sao
        </p>
        <Button
          size="lg"
          fullWidth
          onClick={() => {
            passChallenge(challenge.id)
            addStars(challenge.starsReward)
            if (nextQuestId) navigate(questRoute(nextQuestId))
            else navigate('/world')
          }}
        >
          Mở bước tiếp theo
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <CheerOverlay message={cheer} />
      <MissionBanner
        stepLabel={`Thử thách · Câu ${qi + 1}/${challenge.questions.length}`}
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
                if (feedback) return
                setPicked(opt.id)
              }}
            >
              <span className="font-extrabold">{opt.label}</span>
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
          disabled={!picked}
          onClick={() => {
            if (!picked || !q) return
            const opt = q.options.find((o) => o.id === picked)!
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
              setQi((i) => i + 1)
            }, 1600)
          }}
        >
          Kiểm tra đáp án
        </Button>
      </Card>
      <Button
        variant="ghost"
        fullWidth
        onClick={() => {
          // soft skip still completes afterQuest so path continues — optional for demo
          completeQuest(challenge.afterQuestId)
          passChallenge(challenge.id)
          navigate('/world')
        }}
      >
        Quay lại bản đồ (làm sau)
      </Button>
    </div>
  )
}
