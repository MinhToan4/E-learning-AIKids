import { describe, it, expect } from 'vitest'
import {
  PREGENERATED_FALLBACK_REGISTRY,
  getNonRepeatingFallbackImage,
} from './pregenerated-fallback-registry'

describe('pregenerated-fallback-registry', () => {
  it('guarantees that every registry entry has at least 2 distinct non-empty variants', () => {
    expect(PREGENERATED_FALLBACK_REGISTRY.length).toBeGreaterThanOrEqual(15)

    for (const entry of PREGENERATED_FALLBACK_REGISTRY) {
      expect(entry.variants.length).toBeGreaterThanOrEqual(2)
      expect(entry.variants[0]).toBeTruthy()
      expect(entry.variants[1]).toBeTruthy()
      expect(entry.variants[0]).not.toBe(entry.variants[1])
    }
  })

  describe('Bài 1.1: 4 Món đồ bé vẽ & các trường hợp chọn / không chọn chìa khóa', () => {
    it('Case 1 (Món 01 - Chú Mèo Mướp Vàng 1 từ / chưa đủ chìa khóa): Trả về ảnh mèo 1 từ ngơ ngác chuẩn sư phạm', () => {
      const img1 = getNonRepeatingFallbackImage('mèo', undefined, 'magic-keys')
      expect(img1).toMatch(/cat_one_word_v[12]\.webp/)

      const img2 = getNonRepeatingFallbackImage('mèo', img1, 'magic-keys')
      expect(img2).toMatch(/cat_one_word_v[12]\.webp/)
      expect(img2).not.toBe(img1)
    })

    it('Case 2 (Món 02 - Mèo Béo Ngủ Ghế Mây): Trả về ảnh mèo ngủ ghế mây đệm bông', () => {
      const prompt = 'Mèo mướp vàng béo tròn đang nằm ngủ cuộn tròn trên chiếc ghế mây lót đệm'
      const img1 = getNonRepeatingFallbackImage(prompt, undefined, 'magic-keys')
      expect(img1).toMatch(/cat_(full_details|fat_sleeping)_v[12]\.webp/)

      const img2 = getNonRepeatingFallbackImage(prompt, img1, 'magic-keys')
      expect(img2).not.toBe(img1)
    })

    it('Case 3 (Món 03 - Mèo Bắt Bướm Nắng Vàng): Trả về ảnh mèo vờn bướm trong vườn hoa nắng', () => {
      const prompt = 'Mèo Bắt Bướm Nắng Vàng tinh nghịch đang nhảy bắt bướm giữa vườn hoa'
      const img1 = getNonRepeatingFallbackImage(prompt, undefined, 'magic-keys')
      expect(img1).toMatch(/cat_butterfly_v[12]\.webp/)

      const img2 = getNonRepeatingFallbackImage(prompt, img1, 'magic-keys')
      expect(img2).toMatch(/cat_butterfly_v[12]\.webp/)
      expect(img2).not.toBe(img1)
    })

    it('Case 4 (Món 04 - Mèo Phi Hành Gia): Trả về ảnh mèo mặc đồ vũ trụ lơ lửng ngoài không gian', () => {
      const prompt = 'Mèo Phi Hành Gia mặc bộ đồ vũ trụ đang bay lượn ngoài không gian với các hành tinh'
      const img1 = getNonRepeatingFallbackImage(prompt, undefined, 'magic-keys')
      expect(img1).toMatch(/cat_astronaut_v[12]\.webp/)

      const img2 = getNonRepeatingFallbackImage(prompt, img1, 'magic-keys')
      expect(img2).toMatch(/cat_astronaut_v[12]\.webp/)
      expect(img2).not.toBe(img1)
    })

    it('Xử lý khi trẻ KHÔNG CHỌN hoặc BỎ BỚT chìa khóa (chỉ chọn 2/4 hoặc 3/4 chìa khóa)', () => {
      // Bé chỉ chọn Mèo + Bắt bướm (bỏ qua Trông thế nào và Ở đâu)
      const partialPrompt = 'Chú mèo mướp đang nhảy bắt bướm'
      const img = getNonRepeatingFallbackImage(partialPrompt, undefined, 'magic-keys')
      expect(img).toMatch(/cat_butterfly_v[12]\.webp/)

      // Bé chỉ chọn Mèo + Phi hành gia (bỏ qua Đang làm gì và Ở đâu)
      const partialAstronautPrompt = 'Chú mèo phi hành gia'
      const astroImg = getNonRepeatingFallbackImage(partialAstronautPrompt, undefined, 'magic-keys')
      expect(astroImg).toMatch(/cat_astronaut_v[12]\.webp/)
    })
  })

  describe('Độ bền bỉ và không lặp của các Engine khác', () => {
    it('Style Prism: Phân biệt chính xác giữa các phong cách nghệ thuật', () => {
      const clayImg = getNonRepeatingFallbackImage('Chú trâu đất nặn soft clay', undefined, 'style-prism')
      expect(clayImg).toMatch(/buffalo_clay_v[12]\.webp/)

      const watercolorImg = getNonRepeatingFallbackImage('Chú trâu tranh màu nước', undefined, 'style-prism')
      expect(watercolorImg).toMatch(/buffalo_watercolor_v[12]\.webp/)
    })

    it('Prompt Doctor: Phân biệt chính xác từng ca bệnh khi chữa lành', () => {
      const handImg = getNonRepeatingFallbackImage('Bàn tay hiệp sĩ 5 ngón giáp bạc', undefined, 'prompt-doctor')
      expect(handImg).toMatch(/doctor_hand_cured_v[12]\.webp/)

      const squirrelImg = getNonRepeatingFallbackImage('Sóc Bông đội mũ len đỏ quả bông', undefined, 'prompt-doctor')
      expect(squirrelImg).toMatch(/(doctor_squirrel_cured_v[12]\.webp|island3_lesson2_opt_b\.jpg)/)
    })

    it('Identity Lock: Khóa đúng nhân vật', () => {
      const foxImg = getNonRepeatingFallbackImage('Cáo Lửa Zico áo choàng đỏ sao vàng', undefined, 'identity-lock')
      expect(foxImg).toMatch(/fox_zico_v[12]\.webp/)

      const robotImg = getNonRepeatingFallbackImage('Robot Leo mắt xanh áo giáp số 7', undefined, 'identity-lock')
      expect(robotImg).toMatch(/robot_leo_v[12]\.webp/)
    })

    it('Card Forge: Đúc thẻ bài hệ nguyên tố', () => {
      const dragonImg = getNonRepeatingFallbackImage('Thẻ bài TCG Rồng Băng bão tuyết', undefined, 'card-forge')
      expect(dragonImg).toMatch(/card_frost_dragon_v[12]\.webp/)

      const fireFoxImg = getNonRepeatingFallbackImage('Thẻ bài TCG Hiệp sĩ Cáo Lửa hệ Hỏa', undefined, 'card-forge')
      expect(fireFoxImg).toMatch(/card_fire_fox_v[12]\.webp/)
    })
  })
})
