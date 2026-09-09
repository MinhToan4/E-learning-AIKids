import { describe, it, expect } from 'vitest'
import {
  analyzeLessonScript,
  generateNewCharacterPromptVi,
  generateNewBackgroundPromptVi,
  PRESET_CHARACTERS,
  PRESET_BACKGROUNDS,
} from './script-analyzer'

describe('script-analyzer engine', () => {
  const sampleScript = `
Trạm 1: Hành Trình Làm Quen Với AI
Mèo AKI: Xin chào các bạn nhỏ, tớ là AKI! Hôm nay chúng mình sẽ cùng khám phá trí tuệ nhân tạo nhé!
Bé Bo: Ôi tuyệt quá Mèo AKI ơi! Tớ muốn học cách vẽ tranh trên máy tính bảng!
Robot Pi: Tớ là Pi, trợ lý robot mới đến từ Trạm vũ trụ AI. Tớ có thể lập trình trên laptop cùng các bạn!
Mèo AKI: Quy tắc Vàng số 1: Luôn hỏi ý kiến cha mẹ khi chia sẻ thông tin trên mạng nhé!

Trạm 2: Đấu Trí Cùng Thử Thách AI
Bé Bo: Đố bạn biết AI có thể tự nghĩ ra cảm xúc thật không?
Robot Pi: Chúng mình cùng mở màn hình cảm ứng để làm bài kiểm tra nào!
Cô Sonet: Sonet khuyên các bạn hãy cẩn thận kiểm tra nguồn dữ liệu trước khi tin tưởng nhé.
`

  it('nhận diện đúng Mèo AKI và Cô Sonet là nhân vật quen thuộc (isPreset: true, status: ready)', () => {
    const result = analyzeLessonScript(sampleScript)

    const aki = result.knownCharacters.find((c) => c.name.toLowerCase().includes('aki'))
    expect(aki).toBeDefined()
    expect(aki?.isPreset).toBe(true)
    expect(aki?.status).toBe('ready')

    const sonet = result.knownCharacters.find((c) => c.name.toLowerCase().includes('sonet'))
    expect(sonet).toBeDefined()
    expect(sonet?.isPreset).toBe(true)
    expect(sonet?.status).toBe('ready')
  })

  it('phát hiện nhân vật mới (Bé Bo, Robot Pi) và sinh prompt tiếng Việt đúng chuẩn Soft Clay trên nền trơn', () => {
    const result = analyzeLessonScript(sampleScript)

    const bo = result.newCharacters.find((c) => c.name.includes('Bé Bo') || c.name.includes('Bo'))
    const pi = result.newCharacters.find((c) => c.name.includes('Robot Pi') || c.name.includes('Pi'))

    expect(bo).toBeDefined()
    expect(bo?.isPreset).toBe(false)
    expect(bo?.status).toBe('needs_art')
    expect(bo?.promptVi).toContain('2D Flat Soft Clay')
    expect(bo?.promptVi).toContain('bo cong mềm mại')
    expect(bo?.promptVi).toContain('ấm áp')
    expect(bo?.promptVi).toContain('trên nền trơn studio pastel')
    expect(bo?.promptVi).toContain('có nhãn tên')
    expect(bo?.promptVi).toContain('ở bên dưới chân')

    expect(pi).toBeDefined()
    expect(pi?.isPreset).toBe(false)
    expect(pi?.status).toBe('needs_art')
    expect(pi?.promptVi).toContain('2D Flat Soft Clay')
  })

  it('phát hiện bối cảnh và gom cụm bối cảnh tối đa 2-3 bối cảnh', () => {
    const scriptWithManyBgs = `
Địa điểm: Lớp học AI
Cảnh 1: Ở Công viên kỳ diệu
Cảnh 2: Tại Trạm vũ trụ AI
Cảnh 3: Đến Thư viện thần tiên
Cảnh 4: Quay về Nông trại thông minh
`
    const result = analyzeLessonScript(scriptWithManyBgs)

    // Bối cảnh quen thuộc Lớp học AI
    const classBg = result.knownBackgrounds.find((bg) => bg.name.includes('Lớp học'))
    expect(classBg).toBeDefined()
    expect(classBg?.isPreset).toBe(true)

    // Gom cụm tối đa 2-3 bối cảnh mới
    expect(result.newBackgrounds.length).toBeLessThanOrEqual(3)
    result.newBackgrounds.forEach((bg) => {
      expect(bg.isPreset).toBe(false)
      expect(bg.status).toBe('needs_art')
      expect(bg.promptVi).toContain('2D Soft Clay')
      expect(bg.promptVi).toContain('góc rộng thoáng đãng')
    })
  })

  it('phân rã trạm, gắn cờ skipGeneration cho cảnh AKI chào đầu và cấu hình text placeholder / tech device', () => {
    const result = analyzeLessonScript(sampleScript)

    expect(result.stations.length).toBeGreaterThanOrEqual(2)

    // Kiểm tra trạm 1
    const station1 = result.stations[0]
    expect(station1.learnCards.length).toBe(5)
    expect(station1.checkQuestions.length).toBeGreaterThan(0)

    // Cảnh đầu tiên: Mèo AKI chào đầu
    const firstScene = station1.scenes[0]
    expect(firstScene).toBeDefined()
    expect(firstScene.skipGeneration).toBe(true) // Đã có video intro có sẵn

    // Cảnh có quy tắc / câu hỏi: hasTextPlaceholder phải là true
    const ruleScene = station1.scenes.find((s) => s.dialogue.includes('Quy tắc Vàng'))
    expect(ruleScene?.hasTextPlaceholder).toBe(true)

    // Cảnh thao tác tablet / máy tính bảng
    const tabletScene = station1.scenes.find((s) => s.dialogue.includes('máy tính bảng'))
    expect(tabletScene?.techDevice).toBe('tablet_pastel_blue')
    expect(tabletScene?.visualPromptVi).not.toContain('hoặc')

    // Cảnh thao tác laptop
    const laptopScene = station1.scenes.find((s) => s.dialogue.includes('laptop'))
    expect(laptopScene?.techDevice).toBe('laptop_silver')
    expect(laptopScene?.visualPromptVi).not.toContain('hoặc')
  })

  it('ném lỗi nếu nội dung kịch bản rỗng', () => {
    expect(() => analyzeLessonScript('   ')).toThrow()
  })
})
