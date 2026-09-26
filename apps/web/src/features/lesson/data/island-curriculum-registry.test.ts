import { describe, it, expect } from 'vitest'
import { ISLAND_CURRICULUM_LESSONS, findIslandCurriculum } from './island-curriculum-registry'
import { LESSON_ENGINE_MAP } from '../components/creative-engine/data/engine-presets'

describe('SSOT Aiki Islands Curriculum Registry (22 Trạm M1 - M5)', () => {
  it('phải có đầy đủ 22 bài học từ Module 1 đến Module 5', () => {
    expect(ISLAND_CURRICULUM_LESSONS).toHaveLength(22)
  })

  it('phải đồng nhất 100% creativeEngineMode giữa registry và LESSON_ENGINE_MAP', () => {
    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const modeInRegistry = lesson.journey.stage5_practice.creativeEngineMode
      const expectedMode = LESSON_ENGINE_MAP[lesson.lessonNumber]

      expect(modeInRegistry).toBeDefined()
      expect(expectedMode).toBeDefined()
      expect(modeInRegistry).toBe(expectedMode)
    }
  })

  it('mỗi trạm sinh ảnh phải có ít nhất 1 món đồ thực hành (practiceParts), trạm creative-notebook dùng notebookConfig', () => {
    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const mode = lesson.journey.stage5_practice.creativeEngineMode
      if (mode === 'creative-notebook') {
        // Trạm Text Notebook dùng notebookConfig riêng, triệt tiêu practiceParts (Món đồ bé vẽ)
        expect(lesson.journey.stage5_practice.practiceParts).toEqual([])
        expect(lesson.journey.stage5_practice.notebookConfig).toBeDefined()
        continue
      }

      const parts = lesson.journey.stage5_practice.practiceParts
      expect(parts).toBeDefined()
      expect(parts!.length).toBeGreaterThanOrEqual(1)

      parts?.forEach((part, idx) => {
        expect(part.partNumber).toBe(idx + 1)
        expect(part.title.trim().length).toBeGreaterThan(0)
        expect(part.emoji || part.icon).toBeDefined()
      })
    }
  })

  it('các trạm magic-keys phải có fourKeysOptions đầy đủ 4 chìa khóa', () => {
    const magicKeysLessons = ISLAND_CURRICULUM_LESSONS.filter(
      (l) => l.journey.stage5_practice.creativeEngineMode === 'magic-keys'
    )
    expect(magicKeysLessons.length).toBe(3) // 1.1, 1.2, 2.4

    for (const lesson of magicKeysLessons) {
      const fk = lesson.journey.stage5_practice.fourKeysOptions
      expect(fk).toBeDefined()
      if (lesson.lessonNumber === '1.1') {
        expect(fk?.what).toEqual(['con mèo'])
        expect(fk?.how).toEqual(['lông màu trắng'])
        expect(fk?.action).toEqual(['đang nằm nhắm mắt'])
        expect(fk?.where).toEqual(['ở trước sân'])
      } else {
        expect(fk?.what?.length).toBeGreaterThanOrEqual(3)
        expect(fk?.how?.length).toBeGreaterThanOrEqual(3)
        expect(fk?.action?.length).toBeGreaterThanOrEqual(3)
        expect(fk?.where?.length).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('các trạm style-prism phải có stylePrismOptions với ít nhất 2 phong cách', () => {
    const stylePrismLessons = ISLAND_CURRICULUM_LESSONS.filter(
      (l) => l.journey.stage5_practice.creativeEngineMode === 'style-prism'
    )
    expect(stylePrismLessons.length).toBe(3) // 1.3, 2.3, 5.3

    for (const lesson of stylePrismLessons) {
      const sp = lesson.journey.stage5_practice.stylePrismOptions
      expect(sp).toBeDefined()
      expect(sp?.length).toBeGreaterThanOrEqual(2)
      sp?.forEach((opt) => {
        expect(opt.id).toBeDefined()
        expect(opt.name.length).toBeGreaterThan(0)
        expect(opt.icon).toBeDefined()
        expect(opt.desc.length).toBeGreaterThan(0)
      })
    }
  })

  it('các trạm prompt-doctor phải có promptDoctorCase với ca bệnh và thuốc kê', () => {
    const doctorLessons = ISLAND_CURRICULUM_LESSONS.filter(
      (l) => l.journey.stage5_practice.creativeEngineMode === 'prompt-doctor'
    )
    expect(doctorLessons.length).toBe(1) // 1.4

    for (const lesson of doctorLessons) {
      const doc = lesson.journey.stage5_practice.promptDoctorCase
      expect(doc).toBeDefined()
      expect(doc?.caseTitle.length).toBeGreaterThan(0)
      expect(doc?.symptom.length).toBeGreaterThan(0)
      expect(doc?.originalPrompt.length).toBeGreaterThan(0)
      expect(doc?.cureCards.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('các trạm layer-stacking phải có layerStackingOptions 3 tầng không gian', () => {
    const layerLessons = ISLAND_CURRICULUM_LESSONS.filter(
      (l) => l.journey.stage5_practice.creativeEngineMode === 'layer-stacking'
    )
    expect(layerLessons.length).toBe(2) // 2.2, 3.4

    for (const lesson of layerLessons) {
      const ls = lesson.journey.stage5_practice.layerStackingOptions
      expect(ls).toBeDefined()
      expect(ls?.background.length).toBeGreaterThanOrEqual(2)
      expect(ls?.hero.length).toBeGreaterThanOrEqual(2)
      expect(ls?.foreground.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('các trạm identity-lock phải có 3 lockedFeatures và 6 expressionOptions', () => {
    const lockLessons = ISLAND_CURRICULUM_LESSONS.filter(
      (l) => l.journey.stage5_practice.creativeEngineMode === 'identity-lock'
    )
    expect(lockLessons.length).toBe(3) // 3.2, 3.3, 4.4

    for (const lesson of lockLessons) {
      const p = lesson.journey.stage5_practice
      expect(p.lockedFeatures).toBeDefined()
      expect(p.lockedFeatures.length).toBeGreaterThanOrEqual(3)
      expect(p.expressionOptions).toBeDefined()
      expect(p.expressionOptions?.length).toBeGreaterThanOrEqual(6)
    }
  })

  it('các trạm creative-notebook (10 trạm văn bản) phải có notebookConfig đầy đủ', () => {
    const notebookLessons = ISLAND_CURRICULUM_LESSONS.filter(
      (l) => l.journey.stage5_practice.creativeEngineMode === 'creative-notebook'
    )
    expect(notebookLessons.length).toBe(10) // 2.1, 3.1, 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.4, 5.5

    for (const lesson of notebookLessons) {
      const nb = lesson.journey.stage5_practice.notebookConfig
      expect(nb).toBeDefined()
      expect(nb?.notebookTitle?.length).toBeGreaterThan(0)
      expect(nb?.challengeSummary?.length).toBeGreaterThanOrEqual(2)
      expect(nb?.sampleTemplate?.length).toBeGreaterThan(0)
      expect(nb?.akiAdvice?.length).toBeGreaterThan(0)
      expect(nb?.fields?.length).toBeGreaterThanOrEqual(2)
      expect(nb?.checklist?.length).toBeGreaterThanOrEqual(2)
      nb?.fields?.forEach((f) => {
        expect(f.id.length).toBeGreaterThan(0)
        expect(f.label.length).toBeGreaterThan(0)
      })
      nb?.checklist?.forEach((c) => {
        expect(c.id.length).toBeGreaterThan(0)
        expect(c.label.length).toBeGreaterThan(0)
      })
    }

    // Kiểm tra chi tiết bài 3.1: Hồ sơ nhân vật 7 dòng theo chuẩn kịch bản
    const lesson31 = notebookLessons.find((l) => l.lessonNumber === '3.1')
    expect(lesson31).toBeDefined()
    const nb31 = lesson31!.journey.stage5_practice.notebookConfig!
    expect(nb31.notebookTitle).toBe('Hồ sơ nhân vật của tớ')
    expect(nb31.fields).toHaveLength(7)
    expect(nb31.fields![0].id).toBe('char-name')
    expect(nb31.fields![0].prefix).toBe('Tên: ')
    expect(nb31.fields![2].id).toBe('char-fears')
    expect(nb31.fields![2].badge).toBe('Quan trọng')
    expect(nb31.fields![4].id).toBe('char-weakness')
    expect(nb31.fields![4].badge).toBe('Quan trọng')
    expect(nb31.fields![6].id).toBe('char-family-feedback')
    expect(nb31.fields![6].badge).toBe('Hỏi người nhà')
    expect(nb31.fields![6].colSpan).toBe(2)
    expect(nb31.fields![6].spanFull).toBe(true)
    expect(nb31.checklist).toHaveLength(3)
  })

  it('card-forge sẵn sàng làm engine mở rộng cho giáo viên/học viên tự do thiết kế thẻ bài', () => {
    const forgeLessons = ISLAND_CURRICULUM_LESSONS.filter(
      (l) => l.journey.stage5_practice.creativeEngineMode === 'card-forge'
    )
    // 22 bài học chính thức đã được tối ưu hóa: 12 Trạm Studio ảnh + 10 Trạm Sổ tay Ba Lô
    expect(forgeLessons.length).toBe(0)
  })

  it('tất cả 22 bài học phải có akiMotto hoặc challenge prompt', () => {
    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const motto = lesson.journey.stage5_practice.akiMotto
      expect(motto).toBeDefined()
    }
  })

  it('hàm findIslandCurriculum phải tìm thấy bài học chính xác theo ID, slug và số bài', () => {
    expect(findIslandCurriculum({ id: 'bai-1-1' })?.lessonNumber).toBe('1.1')
    expect(findIslandCurriculum({ slug: 'bai-1-2-bon-chiec-chia-khoa' })?.lessonNumber).toBe('1.2')
    expect(findIslandCurriculum({ id: 'bai-3-2' })?.lessonNumber).toBe('3.2')
    expect(findIslandCurriculum({ title: 'Căn cứ hốc cây' })?.lessonNumber).toBe('3.4')
  })

  it('tất cả 22 bài học phải sử dụng video AIKid chính thức, tuyệt đối không dùng link demo dQw4w9WgXcQ', () => {
    const EXPECTED_VIDEO_MAP: Record<string, string> = {
      '1.1': 'sRpHRsErlw8',
      '1.2': 'NMdHhsLY5jc',
      '1.3': 'GCtez_WirtU',
      '1.4': '53OFMtjB0aM',
      '2.1': 'XeIBZyKmoDo',
      '2.2': 'wmn8pf6GUdo',
      '2.3': 'voAsCD7THtI',
      '2.4': 'B_tbjS0Msnc',
      '3.1': 'x2k-VyO-GTc',
      '3.2': 'LtRW4JX8HWE',
      '3.3': 'Crrd59K_C2M',
      '3.4': 'Hxk4NmtL3IY',
      '4.1': 'OGS7gaPTcc4',
      '4.2': '35kC8Lw31C0',
      '4.3': 'reY6-ZLR3eM',
      '4.4': 'UzvinFjseRE',
      '4.5': 'V4OodQ9gGC8',
      '5.1': 'CC8qli9iBD0',
      '5.2': 'PijX4EBOmkU',
      '5.3': 'StQ4ICE15No',
      '5.4': 'VIGcrhPzr5Q',
      '5.5': '6A1l9ybJu-Q',
    }

    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const videoUrl = lesson.journey.stage3_video.videoUrl
      expect(videoUrl).toBeDefined()
      expect(videoUrl).not.toContain('dQw4w9WgXcQ')

      const expectedId = EXPECTED_VIDEO_MAP[lesson.lessonNumber]
      expect(expectedId).toBeDefined()
      expect(videoUrl).toContain(expectedId)
    }
  })
})
