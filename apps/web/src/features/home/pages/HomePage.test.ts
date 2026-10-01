import { describe, expect, it } from 'vitest'
import type { CourseSummary } from '@/shared/lib/api'
import { courseBadge, coursesWithEnrollments, OFFICIAL_SIX_ISLANDS } from './HomePage'

const course = (id: string): CourseSummary => ({
  id,
  title: id,
  shortTitle: id,
  tagline: '',
  description: '',
  accent: '#fff',
  coverImage: null,
  ageTrack: 'L2',
  ageLabel: '9–11 tuổi',
  durationLabel: '',
  productLabel: '',
  status: 'open',
  enrolled: false,
  recommended: false,
  coverFrom: '#fff',
  coverTo: '#fff',
  questCount: 0,
  skills: [],
  quests: [],
})

describe('coursesWithEnrollments', () => {
  it('shows only canonical active/completed LMS enrollments as enrolled', () => {
    const result = coursesWithEnrollments(
      [course('ai'), course('film'), course('new')],
      [
        {
          courseId: 'ai',
          status: 'active',
          progress: [
            { status: 'completed', stars: 3 },
            { status: 'available', stars: 0 },
          ],
        },
        { courseId: 'film', status: 'completed', progress: [{ status: 'completed', stars: 2 }] },
      ],
    )

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'ai', enrolled: true, completedCount: 1, questCount: 2, totalStars: 3, progressPct: 50 }),
      expect.objectContaining({ id: 'film', enrolled: true, completedCount: 1, progressPct: 100 }),
      expect.objectContaining({ id: 'new', enrolled: false, progressPct: 0 }),
    ]))
  })

  it('uses canonical pathway stations when the pathway does not expose legacy progress', () => {
    const result = coursesWithEnrollments(
      [course('ai')],
      [{
        courseId: 'ai',
        status: 'active',
        stations: [
          { status: 'completed', stars: 3 },
          { status: 'in_progress', stars: 1 },
        ],
      }],
    )

    expect(result[0]).toMatchObject({
      enrolled: true,
      completedCount: 1,
      questCount: 2,
      totalStars: 4,
      progressPct: 50,
    })
  })

  it('uses enrollment summary counts directly when progress/stations arrays are not exposed', () => {
    const result = coursesWithEnrollments(
      [course('dao-1-nha-tham-hiem-ai')],
      [{
        courseId: 'dao-1-nha-tham-hiem-ai',
        status: 'active',
        questCount: 4,
        completedCount: 1,
        totalStars: 3,
      }],
    )

    expect(result[0]).toMatchObject({
      enrolled: true,
      completedCount: 1,
      questCount: 4,
      totalStars: 3,
      progressPct: 25,
    })
  })
})

describe('courseBadge', () => {
  it('turns internal course keys into a short child-facing level label', () => {
    expect(courseBadge({ ...course('course-123'), courseKey: 'l2-k7-hieu-va-dung-ai' })).toBe('L2')
    expect(courseBadge(course('l1-k7-ai-ban-cua-em'))).toBe('L1')
  })
})

describe('OFFICIAL_SIX_ISLANDS', () => {
  it('contains exactly 6 official islands with correct slugs, badges, quest counts and routes', () => {
    expect(OFFICIAL_SIX_ISLANDS).toHaveLength(6)

    expect(OFFICIAL_SIX_ISLANDS[0]).toMatchObject({
      id: 'island-rules',
      slug: 'muoi-quy-tac-xuong-sang-tao',
      badge: 'TIÊN QUYẾT',
      defaultQuestCount: 10,
      targetRoute: '/world/program/aikid_official?island=muoi-quy-tac-xuong-sang-tao',
      description: '10 Quy tắc vàng về an toàn, đạo đức và làm chủ AI.',
    })

    expect(OFFICIAL_SIX_ISLANDS[1]).toMatchObject({
      id: 'island-explorer',
      slug: 'dao-1-nha-tham-hiem-ai',
      badge: 'ĐẢO 1',
      defaultQuestCount: 4,
      targetRoute: '/world/program/aikid_official?island=dao-1-nha-tham-hiem-ai',
      description: '4 Chìa khóa lệnh — Tạo hình ảnh và sửa câu lệnh đúng ý.',
    })

    expect(OFFICIAL_SIX_ISLANDS[2]).toMatchObject({
      id: 'island-artist',
      slug: 'dao-2-hoa-si-ai',
      badge: 'ĐẢO 2',
      defaultQuestCount: 4,
      targetRoute: '/world/program/aikid_official?island=dao-2-hoa-si-ai',
      description: 'Sắc màu cọ vẽ — Bố cục 3 lớp và tranh biết nói.',
    })

    expect(OFFICIAL_SIX_ISLANDS[3]).toMatchObject({
      id: 'island-character',
      slug: 'dao-3-biet-doi-nhan-vat-ai',
      badge: 'ĐẢO 3',
      defaultQuestCount: 4,
      targetRoute: '/world/program/aikid_official?island=dao-3-biet-doi-nhan-vat-ai',
      description: 'Hồ sơ 3 điểm — Nhận diện nhân vật và 6 biểu cảm.',
    })

    expect(OFFICIAL_SIX_ISLANDS[4]).toMatchObject({
      id: 'island-comic',
      slug: 'dao-4-vuong-quoc-truyen-tranh-ai',
      badge: 'ĐẢO 4',
      defaultQuestCount: 4,
      targetRoute: '/world/program/aikid_official?island=dao-4-vuong-quoc-truyen-tranh-ai',
      description: 'Storyboard 8 ô — Phân khung và xuất bản truyện tranh.',
    })

    expect(OFFICIAL_SIX_ISLANDS[5]).toMatchObject({
      id: 'island-game',
      slug: 'dao-5-nha-phat-minh-tro-choi-ai',
      badge: 'ĐẢO 5',
      defaultQuestCount: 4,
      targetRoute: '/world/program/aikid_official?island=dao-5-nha-phat-minh-tro-choi-ai',
      description: 'Đấu trường thẻ bài — Bộ thẻ và luật chơi công bằng.',
    })
  })
})
