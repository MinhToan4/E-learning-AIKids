import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { AppErrorBoundary } from '@/shared/components/AppErrorBoundary'
import { initAffiliateTracker } from '@/shared/lib/affiliate-tracker'
import { queryClient } from '@/shared/lib/query-client'
import '../shared/styles/fonts.css'
import '../shared/styles/index.css'

initAffiliateTracker()

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
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
