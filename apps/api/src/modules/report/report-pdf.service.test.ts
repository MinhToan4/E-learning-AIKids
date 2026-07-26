import { describe, expect, it } from 'vitest'
import { generateLearningReportPdf } from './report-pdf.service.js'

describe('learning report PDF', () => {
  it('renders a Vietnamese report as a real multi-section PDF', async () => {
    const pdf = await generateLearningReportPdf(
      {
        period: {
          start: '2026-06-01T00:00:00.000Z',
          end: '2026-07-01T00:00:00.000Z',
        },
        student: { nickname: 'Minh Anh' },
        courses: [
          {
            title: 'Khám phá trí tuệ nhân tạo',
            completedLessons: 8,
            totalLessons: 10,
            completionPercent: 80,
          },
        ],
        assessments: [
          {
            assessment: { title: 'Bài đánh giá cuối khóa' },
            scorePercent: 92,
            status: 'published',
          },
        ],
        competency: [
          {
            domain: { name: 'Tư duy sáng tạo' },
            skill: { name: 'Kể chuyện bằng hình ảnh' },
            level: 'achieved',
            scorePercent: 88,
            evidenceCount: 4,
          },
        ],
        portfolio: [{ title: 'Thành phố tương lai', kind: 'image' }],
        teacherFeedback: [
          {
            body: 'Con biết lắng nghe phản hồi và cải thiện tác phẩm.',
            teacher: { nickname: 'Cô Lan' },
          },
        ],
        strengths: ['Chủ động thử nghiệm nhiều ý tưởng mới.'],
        development: ['Trình bày rõ hơn lý do lựa chọn công cụ.'],
        nextSteps: ['Hoàn thành bài Thiết kế nhân vật đồng hành.'],
        credentials: [
          {
            name: 'Nhà sáng tạo nhí',
            course: { title: 'Khám phá trí tuệ nhân tạo' },
            verificationCode: 'AIKIDS-2026-001',
          },
        ],
      },
      {
        title: 'Báo cáo hành trình học tập',
        issuerName: 'AI Kids Creator Academy',
        accentColor: '#6d5efc',
        footerText: 'Thông tin riêng tư dành cho gia đình',
        showScores: true,
      },
    )

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
    expect(pdf.byteLength).toBeGreaterThan(5_000)
  })
})
