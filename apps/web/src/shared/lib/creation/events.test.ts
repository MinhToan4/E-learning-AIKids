import { describe, expect, it } from 'vitest'
import { REWARD_EVENTS, rewardEventStatus } from './events.js'

describe('reward events', () => {
  it('calculates event status from explicit dates', () => {
    const event = REWARD_EVENTS[0]
    expect(rewardEventStatus(event, new Date('2026-06-30T00:00:00Z'))).toBe('upcoming')
    expect(rewardEventStatus(event, new Date('2026-07-15T00:00:00Z'))).toBe('active')
    expect(rewardEventStatus(event, new Date('2026-08-02T00:00:00Z'))).toBe('ended')
  })
})
