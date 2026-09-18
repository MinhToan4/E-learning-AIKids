import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { getItemAssignment } from './LegendStudioOverviewTab'
import type { StudioItem } from './types'

describe('LegendStudioOverviewTab - getItemAssignment logic', () => {
  it('correctly maps chapter content to storybook assignment', () => {
    const chapterItem: StudioItem = {
      id: 'chap-1',
      source: 'studio',
      contentType: 'chapter',
      code: 'CH01',
      name: 'Khởi đầu phiêu lưu',
      description: 'Chương 1',
      status: 'published',
      rarity: 'rare',
      version: 1,
      assets: {},
      displayConfig: {},
      unlockRule: { type: 'storybook_chapter', value: 'CH01' },
      content: { slug: 'CH01' },
    }
    expect(getItemAssignment(chapterItem)).toEqual({
      type: 'storybook',
      label: 'Storybook CH01',
    })
  })

  it('correctly maps event content to event assignment', () => {
    const eventItem: StudioItem = {
      id: 'event-1',
      source: 'studio',
      contentType: 'event',
      code: 'SUMMER_2026',
      name: 'Lễ Hội Mùa Hè',
      description: 'Sự kiện hè',
      status: 'published',
      rarity: 'epic',
      version: 1,
      assets: {},
      displayConfig: {},
      unlockRule: { type: 'event', value: 'SUMMER_2026' },
      content: {},
    }
    expect(getItemAssignment(eventItem)).toEqual({
      type: 'event',
      label: 'Sự kiện Lễ Hội Mùa Hè',
    })
  })

  it('correctly maps achievement content to action assignment', () => {
    const achItem: StudioItem = {
      id: 'ach-1',
      source: 'studio',
      contentType: 'achievement',
      code: 'MATH_MASTER',
      name: 'Cao Thủ Tính Nhẩm',
      description: 'Hoàn thành 50 bài',
      status: 'published',
      rarity: 'legendary',
      version: 1,
      assets: {},
      displayConfig: {},
      unlockRule: { type: 'action', metric: 'asmo_addition_streak', value: '50' },
      content: {},
    }
    expect(getItemAssignment(achItem)).toEqual({
      type: 'action',
      label: 'Achievement · asmo_addition_streak',
    })
  })

  it('correctly maps xp_level unlockRule to level assignment', () => {
    const rewardItem: StudioItem = {
      id: 'rew-1',
      source: 'studio',
      contentType: 'reward',
      code: 'FRAME_GOLDEN',
      name: 'Khung Vàng Hoàng Kim',
      description: 'Thưởng level 15',
      kind: 'frame',
      status: 'published',
      rarity: 'epic',
      version: 1,
      assets: {},
      displayConfig: {},
      unlockRule: { type: 'xp_level', value: 15 },
      content: {},
    }
    expect(getItemAssignment(rewardItem)).toEqual({
      type: 'level',
      level: 15,
      label: 'Level 15',
    })
  })

  it('correctly identifies unassigned rewards with no unlock rule', () => {
    const unassignedItem: StudioItem = {
      id: 'rew-unassigned',
      source: 'studio',
      contentType: 'reward',
      code: 'AVATAR_DRAFT',
      name: 'Avatar Chú Mèo',
      description: 'Chưa xếp vào đâu',
      kind: 'avatar',
      status: 'draft',
      rarity: 'common',
      version: 1,
      assets: {},
      displayConfig: {},
      unlockRule: { type: 'none', value: null },
      content: {},
    }
    expect(getItemAssignment(unassignedItem)).toEqual({
      type: 'unassigned',
      label: 'Chưa gán',
    })
  })
})

describe('LegendStudio UI Architectural Verification', () => {
  it('verifies CATALOG THỐNG NHẤT is NOT an intrusive banner on tabs', () => {
    const overviewTabSrc = fs.readFileSync(
      path.join(__dirname, 'LegendStudioOverviewTab.tsx'),
      'utf8',
    )
    const designerTabSrc = fs.readFileSync(
      path.join(__dirname, 'LegendStudioDesignerTab.tsx'),
      'utf8',
    )
    const mainStudioSrc = fs.readFileSync(
      path.join(__dirname, '../LegendRewardStudio.tsx'),
      'utf8',
    )

    // No banner named "CATALOG THỐNG NHẤT"
    expect(overviewTabSrc).not.toContain('CATALOG THỐNG NHẤT')
    expect(designerTabSrc).not.toContain('CATALOG THỐNG NHẤT')
    expect(mainStudioSrc).not.toContain('CATALOG THỐNG NHẤT')
  })

  it('verifies CreateMenuModal provides popup "+ Tạo mới" interface', () => {
    const modalSrc = fs.readFileSync(
      path.join(__dirname, 'LegendStudioModals.tsx'),
      'utf8',
    )
    expect(modalSrc).toContain('CreateMenuModal')
    expect(modalSrc).toContain('Chọn loại tài sản hoặc cấu hình')
    expect(modalSrc).toContain('Reward / Vật phẩm')
    expect(modalSrc).toContain('Achievement tiến hoá')
    expect(modalSrc).toContain('Storybook chapter')
    expect(modalSrc).toContain('Sự kiện')
  })

  it('verifies Visual Asset Gallery & Manager features in LegendStudioOverviewTab', () => {
    const overviewTabSrc = fs.readFileSync(
      path.join(__dirname, 'LegendStudioOverviewTab.tsx'),
      'utf8',
    )
    // Visual Asset Gallery & Manager header
    expect(overviewTabSrc).toContain('Visual Asset Gallery & Manager')
    // Grid vs List mode toggle
    expect(overviewTabSrc).toContain('viewMode')
    expect(overviewTabSrc).toContain('Lưới thẻ')
    expect(overviewTabSrc).toContain('Danh sách')
    // Unassigned filter
    expect(overviewTabSrc).toContain('Chưa gán')
    // Quick assign level modal / button
    expect(overviewTabSrc).toContain('+ Gán Level')
    expect(overviewTabSrc).toContain('onAssignToLevel')
  })

  it('verifies 2-column Studio layout and removal of 4-step banner in LegendStudioDesignerTab', () => {
    const designerTabSrc = fs.readFileSync(
      path.join(__dirname, 'LegendStudioDesignerTab.tsx'),
      'utf8',
    )
    // 2-column grid layout
    expect(designerTabSrc).toContain('lg:grid-cols-[minmax(420px,1fr)_minmax(460px,560px)]')
    // Live canvas dropzone
    expect(designerTabSrc).toContain('onDragOver')
    expect(designerTabSrc).toContain('onDrop')
    expect(designerTabSrc).toContain('Khung Live Preview')
    expect(designerTabSrc).toContain('Xem trước Trực quan')
    // No bulky 4-step banner
    expect(designerTabSrc).not.toContain('Bước 1')
    expect(designerTabSrc).not.toContain('Bước 2')
    expect(designerTabSrc).not.toContain('Bước 3')
    expect(designerTabSrc).not.toContain('Bước 4')
  })
})
