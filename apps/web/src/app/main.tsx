import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { AppErrorBoundary } from '@/shared/components/AppErrorBoundary'
import 'katex/dist/katex.min.css'
import '../shared/styles/index.css'

window.addEventListener('vite:preloadError', (event) => {
  const lastReload = sessionStorage.getItem('vite_preload_error_reload')
  const now = Date.now()
  if (!lastReload || now - Number(lastReload) > 10000) {
    sessionStorage.setItem('vite_preload_error_reload', String(now))
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
)
