import { describe, expect, it } from 'vitest'
import { resolvePracticeReview } from './practice-result'

describe('practice result review', () => {
  it('keeps an AI image visible for review before the quiz', () => {
    expect(
      resolvePracticeReview({
        generated: {
          title: 'Mèo phi hành gia',
          imageUrl: 'https://cdn.example.com/cat.webp',
        },
      }),
    ).toEqual({
      feedback: 'Sản phẩm của con đã được lưu riêng tư.',
      preview: {
        mediaKind: 'image',
        title: 'Mèo phi hành gia',
        url: 'https://cdn.example.com/cat.webp',
      },
    })
  })

  it('prefers a generated video and preserves server feedback', () => {
    expect(
      resolvePracticeReview({
        generated: {
          title: 'Cảnh chuyển động',
          videoUrl: 'https://cdn.example.com/scene.mp4',
        },
        message: 'Đã lưu cảnh phim của con.',
      }),
    ).toEqual({
      feedback: 'Đã lưu cảnh phim của con.',
      preview: {
        mediaKind: 'video',
        title: 'Cảnh chuyển động',
        url: 'https://cdn.example.com/scene.mp4',
      },
    })
  })

  it('shows saved assets and projects when no generated media exists', () => {
    expect(
      resolvePracticeReview({
        asset: {
          name: 'Bạn Mèo Sao',
          url: 'data:image/png;base64,AAAA',
        },
      }).preview,
    ).toEqual({
      mediaKind: 'image',
      title: 'Bạn Mèo Sao',
      url: 'data:image/png;base64,AAAA',
    })
    expect(
      resolvePracticeReview({
        project: {
          title: 'Truyện của con',
          thumbnail: '/assets/designer/lobby/art-comic.jpeg',
        },
      }).preview?.title,
    ).toBe('Truyện của con')
  })

  it('rejects unsafe or empty media URLs without losing confirmation', () => {
    expect(
      resolvePracticeReview({
        generated: { title: 'Không hợp lệ', imageUrl: 'javascript:alert(1)' },
      }),
    ).toEqual({
      feedback: 'Sản phẩm của con đã được lưu riêng tư.',
      preview: null,
    })
  })
})
