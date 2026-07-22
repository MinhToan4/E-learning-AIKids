import { describe, expect, it } from 'vitest'
import {
  buildImageGenRefs,
  buildVideoGenRefs,
  buildVidtoryUploadMetadata,
  isCourseCreatedAsset,
  isCreativeWorkshopAsset,
  isUsableImageReference,
  parseCourseSketchDataUrl,
} from './media-refs.js'

describe('media-refs', () => {
  it('image: 0 / 1 / N', () => {
    expect(buildImageGenRefs([])).toEqual({ textOnly: true })
    expect(buildImageGenRefs(['https://a'])).toEqual({
      textOnly: false,
      refImageUrl: 'https://a',
    })
    const multi = buildImageGenRefs(['https://a', 'https://b', 'https://a'])
    expect(multi.startImages).toEqual(['https://a', 'https://b'])
    expect(multi.refImageUrl).toBe('https://a')
  })

  it('video: 0 / 1 / N', () => {
    expect(buildVideoGenRefs([])).toEqual({ textOnly: true, hasRef: false })
    expect(buildVideoGenRefs(['id-1'])).toEqual({
      textOnly: false,
      hasRef: true,
      refImageUrl: 'id-1',
    })
    const multi = buildVideoGenRefs(['u1', 'u2'])
    expect(multi.hasRef).toBe(true)
    expect(multi.startImages).toEqual(['u1', 'u2'])
    expect(multi.refImageUrl).toBe('u1')
  })

  it('upload metadata tags student', () => {
    const m = buildVidtoryUploadMetadata({
      userId: 'user-uuid',
      purpose: 'i2v_ref',
      questId: 'q1',
    })
    expect(m.aikids_user_id).toBe('user-uuid')
    expect(m.aikids_purpose).toBe('i2v_ref')
    expect(m.aikids_quest_id).toBe('q1')
    expect(m.aikids_tenant).toBe('aikids')
  })

  it('blocks free uploads as course refs', () => {
    expect(
      isCourseCreatedAsset({
        questId: null,
        type: 'panel',
        meta: { purpose: 'backpack_upload' },
      }),
    ).toBe(false)
    expect(
      isCourseCreatedAsset({
        questId: 'l1-k1-q1',
        type: 'panel',
        meta: { generationMode: 'vidtory' },
      }),
    ).toBe(true)
    expect(
      isCourseCreatedAsset({
        questId: null,
        type: 'character',
        meta: { prompt: 'mèo clay', provider: 'vidtory' },
      }),
    ).toBe(true)
    expect(
      isCourseCreatedAsset({
        questId: 'q-sketch',
        type: 'panel',
        meta: { kind: 'sketch', purpose: 'course_sketch', courseCreated: true },
      }),
    ).toBe(true)
  })

  it('accepts only provider-readable image references', () => {
    expect(isUsableImageReference('https://cdn.example.com/a.png')).toBe(true)
    expect(isUsableImageReference('http://localhost:8080/a.webp')).toBe(true)
    expect(
      isUsableImageReference(`data:image/png;base64,${'A'.repeat(200)}`),
    ).toBe(true)
    expect(isUsableImageReference('/assets/designer/style.jpeg')).toBe(false)
    expect(isUsableImageReference('javascript:alert(1)')).toBe(false)
    expect(isUsableImageReference('data:text/html;base64,PGgxPg==')).toBe(false)
  })

  it('parseCourseSketchDataUrl accepts canvas png only', () => {
    // 1x1 png base64 is too small → rejected
    const tiny =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    expect(parseCourseSketchDataUrl(tiny).ok).toBe(false)
    expect(parseCourseSketchDataUrl('https://evil.com/x.png').ok).toBe(false)
    // pad base64 to pass min size
    const pad = 'A'.repeat(400)
    const bigEnough = `data:image/png;base64,${pad}`
    const ok = parseCourseSketchDataUrl(bigEnough)
    expect(ok.ok).toBe(true)
  })

  it('allows only explicit workshop creations to continue outside a lesson', () => {
    expect(
      isCreativeWorkshopAsset({
        purpose: 'creative_workshop',
        creativeKind: 'character',
      }),
    ).toBe(true)
    expect(isCreativeWorkshopAsset({ purpose: 'student_upload' })).toBe(false)
    expect(isCreativeWorkshopAsset({})).toBe(false)
  })
})
