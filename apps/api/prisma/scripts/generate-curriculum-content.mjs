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
  if (
    /kéo-thả|kéo thả|sắp xếp|xếp.*thứ tự/.test(value) &&
    orderedCards(text).length >= 3
  ) return 'order'
  if (/ghép|nối/.test(value)) return 'match'
  if (/tìm|bắt lỗi|đoán|đố|phát hiện/.test(value)) return 'detective'
  return 'pick'
}

const emojiChoiceLabels = new Map([
  ['😂', 'Vui'],
  ['😮', 'Bất ngờ'],
  ['❤️', 'Ấm áp'],
  ['❤', 'Ấm áp'],
])

function compactCard(value, maxLength = 56) {
  const clean = normalize(value)
    .replace(/^(?:[-–—]\s*|\d+[.)\]]\s*)/, '')
    .replace(/\s*=\s*/g, ' – ')
    .replace(/^["“”'‘’[(]+|["“”'‘’)\]]+$/g, '')
    .replace(/[,:;–—-]+$/g, '')
    .trim()
  const labelled = emojiChoiceLabels.get(clean) ?? clean
  if (labelled.length <= maxLength) return labelled

  const clipped = labelled.slice(0, maxLength + 1)
  const wordBoundary = clipped.lastIndexOf(' ')
  const shortened = clipped
    .slice(0, wordBoundary >= Math.floor(maxLength * 0.6) ? wordBoundary : maxLength)
    .replace(/[,:;–—-]+$/g, '')
    .trim()
  return `${shortened.slice(0, maxLength - 1).trimEnd()}…`
}

function uniqueSemanticCards(values) {
  return values
    .map((card) => compactCard(card))
    .filter((card) => card.length >= 2 && /[\p{L}\p{N}]/u.test(card))
    .filter((card, index, all) => all.indexOf(card) === index)
}

function orderedCards(text) {
  const sequences = []
  const task = text.includes(':') ? text.slice(text.indexOf(':') + 1) : text
  if (task.includes('→')) sequences.push(task.split(/\s*→\s*/u))
  if (/sắp xếp|xếp.*thứ tự/iu.test(text)) {
    for (const match of text.matchAll(/\(([^)]+)\)/g)) {
      sequences.push(match[1].split(/\s*(?:→|,|;)\s*/u))
    }
  }

  return sequences
    .map((sequence) => uniqueSemanticCards(sequence))
    .find((sequence) => sequence.length >= 3)
    ?.slice(0, 6) ?? []
}

function gameCards(text, objective, lessonTitle, product) {
  const ordered = orderedCards(text)
  if (gameType(text) === 'order') return ordered

  const groups = []
  for (const match of text.matchAll(/'([^']+)'/g)) groups.push(match[1])
  for (const match of text.matchAll(/\[([^\]]+)\]/g)) groups.push(match[1])
  for (const match of text.matchAll(/\(([^)]+)\)/g)) groups.push(match[1])
  const task = text.includes(':') ? text.slice(text.indexOf(':') + 1) : text
  if (groups.length === 0 && (/[→+,;]/u.test(task) || task.includes('/'))) {
    groups.push(task)
  }

  const structured = uniqueSemanticCards(
    groups.flatMap((group) =>
      group.split(/\s*(?:→|\+|\/|,|;|\bhoặc\b)\s*/iu),
    ),
  )
  const contextual = uniqueSemanticCards(
    structured.length >= 3
      ? [compactCard(lessonTitle), compactCard(product), compactCard(objective)]
      : [
          compactCard(task),
          compactCard(objective),
          compactCard(lessonTitle),
          compactCard(product),
        ],
  )

  return [...structured, ...contextual]
    .filter((card, index, all) => all.indexOf(card) === index)
    .slice(0, 6)
}

// Reviewed packs for lessons whose mechanics need structured data rather than
// a flat card list. The copy is derived from the corresponding course file;
// keeping it here makes regeneration deterministic and reviewable.
function reviewedGamePack(track, courseKey, lessonCode) {
  const key = `${track}-${courseKey}-${lessonCode}`
  if (key === 'L1-K1-1.1') {
    return {
      gameType: 'combine',
      groups: [
        {
          label: 'Địa điểm',
          options: ['Rừng phép thuật', 'Đại dương', 'Vũ trụ', 'Vương quốc kẹo'],
        },
        {
          label: 'Cảm giác',
          options: ['Vui', 'Bí ẩn', 'Yên bình'],
        },
        {
          label: 'Điều đặc biệt',
          options: ['Cây phát sáng', 'Đảo bay trên mây', 'Cá biết hát', 'Mưa kẹo cầu vồng'],
        },
      ],
    }
  }
  if (key === 'L1-K1-1.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mô tả nào giúp con hình dung khu rừng rõ hơn?',
          options: ['Một khu rừng đẹp', 'Khu rừng nhỏ, tối, có cây phát sáng'],
          answerIndex: 1,
          feedback: 'Mô tả B cho biết kích thước, ánh sáng và một chi tiết đặc biệt.',
        },
        {
          prompt: 'Mô tả nào cho con nhiều manh mối hơn?',
          options: ['Đại dương rộng, sáng, có cá biết hát', 'Một đại dương kỳ lạ'],
          answerIndex: 0,
          feedback: 'Mô tả A nói rõ độ rộng, ánh sáng và điều chỉ có ở thế giới này.',
        },
        {
          prompt: 'Nếu phải vẽ ngay, con sẽ chọn mô tả nào?',
          options: ['Một vương quốc kẹo', 'Vương quốc kẹo bé xíu, rực sáng, có cầu bằng đường'],
          answerIndex: 1,
          feedback: 'Mô tả B biến ý tưởng chung thành những chi tiết có thể nhìn thấy và vẽ được.',
        },
      ],
    }
  }
  if (key === 'L1-K1-2.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Vàng cam', right: 'Vui' },
        { left: 'Xanh lam nhạt', right: 'Yên bình' },
        { left: 'Tím đậm', right: 'Bí ẩn' },
      ],
    }
  }
  if (key === 'L1-K1-2.2') {
    return {
      gameType: 'combine',
      groups: [
        {
          label: 'Phần đầu',
          options: ['Tai thỏ', 'Bờm sư tử', 'Mỏ chim', 'Sừng hươu'],
        },
        {
          label: 'Cơ thể hoặc cách di chuyển',
          options: ['Đuôi cá', 'Cánh bướm', 'Chân lò xo', 'Mai rùa'],
        },
      ],
    }
  }
  if (key === 'L1-K1-3.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Yêu cầu: lông tím, hai cánh vàng, đuôi cá. Kết quả nào khớp?',
          options: [
            'Lông tím, hai cánh vàng, đuôi cá',
            'Lông tím, hai cánh xanh, đuôi cá',
          ],
          answerIndex: 0,
          feedback: 'Kết quả A giữ đúng cả màu lông, màu cánh và chiếc đuôi trong yêu cầu.',
        },
        {
          prompt: 'Yêu cầu: sinh vật nhỏ ở đại dương tối. Kết quả nào bị lệch?',
          options: [
            'Sinh vật nhỏ trong đại dương tối',
            'Sinh vật khổng lồ trên bầu trời sáng',
          ],
          answerIndex: 1,
          feedback: 'Kết quả B lệch cả kích thước, nơi ở và ánh sáng so với yêu cầu.',
        },
        {
          prompt: 'Yêu cầu có cây phát sáng. Kết quả nào cần tạo lại?',
          options: [
            'Khu rừng có cây phát sáng',
            'Khu rừng chỉ có cây bình thường',
          ],
          answerIndex: 1,
          feedback: 'Kết quả B làm mất chi tiết đặc biệt nên chưa đúng ý đồ ban đầu.',
        },
      ],
    }
  }
  if (key === 'L1-K1-4.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Tên thế giới', target: 'Bảng tên phía trên' },
        { item: 'Cảnh chính', target: 'Nền bản đồ' },
        { item: 'Sinh vật đặc biệt', target: 'Vùng sinh sống' },
      ],
    }
  }
  if (key === 'L1-K1-4.2') {
    return {
      gameType: 'order',
      cards: ['Tên thế giới', 'Sinh vật đặc biệt', 'Cảm giác chính'],
    }
  }
  if (key === 'L1-K2-1.1') {
    return {
      gameType: 'combine',
      groups: [
        {
          label: 'Nhân vật là',
          // Migrated from the fixed character catalog in the local AIkid app.
          options: ['Con người', 'Con vật', 'Đồ vật', 'Thực vật', 'Robot'],
        },
        {
          label: 'Hình dáng',
          options: ['Tròn trịa', 'Mảnh mai', 'Nhỏ bé', 'Cao lớn', 'Vuông vức'],
        },
      ],
    }
  }
  if (key === 'L1-K2-1.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Hai chú mèo đều màu cam. Chi tiết nào giúp nhận ra Mít ngay?',
          options: ['Mít đeo khăn xanh', 'Mít là một chú mèo'],
          answerIndex: 0,
          feedback: 'Chiếc khăn xanh là dấu hiệu riêng; “một chú mèo” vẫn còn quá chung.',
        },
        {
          prompt: 'Hai robot đều vuông vức. Chi tiết nào làm Bíp khác bạn còn lại?',
          options: ['Bíp là robot', 'Bíp có một ăng-ten hình ngôi sao'],
          answerIndex: 1,
          feedback: 'Ăng-ten hình ngôi sao là chi tiết có thể nhìn thấy và nhận diện nhanh.',
        },
        {
          prompt: 'Chi tiết nào đáng nhớ hơn cho một nhân vật nhỏ bé?',
          options: ['Có chiếc mũ đỏ rất lớn', 'Có một cái đầu'],
          answerIndex: 0,
          feedback: 'Chiếc mũ đỏ lớn tạo tương phản và giúp nhân vật không bị lẫn.',
        },
      ],
    }
  }
  if (key === 'L1-K2-2.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Tò mò', right: 'Mở bản đồ để tìm đường mới' },
        { left: 'Dũng cảm', right: 'Bước lên bảo vệ một người bạn' },
        { left: 'Tốt bụng', right: 'Chia phần bánh của mình cho bạn' },
      ],
    }
  }
  if (key === 'L1-K2-2.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Nhân vật vui nhộn vừa nghĩ ra trò chơi mới. Biểu cảm nào hợp nhất?',
          options: ['Mắt sáng, miệng cười rộng', 'Mắt cụp, miệng mếu'],
          answerIndex: 0,
          feedback: 'Mắt sáng và nụ cười rộng giúp người xem đọc được niềm vui ngay.',
        },
        {
          prompt: 'Nhân vật dũng cảm đang bước vào hang tối. Biểu cảm nào kể đúng tính cách?',
          options: ['Mắt nhìn thẳng, miệng mím quyết tâm', 'Nhắm mắt và quay lưng'],
          answerIndex: 0,
          feedback: 'Ánh mắt thẳng và nét quyết tâm thể hiện hành động dũng cảm.',
        },
        {
          prompt: 'Nhân vật tinh nghịch chuẩn bị một bất ngờ. Biểu cảm nào hợp hơn?',
          options: ['Một bên mắt nháy, miệng cười', 'Khuôn mặt buồn ngủ'],
          answerIndex: 0,
          feedback: 'Cái nháy mắt là tín hiệu rõ cho ý tưởng tinh nghịch.',
        },
      ],
    }
  }
  if (key === 'L1-K2-3.1') {
    return {
      gameType: 'order',
      cards: ['Hình dáng', 'Màu sắc', 'Chi tiết đặc trưng', 'Biểu cảm'],
    }
  }
  if (key === 'L1-K2-3.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mô tả: robot nhỏ, vuông, màu xanh, ăng-ten ngôi sao. Hình nào khớp?',
          options: [
            'Robot nhỏ vuông màu xanh, ăng-ten ngôi sao',
            'Robot cao tròn màu đỏ, không có ăng-ten',
          ],
          answerIndex: 0,
          feedback: 'Hình A giữ đủ hình dáng, kích thước, màu và chi tiết nhận diện.',
        },
        {
          prompt: 'Mô tả: mèo cam đeo khăn xanh, đang cười. Hình nào cần sửa?',
          options: [
            'Mèo cam đeo khăn xanh, đang cười',
            'Mèo cam đeo mũ đỏ, đang khóc',
          ],
          answerIndex: 1,
          feedback: 'Hình B sai cả phụ kiện và biểu cảm nên cần nói rõ phần phải đổi.',
        },
        {
          prompt: 'Chỉ màu áo bị sai. Yêu cầu sửa nào rõ nhất?',
          options: ['Làm lại cho đẹp hơn', 'Giữ nguyên mọi thứ, đổi áo đỏ thành áo vàng'],
          answerIndex: 1,
          feedback: 'Yêu cầu B chỉ rõ phần giữ lại và đúng một thay đổi cần làm.',
        },
      ],
    }
  }
  if (key === 'L1-K2-4.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Tên nhân vật', target: 'Ô tên' },
        { item: 'Hình nhân vật', target: 'Khung chân dung' },
        { item: 'Tính cách và hành động', target: 'Ô mô tả' },
      ],
    }
  }
  if (key === 'L1-K2-4.2') {
    return {
      gameType: 'order',
      cards: [
        'Chào người xem',
        'Nói tên nhân vật',
        'Kể tính cách và hành động',
        'Nêu chi tiết đặc biệt',
      ],
    }
  }
  if (key === 'L1-K3-1.1') {
    return {
      gameType: 'order',
      cards: [
        'Mở đầu: Mít muốn tìm ngôi sao rơi',
        'Bỗng nhiên: cây cầu biến mất',
        'Kết thúc: Mít tìm được đường và trở về',
      ],
    }
  }
  if (key === 'L1-K3-1.2') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Mít', target: 'Ô tên nhân vật' },
        { item: 'Mèo cam đeo khăn xanh', target: 'Khung hình dáng' },
        { item: 'Tò mò và tốt bụng', target: 'Ô tính cách' },
        { item: 'Muốn tìm ngôi sao rơi', target: 'Ô mong muốn' },
      ],
    }
  }
  if (key === 'L1-K3-2.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Câu nào giới thiệu cả nhân vật và điều nhân vật muốn?',
          options: ['Mít là mèo cam. Mít muốn tìm ngôi sao rơi.', 'Ngày xửa ngày xưa.'],
          answerIndex: 0,
          feedback: 'Câu A cho người nghe biết ai là nhân vật chính và mục tiêu của bạn ấy.',
        },
        {
          prompt: 'Mở đầu nào cho thấy tính cách qua hành động?',
          options: ['Bíp rất tò mò.', 'Bíp tò mò mở tấm bản đồ cũ để tìm lối đi mới.'],
          answerIndex: 1,
          feedback: 'Câu B biến từ “tò mò” thành một hành động có thể hình dung.',
        },
        {
          prompt: 'Câu nào tạo được câu hỏi để người nghe muốn biết tiếp?',
          options: ['Na muốn mang hạt giống lên đỉnh núi trước khi trời tối.', 'Na ở trên núi.'],
          answerIndex: 0,
          feedback: 'Mục tiêu và giới hạn thời gian khiến người nghe tự hỏi Na sẽ làm thế nào.',
        },
      ],
    }
  }
  if (key === 'L1-K3-2.2') {
    return {
      gameType: 'combine',
      groups: [
        {
          label: 'Trở ngại',
          options: ['Lạc mất bản đồ', 'Cây cầu bị gãy', 'Cánh cửa bị khóa', 'Cơn mưa kéo đến'],
        },
        {
          label: 'Điều làm khó hơn',
          options: ['Trời sắp tối', 'Bạn đồng hành đang sợ', 'Chỉ còn một cơ hội', 'Dấu vết bị xóa'],
        },
      ],
    }
  }
  if (key === 'L1-K3-3.1') {
    return {
      gameType: 'combine',
      groups: [
        {
          label: 'Bỗng nhiên xuất hiện',
          options: ['Một người bạn tí hon', 'Tấm bản đồ biết nói', 'Cánh cửa bí mật', 'Luồng sáng dẫn đường'],
        },
        {
          label: 'Cách giúp giải quyết',
          options: ['Chỉ ra manh mối', 'Biến thành một chiếc cầu', 'Gọi mọi người hợp sức', 'Cho nhân vật thử lại'],
        },
      ],
    }
  }
  if (key === 'L1-K3-3.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mít tìm lại được ngôi sao cho cả làng. Kết nào tạo cảm giác ấm áp?',
          options: ['Mọi người cùng ngồi dưới ánh sao và ôm Mít thật chặt.', 'Mít bỏ đi mà không nói gì.'],
          answerIndex: 0,
          feedback: 'Hành động quây quần và cái ôm làm cảm xúc ấm áp hiện ra rõ ràng.',
        },
        {
          prompt: 'Bíp làm bánh nhưng chiếc bánh phồng to như quả bóng. Kết nào vui hơn?',
          options: ['Cả nhóm dùng chiếc bánh làm khinh khí cầu.', 'Chiếc bánh nằm trên bàn.'],
          answerIndex: 0,
          feedback: 'Biến tai nạn thành một bất ngờ ngộ nghĩnh giữ đúng giọng vui của chuyện.',
        },
        {
          prompt: 'Na vừa vượt qua chuyến đi khó. Kết nào cho thấy niềm tự hào?',
          options: ['Na nhìn lại con đường và mỉm cười: “Mình đã làm được!”', 'Trời đã tối.'],
          answerIndex: 0,
          feedback: 'Nụ cười và lời nói của Na giúp người nghe đọc được cảm xúc kết.',
        },
      ],
    }
  }
  if (key === 'L1-K3-4.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Dòng nào nhắc người kể dừng lại để tạo bất ngờ?',
          options: ['Mít mở cửa... và một luồng sáng vụt ra!', 'Mít mở cửa và một luồng sáng vụt ra.'],
          answerIndex: 0,
          feedback: 'Dấu ba chấm tạo một nhịp dừng trước chi tiết bất ngờ.',
        },
        {
          prompt: 'Câu hỏi của nhân vật nên được kể thế nào?',
          options: ['Lên giọng ở cuối câu', 'Đọc đều và hạ giọng thật thấp'],
          answerIndex: 0,
          feedback: 'Lên giọng nhẹ ở cuối giúp người nghe nhận ra đây là câu hỏi.',
        },
        {
          prompt: 'Đoạn nhân vật chạy trốn nên có nhịp nào?',
          options: ['Nhanh hơn một chút', 'Chậm và kéo dài mọi từ'],
          answerIndex: 0,
          feedback: 'Nhịp nhanh hơn một chút truyền được cảm giác gấp gáp nhưng vẫn phải rõ lời.',
        },
      ],
    }
  }
  if (key === 'L1-K3-4.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Một cú ngã rất ngộ nghĩnh', right: '😂 Buồn cười' },
        { left: 'Cánh cửa bí mật bật mở', right: '😮 Bất ngờ' },
        { left: 'Hai người bạn ôm nhau', right: '❤️ Ấm áp' },
      ],
    }
  }
  if (key === 'L1-K4-1.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Nhân vật lên đường', right: 'Khung toàn cảnh nơi bắt đầu' },
        { left: 'Nhân vật phát hiện manh mối', right: 'Khung cận cảnh vật quan trọng' },
        { left: 'Hai bạn trò chuyện', right: 'Khung có cả hai nhân vật' },
      ],
    }
  }
  if (key === 'L1-K4-1.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mô tả khung nào ngắn mà vẫn vẽ được?',
          options: ['Mít chạy qua cầu gỗ giữa mưa.', 'Mít chạy và lúc ấy bạn ấy đang rất vội vì có nhiều việc phải làm.'],
          answerIndex: 0,
          feedback: 'Câu A giữ nhân vật, hành động, nơi chốn và thời tiết trong một câu gọn.',
        },
        {
          prompt: 'Mô tả nào chỉ chứa điều nhìn thấy trong một khung?',
          options: ['Na lo rằng ngày mai có thể thất bại.', 'Na ôm tấm bản đồ rách và cau mày.'],
          answerIndex: 1,
          feedback: 'Câu B biến cảm xúc thành dáng điệu và đồ vật có thể vẽ.',
        },
        {
          prompt: 'Khung cuối nên dùng mô tả nào?',
          options: ['Cả nhóm giơ ngôi sao và mỉm cười.', 'Sau đó mọi chuyện tiếp tục diễn ra rất lâu.'],
          answerIndex: 0,
          feedback: 'Câu A cho một khoảnh khắc kết cụ thể thay vì kể một quãng thời gian dài.',
        },
      ],
    }
  }
  if (key === 'L1-K4-2.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Mít thấy cây cầu gãy', right: '“Ôi, mình qua bên kia thế nào đây?”' },
        { left: 'Bíp tìm ra lối bí mật', right: '“Mọi người ơi, đi theo mình!”' },
        { left: 'Na nhận quà từ bạn', right: '“Cảm ơn bạn, mình vui quá!”' },
      ],
    }
  }
  if (key === 'L1-K4-2.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Cánh cửa đóng sầm', right: 'RẦM!' },
        { left: 'Giọt nước rơi xuống hồ', right: 'TÕM!' },
        { left: 'Tên lửa lao vút lên', right: 'VÙ!' },
      ],
    }
  }
  if (key === 'L1-K4-3.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Nhân vật chuẩn: mèo cam, khăn xanh. Khung nào bị lệch?',
          options: ['Mèo cam đeo khăn xanh', 'Mèo xám đeo mũ đỏ'],
          answerIndex: 1,
          feedback: 'Khung B đổi cả màu lông lẫn phụ kiện nhận diện.',
        },
        {
          prompt: 'Bối cảnh chuẩn: phòng có cửa sổ tròn. Khung nào giữ nhất quán?',
          options: ['Căn phòng có cửa sổ tròn', 'Khu rừng có thác nước'],
          answerIndex: 0,
          feedback: 'Khung A giữ đúng dấu hiệu bối cảnh đã thống nhất.',
        },
        {
          prompt: 'Chỉ góc nhìn thay đổi. Chi tiết nào vẫn phải giữ?',
          options: ['Màu sắc và phụ kiện của nhân vật', 'Mọi vật phải đứng đúng một chỗ'],
          answerIndex: 0,
          feedback: 'Góc nhìn có thể đổi, nhưng đặc điểm nhận diện của nhân vật cần giữ.',
        },
      ],
    }
  }
  if (key === 'L1-K4-3.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Chọn hình cho khung 2: Mít chạy qua cầu trong mưa.',
          options: ['Đúng nhân vật, hành động và bối cảnh', 'Đẹp mắt nhưng là nhân vật khác'],
          answerIndex: 0,
          feedback: 'Khớp câu chuyện và giữ nhân vật nhất quán quan trọng hơn chỉ “đẹp”.',
        },
        {
          prompt: 'Hai hình đều đúng. Nên chọn hình nào?',
          options: ['Hình có hành động đọc rõ hơn', 'Chọn ngẫu nhiên để xong nhanh'],
          answerIndex: 0,
          feedback: 'Hành động rõ giúp người xem hiểu khung tranh mà không cần quá nhiều chữ.',
        },
        {
          prompt: 'Không hình nào giữ chiếc khăn xanh. Nên làm gì?',
          options: ['Chọn đại một hình', 'Sửa yêu cầu và tạo lại một lượt'],
          answerIndex: 1,
          feedback: 'Một vòng sửa có chủ đích tốt hơn chấp nhận lỗi làm nhân vật bị đổi.',
        },
      ],
    }
  }
  if (key === 'L1-K4-4.1') {
    return {
      gameType: 'order',
      cards: [
        'Khung 1: Nhân vật lên đường',
        'Khung 2: Gặp trở ngại',
        'Khung 3: Tìm ra cách giải quyết',
        'Khung 4: Kết thúc',
      ],
    }
  }
  if (key === 'L1-K4-4.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Truyện về Mít tìm ngôi sao rơi. Tên nào nói đúng điều đặc biệt?',
          options: ['Một câu chuyện', 'Mít và ngôi sao thất lạc'],
          answerIndex: 1,
          feedback: 'Tên B nêu nhân vật và vật quan trọng nên dễ nhớ hơn.',
        },
        {
          prompt: 'Truyện vui về chiếc bánh bay. Tên nào gợi tò mò?',
          options: ['Chiếc bánh biết bay', 'Chuyện của Bíp'],
          answerIndex: 0,
          feedback: 'Chi tiết chiếc bánh biết bay khiến người đọc muốn mở truyện.',
        },
        {
          prompt: 'Tên tác phẩm nên ưu tiên điều gì?',
          options: ['Ngắn, đúng chuyện và có điểm riêng', 'Càng dài và kể hết mọi việc càng tốt'],
          answerIndex: 0,
          feedback: 'Một tên ngắn, đúng trọng tâm sẽ dễ đọc và dễ nhớ trên bìa.',
        },
      ],
    }
  }
  if (key === 'L1-K5-1.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Bước chân nhanh, bật nhẹ', right: 'Vui và háo hức' },
        { left: 'Bước chậm, vai hạ thấp', right: 'Buồn hoặc mệt' },
        { left: 'Giật mình rồi lùi nhanh', right: 'Sợ hãi' },
      ],
    }
  }
  if (key === 'L1-K5-1.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Robot vuông vức đang vui. Cách di chuyển nào hợp hơn?',
          options: ['Bật từng nhịp chắc và nhanh', 'Trôi mềm như một dải lụa'],
          answerIndex: 0,
          feedback: 'Nhịp bật chắc giữ chất robot, tốc độ nhanh cho thấy niềm vui.',
        },
        {
          prompt: 'Mèo nhỏ đang sợ tiếng động. Chuyển động nào kể rõ cảm xúc?',
          options: ['Hạ thấp người rồi lùi nhẹ', 'Nhảy cao và vẫy tay liên tục'],
          answerIndex: 0,
          feedback: 'Hạ người và lùi lại là những dấu hiệu cơ thể dễ đọc của sự sợ hãi.',
        },
        {
          prompt: 'Nhân vật mạnh mẽ vừa chiến thắng. Chuyển động nào hợp?',
          options: ['Đứng thẳng, giơ tay dứt khoát', 'Thu người và bước thật chậm'],
          answerIndex: 0,
          feedback: 'Dáng đứng mở và động tác dứt khoát truyền được sự tự tin.',
        },
      ],
    }
  }
  if (key === 'L1-K5-2.1') {
    return {
      gameType: 'order',
      cards: ['Ai: Mít', 'Làm gì: chạy qua cầu', 'Cảm xúc: háo hức'],
    }
  }
  if (key === 'L1-K5-2.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Khoảnh khắc nào giàu chuyển động hơn?',
          options: ['Mít ngồi nhìn chiếc cốc', 'Mít chạy qua cầu khi gió thổi mạnh'],
          answerIndex: 1,
          feedback: 'Chạy và gió mạnh tạo hành động chính cùng chuyển động phụ rõ ràng.',
        },
        {
          prompt: 'Khoảnh khắc nào có cảm xúc dễ đọc?',
          options: ['Bíp nhảy lên khi tìm thấy chìa khóa', 'Bíp đứng yên trong phòng'],
          answerIndex: 0,
          feedback: 'Cú nhảy gắn với sự kiện tìm thấy chìa khóa thể hiện niềm vui rõ.',
        },
        {
          prompt: 'Để làm một đoạn ngắn, nên chọn khoảnh khắc nào?',
          options: ['Một hành động chính có điểm bắt đầu và kết thúc', 'Toàn bộ chuyến phiêu lưu dài'],
          answerIndex: 0,
          feedback: 'Một hành động trọn vẹn vừa sức cho đoạn chuyển động ngắn.',
        },
      ],
    }
  }
  if (key === 'L1-K5-3.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Chạy nhanh, tay vung cao', right: 'Háo hức' },
        { left: 'Bước chậm, đầu cúi', right: 'Buồn' },
        { left: 'Lùi lại, người co nhỏ', right: 'Sợ' },
      ],
    }
  }
  if (key === 'L1-K5-3.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Khoảnh khắc gốc: Mít chạy qua cầu trong mưa. Đoạn nào khớp?',
          options: ['Mít chạy trên cầu, mưa rơi', 'Mít ngủ trong căn phòng nắng'],
          answerIndex: 0,
          feedback: 'Đoạn A giữ đúng nhân vật, hành động, nơi chốn và thời tiết.',
        },
        {
          prompt: 'Câu lệnh nói “chạy háo hức”. Kết quả nào cần sửa?',
          options: ['Chạy nhanh, nét mặt vui', 'Đi chậm, vai hạ thấp'],
          answerIndex: 1,
          feedback: 'Đoạn B truyền cảm xúc buồn hoặc mệt, chưa đúng “háo hức”.',
        },
        {
          prompt: 'Nhân vật đúng nhưng bối cảnh sai. Nên yêu cầu sửa thế nào?',
          options: ['Giữ nhân vật, đổi căn phòng thành cây cầu trong mưa', 'Làm lại khác đi'],
          answerIndex: 0,
          feedback: 'Nói phần giữ và phần đổi giúp vòng chỉnh sửa có mục tiêu rõ.',
        },
      ],
    }
  }
  if (key === 'L1-K5-4.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Bản đầu đi đều; bản sau tăng tốc ở đoạn vui. Điểm nào được cải thiện?',
          options: ['Tốc độ thể hiện cảm xúc rõ hơn', 'Màu nền tự đổi'],
          answerIndex: 0,
          feedback: 'Thay đổi tốc độ đúng lúc giúp người xem đọc được cảm xúc.',
        },
        {
          prompt: 'Bản sau giữ khăn xanh xuyên suốt. Điều gì tốt hơn?',
          options: ['Nhân vật nhất quán hơn', 'Đoạn phim dài hơn'],
          answerIndex: 0,
          feedback: 'Giữ phụ kiện nhận diện giúp người xem biết đó vẫn là cùng nhân vật.',
        },
        {
          prompt: 'Bản sau bỏ một chuyển động thừa. Vì sao tốt hơn?',
          options: ['Hành động chính dễ đọc hơn', 'Càng ít chuyển động luôn càng tốt'],
          answerIndex: 0,
          feedback: 'Bỏ chi tiết thừa có ích khi nó giúp hành động chính rõ hơn.',
        },
      ],
    }
  }
  if (key === 'L1-K5-4.2') {
    return {
      gameType: 'order',
      cards: [
        'Chào khán giả',
        'Nói tên đoạn chuyển động',
        'Nêu cảm xúc muốn thể hiện',
        'Mời mọi người xem',
      ],
    }
  }
  if (key === 'L1-K6-1.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Hình ảnh', right: 'Mít trên cây cầu trong mưa' },
        { left: 'Chuyển động', right: 'Mít chạy, áo choàng bay' },
        { left: 'Âm thanh', right: 'Tiếng mưa và bước chân' },
      ],
    }
  }
  if (key === 'L1-K6-1.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Vì sao cảnh Mít chạy qua cầu phù hợp làm phim?',
          options: ['Có hành động, cảm xúc và âm thanh rõ', 'Vì đây là cảnh đầu tiên nhìn thấy'],
          answerIndex: 0,
          feedback: 'Lý do A chỉ ra những yếu tố cụ thể có thể biến thành phim.',
        },
        {
          prompt: 'Lý do nào cho thấy lựa chọn có chủ đích?',
          options: ['Em thích cảnh này', 'Cảnh này là lúc nhân vật vượt qua nỗi sợ'],
          answerIndex: 1,
          feedback: 'Lý do B gắn cảnh được chọn với thay đổi quan trọng của nhân vật.',
        },
        {
          prompt: 'Nếu chỉ làm một cảnh ngắn, lý do nào thực tế hơn?',
          options: ['Cảnh có một hành động chính, vừa sức hoàn thiện', 'Cảnh kể toàn bộ câu chuyện'],
          answerIndex: 0,
          feedback: 'Một hành động trọn vẹn giúp dự án đầu tay có phạm vi vừa sức.',
        },
      ],
    }
  }
  if (key === 'L1-K6-2.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Mít đeo khăn xanh', target: 'Ô nhân vật' },
        { item: 'Chạy qua cây cầu trong mưa', target: 'Ô hành động' },
        { item: '“Mình sẽ không bỏ cuộc!”', target: 'Ô lời thoại' },
      ],
    }
  }
  if (key === 'L1-K6-2.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mít sợ nhưng quyết định đi tiếp. Câu thoại nào hợp?',
          options: ['“Mình sẽ thử thêm một lần!”', '“Hôm nay trời có mưa.”'],
          answerIndex: 0,
          feedback: 'Câu A nói đúng quyết định và cảm xúc của nhân vật trong cảnh.',
        },
        {
          prompt: 'Cảnh chỉ cho thấy nhân vật lén mở cửa. Có cần thoại không?',
          options: ['Không; hành động và âm thanh đã kể đủ', 'Luôn phải thêm một câu thoại'],
          answerIndex: 0,
          feedback: 'Thoại là tùy chọn; không nên lặp lại điều hình ảnh đã kể rõ.',
        },
        {
          prompt: 'Câu nào tự nhiên hơn khi Bíp gọi bạn chạy theo?',
          options: ['“Nhanh lên, lối này!”', '“Tôi đang thực hiện hoạt động di chuyển.”'],
          answerIndex: 0,
          feedback: 'Câu A ngắn, đúng tình huống gấp và nghe giống lời nhân vật.',
        },
      ],
    }
  }
  if (key === 'L1-K6-3.1') {
    return {
      gameType: 'combine',
      groups: [
        {
          label: 'Nhân vật',
          options: ['Mèo cam đeo khăn xanh', 'Robot nhỏ có ăng-ten sao', 'Cô bé mang ba lô đỏ'],
        },
        {
          label: 'Bối cảnh',
          options: ['Cầu gỗ trong mưa', 'Căn phòng có cửa sổ tròn', 'Khu rừng cây phát sáng'],
        },
        {
          label: 'Hành động',
          options: ['Chạy về phía trước', 'Mở tấm bản đồ', 'Giơ ngôi sao lên cao'],
        },
      ],
    }
  }
  if (key === 'L1-K6-3.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Yêu cầu: mèo cam, khăn xanh, cầu gỗ trong mưa. Hình nào khớp?',
          options: ['Mèo cam đeo khăn xanh trên cầu mưa', 'Mèo xám đội mũ trong sa mạc'],
          answerIndex: 0,
          feedback: 'Hình A giữ đúng nhân vật, phụ kiện, nơi chốn và thời tiết.',
        },
        {
          prompt: 'Hình đúng bối cảnh nhưng nhân vật mất khăn. Cần sửa gì?',
          options: ['Giữ bối cảnh, thêm lại khăn xanh', 'Đổi toàn bộ cảnh'],
          answerIndex: 0,
          feedback: 'Chỉ sửa phần lệch giúp giữ những gì đã đúng.',
        },
        {
          prompt: 'Hai hình đều đúng mô tả. Hình nào tốt hơn cho chuyển động chạy?',
          options: ['Hình thấy rõ toàn thân và hướng chạy', 'Hình cận mặt, không thấy cơ thể'],
          answerIndex: 0,
          feedback: 'Thấy toàn thân và hướng đi sẽ thuận lợi hơn khi thêm chuyển động.',
        },
      ],
    }
  }
  if (key === 'L1-K6-4.1') {
    return {
      gameType: 'order',
      cards: ['Ai: Mít', 'Làm gì: chạy qua cầu', 'Cảm xúc: quyết tâm'],
    }
  }
  if (key === 'L1-K6-4.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Cảnh chạy đua gấp gáp', right: 'Nhịp trống nhanh' },
        { left: 'Cảnh bạn bè đoàn tụ', right: 'Giai điệu ấm và nhẹ' },
        { left: 'Cánh cửa bí mật mở ra', right: 'Âm thanh ngân bí ẩn' },
      ],
    }
  }
  if (key === 'L1-K6-5.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Bản sau nghe rõ thoại hơn nhạc. Điểm nào được cải thiện?',
          options: ['Cân bằng âm thanh', 'Thời lượng phim'],
          answerIndex: 0,
          feedback: 'Hạ nhạc để nghe rõ lời là cải thiện về cân bằng âm thanh.',
        },
        {
          prompt: 'Bản sau cắt phần đứng yên ở đầu. Kết quả tốt hơn ở đâu?',
          options: ['Cảnh bắt đầu đúng lúc hành động', 'Nhân vật đổi màu'],
          answerIndex: 0,
          feedback: 'Cắt khoảng chờ giúp cảnh đi vào hành động chính nhanh và rõ.',
        },
        {
          prompt: 'Bản sau giữ hình, chuyển động và tiếng bước chân cùng nhịp. Điều gì tốt hơn?',
          options: ['Ba lớp phối hợp khớp nhau', 'Có nhiều hiệu ứng hơn'],
          answerIndex: 0,
          feedback: 'Các lớp khớp nhau quan trọng hơn việc thêm thật nhiều hiệu ứng.',
        },
      ],
    }
  }
  if (key === 'L1-K6-5.2') {
    return {
      gameType: 'order',
      cards: [
        'Chào gia đình',
        'Nói tên phim và cảnh đã chọn',
        'Kể một điều em tự hào',
        'Mời mọi người xem phim',
      ],
    }
  }
  if (key === 'L2-K1-1.1') {
    return {
      gameType: 'combine',
      groups: [
        { label: 'Chủ đề gốc', options: ['Tình bạn', 'Tự do', 'Dũng cảm', 'Chăm sóc thiên nhiên'] },
        { label: 'Vì sao quan trọng', options: ['Giúp mọi người gần nhau', 'Ai cũng được là chính mình', 'Khuyến khích bước qua nỗi sợ', 'Nhắc mọi người cùng bảo vệ'] },
      ],
    }
  }
  if (key === 'L2-K1-1.2') {
    return {
      gameType: 'combine',
      groups: [
        { label: 'Âm đầu', options: ['Lumi', 'Astra', 'Mộc', 'Vân'] },
        { label: 'Âm cuối', options: ['ria', 'nova', 'lâm', 'giới'] },
        { label: 'Cảm giác tên gợi ra', options: ['Hy vọng', 'Bí ẩn', 'Yên bình'] },
      ],
    }
  }
  if (key === 'L2-K1-2.1') {
    return {
      gameType: 'combine',
      groups: [
        { label: 'Vùng đất', options: ['Rừng phát sáng', 'Đảo gió', 'Thành phố dưới hồ', 'Thung lũng pha lê'] },
        { label: 'Điểm khác biệt', options: ['Luôn là ban đêm', 'Di chuyển theo mùa', 'Nhà cửa biết đổi hình', 'Âm thanh tạo ra màu sắc'] },
      ],
    }
  }
  if (key === 'L2-K1-2.2') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Tên và biểu tượng bản đồ', target: 'Ô chú giải' },
        { item: 'Con sông nối hai vùng', target: 'Đường liên kết vùng' },
        { item: 'Tên từng vùng đất', target: 'Bên trong ranh giới vùng' },
      ],
    }
  }
  if (key === 'L2-K1-3.1') {
    return {
      gameType: 'combine',
      groups: [
        { label: 'Nguồn quy luật', options: ['Ánh sáng', 'Âm thanh', 'Ký ức', 'Thời tiết'] },
        { label: 'Tác động đặc biệt', options: ['Làm vật thể bay lên', 'Đổi màu theo cảm xúc', 'Mở lối đi bí mật', 'Làm thời gian chậm lại'] },
      ],
    }
  }
  if (key === 'L2-K1-3.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Quy luật: âm thanh tạo ra màu sắc. Khi chuông ngân, điều gì hợp lý?',
          options: ['Một dải màu lan quanh tháp', 'Mọi âm thanh biến mất mà không có dấu hiệu'],
          answerIndex: 0,
          feedback: 'Kết quả A áp dụng trực tiếp quan hệ âm thanh → màu sắc đã đặt ra.',
        },
        {
          prompt: 'Quy luật: ký ức mở lối bí mật. Nhân vật quên mật mã thì sao?',
          options: ['Cửa vẫn tự mở như bình thường', 'Nhân vật cần gợi lại ký ức hoặc tìm cách khác'],
          answerIndex: 1,
          feedback: 'Kết quả B giữ cho quy luật có hệ quả nhất quán trong tình huống mới.',
        },
      ],
    }
  }
  if (key === 'L2-K1-4.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Hy vọng', right: 'Vàng ấm và xanh trời sáng' },
        { left: 'Bí ẩn', right: 'Tím đậm và xanh đêm' },
        { left: 'Hoài niệm', right: 'Nâu ấm và vàng nhạt' },
      ],
    }
  }
  if (key === 'L2-K1-4.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mood board bí ẩn, ánh sáng yếu, tím đậm. Mô tả nào khớp?',
          options: ['Sương tím phủ các lối nhỏ, điểm sáng xa xăm', 'Nắng trưa vàng rực trên cánh đồng'],
          answerIndex: 0,
          feedback: 'Mô tả A giữ màu, ánh sáng và cảm giác bí ẩn của mood board.',
        },
        {
          prompt: 'Ba góc nhìn cùng một thế giới nên giữ điều gì?',
          options: ['Bảng màu và chất ánh sáng chủ đạo', 'Mỗi hình dùng một phong cách không liên quan'],
          answerIndex: 0,
          feedback: 'Giữ bảng màu và ánh sáng giúp các góc nhìn thuộc cùng một thế giới.',
        },
      ],
    }
  }
  if (key === 'L2-K1-5.1') {
    return {
      gameType: 'combine',
      groups: [
        { label: 'Nơi ở', options: ['Tán cây phát sáng', 'Đảo nổi', 'Hang pha lê', 'Thành phố dưới hồ'] },
        { label: 'Khả năng', options: ['Nghe được tiếng cây', 'Điều khiển gió', 'Lưu giữ ký ức', 'Dệt ánh sáng'] },
      ],
    }
  }
  if (key === 'L2-K1-5.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mô tả: cư dân hang pha lê, da phản chiếu tím, giữ ký ức. Hình nào lệch?',
          options: ['Da tím phản sáng, đứng trong hang pha lê', 'Lông xanh, sống trên đảo nổi'],
          answerIndex: 1,
          feedback: 'Hình B đổi ngoại hình, nơi ở và bỏ mất khả năng đã mô tả.',
        },
        {
          prompt: 'Hai cư dân cùng loài ở hai hình. Điều gì cần giữ?',
          options: ['Đặc điểm nhận diện cốt lõi', 'Mọi tư thế và góc máy phải giống hệt'],
          answerIndex: 0,
          feedback: 'Tư thế có thể đổi, nhưng dấu hiệu nhận diện cần nhất quán.',
        },
      ],
    }
  }
  if (key === 'L2-K1-6.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Toàn cảnh', right: 'Giới thiệu các vùng và quan hệ không gian' },
        { left: 'Trung cảnh', right: 'Cho thấy cư dân hoạt động trong một vùng' },
        { left: 'Cận cảnh', right: 'Nhấn vào vật liệu hoặc chi tiết đặc biệt' },
      ],
    }
  }
  if (key === 'L2-K1-6.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Ảnh đẹp nhưng lệch mood board; ảnh còn lại đúng màu và quy luật. Chọn ảnh nào?',
          options: ['Ảnh đúng kế hoạch hình ảnh', 'Ảnh đẹp nhưng thuộc phong cách khác'],
          answerIndex: 0,
          feedback: 'Bộ ảnh cần phục vụ world bible và nhất quán với kế hoạch đã lập.',
        },
        {
          prompt: 'Bộ đã có toàn cảnh và cận cảnh. Hình tiếp theo nên bổ sung gì?',
          options: ['Trung cảnh cư dân sinh hoạt', 'Một toàn cảnh gần giống hình cũ'],
          answerIndex: 0,
          feedback: 'Trung cảnh bổ sung chức năng mới thay vì lặp lại góc đã có.',
        },
      ],
    }
  }
  if (key === 'L2-K1-7.1') {
    return {
      gameType: 'order',
      cards: ['Tổng quan và chủ đề', 'Bản đồ các vùng', 'Quy luật đặc biệt', 'Cư dân và hình ảnh'],
    }
  }
  if (key === 'L2-K1-7.2') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Ảnh toàn cảnh', target: 'Mục tổng quan' },
        { item: 'Sơ đồ vùng đất', target: 'Mục bản đồ' },
        { item: 'Chân dung cư dân', target: 'Mục cư dân' },
        { item: 'Ảnh chi tiết phép thuật', target: 'Mục quy luật' },
      ],
    }
  }
  if (key === 'L2-K1-8.1') {
    return {
      gameType: 'order',
      cards: ['Tên và chủ đề thế giới', 'Bản đồ cùng quy luật', 'Cư dân tiêu biểu', 'Điều em tự hào nhất'],
    }
  }
  if (key === 'L2-K1-8.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: '“Vì sao cư dân không bay ra ngoài đảo?” Câu trả lời nào dựa trên world bible?',
          options: ['Vì quy luật gió chỉ nâng vật thể trong ranh giới đảo', 'Vì em thích như vậy thôi'],
          answerIndex: 0,
          feedback: 'Câu A dùng quy luật đã xây để bảo vệ tính nhất quán của thế giới.',
        },
        {
          prompt: 'Nếu câu hỏi chỉ ra một chỗ chưa hợp lý, nên trả lời thế nào?',
          options: ['Cảm ơn, ghi nhận và nói cách sẽ chỉnh', 'Bỏ qua câu hỏi'],
          answerIndex: 0,
          feedback: 'Phản biện là dữ liệu để cải thiện, không phải cuộc thi thắng thua.',
        },
      ],
    }
  }
  if (key === 'L2-K2-1.1') {
    return {
      gameType: 'combine',
      groups: [
        { label: 'Mong muốn gốc', options: ['Được công nhận', 'Tìm một người bạn', 'Khám phá điều chưa biết', 'Bảo vệ cộng đồng'] },
        { label: 'Điều đó có nghĩa là', options: ['Chứng minh giá trị bản thân', 'Không còn cô đơn', 'Hiểu thế giới rộng hơn', 'Giữ người khác an toàn'] },
      ],
    }
  }
  if (key === 'L2-K2-1.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Từng bị bỏ lại trong một chuyến đi', right: 'Muốn tìm một người bạn tin cậy' },
        { left: 'Lớn lên ở nơi mọi câu hỏi bị cấm', right: 'Muốn khám phá điều chưa biết' },
        { left: 'Được một người lạ cứu giúp', right: 'Muốn bảo vệ cộng đồng' },
      ],
    }
  }
  if (key === 'L2-K2-2.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Ba lô đầy bản đồ và kính quan sát', right: 'Tò mò, thích khám phá' },
        { left: 'Áo giáp cũ được vá nhiều lần', right: 'Bền bỉ, bảo vệ người khác' },
        { left: 'Huy hiệu luôn giấu dưới cổ áo', right: 'Muốn được công nhận nhưng thiếu tự tin' },
      ],
    }
  }
  if (key === 'L2-K2-2.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mô tả nào đủ để tạo lại nhân vật nhất quán?',
          options: ['Một cô bé thú vị', 'Cô bé nhỏ, tóc xoăn nâu, áo vàng, ba lô đỏ, huy hiệu sao'],
          answerIndex: 1,
          feedback: 'Mô tả B có hình dáng, màu, trang phục và dấu hiệu nhận diện cụ thể.',
        },
        {
          prompt: 'Mô tả đã có dáng, màu và trang phục. Phần nào còn thiếu?',
          options: ['Chi tiết nhận diện cố định', 'Một lời khen chung chung'],
          answerIndex: 0,
          feedback: 'Chi tiết cố định giúp phân biệt nhân vật qua nhiều hình.',
        },
      ],
    }
  }
  if (key === 'L2-K2-3.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Rất cẩn thận', right: 'Dễ chần chừ khi cần quyết định nhanh' },
        { left: 'Luôn giúp mọi người', right: 'Khó nói “không” và quên nhu cầu của mình' },
        { left: 'Dũng cảm thử điều mới', right: 'Đôi lúc hành động trước khi suy nghĩ' },
      ],
    }
  }
  if (key === 'L2-K2-3.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Muốn được công nhận', right: 'Sợ thất bại trước mọi người' },
        { left: 'Muốn tìm bạn', right: 'Sợ bị từ chối hoặc bỏ lại' },
        { left: 'Muốn khám phá', right: 'Sợ sự thật làm thay đổi điều mình tin' },
      ],
    }
  }
  if (key === 'L2-K2-4.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Gặp lại người bạn cũ', right: 'Mắt mở sáng, thân người hướng về trước' },
        { left: 'Nghe tiếng động trong bóng tối', right: 'Vai co, lùi một bước, mắt nhìn quanh' },
        { left: 'Quyết định bảo vệ nhóm', right: 'Đứng thẳng, chân vững, nhìn thẳng' },
      ],
    }
  }
  if (key === 'L2-K2-4.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: '“Hơi tức giận” hợp với biểu cảm nào?',
          options: ['Lông mày hơi hạ, môi khép', 'Nghiến răng, nắm tay, toàn thân căng cứng'],
          answerIndex: 0,
          feedback: 'Biểu cảm A có tín hiệu vừa phải, chưa đạt mức giận dữ dữ dội.',
        },
        {
          prompt: '“Rất quyết tâm” khác “bình tĩnh” ở đâu?',
          options: ['Ánh mắt tập trung và dáng nghiêng về mục tiêu', 'Mắt nhắm và cơ thể thả lỏng'],
          answerIndex: 0,
          feedback: 'Hướng nhìn và trọng tâm cơ thể cho thấy nhân vật sắp hành động.',
        },
      ],
    }
  }
  if (key === 'L2-K2-5.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mô tả A có ba lô đỏ; mô tả B bỏ chi tiết đó. Điều gì dễ xảy ra?',
          options: ['AI có thể làm mất dấu hiệu nhận diện', 'Hai hình chắc chắn giống hệt'],
          answerIndex: 0,
          feedback: 'Thay đổi mô tả chuẩn có thể làm đặc điểm nhận diện biến mất.',
        },
        {
          prompt: 'Phần nào nên thay đổi giữa các tư thế?',
          options: ['Hành động và biểu cảm', 'Màu tóc, trang phục và huy hiệu cố định'],
          answerIndex: 0,
          feedback: 'Tư thế được đổi, còn đặc điểm cốt lõi cần giữ để nhận ra nhân vật.',
        },
      ],
    }
  }
  if (key === 'L2-K2-5.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Bản nào ngắn hơn mà vẫn giữ đủ nhận diện?',
          options: ['Cô bé tóc xoăn nâu, áo vàng, ba lô đỏ, huy hiệu sao', 'Một cô bé đẹp và rất đặc biệt'],
          answerIndex: 0,
          feedback: 'Bản A ngắn nhưng vẫn giữ bốn thuộc tính nhìn thấy được.',
        },
        {
          prompt: 'Chi tiết nào có thể bỏ khỏi mô tả hình ảnh chuẩn?',
          options: ['“Ai gặp cũng thấy thật tuyệt vời”', 'Huy hiệu sao trên ba lô đỏ'],
          answerIndex: 0,
          feedback: 'Lời đánh giá chung không giúp tái tạo ngoại hình; huy hiệu thì có.',
        },
      ],
    }
  }
  if (key === 'L2-K2-6.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Chân dung trung tính', target: 'Ảnh tham chiếu chuẩn' },
        { item: 'Tư thế đang hành động', target: 'Ô chuyển động' },
        { item: 'Biểu cảm vui', target: 'Ô cảm xúc tích cực' },
        { item: 'Biểu cảm sợ hoặc quyết tâm', target: 'Ô cảm xúc thử thách' },
      ],
    }
  }
  if (key === 'L2-K2-6.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Ba hình giữ tóc, áo, ba lô; hình thứ tư đổi màu áo. Hình nào lệch?',
          options: ['Hình đổi màu áo', 'Ba hình giữ mô tả chuẩn'],
          answerIndex: 0,
          feedback: 'Màu áo là thuộc tính cố định trong bộ mô tả chuẩn.',
        },
        {
          prompt: 'Một hình khác tư thế nhưng giữ đủ nhận diện. Có bị lệch không?',
          options: ['Không, tư thế là phần chủ động thay đổi', 'Có, mọi hình phải cùng một tư thế'],
          answerIndex: 0,
          feedback: 'Bộ sưu tập cần đa dạng tư thế nhưng nhất quán đặc điểm cốt lõi.',
        },
      ],
    }
  }
  if (key === 'L2-K2-7.1') {
    return {
      gameType: 'combine',
      groups: [
        { label: 'Kiểu quan hệ', options: ['Bạn thân', 'Đối thủ', 'Người dẫn đường', 'Anh chị em'] },
        { label: 'Vai trò trong câu chuyện', options: ['Thách thức điểm yếu', 'Hỗ trợ khi thất bại', 'Giữ một bí mật', 'Cùng theo đuổi một mục tiêu'] },
      ],
    }
  }
  if (key === 'L2-K2-7.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Hai người là đồng đội. Cặp thiết kế nào vừa liên hệ vừa phân biệt?',
          options: ['Cùng huy hiệu sao, màu áo khác nhau', 'Giống hệt mọi chi tiết'],
          answerIndex: 0,
          feedback: 'Một chi tiết chung tạo liên hệ; màu khác giúp đọc rõ từng nhân vật.',
        },
        {
          prompt: 'Hai người là đối thủ. Cách dùng hình dáng nào rõ hơn?',
          options: ['Một dáng tròn mềm, một dáng góc cạnh', 'Cả hai cùng dáng và cùng màu'],
          answerIndex: 0,
          feedback: 'Tương phản hình dáng có thể làm quan hệ đối lập đọc nhanh hơn.',
        },
      ],
    }
  }
  if (key === 'L2-K2-8.1') {
    return {
      gameType: 'order',
      cards: ['Mong muốn và xuất thân', 'Ngoại hình chuẩn', 'Điểm mạnh, yếu và nỗi sợ', 'Biểu cảm, bộ hình và quan hệ'],
    }
  }
  if (key === 'L2-K2-8.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: '“Vì sao nhân vật sợ thất bại?” Câu nào có bằng chứng từ hồ sơ?',
          options: ['Vì bạn ấy khao khát được công nhận sau lần từng bị xem thường', 'Vì em chọn nỗi sợ đó'],
          answerIndex: 0,
          feedback: 'Câu A nối nỗi sợ với mong muốn và xuất thân đã xây.',
        },
        {
          prompt: 'Câu hỏi phát hiện một mâu thuẫn trong hồ sơ. Nên làm gì?',
          options: ['Ghi nhận và sửa mối liên hệ chưa rõ', 'Tránh trả lời để giữ nguyên'],
          answerIndex: 0,
          feedback: 'Phản biện giúp character bible chặt chẽ hơn nếu được dùng để chỉnh sửa.',
        },
      ],
    }
  }
  if (key === 'L2-K3-1.1') {
    return {
      gameType: 'order',
      cards: ['Giới thiệu nhân vật và mong muốn', 'Vấn đề cản đường', 'Hai lần cố gắng', 'Bước ngoặt', 'Kết quả và thay đổi'],
    }
  }
  if (key === 'L2-K3-1.2') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Muốn được công nhận', target: 'Ô mong muốn' },
        { item: 'Hay chần chừ', target: 'Ô điểm yếu' },
        { item: 'Sợ thất bại trước mọi người', target: 'Ô nỗi sợ' },
        { item: 'Thành phố dưới hồ', target: 'Ô bối cảnh' },
      ],
    }
  }
  if (key === 'L2-K3-2.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Đoạn nào giới thiệu đủ nhân vật, mong muốn và bối cảnh?',
          options: ['Na sống dưới hồ và muốn được chọn làm người dẫn đường.', 'Na là một nhân vật rất hay.'],
          answerIndex: 0,
          feedback: 'Đoạn A đặt nhân vật, nơi chốn và mục tiêu cụ thể ngay từ đầu.',
        },
        {
          prompt: 'Giới thiệu nào gợi xung đột sắp đến?',
          options: ['Bíp muốn khám phá vùng cấm dù cậu rất sợ bị phát hiện.', 'Bíp đi dạo vào một ngày bình thường.'],
          answerIndex: 0,
          feedback: 'Mong muốn và nỗi sợ cùng xuất hiện tạo lực căng cho câu chuyện.',
        },
      ],
    }
  }
  if (key === 'L2-K3-2.2') {
    return {
      gameType: 'order',
      cards: ['Bị lỡ chuyến xe', 'Mất tấm bản đồ duy nhất', 'Đối thủ lấy được chìa khóa trước'],
    }
  }
  if (key === 'L2-K3-3.1') {
    return {
      gameType: 'order',
      cards: ['Hỏi người gác cổng', 'Tự giải mật mã cũ', 'Băng qua đường hầm đang sập'],
    }
  }
  if (key === 'L2-K3-3.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Na thất bại vì chần chừ. Phản ứng nào đúng hồ sơ nhân vật?',
          options: ['Na xấu hổ, muốn bỏ cuộc nhưng nhớ mục tiêu được công nhận', 'Na cười lớn vì chẳng quan tâm'],
          answerIndex: 0,
          feedback: 'Phản ứng A nối thất bại với điểm yếu và mong muốn đã đặt ra.',
        },
        {
          prompt: 'Hậu quả nào làm câu chuyện tiến lên?',
          options: ['Nhân vật mất cơ hội đầu và phải đổi cách làm', 'Không có gì thay đổi sau thất bại'],
          answerIndex: 0,
          feedback: 'Một hậu quả cụ thể buộc nhân vật phải học hoặc thử chiến lược mới.',
        },
      ],
    }
  }
  if (key === 'L2-K3-4.1') {
    return {
      gameType: 'combine',
      groups: [
        { label: 'Kiểu bước ngoặt', options: ['Phát hiện bí mật', 'Nhận sự giúp đỡ bất ngờ', 'Nhận ra mình đã hiểu sai', 'Mất thứ từng dựa vào'] },
        { label: 'Cách tiếp cận mới', options: ['Hợp tác thay vì làm một mình', 'Dùng điểm yếu như một manh mối', 'Nói thật thay vì che giấu', 'Thử con đường chưa ai chọn'] },
      ],
    }
  }
  if (key === 'L2-K3-4.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Trước bước ngoặt Na luôn làm một mình. Hành động sau nào cho thấy thay đổi?',
          options: ['Na nhờ đồng đội cùng giải mật mã', 'Na tiếp tục giấu bản đồ và bỏ đi'],
          answerIndex: 0,
          feedback: 'Hành động A thể hiện cách tiếp cận mới bằng lựa chọn nhìn thấy được.',
        },
        {
          prompt: 'Muốn cho thấy nhân vật bớt sợ thất bại, chi tiết nào hiệu quả?',
          options: ['Thử lại trước mọi người và nhận trách nhiệm', 'Nói rằng mình đã thay đổi'],
          answerIndex: 0,
          feedback: 'Hành động có rủi ro chứng minh thay đổi mạnh hơn một lời khẳng định.',
        },
      ],
    }
  }
  if (key === 'L2-K3-5.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Na học cách hợp tác. Kết nào hoàn tất hành trình?',
          options: ['Na cùng nhóm mở cổng và chia sẻ công lao', 'Na thắng một mình như đầu chuyện'],
          answerIndex: 0,
          feedback: 'Kết A cho thấy bài học đã đổi cách nhân vật đạt mục tiêu.',
        },
        {
          prompt: 'Nhân vật không đạt mong muốn ban đầu nhưng vẫn có thể kết trọn vẹn khi nào?',
          options: ['Khi học được điều làm thay đổi lựa chọn của mình', 'Chỉ khi mọi vấn đề biến mất'],
          answerIndex: 0,
          feedback: 'Sự thay đổi có thể hoàn tất câu chuyện ngay cả khi mục tiêu ban đầu không đạt đủ.',
        },
      ],
    }
  }
  if (key === 'L2-K3-5.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Nhân vật thắng nhờ biết nhờ giúp đỡ', right: 'Hợp tác không làm ta yếu đi' },
        { left: 'Nhân vật dám thử lại sau thất bại', right: 'Can đảm là tiếp tục dù còn sợ' },
        { left: 'Nhân vật từ bỏ phần thưởng để cứu bạn', right: 'Tình bạn quý hơn sự công nhận' },
      ],
    }
  }
  if (key === 'L2-K3-6.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: '“Để mình xem bản đồ thêm một lần nhé.”', right: 'Cẩn thận và suy nghĩ kỹ' },
        { left: '“Cứ đi đi, mình sẽ tìm ra cách!”', right: 'Táo bạo và tự tin' },
        { left: '“Chúng ta cùng thử, được không?”', right: 'Hợp tác và quan tâm' },
      ],
    }
  }
  if (key === 'L2-K3-6.2') {
    return {
      gameType: 'order',
      cards: ['Na: “Mình đã hiểu sai manh mối.”', 'Bíp: “Vậy ta thử đọc nó cùng nhau.”', 'Na: “Được, lần này mình sẽ không làm một mình.”'],
    }
  }
  if (key === 'L2-K3-7.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Nhân vật và mong muốn', target: 'Ảnh mở đầu' },
        { item: 'Xung đột bùng lên', target: 'Ảnh vấn đề' },
        { item: 'Quyết định mới', target: 'Ảnh bước ngoặt' },
        { item: 'Kết quả và thay đổi', target: 'Ảnh kết' },
      ],
    }
  }
  if (key === 'L2-K3-7.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Ba ảnh giữ nhân vật; ảnh bước ngoặt đổi tóc và trang phục. Hình nào lệch?',
          options: ['Ảnh bước ngoặt', 'Ba ảnh giữ mô tả chuẩn'],
          answerIndex: 0,
          feedback: 'Khoảnh khắc có thể đổi, nhưng đặc điểm nhận diện phải xuyên suốt storyboard.',
        },
        {
          prompt: 'Bối cảnh cùng căn phòng nhưng góc nhìn đổi. Có phải lỗi không?',
          options: ['Không, nếu dấu hiệu bối cảnh vẫn được giữ', 'Có, mọi góc máy phải giống nhau'],
          answerIndex: 0,
          feedback: 'Đổi góc nhìn giúp kể chuyện; tính nhất quán nằm ở chi tiết cốt lõi.',
        },
      ],
    }
  }
  if (key === 'L2-K3-8.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Đến bước ngoặt, cách kể nào giúp người nghe nhận ra thay đổi?',
          options: ['Dừng nhẹ trước quyết định mới rồi nhấn câu thoại', 'Đọc đều như mọi đoạn'],
          answerIndex: 0,
          feedback: 'Nhịp dừng và từ nhấn làm bước ngoặt nổi lên trong cấu trúc năm phần.',
        },
        {
          prompt: 'Storyboard nên được dùng thế nào khi kể?',
          options: ['Làm mốc nhớ, vẫn nhìn khán giả', 'Đọc chữ trên ảnh mà không ngẩng lên'],
          answerIndex: 0,
          feedback: 'Hình là điểm tựa cho mạch kể, không thay thế kết nối với người nghe.',
        },
      ],
    }
  }
  if (key === 'L2-K3-8.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Phản hồi nào cụ thể và dùng được?',
          options: ['Đoạn bước ngoặt rõ; hãy dừng lâu hơn trước câu quyết định', 'Hay lắm!'],
          answerIndex: 0,
          feedback: 'Phản hồi A nêu điểm mạnh, vị trí và một đề xuất có thể thử.',
        },
        {
          prompt: 'Cách nhận phản hồi nào giúp cải thiện?',
          options: ['Hỏi lại một ví dụ rồi chọn điều sẽ thử', 'Bảo vệ mọi lựa chọn ngay lập tức'],
          answerIndex: 0,
          feedback: 'Làm rõ bằng ví dụ giúp biến ý kiến thành một vòng thử mới.',
        },
      ],
    }
  }
  if (key === 'L2-K4-1.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Giới thiệu cả thành phố', right: 'Toàn cảnh' },
        { left: 'Cho thấy nét sợ trên mắt nhân vật', right: 'Cận cảnh' },
        { left: 'Hai nhân vật tranh luận', right: 'Trung cảnh hai người' },
      ],
    }
  }
  if (key === 'L2-K4-1.2') {
    return {
      gameType: 'order',
      cards: ['Khung lớn: thiết lập khoảnh khắc', 'Khung vừa: hành động bắt đầu', 'Khung nhỏ: hành động dồn nhanh', 'Khung hẹp: cú chốt bất ngờ'],
    }
  }
  if (key === 'L2-K4-2.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Giới thiệu', target: '1 khung thiết lập' },
        { item: 'Vấn đề', target: '1-2 khung làm xung đột rõ' },
        { item: 'Cố gắng', target: '2-3 khung cho hành động phát triển' },
        { item: 'Bước ngoặt', target: '2 khung nhấn quyết định mới' },
        { item: 'Kết', target: '1-2 khung cho kết quả' },
      ],
    }
  }
  if (key === 'L2-K4-2.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Mô tả: “Na mở cửa.” Phần nào cần bổ sung để dựng khung rõ hơn?',
          options: ['Góc máy, biểu cảm và bối cảnh', 'Một lời khen cho nhân vật'],
          answerIndex: 0,
          feedback: 'Các chi tiết nhìn thấy và góc máy giúp biến hành động thành một khung cụ thể.',
        },
        {
          prompt: 'Khung không có lời thoại. Mô tả vẫn cần gì?',
          options: ['Nhân vật, hành động, góc máy và bối cảnh', 'Một câu thoại bất kỳ'],
          answerIndex: 0,
          feedback: 'Lời thoại là tùy chọn; các yếu tố hình ảnh vẫn phải đủ.',
        },
      ],
    }
  }
  if (key === 'L2-K4-3.1') {
    return {
      gameType: 'order',
      cards: ['Trên trái', 'Trên phải', 'Dưới trái', 'Dưới phải'],
    }
  }
  if (key === 'L2-K4-3.2') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Toàn cảnh mở đầu', target: 'Khung lớn đầu trang' },
        { item: 'Hai hành động liên tiếp', target: 'Hai khung nhỏ cạnh nhau' },
        { item: 'Phản ứng cảm xúc', target: 'Khung cận cảnh' },
        { item: 'Bước ngoặt', target: 'Khung nhấn cuối trang' },
      ],
    }
  }
  if (key === 'L2-K4-4.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Nói bình thường', right: 'Bong bóng tròn, nét đều' },
        { left: 'Hét lớn', right: 'Bong bóng răng cưa, chữ đậm' },
        { left: 'Suy nghĩ', right: 'Bong bóng mây, đuôi chấm tròn' },
      ],
    }
  }
  if (key === 'L2-K4-4.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Cánh cửa nổ tung', right: '“RẦM!” lớn, đậm, góc cạnh' },
        { left: 'Lá rơi nhẹ', right: '“Xào xạc” nhỏ, nét mềm' },
        { left: 'Tên lửa lao qua trang', right: '“VÙ!” kéo dài theo hướng chuyển động' },
      ],
    }
  }
  if (key === 'L2-K4-5.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'World bible: cửa sổ tròn, ánh tím. Khung nào lệch?',
          options: ['Phòng cửa sổ tròn, ánh tím', 'Phòng cửa vuông, nắng vàng'],
          answerIndex: 1,
          feedback: 'Khung B thay cả dấu hiệu kiến trúc và ánh sáng chủ đạo.',
        },
        {
          prompt: 'Khung mới đổi góc máy nhưng giữ vật liệu và bảng màu. Có nhất quán không?',
          options: ['Có', 'Không, góc máy không được đổi'],
          answerIndex: 0,
          feedback: 'Góc máy thay đổi để kể chuyện; thuộc tính thế giới mới cần giữ.',
        },
      ],
    }
  }
  if (key === 'L2-K4-5.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Khung 1: Na bước vào thành phố', right: 'Hành động: đi qua cổng, nhìn quanh' },
        { left: 'Khung 4: Na gặp trở ngại', right: 'Hành động: dừng trước cầu gãy' },
        { left: 'Khung 7: Na đổi cách làm', right: 'Hành động: chìa bản đồ cho đồng đội' },
      ],
    }
  }
  if (key === 'L2-K4-6.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Phương án A đẹp nhưng sai góc máy; B đúng mô tả và nhân vật. Chọn gì?',
          options: ['B', 'A vì chỉ cần đẹp'],
          answerIndex: 0,
          feedback: 'Ảnh phải phục vụ chức năng kể chuyện đã chốt trong storyboard.',
        },
        {
          prompt: 'Hai ảnh đều đúng. Tiêu chí nào nên quyết định?',
          options: ['Hành động và cảm xúc đọc rõ hơn', 'Chọn ngẫu nhiên để nhanh'],
          answerIndex: 0,
          feedback: 'Độ rõ kể chuyện là tiêu chí dùng được và có thể giải thích.',
        },
      ],
    }
  }
  if (key === 'L2-K4-6.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Khung 6 đổi màu áo nhân vật. Nên xử lý thế nào?',
          options: ['Đánh dấu và tạo lại riêng khung 6', 'Bỏ qua vì chỉ một khung'],
          answerIndex: 0,
          feedback: 'Sửa đúng khung lỗi giữ tính nhất quán mà không làm lại cả bộ.',
        },
        {
          prompt: 'Khung 3 và 4 lặp cùng một hành động. Nên kiểm tra gì?',
          options: ['Mỗi khung có đóng góp khoảnh khắc mới không', 'Có đủ nhiều màu không'],
          answerIndex: 0,
          feedback: 'Mỗi khung cần làm câu chuyện tiến lên hoặc cho thông tin mới.',
        },
      ],
    }
  }
  if (key === 'L2-K4-7.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Ảnh ngang rộng', target: 'Khung toàn cảnh ngang' },
        { item: 'Ảnh cận mặt dọc', target: 'Khung dọc hẹp' },
        { item: 'Ảnh hai nhân vật', target: 'Khung trung cảnh vừa' },
      ],
    }
  }
  if (key === 'L2-K4-7.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Bìa nào có thứ bậc thông tin rõ hơn?',
          options: ['Tên truyện lớn, hình chính rõ, tên tác giả nhỏ hơn', 'Mọi chữ và hình cùng kích thước'],
          answerIndex: 0,
          feedback: 'Thứ bậc giúp mắt đọc tên truyện rồi đến hình và tác giả.',
        },
        {
          prompt: 'Hình bìa nên ưu tiên điều gì?',
          options: ['Gợi xung đột hoặc câu hỏi chính mà không kể hết', 'Dùng một hình không liên quan nhưng nhiều màu'],
          answerIndex: 0,
          feedback: 'Bìa hấp dẫn khi đại diện đúng tác phẩm và tạo tò mò.',
        },
      ],
    }
  }
  if (key === 'L2-K4-8.1') {
    return {
      gameType: 'order',
      cards: ['Cảm hứng và câu chuyện', 'Một quyết định bố cục quan trọng', 'Khó khăn và cách đã sửa', 'Điều em tự hào nhất'],
    }
  }
  if (key === 'L2-K4-8.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Phản hồi nào giúp tác giả sửa trang?',
          options: ['Khung bước ngoặt nổi bật; chữ thoại ở khung 6 cần lớn hơn', 'Truyện đẹp'],
          answerIndex: 0,
          feedback: 'Phản hồi A có vị trí, điểm mạnh và đề xuất cụ thể.',
        },
        {
          prompt: 'Khi nhận hai ý kiến trái nhau, tác giả nên làm gì?',
          options: ['Đối chiếu mục tiêu kể chuyện rồi thử phương án', 'Chọn ý kiến của người nói to hơn'],
          answerIndex: 0,
          feedback: 'Mục tiêu của trang và một lượt thử giúp đánh giá ý kiến bằng bằng chứng.',
        },
      ],
    }
  }
  if (key === 'L2-K5-1.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Chọn cảm xúc và nhịp cảnh', right: 'Đạo diễn: đặt ý đồ cảm xúc' },
        { left: 'Chọn hành động phải đọc rõ', right: 'Đạo diễn: chọn hành động' },
        { left: 'Tính toán các khung chuyển tiếp', right: 'AI: tạo khung trung gian' },
        { left: 'Kết xuất đoạn chuyển động', right: 'AI: xử lý tệp đầu ra' },
      ],
    }
  }
  if (key === 'L2-K5-1.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Bước chậm, vai hạ, không nhìn ai', right: 'Thất vọng' },
        { left: 'Khựng lại rồi lùi một bước', right: 'Bất ngờ hoặc sợ' },
        { left: 'Chạy tới và dang rộng hai tay', right: 'Vui mừng gặp lại' },
      ],
    }
  }
  if (key === 'L2-K5-2.1') {
    return {
      gameType: 'order',
      cards: ['Rất chậm: trang trọng', 'Chậm: buồn hoặc do dự', 'Nhanh: vui hoặc gấp', 'Rất nhanh: hoảng hốt'],
    }
  }
  if (key === 'L2-K5-2.2') {
    return {
      gameType: 'order',
      cards: ['Chậm: nhân vật quan sát', 'Nhanh dần: phát hiện nguy hiểm', 'Rất nhanh: chạy thoát', 'Chậm lại: nhận ra đã an toàn'],
    }
  }
  if (key === 'L2-K5-3.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Bước nặng, thân người hạ', right: 'Mệt mỏi hoặc mang gánh nặng' },
        { left: 'Bật nhẹ, tay mở', right: 'Hào hứng hoặc tự do' },
        { left: 'Dậm chân mạnh, dứt khoát', right: 'Giận dữ hoặc quyết tâm' },
      ],
    }
  }
  if (key === 'L2-K5-3.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Áo và tóc bay về một phía', right: 'Gió thổi ngang' },
        { left: 'Cơ thể bật lùi đột ngột', right: 'Va chạm từ phía trước' },
        { left: 'Hai tay căng, vật tiến về mình', right: 'Lực kéo' },
      ],
    }
  }
  if (key === 'L2-K5-4.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Sắc thái: vui nhưng ngại ngùng. Hành động nào hợp?',
          options: ['Mỉm cười nhỏ, nhìn sang bên rồi bước tới', 'Nhảy cao và hét lớn'],
          answerIndex: 0,
          feedback: 'Hành động A kết hợp niềm vui với sự dè dặt.',
        },
        {
          prompt: 'Sắc thái: quyết tâm bình tĩnh. Hành động nào rõ?',
          options: ['Hít sâu, đứng vững rồi tiến một bước', 'Chạy vòng quanh và vung tay'],
          answerIndex: 0,
          feedback: 'Nhịp chuẩn bị và bước đi dứt khoát truyền quyết tâm có kiểm soát.',
        },
      ],
    }
  }
  if (key === 'L2-K5-4.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Cần thể hiện “nhẹ nhõm” không lời. Lựa chọn nào đọc rõ hơn?',
          options: ['Thở ra, vai hạ xuống, mỉm cười', 'Đứng yên không thay đổi'],
          answerIndex: 0,
          feedback: 'Chuỗi thay đổi cơ thể làm trạng thái trước-sau hiện ra rõ.',
        },
        {
          prompt: 'Hai hành động đều đúng cảm xúc. Nên chọn theo tiêu chí nào?',
          options: ['Phù hợp nhân vật và đọc rõ trong khung hình', 'Hành động nhiều chi tiết nhất'],
          answerIndex: 0,
          feedback: 'Ý đồ và độ rõ quan trọng hơn độ phức tạp.',
        },
      ],
    }
  }
  if (key === 'L2-K5-5.1') {
    return {
      gameType: 'order',
      cards: ['Ai: Na', 'Làm gì: đẩy cánh cửa', 'Thế nào: chậm và nặng', 'Cảm xúc: quyết tâm'],
    }
  }
  if (key === 'L2-K5-5.2') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Bíp', target: 'Ô Ai' },
        { item: 'Chạy qua đường hầm', target: 'Ô Làm gì' },
        { item: 'Nhanh dần, bước nhẹ', target: 'Ô Thế nào' },
        { item: 'Háo hức', target: 'Ô Cảm xúc' },
      ],
    }
  }
  if (key === 'L2-K5-6.1') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Prompt: Na đẩy cửa chậm, nặng, quyết tâm. Kết quả nào lệch?',
          options: ['Na dùng sức đẩy chậm, dáng vững', 'Na nhảy nhẹ và chạy khỏi cửa'],
          answerIndex: 1,
          feedback: 'Kết quả B lệch hành động, trọng lượng và cảm xúc.',
        },
        {
          prompt: 'Hành động đúng nhưng tốc độ quá nhanh. Yêu cầu sửa nào rõ?',
          options: ['Giữ động tác đẩy, làm chậm và nặng hơn', 'Làm lại cho tốt'],
          answerIndex: 0,
          feedback: 'Yêu cầu A giữ phần đúng và chỉ rõ thuộc tính cần đổi.',
        },
      ],
    }
  }
  if (key === 'L2-K5-6.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Hai đoạn giữ tóc và áo; đoạn ba đổi cả nhân vật. Đoạn nào lệch?',
          options: ['Đoạn ba', 'Hai đoạn đầu'],
          answerIndex: 0,
          feedback: 'Dấu hiệu nhận diện phải giữ qua toàn bộ chuỗi cảnh.',
        },
        {
          prompt: 'Khác ánh sáng vì sang bối cảnh mới có phải lỗi không?',
          options: ['Không, nếu thay đổi được câu chuyện giải thích', 'Có, ánh sáng luôn phải giống nhau'],
          answerIndex: 0,
          feedback: 'Thay đổi có nguyên nhân trong câu chuyện khác với lỗi nhất quán.',
        },
      ],
    }
  }
  if (key === 'L2-K5-7.1') {
    return {
      gameType: 'order',
      cards: ['Nhân vật phát hiện cánh cửa', 'Nhân vật cố đẩy nhưng thất bại', 'Đồng đội cùng hợp sức', 'Cánh cửa mở ra'],
    }
  }
  if (key === 'L2-K5-7.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Cảnh 1 kết bằng tay chạm cửa; cảnh 2 mở bằng tay ở vị trí khác. Lỗi gì?',
          options: ['Điểm nối hành động không liên tục', 'Màu sắc chưa đủ rực'],
          answerIndex: 0,
          feedback: 'Vị trí kết của cảnh trước cần gần vị trí bắt đầu của cảnh sau.',
        },
        {
          prompt: 'Chuyển cảnh làm người xem không biết đã sang nơi khác. Cần thêm gì?',
          options: ['Một dấu hiệu thiết lập bối cảnh mới', 'Nhiều chuyển động ngẫu nhiên'],
          answerIndex: 0,
          feedback: 'Một hình hoặc nhịp thiết lập giúp người xem định hướng không gian.',
        },
      ],
    }
  }
  if (key === 'L2-K5-8.1') {
    return {
      gameType: 'order',
      cards: ['Ý đồ của chuỗi cảnh', 'Lựa chọn tốc độ và trọng lượng', 'Cảm xúc muốn truyền tải', 'Một lần thử và điều đã chỉnh'],
    }
  }
  if (key === 'L2-K5-8.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: '“Vì sao em dùng tốc độ chậm ở đầu?” Câu nào có lý do đạo diễn?',
          options: ['Để khán giả cảm nhận sức nặng trước khi cao trào tăng tốc', 'Vì em chọn ngẫu nhiên'],
          answerIndex: 0,
          feedback: 'Câu A nối tốc độ với trải nghiệm muốn tạo cho khán giả.',
        },
        {
          prompt: 'Nếu khán giả đọc sai cảm xúc, nên làm gì?',
          options: ['Hỏi chi tiết nào gây hiểu nhầm rồi thử chỉnh', 'Nói khán giả xem sai'],
          answerIndex: 0,
          feedback: 'Phản ứng của khán giả là bằng chứng để kiểm tra độ rõ của ý đồ.',
        },
      ],
    }
  }
  if (key === 'L2-K6-1.1') {
    return {
      gameType: 'order',
      cards: ['Nhân vật đứng yên và nhìn quanh', 'Nhân vật nhận một tin bất ngờ', 'Nhân vật chạy qua cầu đang sập'],
    }
  }
  if (key === 'L2-K6-1.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Vì sao cảnh chạy qua cầu xứng đáng làm phim?',
          options: ['Có thay đổi cảm xúc, hành động và âm thanh quan trọng', 'Vì cảnh đó có nhiều màu'],
          answerIndex: 0,
          feedback: 'Lý do A nêu các lớp điện ảnh và vai trò của khoảnh khắc trong câu chuyện.',
        },
        {
          prompt: 'Lý do nào cho thấy phạm vi dự án vừa sức?',
          options: ['Cảnh có một hành động trọn vẹn trong thời lượng ngắn', 'Cảnh kể toàn bộ hành trình tám phần'],
          answerIndex: 0,
          feedback: 'Một hành động có đầu-cuối giúp phim đầu tay hoàn thiện được.',
        },
      ],
    }
  }
  if (key === 'L2-K6-2.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Thời lượng 3 giây', right: 'Phim: thời gian cụ thể' },
        { left: 'Máy quay tiến gần khi nhân vật sợ', right: 'Phim: chuyển động máy quay' },
        { left: 'Một khung tranh tĩnh', right: 'Truyện tranh: panel tĩnh' },
        { left: 'Bong bóng thoại trên trang', right: 'Truyện tranh: lời thoại in trên khung' },
      ],
    }
  }
  if (key === 'L2-K6-2.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Kịch bản có hành động và thoại nhưng thiếu gì để dựng theo thời gian?',
          options: ['Thời lượng và thứ tự diễn biến', 'Một lời nhận xét chung'],
          answerIndex: 0,
          feedback: 'Thời lượng và trình tự cho biết chuyển động xảy ra khi nào và kéo dài bao lâu.',
        },
        {
          prompt: 'Ghi chú “Na sợ” còn thiếu gì để đạo diễn hành động?',
          options: ['Dấu hiệu cơ thể hoặc giọng nói cụ thể', 'Tên một màu ngẫu nhiên'],
          answerIndex: 0,
          feedback: 'Biểu hiện nhìn hoặc nghe được biến cảm xúc thành chỉ dẫn thực hiện.',
        },
      ],
    }
  }
  if (key === 'L2-K6-3.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Toàn cảnh cây cầu và cơn bão', target: 'Shot 1: thiết lập' },
        { item: 'Trung cảnh nhân vật bắt đầu chạy', target: 'Shot 2: hành động' },
        { item: 'Cận cảnh gương mặt quyết tâm', target: 'Shot 3: cảm xúc' },
        { item: 'Toàn cảnh nhân vật sang bờ', target: 'Shot 4: kết quả' },
      ],
    }
  }
  if (key === 'L2-K6-3.2') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Ánh xanh tối, chớp từ phía sau', target: 'Shot bão mở đầu' },
        { item: 'Ánh chớp viền nhân vật, góc thấp', target: 'Shot chạy cao trào' },
        { item: 'Ánh ấm phía trước, góc rộng', target: 'Shot sang bờ an toàn' },
      ],
    }
  }
  if (key === 'L2-K6-4.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Shot thiết lập cây cầu', right: 'Toàn cảnh, ánh xanh tối, mưa lớn' },
        { left: 'Shot quyết tâm', right: 'Cận mặt, chớp viền từ phía sau' },
        { left: 'Shot sang bờ', right: 'Góc rộng, ánh ấm ở phía trước' },
      ],
    }
  }
  if (key === 'L2-K6-4.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Ba shot bão có ánh xanh; shot giữa thành nắng vàng. Shot nào lệch?',
          options: ['Shot giữa', 'Hai shot còn lại'],
          answerIndex: 0,
          feedback: 'Shot giữa phá continuity ánh sáng khi bối cảnh và thời gian chưa đổi.',
        },
        {
          prompt: 'Shot cuối chuyển sang ánh ấm sau khi qua bờ. Có hợp lý không?',
          options: ['Có, nếu storyboard dùng nó để báo thay đổi trạng thái', 'Không, ánh sáng không bao giờ được đổi'],
          answerIndex: 0,
          feedback: 'Ánh sáng có chủ đích có thể kể sự chuyển đổi từ nguy hiểm sang an toàn.',
        },
      ],
    }
  }
  if (key === 'L2-K6-5.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Na', target: 'Ô Ai' },
        { item: 'Chạy qua cầu', target: 'Ô Làm gì' },
        { item: 'Nhanh dần, bước nặng vì gió', target: 'Ô Thế nào' },
        { item: 'Sợ nhưng quyết tâm', target: 'Ô Cảm xúc' },
      ],
    }
  }
  if (key === 'L2-K6-5.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Prompt nói nhanh dần nhưng đoạn giữ một tốc độ. Điểm nào lệch?',
          options: ['Nhịp tốc độ', 'Màu tóc nhân vật'],
          answerIndex: 0,
          feedback: 'Kết quả chưa thực hiện chuyển đổi tốc độ đã nêu trong prompt.',
        },
        {
          prompt: 'Chuyển động đúng nhưng kết ở tư thế không nối shot sau. Cần sửa gì?',
          options: ['Tư thế và hướng ở cuối đoạn', 'Toàn bộ thiết kế nhân vật'],
          answerIndex: 0,
          feedback: 'Điểm cuối cần chuẩn bị continuity cho shot kế tiếp.',
        },
      ],
    }
  }
  if (key === 'L2-K6-6.1') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Nhân vật cẩn thận, hay do dự', right: 'Giọng vừa, ngắt trước quyết định' },
        { left: 'Nhân vật táo bạo, tự tin', right: 'Giọng rõ, nhịp nhanh, câu dứt khoát' },
        { left: 'Nhân vật điềm tĩnh, dẫn đường', right: 'Giọng ấm, chậm vừa và ổn định' },
      ],
    }
  }
  if (key === 'L2-K6-6.2') {
    return {
      gameType: 'match',
      pairs: [
        { left: 'Bão và cây cầu sắp sập', right: 'Trống căng nhẹ, gió và tiếng gỗ nứt' },
        { left: 'Khoảnh khắc quyết định', right: 'Nhạc ngừng ngắn rồi dâng lên' },
        { left: 'Sang bờ an toàn', right: 'Giai điệu ấm, tiếng mưa nhỏ dần' },
      ],
    }
  }
  if (key === 'L2-K6-7.1') {
    return {
      gameType: 'place',
      placements: [
        { item: 'Tiếng sấm', target: 'Đúng lúc ánh chớp xuất hiện' },
        { item: 'Tiếng chân chạy', target: 'Khớp nhịp bước nhân vật' },
        { item: 'Câu thoại quyết tâm', target: 'Sau nhịp dừng trước cao trào' },
      ],
    }
  }
  if (key === 'L2-K6-7.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: 'Bản nào hợp cảm giác căng thẳng tăng dần?',
          options: ['Mở chậm để định hướng rồi rút ngắn shot khi chạy', 'Mọi shot dài bằng nhau'],
          answerIndex: 0,
          feedback: 'Thay đổi thời lượng theo hành động tạo nhịp căng dần.',
        },
        {
          prompt: 'Khoảnh khắc quyết định bị lướt quá nhanh. Nên chỉnh gì?',
          options: ['Giữ cận cảnh lâu hơn một nhịp', 'Thêm thật nhiều shot mới'],
          answerIndex: 0,
          feedback: 'Tăng đúng một nhịp cho shot quan trọng giúp khán giả đọc quyết định.',
        },
      ],
    }
  }
  if (key === 'L2-K6-8.1') {
    return {
      gameType: 'order',
      cards: ['K1: Xây thế giới', 'K2: Thiết kế nhân vật', 'K3: Viết câu chuyện', 'K4: Dựng truyện tranh', 'K5: Đạo diễn chuyển động', 'K6: Hoàn thiện phim'],
    }
  }
  if (key === 'L2-K6-8.2') {
    return {
      gameType: 'compare',
      rounds: [
        {
          prompt: '“Vì sao ánh sáng đổi ở shot cuối?” Câu trả lời nào có ý đồ?',
          options: ['Để báo nhân vật đã từ nguy hiểm sang an toàn', 'Vì em thấy màu vàng đẹp'],
          answerIndex: 0,
          feedback: 'Câu A nối lựa chọn hình ảnh với thay đổi trong câu chuyện.',
        },
        {
          prompt: 'Nếu khán giả chưa hiểu bước ngoặt, đạo diễn nên phản hồi thế nào?',
          options: ['Hỏi shot nào gây khó hiểu rồi kiểm tra lại nhịp và hình', 'Giải thích rằng khán giả phải tự hiểu'],
          answerIndex: 0,
          feedback: 'Tìm điểm cụ thể trong bản dựng tạo ra vòng chỉnh sửa dựa trên bằng chứng.',
        },
      ],
    }
  }
  return null
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
    const reviewedGame = reviewedGamePack(track, courseKey, heading[1])
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
        gameType: reviewedGame?.gameType ?? gameType(rows.game[0]),
        gameConfig: {
          cards:
            reviewedGame?.cards ??
            gameCards(
              rows.game[0],
              rows.game[1],
              normalize(heading[2]),
              product,
            ),
          ...(reviewedGame?.groups ? { groups: reviewedGame.groups } : {}),
          ...(reviewedGame?.rounds ? { rounds: reviewedGame.rounds } : {}),
          ...(reviewedGame?.pairs ? { pairs: reviewedGame.pairs } : {}),
          ...(reviewedGame?.placements
            ? { placements: reviewedGame.placements }
            : {}),
        },
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
