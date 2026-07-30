import { useEffect, useMemo, useRef, useState } from 'react'
import { Database, Mountain, Navigation, Play, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { feedbackFor } from '@/features/lesson/lib/curriculum-game'
import { EngineGameShell } from './EngineGameShell'
import type { EngineGameProps } from './types'

type Command = 'forward' | 'left' | 'right' | 'repeat2' | 'ifClear'
type Facing = 0 | 1 | 2 | 3
type Position = { x: number; y: number; facing: Facing }
type Level = {
  title: string
  lesson: string
  start: Position
  goal: { x: number; y: number }
  rocks: string[]
  maxBlocks: number
  allowed: Command[]
}

const COMMANDS: Array<{ id: Command; label: string; symbol: string }> = [
  { id: 'forward', label: 'Đi thẳng', symbol: '↑' },
  { id: 'left', label: 'Quay trái', symbol: '↶' },
  { id: 'right', label: 'Quay phải', symbol: '↷' },
  { id: 'repeat2', label: 'Lặp 2 lần', symbol: '×2' },
  { id: 'ifClear', label: 'Nếu trống → đi', symbol: '◇' },
]

const LEVELS: Level[] = [
  {
    title: 'Tín hiệu đầu tiên',
    lesson: 'Máy tính làm đúng từng lệnh theo đúng thứ tự con xếp.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 0, y: 1 },
    rocks: [],
    maxBlocks: 3,
    allowed: ['forward'],
  },
  {
    title: 'Đường vòng dữ liệu',
    lesson: 'Khi đường bị chặn, con thử chạy, quan sát rồi sửa thuật toán.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 3, y: 2 },
    rocks: ['0:2', '2:2', '4:3'],
    maxBlocks: 8,
    allowed: ['forward', 'left', 'right'],
  },
  {
    title: 'Lệnh lặp tiết kiệm',
    lesson: 'Một khối lặp có thể thay hai khối giống nhau — chương trình ngắn mà vẫn rõ.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 4, y: 0 },
    rocks: ['1:3', '2:3', '2:1', '3:1'],
    maxBlocks: 7,
    allowed: ['forward', 'left', 'right', 'repeat2'],
  },
  {
    title: 'Cảm biến kiểm tra đường',
    lesson: 'Điều kiện “nếu… thì…” giúp chương trình kiểm tra trước khi hành động.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 4, y: 1 },
    rocks: ['0:2', '2:2', '3:3', '4:2'],
    maxBlocks: 9,
    allowed: ['forward', 'left', 'right', 'repeat2', 'ifClear'],
  },
]

function step(position: Position, command: 'forward' | 'left' | 'right'): Position {
  if (command === 'left') {
    return { ...position, facing: ((position.facing + 3) % 4) as Facing }
  }
  if (command === 'right') {
    return { ...position, facing: ((position.facing + 1) % 4) as Facing }
  }
  const offsets = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ] as const
  const offset = offsets[position.facing]
  return { ...position, x: position.x + offset.x, y: position.y + offset.y }
}

function valid(position: Position, rocks: Set<string>): boolean {
  return position.x >= 0 &&
    position.x < 5 &&
    position.y >= 0 &&
    position.y < 5 &&
    !rocks.has(`${position.x}:${position.y}`)
}

export function BlocklyMazeGame({
  difficulty,
  instruction,
  outcome,
  onComplete,
  onBack,
}: EngineGameProps) {
  const [levelIndex, setLevelIndex] = useState(0)
  const level = LEVELS[levelIndex]!
  const rocks = useMemo(() => new Set(level.rocks), [level])
  const maxBlocks = level.maxBlocks + (difficulty === 'gentle' ? 2 : 0)
  const [program, setProgram] = useState<Command[]>([])
  const [position, setPosition] = useState<Position>(level.start)
  const [running, setRunning] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [attempts, setAttempts] = useState(0)
  const [won, setWon] = useState(false)
  const [completedPrograms, setCompletedPrograms] = useState<string[]>([])
  const [status, setStatus] = useState(
    'Xếp khối lệnh rồi bấm Chạy. Nếu chưa tới kho dữ liệu, con quan sát và sửa lại nhé!',
  )
  const timers = useRef<number[]>([])
  const allComplete = won && levelIndex === LEVELS.length - 1
  const levelScore = won
    ? Math.max(35, 100 - program.length * 4 - Math.max(0, attempts - LEVELS.length) * 3)
    : 0
  const score = completedPrograms.length * 100 + levelScore
  const distanceProgress =
    (4 - Math.abs(position.x - level.goal.x) + 4 - Math.abs(position.y - level.goal.y)) / 8
  const progress = Math.round(
    ((levelIndex + (won ? 1 : Math.max(0, distanceProgress))) / LEVELS.length) * 100,
  )
  const cells = useMemo(
    () => Array.from({ length: 25 }, (_, index) => ({
      x: index % 5,
      y: Math.floor(index / 5),
    })),
    [],
  )

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  )

  function addCommand(command: Command) {
    if (running || won || program.length >= maxBlocks || !level.allowed.includes(command)) return
    setProgram((current) => [...current, command])
  }

  function moveCommand(from: number, to: number) {
    if (running || from === to) return
    setProgram((current) => {
      const next = [...current]
      const [command] = next.splice(from, 1)
      if (!command) return current
      next.splice(to, 0, command)
      return next
    })
  }

  function reset(clearProgram = false) {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setRunning(false)
    setActiveIndex(-1)
    setPosition(level.start)
    setWon(false)
    if (clearProgram) setProgram([])
    setStatus(clearProgram
      ? 'Bảng lệnh trống rồi. Mình xây một cách đi mới nhé!'
      : 'Mii đã về vạch xuất phát, chương trình vẫn còn nguyên để con sửa.')
  }

  function runProgram() {
    if (program.length === 0 || running || won) return
    reset(false)
    setAttempts((value) => value + 1)
    setRunning(true)
    setStatus('Đang chạy từng lệnh… nhìn ô sáng để biết chương trình đang làm gì nhé!')

    const executions = program.flatMap((command, sourceIndex) =>
      command === 'repeat2'
        ? [
            { command: 'forward' as const, sourceIndex },
            { command: 'forward' as const, sourceIndex },
          ]
        : [{ command, sourceIndex }],
    )
    let cursor = level.start
    executions.forEach(({ command, sourceIndex }, executionIndex) => {
      const timer = window.setTimeout(() => {
        setActiveIndex(sourceIndex)
        const primitive = command === 'ifClear' ? 'forward' : command
        const next = step(cursor, primitive)
        if (!valid(next, rocks)) {
          if (command === 'ifClear') {
            if (executionIndex === executions.length - 1) {
              setRunning(false)
              setStatus('Cảm biến thấy đường bị chặn nên Mii đã đứng yên an toàn. Thêm lệnh quay rồi chạy lại nhé!')
            }
            return
          }
          timers.current.forEach((pending) => window.clearTimeout(pending))
          timers.current = []
          setRunning(false)
          setStatus('Mii gặp đá rồi! Tìm ô lệnh đang sáng, đổi lệnh trước chỗ đó và chạy lại nhé.')
          return
        }
        cursor = next
        setPosition(cursor)
        const reachedGoal = cursor.x === level.goal.x && cursor.y === level.goal.y
        if (reachedGoal) {
          timers.current.forEach((pending) => window.clearTimeout(pending))
          timers.current = []
          setWon(true)
          setRunning(false)
          setStatus(`${feedbackFor('correct', levelIndex)} ${level.lesson}`)
          return
        }
        if (executionIndex === executions.length - 1) {
          setRunning(false)
          setStatus('Chương trình đã chạy hết nhưng chưa tới kho dữ liệu. Con thêm, bớt hoặc đổi thứ tự khối nhé!')
        }
      }, 300 * (executionIndex + 1))
      timers.current.push(timer)
    })
  }

  function nextLevel() {
    if (!won || levelIndex >= LEVELS.length - 1) return
    const nextIndex = levelIndex + 1
    const nextLevel = LEVELS[nextIndex]!
    setCompletedPrograms((value) => [...value, `level-${levelIndex + 1}:${program.join(',')}`])
    setLevelIndex(nextIndex)
    setProgram([])
    setPosition(nextLevel.start)
    setWon(false)
    setActiveIndex(-1)
    setStatus(`Mở khóa màn ${nextIndex + 1}: ${nextLevel.title}. Khối lệnh mới đang chờ con!`)
  }

  return (
    <EngineGameShell
      title="Blockly · Đội Cứu Hộ Dữ Liệu"
      subtitle={instruction || 'Lập chương trình qua bốn màn để đưa dữ liệu tốt về phòng học của AI.'}
      scene="/assets/game-engines/ai-worlds.jpg"
      scenePosition="top-left"
      score={score}
      progress={progress}
      status={status}
      onBack={onBack}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.82fr)]">
        <div className="grid content-start gap-3">
          <div className="rounded-2xl border-2 border-[#ead7a5] bg-[#fffaf0] px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-800">
              Màn {levelIndex + 1} / {LEVELS.length}
            </p>
            <h3 className="font-display text-xl text-brand-950">{level.title}</h3>
            <p className="text-sm font-bold text-muted">{level.lesson}</p>
          </div>
          <div
            className="mx-auto grid aspect-square w-full max-w-[30rem] grid-cols-5 overflow-hidden rounded-[1.75rem] border-4 border-white bg-sky-100 shadow-inner"
            aria-label="Bản đồ lập trình 5 hàng 5 cột"
          >
            {cells.map((cell) => {
              const key = `${cell.x}:${cell.y}`
              const isMii = position.x === cell.x && position.y === cell.y
              const isGoal = level.goal.x === cell.x && level.goal.y === cell.y
              const isRock = rocks.has(key)
              return (
                <div
                  key={key}
                  className={cn(
                    'relative grid place-items-center border border-white/70',
                    (cell.x + cell.y) % 2 === 0 ? 'bg-[#dff3d8]' : 'bg-[#d9eef4]',
                    isRock && 'bg-[#d8c7aa]',
                  )}
                >
                  {isRock && <Mountain className="text-stone-600" size={26} aria-label="Tảng đá" />}
                  {isGoal && <Database className="absolute text-coral-600" size={30} aria-label="Kho dữ liệu" />}
                  {isMii && (
                    <span
                      className="relative z-10 grid size-11 place-items-center rounded-2xl border-2 border-white bg-brand-700 text-white shadow-clay transition-transform duration-200"
                      style={{ transform: `rotate(${position.facing * 90}deg)` }}
                      aria-label="Mii"
                    >
                      <Navigation size={23} fill="currentColor" aria-hidden="true" />
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="rounded-3xl border-2 border-brand-100 bg-brand-50 p-4">
            <p className="mb-3 text-sm font-extrabold text-brand-800">
              Kho khối lệnh · tối đa {maxBlocks}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COMMANDS.filter((command) => level.allowed.includes(command.id)).map((command) => (
                <button
                  key={command.id}
                  type="button"
                  draggable
                  disabled={running || won || program.length >= maxBlocks}
                  onDragStart={(event) => event.dataTransfer.setData('command', command.id)}
                  onClick={() => addCommand(command.id)}
                  className="min-h-20 rounded-2xl border-2 border-brand-200 bg-white p-2 font-extrabold text-brand-800 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 disabled:opacity-45"
                >
                  <span className="block font-display text-2xl" aria-hidden="true">{command.symbol}</span>
                  <span className="text-xs">{command.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="min-h-48 rounded-3xl border-2 border-dashed border-brand-300 bg-white p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const command = event.dataTransfer.getData('command') as Command
              if (level.allowed.includes(command)) addCommand(command)
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-text">Chương trình của con</p>
              <button type="button" className="grid size-11 place-items-center rounded-xl text-muted hover:bg-coral-50 hover:text-danger" onClick={() => reset(true)} disabled={running} aria-label="Xóa toàn bộ chương trình">
                <Trash2 size={20} aria-hidden="true" />
              </button>
            </div>
            {program.length === 0 ? (
              <p className="grid min-h-24 place-items-center rounded-2xl bg-brand-50 px-4 text-center text-sm font-bold text-muted">Thả hoặc chạm khối lệnh</p>
            ) : (
              <ol className="grid gap-2">
                {program.map((command, index) => {
                  const definition = COMMANDS.find((item) => item.id === command)!
                  return (
                    <li
                      key={`${command}-${index}`}
                      draggable={!running}
                      onDragStart={(event) => event.dataTransfer.setData('program-index', String(index))}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        const from = Number(event.dataTransfer.getData('program-index'))
                        if (Number.isInteger(from)) moveCommand(from, index)
                      }}
                      className={cn(
                        'flex min-h-12 items-center gap-3 rounded-xl border-2 border-brand-100 bg-white px-3 font-bold',
                        activeIndex === index && 'border-sun-400 bg-sun-50',
                      )}
                    >
                      <span className="grid size-8 place-items-center rounded-lg bg-brand-100 font-display text-lg text-brand-800">{definition.symbol}</span>
                      <span className="flex-1">{index + 1}. {definition.label}</span>
                      <button type="button" className="size-10 rounded-lg text-muted hover:bg-coral-50 hover:text-danger" onClick={() => setProgram((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={running} aria-label={`Xóa lệnh ${index + 1}`}>×</button>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => reset(false)} disabled={running}>
              <RotateCcw size={18} aria-hidden="true" /> Đặt lại
            </Button>
            <Button onClick={runProgram} disabled={running || program.length === 0 || won}>
              <Play size={18} fill="currentColor" aria-hidden="true" /> Chạy
            </Button>
          </div>

          {won && !allComplete && <Button onClick={nextLevel}>Mở màn tiếp theo</Button>}
          {allComplete && (
            <Button
              onClick={() =>
                onComplete({
                  choices: [...completedPrograms, `level-${levelIndex + 1}:${program.join(',')}`],
                  attempts: Math.max(1, attempts),
                  score,
                  maxStreak: LEVELS.length,
                })
              }
            >
              Nhận huy hiệu Kỹ Sư Nhí
            </Button>
          )}
          {outcome && <p className="text-center text-xs font-bold text-muted">{outcome}</p>}
        </div>
      </div>
    </EngineGameShell>
  )
}
