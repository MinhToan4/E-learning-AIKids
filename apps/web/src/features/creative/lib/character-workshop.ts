export type CharacterCategoryId = 'shape' | 'parts' | 'face' | 'hair' | 'clothes'

export type CharacterQuestion = {
  subject: string
  label: string
  choices: string[]
}

export const CHARACTER_CATEGORY_LABELS: Record<CharacterCategoryId, string> = {
  shape: 'H├¼nh d├íng',
  parts: 'Tay ch├ón',
  face: 'Khu├┤n mß║╖t',
  hair: 'T├│c & l├┤ng',
  clothes: 'Trang phß╗Ñc',
}

export const CHARACTER_CATEGORIES = Object.keys(
  CHARACTER_CATEGORY_LABELS,
) as CharacterCategoryId[]

export const CHARACTER_QUESTIONS: Record<CharacterCategoryId, CharacterQuestion[]> = {
  shape: [
    { subject: 'Nh├ón vß║¡t', label: 'Nh├ón vß║¡t cß╗ºa con l├á g├¼?', choices: ['con ng╞░ß╗¥i', 'con vß║¡t', '─æß╗ô vß║¡t', 'thß╗▒c vß║¡t', 'robot'] },
    { subject: 'D├íng ng╞░ß╗¥i', label: 'D├íng ng╞░ß╗¥i thß║┐ n├áo?', choices: ['tr├▓n trß╗ïa', 'mß║únh mai', 'nhß╗Å b├⌐', 'cao lß╗¢n', 'm┼⌐m m─⌐m', 'vu├┤ng vß╗⌐c'] },
    { subject: 'Chß║Ñt liß╗çu', label: 'Nh├ón vß║¡t l├ám tß╗½ g├¼?', choices: ['da mß╗üm', 'l├┤ng', 'vß║úi b├┤ng', 'kim loß║íi', 'gß╗ù', 'thß╗ºy tinh'] },
    { subject: 'Cß║úm gi├íc', label: 'Nh├¼n nh├ón vß║¡t c├│ cß║úm gi├íc g├¼?', choices: ['─æ├íng y├¬u', 'vui nhß╗Ön', 'mß║ính mß║╜', 'b├¡ ß║⌐n', 'ngß╗æc nghß║┐ch', 'kß╗│ lß║í'] },
  ],
  parts: [
    { subject: 'Tay', label: 'Tay tr├┤ng nh╞░ thß║┐ n├áo?', choices: ['tay d├ái', 'tay ngß║»n', 'tay m├¿o', 'tay robot', 'c├ính', 'x├║c tu'] },
    { subject: 'Ch├ón', label: 'Ch├ón tr├┤ng nh╞░ thß║┐ n├áo?', choices: ['ch├ón d├ái', 'ch├ón ngß║»n', 'ch├ón m├¿o', '─æu├┤i c├í', 'b├ính xe', 'l├▓ xo'] },
    { subject: 'C├ính', label: 'C├│ c├ính kh├┤ng?', choices: ['kh├┤ng c├│ c├ính', 'c├ính chim', 'c├ính b╞░ß╗¢m', 'c├ính m├íy bay'] },
    { subject: '─Éu├┤i', label: 'C├│ chiß║┐c ─æu├┤i n├áo?', choices: ['kh├┤ng c├│ ─æu├┤i', '─æu├┤i ngß║»n', '─æu├┤i d├ái', '─æu├┤i x├╣ b├┤ng', '─æu├┤i c├í'] },
  ],
  face: [
    { subject: 'Mß║»t', label: '─É├┤i mß║»t thß║┐ n├áo?', choices: ['to tr├▓n', 'nhß╗Å x├¡u', 'lß║Ñp l├ính', 'cß╗Ñp xuß╗æng', 'kh├íc m├áu nhau'] },
    { subject: 'Miß╗çng', label: 'Miß╗çng thß║┐ n├áo?', choices: ['c╞░ß╗¥i t╞░╞íi', 'ngß║¡m kß║╣o m├║t', 'miß╗çng mß║┐u', 'chu m├┤i'] },
    { subject: 'Tai', label: '─É├┤i tai thß║┐ n├áo?', choices: ['tai tr├▓n', 'tai m├¿o', 'tai thß╗Å', 'tai ng╞░ß╗¥i', 'tai robot'] },
    { subject: 'Biß╗âu cß║úm', label: 'Biß╗âu cß║úm h├┤m nay?', choices: ['vui vß║╗', 'tinh nghß╗ïch', 'ngß║íc nhi├¬n', 'lo lß║»ng', 'd┼⌐ng cß║úm'] },
  ],
  hair: [
    { subject: 'Kiß╗âu t├│c/l├┤ng', label: 'T├│c hoß║╖c l├┤ng thß║┐ n├áo?', choices: ['m╞░ß╗út m├á', 'xo─ân t├¡t', 'dß╗▒ng ─æß╗⌐ng', 'lß╗Ön xß╗Ön', 'ph├ít s├íng'] },
    { subject: 'M├áu t├│c/l├┤ng', label: 'M├áu g├¼?', choices: ['n├óu hß║ít dß║╗', 'hß╗ông pastel', 'v├áng kim', '─æen l├íy', 'xanh mint'] },
    { subject: 'Phß╗Ñ kiß╗çn ─æß║ºu', label: '─Éß╗Öi hoß║╖c c├ái g├¼?', choices: ['kh├┤ng phß╗Ñ kiß╗çn', 'n╞í m├áu hß╗ông', 'bß╗¥m tai gß║Ñu', 'kß║╣p t├│c ng├┤i sao'] },
  ],
  clothes: [
    { subject: '├üo', label: 'Mß║╖c ├ío g├¼?', choices: ['hoodie khß╗ºng long', '├ío thun kß║╗ sß╗ìc', '├ío kho├íc len', '├ío cho├áng ph├⌐p thuß║¡t'] },
    { subject: 'Quß║ºn/V├íy', label: 'Mß║╖c quß║ºn hay v├íy?', choices: ['v├íy xß║┐p ly', 'quß║ºn yß║┐m b├▓', 'quß║ºn shorts', 'bß╗Ö ─æß╗ô phi h├ánh gia'] },
    { subject: 'Gi├áy d├⌐p', label: '─Éi gi├áy g├¼?', choices: ['gi├áy thß╗â thao trß║»ng', 'ß╗ºng ─æß╗Å', 'sandal', 'gi├áy ph├ít s├íng'] },
    { subject: 'Phß╗Ñ kiß╗çn', label: 'Mang theo g├¼?', choices: ['kh─ân qu├áng ─æß╗Å', 'ba l├┤ gß║Ñu tr├║c', 't├║i ch├⌐o nhß╗Å', '─æ┼⌐a ph├⌐p'] },
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
    'Friendly expressive pose, simple pastel background, consistent anatomy, polished childrenΓÇÖs animation concept art.',
    'Child-safe and wholesome for ages 6-15; no violence, frightening imagery, adult content, text or watermark.',
  ].filter(Boolean).join(' ')
}
