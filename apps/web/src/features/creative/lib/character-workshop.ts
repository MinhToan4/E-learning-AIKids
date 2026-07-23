export type CharacterCategoryId = 'shape' | 'parts' | 'face' | 'hair' | 'clothes'

export type CharacterQuestion = {
  subject: string
  label: string
  choices: string[]
}

export const CHARACTER_CATEGORY_LABELS: Record<CharacterCategoryId, string> = {
  shape: 'Hình dáng',
  parts: 'Tay chân',
  face: 'Khuôn mặt',
  hair: 'Tóc & lông',
  clothes: 'Trang phục',
}

export const CHARACTER_CATEGORIES = Object.keys(
  CHARACTER_CATEGORY_LABELS,
) as CharacterCategoryId[]

export const CHARACTER_QUESTIONS: Record<CharacterCategoryId, CharacterQuestion[]> = {
  shape: [
    { subject: 'Nhân vật', label: 'Nhân vật của con là gì?', choices: ['con người', 'con vật', 'đồ vật', 'thực vật', 'robot'] },
    { subject: 'Dáng người', label: 'Dáng người thế nào?', choices: ['tròn trịa', 'mảnh mai', 'nhỏ bé', 'cao lớn', 'mũm mĩm', 'vuông vức'] },
    { subject: 'Chất liệu', label: 'Nhân vật làm từ gì?', choices: ['da mềm', 'lông', 'vải bông', 'kim loại', 'gỗ', 'thủy tinh'] },
    { subject: 'Cảm giác', label: 'Nhìn nhân vật có cảm giác gì?', choices: ['đáng yêu', 'vui nhộn', 'mạnh mẽ', 'bí ẩn', 'ngốc nghếch', 'kỳ lạ'] },
  ],
  parts: [
    { subject: 'Tay', label: 'Tay trông như thế nào?', choices: ['tay dài', 'tay ngắn', 'tay mèo', 'tay robot', 'cánh', 'xúc tu'] },
    { subject: 'Chân', label: 'Chân trông như thế nào?', choices: ['chân dài', 'chân ngắn', 'chân mèo', 'đuôi cá', 'bánh xe', 'lò xo'] },
    { subject: 'Cánh', label: 'Có cánh không?', choices: ['không có cánh', 'cánh chim', 'cánh bướm', 'cánh máy bay'] },
    { subject: 'Đuôi', label: 'Có chiếc đuôi nào?', choices: ['không có đuôi', 'đuôi ngắn', 'đuôi dài', 'đuôi xù bông', 'đuôi cá'] },
  ],
  face: [
    { subject: 'Mắt', label: 'Đôi mắt thế nào?', choices: ['to tròn', 'nhỏ xíu', 'lấp lánh', 'cụp xuống', 'khác màu nhau'] },
    { subject: 'Miệng', label: 'Miệng thế nào?', choices: ['cười tươi', 'ngậm kẹo mút', 'miệng mếu', 'chu môi'] },
    { subject: 'Tai', label: 'Đôi tai thế nào?', choices: ['tai tròn', 'tai mèo', 'tai thỏ', 'tai người', 'tai robot'] },
    { subject: 'Biểu cảm', label: 'Biểu cảm hôm nay?', choices: ['vui vẻ', 'tinh nghịch', 'ngạc nhiên', 'lo lắng', 'dũng cảm'] },
  ],
  hair: [
    { subject: 'Kiểu tóc/lông', label: 'Tóc hoặc lông thế nào?', choices: ['mượt mà', 'xoăn tít', 'dựng đứng', 'lộn xộn', 'phát sáng'] },
    { subject: 'Màu tóc/lông', label: 'Màu gì?', choices: ['nâu hạt dẻ', 'hồng pastel', 'vàng kim', 'đen láy', 'xanh mint'] },
    { subject: 'Phụ kiện đầu', label: 'Đội hoặc cài gì?', choices: ['không phụ kiện', 'nơ màu hồng', 'bờm tai gấu', 'kẹp tóc ngôi sao'] },
  ],
  clothes: [
    { subject: 'Áo', label: 'Mặc áo gì?', choices: ['hoodie khủng long', 'áo thun kẻ sọc', 'áo khoác len', 'áo choàng phép thuật'] },
    { subject: 'Quần/Váy', label: 'Mặc quần hay váy?', choices: ['váy xếp ly', 'quần yếm bò', 'quần shorts', 'bộ đồ phi hành gia'] },
    { subject: 'Giày dép', label: 'Đi giày gì?', choices: ['giày thể thao trắng', 'ủng đỏ', 'sandal', 'giày phát sáng'] },
    { subject: 'Phụ kiện', label: 'Mang theo gì?', choices: ['khăn quàng đỏ', 'ba lô gấu trúc', 'túi chéo nhỏ', 'đũa phép'] },
  ],
}

export type CharacterAnswers = Partial<Record<string, string>>

export function buildCharacterPrompt(idea: string, answers: CharacterAnswers): string {
  const details = Object.entries(answers)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0)
    .map(([subject, value]) => `${subject}: ${value}`)
    .join('. ')
  return [
    'Create a full-body original character illustration for a child.',
    idea.trim() ? `Core idea: ${idea.trim()}.` : '',
    details ? `Character details: ${details}.` : '',
    'Friendly expressive pose, simple pastel background, consistent anatomy, polished children’s animation concept art.',
    'Child-safe and wholesome for ages 6-15; no violence, frightening imagery, adult content, text or watermark.',
  ].filter(Boolean).join(' ')
}
