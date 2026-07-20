import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/shared/store/auth'
import { AppShell } from '@/shared/components/layout/AppShell'
import { WelcomePage } from '@/features/auth/pages/WelcomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import type { User } from '@/shared/lib/api'

// Lazy heavy student routes for faster first paint
const OnboardingPage = lazy(() =>
  import('@/features/auth/pages/OnboardingPage').then((m) => ({
    default: m.OnboardingPage,
  })),
)
const HomePage = lazy(() =>
  import('@/features/home/pages/HomePage').then((m) => ({
    default: m.HomePage,
  })),
)
const WorldPage = lazy(() =>
  import('@/features/world/pages/WorldPage').then((m) => ({
    default: m.WorldPage,
  })),
)
const CourseIntroPage = lazy(() =>
  import('@/features/course/pages/CourseIntroPage').then((m) => ({
    default: m.CourseIntroPage,
  })),
)
const LessonPage = lazy(() =>
  import('@/features/lesson/pages/LessonPage').then((m) => ({
    default: m.LessonPage,
  })),
)
const BackpackPage = lazy(() =>
  import('@/features/backpack/pages/BackpackPage').then((m) => ({
    default: m.BackpackPage,
  })),
)
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  })),
)
const ParentPage = lazy(() =>
  import('@/features/parent/pages/ParentPage').then((m) => ({
    default: m.ParentPage,
  })),
)
const TeacherPage = lazy(() =>
  import('@/features/teacher/pages/TeacherPage').then((m) => ({
    default: m.TeacherPage,
  })),
)
const AdminPage = lazy(() =>
  import('@/features/admin/pages/AdminPage').then((m) => ({
    default: m.AdminPage,
  })),
)

function Fallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center font-display text-xl text-brand-500 animate-pulse">
      Đang mở cổng sao…
    </div>
  )
}

function homeFor(role: User['role']) {
  if (role === 'admin') return '/admin'
  if (role === 'teacher') return '/teacher'
  if (role === 'parent') return '/parent'
  return '/home'
}

function Guard({
  children,
  roles,
  requireOnboarded = false,
}: {
  children: React.ReactNode
  roles?: Array<User['role']>
  requireOnboarded?: boolean
}) {
  const user = useAuth((s) => s.user)
  const loading = useAuth((s) => s.loading)
  if (loading) return <Fallback />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />
  }
  if (requireOnboarded && user.role === 'student' && !user.onboarded) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

export function App() {
  const bootstrap = useAuth((s) => s.bootstrap)
  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding"
          element={
            <Guard roles={['student']}>
              <OnboardingPage />
            </Guard>
          }
        />
        <Route
          element={
            <Guard>
              <AppShell />
            </Guard>
          }
        >
          <Route
            path="/home"
            element={
              <Guard roles={['student']} requireOnboarded>
                <HomePage />
              </Guard>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <Guard roles={['student']} requireOnboarded>
                <CourseIntroPage />
              </Guard>
            }
          />
          <Route
            path="/world"
            element={
              <Guard roles={['student']} requireOnboarded>
                <WorldPage />
              </Guard>
            }
          />
          <Route
            path="/world/:courseId"
            element={
              <Guard roles={['student']} requireOnboarded>
                <WorldPage />
              </Guard>
            }
          />
          <Route
            path="/lesson/:questId"
            element={
              <Guard roles={['student']} requireOnboarded>
                <LessonPage />
              </Guard>
            }
          />
          <Route
            path="/backpack"
            element={
              <Guard roles={['student']} requireOnboarded>
                <BackpackPage />
              </Guard>
            }
          />
          <Route
            path="/profile"
            element={
              <Guard roles={['student']} requireOnboarded>
                <ProfilePage />
              </Guard>
            }
          />
          <Route
            path="/parent"
            element={
              <Guard roles={['parent']}>
                <ParentPage />
              </Guard>
            }
          />
          <Route
            path="/parent/kids"
            element={
              <Guard roles={['parent']}>
                <ParentPage tab="kids" />
              </Guard>
            }
          />
          <Route
            path="/teacher"
            element={
              <Guard roles={['teacher', 'admin']}>
                <TeacherPage />
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard roles={['admin']}>
                <AdminPage />
              </Guard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
