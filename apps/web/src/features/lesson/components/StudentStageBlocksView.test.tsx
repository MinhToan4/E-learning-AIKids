import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StudentStageBlocksView } from './StudentStageBlocksView'
import type { LearnCardDraft, StageBlockItem } from '@/features/teacher/lib/authoring'

describe('StudentStageBlocksView', () => {
  const baseCard: LearnCardDraft = {
    id: 'card-1',
    title: 'Khái niệm Robot và AI',
    body: 'Robot là cỗ máy tự động, còn AI là trí thông minh bên trong.',
    tip: 'Hãy nhớ rằng AI cần con người chỉ huy.',
    kind: 'concept',
    layout: 'text',
    visualItems: [],
  }

  it('renders blocks in exact WYSIWYG order when order is changed (e.g. Text before Video, or Video before KaTeX)', () => {
    // Trường hợp 1: Text trước, Video sau
    const blocksTextFirst: StageBlockItem[] = [
      {
        id: 'blk-text-1',
        type: 'text',
        title: 'Đoạn văn bản mở đầu',
        body: 'Nội dung giải thích trước khi xem video.',
      },
      {
        id: 'blk-video-1',
        type: 'video',
        title: 'Video minh họa nguyên lý',
        videoUrl: 'https://cdn.example.com/demo.mp4',
      },
    ]

    const cardTextFirst: LearnCardDraft = {
      ...baseCard,
      contentBlocks: blocksTextFirst,
    }

    const html1 = renderToStaticMarkup(
      <StudentStageBlocksView card={cardTextFirst} stageIndex={0} />
    )

    const textIdx1 = html1.indexOf('data-testid="block-text"')
    const videoIdx1 = html1.indexOf('data-testid="block-video"')
    expect(textIdx1).toBeGreaterThan(-1)
    expect(videoIdx1).toBeGreaterThan(-1)
    expect(textIdx1).toBeLessThan(videoIdx1)
    expect(html1).toContain('Đoạn văn bản mở đầu')
    expect(html1).toContain('Video minh họa nguyên lý')

    // Trường hợp 2: Đảo ngược thứ tự: Video trước, KaTeX ở giữa, Text ở cuối
    const blocksVideoFirst: StageBlockItem[] = [
      {
        id: 'blk-video-2',
        type: 'video',
        title: 'Video khởi động',
        videoUrl: 'https://cdn.example.com/intro.mp4',
      },
      {
        id: 'blk-formula-2',
        type: 'layout-formula',
        title: 'Công Thức KaTeX Nổi Bật',
        formula: '$$E = mc^2$$',
      },
      {
        id: 'blk-text-2',
        type: 'text',
        title: 'Ghi chú bổ sung',
        body: 'Văn bản đúc kết sau công thức.',
      },
    ]

    const cardVideoFirst: LearnCardDraft = {
      ...baseCard,
      contentBlocks: blocksVideoFirst,
    }

    const html2 = renderToStaticMarkup(
      <StudentStageBlocksView card={cardVideoFirst} stageIndex={0} />
    )

    const videoIdx2 = html2.indexOf('data-testid="block-video"')
    const formulaIdx2 = html2.indexOf('data-testid="block-layout-formula"')
    const textIdx2 = html2.indexOf('data-testid="block-text"')

    expect(videoIdx2).toBeGreaterThan(-1)
    expect(formulaIdx2).toBeGreaterThan(-1)
    expect(textIdx2).toBeGreaterThan(-1)

    // Thứ tự Video < KaTeX < Text
    expect(videoIdx2).toBeLessThan(formulaIdx2)
    expect(formulaIdx2).toBeLessThan(textIdx2)
  })

  it('renders all modern block types accurately (callout, split, grid, storyboard, dialogue, versus-ab, compare, poster, voice, images)', () => {
    const allFeatureBlocks: StageBlockItem[] = [
      {
        id: 'blk-callout',
        type: 'layout-callout',
        title: 'Hộp Ghi Nhớ Nổi Bật',
        tip: 'AI không tự sinh ra ký ức riêng của con!',
      },
      {
        id: 'blk-split',
        type: 'layout-split',
        title: 'Bố Cục 2 Cột Chữ & Media',
        body: 'Bên trái là chữ, bên phải là tranh minh họa tuyệt đẹp.',
        imageUrl: 'https://cdn.example.com/split-art.jpg',
      },
      {
        id: 'blk-grid',
        type: 'layout-grid',
        title: 'Lưới 3 Ô Thẻ Khái Niệm',
        visualItems: [
          { label: 'Thẻ 1', text: 'Nhận thức thế giới' },
          { label: 'Thẻ 2', text: 'Xử lý dữ liệu' },
          { label: 'Thẻ 3', text: 'Đưa ra quyết định' },
        ],
      },
      {
        id: 'blk-storyboard',
        type: 'layout-storyboard',
        title: 'Chuỗi Storyboard Phân Cảnh',
        visualItems: [
          { label: 'Cảnh 1', text: 'Mèo AIKI xuất hiện', shot: 'Toàn cảnh' },
          { label: 'Cảnh 2', text: 'Gặp gỡ bạn nhỏ', shot: 'Trung cảnh' },
        ],
      },
      {
        id: 'blk-dialogue',
        type: 'dialogue',
        title: 'Kịch bản Phân vai Tình huống',
        dialogueLines: [
          { id: 'd-1', speaker: 'zico', role: 'left', text: 'Tranh của tớ đẹp nhất!' },
          { id: 'd-2', speaker: 'sonet', role: 'right', text: 'Tranh của tớ có chuyện gia đình!' },
        ],
      },
      {
        id: 'blk-versus-ab',
        type: 'versus-ab',
        title: 'Câu đố chọn tranh A/B',
        body: 'Bức tranh nào thể hiện ý tưởng độc nhất?',
        optionLabels: ['Phương án Zico', 'Phương án Sonet'],
        optionDescs: ['Vẽ theo phim', 'Bố cầm vợt muỗi'],
      },
      {
        id: 'blk-compare',
        type: 'compare',
        title: 'Bảng So Sánh 2 Cột',
        compareData: {
          leftTitle: 'Kho Dữ Liệu AI',
          rightTitle: 'Bộ Não Sáng Tạo Con',
        },
      },
      {
        id: 'blk-poster',
        type: 'poster',
        posterText: 'Ý TƯỞNG CỦA CON LÀ SỐ 1 · AI CHỈ LÀ TRỢ LÝ!',
        tip: 'Quy tắc vàng số 1 cần khắc ghi',
      },
      {
        id: 'blk-voice',
        type: 'voice',
        readText: 'Mèo AIKI chào đón các bạn nhỏ khám phá thế giới AI!',
      },
      {
        id: 'blk-images',
        type: 'images',
        imageUrl: 'https://cdn.example.com/hero-art.jpg',
        imageAlt: 'Tranh chính',
      },
    ]

    const cardWithAllBlocks: LearnCardDraft = {
      ...baseCard,
      contentBlocks: allFeatureBlocks,
    }

    const html = renderToStaticMarkup(
      <StudentStageBlocksView card={cardWithAllBlocks} stageIndex={0} />
    )

    expect(html).toContain('data-testid="block-layout-callout"')
    expect(html).toContain('AI không tự sinh ra ký ức riêng của con!')

    expect(html).toContain('data-testid="block-layout-split"')
    expect(html).toContain('Bố Cục 2 Cột Chữ &amp; Media')

    expect(html).toContain('data-testid="block-layout-grid"')
    expect(html).toContain('Nhận thức thế giới')

    expect(html).toContain('data-testid="block-layout-storyboard"')
    expect(html).toContain('Chuỗi Storyboard Phân Cảnh')

    expect(html).toContain('data-testid="block-dialogue"')
    expect(html).toContain('Tranh của tớ có chuyện gia đình!')

    expect(html).toContain('data-testid="block-versus-ab"')
    expect(html).toContain('Bức tranh nào thể hiện ý tưởng độc nhất?')

    expect(html).toContain('data-testid="block-compare"')
    expect(html).toContain('Kho Dữ Liệu AI')
    expect(html).toContain('Bộ Não Sáng Tạo Con')

    expect(html).toContain('data-testid="block-poster"')
    expect(html).toContain('Ý TƯỞNG CỦA CON LÀ SỐ 1 · AI CHỈ LÀ TRỢ LÝ!')

    expect(html).toContain('data-testid="block-voice"')
    expect(html).toContain('Mèo AIKI chào đón các bạn nhỏ khám phá thế giới AI!')

    expect(html).toContain('data-testid="block-images"')
    expect(html).toContain('hero-art.jpg')
  })

  it('maintains backwards compatibility for legacy lesson cards without contentBlocks', () => {
    // 1. Legacy card chỉ có video và text
    const legacyVideoCard: LearnCardDraft = {
      id: 'legacy-1',
      title: 'Bài Giảng Cũ Không Có ContentBlocks',
      body: 'Nội dung bài học thời kỳ đầu.',
      tip: 'Mẹo ôn tập nhanh.',
      kind: 'concept',
      layout: 'text',
      videoUrl: 'https://cdn.example.com/legacy.mp4',
      visualItems: [],
    }

    const htmlVideo = renderToStaticMarkup(
      <StudentStageBlocksView card={legacyVideoCard} stageIndex={0} />
    )

    // Tự động phân giải qua getStageBlocks: có block-text và block-video
    expect(htmlVideo).toContain('data-testid="block-text"')
    expect(htmlVideo).toContain('data-testid="block-video"')
    expect(htmlVideo).toContain('Nội dung bài học thời kỳ đầu.')

    // 2. Legacy card Aiki Rule chặng 1 (A/B Riddle)
    const legacyRiddleCard: LearnCardDraft = {
      id: 'legacy-2',
      title: 'Chặng 2 Câu đố',
      body: 'Bức tranh nào đúng yêu cầu của cô giáo?',
      tip: 'Zico vẽ đẹp nhưng Sonet có câu chuyện riêng.',
      kind: 'aiki-riddle',
      layout: 'text',
      optionImages: ['https://cdn.example.com/optA.jpg', 'https://cdn.example.com/optB.jpg'],
      optionLabels: ['Zico', 'Sonet'],
      visualItems: [],
    }

    const htmlRiddle = renderToStaticMarkup(
      <StudentStageBlocksView card={legacyRiddleCard} stageIndex={1} isAikiRuleJourney={true} />
    )

    expect(htmlRiddle).toContain('data-testid="block-versus-ab"')
    expect(htmlRiddle).toContain('Bức tranh nào đúng yêu cầu của cô giáo?')
  })

  it('renders Hero image at the beginning of Stage 1 (situation) when imageUrl is set', () => {
    const station1SituationCard: LearnCardDraft = {
      id: 'qt1-situation',
      title: '1. Tình huống',
      body: 'Zico và Sonet tranh cãi về bức tranh.',
      tip: 'Ai cũng nghĩ mình đúng.',
      kind: 'situation',
      layout: 'text',
      imageUrl: '/assets/aiki-rules/rule1_superhero_dad.jpg',
      dialogueLines: [
        { id: 'd1', speaker: 'zico', role: 'left', text: 'Của tớ đẹp hơn!' },
        { id: 'd2', speaker: 'sonet', role: 'right', text: 'Không, của tớ đúng hơn!' },
      ],
      visualItems: [],
    }

    const html = renderToStaticMarkup(
      <StudentStageBlocksView card={station1SituationCard} stageIndex={0} isAikiRuleJourney={true} />
    )

    expect(html).toContain('data-testid="block-images"')
    expect(html).toContain('rule1_superhero_dad.jpg')
    expect(html).toContain('data-testid="block-dialogue"')
    // Hero image appears before dialogue
    const imgIdx = html.indexOf('data-testid="block-images"')
    const dlgIdx = html.indexOf('data-testid="block-dialogue"')
    expect(imgIdx).toBeLessThan(dlgIdx)
  })

  it('falls back to station-specific A/B images for QT2 and overrides Zico labels', () => {
    const station2RiddleCard: LearnCardDraft = {
      id: 'qt2-riddle',
      title: '2. Câu đố của AIKI',
      body: 'Tờ giấy tìm chó lạc còn thiếu điều quan trọng gì?',
      tip: '',
      kind: 'aiki-riddle',
      layout: 'text',
      // Giả sử có nhãn Zico sót lại từ template cũ:
      optionLabels: ['Ảnh A: Bức tranh của Zico', 'Ảnh B: Bức tranh của Sonet'],
      visualItems: [],
    }

    const questStation2 = {
      id: 'quest-qt2',
      title: 'QT2 — Nội dung là do cậu viết',
      check: [
        {
          id: 'check-qt2',
          question: 'Tờ giấy tìm chó lạc còn thiếu điều quan trọng gì?',
          options: ['Thiếu chi tiết riêng đặc biệt của Bông', 'Thiếu chữ trang trí đẹp mắt'],
        },
      ],
    }

    const html = renderToStaticMarkup(
      <StudentStageBlocksView
        card={station2RiddleCard}
        stageIndex={1}
        isAikiRuleJourney={true}
        quest={questStation2}
      />
    )

    expect(html).toContain('data-testid="block-versus-ab"')
    // Fallback image cho trạm 2 phải là rule2_opt_a.jpg và rule2_opt_b.jpg
    expect(html).toContain('rule2_opt_a.jpg')
    expect(html).toContain('rule2_opt_b.jpg')
    // Không được chứa nhãn Zico
    expect(html).not.toContain('Bức tranh của Zico')
    // Chứa nhãn được parse từ options
    expect(html).toContain('Thiếu chi tiết riêng đặc biệt của Bông')
  })

  it('renders the CMS four-key template with the same four editable items', () => {
    const html = renderToStaticMarkup(
      <StudentStageBlocksView
        stageIndex={0}
        card={{
          ...baseCard,
          contentBlocks: [{
            id: 'four-keys',
            type: 'layout-four-keys',
            title: 'Bốn chiếc chìa khóa',
            body: 'Ghép đủ bốn chìa khóa.',
            tip: 'Đủ 4 chìa là hết đoán bừa!',
            visualItems: [
              { label: 'Cái gì?', text: 'Chiếc cốc', tone: 'sky' },
              { label: 'Trông như thế nào?', text: 'Sứ trắng mẻ miệng', tone: 'sun' },
              { label: 'Đang làm gì?', text: 'Đang bốc khói', tone: 'coral' },
              { label: 'Ở đâu?', text: 'Trên bàn gỗ', tone: 'brand' },
            ],
          }],
        }}
      />
    )

    expect(html).toContain('data-testid="block-layout-four-keys"')
    expect(html.match(/Chìa khóa [1-4]/g)).toHaveLength(4)
    expect(html).toContain('Sứ trắng mẻ miệng')
    expect(html).toContain('Đủ 4 chìa là hết đoán bừa!')
  })
})
