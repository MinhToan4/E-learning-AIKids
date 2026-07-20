import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { ART_STYLES } from '@aikids/domain'
import { designerAssets, styleImage } from './assets.js'

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

  it('hub + full art-style pack exist (AIkid Soft Clay)', () => {
    expect(existsSync(publicPath(designerAssets.hub.cardMee))).toBe(true)
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
})
