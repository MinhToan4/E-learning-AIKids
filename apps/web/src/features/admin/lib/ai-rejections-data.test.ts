import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  DEFAULT_REJECTION_INCIDENTS,
  STORAGE_KEY_AI_REJECTIONS,
  loadRejectionIncidents,
  saveRejectionIncidents,
  type AiRejectionIncident,
} from './ai-rejections-data'

describe('ai-rejections-data module', () => {
  let mockStorage: Record<string, string> = {}

  beforeEach(() => {
    mockStorage = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = val
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        mockStorage = {}
      }),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads default rejection incidents when storage is empty', () => {
    const incidents = loadRejectionIncidents()
    expect(incidents).toHaveLength(DEFAULT_REJECTION_INCIDENTS.length)
    expect(incidents[0].id).toBe('inc_001')
    expect(incidents[0].studentName).toBe('Bé Minh Triết')
    expect(incidents[0].flaggedTrigger).toBe('kiếm gỗ')
    expect(incidents[0].status).toBe('pending')

    // At least 6 cases
    expect(incidents.length).toBeGreaterThanOrEqual(6)
  })

  it('saves and reloads updated rejection incidents', () => {
    const current = loadRejectionIncidents()
    const updated: AiRejectionIncident[] = current.map((item) =>
      item.id === 'inc_001'
        ? {
            ...item,
            status: 'approved_override' as const,
            adminNote: 'Đã duyệt gỡ chặn thủ công',
            reviewedAt: '2026-09-04 16:00',
          }
        : item,
    )

    saveRejectionIncidents(updated)
    const reloaded = loadRejectionIncidents()
    const target = reloaded.find((i) => i.id === 'inc_001')

    expect(target).toBeDefined()
    expect(target?.status).toBe('approved_override')
    expect(target?.adminNote).toBe('Đã duyệt gỡ chặn thủ công')
    expect(target?.reviewedAt).toBe('2026-09-04 16:00')
  })

  it('updates incident to confirmed_rejected', () => {
    const current = loadRejectionIncidents()
    const updated: AiRejectionIncident[] = current.map((item) =>
      item.id === 'inc_002'
        ? {
            ...item,
            status: 'confirmed_rejected' as const,
            adminNote: 'Xác nhận giữ nguyên lệnh chặn',
          }
        : item,
    )

    saveRejectionIncidents(updated)
    const reloaded = loadRejectionIncidents()
    const target = reloaded.find((i) => i.id === 'inc_002')

    expect(target?.status).toBe('confirmed_rejected')
    expect(target?.adminNote).toBe('Xác nhận giữ nguyên lệnh chặn')
  })

  it('handles invalid JSON in localStorage gracefully by returning defaults', () => {
    mockStorage[STORAGE_KEY_AI_REJECTIONS] = 'invalid-json-data{{{'
    const incidents = loadRejectionIncidents()
    expect(incidents).toEqual(DEFAULT_REJECTION_INCIDENTS)
  })
})
