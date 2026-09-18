import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  FeatureBlockHoverPreview,
  FEATURE_BLOCK_CATEGORY_MAP,
  FEATURE_BLOCK_PEDAGOGY_MAP,
  type FeatureBlockItem,
} from './FeatureBlockHoverPreview'

describe('FeatureBlockHoverPreview Component', () => {
  const mockAnchorRect = {
    top: 200,
    right: 320,
    bottom: 250,
    left: 100,
    width: 220,
    height: 50,
    x: 100,
    y: 200,
    toJSON: () => {},
  } as DOMRect

  const createMockItem = (overrides?: Partial<FeatureBlockItem>): FeatureBlockItem => ({
    id: 'versus-ab',
    name: '2 Ảnh Đối Đầu A/B',
    icon: '🖼️',
    desc: 'Chọn tranh đúng sai, đối kháng A/B',
    badge: 'Hot',
    color: 'border-amber-200 bg-amber-50/80 text-amber-950',
    ...overrides,
  })

  it('returns null when block is null', () => {
    const html = renderToStaticMarkup(
      <FeatureBlockHoverPreview block={null} anchorRect={mockAnchorRect} />
    )
    expect(html).toBe('')
  })

  it('returns null when anchorRect is null', () => {
    const html = renderToStaticMarkup(
      <FeatureBlockHoverPreview block={createMockItem()} anchorRect={null} />
    )
    expect(html).toBe('')
  })

  it('renders preview popup with block title, icon, badge and category', () => {
    const block = createMockItem({
      id: 'versus-ab',
      name: '2 Ảnh Đối Đầu A/B',
      badge: 'Hot',
    })
    const html = renderToStaticMarkup(
      <FeatureBlockHoverPreview block={block} anchorRect={mockAnchorRect} />
    )

    expect(html).toContain('data-testid="feature-block-hover-preview"')
    expect(html).toContain('2 Ảnh Đối Đầu A/B')
    expect(html).toContain('🖼️')
    expect(html).toContain('Hot')
    expect(html).toContain('Hình Ảnh &amp; Đa Phương Tiện')
    expect(html).toContain('data-testid="wireframe-versus-ab"')
    expect(html).toContain('💡 Dùng khi nào:')
    expect(html).toContain('🎯 Trải nghiệm học sinh:')
  })

  it('prefers explicitly provided categoryName prop over mapped category', () => {
    const block = createMockItem({ id: 'versus-ab' })
    const html = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={block}
        anchorRect={mockAnchorRect}
        categoryName="Danh Mục Tùy Biến"
      />
    )

    expect(html).toContain('Danh Mục Tùy Biến')
  })

  it('calculates fixed coordinates based on anchorRect', () => {
    const html = renderToStaticMarkup(
      <FeatureBlockHoverPreview block={createMockItem()} anchorRect={mockAnchorRect} />
    )

    // top = Math.min(800 - 380, Math.max(16, 200 - 20)) = 180px
    // left = 320 + 12 = 332px
    expect(html).toContain('top:180px')
    expect(html).toContain('left:332px')
  })

  it('renders specific wireframe for text layout blocks (course-text / layout-text)', () => {
    const htmlCourseText = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'course-text', name: 'Nội Dung Bài Học' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(htmlCourseText).toContain('data-testid="wireframe-text"')
    expect(htmlCourseText).toContain('Ghi nhớ trọng tâm bài học')

    const htmlLayoutText = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-text', name: '1 Cột Tập Trung' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(htmlLayoutText).toContain('data-testid="wireframe-text"')
  })

  it('renders specific wireframe for four-key blocks (course-four-keys / layout-four-keys)', () => {
    const htmlCourseKeys = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'course-four-keys', name: 'Bộ 4 Chìa Khóa' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(htmlCourseKeys).toContain('data-testid="wireframe-four-keys"')
    expect(htmlCourseKeys).toContain('Cái gì?')
    expect(htmlCourseKeys).toContain('Trông sao?')
    expect(htmlCourseKeys).toContain('Làm gì?')
    expect(htmlCourseKeys).toContain('Ở đâu?')

    const htmlLayoutKeys = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-four-keys', name: 'Bố Cục 4 Chìa Khóa' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(htmlLayoutKeys).toContain('data-testid="wireframe-four-keys"')
  })

  it('renders specific wireframes for storytelling blocks (dialogue, compare, poster, gallery, video, voice)', () => {
    const dialogueHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'dialogue', name: 'Kịch Bản Phân Vai Comic' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(dialogueHtml).toContain('data-testid="wireframe-dialogue"')
    expect(dialogueHtml).toContain('Zico:')
    expect(dialogueHtml).toContain('AIKI:')

    const compareHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'compare', name: 'Bảng So Sánh 2 Cột' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(compareHtml).toContain('data-testid="wireframe-compare"')
    expect(compareHtml).toContain('Trí Não Người')
    expect(compareHtml).toContain('Trí Tuệ AI')

    const posterHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'poster', name: 'Poster Quy Tắc Vàng' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(posterHtml).toContain('data-testid="wireframe-poster"')
    expect(posterHtml).toContain('Quy Tắc Vàng AI')

    const galleryHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'gallery', name: 'Bộ Sưu Tập Ảnh' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(galleryHtml).toContain('data-testid="wireframe-gallery"')
    expect(galleryHtml).toContain('Ảnh 1')

    const imagesHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'images', name: 'Bộ Sưu Tập Ảnh (Gallery)' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(imagesHtml).toContain('data-testid="wireframe-gallery"')
    expect(imagesHtml).toContain('Ảnh 1')

    const videoHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'video', name: 'Video Bài Giảng' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(videoHtml).toContain('data-testid="wireframe-video"')
    expect(videoHtml).toContain('HD')

    const voiceHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'voice', name: 'Giọng Đọc &amp; Lipsync' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(voiceHtml).toContain('data-testid="wireframe-voice"')
    expect(voiceHtml).toContain('AIKI Đọc Bài')
  })

  it('renders specific wireframes for layout blocks (split, two-text, grid, callout, storyboard, formula)', () => {
    const splitHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-split', name: '2 Cột Chữ + Media' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(splitHtml).toContain('data-testid="wireframe-layout-split"')

    const twoTextHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-two-text', name: '2 Cột: 2 Văn Bản Song Song' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(twoTextHtml).toContain('data-testid="wireframe-layout-two-text"')

    const gridHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-grid', name: 'Lưới 3 Ô Thẻ' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(gridHtml).toContain('data-testid="wireframe-layout-grid"')

    const calloutHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-callout', name: 'Hộp Ghi Nhớ Nổi Bật' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(calloutHtml).toContain('data-testid="wireframe-layout-callout"')

    const storyboardHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-storyboard', name: 'Chuỗi Storyboard' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(storyboardHtml).toContain('data-testid="wireframe-layout-storyboard"')

    const formulaHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-formula', name: 'Công Thức KaTeX' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(formulaHtml).toContain('data-testid="wireframe-layout-formula"')
  })

  it('renders specific wireframes for game engine & practice blocks (data-runner, truth-patrol, battle-math, blockly, brief, workflow, studio)', () => {
    const runnerHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'data-runner', name: 'Data Runner' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(runnerHtml).toContain('data-testid="wireframe-data-runner"')

    const truthHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'truth-patrol', name: 'Truth Patrol' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(truthHtml).toContain('data-testid="wireframe-truth-patrol"')

    const battleMathHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'battle-math', name: 'Battle Math' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(battleMathHtml).toContain('data-testid="wireframe-battle-math"')

    const blocklyHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'blockly', name: 'Blockly Code' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(blocklyHtml).toContain('data-testid="wireframe-blockly"')

    const briefHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'practice-brief', name: 'Đề Bài Thực Hành' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(briefHtml).toContain('data-testid="wireframe-practice-brief"')

    const workflowHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'practice-workflow', name: 'Quy Trình 4 Bước' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(workflowHtml).toContain('data-testid="wireframe-practice-workflow"')

    const studioHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'practice-ai-studio', name: '4 Chìa Khóa Ma Thuật' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(studioHtml).toContain('data-testid="wireframe-practice-ai-studio"')

    const prismHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'practice-style-prism', name: 'Lăng Kính Phù Thủy' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(prismHtml).toContain('data-testid="wireframe-practice-style-prism"')

    const doctorHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'practice-prompt-doctor', name: 'Bác Sĩ Câu Lệnh' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(doctorHtml).toContain('data-testid="wireframe-practice-prompt-doctor"')

    const layerHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'practice-layer-stacking', name: '3 Tầng Sân Khấu' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(layerHtml).toContain('data-testid="wireframe-practice-layer-stacking"')

    const lockHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'practice-identity-lock', name: 'Khóa Mật Mã & Biểu Cảm' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(lockHtml).toContain('data-testid="wireframe-practice-identity-lock"')

    const cardForgeHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'practice-card-forge', name: 'Xưởng Đúc Thẻ Bài TCG' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(cardForgeHtml).toContain('data-testid="wireframe-practice-card-forge"')

    const confirmOptionHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'layout-confirm-option', name: 'Phương Án Lựa Chọn (A/B/C)' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(confirmOptionHtml).toContain('data-testid="wireframe-confirm-option"')
  })

  it('renders specific wireframes for assessment & pledge blocks (quiz, ordering, pledge)', () => {
    const quizHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'quiz', name: 'Câu Đố Trắc Nghiệm' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(quizHtml).toContain('data-testid="wireframe-quiz"')

    const orderingHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'ordering', name: 'Kéo Thả Thứ Tự' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(orderingHtml).toContain('data-testid="wireframe-ordering"')

    const pledgeHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'pledge', name: 'Bản Cam Kết Hiệp Sĩ' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(pledgeHtml).toContain('data-testid="wireframe-pledge"')
  })

  it('renders fallback wireframe for unlisted/custom block ids', () => {
    const fallbackHtml = renderToStaticMarkup(
      <FeatureBlockHoverPreview
        block={createMockItem({ id: 'custom-experimental-engine', name: 'Khối Tùy Biến Mới', icon: '🔮' })}
        anchorRect={mockAnchorRect}
      />
    )
    expect(fallbackHtml).toContain('data-testid="wireframe-fallback"')
    expect(fallbackHtml).toContain('Khối Tùy Biến Mới')
    expect(fallbackHtml).toContain('🔮')
  })

  it('provides complete pedagogy descriptions for all 25 standard feature block items', () => {
    const allRegisteredIds = Object.keys(FEATURE_BLOCK_CATEGORY_MAP)
    expect(allRegisteredIds.length).toBeGreaterThanOrEqual(25)

    allRegisteredIds.forEach((id) => {
      const pedagogy = FEATURE_BLOCK_PEDAGOGY_MAP[id]
      expect(pedagogy, `Missing pedagogy guide for block ${id}`).toBeDefined()
      expect(pedagogy.useWhen.length).toBeGreaterThan(10)
      expect(pedagogy.studentSees.length).toBeGreaterThan(10)
    })
  })
})
