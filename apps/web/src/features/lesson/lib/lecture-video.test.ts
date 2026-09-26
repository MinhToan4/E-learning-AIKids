import { describe, expect, it } from 'vitest'
import { resolveLectureAudio, resolveLectureVideo } from './lecture-video'

describe('resolveLectureVideo', () => {
  it('turns the supplied YouTube watch URL into a privacy-enhanced embed', () => {
    expect(
      resolveLectureVideo(
        'https://www.youtube.com/watch?v=yuuWdm5tBD0',
      ),
    ).toEqual({
      kind: 'youtube',
      src: 'https://www.youtube-nocookie.com/embed/yuuWdm5tBD0?cc_load_policy=1&cc_lang_pref=vi&controls=0&disablekb=1&enablejsapi=1&fs=0&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0',
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

describe('resolveLectureAudio', () => {
  it('accepts only HTTPS audio URLs', () => {
    expect(resolveLectureAudio('https://cdn.example.com/aiki.mp3')).toBe('https://cdn.example.com/aiki.mp3')
    expect(resolveLectureAudio('http://cdn.example.com/aiki.mp3')).toBeNull()
    expect(resolveLectureAudio('javascript:alert(1)')).toBeNull()
  })
})
