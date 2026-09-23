/** Build a child-safe illustration prompt and explicitly exclude photography. */
export function formatAikiCartoonPrompt(rawPrompt: string, mode?: string): string {
  const normalizedMode = (mode || '').toLowerCase()
  const cleanPrompt = (rawPrompt || '').trim()

  if (normalizedMode === 'style-prism') {
    const prompt = cleanPrompt.toLowerCase()
    let specificStyle = ''
    if (prompt.includes('màu nước') || prompt.includes('watercolor')) {
      specificStyle = 'whimsical vibrant watercolor children book illustration style with soft organic translucent washes'
    } else if (prompt.includes('đất nặn') || prompt.includes('clay')) {
      specificStyle = 'handcrafted 3D soft clay sculpture style with smooth rounded clay diorama texture'
    } else if (prompt.includes('truyện tranh') || prompt.includes('chibi') || prompt.includes('manga') || prompt.includes('comic')) {
      specificStyle = 'adorable chibi anime manga comic book style with crisp bold friendly line art'
    } else if (prompt.includes('đông hồ') || prompt.includes('dân gian')) {
      specificStyle = 'stylized Vietnamese Dong Ho folk woodblock art style on rustic textured background'
    }

    if (specificStyle) {
      return `Cute 3D cartoon animation style, ${specificStyle}, vibrant warm pastel colors, charming playful children's illustration. Subject: ${cleanPrompt}. Friendly warm studio lighting, 3D animated character art. Strictly avoid realistic photo, no camera photography, no photorealism, no real humans, no real-life photograph.`
    }
  }

  return `Cute 3D cartoon animation style, soft clay storybook illustration, vibrant warm pastel colors, smooth clay diorama render, charming playful children's illustration. Subject: ${cleanPrompt}. Friendly warm studio lighting, 3D animated character art. Strictly avoid realistic photo, no camera photography, no photorealism, no real humans, no real-life photograph.`
}

const CHARACTER_ARTWORK: Array<[string[], string]> = [
  [['cún', 'chó', 'dog'], '/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp'],
  [['mèo', 'cat'], '/assets/aiki-islands/island1_lesson1_cat.jpg'],
  [['sóc', 'fox', 'cáo', 'squirrel'], '/assets/aiki-islands/island3_lesson2_opt_b.jpg'],
  [['xe', 'đạp', 'bicycle'], '/assets/aiki-islands/island1_lesson2_bicycle.jpg'],
  [['sổ', 'sách', 'notebook'], '/assets/aiki-islands/island1_lesson2_notebook.jpg'],
  [['đồng hồ', 'clock'], '/assets/aiki-islands/island1_lesson2_clock.jpg'],
  [['cốc', 'ly', 'teacup', 'tách trà'], '/assets/aiki-islands/island1_lesson2_teacup.jpg'],
  [['màu nước', 'watercolor'], '/assets/aiki-islands/island1_lesson3_opt_a.jpg'],
  [['quilling', 'cuộn giấy'], '/assets/aiki-islands/island1_lesson3_opt_b.jpg'],
  [['đất sét', 'clay'], '/assets/aiki-islands/island1_lesson3_styles.jpg'],
  [['kỹ sư', '5 ngón', 'bàn tay'], '/assets/aiki-islands/island1_lesson4_engineer.jpg'],
  [['ghế mây'], '/assets/aiki-islands/island1_lesson1_cat.jpg'],
]

const LESSON_ARTWORK: Array<[string[], string[], string]> = [
  [['cat-fat'], ['1-1', '1.1'], '/assets/aiki-islands/island1_lesson1_cat.jpg'],
  [['teacup'], ['1-2', '1.2'], '/assets/aiki-islands/island1_lesson2_teacup.jpg'],
  [['four-styles'], ['1-3', '1.3'], '/assets/aiki-islands/island1_lesson3_styles.jpg'],
  [['engineer-fix'], ['1-4', '1.4'], '/assets/aiki-islands/island1_lesson4_engineer.jpg'],
  [['storytelling'], ['2-1', '2.1'], '/assets/aiki-islands/island2_lesson1_story.jpg'],
  [['magic-forest'], ['2-2', '2.2'], '/assets/aiki-islands/island2_lesson2_star.jpg'],
  [['color-emotions'], ['2-3', '2.3'], '/assets/aiki-islands/island2_lesson3_colors.jpg'],
  [['gallery-frame'], ['2-4', '2.4'], '/assets/aiki-islands/island2_lesson4_masterpiece.jpg'],
  [['profile-dna'], ['3-1', '3.1'], '/assets/aiki-islands/island3_lesson1_profile.jpg'],
  [['fire-fox'], ['3-2', '3.2'], '/assets/aiki-islands/island3_lesson2_opt_b.jpg'],
  [['six-expressions'], ['3-3', '3.3'], '/assets/aiki-islands/island3_lesson3_expressions.jpg'],
  [['tree-hollow-base'], ['3-4', '3.4'], '/assets/aiki-islands/island3_lesson4_base.jpg'],
  [[], ['4-1', '4.1'], '/assets/aiki-islands/island4_lesson1_3gates.jpg'],
  [[], ['4-2', '4.2'], '/assets/aiki-islands/island4_lesson2_4beats.jpg'],
  [[], ['4-3', '4.3'], '/assets/aiki-islands/island4_lesson3_storyboard1.jpg'],
  [[], ['4-4', '4.4'], '/assets/aiki-islands/island4_lesson4_storyboard2.jpg'],
  [[], ['4-5', '4.5'], '/assets/aiki-islands/island4_lesson5_comicbook.jpg'],
  [[], ['5-1', '5.1'], '/assets/aiki-islands/island5_lesson1_hunting.jpg'],
  [[], ['5-2', '5.2'], '/assets/aiki-islands/island5_lesson2_magic.jpg'],
  [[], ['5-3', '5.3'], '/assets/aiki-islands/island5_lesson3_lockcards.jpg'],
  [[], ['5-4', '5.4'], '/assets/aiki-islands/island5_lesson4_rules.jpg'],
  [[], ['5-5', '5.5'], '/assets/aiki-islands/island5_lesson5_arena.jpg'],
]

export function getStudioAIArtwork(type?: string, lessonId?: string, characterName?: string): string {
  const normalizedType = (type || '').toLowerCase()
  const normalizedLesson = (lessonId || '').toLowerCase()
  const normalizedCharacter = (characterName || '').toLowerCase()

  const characterMatch = CHARACTER_ARTWORK.find(([keywords]) =>
    keywords.some((keyword) => normalizedCharacter.includes(keyword)),
  )
  if (characterMatch) return characterMatch[1]

  const lessonMatch = LESSON_ARTWORK.find(([types, lessonKeys]) =>
    types.includes(normalizedType) || lessonKeys.some((key) => normalizedLesson.includes(key)),
  )
  return lessonMatch?.[2] ?? '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
}
