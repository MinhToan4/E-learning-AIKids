import { lazy } from 'react'
import { Route } from 'react-router'
import { RouteGuard } from './RouteGuard'

const ParentPage = lazy(() => import('@/features/parent/pages/ParentPage').then((module) => ({ default: module.ParentPage })))
const ParentLearningPage = lazy(() => import('@/features/parent/pages/ParentLearningPage').then((module) => ({ default: module.ParentLearningPage })))

const parent = (page: React.ReactNode) => <RouteGuard roles={['parent']}>{page}</RouteGuard>

export function createFamilyRoutes() {
  return [
    <Route key="parent" path="/parent" element={parent(<ParentPage />)} />,
    <Route key="parent-kids" path="/parent/kids" element={parent(<ParentPage tab="kids" />)} />,
    <Route key="parent-approvals" path="/parent/approvals" element={parent(<ParentPage tab="approvals" />)} />,
    <Route key="parent-profile" path="/parent/profile" element={parent(<ParentPage tab="profile" />)} />,
    <Route key="parent-plan" path="/parent/plan" element={parent(<ParentPage tab="plan" />)} />,
    <Route key="parent-learning" path="/parent/learning" element={parent(<ParentLearningPage />)} />,
  ]
}
