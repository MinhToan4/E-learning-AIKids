import { lazy, Suspense, useEffect, useRef } from 'react'
import { Route, Routes } from 'react-router'
import { AgeExperienceProvider } from '@/shared/age-experience/AgeExperienceProvider'
import { AUTH_UNAUTHORIZED_EVENT } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { createAdminRoutes } from './routing/admin-routes'
import { createFamilyRoutes } from './routing/family-routes'
import { createLmsRoutes } from './routing/lms-routes'
import { createPublicRoutes } from './routing/public-routes'
import { RouteFallback, RouteGuard } from './routing/RouteGuard'
import { createStudentRoutes } from './routing/student-routes'

const AppShell = lazy(() => import('@/shared/components/layout/AppShell').then((module) => ({
  default: module.AppShell,
})))
const NotFoundPage = lazy(() => import('@/features/auth/pages/NotFoundPage').then((module) => ({
  default: module.NotFoundPage,
})))

function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/legal' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/account/delete' ||
    pathname === '/support' ||
    pathname === '/data-safety' ||
    pathname === '/preview-wireframe' ||
    pathname === '/course-demo' ||
    pathname === '/demo' ||
    pathname === '/concept-test' ||
    pathname.startsWith('/lab/') ||
    pathname.startsWith('/u/') ||
    pathname.startsWith('/share/') ||
    pathname.startsWith('/credentials/')
  )
}

/**
 * Application composition root.
 *
 * Route ownership is split by product boundary: learner app, family portal,
 * teacher LMS and administration. This file owns only session lifecycle and
 * the shared authenticated shell.
 */
export function App() {
  const bootstrap = useAuth((state) => state.bootstrap)
  const refreshMe = useAuth((state) => state.refreshMe)
  const expireSession = useAuth((state) => state.expireSession)
  const userId = useAuth((state) => state.user?.id)
  const lastIdentityRefresh = useRef(0)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const verifyRestoredSession = async (event: PageTransitionEvent) => {
      if (!event.persisted) return
      const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
      const isProtected = !isPublicPath(pathname)
      const currentUser = useAuth.getState().user
      if (isProtected && !currentUser) {
        expireSession()
        window.location.replace('/login')
        return
      }
      try {
        await bootstrap()
        if (isProtected && !useAuth.getState().user) {
          expireSession()
          window.location.replace('/login')
        }
      } catch {
        if (isProtected) {
          expireSession()
          window.location.replace('/login')
        }
      }
    }
    window.addEventListener('pageshow', verifyRestoredSession)
    return () => window.removeEventListener('pageshow', verifyRestoredSession)
  }, [bootstrap, expireSession])

  useEffect(() => {
    if (!userId) return
    try {
      localStorage.removeItem(`aikids.profile-avatar.${userId}`)
      localStorage.removeItem(`aikids.profile-showcase.${userId}`)
    } catch {}
  }, [userId])

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, expireSession)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, expireSession)
  }, [expireSession])

  useEffect(() => {
    const refreshIdentity = () => {
      if (document.visibilityState !== 'visible' || !useAuth.getState().user) return
      const now = Date.now()
      if (now - lastIdentityRefresh.current < 15_000) return
      lastIdentityRefresh.current = now
      void refreshMe().catch(() => undefined)
    }

    document.addEventListener('visibilitychange', refreshIdentity)
    window.addEventListener('focus', refreshIdentity)
    window.addEventListener('online', refreshIdentity)
    return () => {
      document.removeEventListener('visibilitychange', refreshIdentity)
      window.removeEventListener('focus', refreshIdentity)
      window.removeEventListener('online', refreshIdentity)
    }
  }, [refreshMe])

  return (
    <AgeExperienceProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {createPublicRoutes()}
          <Route element={<RouteGuard><AppShell /></RouteGuard>}>
            {createStudentRoutes()}
            {createFamilyRoutes()}
            {createLmsRoutes()}
            {createAdminRoutes()}
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AgeExperienceProvider>
  )
}
