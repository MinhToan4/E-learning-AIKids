import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Volume2, ArrowRight, BookOpen, ShieldCheck, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { QUESTS } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'

const stages = ['intro', 'learn', 'build'] as const

export function QuestCharacterPage() {
  const navigate = useNavigate()
  const quest = QUESTS.find((q) => q.id === 'character')!
  const completeQuest = useDemoStore((s) => s.completeQuest)
  const [stage, setStage] = useState<(typeof stages)[number]>('intro')
  const [species, setSpecies] = useState('Mèo')
  const [outfit, setOutfit] = useState('Mũ phi hành gia')
  const [trait, setTrait] = useState('Tò mò')
  const [openCard, setOpenCard] = useState<string | null>(null)

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'vi-VN'
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-500">Nhiệm vụ {quest.order}/8</p>
          <h1 className="font-display text-3xl font-semibold">{quest.title}</h1>
        </div>
        <Button variant="soft" size="sm" onClick={() => speak(quest.hook)}>
          <Volume2 className="size-4" aria-hidden />
          Nghe hướng dẫn
        </Button>
      </div>

      {stage === 'intro' && (
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-r from-sky-100 to-brand-50 p-6 md:p-8">
            <p className="text-lg font-semibold text-text">{quest.hook}</p>
            <p className="mt-2 text-muted">{quest.duration} · Không áp lực thời gian</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {quest.goals.map((g) => (
                <li
                  key={g}
                  className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold shadow-soft"
                >
                  {g}
                </li>
              ))}
            </ul>
            <Button className="mt-6" size="lg" onClick={() => setStage('learn')}>
              Bắt đầu
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          </div>
        </Card>
      )}

      {stage === 'learn' && (
        <div className="space-y-4">
          <p className="text-muted">Tối đa 3 thẻ kiến thức — chạm để mở mẹo.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {quest.learnCards.map((card) => {
              const Icon =
                card.kind === 'concept'
                  ? BookOpen
                  : card.kind === 'safety'
                    ? ShieldCheck
                    : Lightbulb
              const open = openCard === card.id
              return (
                <ChoiceCard
                  key={card.id}
                  selected={open}
                  onClick={() => setOpenCard(open ? null : card.id)}
                  className="min-h-[180px]"
                >
                  <Icon className="mb-2 size-6 text-brand-500" aria-hidden />
                  <p className="font-display text-lg font-semibold">{card.title}</p>
                  <p className="mt-2 text-sm text-muted">{card.body}</p>
                  {open ? (
                    <p className="mt-3 rounded-xl bg-sun-100 px-3 py-2 text-sm font-semibold">
                      Mẹo: {card.tip}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs font-bold text-brand-500">Chạm để xem mẹo</p>
                  )}
                </ChoiceCard>
              )
            })}
          </div>
          <Button size="lg" onClick={() => setStage('build')}>
            Thực hành tạo nhân vật
          </Button>
        </div>
      )}

      {stage === 'build' && (
        <div className="space-y-5">
          <Card>
            <h2 className="font-display text-xl font-semibold">Chọn loài vật</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['Mèo', 'Cáo', 'Robot', 'Rồng'].map((s) => (
                <ChoiceCard key={s} selected={species === s} onClick={() => setSpecies(s)}>
                  <span className="font-bold">{s}</span>
                </ChoiceCard>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-xl font-semibold">Chọn trang phục</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['Mũ phi hành gia', 'Áo kỹ sư', 'Khăn choàng', 'Kính bảo hộ'].map((s) => (
                <ChoiceCard key={s} selected={outfit === s} onClick={() => setOutfit(s)}>
                  <span className="font-bold">{s}</span>
                </ChoiceCard>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-xl font-semibold">Chọn tính cách</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['Tò mò', 'Dũng cảm', 'Vui vẻ', 'Bình tĩnh'].map((s) => (
                <ChoiceCard key={s} selected={trait === s} onClick={() => setTrait(s)}>
                  <span className="font-bold">{s}</span>
                </ChoiceCard>
              ))}
            </div>
          </Card>
          <Card className="bg-brand-50">
            <p className="text-sm font-bold text-brand-600">Nhân vật của con</p>
            <p className="mt-1 text-lg font-semibold">
              {species} · {outfit} · {trait}
            </p>
            <p className="mt-2 text-sm text-muted">
              Tiếp theo: ghép prompt 5 thẻ để AI vẽ 3 phiên bản an toàn.
            </p>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                completeQuest('character', 100)
                navigate('/studio/prompt')
              }}
            >
              Ghép prompt & tạo ảnh
            </Button>
            <Button as-child={undefined} variant="secondary" onClick={() => navigate('/world')}>
              Về bản đồ
            </Button>
          </div>
          <p className="text-sm text-muted">
            Xem thêm:{' '}
            <Link className="font-semibold text-brand-600 underline" to="/quest/character/learn">
              Thẻ học nhanh
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export function QuestLearnPage() {
  const quest = QUESTS.find((q) => q.id === 'character')!
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-semibold">Học nhanh: {quest.title}</h1>
      {quest.learnCards.map((c) => (
        <Card key={c.id}>
          <h2 className="font-display text-xl font-semibold">{c.title}</h2>
          <p className="mt-2 text-muted">{c.body}</p>
          <p className="mt-3 rounded-xl bg-sun-100 px-3 py-2 text-sm font-semibold">
            {c.tip}
          </p>
        </Card>
      ))}
      <Button onClick={() => history.back()}>Quay lại nhiệm vụ</Button>
    </div>
  )
}

export function GenericQuestPageWrapper() {
  const { questId } = useParams()
  return <GenericQuestPage questId={questId ?? ''} />
}

export function GenericQuestPage({ questId }: { questId: string }) {
  const navigate = useNavigate()
  const quest = QUESTS.find((q) => q.id === questId)
  const completeQuest = useDemoStore((s) => s.completeQuest)
  if (!quest) {
    return (
      <Card>
        <p>Không tìm thấy nhiệm vụ.</p>
        <Button className="mt-3" onClick={() => navigate('/world')}>
          Về bản đồ
        </Button>
      </Card>
    )
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-semibold">{quest.title}</h1>
      <Card className="bg-gradient-to-br from-brand-50 to-sky-100">
        <p className="text-lg font-semibold">{quest.hook}</p>
        <p className="mt-2 text-muted">{quest.duration}</p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
          {quest.goals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {quest.learnCards.map((c) => (
          <Card key={c.id}>
            <p className="font-bold">{c.title}</p>
            <p className="mt-1 text-sm text-muted">{c.body}</p>
          </Card>
        ))}
      </div>
      <Button
        size="lg"
        onClick={() => {
          completeQuest(quest.id)
          if (quest.id === 'comic') navigate('/studio/comic')
          else if (quest.id === 'cinema') navigate('/studio/video')
          else if (quest.id === 'prompt-lab' || quest.id === 'detective')
            navigate('/studio/prompt')
          else navigate('/world')
        }}
      >
        Hoàn thành & nhận {quest.reward}
      </Button>
    </div>
  )
}
