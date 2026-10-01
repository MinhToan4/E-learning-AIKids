import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('renders child-friendly title and sanitized message for technical error', () => {
    const html = renderToStaticMarkup(
      <ErrorState
        title="Chưa tải được bản đồ"
        error="PrismaClientKnownRequestError: P2023 malformed UUID"
        onRetry={() => {}}
        showHome
        showBack
      />,
    )

    expect(html).toContain('Chưa tải được bản đồ')
    // Technical Prisma/UUID error must be sanitized!
    expect(html).not.toContain('P2023')
    expect(html).not.toContain('Prisma')
    expect(html).toContain('Máy chủ đang nghỉ ngơi một chút')
    // Escape buttons
    expect(html).toContain('Thử lại')
    expect(html).toContain('Về Trang Chủ')
    expect(html).toContain('Quay lại')
    // Reassurance note
    expect(html).toContain('Thành tích và số sao của con luôn được giữ an toàn tuyệt đối')
  })

  it('renders custom homeText and backText', () => {
    const html = renderToStaticMarkup(
      <ErrorState
        title="Chưa mở được bài học"
        message="Trạm này đang bảo trì."
        homeText="Về bản đồ"
        backText="Trở về"
        showHome
        showBack
      />,
    )

    expect(html).toContain('Chưa mở được bài học')
    expect(html).toContain('Về bản đồ')
    expect(html).toContain('Trở về')
  })

  it('renders gentle inline notification banner when inline prop is true', () => {
    const html = renderToStaticMarkup(
      <ErrorState
        inline
        error="Failed to fetch curriculum data"
        onRetry={() => {}}
      />,
    )

    expect(html).toContain('Chưa có kết nối mạng ổn định')
    expect(html).toContain('Thử lại')
    expect(html).not.toContain('Failed to fetch')
  })
})
