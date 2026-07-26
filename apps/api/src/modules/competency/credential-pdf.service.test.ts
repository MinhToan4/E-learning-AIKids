import { describe, expect, it } from 'vitest'
import { generateCredentialPdf } from './credential-pdf.service.js'

describe('credential PDF', () => {
  it('renders a Vietnamese completion certificate from a frozen payload', async () => {
    const pdf = await generateCredentialPdf(
      {
        learner: { nickname: 'Minh Anh', level: 7 },
        course: { title: 'Kể chuyện bằng AI' },
        eligibility: {
          completionPercent: 100,
          completedAt: '2026-07-20T10:00:00.000Z',
        },
        issuedAt: '2026-07-21T10:00:00.000Z',
      },
      '0123456789abcdef0123456789abcdef',
      {
        title: 'Chứng nhận hoàn thành',
        issuerName: 'AI Kids Creator Academy',
        accentColor: '#6D5EFC',
        bodyTemplate:
          '{{learnerName}} đã hoàn thành khóa {{courseName}} ở cấp độ {{level}}.',
      },
    )

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
    expect(pdf.byteLength).toBeGreaterThan(5_000)
  })
})
