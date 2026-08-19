import { describe, it, expect } from 'vitest'
import { ASMO_3D_TEMPLATES } from '../data/asmo-3d-templates'
import type { AsmoTemplateKey } from '../types'

describe('ASMO 3D Templates', () => {
  const templateKeys: AsmoTemplateKey[] = [
    '3D_CUBE_CLUSTER',
    'GRID_PATH_MAZE',
    'INTERACTIVE_CLOCK',
    'SHADED_AREA_FRACTION',
    'MATCHSTICK_FIGURE',
    'NET_CUBE_FOLDING',
    '3D_BALANCE_SCALE',
  ]

  it('contains exactly 7 distinct 3D visual templates', () => {
    expect(Object.keys(ASMO_3D_TEMPLATES)).toHaveLength(7)
    templateKeys.forEach((key) => {
      expect(ASMO_3D_TEMPLATES[key]).toBeDefined()
    })
  })

  it('each template has complete renderSpec, camera settings and problem definition', () => {
    templateKeys.forEach((key) => {
      const tpl = ASMO_3D_TEMPLATES[key]
      expect(tpl.title).toBeTruthy()
      expect(tpl.topicBadge).toBeTruthy()
      expect(tpl.renderSpec.template).toBe(key)
      expect(tpl.renderSpec.camera).toBeDefined()
      expect(tpl.renderSpec.camera.z).toBeGreaterThan(0)
      expect(tpl.problem.id).toBeTruthy()
      expect(tpl.problem.options.length).toBeGreaterThanOrEqual(4)
      expect(tpl.interactiveActions.length).toBeGreaterThan(0)
    })
  })

  it('validates specific template geometries', () => {
    // 1. Cube cluster has coordinates
    expect(ASMO_3D_TEMPLATES['3D_CUBE_CLUSTER'].renderSpec.cubes?.length).toBeGreaterThan(0)

    // 2. Grid path has dimensions
    expect(ASMO_3D_TEMPLATES['GRID_PATH_MAZE'].renderSpec.gridSize).toEqual([3, 2])

    // 3. Clock has hour and minute
    expect(ASMO_3D_TEMPLATES['INTERACTIVE_CLOCK'].renderSpec.hour).toBe(4)
    expect(ASMO_3D_TEMPLATES['INTERACTIVE_CLOCK'].renderSpec.minute).toBe(10)

    // 4. Shaded area has total and shaded slices
    expect(ASMO_3D_TEMPLATES['SHADED_AREA_FRACTION'].renderSpec.totalSlices).toBe(10)
    expect(ASMO_3D_TEMPLATES['SHADED_AREA_FRACTION'].renderSpec.shadedSlices).toBe(7)

    // 5. Matchsticks have segment lines
    expect(ASMO_3D_TEMPLATES['MATCHSTICK_FIGURE'].renderSpec.matches?.length).toBe(12)

    // 6. Net folding has 6 faces
    expect(ASMO_3D_TEMPLATES['NET_CUBE_FOLDING'].renderSpec.faces?.length).toBe(6)

    // 7. Balance scale has weight counts
    expect(ASMO_3D_TEMPLATES['3D_BALANCE_SCALE'].renderSpec.leftWeightCount).toBe(2)
    expect(ASMO_3D_TEMPLATES['3D_BALANCE_SCALE'].renderSpec.rightWeightCount).toBe(6)
  })
})
