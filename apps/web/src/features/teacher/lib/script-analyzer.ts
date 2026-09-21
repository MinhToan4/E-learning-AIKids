/**
 * script-analyzer.ts
 * AIKids Course & Script Analysis Engine
 *
 * Nhiệm vụ:
 * 1. Phân tích kịch bản bài học: trích xuất thực thể (nhân vật, bối cảnh).
 * 2. Phân loại nhân vật quen thuộc (Mèo AIKI, Zico, Sonet) vs Nhân vật mới (Bé Bo, Robot Pi...).
 * 3. Tự động sinh prompt tiếng Việt chuẩn 2D Flat Soft Clay trên nền trơn studio pastel cho nhân vật mới.
 * 4. Phân loại bối cảnh quen thuộc vs Bối cảnh mới (gom cụm tối đa 2-3 bối cảnh góc rộng).
 * 5. Phân rã Trạm học chuẩn 4 pha AIKids: Khám phá, Trò chơi, Sáng tạo, Thử tài.
 * 6. Tự động đánh dấu skipGeneration cho cảnh AIKI chào đầu.
 * 7. Tự động đánh dấu hasTextPlaceholder cho cảnh có kiến thức trọng tâm/câu hỏi/tiêu đề.
 * 8. Ấn định thiết bị công nghệ cụ thể (tablet_pastel_blue hoặc laptop_silver), không dùng từ 'hoặc'.
 */

import type { LearnCardDraft, CheckQuestion } from './authoring'

export interface ScriptEntity {
  id: string
  name: string
  role?: string
  isPreset: boolean
  status: 'ready' | 'needs_art'
  promptVi?: string
  description?: string
  avatarUrl?: string
}

export interface ScriptBackground {
  id: string
  name: string
  isPreset: boolean
  status: 'ready' | 'needs_art'
  promptVi?: string
  description?: string
  imageUrl?: string
}

export interface ScriptScene {
  id: string
  name: string
  character: string
  background: string
  action: string
  dialogue: string
  skipGeneration: boolean
  hasTextPlaceholder: boolean
  techDevice?: 'tablet_pastel_blue' | 'laptop_silver' | 'none'
  visualPromptVi: string
}

export interface GeneratedStationDraft {
  id: string
  title: string
  skill: string
  hook: string
  duration: string
  reward: string
  gameType: string
  gameInstruction: string
  practiceKind: string
  practiceInstruction: string
  product: string
  learnCards: LearnCardDraft[]
  checkQuestions: CheckQuestion[]
  scenes: ScriptScene[]
}

export interface ScriptAnalysisResult {
  courseTitle: string
  courseDescription: string
  knownCharacters: ScriptEntity[]
  newCharacters: ScriptEntity[]
  knownBackgrounds: ScriptBackground[]
  newBackgrounds: ScriptBackground[]
  stations: GeneratedStationDraft[]
  rawScriptSummary: string
}

// ── Từ điển Nhân vật Quen thuộc AIKids (Presets) ─────────────────
export const PRESET_CHARACTERS: ScriptEntity[] = [
  {
    id: 'char-aki',
    name: 'Mèo AIKI',
    role: 'Linh vật dẫn dắt học tập AI',
    isPreset: true,
    status: 'ready',
    avatarUrl: '/assets/mascot/aki-clay.png',
    description: 'Mèo robot AI màu cam thân thiện, mắt to tròn lấp lánh, phong cách 2D Soft Clay.',
  },
  {
    id: 'char-zico',
    name: 'Bé Zico',
    role: 'Bạn học tò mò, khám phá',
    isPreset: true,
    status: 'ready',
    avatarUrl: '/assets/avatars/zico.png',
    description: 'Cậu bé 7 tuổi áo cam năng động, hiếu kỳ với máy tính và công nghệ.',
  },
  {
    id: 'char-sonet',
    name: 'Cô Sonet',
    role: 'Bạn học thông thái, cẩn thận',
    isPreset: true,
    status: 'ready',
    avatarUrl: '/assets/avatars/sonet.png',
    description: 'Cô bé thông thái đeo kính tròn nhỏ, áo xanh da trời, thích ghi chép và đọc sách.',
  },
]

// ── Từ điển Bối cảnh Quen thuộc AIKids (Presets) ──────────────────
export const PRESET_BACKGROUNDS: ScriptBackground[] = [
  {
    id: 'bg-class',
    name: 'Lớp học AI',
    isPreset: true,
    status: 'ready',
    description: 'Phòng học tương tác thông minh với bảng chiếu holographic, bàn ghế bo cong pastel.',
  },
  {
    id: 'bg-computer-lab',
    name: 'Phòng máy tính',
    isPreset: true,
    status: 'ready',
    description: 'Phòng thực hành máy tính trẻ em với màn hình rộng, bàn phím màu sắc và góc sáng tự nhiên.',
  },
  {
    id: 'bg-apple-forest',
    name: 'Rừng táo',
    isPreset: true,
    status: 'ready',
    description: 'Khu vườn kỳ diệu tươi mát với những cây táo sai trĩu quả của Mèo AIKI.',
  },
  {
    id: 'bg-cozy-desk',
    name: 'Góc học tập ấm cúng',
    isPreset: true,
    status: 'ready',
    description: 'Bàn học nhỏ xinh cạnh cửa sổ đón nắng ấm, giá sách và đèn học màu pastel.',
  },
]

// ── Hàm sinh Prompt Nhân vật Mới ─────────────────────────────────
export function generateNewCharacterPromptVi(name: string): string {
  return `Nhân vật ${name}, phong cách 2D Flat Soft Clay: bo cong mềm mại, ấm áp, trên nền trơn studio pastel sáng sủa, biểu cảm thân thiện đáng yêu, góc nhìn chính diện toàn thân, có nhãn tên '${name}' ở bên dưới chân để nhận diện.`
}

// ── Hàm sinh Prompt Bối cảnh Mới ─────────────────────────────────
export function generateNewBackgroundPromptVi(name: string): string {
  return `Bối cảnh ${name}, phong cách 2D Soft Clay nghệ thuật đất sét mềm mại, góc rộng thoáng đãng (wide shot), không gian rộng mở đón ánh sáng tự nhiên ấm áp, màu sắc pastel hài hòa, không có chi tiết gây rối mắt, chừa khoảng trống cho nhân vật hoạt động.`
}

// ── Hàm nhận diện Nhân vật ───────────────────────────────────────
function matchPresetCharacter(name: string): ScriptEntity | null {
  const norm = name.trim().toLowerCase()
  if (norm.includes('aki') || norm.includes('aiki') || norm.includes('mèo aki')) {
    return PRESET_CHARACTERS[0]
  }
  if (norm.includes('zico') || norm.includes('bé zico')) {
    return PRESET_CHARACTERS[1]
  }
  if (norm.includes('sonet') || norm.includes('cô sonet') || norm.includes('bé sonet')) {
    return PRESET_CHARACTERS[2]
  }
  return null
}

function matchPresetBackground(text: string): ScriptBackground | null {
  const norm = text.trim().toLowerCase()
  if (norm.includes('lớp học ai') || norm.includes('lớp học thông minh') || norm.includes('lớp học')) {
    return PRESET_BACKGROUNDS[0]
  }
  if (norm.includes('phòng máy tính') || norm.includes('phòng thực hành ai') || norm.includes('phòng lab')) {
    return PRESET_BACKGROUNDS[1]
  }
  if (norm.includes('rừng táo') || norm.includes('vườn táo')) {
    return PRESET_BACKGROUNDS[2]
  }
  if (norm.includes('góc học tập') || norm.includes('góc học tập ấm cúng') || norm.includes('bàn học')) {
    return PRESET_BACKGROUNDS[3]
  }
  return null
}

// Từ khóa các bối cảnh tiềm năng mới
const BACKGROUND_CANDIDATES = [
  'Công viên kỳ diệu',
  'Thành phố tương lai',
  'Trạm vũ trụ AI',
  'Thư viện thần tiên',
  'Bãi biển ngập nắng',
  'Nông trại thông minh',
  'Nhà bếp sắc màu',
  'Sân trường rực rỡ',
]

/**
 * Trích xuất danh sách nhân vật xuất hiện trong văn bản
 */
function extractCharacterNames(scriptText: string): string[] {
  const names = new Set<string>()

  // 1. Quét theo cú pháp thoại: "Tên: Lời thoại"
  const dialogueRegex = /(?:^|\n)\s*([A-Za-z0-9_\u00C0-\u024F\u1EA0-\u1EF9\s]{2,25})[:：]\s*(.+)/g
  let match: RegExpExecArray | null
  while ((match = dialogueRegex.exec(scriptText)) !== null) {
    const raw = match[1].trim()
    // Lọc bỏ các từ header như "Trạm 1", "Phân cảnh", "Ghi chú", "Bước 1"
    if (!/^(trạm|bài|phần|cảnh|phân cảnh|ghi chú|bước|lưu ý|yêu cầu)\s*\d*/i.test(raw)) {
      names.add(raw)
    }
  }

  // 2. Quét các tiền tố nhân vật quen thuộc: Bé X, Robot Y, Bạn Z
  const prefixRegex = /\b(Bé|Bạn|Robot|Chú|Bác|Cô|Thỏ|Sóc|Mèo)\s+([A-Z\u00C0-\u024F\u1EA0-\u1EF9][a-z\u00C0-\u024F\u1EA0-\u1EF9]+(?:\s+[A-Z\u00C0-\u024F\u1EA0-\u1EF9][a-z\u00C0-\u024F\u1EA0-\u1EF9]+)?)/g
  while ((match = prefixRegex.exec(scriptText)) !== null) {
    const fullName = `${match[1]} ${match[2]}`.trim()
    names.add(fullName)
  }

  // 3. Quét các tên linh vật cốt lõi nếu xuất hiện trong văn bản
  if (/mèo\s*aki|aki\b|aiki\b/i.test(scriptText)) names.add('Mèo AIKI')
  if (/zico\b/i.test(scriptText)) names.add('Bé Zico')
  if (/sonet\b/i.test(scriptText)) names.add('Cô Sonet')

  return Array.from(names)
}

/**
 * Trích xuất và gom cụm bối cảnh
 */
function extractBackgrounds(scriptText: string): { known: ScriptBackground[]; newBgs: ScriptBackground[] } {
  const knownBgs = new Map<string, ScriptBackground>()
  const newBgs = new Map<string, ScriptBackground>()

  // Kiểm tra từng bối cảnh preset
  PRESET_BACKGROUNDS.forEach((bg) => {
    const regex = new RegExp(bg.name.replace(/\s+/g, '\\s*'), 'i')
    if (regex.test(scriptText) || (bg.id === 'bg-class' && /lớp\s*học/i.test(scriptText))) {
      knownBgs.set(bg.id, bg)
    }
  })

  // Nếu trong kịch bản có đề cập các bối cảnh khác
  BACKGROUND_CANDIDATES.forEach((candidate) => {
    const kw = candidate.split(' ')[0]
    if (new RegExp(kw, 'i').test(scriptText)) {
      const id = `bg-new-${candidate.toLowerCase().replace(/\s+/g, '-')}`
      newBgs.set(id, {
        id,
        name: candidate,
        isPreset: false,
        status: 'needs_art',
        promptVi: generateNewBackgroundPromptVi(candidate),
        description: `Bối cảnh ${candidate} được AIKids phát hiện từ kịch bản.`,
      })
    }
  })

  // Bắt các dòng "Bối cảnh: ..." hoặc "Địa điểm: ..."
  const locationRegex = /(?:bối cảnh|địa điểm|khung cảnh|nơi diễn ra)[:：]\s*([^\n.,;]+)/gi
  let match: RegExpExecArray | null
  while ((match = locationRegex.exec(scriptText)) !== null) {
    const locName = match[1].trim()
    const preset = matchPresetBackground(locName)
    if (preset) {
      knownBgs.set(preset.id, preset)
    } else if (locName.length > 2 && locName.length < 50) {
      const id = `bg-new-${encodeURIComponent(locName.toLowerCase())}`
      if (!newBgs.has(id)) {
        newBgs.set(id, {
          id,
          name: locName,
          isPreset: false,
          status: 'needs_art',
          promptVi: generateNewBackgroundPromptVi(locName),
          description: `Bối cảnh tùy chỉnh "${locName}" từ kịch bản bài học.`,
        })
      }
    }
  }

  // Luôn đảm bảo có ít nhất 1 bối cảnh (mặc định Lớp học AI nếu trống)
  if (knownBgs.size === 0 && newBgs.size === 0) {
    knownBgs.set(PRESET_BACKGROUNDS[0].id, PRESET_BACKGROUNDS[0])
  }

  // Gom cụm tối đa 2-3 bối cảnh mới
  const cappedNewBgs = Array.from(newBgs.values()).slice(0, 3)

  return {
    known: Array.from(knownBgs.values()),
    newBgs: cappedNewBgs,
  }
}

/**
 * Phân tích các phân cảnh và cấu hình video/visual
 */
function parseScenes(rawLines: string[], allBgs: string[]): ScriptScene[] {
  const scenes: ScriptScene[] = []
  const defaultBg = allBgs[0] || 'Lớp học AI'

  let sceneCount = 0

  for (const line of rawLines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const dialogueMatch = trimmed.match(/^([A-Za-z0-9_\u00C0-\u024F\u1EA0-\u1EF9\s]+)[:：]\s*(.+)$/)
    const speaker = dialogueMatch ? dialogueMatch[1].trim() : 'Mèo AIKI'
    const speech = dialogueMatch ? dialogueMatch[2].trim() : trimmed

    sceneCount++
    const sceneId = `scene-${sceneCount}`

    // 1. Cảnh AIKI chào đầu: Tự động skipGeneration (đã có intro video sẵn)
    const isAkiGreeting = (
      /aiki|aki/i.test(speaker) &&
      sceneCount <= 2 &&
      /(xin chào|chào các bạn|chào mừng|hello|tớ là aiki|tớ là aki|mình là aiki|mình là aki)/i.test(speech)
    )

    // 2. Cảnh có kiến thức trọng tâm/câu hỏi/tiêu đề: hasTextPlaceholder = true
    const hasTextPlaceholder = (
      /(quy tắc|chú ý|lưu ý|câu đố|đố bạn|nhớ nhé|bản cam kết|định nghĩa|\?|hỏi)/i.test(speech) ||
      /(bước|nguyên tắc|bí kíp|công thức)/i.test(speech)
    )

    // 3. Ấn định thiết bị công nghệ: tablet_pastel_blue hoặc laptop_silver (tuyệt đối không dùng từ 'hoặc')
    let techDevice: 'tablet_pastel_blue' | 'laptop_silver' | 'none' = 'none'
    const lowerSpeech = speech.toLowerCase()
    if (lowerSpeech.includes('màn hình cảm ứng') || lowerSpeech.includes('chạm') || lowerSpeech.includes('vẽ') || lowerSpeech.includes('ipad') || lowerSpeech.includes('tablet') || lowerSpeech.includes('máy tính bảng')) {
      techDevice = 'tablet_pastel_blue'
    } else if (lowerSpeech.includes('máy tính') || lowerSpeech.includes('laptop') || lowerSpeech.includes('gõ') || lowerSpeech.includes('bàn phím') || lowerSpeech.includes('lập trình') || lowerSpeech.includes('viết prompt')) {
      techDevice = 'laptop_silver'
    }

    // Chọn bối cảnh cho cảnh
    const matchedBg = allBgs.find((bg) => speech.toLowerCase().includes(bg.toLowerCase())) || defaultBg

    // Tạo visual prompt chi tiết cho phân cảnh
    const promptParts = [
      `Phân cảnh bài học: ${speaker} đang ${techDevice !== 'none' ? `sử dụng ${techDevice === 'tablet_pastel_blue' ? 'máy tính bảng tablet pastel blue' : 'laptop màu bạc silver'}` : 'tương tác vui vẻ'}`,
      `trong ${matchedBg}`,
      `phong cách 2D Soft Clay bo cong mềm mại, ánh sáng studio ấm áp`,
    ]
    if (hasTextPlaceholder) {
      promptParts.push('chừa góc trống negative space lớn để chèn chữ và tiêu đề đồ họa')
    }
    const visualPromptVi = promptParts.join(', ') + '.'

    scenes.push({
      id: sceneId,
      name: `Cảnh ${sceneCount}: ${speaker}`,
      character: speaker,
      background: matchedBg,
      action: techDevice !== 'none' ? `Thao tác trên ${techDevice}` : 'Giao tiếp sinh động',
      dialogue: speech,
      skipGeneration: isAkiGreeting,
      hasTextPlaceholder,
      techDevice,
      visualPromptVi,
    })
  }

  return scenes
}

/**
 * Phân tích kịch bản và bẻ thành các Trạm học 4 pha
 */
export function analyzeLessonScript(
  scriptText: string,
  options?: { selectedCharacterIds?: string[] }
): ScriptAnalysisResult {
  const trimmed = scriptText.trim()
  if (!trimmed) {
    throw new Error('Vui lòng cung cấp nội dung kịch bản để phân tích.')
  }

  // 1. Trích xuất Thực thể: Nhân vật
  const rawCharNames = extractCharacterNames(trimmed)
  const knownCharsMap = new Map<string, ScriptEntity>()
  const newCharsMap = new Map<string, ScriptEntity>()

  // Đưa các nhân vật đã chọn sẵn từ preset vào danh sách
  if (options?.selectedCharacterIds && options.selectedCharacterIds.length > 0) {
    options.selectedCharacterIds.forEach((cId) => {
      const preset = PRESET_CHARACTERS.find((c) => c.id === cId)
      if (preset) {
        knownCharsMap.set(preset.id, preset)
      }
    })
  }

  // Luôn đưa Mèo AIKI vào nếu kịch bản có yếu tố bài giảng
  const akiPreset = PRESET_CHARACTERS[0]

  rawCharNames.forEach((name) => {
    const preset = matchPresetCharacter(name)
    if (preset) {
      knownCharsMap.set(preset.id, preset)
    } else {
      // Nhân vật mới
      const cleanName = name.trim()
      if (cleanName.length >= 2) {
        const id = `char-${encodeURIComponent(cleanName.toLowerCase().replace(/\s+/g, '-'))}`
        if (!newCharsMap.has(id)) {
          newCharsMap.set(id, {
            id,
            name: cleanName,
            role: 'Nhân vật câu chuyện mới',
            isPreset: false,
            status: 'needs_art',
            promptVi: generateNewCharacterPromptVi(cleanName),
            description: `Nhân vật mới "${cleanName}" trong kịch bản, cần tạo hình 2D Soft Clay.`,
          })
        }
      }
    }
  })

  // Nếu danh sách quen thuộc chưa có AIKI mà kịch bản nhắc đến thì thêm AIKI
  if (!knownCharsMap.has('char-aki')) {
    knownCharsMap.set('char-aki', akiPreset)
  }

  // 2. Trích xuất Thực thể: Bối cảnh
  const { known: knownBackgrounds, newBgs: newBackgrounds } = extractBackgrounds(trimmed)
  const allBgNames = [...knownBackgrounds.map((b) => b.name), ...newBackgrounds.map((b) => b.name)]

  // 3. Phân tách kịch bản thành các Trạm học
  // Phân chia theo header "Trạm X" hoặc "Bài X" hoặc chia đều theo đoạn
  const stationSections = trimmed.split(/(?:^|\n)(?=(?:trạm|bài|chương|phần)\s*\d+[:：\s])/i).filter((s) => s.trim().length > 0)

  // Tiêu đề khóa học mặc định trích từ dòng đầu hoặc tiêu đề
  const firstLine = trimmed.split('\n')[0].replace(/^[#\s*]+/, '').trim()
  const courseTitle = firstLine.length < 50 ? firstLine : 'Hành Trình Khám Phá AI Diệu Kỳ'
  const courseDescription = `Khóa học được sinh tự động từ kịch bản: "${courseTitle}". Gồm các trạm học tương tác 4 pha chuẩn AIKids.`

  const stations: GeneratedStationDraft[] = []

  const sectionsToProcess = stationSections.length > 1
    ? stationSections
    : [
        `Trạm 1: Khám phá thế giới AI\n${trimmed.slice(0, Math.floor(trimmed.length / 2))}`,
        `Trạm 2: Bí kíp Hiệp Sĩ Thông Thái\n${trimmed.slice(Math.floor(trimmed.length / 2))}`,
      ]

  sectionsToProcess.forEach((sec, idx) => {
    const stationIndex = idx + 1
    const lines = sec.split('\n').map((l) => l.trim()).filter(Boolean)
    const titleLine = lines[0] || `Trạm ${stationIndex}: Khám Phá Cùng Mèo AIKI`
    const cleanStationTitle = titleLine.replace(/^(?:trạm|bài|chương|phần)\s*\d+[:：\s]*/i, '').trim() || `Trạm ${stationIndex}`

    const scenes = parseScenes(lines.slice(1), allBgNames)

    // Sinh 5 LearnCards chuẩn AIKI 5-steps:
    // 1. Tình huống, 2. Câu đố AIKI, 3. Quy tắc Vàng, 4. Giải thích, 5. Bản Cam Kết
    const learnCards: LearnCardDraft[] = [
      {
        id: `aiki-rule-situation-${stationIndex}`,
        title: `1. Tình huống: Chuyện gì đang xảy ra?`,
        body: lines[1] || `Mèo AIKI cùng các bạn nhỏ gặp một tình huống thú vị về công nghệ và trí tuệ nhân tạo.`,
        tip: 'Quan sát thật kỹ hành động của các bạn trong tình huống nhé!',
        kind: 'situation',
        layout: 'split',
        visualItems: [{ label: 'Tình huống mở đầu', text: 'Tình huống mở đầu', tone: 'sky' }],
        imageUrl: '/assets/lessons/situation-default.png',
        imageAlt: 'Tình huống mở đầu',
      },
      {
        id: `aiki-rule-riddle-${stationIndex}`,
        title: `2. Câu đố AIKI: Thử tài suy đoán`,
        body: lines[2] || `Theo em, trong tình huống trên thì cách xử lý nào là thông minh và an toàn nhất?`,
        tip: 'Hãy suy nghĩ trước khi đưa ra câu trả lời nhé!',
        kind: 'aiki-riddle',
        layout: 'visual-grid',
        visualItems: [{ label: 'Câu đố tư duy', text: 'Đố vui tư duy', tone: 'sun' }],
      },
      {
        id: `aiki-rule-rule-${stationIndex}`,
        title: `3. Quy tắc Vàng: Bí kíp AIKids`,
        body: `Quy tắc Vàng số ${stationIndex}: Luôn kiểm tra kỹ thông tin từ AI và hỏi ý kiến thầy cô hoặc cha mẹ trước khi chia sẻ dữ liệu quan trọng!`,
        tip: 'Ghi nhớ quy tắc này để trở thành Hiệp Sĩ AI thông thái!',
        kind: 'rule',
        layout: 'text',
        visualItems: [{ label: 'Quy tắc cốt lõi', text: 'Quy tắc quan trọng', tone: 'mint' }],
      },
      {
        id: `aiki-rule-explanation-${stationIndex}`,
        title: `4. Giải thích: Vì sao lại như vậy?`,
        body: `Trí tuệ nhân tạo rất giỏi nhưng vẫn có thể nhầm lẫn. Bộ não sáng tạo và trái tim nhân ái của con người mới là người làm chủ công nghệ.`,
        tip: 'Công nghệ là công cụ, chúng ta là người chỉ huy!',
        kind: 'explanation',
        layout: 'split',
        visualItems: [{ label: 'Giải thích chuyên sâu', text: 'Giải thích dễ hiểu', tone: 'coral' }],
      },
      {
        id: `aiki-rule-closing-${stationIndex}`,
        title: `5. Bản Cam Kết: Lời hứa Hiệp Sĩ`,
        body: `Tớ cam kết sẽ sử dụng công nghệ an toàn, văn minh và luôn sáng tạo điều tốt đẹp mỗi ngày!`,
        tip: 'Hãy cùng dơ tay cam kết cùng Mèo AIKI nào!',
        kind: 'closing',
        layout: 'text',
        visualItems: [{ label: 'Cam kết hành động', text: 'Cam kết hành động', tone: 'brand' }],
      },
    ]

    // Câu hỏi trắc nghiệm kiểm tra
    const checkQuestions: CheckQuestion[] = [
      {
        id: `chk-q-${stationIndex}-1`,
        prompt: `Khi gặp một thông tin mới do AI tạo ra, em nên làm gì đầu tiên?`,
        options: [
          'Kiểm tra lại và hỏi người lớn tin cậy',
          'Chia sẻ ngay cho tất cả mọi người',
          'Tin tưởng 100% không cần kiểm tra',
        ],
        answer: 0,
        explain: 'Thông tin từ AI cần được kiểm chứng cẩn thận để đảm bảo tính chính xác và an toàn.',
        mee: {
          readText: 'Hãy chọn đáp án đúng nhất nhé bạn nhỏ!',
          strategy: 'Khuyến khích bé tư duy phản biện',
          hints: ['Em có nên vội vàng tin ngay không?', 'Người lớn đáng tin cậy sẽ giúp em kiểm tra.'],
          gesture: 'think',
          autoRead: true,
        },
      },
      {
        id: `chk-q-${stationIndex}-2`,
        prompt: `Theo Quy tắc Vàng vừa học, ai là người làm chủ công nghệ?`,
        options: [
          'Con người thông minh và nhân ái',
          'Máy tính và robot AI',
          'Không có ai cả',
        ],
        answer: 0,
        explain: 'Chính con người là người sáng tạo và làm chủ công nghệ vì mục đích tốt đẹp.',
        mee: {
          readText: 'Ai mới là người chỉ huy thật sự nào?',
          strategy: 'Củng cố lòng tự tin và tính chủ động của trẻ',
          hints: ['Máy tính có tự ra quyết định cho em được không?'],
          gesture: 'celebrate',
          autoRead: true,
        },
      },
    ]

    // Chọn gameType đề xuất luân phiên
    const gameEngines = ['data-runner', 'truth-patrol', 'battle-math', 'blockly']
    const selectedGame = gameEngines[(stationIndex - 1) % gameEngines.length]

    stations.push({
      id: `station-${stationIndex}`,
      title: cleanStationTitle,
      skill: 'Tư duy phản biện & Sáng tạo AI',
      hook: `Cùng Mèo AIKI khám phá bí mật của ${cleanStationTitle} nào!`,
      duration: '15 phút',
      reward: '50 XP · 1 Sao Hiệp Sĩ',
      gameType: selectedGame,
      gameInstruction: 'Tham gia trò chơi tương tác vượt chướng ngại vật để thu thập các từ khóa quan trọng.',
      practiceKind: 'journal',
      practiceInstruction: 'Vẽ một bức tranh hoặc viết 1 lời nhắn gửi tới Mèo AIKI về điều em vừa học được hôm nay.',
      product: 'Nhật ký Hiệp Sĩ AI nhí',
      learnCards,
      checkQuestions,
      scenes,
    })
  })

  return {
    courseTitle,
    courseDescription,
    knownCharacters: Array.from(knownCharsMap.values()),
    newCharacters: Array.from(newCharsMap.values()),
    knownBackgrounds,
    newBackgrounds,
    stations,
    rawScriptSummary: `Đã phân tích ${trimmed.length} ký tự, nhận diện ${knownCharsMap.size} nhân vật quen thuộc, ${newCharsMap.size} nhân vật mới, ${knownBackgrounds.length} bối cảnh quen thuộc, ${newBackgrounds.length} bối cảnh mới và cấu trúc thành ${stations.length} trạm học.`,
  }
}
