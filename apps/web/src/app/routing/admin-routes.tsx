import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { RouteGuard } from './RouteGuard'

const AdminPage = lazy(() => import('@/features/admin/pages/AdminPage').then((module) => ({ default: module.AdminPage })))
const TeacherPage = lazy(() => import('@/features/teacher/pages/TeacherPage').then((module) => ({ default: module.TeacherPage })))

const admin = (page: React.ReactNode, permissions?: string[]) => (
  <RouteGuard roles={['admin']} permissions={permissions}>{page}</RouteGuard>
)

export function createAdminRoutes() {
  return [
    <Route key="admin" path="/admin" element={admin(<AdminPage tab="system" />)} />,
    <Route key="admin-analytics" path="/admin/analytics" element={admin(<AdminPage tab="analytics" />)} />,
    <Route key="admin-logs" path="/admin/logs" element={admin(<AdminPage tab="logs" />, ['system.logs'])} />,
    <Route key="admin-users" path="/admin/users" element={admin(<AdminPage tab="users" />, ['users.view'])} />,
    <Route key="admin-staff" path="/admin/staff" element={admin(<AdminPage tab="staff" />, ['users.view'])} />,
    <Route key="admin-roles" path="/admin/roles" element={admin(<AdminPage tab="roles" />, ['system.manage_roles'])} />,
    <Route key="admin-classes" path="/admin/classes" element={admin(<AdminPage tab="classes" />, ['classroom.view'])} />,
    <Route key="admin-courses" path="/admin/courses" element={admin(<TeacherPage tab="courses" />, ['curriculum.view'])} />,
    <Route key="admin-asmo" path="/admin/asmo" element={admin(<AdminPage tab="asmo" />)} />,
    <Route key="admin-legends" path="/admin/legends" element={admin(<AdminPage tab="legends" />)} />,
    <Route key="admin-ai" path="/admin/ai" element={admin(<AdminPage tab="ai" />, ['system.ai_routing'])} />,
    <Route key="admin-billing" path="/admin/billing" element={admin(<AdminPage tab="billing" />, ['billing.view'])} />,
    <Route key="admin-affiliates" path="/admin/affiliates" element={admin(<AdminPage tab="affiliates" />, ['billing.view'])} />,
    <Route
      key="admin-learning-config"
      path="/admin/learning-config"
      element={admin(<Navigate to="/admin/courses" replace />)}
    />,
  ]
}
