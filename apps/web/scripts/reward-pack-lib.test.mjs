import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  validateRewardPackManifest,
  validateZipEntryPath,
} from './reward-pack-lib.mjs'

const manifest = {
  schemaVersion: 1,
  pack: {
    id: 'summer-cloud-event',
    name: 'Sự kiện Mây Mùa Hè',
    release: '2026.08.0',
    channel: 'event',
  },
  rewards: [{
    id: 'frame-cloud-summer',
    kind: 'frame',
    name: 'Khung Mây Mùa Hè',
    assets: {
      primary: 'assets/frame-cloud-summer.webp',
      plaque: 'assets/frame-cloud-summer--plaque.webp',
      preview: 'assets/frame-cloud-summer--preview.webp',
      thumbnail: 'assets/frame-cloud-summer--thumbnail.webp',
    },
  }],
  achievements: [{
    id: 'summer-first-flight',
    name: 'Chuyến Bay Đầu Tiên',
    points: 10,
    rewardIds: ['frame-cloud-summer'],
  }],
  bundles: [{
    id: 'summer-cloud-profile',
    rewardIds: ['frame-cloud-summer'],
  }],
}

const entries = [
  'manifest.json',
  'assets/frame-cloud-summer.webp',
  'assets/frame-cloud-summer--plaque.webp',
  'assets/frame-cloud-summer--preview.webp',
  'assets/frame-cloud-summer--thumbnail.webp',
]

describe('reward pack manifest', () => {
  it('validates linked rewards, achievements, bundles and assets', () => {
    assert.deepEqual(validateRewardPackManifest(manifest, entries), {
      packId: 'summer-cloud-event',
      release: '2026.08.0',
      channel: 'event',
      rewardCount: 1,
      achievementCount: 1,
      bundleCount: 1,
      assetCount: 4,
    })
  })

  it('rejects path traversal and missing reward links', () => {
    assert.throws(() => validateZipEntryPath('../secret'), /không được chứa/)
    assert.throws(() => validateRewardPackManifest({
      ...manifest,
      achievements: [{
        id: 'broken-achievement',
        points: 10,
        rewardIds: ['missing-reward'],
      }],
    }, entries), /rewardId không tồn tại/)
  })

  it('rejects a level frame without its scalable level plaque', () => {
    const withoutPlaque = structuredClone(manifest)
    delete withoutPlaque.rewards[0].assets.plaque
    assert.throws(
      () => validateRewardPackManifest(withoutPlaque, entries),
      /bắt buộc có assets\.plaque/,
    )
  })

  it('accepts an integrated Profile Composition v1 level frame', () => {
    const integrated = structuredClone(manifest)
    integrated.rewards[0].id = 'frame-level-15'
    integrated.rewards[0].assets = {
      primary: 'assets/frame-level-15.webp',
    }
    integrated.achievements[0].rewardIds = ['frame-level-15']
    integrated.bundles[0].rewardIds = ['frame-level-15']

    assert.doesNotThrow(() => validateRewardPackManifest(integrated, [
      'manifest.json',
      'assets/frame-level-15.webp',
    ]))
  })
})
