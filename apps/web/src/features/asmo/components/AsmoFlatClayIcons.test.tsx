// @vitest-environment jsdom
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  FlatClayTeacup,
  FlatClayBicycle,
  FlatClayNotebook,
  FlatClayVintageClock,
  FlatClayKey,
  FlatClayIcon,
} from './AsmoFlatClayIcons'

describe('AsmoFlatClayIcons - 2D Flat Soft Clay Studio Icons', () => {
  it('renders FlatClayTeacup correctly as SVG with proper aria-label', () => {
    const html = renderToStaticMarkup(<FlatClayTeacup size={32} />)
    expect(html).toContain('<svg')
    expect(html).toContain('aria-label="Cốc sứ trắng"')
    expect(html).toContain('width="32"')
  })

  it('renders FlatClayBicycle correctly as SVG with proper aria-label', () => {
    const html = renderToStaticMarkup(<FlatClayBicycle size={32} />)
    expect(html).toContain('<svg')
    expect(html).toContain('aria-label="Cái xe đạp"')
    expect(html).toContain('width="32"')
  })

  it('renders FlatClayNotebook correctly as SVG with proper aria-label', () => {
    const html = renderToStaticMarkup(<FlatClayNotebook size={32} />)
    expect(html).toContain('<svg')
    expect(html).toContain('aria-label="Cuốn sổ tay mở"')
    expect(html).toContain('width="32"')
  })

  it('renders FlatClayVintageClock correctly as SVG with proper aria-label', () => {
    const html = renderToStaticMarkup(<FlatClayVintageClock size={32} />)
    expect(html).toContain('<svg')
    expect(html).toContain('aria-label="Cái đồng hồ cổ"')
    expect(html).toContain('width="32"')
  })

  it('renders FlatClayKey correctly as SVG with proper aria-label', () => {
    const html = renderToStaticMarkup(<FlatClayKey size={32} />)
    expect(html).toContain('<svg')
    expect(html).toContain('aria-label="Chìa khóa vàng"')
    expect(html).toContain('width="32"')
  })

  it('resolves icons via FlatClayIcon dispatcher for studio keys', () => {
    expect(renderToStaticMarkup(<FlatClayIcon name="teacup" />)).toContain('aria-label="Cốc sứ trắng"')
    expect(renderToStaticMarkup(<FlatClayIcon name="ceramic-cup" />)).toContain('aria-label="Cốc sứ trắng"')
    expect(renderToStaticMarkup(<FlatClayIcon name="cup" />)).toContain('aria-label="Cốc sứ trắng"')

    expect(renderToStaticMarkup(<FlatClayIcon name="bicycle" />)).toContain('aria-label="Cái xe đạp"')
    expect(renderToStaticMarkup(<FlatClayIcon name="bike" />)).toContain('aria-label="Cái xe đạp"')

    expect(renderToStaticMarkup(<FlatClayIcon name="notebook" />)).toContain('aria-label="Cuốn sổ tay mở"')
    expect(renderToStaticMarkup(<FlatClayIcon name="book" />)).toContain('aria-label="Cuốn sổ tay mở"')

    expect(renderToStaticMarkup(<FlatClayIcon name="vintage-clock" />)).toContain('aria-label="Cái đồng hồ cổ"')
    expect(renderToStaticMarkup(<FlatClayIcon name="clock-vintage" />)).toContain('aria-label="Cái đồng hồ cổ"')

    expect(renderToStaticMarkup(<FlatClayIcon name="key" />)).toContain('aria-label="Chìa khóa vàng"')
    expect(renderToStaticMarkup(<FlatClayIcon name="golden-key" />)).toContain('aria-label="Chìa khóa vàng"')
  })
})
