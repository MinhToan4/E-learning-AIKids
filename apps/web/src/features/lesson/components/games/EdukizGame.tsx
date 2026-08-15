import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  LockKeyhole,
  MemoryStick,
  HelpCircle,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  buildMemoryDeck,
  deterministicShuffle,
  feedbackFor,
  sanitizeAssociationPairs,
  sanitizeGameCards,
} from '@/features/lesson/lib/curriculum-game'
import { PRAISE_MESSAGES, WRONG_MESSAGES, pickRandom } from './FeedbackOverlay'
import { cn } from '@/shared/lib/cn'
import { EngineGameShell } from './EngineGameShell'
import type { EngineGameProps } from './types'

const FALLBACK_PAIRS = [
  { left: 'Ảnh chú mèo', right: 'Nhãn: mèo' },
  { left: 'Ảnh chú chó', right: 'Nhãn: chó' },
  { left: 'Ảnh quả táo', right: 'Nhãn: táo' },
]

const PRIVACY_CARDS = [
  { label: 'Sở thích màu xanh', target: 'share' },
  { label: 'Mật khẩu của con', target: 'private' },
  { label: 'Tên thú cưng tưởng tượng', target: 'share' },
  { label: 'Địa chỉ nhà của con', target: 'private' },
] as const

const PROMPT_CHUNKS = [
  { id: 'subject', label: 'Một chú khỉ vàng' },
  { id: 'detail', label: 'đeo ba lô xanh' },
  { id: 'action', label: 'cầm 3 quả táo đỏ' },
  { id: 'style', label: 'tranh giấy cắt vui nhộn' },
] as const

const TEST_QUESTIONS = [
  {
    prompt: 'AI nói rất chắc chắn nhưng không cho biết thông tin từ đâu. Con làm gì?',
    options: ['Tin ngay', 'Kiểm tra lại với nguồn đáng tin', 'Gửi cho mọi người'],
    answer: 1,
    why: 'Đúng, giọng nói tự tin không có nghĩa là thông tin chắc chắn đúng.',
  },
  {
    prompt: 'AI tạo ảnh đẹp nhưng thiếu một chi tiết trong prompt. Ai là người quyết định cuối?',
    options: ['AI', 'Con kiểm tra và yêu cầu sửa', 'Không ai cả'],
    answer: 1,
    why: 'Chính con cầm lái: con kiểm tra, góp ý và quyết định dùng hay sửa.',
  },
  {
    prompt: 'Khi AI làm sai, điều nào giúp AI hoặc sản phẩm tốt hơn?',
    options: ['Cho ví dụ rõ và phản hồi', 'Giấu lỗi đi', 'Nhập mật khẩu'],
    answer: 0,
    why: 'Ví dụ rõ và phản hồi đúng giúp quá trình huấn luyện, kiểm thử tốt hơn.',
  },
] as const

const PHASES = [
  { title: 'Gắn nhãn', icon: MemoryStick },
  { title: 'Giữ bí mật', icon: LockKeyhole },
  { title: 'Lắp prompt', icon: BrainCircuit },
  { title: 'Kiểm thử', icon: BookOpenCheck },
] as const

export function EdukizGame({
  config,
  difficulty,
  instruction,
  outcome,
  onComplete,
  onBack,
  onHint,
}: EngineGameProps) {
  const cards = useMemo(() => sanitizeGameCards(config?.cards), [config?.cards])
  const pairs = useMemo(() => {
    const configured = sanitizeAssociationPairs(config?.pairs)
    if (configured.length >= 2) return configured.slice(0, difficulty === 'gentle' ? 2 : 3)
    return FALLBACK_PAIRS.slice(0, difficulty === 'gentle' ? 2 : 3)
  }, [config?.pairs, difficulty])
  const deck = useMemo(() => buildMemoryDeck(pairs, difficulty), [pairs, difficulty])
  const promptDeck = useMemo(
    () => deterministicShuffle(PROMPT_CHUNKS, `prompt-${difficulty}`),
    [difficulty],
  )
  const [phase, setPhase] = useState(0)
  const [unlocked, setUnlocked] = useState(0)
  const [open, setOpen] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [privacyIndex, setPrivacyIndex] = useState(0)
  const [promptIds, setPromptIds] = useState<string[]>([])
  const [testIndex, setTestIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [score, setScore] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [streak, setStreak] = useState(0)
  const [choices, setChoices] = useState<string[]>([])
  const [status, setStatus] = useState(
    'Xưởng có bốn phòng. Hoàn thành từng phòng để tự tay huấn luyện và kiểm thử AI nhé!',
  )
  const memoryDone = matched.length >= pairs.length
  const privacyDone = privacyIndex >= PRIVACY_CARDS.length
  const promptDone = promptIds.length >= PROMPT_CHUNKS.length
  const testDone = testIndex >= TEST_QUESTIONS.length
  const phaseDone = [memoryDone, privacyDone, promptDone, testDone][phase] ?? false
  const localProgress = phase === 0
    ? matched.length / pairs.length
    : phase === 1
      ? privacyIndex / PRIVACY_CARDS.length
      : phase === 2
        ? promptIds.length / PROMPT_CHUNKS.length
        : testIndex / TEST_QUESTIONS.length
  const progress = Math.round(((phase + Math.min(1, localProgress)) / PHASES.length) * 100)

  function reward(message: string, evidence: string, amount = 15) {
    const nextStreak = streak + 1
    setStreak(nextStreak)
    setMaxStreak((value) => Math.max(value, nextStreak))
    setScore((value) => value + amount + Math.min(5, nextStreak))
    setChoices((value) => [...value, evidence])
    
    const praise = pickRandom(PRAISE_MESSAGES, choices.length)
    setStatus(`${feedbackFor('correct', choices.length)} ${message}`)
    if (onHint) onHint({ text: praise.text, type: 'correct' })
  }

  function retry(message: string) {
    setStreak(0)
    
    const wrong = pickRandom(WRONG_MESSAGES, attempts)
    setStatus(`${feedbackFor('retry', attempts)} ${message}`)
    if (onHint) onHint({ text: `${wrong.main} ${wrong.sub}\n💡 ${message}`, type: 'wrong' })
  }

  function flip(id: string, pairId: string) {
    if (open.length >= 2 || open.includes(id) || matched.includes(pairId) || memoryDone) return
    const next = [...open, id]
    setOpen(next)
    if (next.length !== 2) return
    setAttempts((value) => value + 1)
    const selected = deck.filter((item) => next.includes(item.id))
    if (selected[0]?.pairId === selected[1]?.pairId) {
      window.setTimeout(() => {
        setMatched((value) => [...value, pairId])
        setOpen([])
        reward('Một ví dụ đã được gắn đúng nhãn. AI cần nhiều cặp ví dụ–nhãn như thế để học.', pairId, 18)
      }, 300)
    } else {
      window.setTimeout(() => {
        setOpen([])
        retry('Hai thẻ chưa cùng một cặp ví dụ–nhãn. Con nhớ vị trí rồi thử lại nhé!')
      }, 650)
    }
  }

  function sortPrivacy(target: 'share' | 'private') {
    if (privacyDone) return
    const card = PRIVACY_CARDS[privacyIndex]!
    setAttempts((value) => value + 1)
    if (target !== card.target) {
      retry(card.target === 'private'
        ? 'Thông tin này có thể nhận ra hoặc tiếp cận con. Mình giữ riêng nhé!'
        : 'Thông tin tưởng tượng hoặc sở thích chung có thể dùng trong bài tập này.')
      return
    }
    setPrivacyIndex((value) => value + 1)
    reward(
      card.target === 'private'
        ? 'Cất an toàn rồi. Không đưa mật khẩu, địa chỉ hay bí mật cá nhân cho AI.'
        : 'Phân loại ổn rồi. Mình chỉ dùng dữ liệu vừa đủ cho nhiệm vụ.',
      `privacy:${card.label}:${target}`,
    )
  }

  function choosePromptChunk(id: string) {
    if (promptDone || promptIds.includes(id)) return
    setAttempts((value) => value + 1)
    const expected = PROMPT_CHUNKS[promptIds.length]!
    if (id !== expected.id) {
      retry(`Mảnh tiếp theo cần nói về “${expected.label}”. Mình ghép từ ý chính đến phong cách nhé!`)
      return
    }
    setPromptIds((value) => [...value, id])
    reward(
      promptIds.length + 1 === PROMPT_CHUNKS.length
        ? 'Prompt rõ chủ thể, chi tiết, hành động và phong cách. AI có chỉ dẫn tốt hơn rồi!'
        : 'Mảnh prompt này đúng vị trí.',
      `prompt:${id}`,
      10,
    )
  }

  function answerTest(answerIndex: number) {
    if (testDone) return
    const question = TEST_QUESTIONS[testIndex]!
    setAttempts((value) => value + 1)
    if (answerIndex !== question.answer) {
      retry('Dừng một nhịp nhé: AI có thể sai và dữ liệu riêng tư cần được bảo vệ.')
      return
    }
    setTestIndex((value) => value + 1)
    reward(question.why, `test:${testIndex}:${answerIndex}`, 20)
  }

  function nextPhase() {
    if (!phaseDone || phase >= PHASES.length - 1) return
    const next = phase + 1
    setUnlocked((value) => Math.max(value, next))
    setPhase(next)
    setStatus(`Phòng ${next + 1} đã mở. Mii đang chờ con thử thao tác mới!`)
  }

  function readStatus() {
    if (!('speechSynthesis' in window)) {
      setStatus('Thiết bị này chưa hỗ trợ đọc thành tiếng. Con vẫn có thể đọc cùng người lớn nhé!')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(status)
    utterance.lang = 'vi-VN'
    utterance.rate = 0.92
    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
    <EngineGameShell
      title="Edukiz · Xưởng Huấn Luyện AI"
      subtitle={instruction || 'Đi qua bốn phòng: gắn nhãn, bảo vệ dữ liệu, lắp prompt và kiểm thử kết quả AI.'}
      scene="/assets/game-engines/edukiz-garden.svg"
      sceneAlt="Khu vườn trí nhớ ma thuật với hoa phát sáng và bướm dữ liệu"
      score={score}
      progress={progress}
      status={status}
      onBack={onBack}
    >
      <div className="grid gap-5">
        <div className="grid grid-cols-4 gap-2" aria-label="Bốn phòng huấn luyện">
          {PHASES.map(({ title, icon: Icon }, index) => (
            <button
              key={title}
              type="button"
              disabled={index > unlocked}
              onClick={() => setPhase(index)}
              className={cn(
                'min-h-16 rounded-[2rem] border-2 border-b-[6px] px-2 text-xs font-black transition-all sm:text-sm active:translate-y-1 active:border-b-2',
                phase === index
                  ? 'border-mint-600 bg-mint-100 text-mint-900 shadow-xl'
                  : index <= unlocked
                    ? 'border-brand-300 bg-white text-brand-800 hover:-translate-y-1 hover:shadow-lg'
                    : 'border-stone-200 bg-stone-50 text-stone-400',
              )}
            >
              <Icon className="mx-auto mb-1" size={24} aria-hidden="true" />
              {index + 1}. {title}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={readStatus}
          className="ml-auto flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-extrabold text-brand-700 hover:bg-brand-50"
        >
          <Volume2 size={18} aria-hidden="true" /> Đọc lời Mii
        </button>

        {phase === 0 && (
          <section className="grid gap-4">
            <div>
              <h3 className="font-display text-2xl text-brand-950">Phòng gắn nhãn dữ liệu</h3>
              <p className="font-bold text-muted">Lật một ví dụ và chiếc nhãn đúng của nó. Đây là cách đơn giản để “dạy bằng ví dụ”.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {deck.map((card) => {
                const revealed = open.includes(card.id) || matched.includes(card.pairId)
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => flip(card.id, card.pairId)}
                    className={cn(
                      'min-h-28 rounded-[2rem] border-2 border-b-[6px] p-3 font-black transition-all active:translate-y-1 active:border-b-2 shadow-sm hover:shadow-xl hover:-translate-y-2',
                      revealed
                        ? 'border-mint-400 bg-mint-50 text-mint-900'
                        : 'border-brand-700 bg-brand-800 text-sun-200',
                    )}
                    aria-label={revealed ? card.label : 'Thẻ đang úp'}
                  >
                    {revealed ? card.label : <HelpCircle className="mx-auto" size={30} aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {phase === 1 && (
          <section className="grid gap-5">
            <div>
              <h3 className="font-display text-2xl text-brand-950">Phòng bảo vệ dữ liệu</h3>
              <p className="font-bold text-muted">AI chỉ cần dữ liệu phù hợp với nhiệm vụ, không cần biết bí mật của con.</p>
            </div>
            {!privacyDone ? (
              <>
                <div className="rounded-[2rem] border-2 border-[#ead7a5] bg-[#fffaf0] p-7 text-center font-display text-2xl text-brand-950">
                  {PRIVACY_CARDS[privacyIndex]!.label}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => sortPrivacy('share')} className="min-h-20 rounded-[2rem] border-2 border-b-[6px] border-mint-500 bg-mint-100 p-3 font-black text-mint-900 transition-all active:translate-y-1 active:border-b-2 hover:-translate-y-1 hover:shadow-lg">
                    Dùng được cho bài này
                  </button>
                  <button type="button" onClick={() => sortPrivacy('private')} className="min-h-20 rounded-[2rem] border-2 border-b-[6px] border-coral-400 bg-coral-100 p-3 font-black text-danger transition-all active:translate-y-1 active:border-b-2 hover:-translate-y-1 hover:shadow-lg">
                    Giữ riêng tư
                  </button>
                </div>
              </>
            ) : (
              <p className="rounded-3xl bg-mint-50 p-6 text-center font-extrabold text-mint-900">Bốn thẻ đã về đúng giỏ an toàn.</p>
            )}
          </section>
        )}

        {phase === 2 && (
          <section className="grid gap-5">
            <div>
              <h3 className="font-display text-2xl text-brand-950">Phòng lắp prompt</h3>
              <p className="font-bold text-muted">Ghép theo thứ tự: chủ thể → chi tiết → hành động → phong cách.</p>
            </div>
            <div className="min-h-28 rounded-[1.75rem] border-2 border-dashed border-brand-300 bg-brand-50 p-4">
              {promptIds.length === 0 ? (
                <p className="grid min-h-20 place-items-center text-center font-bold text-muted">Chạm các mảnh bên dưới để lắp prompt</p>
              ) : (
                <ol className="flex flex-wrap gap-2">
                  {promptIds.map((id, index) => (
                    <li key={id} className="rounded-2xl bg-white px-4 py-3 font-extrabold text-brand-900 shadow-sm">
                      {index + 1}. {PROMPT_CHUNKS.find((chunk) => chunk.id === id)!.label}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {promptDeck.map((chunk) => (
                <button
                  key={chunk.id}
                  type="button"
                  onClick={() => choosePromptChunk(chunk.id)}
                  disabled={promptIds.includes(chunk.id)}
                  className="min-h-16 rounded-[2rem] border-2 border-b-[6px] border-sun-400 bg-sun-50 p-3 font-black text-amber-950 transition-all active:translate-y-1 active:border-b-2 hover:-translate-y-1 hover:shadow-lg disabled:opacity-30 disabled:translate-y-0 disabled:border-b-[6px]"
                >
                  {chunk.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPromptIds([])}
              className="mx-auto flex min-h-11 items-center gap-2 rounded-xl px-4 font-bold text-muted"
            >
              <RotateCcw size={18} aria-hidden="true" /> Ghép lại
            </button>
          </section>
        )}

        {phase === 3 && (
          <section className="grid gap-5">
            <div>
              <h3 className="font-display text-2xl text-brand-950">Cổng kiểm thử AI</h3>
              <p className="font-bold text-muted">Bài cuối không hỏi con nhớ máy móc. Con hãy chọn cách dùng AI có trách nhiệm.</p>
            </div>
            {!testDone ? (
              <>
                <p className="rounded-[2rem] border-2 border-brand-100 bg-brand-50 p-6 text-center font-display text-xl text-brand-950">
                  {TEST_QUESTIONS[testIndex]!.prompt}
                </p>
                <div className="grid gap-3">
                  {TEST_QUESTIONS[testIndex]!.options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answerTest(index)}
                      className="min-h-14 rounded-[2rem] border-2 border-b-[6px] border-brand-200 bg-white px-4 text-left font-black text-brand-900 transition-all active:translate-y-1 active:border-b-2 hover:-translate-y-1 hover:shadow-md hover:border-brand-400"
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-3xl bg-mint-50 p-6 text-center font-extrabold text-mint-900">Con đã tự kiểm thử AI thay vì tin ngay. Cổng xưởng đã mở!</p>
            )}
          </section>
        )}

        {phaseDone && phase < PHASES.length - 1 && (
          <Button onClick={nextPhase}>
            Mở phòng tiếp theo <ArrowRight size={19} aria-hidden="true" />
          </Button>
        )}

        {testDone && (
          <Button
            onClick={() =>
              onComplete({
                choices: cards.length > 0 ? [...choices, `lesson:${cards[0]}`] : choices,
                attempts: Math.max(1, attempts),
                score,
                maxStreak,
              })
            }
          >
            Nhận huy hiệu Người Huấn Luyện AI
          </Button>
        )}
        {outcome && <p className="text-center text-xs font-bold text-muted">{outcome}</p>}
      </div>
    </EngineGameShell>
    </>
  )
}
