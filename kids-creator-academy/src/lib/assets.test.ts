import { describe, expect, it } from 'vitest'
import { assetUrl, routerBasename } from '@/lib/assets'

describe('assetUrl for Vite base', () => {
  it('joins BASE_URL with path and strips leading slash on path', () => {
    const base = import.meta.env.BASE_URL || '/'
    expect(assetUrl('assets/mascot-hero.jpg')).toBe(`${base}assets/mascot-hero.jpg`)
    expect(assetUrl('/assets/course-comic.jpg')).toBe(`${base}assets/course-comic.jpg`)
  })

  it('router basename matches BASE_URL without trailing slash (except root)', () => {
    const base = import.meta.env.BASE_URL || '/'
    if (base === '/') {
      expect(routerBasename()).toBe('/')
    } else {
      expect(routerBasename()).toBe(base.replace(/\/+$/, ''))
      expect(routerBasename().endsWith('/')).toBe(false)
    }
  })
})
