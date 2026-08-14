import { describe, expect, it } from 'vitest'
import { isOrderingComplete, moveOrderingCard, type OrderingPracticeCard } from './OrderingPractice'

const cards: OrderingPracticeCard[] = [
  { id: 'open', title: 'Mở cảnh', description: '' },
  { id: 'discover', title: 'Phát hiện', description: '' },
  { id: 'emotion', title: 'Cảm xúc', description: '' },
  { id: 'action', title: 'Hành động', description: '' },
]

describe('ordering practice', () => {
  it('moves cards without mutating the saved order', () => {
    const order = ['discover', 'open', 'emotion', 'action']
    expect(moveOrderingCard(order, 0, 1)).toEqual(['open', 'discover', 'emotion', 'action'])
    expect(order).toEqual(['discover', 'open', 'emotion', 'action'])
  })

  it('only completes when every storyboard card is in the authored order', () => {
    expect(isOrderingComplete(['open', 'discover', 'emotion', 'action'], cards)).toBe(true)
    expect(isOrderingComplete(['open', 'emotion', 'discover', 'action'], cards)).toBe(false)
  })
})
