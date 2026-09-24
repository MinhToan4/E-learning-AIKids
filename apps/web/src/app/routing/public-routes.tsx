import { lazy } from 'react'
import { Route } from 'react-router'
import { RouteGuard } from './RouteGuard'

const WelcomePage = lazy(() => import('@/features/auth/pages/WelcomePage').then((module) => ({ default: module.WelcomePage })))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })))
const LegalPage = lazy(() => import('@/features/legal/pages/LegalPage').then((module) => ({ default: module.LegalPage })))
const PublicProfilePage = lazy(() => import('@/features/profile/pages/PublicProfilePage').then((module) => ({ default: module.PublicProfilePage })))
const PublicProfileSharePage = lazy(() => import('@/features/profile/pages/PublicProfileSharePage').then((module) => ({ default: module.PublicProfileSharePage })))
const CredentialVerifyPage = lazy(() => import('@/features/achievements/pages/CredentialVerifyPage').then((module) => ({ default: module.CredentialVerifyPage })))
const ChildPickerPage = lazy(() => import('@/features/family/pages/ChildPickerPage').then((module) => ({ default: module.ChildPickerPage })))
const OnboardingPage = lazy(() => import('@/features/auth/pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })))
const StudentConceptTestPage = lazy(() => import('@/features/concept/pages/StudentConceptTestPage').then((module) => ({ default: module.StudentConceptTestPage })))

export function createPublicRoutes() {
  return [
    <Route key="concept-test" path="/concept-test" element={<StudentConceptTestPage />} />,
    <Route key="lab-concept" path="/lab/concept" element={<StudentConceptTestPage />} />,
    <Route key="welcome" path="/" element={<WelcomePage />} />,
    <Route key="login" path="/login" element={<LoginPage />} />,
    <Route key="register" path="/register" element={<RegisterPage />} />,
    <Route key="forgot-password" path="/forgot-password" element={<ForgotPasswordPage />} />,
    <Route key="reset-password" path="/reset-password" element={<ResetPasswordPage />} />,
    <Route key="legal" path="/legal" element={<LegalPage kind="hub" />} />,
    <Route key="privacy" path="/privacy" element={<LegalPage kind="privacy" />} />,
    <Route key="terms" path="/terms" element={<LegalPage kind="terms" />} />,
    <Route key="delete-account" path="/account/delete" element={<LegalPage kind="delete" />} />,
    <Route key="support" path="/support" element={<LegalPage kind="support" />} />,
    <Route key="public-profile" path="/u/:childId" element={<PublicProfilePage />} />,
    <Route key="shared-profile" path="/share/:token" element={<PublicProfileSharePage />} />,
    <Route key="data-safety" path="/data-safety" element={<LegalPage kind="data-safety" />} />,
    <Route key="credential" path="/credentials/:code" element={<CredentialVerifyPage />} />,
    <Route
      key="kids"
      path="/kids"
      element={<RouteGuard roles={['parent', 'teacher', 'admin']}><ChildPickerPage /></RouteGuard>}
    />,
    <Route
      key="onboarding"
      path="/onboarding"
      element={<RouteGuard roles={['student']}><OnboardingPage /></RouteGuard>}
    />,
  ]
}
