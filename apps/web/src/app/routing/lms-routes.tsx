import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { RouteGuard } from './RouteGuard'

const OrganizationPage = lazy(() => import('@/features/organization/pages/OrganizationPage').then((module) => ({ default: module.OrganizationPage })))
const TeacherPage = lazy(() => import('@/features/teacher/pages/TeacherPage').then((module) => ({ default: module.TeacherPage })))
const TeacherOverviewPage = lazy(() => import('@/features/teacher/pages/TeacherOverviewPage').then((module) => ({ default: module.TeacherOverviewPage })))
const TeacherOperationsPage = lazy(() => import('@/features/teacher/pages/TeacherOperationsPage').then((module) => ({ default: module.TeacherOperationsPage })))
const AssessmentAuthoringPage = lazy(() => import('@/features/teacher/pages/AssessmentAuthoringPage').then((module) => ({ default: module.AssessmentAuthoringPage })))

const lms = (page: React.ReactNode) => <RouteGuard roles={['teacher', 'admin']}>{page}</RouteGuard>

export function createLmsRoutes() {
  return [
    <Route key="organization" path="/organization" element={lms(<OrganizationPage />)} />,
    <Route key="teacher" path="/teacher" element={lms(<TeacherOverviewPage />)} />,
    <Route key="teacher-class" path="/teacher/class" element={lms(<TeacherPage tab="class" />)} />,
    <Route key="teacher-courses" path="/teacher/courses" element={lms(<TeacherPage tab="courses" />)} />,
    <Route key="teacher-lectures" path="/teacher/lectures" element={<Navigate to="/teacher/courses" replace />} />,
    <Route key="teacher-stats" path="/teacher/stats" element={lms(<TeacherPage tab="stats" />)} />,
    <Route key="teacher-feedback" path="/teacher/feedback" element={lms(<TeacherPage tab="feedback" />)} />,
    <Route key="teacher-operations" path="/teacher/operations" element={lms(<TeacherOperationsPage />)} />,
    <Route
      key="teacher-assessments"
      path="/teacher/assessments"
      element={<RouteGuard roles={['teacher']}><AssessmentAuthoringPage /></RouteGuard>}
    />,
  ]
}
