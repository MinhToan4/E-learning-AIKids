import { describe, expect, it } from 'vitest'
import { resolveLectureVideo } from './lecture-video'

describe('resolveLectureVideo', () => {
  it('turns the supplied YouTube watch URL into a privacy-enhanced embed', () => {
    expect(
      resolveLectureVideo(
        'https://www.youtube.com/watch?v=yuuWdm5tBD0',
      ),
    ).toEqual({
      kind: 'youtube',
      src: 'https://www.youtube-nocookie.com/embed/yuuWdm5tBD0?cc_load_policy=1&cc_lang_pref=vi&playsinline=1&rel=0',
    })
  })

  it('keeps HTTPS media files in the native player', () => {
    expect(resolveLectureVideo('https://cdn.example.com/lesson-1.mp4')).toEqual({
      kind: 'file',
      src: 'https://cdn.example.com/lesson-1.mp4',
    })
  })

  it('rejects malformed, insecure and unsupported values', () => {
    expect(resolveLectureVideo('http://cdn.example.com/lesson.mp4')).toBeNull()
    expect(resolveLectureVideo('javascript:alert(1)')).toBeNull()
    expect(resolveLectureVideo('https://www.youtube.com/watch?v=bad')).toBeNull()
    expect(resolveLectureVideo(null)).toBeNull()
  })
})
