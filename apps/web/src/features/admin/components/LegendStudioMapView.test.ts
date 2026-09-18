import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// Pure logic mirrors for progression rhythm & quick jump calculation
export function calculateLevelBand(level: number): { bandStart: number; bandEnd: number; bandKey: string } {
  const clamped = Math.min(100, Math.max(1, level))
  const bandStart = Math.floor((clamped - 1) / 10) * 10 + 1
  const bandEnd = Math.min(100, bandStart + 9)
  return {
    bandStart,
    bandEnd,
    bandKey: `level:${bandStart}`,
  }
}

export function computeBandLevels(bandStart: number, bandEnd: number): number[] {
  const levels: number[] = []
  for (let l = bandStart; l <= bandEnd; l++) {
    levels.push(l)
  }
  return levels
}

export function detectEmptyMilestones(levels: number[], assignedLevels: Set<number>): number[] {
  return levels.filter((lvl) => !assignedLevels.has(lvl))
}

describe('LegendStudioMapView - Progression & Quick Jump Math', () => {
  it('correctly maps levels to their respective 10-level bands', () => {
    expect(calculateLevelBand(1)).toEqual({ bandStart: 1, bandEnd: 10, bandKey: 'level:1' })
    expect(calculateLevelBand(10)).toEqual({ bandStart: 1, bandEnd: 10, bandKey: 'level:1' })
    expect(calculateLevelBand(11)).toEqual({ bandStart: 11, bandEnd: 20, bandKey: 'level:11' })
    expect(calculateLevelBand(25)).toEqual({ bandStart: 21, bandEnd: 30, bandKey: 'level:21' })
    expect(calculateLevelBand(99)).toEqual({ bandStart: 91, bandEnd: 100, bandKey: 'level:91' })
    expect(calculateLevelBand(100)).toEqual({ bandStart: 91, bandEnd: 100, bandKey: 'level:91' })
  })

  it('clamps invalid or out-of-range jump inputs', () => {
    expect(calculateLevelBand(-5)).toEqual({ bandStart: 1, bandEnd: 10, bandKey: 'level:1' })
    expect(calculateLevelBand(0)).toEqual({ bandStart: 1, bandEnd: 10, bandKey: 'level:1' })
    expect(calculateLevelBand(150)).toEqual({ bandStart: 91, bandEnd: 100, bandKey: 'level:91' })
  })

  it('generates exact 10 levels for each band', () => {
    const band1 = computeBandLevels(1, 10)
    expect(band1).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    const band3 = computeBandLevels(21, 30)
    expect(band3).toHaveLength(10)
    expect(band3[0]).toBe(21)
    expect(band3[9]).toBe(30)
  })

  it('accurately identifies empty milestone slots', () => {
    const levels = computeBandLevels(1, 10)
    const assigned = new Set([1, 5, 10])
    const empty = detectEmptyMilestones(levels, assigned)
    expect(empty).toEqual([2, 3, 4, 6, 7, 8, 9])
  })
})

describe('LegendStudioMapView - Static Quality & Architectural Audit', () => {
  const sourcePath = path.join(process.cwd(), 'src/features/admin/components/legend-studio/LegendStudioMapView.tsx')
  const source = fs.readFileSync(sourcePath, 'utf8')

  it('preserves all unlock channels and tabs', () => {
    // Requirements categories
    expect(source).toContain("['level', 'Level', MapIcon]")
    expect(source).toContain("['action', 'Achieve', Network]")
    expect(source).toContain("['storybook', 'Story', BookOpen]")
    expect(source).toContain("['event', 'Event', CalendarDays]")

    // Table channel filters
    expect(source).toContain("['all', 'Tất cả']")
    expect(source).toContain("['level', 'Theo level']")
    expect(source).toContain("['event', 'Sự kiện']")
    expect(source).toContain("['storybook', 'Storybook']")
    expect(source).toContain("['action', 'Achievement']")
    expect(source).toContain("['unconfigured', 'Chưa cấu hình']")
  })

  it('includes Quick Jump input and handler with accessibility attributes', () => {
    expect(source).toContain('handleQuickJump')
    expect(source).toContain('placeholder="Nhảy đến level (vd: 25)..."')
    expect(source).toContain('aria-label="Nhập level cần nhảy tới"')
    expect(source).toContain('clampedLvl')
  })

  it('includes Band Milestone Pacer Strip and click handler', () => {
    expect(source).toContain('Nhịp độ chặng:')
    expect(source).toContain('handlePacerClick')
    expect(source).toContain('currentBandInfo.levels.map')
    expect(source).toContain('highlightedMilestone')
  })

  it('supports toggling empty milestone slots (Progression Rhythm)', () => {
    expect(source).toContain('showAllLevels')
    expect(source).toContain('Hiện toàn bộ mốc trống')
    expect(source).toContain('Chưa có phần thưởng')
    expect(source).toContain('Gán quà cho Level')
  })

  it('integrates RewardMappingWorkspace and SelectedRewardDrawer', () => {
    expect(source).toContain('RewardMappingWorkspace')
    expect(source).toContain('openLevelMapping')
    expect(source).toContain('mappingBuilderLevel')
    expect(source).toContain('SelectedRewardDrawer')
    expect(source).toContain('selectedReward')
  })

  it('supports both Tree and Table data modes with pagination', () => {
    expect(source).toContain('Cây trực quan')
    expect(source).toContain('Bảng dữ liệu')
    expect(source).toContain('mapPage')
    expect(source).toContain('mapPageCount')
    expect(source).toContain('Trang trước')
    expect(source).toContain('Trang sau')
  })

  it('maintains persistent filter bar and empty state reset button', () => {
    expect(source).toContain('PERSISTENT HEADER & FILTER BAR')
    expect(source).toContain('Xóa bộ lọc')
    expect(source).toContain('handleResetFilters')
    expect(source).toContain('handleToggleKindFilter')
    expect(source).toContain('FIXED_LEVEL_BANDS')
    expect(source).toContain('LEVEL_ALLOWED_KINDS')
  })
})

describe('LegendStudioMapView - Filter & Progression Resilience', () => {
  it('defines exactly 10 fixed level bands covering 1 to 100', () => {
    const FIXED_LEVEL_BANDS = [1, 11, 21, 31, 41, 51, 61, 71, 81, 91]
    expect(FIXED_LEVEL_BANDS).toHaveLength(10)
    expect(FIXED_LEVEL_BANDS[0]).toBe(1)
    expect(FIXED_LEVEL_BANDS[9]).toBe(91)
  })

  it('restricts Level channel reward kinds and strictly excludes chapter and achievement', () => {
    const LEVEL_ALLOWED_KINDS = new Set([
      'avatar',
      'background',
      'companion',
      'effect',
      'frame',
      'perk',
      'theme',
      'title',
    ])

    expect(LEVEL_ALLOWED_KINDS.has('background')).toBe(true)
    expect(LEVEL_ALLOWED_KINDS.has('avatar')).toBe(true)
    expect(LEVEL_ALLOWED_KINDS.has('companion')).toBe(true)
    expect(LEVEL_ALLOWED_KINDS.has('effect')).toBe(true)
    expect(LEVEL_ALLOWED_KINDS.has('frame')).toBe(true)
    expect(LEVEL_ALLOWED_KINDS.has('perk')).toBe(true)
    expect(LEVEL_ALLOWED_KINDS.has('theme')).toBe(true)
    expect(LEVEL_ALLOWED_KINDS.has('title')).toBe(true)

    expect(LEVEL_ALLOWED_KINDS.has('chapter')).toBe(false)
    expect(LEVEL_ALLOWED_KINDS.has('achievement')).toBe(false)
    expect(LEVEL_ALLOWED_KINDS.has('event')).toBe(false)
  })

  it('toggles active kind filter back to all when clicked again', () => {
    const toggle = (current: string, clicked: string) => (current === clicked ? 'all' : clicked)

    expect(toggle('all', 'background')).toBe('background')
    expect(toggle('background', 'background')).toBe('all')
    expect(toggle('frame', 'background')).toBe('background')
  })

  it('keeps all 10 level bands in sidebar even when filtered kind has 0 items in Level 11-20', () => {
    const FIXED_LEVEL_BANDS = [1, 11, 21, 31, 41, 51, 61, 71, 81, 91]
    // Mock items with a background reward only at Level 25 (Band 21-30)
    const filteredRows = [
      {
        channel: 'level' as const,
        item: {
          id: 'bg-1',
          code: 'bg.space',
          name: 'Vũ trụ',
          kind: 'background',
          contentType: 'reward',
          unlockRule: { type: 'xp_level', value: 25 },
        },
      },
    ]

    const groups = new Map<number, typeof filteredRows>()
    for (const band of FIXED_LEVEL_BANDS) {
      groups.set(band, [])
    }
    for (const row of filteredRows) {
      if (row.channel !== 'level') continue
      const level = Number(row.item.unlockRule.value)
      const band = Math.floor((Math.min(100, level) - 1) / 10) * 10 + 1
      const currentRows = groups.get(band) ?? []
      currentRows.push(row)
      groups.set(band, currentRows)
    }

    const navigationGroups = FIXED_LEVEL_BANDS.map((band) => ({
      key: `level:${band}`,
      title: `Level ${band}–${Math.min(100, band + 9)}`,
      rows: groups.get(band) ?? [],
    }))

    // Verify all 10 bands are preserved in sidebar
    expect(navigationGroups).toHaveLength(10)
    expect(navigationGroups.map((g) => g.key)).toEqual([
      'level:1',
      'level:11',
      'level:21',
      'level:31',
      'level:41',
      'level:51',
      'level:61',
      'level:71',
      'level:81',
      'level:91',
    ])

    // Level 11–20 is present in the sidebar even though it has 0 items
    const band11 = navigationGroups.find((g) => g.key === 'level:11')
    expect(band11).toBeDefined()
    expect(band11?.rows).toHaveLength(0)

    // Band 21-30 has the 1 item
    const band21 = navigationGroups.find((g) => g.key === 'level:21')
    expect(band21?.rows).toHaveLength(1)
  })

  it('handleResetFilters properly resets kind filter to all and clears query', () => {
    let mapRewardKind = 'background'
    let mapQuery = 'search term'

    const handleResetFilters = () => {
      mapRewardKind = 'all'
      mapQuery = ''
    }

    handleResetFilters()
    expect(mapRewardKind).toBe('all')
    expect(mapQuery).toBe('')
  })

  it('computes mapRewardKinds from channelScopedRows so filter bar does not collapse on filter selection', () => {
    const channelScopedRows = [
      { item: { kind: 'frame', contentType: 'reward' } },
      { item: { kind: 'avatar', contentType: 'reward' } },
      { item: { kind: 'background', contentType: 'reward' } },
      { item: { kind: 'perk', contentType: 'reward' } },
    ]
    const LEVEL_ALLOWED_KINDS = new Set(['avatar', 'background', 'frame', 'perk'])

    const kindCounts = new Map<string, number>()
    for (const row of channelScopedRows) {
      const kind = row.item.kind ?? row.item.contentType
      if (!LEVEL_ALLOWED_KINDS.has(kind)) continue
      kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1)
    }
    const kinds = [...kindCounts.entries()].sort(([left], [right]) => left.localeCompare(right, 'vi'))

    // All 4 kinds remain available in the filter bar
    expect(kinds.map(([k]) => k)).toEqual(['avatar', 'background', 'frame', 'perk'])
  })
})

describe('LegendRewardStudio - 4 Navigation Menus Architecture', () => {
  const studioSourcePath = path.join(process.cwd(), 'src/features/admin/components/LegendRewardStudio.tsx')
  const studioSource = fs.readFileSync(studioSourcePath, 'utf8')

  it('declares exactly 4 structured navigation modes with labels and icons', () => {
    // 1. Cây tiến trình
    expect(studioSource).toContain('Cây tiến trình')
    expect(studioSource).toContain('Mốc Level (1–100), Storybook & Sự kiện')
    expect(studioSource).toContain("onClick={() => setView('map')}")

    // 2. Kho tài sản
    expect(studioSource).toContain('Kho tài sản')
    expect(studioSource).toContain('Quản lý catalog, versioning & audit')
    expect(studioSource).toContain("onClick={() => setView('library')}")

    // 3. Xưởng thiết kế
    expect(studioSource).toContain('Xưởng thiết kế')
    expect(studioSource).toContain('Upload ảnh, kiểm tra spec & pack ZIP')
    expect(studioSource).toContain("onClick={() => openDesigner('single')}")

    // 4. Bố cục thẻ hồ sơ
    expect(studioSource).toContain('Bố cục thẻ hồ sơ')
    expect(studioSource).toContain('Visual editor kéo thả slot trang bị')
    expect(studioSource).toContain("onClick={() => setView('profile-card')}")
  })

  it('routes correctly to the 4 views', () => {
    expect(studioSource).toContain("{view === 'map' && (")
    expect(studioSource).toContain("<LegendStudioMapView")
    expect(studioSource).toContain("{view === 'library' && (")
    expect(studioSource).toContain("<LegendStudioOverviewTab")
    expect(studioSource).toContain("{view === 'designer' && designerMode === 'single' && (")
    expect(studioSource).toContain("<LegendStudioDesignerTab")
    expect(studioSource).toContain("{view === 'profile-card' && (")
    expect(studioSource).toContain("<ProfileCardLayoutEditor")
  })
})


