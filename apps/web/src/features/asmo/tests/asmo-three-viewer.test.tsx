import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { AsmoThreeViewer } from '../components/AsmoThreeViewer'
import { ASMO_3D_TEMPLATES } from '../data/asmo-3d-templates'

describe('AsmoThreeViewer Montessori 3D Interactive Manipulatives', () => {
  it('renders NET_CUBE_FOLDING with true 3D kinematic folding controls and opposite face selector buttons', () => {
    const spec = ASMO_3D_TEMPLATES['NET_CUBE_FOLDING'].renderSpec
    const markup = renderToStaticMarkup(
      createElement(AsmoThreeViewer, { spec, interactive: true }),
    )

    // Folding control buttons
    expect(markup).toContain('Cơ Chế Gấp Hộp 3D:')
    expect(markup).toContain('Trải Phẳng (0%)')
    expect(markup).toContain('Gập Đứng (50%)')
    expect(markup).toContain('Gấp Khối (100%)')
    expect(markup).toContain('Tự Gập')

    // Opposite face matching buttons
    expect(markup).toContain('Mặt Đối Diện:')
    expect(markup).toContain('1 ➔ 6: Đáy &amp; Nắp')
    expect(markup).toContain('2 ➔ 3: Trái &amp; Phải')
    expect(markup).toContain('4 ➔ 5: Trước &amp; Sau')
  })

  it('renders GRID_PATH_MAZE with 10 path selection buttons, navigation arrows, and crawling ant auto-play simulation', () => {
    const spec = ASMO_3D_TEMPLATES['GRID_PATH_MAZE'].renderSpec
    const markup = renderToStaticMarkup(
      createElement(AsmoThreeViewer, {
        spec,
        interactive: true,
        onPathChange: () => {},
      }),
    )

    expect(markup).toContain('Chọn Trong 10 Con Đường Của Chú Kiến 🐜:')
    expect(markup).toContain('Chú Kiến Tự Bò 🐜')
    expect(markup).toContain('#1')
    expect(markup).toContain('#10')
    expect(markup).toContain('→ → → ↑ ↑')
  })

  it('renders MATCHSTICK_FIGURE with 4 individual wing counters and total multiplier counter (4 x 3 = 12)', () => {
    const spec = ASMO_3D_TEMPLATES['MATCHSTICK_FIGURE'].renderSpec
    const markup = renderToStaticMarkup(
      createElement(AsmoThreeViewer, { spec, interactive: true }),
    )

    expect(markup).toContain('Đếm 4 Cánh Cối Xay Gió (3 Que/Cánh):')
    expect(markup).toContain('Cánh 1: 3 que (Xanh)')
    expect(markup).toContain('Cánh 2: 3 que (Vàng)')
    expect(markup).toContain('Cánh 3: 3 que (Hồng)')
    expect(markup).toContain('Cánh 4: 3 que (Tím)')
    expect(markup).toContain('Đếm Tất Cả: 4 × 3 = 12 que')
  })

  it('renders SHADED_AREA_FRACTION with slice eating stepper, fraction recognition, and dynamic status badges', () => {
    const spec = ASMO_3D_TEMPLATES['SHADED_AREA_FRACTION'].renderSpec
    const markup = renderToStaticMarkup(
      createElement(AsmoThreeViewer, { spec, interactive: true }),
    )

    expect(markup).toContain('Tương Tác Ăn Bánh &amp; Nhận Biết Phân Số:')
    expect(markup).toContain('Ban Đầu: 10/10 Lát')
    expect(markup).toContain('Ăn Bớt 3 Lát (-3/10)')
    expect(markup).toContain('Còn Lại: 7/10 Lát')
    expect(markup).toContain('Thêm Lát Bánh')
    expect(markup).toContain('Ăn Bớt Lát')
    expect(markup).toContain('Còn lại:')
    expect(markup).toContain('Đã ăn:')
  })

  it('renders 3D_BALANCE_SCALE with 3 algebraic balance steps and dynamic tilt physics button', () => {
    const spec = ASMO_3D_TEMPLATES['3D_BALANCE_SCALE'].renderSpec
    const markup = renderToStaticMarkup(
      createElement(AsmoThreeViewer, { spec, interactive: true }),
    )

    expect(markup).toContain('3 Bước Giải Cân Thăng Bằng:')
    expect(markup).toContain('1. Ban Đầu: 2 🍉 = 6 🍊')
    expect(markup).toContain('2. Chia Đôi Cả 2 Đĩa (-1 🍉, -3 🍊)')
    expect(markup).toContain('3. Kết Quả: 1 🍉 = 3 🍊')
    expect(markup).toContain('Nghiêng Đĩa Cân')
  })

  it('renders 3D_CUBE_CLUSTER with layer peeling buttons, X-Ray wireframe toggle, and color cycling', () => {
    const spec = ASMO_3D_TEMPLATES['3D_CUBE_CLUSTER'].renderSpec
    const markup = renderToStaticMarkup(
      createElement(AsmoThreeViewer, { spec, interactive: true }),
    )

    expect(markup).toContain('Bóc Tách Từng Tầng Khối Lập Phương:')
    expect(markup).toContain('Tầng 1: Đáy (4 khối)')
    expect(markup).toContain('Tầng 2: Giữa (3 khối)')
    expect(markup).toContain('Tầng 3: Đỉnh (1 khối)')
    expect(markup).toContain('Đếm Cả Khối: 8 khối')
    expect(markup).toContain('Đổi Màu')
    expect(markup).toContain('X-Ray')
  })

  it('renders INTERACTIVE_CLOCK with presets, steppers, and dynamic angle calculation', () => {
    const spec = ASMO_3D_TEMPLATES['INTERACTIVE_CLOCK'].renderSpec
    const markup = renderToStaticMarkup(
      createElement(AsmoThreeViewer, { spec, interactive: true }),
    )

    expect(markup).toContain('Chọn Giờ &amp; Tính Góc Kim Đồng Hồ:')
    expect(markup).toContain('5:05 (122.5°)')
    expect(markup).toContain('3:15 (7.5°)')
    expect(markup).toContain('6:30 (15°)')
    expect(markup).toContain('12:00 (0°)')
    expect(markup).toContain('4:10 (65°)')
    expect(markup).toContain('Góc kẹp:')
  })
})
