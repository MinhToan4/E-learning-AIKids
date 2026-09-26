import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { StorybookHero } from './StorybookHero'

describe('StorybookHero', () => {
  it('renders title, friendly intro, and unlocked stickers counter', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StorybookHero
          publishedEarnedCount={12}
          totalStickersCount={72}
          loading={false}
        />
      </MemoryRouter>,
    )

    expect(html).toContain('Cuốn Sách Của Con')
    expect(html).toContain('Kho Tàng Sticker Kỳ Diệu')
    expect(html).toContain('12/72')
    expect(html).toContain('Sticker đã mở')
    expect(html).toContain('href="/home"')
  })

  it('renders loading state when loading is true', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StorybookHero
          publishedEarnedCount={0}
          totalStickersCount={72}
          loading={true}
        />
      </MemoryRouter>,
    )

    expect(html).toContain('…')
  })
})
