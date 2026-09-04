import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

export type CmsErrorBoundaryProps = {
  name?: string
  fallbackTo?: string
  children: ReactNode
}

export type CmsErrorBoundaryState = {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class CmsErrorBoundary extends Component<CmsErrorBoundaryProps, CmsErrorBoundaryState> {
  state: CmsErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  static getDerivedStateFromError(error: Error): Partial<CmsErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('cms_module_render_failure', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const moduleName = this.props.name ?? 'Quản trị'
    const fallbackPath = this.props.fallbackTo ?? '/admin'

    return (
      <div className="ui-card flex flex-col items-center justify-center p-8 text-center" role="alert">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-100 text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-display text-xl text-ink">
          Không thể hiển thị mô-đun {moduleName}
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
          Mô-đun này tạm thời gặp sự cố. Bạn vẫn có thể sử dụng các thanh điều hướng và chức năng khác bình thường.
        </p>

        {(this.state.error || this.state.errorInfo) && (
          <details open className="mt-4 text-left w-full max-w-lg rounded-2xl border-2 border-danger/20 bg-page p-4 text-xs">
            <summary className="cursor-pointer font-bold text-ink hover:text-brand-700 select-none">
              Chi tiết kỹ thuật
            </summary>
            {/dynamically imported module|Failed to fetch|Load chunk/i.test(this.state.error?.message ?? '') && (
              <div className="mt-2 rounded-xl bg-amber-50 p-2.5 font-sans font-bold text-amber-900 border border-amber-200">
                💡 Trình duyệt đang giữ file mã nguồn cũ trong bộ nhớ đệm. Vui lòng bấm nút <strong>"Xóa cache & Tải lại"</strong> bên dưới hoặc nhấn <code>Cmd+Shift+R</code> để nạp bản mới.
              </div>
            )}
            {this.state.error?.message && (
              <div className="mt-2 font-mono whitespace-pre-wrap font-bold text-danger bg-coral-50 p-2.5 rounded-xl border border-coral-200">
                {this.state.error.name}: {this.state.error.message}
              </div>
            )}
            {this.state.error?.stack && (
              <pre className="mt-2 max-h-36 overflow-auto text-[11px] text-muted font-mono bg-slate-100 p-2 rounded-lg">
                {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
              </pre>
            )}
            {this.state.errorInfo?.componentStack && (
              <pre className="mt-2 max-h-36 overflow-auto text-[11px] text-muted font-mono bg-slate-100 p-2 rounded-lg">
                {this.state.errorInfo.componentStack.split('\n').slice(0, 5).join('\n')}
              </pre>
            )}
          </details>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            ↻ Thử lại mô-đun
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              window.location.href = fallbackPath
            }}
          >
            Về Trang Tổng quan
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
          >
            Xóa cache & Tải lại
          </Button>
        </div>
      </div>
    )
  }
}
