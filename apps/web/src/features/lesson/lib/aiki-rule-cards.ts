import type { QuestDetail } from '@/shared/lib/api'
import type { AikiRule } from '@/features/rules/types'

export function hydrateAikiRuleCard(card: QuestDetail['learnCards'][number]): QuestDetail['learnCards'][number] {
  const encodedItem = card.visualItems?.find((item) => item.label === '__AIKI_RULE_STAGE__')
  if (encodedItem) {
    try {
      const meta = JSON.parse(encodedItem.text)
      const visualItems = card.visualItems?.filter((item) => item.label !== '__AIKI_RULE_STAGE__')
      return {
        ...card,
        ...meta,
        visualItems,
      }
    } catch {
      /* ignore and fallback to tip */
    }
  }

  if (card.tip && card.tip.includes('__AIKI_RULE_STAGE__')) {
    const match = card.tip.match(/<!--__AIKI_RULE_STAGE__:(.*?)-->/)
    if (match) {
      try {
        const meta = JSON.parse(match[1])
        return {
          ...card,
          ...meta,
        }
      } catch {
        return card
      }
    }
  }

  return card
}

export function createAikiRuleCardsFromData(rule: AikiRule): QuestDetail['learnCards'] {
  return [
    // Chặng 0: Tình huống
    {
      id: `rule-${rule.id}-situation`,
      title: `1. Tình huống: ${rule.shortTitle}`,
      kind: 'situation',
      body: rule.slides[0]?.dialogue || 'Cùng lắng nghe tình huống nhé!',
      tip: rule.akiTip,
      imageUrl: rule.slides[0]?.image || rule.posterImage,
      dialogueLines: rule.slides.map((s, idx) => ({
        id: `d-${idx}`,
        speaker: s.speaker.toLowerCase().includes('sonet') ? 'sonet' : s.speaker.toLowerCase().includes('zico') ? 'zico' : 'aki',
        role: s.speaker.toLowerCase().includes('sonet') ? 'right' : s.speaker.toLowerCase().includes('zico') ? 'left' : 'center',
        text: s.dialogue,
      })),
      enabledModules: ['images', 'dialogue'],
      mee: {
        gesture: 'presentation',
        readText: rule.slides[0]?.dialogue || 'Cùng lắng nghe tình huống nhé!',
      },
    },
    // Chặng 1: Thử tài
    {
      id: `rule-${rule.id}-riddle`,
      title: '2. Thử tài phản xạ',
      kind: 'aiki-riddle',
      body: rule.questions[0]?.prompt || 'Bức tranh nào thể hiện đúng quy tắc?',
      tip: rule.questions[0]?.hint,
      optionImages: [
        rule.slides[1]?.image || `/assets/aiki-rules/rule${rule.id}_opt_a.webp`,
        rule.slides[2]?.image || `/assets/aiki-rules/rule${rule.id}_opt_b.webp`,
      ],
      optionLabels: [
        rule.questions[0]?.options[0] || 'Phương án A',
        rule.questions[0]?.options[1] || 'Phương án B',
      ],
      optionDescs: [
        rule.questions[0]?.hint || 'Phương án A',
        rule.questions[0]?.successFeedback || 'Phương án B',
      ],
      enabledModules: ['versus-ab'],
      mee: {
        gesture: 'think',
        readText: rule.questions[0]?.prompt || 'Con hãy chọn bức tranh đúng nhé!',
      },
    },
    // Chặng 2: Poster Quy tắc Vàng
    {
      id: `rule-${rule.id}-rule`,
      title: '3. Poster Quy tắc Vàng',
      kind: 'rule',
      imageUrl: rule.posterImage,
      body: rule.audioVoiceText || rule.title,
      tip: rule.akiTip,
      enabledModules: ['poster'],
      mee: {
        gesture: 'idea',
        readText: rule.audioVoiceText || rule.title,
      },
    },
    // Chặng 3: Giải thích & So sánh
    {
      id: `rule-${rule.id}-explanation`,
      title: '4. So sánh cùng AIKI',
      kind: 'explanation',
      compareData: {
        leftTitle: 'Kho Dữ Liệu Của AI',
        leftText: rule.compareMindset?.aiWarehouse || 'AI chỉ lấy những hình ảnh quen thuộc trong kho hàng ngàn mẫu có sẵn. Ai gõ câu giống nhau thì kết quả cũng giống hệt nhau.',
        rightTitle: 'Bộ Não Sáng Tạo Của Con',
        rightText: rule.compareMindset?.kidMind || 'Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình và sự tưởng tượng độc đáo mà AI không thể tự nghĩ ra được!',
        leftImage: '/assets/aiki-rules/aiki_compare_ai_warehouse.webp',
        rightImage: '/assets/aiki-rules/aiki_compare_kid_mind.webp',
      },
      compareImages: {
        left: '/assets/aiki-rules/aiki_compare_ai_warehouse.webp',
        right: '/assets/aiki-rules/aiki_compare_kid_mind.webp',
      },
      enabledModules: ['compare'],
      mee: {
        gesture: 'point-left',
        readText: 'Kho dữ liệu AI chỉ có mẫu quen thuộc, còn ý tưởng độc đáo nằm trong đầu con!',
      },
    },
    // Chặng 4: Cam kết
    {
      id: `rule-${rule.id}-closing`,
      title: '5. Cam kết Hiệp Sĩ',
      kind: 'closing',
      imageUrl: rule.posterImage,
      body: rule.knightCommitment || 'Con cam kết luôn dùng ý tưởng độc đáo của riêng mình!',
      enabledModules: ['poster'],
      mee: {
        gesture: 'celebrate',
        readText: 'Chúc mừng Hiệp Sĩ Sáng Tạo mới của Xưởng AIKI!',
      },
    },
  ] as QuestDetail['learnCards']
}
