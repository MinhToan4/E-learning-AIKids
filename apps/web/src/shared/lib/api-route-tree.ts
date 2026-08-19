export type ApiAudience =
  | 'public'
  | 'authenticated'
  | 'student'
  | 'parent'
  | 'teacher'
  | 'admin'

export type ApiRouteBranch = {
  id: string
  label: string
  legacyPrefixes: readonly string[]
  gatewayPrefix: string
  audiences: readonly ApiAudience[]
  adapter: 'api' | 'learningApi' | 'mediaApi' | 'creativeApi' | 'profileOverviewApi'
  owner: 'core-account' | 'core-lms' | 'core-gamification' | 'core-media' | 'core-jobs' | 'core-billing' | 'hub-system'
  status: 'canonical' | 'compatibility'
  children?: readonly ApiRouteBranch[]
}

/**
 * Searchable ownership map for every browser API family.
 *
 * This is deliberately a domain tree instead of a second request router: the
 * executable compatibility rules remain in api.ts, while this registry makes
 * ownership, access and migration targets reviewable without reading a long
 * list of regexes.
 */
export const API_ROUTE_TREE: readonly ApiRouteBranch[] = [
  {
    id: 'account', label: 'Tài khoản & phiên đăng nhập',
    legacyPrefixes: ['/api/auth', '/api/account', '/api/profile'],
    gatewayPrefix: '/api/v1/account', audiences: ['public', 'authenticated'], adapter: 'api', owner: 'core-account', status: 'compatibility',
    children: [
      { id: 'account-public-profile', label: 'Hồ sơ công khai', legacyPrefixes: ['/api/public/profiles', '/api/public/profile-shares', '/api/public/workspaces'], gatewayPrefix: '/api/v1/account', audiences: ['public'], adapter: 'profileOverviewApi', owner: 'core-account', status: 'compatibility' },
      { id: 'account-family', label: 'Tài khoản gia đình & phê duyệt', legacyPrefixes: ['/api/parent/approvals', '/api/parent/profile', '/api/parent/profile-shares', '/api/parent/family-login-code', '/api/parent/gate'], gatewayPrefix: '/api/v1/account/family', audiences: ['parent'], adapter: 'api', owner: 'core-account', status: 'compatibility' },
      { id: 'account-admin', label: 'Quản trị tài khoản', legacyPrefixes: ['/api/admin/users', '/api/admin/login-logs'], gatewayPrefix: '/api/v1/account/admin', audiences: ['admin'], adapter: 'api', owner: 'core-account', status: 'compatibility' },
    ],
  },
  {
    id: 'learning', label: 'Học tập',
    legacyPrefixes: ['/api/courses', '/api/enrollments', '/api/quests', '/api/progress', '/api/learning', '/api/competency-map', '/api/credentials', '/api/public/credentials'],
    gatewayPrefix: '/api/v1/lms', audiences: ['student', 'parent', 'teacher', 'admin'], adapter: 'learningApi', owner: 'core-lms', status: 'compatibility',
    children: [
      { id: 'learning-family', label: 'Phụ huynh theo dõi trẻ', legacyPrefixes: ['/api/parent/children'], gatewayPrefix: '/api/v1/lms/family', audiences: ['parent'], adapter: 'learningApi', owner: 'core-lms', status: 'compatibility' },
      { id: 'learning-operations', label: 'Lịch, báo cáo & đánh giá', legacyPrefixes: ['/api/schedule', '/api/reports', '/api/report-policies', '/api/assessments', '/api/assessment-attempts'], gatewayPrefix: '/api/v1/lms', audiences: ['student', 'parent', 'teacher'], adapter: 'learningApi', owner: 'core-lms', status: 'compatibility' },
      { id: 'learning-teacher', label: 'Giáo viên', legacyPrefixes: ['/api/teacher'], gatewayPrefix: '/api/v1/lms/aikids/teacher', audiences: ['teacher'], adapter: 'learningApi', owner: 'core-lms', status: 'compatibility' },
      { id: 'learning-admin', label: 'Quản trị chương trình học', legacyPrefixes: ['/api/admin/courses', '/api/admin/learning', '/api/admin/competency', '/api/admin/credential-config', '/api/admin/credentials', '/api/admin/credential-templates', '/api/admin/credential-rules', '/api/admin/schedule-config', '/api/admin/schedule-policies', '/api/admin/schedule', '/api/admin/report-config', '/api/admin/report-templates', '/api/admin/report-policies', '/api/admin/reports'], gatewayPrefix: '/api/v1/lms/aikids/admin', audiences: ['admin'], adapter: 'learningApi', owner: 'core-lms', status: 'compatibility' },
    ],
  },
  {
    id: 'gamification', label: 'Danh hiệu, thành tựu & phần thưởng',
    legacyPrefixes: ['/api/gamification'], gatewayPrefix: '/api/v1/gamification',
    audiences: ['student', 'parent', 'teacher'], adapter: 'api', owner: 'core-gamification', status: 'compatibility',
    children: [
      { id: 'gamification-studio', label: 'Legend & Reward Studio', legacyPrefixes: ['/api/admin/legend-studio'], gatewayPrefix: '/api/v1/gamification/admin/studio', audiences: ['admin'], adapter: 'api', owner: 'core-gamification', status: 'compatibility' },
      { id: 'gamification-reward-mappings', label: 'Reward requirement mappings', legacyPrefixes: ['/api/admin/reward-mappings'], gatewayPrefix: '/api/v1/gamification/admin/reward-mappings', audiences: ['admin'], adapter: 'api', owner: 'core-gamification', status: 'compatibility' },
      { id: 'gamification-reward-packs', label: 'Import reward ZIP', legacyPrefixes: ['/api/v1/admin/reward-packs'], gatewayPrefix: '/api/v1/admin/reward-packs', audiences: ['admin'], adapter: 'api', owner: 'core-gamification', status: 'canonical' },
    ],
  },
  {
    id: 'media', label: 'Media & tác phẩm',
    legacyPrefixes: ['/api/media', '/api/projects', '/api/backpack'], gatewayPrefix: '/api/v1/media',
    audiences: ['student', 'teacher', 'admin'], adapter: 'mediaApi', owner: 'core-media', status: 'compatibility',
  },
  {
    id: 'jobs', label: 'Tác vụ sáng tạo AI',
    legacyPrefixes: ['/api/v1/jobs', '/api/admin/settings/vidtory'], gatewayPrefix: '/api/v1/jobs',
    audiences: ['student', 'admin'], adapter: 'creativeApi', owner: 'core-jobs', status: 'canonical',
  },
  {
    id: 'billing', label: 'Gói học & thanh toán',
    legacyPrefixes: ['/api/parent/plans', '/api/parent/subscription', '/api/parent/course-checkout', '/api/admin/billing'], gatewayPrefix: '/api/v1/billing',
    audiences: ['parent', 'admin'], adapter: 'api', owner: 'core-billing', status: 'compatibility',
  },
  {
    id: 'notifications', label: 'Thông báo', legacyPrefixes: ['/api/notifications'],
    gatewayPrefix: '/api/v1/notifications', audiences: ['authenticated'], adapter: 'api', owner: 'core-account', status: 'compatibility',
  },
  {
    id: 'system', label: 'Vận hành hệ thống', legacyPrefixes: ['/api/admin/system', '/api/admin/analytics'],
    gatewayPrefix: '/api/v1/system/aikids/admin', audiences: ['admin'], adapter: 'api', owner: 'hub-system', status: 'compatibility',
  },
] as const

export type ApiRouteMatch = {
  branch: ApiRouteBranch
  ancestry: readonly ApiRouteBranch[]
}

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`)
}

export function findApiRoute(path: string): ApiRouteMatch | null {
  const visit = (branches: readonly ApiRouteBranch[], parents: readonly ApiRouteBranch[]): ApiRouteMatch | null => {
    for (const branch of branches) {
      const ancestry = [...parents, branch]
      const child = branch.children ? visit(branch.children, ancestry) : null
      if (child) return child
      if (branch.legacyPrefixes.some((prefix) => matchesPrefix(path, prefix)) || matchesPrefix(path, branch.gatewayPrefix)) {
        return { branch, ancestry }
      }
    }
    return null
  }
  return visit(API_ROUTE_TREE, [])
}

export function flattenApiRouteTree(): ApiRouteBranch[] {
  return API_ROUTE_TREE.flatMap((branch) => [
    branch,
    ...(branch.children ? flattenBranches(branch.children) : []),
  ])
}

function flattenBranches(branches: readonly ApiRouteBranch[]): ApiRouteBranch[] {
  return branches.flatMap((branch) => [
    branch,
    ...(branch.children ? flattenBranches(branch.children) : []),
  ])
}
