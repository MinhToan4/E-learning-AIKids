import { useEffect, useMemo, useRef, useState } from 'react'
import { Database, Play, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { cn } from '@/shared/lib/cn'
import { feedbackFor, missionProgress } from '@/features/lesson/lib/curriculum-game'
import { EngineGameShell } from './EngineGameShell'
import { PRAISE_MESSAGES, WRONG_MESSAGES, pickRandom } from './FeedbackOverlay'
import type { EngineGameProps } from './types'

type Command = 'up' | 'down' | 'left' | 'right'
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

export const BLOCKLY_DIRECTION_COMMANDS: Array<{ id: Command; label: string; symbol: string }> = [
  { id: 'up', label: 'Đi lên', symbol: '↑' },
  { id: 'left', label: 'Sang trái', symbol: '←' },
  { id: 'right', label: 'Sang phải', symbol: '→' },
  { id: 'down', label: 'Lùi xuống', symbol: '↓' },
]

const LEVELS: Level[] = [
  {
    title: 'Tín hiệu đầu tiên',
    lesson: 'Máy tính làm đúng từng lệnh theo đúng thứ tự con xếp.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 0, y: 1 },
    rocks: [],
    maxBlocks: 3,
    allowed: ['up'],
  },
  {
    title: 'Đường vòng dữ liệu',
    lesson: 'Khi đường bị chặn, con thử chạy, quan sát rồi sửa thuật toán.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 3, y: 2 },
    rocks: ['0:2', '2:2', '4:3'],
    maxBlocks: 8,
    allowed: ['up', 'left', 'right', 'down'],
  },
  {
    title: 'Bốn hướng trên bản đồ',
    lesson: 'Mỗi khối đưa Mii sang đúng một ô theo hướng mũi tên.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 4, y: 0 },
    rocks: ['1:3', '2:3', '2:1', '3:1'],
    maxBlocks: 9,
    allowed: ['up', 'left', 'right', 'down'],
  },
  {
    title: 'Chọn đường không có đá',
    lesson: 'Chọn hướng trực tiếp giúp con tập trung vào đường đi và sửa đúng bước bị sai.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 4, y: 1 },
    rocks: ['0:2', '2:2', '3:3', '4:2'],
    maxBlocks: 9,
    allowed: ['up', 'left', 'right', 'down'],
  },
  {
    title: 'Bậc thang từng bước',
    lesson: 'Một bài toán lớn dễ hơn khi con chia đường đi thành từng bước ngắn.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 4, y: 0 },
    rocks: ['1:4', '1:2', '3:2', '3:0'],
    maxBlocks: 10,
    allowed: ['up', 'left', 'right', 'down'],
  },
  {
    title: 'Thám tử tìm đường',
    lesson: 'Con đọc bản đồ, dự đoán đường đi rồi kiểm tra từng lệnh theo thứ tự.',
    start: { x: 0, y: 4, facing: 0 },
    goal: { x: 4, y: 1 },
    rocks: ['0:1', '1:3', '2:1', '3:3', '4:2'],
    maxBlocks: 12,
    allowed: ['up', 'left', 'right', 'down'],
  },
]

function step(position: Position, command: Command): Position {
  const movement: Record<Command, { x: number; y: number; facing: Facing }> = {
    up: { x: 0, y: -1, facing: 0 },
    right: { x: 1, y: 0, facing: 1 },
    down: { x: 0, y: 1, facing: 2 },
    left: { x: -1, y: 0, facing: 3 },
  }
  const next = movement[command]
  return {
    x: position.x + next.x,
    y: position.y + next.y,
    facing: next.facing,
  }
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
  onHint,
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

    const executions = program.map((command, sourceIndex) => ({ command, sourceIndex }))
    let cursor = level.start
    executions.forEach(({ command, sourceIndex }, executionIndex) => {
      const timer = window.setTimeout(() => {
        setActiveIndex(sourceIndex)
        const next = step(cursor, command)
        if (!valid(next, rocks)) {
          timers.current.forEach((pending) => window.clearTimeout(pending))
          timers.current = []
          setRunning(false)
          
          const wrong = pickRandom(WRONG_MESSAGES, attempts)
          setStatus('Mii gặp đá rồi! Tìm ô lệnh đang sáng, đổi lệnh trước chỗ đó và chạy lại nhé.')
          if (onHint) onHint({ text: `${wrong.main} ${wrong.sub}\n💡 Mii gặp đá rồi! Tìm ô lệnh đang sáng, đổi lệnh trước chỗ đó và chạy lại nhé.`, type: 'wrong' })
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
          
          const praise = pickRandom(PRAISE_MESSAGES, attempts)
          setStatus(`${feedbackFor('correct', levelIndex)} ${level.lesson}`)
          if (onHint) onHint({ text: praise.text, type: 'correct' })
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
    <>
    <EngineGameShell
      title="Blockly · Đội Cứu Hộ Dữ Liệu"
      subtitle={instruction || 'Xếp các mũi tên qua sáu màn để đưa dữ liệu tốt về phòng học của AI.'}
      scene="/assets/game-engines/blockly-island.svg"
      sceneAlt="Hòn đảo lập trình nổi giữa bầu trời xanh mát"
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
            className="mx-auto grid aspect-square w-full max-w-[30rem] grid-cols-5 overflow-hidden rounded-[2.5rem] border-[12px] border-brand-400 border-b-[24px] bg-sky-100 shadow-clay relative"
            aria-label="Bản đồ lập trình 5 hàng 5 cột"
          >
            {cells.map((cell) => {
              const key = `${cell.x}:${cell.y}`
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
                  {isRock && (
                    <span className="blockly-rock" role="img" aria-label="Khối đá chặn đường">
                      <span className="blockly-rock-top" aria-hidden="true" />
                      <span className="blockly-rock-face" aria-hidden="true">
                        <span className="blockly-rock-mark" />
                      </span>
                    </span>
                  )}
                  {isGoal && <Database className="absolute text-coral-600" size={30} aria-label="Kho dữ liệu" />}
                </div>
              )
            })}
            <span
              className="blockly-cat-position"
              style={{ transform: `translate3d(${position.x * 100}%, ${position.y * 100}%, 0)` }}
              data-running={running ? 'true' : 'false'}
              data-facing={position.facing}
              aria-label={`Mee đang ở hàng ${position.y + 1}, cột ${position.x + 1}`}
            >
              <span className="blockly-cat-shadow" aria-hidden="true" />
              <AikidCatCharacter pose="walking" className="blockly-cat-sprite" />
            </span>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="rounded-[2rem] border-[4px] border-dashed border-brand-300 bg-brand-50 p-5 shadow-sm">
            <p className="mb-3 text-sm font-black text-brand-800">
              Khay đồ chơi · tối đa {maxBlocks} khối
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BLOCKLY_DIRECTION_COMMANDS.filter((command) => level.allowed.includes(command.id)).map((command) => (
                <button
                  key={command.id}
                  type="button"
                  draggable
                  disabled={running || won || program.length >= maxBlocks}
                  onDragStart={(event) => event.dataTransfer.setData('command', command.id)}
                  onClick={() => addCommand(command.id)}
                  className="min-h-20 rounded-[2rem] border-2 border-b-[6px] border-brand-300 bg-white p-2 font-black text-brand-800 shadow-clay transition-all hover:-translate-y-1 hover:border-brand-400 active:translate-y-1 active:border-b-2 disabled:opacity-45"
                >
                  <span className="block font-display text-2xl" aria-hidden="true">{command.symbol}</span>
                  <span className="text-xs">{command.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="min-h-48 rounded-[2rem] border-[4px] border-dashed border-brand-300 bg-white p-5 shadow-sm"
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
              <p className="grid min-h-24 place-items-center rounded-[2rem] bg-brand-50 px-4 text-center text-sm font-black text-brand-400 border-2 border-dashed border-brand-200">Thả hoặc chạm khối lệnh</p>
            ) : (
              <ol className="grid gap-2">
                {program.map((command, index) => {
                  const definition = BLOCKLY_DIRECTION_COMMANDS.find((item) => item.id === command)!
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
                        'flex min-h-12 items-center gap-3 rounded-[2rem] border-2 border-b-[4px] border-brand-200 bg-white px-3 font-black shadow-sm transition-all active:translate-y-1 active:border-b-2',
                        activeIndex === index && 'border-sun-400 border-b-sun-500 bg-sun-50',
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
            <button type="button" onClick={() => reset(false)} disabled={running} className="flex items-center justify-center gap-2 rounded-[2rem] border-2 border-b-[6px] border-brand-300 bg-brand-100 p-4 font-black text-brand-900 shadow-clay transition-all hover:-translate-y-1 hover:bg-brand-200 active:translate-y-1 active:border-b-2 disabled:opacity-45">
              <RotateCcw size={20} aria-hidden="true" /> Đặt lại
            </button>
            <button type="button" onClick={runProgram} disabled={running || program.length === 0 || won} className="flex items-center justify-center gap-2 rounded-[2rem] border-2 border-b-[6px] border-green-600 bg-green-500 p-4 font-black text-white shadow-clay transition-all hover:-translate-y-1 hover:bg-green-400 active:translate-y-1 active:border-b-2 disabled:opacity-45 text-lg">
              <Play size={24} fill="currentColor" aria-hidden="true" /> CHẠY CODE
            </button>
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
    </>
  )
}
