import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { MissionBanner } from '@/components/ui/MissionBanner'
import { QUESTS } from '@/data/mock'
import { findQuestAnywhere } from '@/data/courses'
import { useDemoStore } from '@/store/demo-store'

export function QuestCharacterPage() {
  const navigate = useNavigate()
  const quest = QUESTS.find((q) => q.id === 'character')!
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const addStars = useDemoStore((s) => s.addStars)
  const [stage, setStage] = useState<'intro' | 'pick' | 'done'>('intro')
  const [species, setSpecies] = useState('Mèo')
  const [outfit, setOutfit] = useState('Mũ phi hành gia')
  const [trait, setTrait] = useState('Tò mò')

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'vi-VN'
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 sm:max-w-2xl">
      <MissionBanner
        stepLabel={`Bước ${quest.order}/8`}
        doing="Tạo nhân vật cho truyện"
        why="Sau này AI vẽ đúng “bạn” của con"
        reward={quest.reward}
      />

      <div className="flex items-start justify-between gap-2">
        <h1 className="font-display text-2xl sm:text-3xl">{quest.title}</h1>
        <Button variant="soft" size="sm" onClick={() => speak(quest.hook)}>
          <Volume2 className="size-4" aria-hidden />
          Nghe
        </Button>
      </div>

      {stage === 'intro' && (
        <Card className="space-y-4 bg-gradient-to-br from-sky-100 to-brand-50">
          <p className="text-lg font-bold">{quest.hook}</p>
          <p className="text-sm font-semibold text-muted">
            Làm gì hôm nay? Chọn loài · trang phục · tính cách → rồi ghép thẻ vẽ ảnh.
          </p>
          <Button size="lg" fullWidth onClick={() => setStage('pick')}>
            Bắt đầu chọn
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </Card>
      )}

      {stage === 'pick' && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-display text-xl">1. Chọn loài</h2>
            <p className="text-sm font-semibold text-muted">Chạm 1 ô thôi.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {['Mèo', 'Cáo', 'Robot', 'Rồng'].map((s) => (
                <ChoiceCard key={s} selected={species === s} onClick={() => setSpecies(s)}>
                  <span className="font-extrabold">{s}</span>
                </ChoiceCard>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-xl">2. Chọn trang phục</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {['Mũ phi hành gia', 'Áo kỹ sư', 'Khăn choàng', 'Kính bảo hộ'].map((s) => (
                <ChoiceCard key={s} selected={outfit === s} onClick={() => setOutfit(s)}>
                  <span className="font-extrabold">{s}</span>
                </ChoiceCard>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-xl">3. Chọn tính cách</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {['Tò mò', 'Dũng cảm', 'Vui vẻ', 'Bình tĩnh'].map((s) => (
                <ChoiceCard key={s} selected={trait === s} onClick={() => setTrait(s)}>
                  <span className="font-extrabold">{s}</span>
                </ChoiceCard>
              ))}
            </div>
          </Card>

          <Card className="bg-brand-50">
            <p className="text-xs font-extrabold text-brand-600">Nhân vật của con</p>
            <p className="font-display text-xl">
              {species} · {outfit} · {trait}
            </p>
          </Card>

          <Button
            size="lg"
            fullWidth
            onClick={() => {
              // Practice only — quiz + completeQuest happen in /lesson shell
              useDemoStore.getState().markPracticeDone('character')
              addStars(5)
              setCurrentQuest('character')
              setStage('done')
            }}
          >
            Xong thực hành → Kiểm tra
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
      )}

      {stage === 'done' && (
        <Card className="space-y-4 text-center">
          <p className="font-display text-2xl text-success">Thực hành xong!</p>
          <p className="font-semibold text-muted">
            Nhân vật: {species} · {outfit} · {trait}. Tiếp theo: trắc nghiệm ngắn.
          </p>
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              useDemoStore.getState().markPracticeDone('character')
              navigate('/lesson/character?step=quiz')
            }}
          >
            Làm bài kiểm tra
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </Card>
      )}
    </div>
  )
}

export function QuestLearnPage() {
  const navigate = useNavigate()
  const quest = QUESTS.find((q) => q.id === 'character')!
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <MissionBanner
        doing="Xem nhanh 3 mẹo"
        why="Làm nhiệm vụ dễ hơn"
        reward="Hiểu cách tạo nhân vật"
      />
      <h1 className="font-display text-2xl">{quest.title}</h1>
      {quest.learnCards.map((c) => (
        <Card key={c.id}>
          <p className="font-display text-lg">{c.title}</p>
          <p className="mt-1 text-sm font-semibold text-muted">{c.body}</p>
          <p className="mt-2 rounded-xl bg-sun-100 px-3 py-2 text-sm font-bold">{c.tip}</p>
        </Card>
      ))}
      <Button onClick={() => navigate('/quest/character')}>Vào làm nhiệm vụ</Button>
    </div>
  )
}

export function GenericQuestPageWrapper() {
  const { questId } = useParams()
  return <GenericQuestPage questId={questId ?? ''} />
}

export function GenericQuestPage({ questId }: { questId: string }) {
  const navigate = useNavigate()
  const found = findQuestAnywhere(questId)
  const quest = found?.quest ?? QUESTS.find((q) => q.id === questId)
  const markPracticeDone = useDemoStore((s) => s.markPracticeDone)
  const addStars = useDemoStore((s) => s.addStars)

  if (!quest) {
    return (
      <Card>
        <p className="font-bold">Không tìm thấy nhiệm vụ.</p>
        <Button className="mt-3" onClick={() => navigate('/world')}>
          Về bản đồ
        </Button>
      </Card>
    )
  }

  const total = found?.course.quests.length ?? 8

  return (
    <div className="mx-auto max-w-xl space-y-4 sm:max-w-2xl">
      <MissionBanner
        stepLabel={`Thực hành ${quest.order}/${total}`}
        doing={quest.title}
        why={quest.skill}
        reward="Mở bài kiểm tra ngắn"
      />
      <p className="text-sm font-bold text-brand-500">
        Bước thực hành · Lý thuyết đã xem trong bài học
      </p>
      <h1 className="font-display text-2xl sm:text-3xl">{quest.title}</h1>
      <Card className="bg-gradient-to-br from-brand-50 to-sky-100">
        <p className="text-lg font-bold">{quest.hook}</p>
        <p className="mt-2 text-sm font-semibold text-muted">{quest.duration}</p>
        <ul className="mt-3 space-y-1 text-sm font-semibold">
          {quest.goals.map((g) => (
            <li key={g}>• {g}</li>
          ))}
        </ul>
      </Card>
      <Card className="space-y-3 p-4">
        <p className="font-display text-lg">Việc cần làm</p>
        <p className="text-sm font-semibold text-muted">
          Đọc mục tiêu, làm theo gợi ý, rồi bấm hoàn thành thực hành để vào trắc nghiệm.
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm font-semibold">
          {quest.goals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ol>
      </Card>
      <Button
        size="lg"
        fullWidth
        className="min-h-14"
        onClick={() => {
          markPracticeDone(quest.id)
          addStars(5)
          navigate(`/lesson/${quest.id}?step=quiz`)
        }}
      >
        Xong thực hành · Kiểm tra
        <ArrowRight className="size-5" aria-hidden />
      </Button>
      <Button variant="secondary" fullWidth onClick={() => navigate(`/lesson/${quest.id}`)}>
        Về lý thuyết bài học
      </Button>
    </div>
  )
}
