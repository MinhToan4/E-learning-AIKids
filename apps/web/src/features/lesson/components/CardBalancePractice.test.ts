import { describe, expect, it } from 'vitest'
import { validateCardStats, MAX_STAT_BUDGET, type CardStatValues } from './CardBalancePractice'

describe('CardBalancePractice (Island 5 Game Stats Logic)', () => {
  it('enforces total budget <= 20 points', () => {
    expect(MAX_STAT_BUDGET).toBe(20)

    // Valid balanced card (8 + 2 + 2 = 12 <= 20)
    const balanced: CardStatValues = {
      name: 'Cái Chảo Gang',
      power: 8,
      speed: 2,
      agility: 2,
      skill: 'Phản đòn dầu sôi',
    }
    const validResult = validateCardStats(balanced)
    expect(validResult.isValid).toBe(true)
    expect(validResult.total).toBe(12)
    expect(validResult.error).toBeNull()

    // Edge case: Exactly 20 points (10 + 5 + 5 = 20 <= 20)
    const maxBudget: CardStatValues = {
      name: 'Rồng Lửa Bếp Hoàng Cung',
      power: 10,
      speed: 5,
      agility: 5,
      skill: 'Khè lửa',
    }
    const maxResult = validateCardStats(maxBudget)
    expect(maxResult.isValid).toBe(true)
    expect(maxResult.total).toBe(20)
    expect(maxResult.error).toBeNull()

    // Invalid overloaded card (10 + 10 + 10 = 30 > 20)
    const overloaded: CardStatValues = {
      name: 'Thẻ Bất Bại Gian Lận',
      power: 10,
      speed: 10,
      agility: 10,
      skill: 'Thắng luôn',
    }
    const invalidResult = validateCardStats(overloaded)
    expect(invalidResult.isValid).toBe(false)
    expect(invalidResult.total).toBe(30)
    expect(invalidResult.error).toContain('vượt quá quy định')
  })

  it('rejects empty name or zero stats', () => {
    const emptyName: CardStatValues = {
      name: '   ',
      power: 5,
      speed: 5,
      agility: 5,
      skill: 'Kỹ năng',
    }
    expect(validateCardStats(emptyName).isValid).toBe(false)
    expect(validateCardStats(emptyName).error).toContain('tên cho thẻ bài')

    const zeroStats: CardStatValues = {
      name: 'Thẻ Rỗng',
      power: 0,
      speed: 0,
      agility: 0,
      skill: 'Không có',
    }
    expect(validateCardStats(zeroStats).isValid).toBe(false)
    expect(validateCardStats(zeroStats).error).toContain('ít nhất một chỉ số')
  })
})
