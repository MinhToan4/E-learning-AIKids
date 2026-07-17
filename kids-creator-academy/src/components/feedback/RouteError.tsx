import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MASCOT_SRC } from '@/data/mock'

export function RouteError() {
  const error = useRouteError()
  const navigate = useNavigate()

  let title = 'Úi, xưởng vẽ hơi rối một chút'
  let detail =
    'Sản phẩm của con vẫn an toàn. Hãy thử tải lại trang hoặc về Thế giới Sáng tạo nhé!'

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? 'Không tìm thấy trang này' : title
    detail = error.statusText || detail
  } else if (error instanceof Error) {
    // Keep technical message only for developers in console; kids see friendly copy
    console.error('[RouteError]', error)
  }

  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-4 py-10"
    >
      <Card className="w-full text-center">
        <img src={MASCOT_SRC} alt="" className="mx-auto size-28" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">{title}</h1>
        <p className="mt-2 text-muted">{detail}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate('/world', { replace: true })}>
            Về Thế giới
          </Button>
          <Button variant="secondary" onClick={() => window.location.assign('/welcome')}>
            Về trang chào
          </Button>
        </div>
      </Card>
    </main>
  )
}
