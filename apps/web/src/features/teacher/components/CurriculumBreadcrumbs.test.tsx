import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CurriculumBreadcrumbs } from './CurriculumBreadcrumbs'

describe('CurriculumBreadcrumbs Component', () => {
  it('renders Level 1 correctly without Back button', () => {
    const html = renderToStaticMarkup(
      <CurriculumBreadcrumbs
        currentLevel={1}
        onBack={() => {}}
        onNavigateLevel={() => {}}
      />
    )

    expect(html).toContain('Biên soạn')
    expect(html).toContain('Cấp 1')
    expect(html).toContain('Không gian &amp; Chương trình')
    expect(html).not.toContain('Quay lại')
  })

  it('renders Level 2 with Program Title and Back button', () => {
    const html = renderToStaticMarkup(
      <CurriculumBreadcrumbs
        currentLevel={2}
        programTitle="AI Foundation Cho Bé"
        onBack={() => {}}
        onNavigateLevel={() => {}}
      />
    )

    expect(html).toContain('Biên soạn')
    expect(html).toContain('AI Foundation Cho Bé')
    expect(html).toContain('Cấp 2')
    expect(html).toContain('Quản lý Vùng học')
    expect(html).toContain('Quay lại Chương trình')
  })

  it('renders Level 3 with Program and Region Titles', () => {
    const html = renderToStaticMarkup(
      <CurriculumBreadcrumbs
        currentLevel={3}
        programTitle="AI Foundation Cho Bé"
        regionTitle="Vùng 1: Nhập môn AI"
        onBack={() => {}}
        onNavigateLevel={() => {}}
      />
    )

    expect(html).toContain('AI Foundation Cho Bé')
    expect(html).toContain('Vùng 1: Nhập môn AI')
    expect(html).toContain('Cấp 3')
    expect(html).toContain('Lộ trình Trạm học')
    expect(html).toContain('Quay lại Các Vùng')
  })

  it('renders Level 4 Studio with Station Title and Back to Roadmap button', () => {
    const html = renderToStaticMarkup(
      <CurriculumBreadcrumbs
        currentLevel={4}
        programTitle="AI Foundation Cho Bé"
        regionTitle="Vùng 1: Nhập môn AI"
        stationTitle="Trạm 1: Mèo AIKI Chào Bạn"
        onBack={() => {}}
        onNavigateLevel={() => {}}
      />
    )

    expect(html).toContain('Vùng 1: Nhập môn AI')
    expect(html).toContain('Soạn: Trạm 1: Mèo AIKI Chào Bạn')
    expect(html).toContain('Cấp 4')
    expect(html).toContain('Studio Soạn Trạm')
    expect(html).toContain('Quay lại Bản đồ Trạm')
  })
})
