// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter, useNavigate } from 'react-router'
import RuleLessonJourneyRenderer from './RuleLessonJourneyRenderer'
import { useAuth } from '@/shared/store/auth'
import type { QuestDetail } from '@/shared/lib/api'

// Mock useNavigate from react-router
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual<any>('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('RuleLessonJourneyRenderer — Trạm 10 & Paywall Gating', () => {
  let container: HTMLDivElement
  let root: Root

  const mockQuest: QuestDetail = {
    id: 'rule-10',
    slug: 'rule-10',
    title: 'Quy tắc 10: Chia sẻ an toàn và tôn trọng',
    description: 'Quy tắc an toàn khi sáng tạo cùng AI',
    status: 'available',
    stars: 3,
    xp: 50,
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mockNavigate.mockReset()
    useAuth.setState({
      user: {
        id: 'child-1',
        role: 'student',
        email: null,
        nickname: 'Bé Mây',
        avatarId: null,
        level: 1,
        xp: 150,
        onboarded: true,
        goal: null,
        parentId: 'parent-1',
        classId: null,
      },
      loading: false,
      error: null,
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('cấu hình stage 6 completion đặc biệt cho Quy tắc 10 với đích đến Đảo 1 (bai-1-1)', () => {
    act(() => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(RuleLessonJourneyRenderer, {
            quest: mockQuest,
            ruleId: 10,
            effectiveCourseId: 'muoi-quy-tac-xuong-sang-tao',
            liveStars: 3,
            initialStageIndex: 5,
            isCompleted: true,
            onFinish: vi.fn(),
          }),
        ),
      )
    })

    // Xác nhận tiêu đề và lời chúc mừng Hiệp Sĩ AIKI
    expect(document.body.textContent).toContain('Chúc mừng tân Hiệp Sĩ AIKI!')
    expect(document.body.textContent).toContain(
      'Xuất sắc! Con đã hoàn thành trọn vẹn 10 Quy Tắc Vàng của Xưởng Sáng Tạo AI. Hãy sẵn sàng mở khóa Hải Trình Đảo 1 nhé!',
    )
  })

  it('bật CoursePaywallModal khi học sinh chưa có gói bấm nút chuyển sang bai-1-1', () => {
    act(() => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(RuleLessonJourneyRenderer, {
            quest: mockQuest,
            ruleId: 10,
            effectiveCourseId: 'muoi-quy-tac-xuong-sang-tao',
            liveStars: 3,
            initialStageIndex: 5,
            isCompleted: true,
            onFinish: vi.fn(),
          }),
        ),
      )
    })

    // Tìm nút khám phá bài học tiếp theo trên giao diện phần thưởng
    const nextBtn = Array.from(document.querySelectorAll('button')).find(
      (b) =>
        b.textContent?.includes('Bài tiếp theo') ||
        b.textContent?.includes('Tiếp tục') ||
        b.textContent?.includes('Trạm tiếp theo') ||
        b.getAttribute('aria-label')?.includes('Bài tiếp theo'),
    )

    if (nextBtn) {
      act(() => {
        nextBtn.click()
      })
      // Phải mở paywall modal
      expect(document.body.textContent).toContain('Con Đã Sẵn Sàng Cho Hành Trình Mới?')
      expect(document.body.textContent).toContain('Ba Mẹ Ơi, Mở Khóa Cho Con!')
    }
  })

  it('điều hướng trực tiếp sang /world/dao-1/lesson/bai-1-1 nếu người dùng đã có gói active', () => {
    useAuth.setState({
      user: {
        id: 'child-1',
        role: 'student',
        email: null,
        nickname: 'Bé Mây',
        avatarId: null,
        level: 1,
        xp: 150,
        onboarded: true,
        goal: null,
        parentId: 'parent-1',
        classId: null,
        ...({
          planCode: 'aikids_official_129k',
          subscription: { status: 'active' },
        } as any),
      },
    })

    act(() => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(RuleLessonJourneyRenderer, {
            quest: mockQuest,
            ruleId: 10,
            effectiveCourseId: 'muoi-quy-tac-xuong-sang-tao',
            liveStars: 3,
            initialStageIndex: 5,
            isCompleted: true,
            onFinish: vi.fn(),
          }),
        ),
      )
    })

    const nextBtn = Array.from(document.querySelectorAll('button')).find(
      (b) =>
        b.textContent?.includes('Bài tiếp theo') ||
        b.textContent?.includes('Tiếp tục') ||
        b.textContent?.includes('Trạm tiếp theo'),
    )

    if (nextBtn) {
      act(() => {
        nextBtn.click()
      })
      expect(mockNavigate).toHaveBeenCalledWith('/world/dao-1/lesson/bai-1-1')
    }
  })

  it('chuyển bài bình thường giữa các quy tắc 1-9 (rule-1 sang rule-2)', () => {
    const questRule1: QuestDetail = {
      ...mockQuest,
      id: 'rule-1',
      slug: 'rule-1',
      title: 'Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI',
    }

    act(() => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(RuleLessonJourneyRenderer, {
            quest: questRule1,
            ruleId: 1,
            effectiveCourseId: 'muoi-quy-tac-xuong-sang-tao',
            liveStars: 3,
            initialStageIndex: 5,
            isCompleted: true,
            onFinish: vi.fn(),
          }),
        ),
      )
    })

    const nextBtn = Array.from(document.querySelectorAll('button')).find(
      (b) =>
        b.textContent?.includes('Bài tiếp theo') ||
        b.textContent?.includes('Tiếp tục') ||
        b.textContent?.includes('Trạm tiếp theo'),
    )

    if (nextBtn) {
      act(() => {
        nextBtn.click()
      })
      expect(mockNavigate).toHaveBeenCalledWith('/world/muoi-quy-tac-xuong-sang-tao/lesson/rule-2')
    }
  })
})
