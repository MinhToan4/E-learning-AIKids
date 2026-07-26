import { describe, expect, it } from 'vitest'
import {
  buildOfflineManifest,
  searchQuestContent,
} from './learning-content.js'

const quest = {
  id: 'q-1',
  title: 'Nhân vật dũng cảm',
  hook: 'Con tìm hiểu cách nhân vật hành động.',
  skill: 'Mô tả tính cách',
  videoUrl: 'https://www.youtube.com/watch?v=demo',
  contentVersion: 3,
  learnCardsJson: JSON.stringify([
    { title: 'Ý chính', body: 'Tính cách thể hiện qua lựa chọn.' },
  ]),
  stationsJson: JSON.stringify({
    stations: [
      {
        id: 'q-1-practice',
        kind: 'practice',
        title: 'Xưởng nhân vật',
        instruction: 'Chọn một hành động dũng cảm.',
      },
    ],
  }),
}

describe('lesson content search', () => {
  it('returns anchors from entitled lesson content without answer keys', () => {
    const result = searchQuestContent(quest, 'dũng cảm')

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          anchorType: 'section',
          anchorValue: 'overview',
        }),
        expect.objectContaining({
          anchorType: 'activity',
          anchorValue: 'q-1-practice',
        }),
      ]),
    )
    expect(JSON.stringify(result)).not.toContain('correctIndex')
  })
})

describe('offline manifest', () => {
  it('keeps text content versioned and excludes non-downloadable video providers', () => {
    const manifest = buildOfflineManifest(quest, {
      grantId: 'grant-1',
      expiresAt: new Date('2026-07-27T00:00:00.000Z'),
    })

    expect(manifest).toMatchObject({
      grantId: 'grant-1',
      questId: 'q-1',
      contentVersion: 3,
      media: [],
    })
    expect(manifest.expiresAt).toBe('2026-07-27T00:00:00.000Z')
  })
})
