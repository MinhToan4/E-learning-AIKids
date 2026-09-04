import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  DEFAULT_PROMPT_FRAMEWORKS,
  PROMPT_FRAMEWORK_CATEGORIES,
  STORAGE_KEY_PROMPT_FRAMEWORKS,
  loadPromptFrameworks,
  savePromptFrameworks,
  renderPromptFramework,
  type PromptFrameworkItem,
} from './prompt-frameworks-data'

describe('prompt-frameworks-data', () => {
  describe('DEFAULT_PROMPT_FRAMEWORKS integrity', () => {
    it('contains exactly 8 core prompt frameworks', () => {
      expect(DEFAULT_PROMPT_FRAMEWORKS).toHaveLength(8)
    })

    const expectedIds = [
      'sketch_to_art',
      'character_mascot',
      'comic_script',
      'story_narrative',
      'scaffolded_chips',
      'asmo_math_visual',
      'mee_tutor_llm',
      'video_motion',
    ]

    it.each(expectedIds)('includes framework with id "%s" and valid fields', (id) => {
      const item = DEFAULT_PROMPT_FRAMEWORKS.find((f) => f.id === id)
      expect(item).toBeDefined()
      expect(item?.title).toBeTruthy()
      expect(item?.appScope).toBeTruthy()
      expect(item?.description).toBeTruthy()
      expect(item?.prefix).toBeTruthy()
      expect(item?.suffix).toBeTruthy()
      expect(item?.enabled).toBe(true)
      expect(Array.isArray(item?.variables)).toBe(true)
      expect(item?.variables.length).toBeGreaterThan(0)
      for (const v of item!.variables) {
        expect(v.name).toBeTruthy()
        expect(v.label).toBeTruthy()
        expect(v.sampleValue).toBeTruthy()
      }
    })

    it('matches the countHint in PROMPT_FRAMEWORK_CATEGORIES', () => {
      for (const cat of PROMPT_FRAMEWORK_CATEGORIES) {
        if (cat.id === 'all') {
          expect(DEFAULT_PROMPT_FRAMEWORKS.length).toBe(cat.countHint)
        } else {
          const matched = DEFAULT_PROMPT_FRAMEWORKS.filter((f) => f.category === cat.id)
          expect(matched.length).toBe(cat.countHint)
        }
      }
    })
  })

  describe('renderPromptFramework', () => {
    const sampleItem: PromptFrameworkItem = {
      id: 'sketch_to_art',
      title: 'Phác Thảo',
      category: 'art',
      appScope: 'play.aikid.vn',
      description: 'Test description',
      enabled: true,
      prefix: 'Draw {subject} with {style}.',
      suffix: 'Keep it friendly for kids.',
      qualityKeywords: 'masterpiece, 8k',
      variables: [
        { name: 'subject', label: 'Chủ thể', sampleValue: 'a cute cat' },
        { name: 'style', label: 'Phong cách', sampleValue: 'clay animation' },
      ],
    }

    it('interpolates default sample values when no overrides provided', () => {
      const result = renderPromptFramework(sampleItem)
      expect(result).toBe(
        'Draw a cute cat with clay animation. Keep it friendly for kids. masterpiece, 8k',
      )
    })

    it('interpolates provided overrides accurately', () => {
      const result = renderPromptFramework(sampleItem, {
        subject: 'a smiling puppy',
        style: 'watercolor wash',
      })
      expect(result).toBe(
        'Draw a smiling puppy with watercolor wash. Keep it friendly for kids. masterpiece, 8k',
      )
    })

    it('handles items without qualityKeywords gracefully', () => {
      const noKeywordsItem: PromptFrameworkItem = {
        ...sampleItem,
        qualityKeywords: undefined,
      }
      const result = renderPromptFramework(noKeywordsItem)
      expect(result).toBe('Draw a cute cat with clay animation. Keep it friendly for kids.')
    })

    it('replaces multiple occurrences of the same variable', () => {
      const multiVarItem: PromptFrameworkItem = {
        ...sampleItem,
        prefix: 'Character {name} meets another friend. Hello {name}!',
        variables: [{ name: 'name', label: 'Tên', sampleValue: 'Mee' }],
      }
      const result = renderPromptFramework(multiVarItem)
      expect(result).toContain('Character Mee meets another friend. Hello Mee!')
    })
  })

  describe('loadPromptFrameworks and savePromptFrameworks', () => {
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

    it('returns DEFAULT_PROMPT_FRAMEWORKS when localStorage is empty', () => {
      const result = loadPromptFrameworks()
      expect(result).toEqual(DEFAULT_PROMPT_FRAMEWORKS)
    })

    it('saves items to localStorage and retrieves merged items', () => {
      const customFrameworks = DEFAULT_PROMPT_FRAMEWORKS.map((item) =>
        item.id === 'sketch_to_art' ? { ...item, prefix: 'Custom prefix {styleDescriptor}' } : item,
      )
      savePromptFrameworks(customFrameworks)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY_PROMPT_FRAMEWORKS,
        expect.any(String),
      )

      const loaded = loadPromptFrameworks()
      const sketchItem = loaded.find((f) => f.id === 'sketch_to_art')
      expect(sketchItem?.prefix).toBe('Custom prefix {styleDescriptor}')
    })

    it('recovers gracefully to DEFAULT_PROMPT_FRAMEWORKS on corrupted JSON in localStorage', () => {
      mockStorage[STORAGE_KEY_PROMPT_FRAMEWORKS] = 'invalid-json{{{[]'
      const result = loadPromptFrameworks()
      expect(result).toEqual(DEFAULT_PROMPT_FRAMEWORKS)
    })

    it('recovers gracefully to DEFAULT_PROMPT_FRAMEWORKS if localStorage contains non-array JSON', () => {
      mockStorage[STORAGE_KEY_PROMPT_FRAMEWORKS] = JSON.stringify({ notAnArray: true })
      const result = loadPromptFrameworks()
      expect(result).toEqual(DEFAULT_PROMPT_FRAMEWORKS)
    })
  })
})
