import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = resolve(scriptDir, '../../../..')
const coursesRoot = join(workspaceRoot, 'courses')
const outputPath = join(
  workspaceRoot,
  'apps/api/prisma/seed/generated/curriculum-content.ts',
)

const normalize = (value) => value.replace(/\s+/g, ' ').trim()

function field(markdown, label) {
  const match = markdown.match(
    new RegExp(`^(?:-\\s*)?\\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'),
  )
  return match ? normalize(match[1]) : ''
}

function tableRows(block) {
  const rows = {}
  for (const line of block.split(/\r?\n/)) {
    if (!line.startsWith('|')) continue
    const cells = line
      .split('|')
      .slice(1, -1)
      .map(normalize)
    if (cells.length < 4) continue
    const label = cells[0]
    if (label.includes('Video')) rows.video = cells.slice(1, 4)
    if (label.includes('Game/Tương tác')) rows.game = cells.slice(1, 4)
    if (label.includes('Bài tập thực hành')) rows.practice = cells.slice(1, 4)
    if (label.includes('Kiểm tra nhanh')) rows.check = cells.slice(1, 4)
  }
  return rows
}

function rubricItems(markdown) {
  const match = markdown.match(
    /^\*\*Tiêu chí đánh giá \(rubric\):\*\*\s*\r?\n([\s\S]*?)(?=^\*\*Thời lượng gợi ý:)/m,
  )
  if (!match) return []
  return match[1]
    .split(/\r?\n/)
    .filter((line) => line.startsWith('- '))
    .map((line) => normalize(line.slice(2)))
}

function practiceKind(text, courseKey) {
  const value = text.toLocaleLowerCase('vi')
  if (/ghi âm|quay video|thuyết trình|giới thiệu|trình chiếu|công chiếu/.test(value)) return 'reflect'
  if (/tạo.*chuyển động|đoạn chuyển động|movement prompt|dựng phim|ghép.*(?:video|phim)|chỉnh nhịp phim/.test(value)) return 'video'
  if (/ai.*(?:tạo|vẽ)|tạo (?:hình|ảnh)|bộ hình ảnh/.test(value)) return 'ai_pick'
  if (/bảng màu|chọn.*màu|mood board/.test(value)) return 'palette'
  if (/vẽ phác|phác thảo|storyboard/.test(value)) return 'sketch'
  if (courseKey === 'K4' && /khung|comic|truyện tranh|bubble|thoại/.test(value)) return 'comic'
  if (/nhân vật|character card|character bible/.test(value)) return 'character'
  if (/kịch bản|cốt truyện|dàn ý|outline|story/.test(value)) return 'story'
  if (/chọn|kéo|sắp xếp|ghép/.test(value)) return 'drag'
  return 'journal'
}

function gameType(text) {
  const value = text.toLocaleLowerCase('vi')
  if (/vòng quay|quay/.test(value)) return 'spin'
  if (/kéo-thả|kéo thả|sắp xếp|xếp.*thứ tự/.test(value)) return 'order'
  if (/ghép|nối/.test(value)) return 'match'
  if (/tìm|bắt lỗi|đoán|đố|phát hiện/.test(value)) return 'detective'
  return 'pick'
}

function gameCards(text, objective) {
  const groups = []
  for (const match of text.matchAll(/'([^']+)'/g)) groups.push(match[1])
  for (const match of text.matchAll(/\(([^)]+)\)/g)) groups.push(match[1])
  const colon = text.includes(':') ? text.slice(text.indexOf(':') + 1) : ''
  if (colon) groups.push(colon)

  let cards = groups
    .flatMap((group) => group.split(/\s*(?:→|\+|\/|,|;|\bhoặc\b)\s*/iu))
    .map((card) => normalize(card.replace(/^[-–—\d.]+\s*/, '')))
    .filter((card) => card.length >= 2 && card.length <= 64)
    .filter((card, index, all) => all.indexOf(card) === index)
    .slice(0, 6)
  if (cards.length < 2) {
    cards = text
      .replace(/^[^:]{0,32}:\s*/, '')
      .split(/\s*(?:,|;|\bvà\b|\bhoặc\b|\brồi\b)\s*/iu)
      .map((card) => normalize(card.replace(/^[-–—\d.]+\s*/, '')))
      .filter((card) => card.length >= 2 && card.length <= 64)
      .filter((card, index, all) => all.indexOf(card) === index)
      .slice(0, 6)
  }
  if (cards.length < 2) {
    const fallback = [text, objective]
      .map((card) => normalize(card).slice(0, 64))
      .filter((card, index, all) => card.length >= 2 && all.indexOf(card) === index)
    cards = [...cards, ...fallback]
      .filter((card, index, all) => all.indexOf(card) === index)
      .slice(0, 6)
  }
  return cards
}

function parseCourse(filePath, markdown) {
  const fileName = filePath.split(/[\\/]/).at(-1)
  const identity = fileName.match(/^(L[12])_(K[1-6])_/)
  if (!identity) throw new Error(`Không đọc được track/courseKey: ${filePath}`)
  const [, track, courseKey] = identity
  const titleMatch = markdown.match(/^# .+?—\s*K[1-6]:\s*(.+)$/m)
  const stageTwoAt = markdown.search(/^## .*GIAI ĐOẠN 2/m)
  if (!titleMatch || stageTwoAt < 0) {
    throw new Error(`Thiếu tiêu đề hoặc GIAI ĐOẠN 2: ${filePath}`)
  }

  const lessonPattern = /^#### Bài ([0-9]+\.[0-9]+)\s+—\s+(.+)$/gm
  const headings = [...markdown.matchAll(lessonPattern)]
  const lessons = headings.map((heading, index) => {
    const start = heading.index
    const end = headings[index + 1]?.index ?? markdown.indexOf('\n## 🏁', start)
    const block = markdown.slice(start, end < 0 ? markdown.length : end)
    const rows = tableRows(block)
    for (const required of ['video', 'game', 'practice', 'check']) {
      if (!rows[required]) {
        throw new Error(`Bài ${heading[1]} thiếu trạm ${required}: ${filePath}`)
      }
    }
    const objective = field(block, 'Mục tiêu học tập')
    const product = field(block, 'Sản phẩm của bài')
    if (!objective || !product) {
      throw new Error(`Bài ${heading[1]} thiếu mục tiêu/sản phẩm: ${filePath}`)
    }
    return {
      code: heading[1],
      title: normalize(heading[2]),
      objective,
      product,
      stage: start < stageTwoAt ? 'ideate' : 'produce',
      practiceKind: practiceKind(rows.practice[0], courseKey),
      video: {
        content: rows.video[0],
        objective: rows.video[1],
        duration: rows.video[2],
      },
      game: {
        content: rows.game[0],
        objective: rows.game[1],
        duration: rows.game[2],
        gameType: gameType(rows.game[0]),
        gameConfig: { cards: gameCards(rows.game[0], rows.game[1]) },
      },
      practice: {
        content: rows.practice[0],
        objective: rows.practice[1],
        duration: rows.practice[2],
      },
      check: {
        content: rows.check[0],
        objective: rows.check[1],
        duration: rows.check[2],
      },
    }
  })

  return {
    track,
    courseKey,
    title: normalize(titleMatch[1]),
    product: field(markdown, 'Sản phẩm đầu ra cuối khoá'),
    finalTest: normalize(
      markdown.match(/^## 🏁 Bài Test Cuối Khoá\s*—\s*(.+)$/m)?.[1] ?? '',
    ),
    rubric: rubricItems(markdown),
    badge: field(markdown, 'Huy hiệu hoàn thành'),
    source: relative(workspaceRoot, filePath).replaceAll('\\', '/'),
    lessons,
  }
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await markdownFiles(path)))
    else if (entry.name.endsWith('.md')) files.push(path)
  }
  return files
}

const files = await markdownFiles(coursesRoot)
const courses = []
for (const file of files) {
  courses.push(parseCourse(file, await readFile(file, 'utf8')))
}
courses.sort((a, b) => `${a.track}-${a.courseKey}`.localeCompare(`${b.track}-${b.courseKey}`))

const counts = Object.fromEntries(courses.map((course) => [`${course.track}-${course.courseKey}`, course.lessons.length]))
const expected = {
  'L1-K1': 8, 'L1-K2': 8, 'L1-K3': 8, 'L1-K4': 8, 'L1-K5': 8, 'L1-K6': 10,
  'L2-K1': 16, 'L2-K2': 16, 'L2-K3': 16, 'L2-K4': 16, 'L2-K5': 16, 'L2-K6': 16,
}
if (courses.length !== 12 || JSON.stringify(counts) !== JSON.stringify(expected)) {
  throw new Error(`Giáo trình không đủ 12 khóa/146 bài: ${JSON.stringify(counts)}`)
}
if (courses.some((course) => course.rubric.length < 3)) {
  throw new Error('Mỗi khóa học phải có ít nhất 3 tiêu chí đánh giá cuối khóa.')
}

const banner = `/**\n * AUTO-GENERATED from the 12 markdown files in the workspace course library.\n * Run: node apps/api/prisma/scripts/generate-curriculum-content.mjs\n * Do not edit this file by hand.\n */\n`
await mkdir(dirname(outputPath), { recursive: true })
await writeFile(
  outputPath,
  `${banner}export const curriculumContent = ${JSON.stringify(courses, null, 2)} as const\n`,
  'utf8',
)
console.log(`Generated ${courses.length} courses / ${courses.reduce((sum, c) => sum + c.lessons.length, 0)} lessons`)
