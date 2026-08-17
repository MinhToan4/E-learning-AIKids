import { describe, expect, it } from 'vitest'
import { normalizeGatewayRequest } from './api'
import { API_ROUTE_TREE, findApiRoute, flattenApiRouteTree } from './api-route-tree'

describe('API route tree', () => {
  it('has unique branch ids and canonical gateway prefixes', () => {
    const branches = flattenApiRouteTree()
    expect(new Set(branches.map(({ id }) => id)).size).toBe(branches.length)
    expect(branches.every(({ gatewayPrefix }) => gatewayPrefix.startsWith('/api/v1/'))).toBe(true)
  })

  it.each([
    ['/api/auth/me', 'account'],
    ['/api/public/profile-shares/token', 'account-public-profile'],
    ['/api/learning/pathway?studentId=child-1', 'learning'],
    ['/api/parent/children/child-1/courses', 'learning-family'],
    ['/api/teacher/courses/course-1/readiness', 'learning-teacher'],
    ['/api/admin/credential-config', 'learning-admin'],
    ['/api/admin/legend-studio/item-1', 'gamification-studio'],
    ['/api/gamification/achievements', 'gamification'],
    ['/api/media/upload', 'media'],
    ['/api/parent/course-checkout/payment-1', 'billing'],
    ['/api/notifications/read-all', 'notifications'],
    ['/api/admin/system', 'system'],
  ])('classifies %s as %s', (path, branchId) => {
    expect(findApiRoute(path)?.branch.id).toBe(branchId)
  })

  it('keeps the tree serializable for documentation and admin diagnostics', () => {
    expect(() => JSON.stringify(API_ROUTE_TREE)).not.toThrow()
  })

  it.each([
    ['/api/auth/me', '/api/v1/account/me'],
    ['/api/learning/pathway', '/api/v1/lms/me/pathway'],
    ['/api/learning/pathway?studentId=child-1', '/api/v1/lms/family/children/child-1/pathway'],
    ['/api/teacher/courses/course-1/readiness', '/api/v1/lms/aikids/teacher/courses/course-1/readiness'],
    ['/api/admin/legend-studio/item-1', '/api/v1/gamification/admin/studio/item-1'],
    ['/api/gamification/achievements', '/api/v1/gamification/me/achievements'],
    ['/api/media/upload', '/api/v1/media/upload?permanent=1&assetType=aikids'],
    ['/api/admin/system', '/api/v1/system/aikids/admin/summary'],
  ])('resolves %s to canonical route %s', (legacyPath, canonicalPath) => {
    expect(normalizeGatewayRequest(legacyPath).path).toBe(canonicalPath)
  })

  it.each([
    ['legend_reward_design', 'aikids-legend-reward'],
    ['storybook_chapter_design', 'aikids-storybook'],
    ['achievement_milestone_design', 'aikids-achievement'],
    ['course_content_design', 'lms-course'],
  ])('tags CMS upload purpose %s as %s', (purpose, assetType) => {
    const body = new FormData()
    body.append('purpose', purpose)
    expect(normalizeGatewayRequest('/api/media/upload', { method: 'POST', body }).path)
      .toBe(`/api/v1/media/upload?permanent=1&assetType=${assetType}`)
  })
})
