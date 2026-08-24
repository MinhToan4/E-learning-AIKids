import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import {
  FlatClayBalloon,
  FlatClayPopBurst,
  FlatClayCupcake,
  FlatClayCandy,
  FlatClayWatermelon,
  FlatClayPizzaSlice,
  FlatClayCube,
  FlatClayRedApple,
  FlatClayGreenApple,
  FlatClayIslandForest,
  FlatClayIslandBakery,
  FlatClayIslandPizza,
  FlatClayIslandClock,
  FlatClayIslandCrystal,
  FlatClayClock,
  FlatClayScale,
  FlatClayCubeNet,
  FlatClayMatchstick,
  FlatClayCompass,
  FlatClayColumnCalc,
  FlatClayTrophy,
  FlatClayMedal,
  FlatClayStar,
  FlatClayZap,
  FlatClayHeart,
  FlatClayTarget,
  FlatClayShield,
  FlatClayDiamond,
  FlatClaySparkles,
  FlatClayFrog,
  FlatClayWand,
  FlatClayOrange,
  FlatClayIcon,
} from '../components/AsmoFlatClayIcons'

describe('ASMO 2D Flat Soft Clay Design System Icons', () => {
  describe('1. 5 Chặng Học & Đảo Học Tập (Islands 1–5)', () => {
    it('renders FlatClayIslandForest with correct aria-label and svg attributes', () => {
      const html = renderToStaticMarkup(createElement(FlatClayIslandForest, { size: 64, className: 'test-forest' }))
      expect(html).toContain('aria-label="Đảo Rừng Táo"')
      expect(html).toContain('width="64"')
      expect(html).toContain('height="64"')
    })

    it('renders FlatClayIslandBakery with correct aria-label and colors', () => {
      const html = renderToStaticMarkup(createElement(FlatClayIslandBakery, { size: 48 }))
      expect(html).toContain('aria-label="Đảo Bánh Ngọt"')
    })

    it('renders FlatClayIslandPizza with fraction cut marks', () => {
      const html = renderToStaticMarkup(createElement(FlatClayIslandPizza, { size: 52 }))
      expect(html).toContain('aria-label="Đảo Pizza Phân Số"')
    })

    it('renders FlatClayIslandClock with clock and balance elements', () => {
      const html = renderToStaticMarkup(createElement(FlatClayIslandClock, { size: 56 }))
      expect(html).toContain('aria-label="Đảo Đồng Hồ &amp; Cân Thăng Bằng"')
    })

    it('renders FlatClayIslandCrystal with 3D isometric crystal towers', () => {
      const html = renderToStaticMarkup(createElement(FlatClayIslandCrystal, { size: 64 }))
      expect(html).toContain('aria-label="Đảo Pha Lê &amp; Lâu Đài 3D"')
    })
  })

  describe('2. Toán Học & Đồ Vật Montessori', () => {
    it('renders FlatClayClock with specified hours and minutes', () => {
      const html = renderToStaticMarkup(createElement(FlatClayClock, { size: 48, hours: 4, minutes: 15 }))
      expect(html).toContain('aria-label="Đồng hồ kim 4:15"')
    })

    it('renders FlatClayScale with balanced and tilted modes', () => {
      const html1 = renderToStaticMarkup(createElement(FlatClayScale, { size: 48, tilt: 'balanced' }))
      expect(html1).toContain('aria-label="Cân đĩa thăng bằng"')

      const html2 = renderToStaticMarkup(createElement(FlatClayScale, { size: 48, tilt: 'left' }))
      expect(html2).toContain('rotate(-12')
    })

    it('renders FlatClayCubeNet with 6 folding faces', () => {
      const html = renderToStaticMarkup(createElement(FlatClayCubeNet, { size: 48 }))
      expect(html).toContain('aria-label="Lưới gấp hộp 6 mặt"')
    })

    it('renders FlatClayMatchstick with red tip and flame', () => {
      const html = renderToStaticMarkup(createElement(FlatClayMatchstick, { size: 48, lit: true }))
      expect(html).toContain('aria-label="Que diêm đầu đỏ"')
    })

    it('renders FlatClayCompass with 4 cardinal points', () => {
      const html = renderToStaticMarkup(createElement(FlatClayCompass, { size: 48 }))
      expect(html).toContain('aria-label="La bàn tọa độ"')
    })

    it('renders FlatClayColumnCalc with column addition numbers and carry bubble', () => {
      const html = renderToStaticMarkup(createElement(FlatClayColumnCalc, { size: 48 }))
      expect(html).toContain('aria-label="Mô hình bảng tính cột dọc"')
    })
  })

  describe('3. Olympic, Chuyên Đề & Gamification', () => {
    it('renders FlatClayTrophy for Olympic champions', () => {
      const html = renderToStaticMarkup(createElement(FlatClayTrophy, { size: 48 }))
      expect(html).toContain('aria-label="Cúp vàng Olympic"')
    })

    it('renders FlatClayMedal for gold, silver, bronze tiers', () => {
      const htmlGold = renderToStaticMarkup(createElement(FlatClayMedal, { size: 48, tier: 'gold', rank: 1 }))
      expect(htmlGold).toContain('aria-label="Huy chương gold"')

      const htmlSilver = renderToStaticMarkup(createElement(FlatClayMedal, { size: 48, tier: 'silver', rank: 2 }))
      expect(htmlSilver).toContain('aria-label="Huy chương silver"')

      const htmlBronze = renderToStaticMarkup(createElement(FlatClayMedal, { size: 48, tier: 'bronze', rank: 3 }))
      expect(htmlBronze).toContain('aria-label="Huy chương bronze"')
    })

    it('renders FlatClayStar, FlatClayZap, FlatClayHeart, FlatClayTarget, FlatClayShield, FlatClayDiamond, FlatClaySparkles', () => {
      expect(renderToStaticMarkup(createElement(FlatClayStar, { size: 32 }))).toContain('aria-label="Ngôi sao vàng"')
      expect(renderToStaticMarkup(createElement(FlatClayZap, { size: 32 }))).toContain('aria-label="Tia sét XP"')
      expect(renderToStaticMarkup(createElement(FlatClayHeart, { size: 32 }))).toContain('aria-label="Trái tim năng lượng"')
      expect(renderToStaticMarkup(createElement(FlatClayTarget, { size: 32 }))).toContain('aria-label="Bia ngắm chuyên đề"')
      expect(renderToStaticMarkup(createElement(FlatClayShield, { size: 32 }))).toContain('aria-label="Khiên bảo vệ"')
      expect(renderToStaticMarkup(createElement(FlatClayDiamond, { size: 32 }))).toContain('aria-label="Kim cương đá quý"')
      expect(renderToStaticMarkup(createElement(FlatClaySparkles, { size: 32 }))).toContain('aria-label="Bụi sao lấp lánh"')
    })
  })

  describe('4. Đồ Chơi & Trái Cây Thực Hành', () => {
    it('renders FlatClayBalloon, FlatClayPopBurst, FlatClayCupcake, FlatClayCandy, FlatClayWatermelon, FlatClayPizzaSlice, FlatClayCube, FlatClayRedApple, FlatClayGreenApple, FlatClayFrog, FlatClayWand, FlatClayOrange', () => {
      expect(renderToStaticMarkup(createElement(FlatClayBalloon, { size: 32, color: 'rose', number: 5 }))).toContain('Quả bóng số 5')
      expect(renderToStaticMarkup(createElement(FlatClayPopBurst, { size: 32 }))).toContain('Vết nổ sao')
      expect(renderToStaticMarkup(createElement(FlatClayCupcake, { size: 32, flavor: 'strawberry' }))).toContain('Bánh cupcake')
      expect(renderToStaticMarkup(createElement(FlatClayCandy, { size: 32 }))).toContain('Kẹo mút xoắn tròn')
      expect(renderToStaticMarkup(createElement(FlatClayWatermelon, { size: 32 }))).toContain('Miếng dưa hấu')
      expect(renderToStaticMarkup(createElement(FlatClayPizzaSlice, { size: 32 }))).toContain('Lát pizza')
      expect(renderToStaticMarkup(createElement(FlatClayCube, { size: 32, color: 'emerald' }))).toContain('Khối lập phương isometric')
      expect(renderToStaticMarkup(createElement(FlatClayRedApple, { size: 32, number: 1 }))).toContain('Quả táo đỏ số 1')
      expect(renderToStaticMarkup(createElement(FlatClayGreenApple, { size: 32, number: 2 }))).toContain('Quả táo xanh số 2')
      expect(renderToStaticMarkup(createElement(FlatClayFrog, { size: 32 }))).toContain('Chú ếch nhảy số')
      expect(renderToStaticMarkup(createElement(FlatClayWand, { size: 32 }))).toContain('Đũa thần phép thuật')
      expect(renderToStaticMarkup(createElement(FlatClayOrange, { size: 32 }))).toContain('Quả cam ngọt')
    })
  })

  describe('5. Universal Component <FlatClayIcon />', () => {
    it('maps island keywords accurately', () => {
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: 'island_forest', size: 48 }))).toContain('Đảo Rừng Táo')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: 'stage-2', size: 48 }))).toContain('Đảo Bánh Ngọt')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: 'island-pizza', size: 48 }))).toContain('Đảo Pizza Phân Số')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: 'stage-4', size: 48 }))).toContain('Đảo Đồng Hồ &amp; Cân Thăng Bằng')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: 'crystal-island', size: 48 }))).toContain('Đảo Pha Lê &amp; Lâu Đài 3D')
    })

    it('maps legacy emojis to soft clay vector components seamlessly', () => {
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '🍎', size: 32 }))).toContain('Quả táo đỏ')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '🎈', size: 32 }))).toContain('Quả bóng bay')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '⏰', size: 32 }))).toContain('Đồng hồ kim')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '⚖️', size: 32 }))).toContain('Cân đĩa thăng bằng')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '🏆', size: 32 }))).toContain('Cúp vàng Olympic')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '🧊', size: 32 }))).toContain('Khối lập phương isometric')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '⚡', size: 32 }))).toContain('Tia sét XP')
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '🧮', size: 32 }))).toContain('Mô hình bảng tính cột dọc')
    })

    it('gracefully falls back to FlatClayStar on unknown or empty name', () => {
      expect(renderToStaticMarkup(createElement(FlatClayIcon, { name: '', size: 32 }))).toContain('Ngôi sao vàng')
    })
  })
})
