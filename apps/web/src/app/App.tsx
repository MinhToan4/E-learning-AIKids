import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/shared/store/auth'
import { AppShell } from '@/shared/components/layout/AppShell'
import { WelcomePage } from '@/features/auth/pages/WelcomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import type { User } from '@/shared/lib/api'

// Lazy auth pages
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
)

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
const CreativePage = lazy(() =>
  import('@/features/creative/pages/CreativePage').then((m) => ({
    default: m.CreativePage,
  })),
)
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  })),
)
const AchievementsPage = lazy(() =>
  import('@/features/achievements/pages/AchievementsPage').then((m) => ({
    default: m.AchievementsPage,
  })),
)
const LeaderboardPage = lazy(() =>
  import('@/features/leaderboard/pages/LeaderboardPage').then((m) => ({
    default: m.LeaderboardPage,
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
const OrganizationPage = lazy(() =>
  import('@/features/organization/pages/OrganizationPage').then((m) => ({
    default: m.OrganizationPage,
  })),
)
const ChildPickerPage = lazy(() =>
  import('@/features/family/pages/ChildPickerPage').then((m) => ({
    default: m.ChildPickerPage,
  })),
)

function Fallback() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="ui-skeleton h-14 w-14 rounded-2xl" />
      <p className="font-display text-xl text-brand-500">Đang mở cổng sao…</p>
      <p className="text-sm text-muted">Chờ một chút nhé</p>
    </div>
  )
}

function homeFor(role: User['role']) {
  if (role === 'admin') return '/admin'
  if (role === 'teacher') return '/teacher'
  // Shared tablet: parents land on kid picker first
  if (role === 'parent') return '/kids'
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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/kids"
          element={
            <Guard>
              <ChildPickerPage />
            </Guard>
          }
        />
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
            path="/creative"
            element={
              <Guard roles={['student']} requireOnboarded>
                <CreativePage />
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
            path="/achievements"
            element={
              <Guard roles={['student']} requireOnboarded>
                <AchievementsPage />
              </Guard>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Guard roles={['student']} requireOnboarded>
                <LeaderboardPage />
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
            path="/parent/approvals"
            element={
              <Guard roles={['parent']}>
                <ParentPage tab="approvals" />
              </Guard>
            }
          />
          <Route
            path="/parent/profile"
            element={
              <Guard roles={['parent']}>
                <ParentPage tab="profile" />
              </Guard>
            }
          />
          <Route
            path="/parent/plan"
            element={
              <Guard roles={['parent']}>
                <ParentPage tab="plan" />
              </Guard>
            }
          />
          <Route
            path="/organization"
            element={
              <Guard roles={['teacher', 'admin']}>
                <OrganizationPage />
              </Guard>
            }
          />
          <Route
            path="/teacher"
            element={
              <Guard roles={['teacher', 'admin']}>
                <TeacherPage tab="class" />
              </Guard>
            }
          />
          <Route
            path="/teacher/courses"
            element={
              <Guard roles={['teacher', 'admin']}>
                <TeacherPage tab="courses" />
              </Guard>
            }
          />
          <Route
            path="/teacher/lectures"
            element={
              <Guard roles={['teacher', 'admin']}>
                <TeacherPage tab="lectures" />
              </Guard>
            }
          />
          <Route
            path="/teacher/stats"
            element={
              <Guard roles={['teacher', 'admin']}>
                <TeacherPage tab="stats" />
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard roles={['admin']}>
                <AdminPage tab="system" />
              </Guard>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <Guard roles={['admin']}>
                <AdminPage tab="analytics" />
              </Guard>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <Guard roles={['admin']}>
                <AdminPage tab="logs" />
              </Guard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Guard roles={['admin']}>
                <AdminPage tab="users" />
              </Guard>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <Guard roles={['admin']}>
                <AdminPage tab="sessions" />
              </Guard>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <Guard roles={['admin']}>
                <AdminPage tab="courses" />
              </Guard>
            }
          />
          <Route
            path="/admin/ai"
            element={
              <Guard roles={['admin']}>
                <AdminPage tab="ai" />
              </Guard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
