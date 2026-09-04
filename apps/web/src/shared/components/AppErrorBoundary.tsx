import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { Button } from '@/shared/components/ui/Button'

type Props = { children: ReactNode }
type State = {
  failed: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    failed: false,
    error: null,
    errorInfo: null,
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { failed: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Technical diagnostics stay in developer tooling, never in the child UI.
    console.error('ui_render_failure', error, info.componentStack)
    this.setState({ errorInfo: info })
  }

  private retry = () => {
    this.setState({ failed: false, error: null, errorInfo: null })
    window.location.reload()
  }

  private goHome = () => {
    window.location.href = '/'
  }

  private goLogin = () => {
    window.location.href = '/login'
  }

  render() {
    if (!this.state.failed) return this.props.children

    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const isCms = pathname.startsWith('/admin') || pathname.startsWith('/teacher')

    if (isCms) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
          <section className="ui-card w-full max-w-xl p-8 text-center" role="alert">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-100 text-danger">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl text-ink">
              Sự cố hệ thống Quản trị / Giảng dạy
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Đã xảy ra lỗi không mong muốn trong không gian làm việc. Bạn có thể tải lại trang hoặc điều hướng về khu vực đăng nhập/trang chủ.
            </p>

            {(this.state.error || this.state.errorInfo) && (
              <details className="mt-4 w-full rounded-xl border border-border bg-page p-3 text-left text-xs">
                <summary className="cursor-pointer font-bold text-muted hover:text-ink">
                  Chi tiết lỗi kỹ thuật
                </summary>
                {this.state.error?.message && (
                  <div className="mt-2 font-mono whitespace-pre-wrap text-danger">
                    {this.state.error.message}
                  </div>
                )}
                {this.state.error?.stack && (
                  <pre className="mt-2 max-h-36 overflow-auto text-[11px] text-muted">
                    {this.state.error.stack.split('\n').slice(0, 6).join('\n')}
                  </pre>
                )}
              </details>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" onClick={this.retry}>
                Tải lại trang
              </Button>
              <Button variant="secondary" onClick={this.goLogin}>
                Về trang đăng nhập
              </Button>
              <Button variant="ghost" onClick={this.goHome}>
                Về trang chủ
              </Button>
            </div>
          </section>
        </main>
      )
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
        <section className="ui-card w-full max-w-lg p-7 text-center" role="alert">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <h1 className="font-display mt-5 text-3xl text-ink">
            Trang này cần nghỉ một chút
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Nội dung của con vẫn được giữ an toàn. Con thử mở lại trang nhé!
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={this.retry}>
              Mở lại trang
            </Button>
            <Button variant="secondary" onClick={this.goHome}>
              Về trang chủ
            </Button>
          </div>
        </section>
      </main>
    )
  }
}
