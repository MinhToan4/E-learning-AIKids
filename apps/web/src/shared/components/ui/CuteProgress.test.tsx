import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CuteProgress } from './CuteProgress'

describe('CuteProgress', () => {
  it('renders one star at the current progress position', () => {
    const html = renderToStaticMarkup(<CuteProgress value={67} label="Tiến độ" />)

    expect(html.match(/<img /g)).toHaveLength(1)
    expect(html).toContain('left:67%')
    expect(html).toContain('aria-valuenow="67"')
  })

  it('keeps the star position inside the progress range', () => {
    expect(renderToStaticMarkup(<CuteProgress value={-10} label="Bắt đầu" />)).toContain('left:0%')
    expect(renderToStaticMarkup(<CuteProgress value={140} label="Hoàn thành" />)).toContain('left:100%')
  })
})
