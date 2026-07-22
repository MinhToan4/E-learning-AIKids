import { describe, expect, it } from 'vitest'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { ART_STYLES } from '@aikids/domain'
import { courseCoverHint, designerAssets, styleImage } from './assets.js'
import { STUDENT_AVATARS, getAvatar } from './avatars.js'

function publicPath(url: string): string {
  return resolve(process.cwd(), 'public', url.replace(/^\//, ''))
}

describe('designer AIKid assets on disk', () => {
  it('brand logo and mascot exist', () => {
    expect(existsSync(publicPath(designerAssets.brand.logo))).toBe(true)
    expect(existsSync(publicPath(designerAssets.brand.mascot))).toBe(true)
  })

  it('lobby chrome assets exist', () => {
    expect(existsSync(publicPath(designerAssets.lobby.bgHome))).toBe(true)
    expect(existsSync(publicPath(designerAssets.lobby.bgLogin))).toBe(true)
    expect(existsSync(publicPath(designerAssets.lobby.cardArt))).toBe(true)
    expect(existsSync(publicPath(designerAssets.lobby.artComic))).toBe(true)
    expect(existsSync(publicPath(designerAssets.lobby.homeCharacter))).toBe(true)
  })

  it('lobby + full art-style pack exist (AIkid Soft Clay)', () => {
    expect(existsSync(publicPath(designerAssets.lobby.cardMee))).toBe(true)
    for (const s of ART_STYLES) {
      const path = styleImage(s.id)
      expect(existsSync(publicPath(path)), `missing style ${s.id}: ${path}`).toBe(
        true,
      )
    }
  })

  it('workshop + course covers map to designer paths', () => {
    expect(existsSync(publicPath(designerAssets.workshop.character))).toBe(true)
    expect(existsSync(publicPath(designerAssets.workshop.style))).toBe(true)
    expect(existsSync(publicPath(designerAssets.workshop.comic))).toBe(true)
    expect(existsSync(publicPath(designerAssets.course.comic))).toBe(true)
  })

  it('chrome + avatar catalog images exist on disk', () => {
    expect(existsSync(publicPath(designerAssets.chrome.badges))).toBe(true)
    expect(existsSync(publicPath(designerAssets.chrome.mascotHero))).toBe(true)
    expect(STUDENT_AVATARS.length).toBeGreaterThanOrEqual(12)
    for (const a of STUDENT_AVATARS) {
      if (a.image) {
        expect(existsSync(publicPath(a.image)), `avatar ${a.id}`).toBe(true)
      }
    }
    expect(getAvatar('avatar-star').emoji).toBe('⭐')
    expect(getAvatar('unknown-id').id).toBe('avatar-robot')
  })

  it('courseCoverHint prefers API coverImage then key heuristic', () => {
    expect(courseCoverHint({ coverImage: '/x.jpg' })).toBe('/x.jpg')
    expect(courseCoverHint({ courseKey: 'K4' })).toBe(designerAssets.course.comic)
    expect(courseCoverHint({ courseKey: 'K6' })).toBe(designerAssets.course.voice)
  })

  it('serves lightweight UI derivatives instead of multi-megabyte source art', () => {
    const styleBytes = ART_STYLES.reduce(
      (total, style) => total + statSync(publicPath(styleImage(style.id))).size,
      0,
    )
    expect(styleBytes).toBeLessThan(3 * 1024 * 1024)
    expect(statSync(publicPath(designerAssets.brand.mascot)).size).toBeLessThan(
      1024 * 1024,
    )
  })
})
