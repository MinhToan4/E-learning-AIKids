import { Component, type ErrorInfo, type ReactNode } from 'react'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { Button } from '@/shared/components/ui/Button'

type Props = { children: ReactNode }
type State = { failed: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Technical diagnostics stay in developer tooling, never in the child UI.
    console.error('ui_render_failure', error, info.componentStack)
  }

  private retry = () => {
    this.setState({ failed: false })
    window.location.reload()
  }

  render() {
    if (!this.state.failed) return this.props.children

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
          <Button className="mt-5" onClick={this.retry}>
            Mở lại trang
          </Button>
        </section>
      </main>
    )
  }
}
