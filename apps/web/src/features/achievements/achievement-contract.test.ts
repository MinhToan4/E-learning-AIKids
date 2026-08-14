import { describe, expect, it } from 'vitest'
import { ACHIEVEMENT_EVOLUTION_TIERS, ACHIEVEMENT_METRIC_REGISTRY } from './achievement-config'

describe('achievement configuration contract', () => {
  it('keeps evolution tiers globally ordered and unique', () => {
    expect(ACHIEVEMENT_EVOLUTION_TIERS.map(({ key }) => key)).toEqual([
      'sprout', 'companion', 'silver', 'gold', 'crystal', 'diamond', 'legend',
    ])
    expect(new Set(ACHIEVEMENT_EVOLUTION_TIERS.map(({ key }) => key)).size).toBe(ACHIEVEMENT_EVOLUTION_TIERS.length)
  })

  it('maps every selectable metric to one event, scope and supported operator', () => {
    expect(ACHIEVEMENT_METRIC_REGISTRY.every((metric) =>
      metric.event.includes('.') && metric.scope === 'learner' && metric.operators.includes('gte'),
    )).toBe(true)
    expect(new Set(ACHIEVEMENT_METRIC_REGISTRY.map(({ value }) => value)).size).toBe(ACHIEVEMENT_METRIC_REGISTRY.length)
  })
})
