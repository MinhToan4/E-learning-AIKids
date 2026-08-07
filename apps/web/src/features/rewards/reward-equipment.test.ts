import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  equipReward,
  profileCardBackgroundStyle,
  profileCardBackgroundTone,
  profilePageThemeStyle,
  readRewardEquipment,
  rewardEquipmentFromRows,
  unequipReward,
} from './reward-equipment'

describe('server reward equipment', () => {
  it('keeps valid slots, uses the latest value and ignores invalid rows', () => {
    expect(rewardEquipmentFromRows([
      { kind: 'frame', rewardId: 'frame-level-15' },
      { kind: 'frame', rewardId: 'frame-level-25' },
      { kind: 'title', rewardId: '' },
      { kind: 'unknown' as 'frame', rewardId: 'invalid' },
    ])).toEqual({ frame: 'frame-level-25' })
  })
})

describe('profile card contrast', () => {
  it('uses light text for dark reward backgrounds', () => {
    expect(profileCardBackgroundTone('background-level-21')).toBe('dark')
  })

  it('uses dark text for light and default backgrounds', () => {
    expect(profileCardBackgroundTone('background-ocean-artist')).toBe('light')
    expect(profileCardBackgroundTone()).toBe('light')
  })

  it('keeps page themes and card backgrounds in separate style helpers', () => {
    expect(profilePageThemeStyle('theme-workshop')).not.toEqual(
      profileCardBackgroundStyle('theme-workshop'),
    )
    expect(profileCardBackgroundStyle('theme-workshop')).toEqual(
      profileCardBackgroundStyle('theme-workshop'),
    )
  })

  it('renders the Paco workshop with edge artwork and a quiet center', () => {
    const style = profilePageThemeStyle('theme-paco-workshop')

    expect(style.backgroundColor).toBe('#fff8e8')
    expect(style.backgroundSize).toContain('76rem')
    expect(style.backgroundImage).toContain('profile-edge-playground')
  })

  it('uses responsive edge artwork for dynamic page themes', () => {
    const style = profilePageThemeStyle('theme-level-20')

    expect(String(style.backgroundImage ?? '')).toContain('url(')
    expect(style.backgroundColor).toBe('#f7e8e5')
  })

  it('uses the wide local artwork instead of square reward illustrations', () => {
    const style = profileCardBackgroundStyle('background-level-21')

    expect(String(style.backgroundImage ?? '')).toContain('profile-edge-stars')
    expect(style.backgroundSize).toBe('cover')
  })
})

describe('reward equipment', () => {
  it('removes one equipped slot without changing the others', () => {
    const storage = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (storageKey: string) => storage.get(storageKey) ?? null,
      setItem: (storageKey: string, value: string) => storage.set(storageKey, value),
    })
    equipReward('child-1', 'frame', 'frame-level-15')
    equipReward('child-1', 'effect', 'effect-level-24')

    unequipReward('child-1', 'effect')

    expect(readRewardEquipment('child-1')).toEqual({ frame: 'frame-level-15' })
  })

  afterEach(() => vi.unstubAllGlobals())
})
