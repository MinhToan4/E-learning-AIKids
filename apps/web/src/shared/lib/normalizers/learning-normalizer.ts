import { environment } from '@/shared/config/environment'
import { createUuid } from '../uuid'
import {
  type GatewayRequest,
  jsonBody,
  withJson,
  recordValue,
  mapCourse,
  mapQuest,
  mapAssessmentAttempt,
  normalizeGalleryItem,
} from './common'

export { mapCourse, mapQuest }

export function normalizeLearningGatewayRequest(
  path: string,
  options: RequestInit = {},
): GatewayRequest | null {
  const body = jsonBody(options)

  if (path === '/api/courses') {
    return { path: '/api/v1/lms/courses', options }
  }
  if (path === '/api/enrollments') {
    return { path: '/api/v1/lms/enrollments', options }
  }
  if (path === '/api/notifications') {
    return { path: '/api/v1/notifications', options }
  }
  if (path === '/api/notifications/read-all') {
    return { path: '/api/v1/notifications/read-all', options }
  }
  if (path === '/api/notifications/preferences') {
    return { path: '/api/v1/notifications/preferences', options }
  }

  const notificationRead = path.match(/^\/api\/notifications\/([^/]+)\/read$/)
  if (notificationRead) {
    return {
      path: `/api/v1/notifications/${encodeURIComponent(notificationRead[1])}/read`,
      options: { ...options, method: 'POST' },
    }
  }

  if (path === '/api/media/refs' || path === '/api/backpack') {
    const activeIpId = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('storymee_active_ip_id') : null
    const ipSuffix = activeIpId ? `?ipId=${encodeURIComponent(activeIpId)}` : ''
    return { path: `/api/v1/media/gallery${ipSuffix}`, options }
  }
  if (path === '/api/projects') {
    const activeIpId = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('storymee_active_ip_id') : null
    const ipSuffix = activeIpId ? `?ipId=${encodeURIComponent(activeIpId)}` : ''
    return { path: `/api/v1/media/gallery${ipSuffix}`, options }
  }
  const projectShare = path.match(/^\/api\/projects\/([^/?]+)\/request-share$/)
  if (projectShare) {
    return {
      path: `/api/v1/media/gallery/${encodeURIComponent(projectShare[1])}/request-share`,
      options,
    }
  }
  if (path === '/api/media/upload') {
    const purpose = options.body instanceof FormData
      ? String(options.body.get('purpose') ?? '')
      : ''
    const assetTypeByPurpose: Record<string, string> = {
      legend_reward_design: 'aikids-legend-reward',
      storybook_chapter_design: 'aikids-storybook',
      achievement_milestone_design: 'aikids-achievement',
      course_content_design: 'lms-course',
    }
    const assetType = assetTypeByPurpose[purpose] ?? 'aikids'
    return {
      path: `/api/v1/media/upload?permanent=1&assetType=${encodeURIComponent(assetType)}`,
      options,
    }
  }
  if (path === '/api/media/promote') {
    return { path: '/api/v1/media/gallery/promote', options }
  }

  if (/^\/api\/parent\/approvals(?:\?.*)?$/.test(path)) {
    return {
      path: path.replace('/api/parent/approvals', '/api/v1/media/gallery/share-requests'),
      options,
    }
  }
  const approvalDecision = path.match(/^\/api\/parent\/approvals\/([^/?]+)\/decide$/)
  if (approvalDecision) {
    return {
      path: `/api/v1/media/gallery/share-requests/${encodeURIComponent(approvalDecision[1])}/decide`,
      options,
    }
  }

  const childProgress = path.match(/^\/api\/parent\/children\/([^/?]+)\/progress(?:\?.*)?$/)
  if (childProgress) {
    return {
      path: `/api/v1/lms/family/children/${encodeURIComponent(childProgress[1])}/enrollments`,
      options,
    }
  }
  const childCourses = path.match(/^\/api\/parent\/children\/([^/?]+)\/courses$/)
  if (childCourses) {
    return {
      path: `/api/v1/lms/family/children/${encodeURIComponent(childCourses[1])}/courses`,
      options,
    }
  }

  if (/^\/api\/admin\/courses(?:\/[^/?]+)?(?:\/readiness)?$/.test(path)) {
    return {
      path: path.replace('/api/admin', '/api/v1/lms/aikids/admin'),
      options,
    }
  }

  if (path === '/api/admin/settings/vidtory') {
    const method = (options.method ?? 'GET').toUpperCase()
    if (method === 'GET') {
      return { path: '/api/v1/jobs/providers/policy', options }
    }
    if (method === 'DELETE') {
      return {
        path: '/api/v1/jobs/providers/policy',
        options: withJson({ ...options, method: 'PUT' }, {
          planProviderPolicy: {},
          disabledImageProviders: [],
        }),
      }
    }
    if (typeof body.apiKey === 'string') {
      return {
        path: '/api/v1/jobs/providers/policy',
        options: withJson({ ...options, method: 'PUT' }, {
          sdkApiKey: body.apiKey.trim(),
        }),
      }
    }
    const routing = recordValue(body.routing)
    const image = recordValue(routing.image)
    const video = recordValue(routing.video)
    const imageModels = Array.isArray(image.models)
      ? image.models as Array<Record<string, unknown>>
      : []
    const videoModels = Array.isArray(video.models)
      ? video.models as Array<Record<string, unknown>>
      : []
    const enabled = [...imageModels, ...videoModels]
      .filter((model) => model.enabled !== false)
      .map((model) => String(model.modelId ?? '').trim())
      .filter(Boolean)
    return {
      path: '/api/v1/jobs/providers/policy',
      options: withJson({ ...options, method: 'PUT' }, {
        planProviderPolicy: {
          aikids: {
            allowedProviders: [...new Set(enabled)],
            defaultImageRoute: imageModels
              .filter((model) => model.enabled !== false)
              .map((model) => String(model.modelId ?? '').trim())
              .filter(Boolean),
          },
        },
      }),
    }
  }

  const course = path.match(/^\/api\/courses\/([^/?]+)$/)
  if (course) {
    return { path: `/api/v1/lms/courses/${encodeURIComponent(course[1])}`, options }
  }
  const courseProgress = path.match(/^\/api\/progress\/([^/?]+)$/)
  if (courseProgress) {
    return {
      path: `/api/v1/lms/compat/courses/${encodeURIComponent(courseProgress[1])}/progress`,
      options,
    }
  }
  const quest = path.match(/^\/api\/quests\/([^/?]+)$/)
  if (quest) {
    return {
      path: `/api/v1/lms/compat/quests/${encodeURIComponent(quest[1])}`,
      options,
    }
  }
  const lessonAction = path.match(
    /^\/api\/progress\/([^/?]+)\/(open|start|advance|practice|check|check-answer)$/,
  )
  if (lessonAction) {
    const headers = new Headers(options.headers)
    if (lessonAction[2] === 'check' && !headers.has('Idempotency-Key')) {
      headers.set('Idempotency-Key', createUuid())
    }
    return {
      path: `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonAction[1])}/${lessonAction[2]}`,
      options: { ...options, headers },
    }
  }

  if (path === '/api/teacher/class' ||
      path === '/api/teacher/class/stats' ||
      path === '/api/teacher/class/students' ||
      path === '/api/teacher/lectures' ||
      path === '/api/teacher/lectures/reorder' ||
      path === '/api/teacher/courses' ||
      path === '/api/teacher/class/course' ||
      path === '/api/teacher/question-banks' ||
      path === '/api/teacher/question-bank/items' ||
      /^\/api\/teacher\/class\/students\/[^/?]+$/.test(path) ||
      /^\/api\/teacher\/class\/course\/[^/?]+$/.test(path) ||
      /^\/api\/teacher\/students\/[^/?]+\/progress$/.test(path) ||
      /^\/api\/teacher\/lectures\/[^/?]+(?:\/restore)?$/.test(path) ||
      /^\/api\/teacher\/courses\/[^/?]+$/.test(path) ||
      /^\/api\/teacher\/courses\/[^/?]+\/readiness$/.test(path) ||
      /^\/api\/teacher\/courses\/[^/?]+\/unlock-mode$/.test(path) ||
      /^\/api\/teacher\/programs\/[^/?]+\/unlock-mode$/.test(path) ||
      /^\/api\/teacher\/question-banks\/[^/?]+\/items(?:\?.*)?$/.test(path) ||
      /^\/api\/teacher\/question-bank\/items\/[^/?]+$/.test(path)) {
    return {
      path: path.replace('/api/teacher', '/api/v1/lms/aikids/teacher'),
      options,
    }
  }

  const legacyUrl = new URL(path, 'https://storymee.local')
  const studentId = legacyUrl.searchParams.get('studentId')
  if (legacyUrl.pathname === '/api/learning/pathway') {
    return {
      path: studentId
        ? `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/pathway`
        : '/api/v1/lms/me/pathway',
      options,
    }
  }
  if (legacyUrl.pathname === '/api/competency-map') {
    return {
      path: studentId
        ? `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/competency-map`
        : '/api/v1/lms/me/competency-map',
      options,
    }
  }
  if (legacyUrl.pathname === '/api/credentials') {
    return {
      path: studentId
        ? `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/credentials`
        : '/api/v1/lms/me/credentials',
      options,
    }
  }
  if (legacyUrl.pathname === '/api/reports' && studentId) {
    return {
      path: `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/reports`,
      options,
    }
  }
  if (legacyUrl.pathname === '/api/schedule' && studentId) {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear() + 1, now.getMonth(), 1)
    return {
      path: `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/schedule?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
      options,
    }
  }
  if (legacyUrl.pathname === '/api/schedule/placement-requests') {
    const childProfileId = studentId ?? String(body.studentId ?? '')
    if (childProfileId) {
      const status = legacyUrl.searchParams.get('status')
      return {
        path: `/api/v1/lms/family/children/${encodeURIComponent(childProfileId)}/placement-requests${status ? `?status=${encodeURIComponent(status)}` : ''}`,
        options: (options.method ?? 'GET').toUpperCase() === 'POST'
          ? withJson(options, {
              courseId: body.courseId,
              requestedLevel: body.requestedLevel,
              availability: { slots: body.availability },
              reason: body.reason || 'Parent requested class placement',
            })
          : options,
      }
    }
  }
  if (legacyUrl.pathname === '/api/schedule/reschedule-requests') {
    const childProfileId = String(body.studentId ?? '')
    if (childProfileId) {
      return {
        path: `/api/v1/lms/family/children/${encodeURIComponent(childProfileId)}/reschedule-requests`,
        options: withJson(options, {
          sessionId: body.sessionId,
          preferredStartsAt: body.preferredStartsAt,
          preferredEndsAt: body.preferredEndsAt,
          reason: body.reason,
        }),
      }
    }
  }
  const lessonNotes = legacyUrl.pathname.match(/^\/api\/learning\/quests\/([^/]+)\/notes$/)
  if (lessonNotes) {
    return {
      path: `/api/v1/lms/lessons/${encodeURIComponent(lessonNotes[1])}/notes`,
      options: (options.method ?? 'GET').toUpperCase() === 'POST'
        ? withJson(options, {
            body: body.body,
            anchor: body.anchorType === 'section'
              ? { sectionId: body.anchorValue }
              : {},
          })
        : options,
    }
  }
  const lessonBookmarks = legacyUrl.pathname.match(/^\/api\/learning\/quests\/([^/]+)\/bookmarks$/)
  if (lessonBookmarks) {
    return {
      path: `/api/v1/lms/lessons/${encodeURIComponent(lessonBookmarks[1])}/bookmarks`,
      options: (options.method ?? 'GET').toUpperCase() === 'POST'
        ? withJson(options, {
            anchorKey: `${String(body.anchorType ?? 'section')}:${String(body.anchorValue ?? '')}`,
            label: body.label,
          })
        : options,
    }
  }
  const lessonNote = legacyUrl.pathname.match(/^\/api\/learning\/notes\/([^/]+)$/)
  if (lessonNote) {
    return {
      path: `/api/v1/lms/notes/${encodeURIComponent(lessonNote[1])}`,
      options,
    }
  }
  const lessonBookmark = legacyUrl.pathname.match(/^\/api\/learning\/bookmarks\/([^/]+)$/)
  if (lessonBookmark) {
    return {
      path: `/api/v1/lms/bookmarks/${encodeURIComponent(lessonBookmark[1])}`,
      options,
    }
  }
  const lessonResume = legacyUrl.pathname.match(/^\/api\/learning\/quests\/([^/]+)\/resume$/)
  if (lessonResume) {
    return {
      path: `/api/v1/lms/lessons/${encodeURIComponent(lessonResume[1])}/resume`,
      options,
    }
  }
  const offlineGrant = legacyUrl.pathname.match(/^\/api\/learning\/quests\/([^/]+)\/offline-manifest$/)
  if (offlineGrant) {
    return {
      path: `/api/v1/lms/lessons/${encodeURIComponent(offlineGrant[1])}/offline-grants`,
      options,
    }
  }
  const offlineSync = legacyUrl.pathname.match(/^\/api\/learning\/quests\/([^/]+)\/offline-sync$/)
  if (offlineSync) {
    const events = Array.isArray(body.events)
      ? body.events.map((event) => ({
          ...recordValue(event),
          eventType: 'progress',
        }))
      : []
    return {
      path: '/api/v1/lms/offline-progress/sync',
      options: withJson(options, {
        grantId: body.grantId,
        deviceId: body.deviceId,
        events,
      }),
    }
  }
  const courseAssessments = legacyUrl.pathname.match(/^\/api\/assessments\/course\/([^/]+)$/)
  if (courseAssessments) {
    return {
      path: `/api/v1/lms/courses/${encodeURIComponent(courseAssessments[1])}/assessments`,
      options,
    }
  }
  const assessmentAttempt = legacyUrl.pathname.match(/^\/api\/assessments\/([^/]+)\/attempts$/)
  if (assessmentAttempt) {
    return {
      path: `/api/v1/lms/assessments/${encodeURIComponent(assessmentAttempt[1])}/attempts`,
      options,
    }
  }
  const attemptResult = legacyUrl.pathname.match(/^\/api\/assessment-attempts\/([^/]+)\/result$/)
  if (attemptResult) {
    return {
      path: `/api/v1/lms/assessment-attempts/${encodeURIComponent(attemptResult[1])}`,
      options,
    }
  }
  const attemptAction = legacyUrl.pathname.match(
    /^\/api\/assessment-attempts\/([^/]+)\/(responses\/[^/]+|submit)$/,
  )
  if (attemptAction) {
    const isSubmit = attemptAction[2] === 'submit'
    return {
      path: `/api/v1/lms/assessment-attempts/${encodeURIComponent(attemptAction[1])}/${attemptAction[2]
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`,
      options: withJson(options, isSubmit
        ? {
            clientSubmissionId: body.clientSubmissionId,
            version: body.attemptVersion,
          }
        : {
            response: body.response,
            version: body.responseVersion,
          }),
    }
  }
  if (path.startsWith('/api/learning/age-policy')) {
    const agePolicyUrl = new URL(path, 'https://storymee.local')
    const childProfileId = agePolicyUrl.searchParams.get('studentId')
    return {
      path: childProfileId
        ? `/api/v1/lms/family/children/${encodeURIComponent(childProfileId)}/age-policy`
        : '/api/v1/lms/me/age-policy',
      options,
    }
  }

  return null
}

export function normalizeLearningGatewayResponse(
  path: string,
  data: unknown,
): unknown | undefined {
  const isLearningRoute =
    path.startsWith('/api/courses') ||
    path.startsWith('/api/enrollments') ||
    path.startsWith('/api/learning') ||
    path.startsWith('/api/progress') ||
    path.startsWith('/api/quests') ||
    path.startsWith('/api/teacher') ||
    path.startsWith('/api/admin/courses') ||
    path.startsWith('/api/admin/settings/vidtory') ||
    path.startsWith('/api/competency-map') ||
    path.startsWith('/api/credentials') ||
    path.startsWith('/api/reports') ||
    path.startsWith('/api/schedule') ||
    path.startsWith('/api/assessments') ||
    path.startsWith('/api/assessment-attempts') ||
    path.startsWith('/api/media') ||
    path.startsWith('/api/projects') ||
    path.startsWith('/api/backpack') ||
    path.startsWith('/api/parent/approvals') ||
    path.startsWith('/api/parent/children/') && (path.includes('/progress') || path.includes('/courses')) ||
    path.startsWith('/api/notifications')

  if (!isLearningRoute) return undefined

  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const payload = (body.data && typeof body.data === 'object'
    ? body.data
    : body) as Record<string, unknown>

  if (/^\/api\/parent\/approvals(?:\?.*)?$/.test(path)) {
    return {
      approvals: Array.isArray(payload.approvals) ? payload.approvals : [],
    }
  }

  if (path === '/api/admin/courses') {
    const rows = Array.isArray(payload.courses)
      ? payload.courses as Array<Record<string, unknown>>
      : []
    return {
      courses: rows.map((row) => {
        const mapped = mapCourse(row)
        const lectures = Array.isArray(row.lectures)
          ? row.lectures as Array<Record<string, unknown>>
          : []
        return {
          ...row,
          ageLabel: mapped.ageLabel,
          ageTrack: mapped.ageTrack,
          enrollmentCount: Number(row.enrollmentCount ?? 0),
          questCount: lectures.length,
          quests: lectures,
        }
      }),
    }
  }

  if (path === '/api/admin/settings/vidtory') {
    const sdkConfigured = payload.sdkConfigured === true
    const bemaskedHint = typeof payload.maskedHint === 'string' ? payload.maskedHint : null
    const policy = recordValue(payload.planProviderPolicy)
    const aikids = recordValue(policy.aikids)
    const imageRoute = Array.isArray(aikids.defaultImageRoute)
      ? aikids.defaultImageRoute.map(String)
      : []
    const providers = Array.isArray(aikids.allowedProviders)
      ? aikids.allowedProviders.map(String)
      : imageRoute
    const imageModels = imageRoute.map((modelId, index) => ({
      modelId,
      weight: index === 0 ? 100 : 0,
      percent: index === 0 ? 100 : 0,
      enabled: true,
    }))
    const videoModels = providers
      .filter((provider) => !imageRoute.includes(provider))
      .map((modelId, index) => ({
        modelId,
        weight: index === 0 ? 100 : 0,
        percent: index === 0 ? 100 : 0,
        enabled: true,
      }))
    const routing = {
      baseURL: 'StoryMee Hub → Job API → Media Rotation',
      image: {
        aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
        resolution: '1K',
        models: imageModels,
      },
      video: {
        aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        duration: 6,
        models: videoModels,
      },
    }
    const configured = sdkConfigured || providers.length > 0
    const maskedHint = bemaskedHint
      ?? (providers.length ? `${providers.length} provider route(s)` : null)
    return {
      configured,
      maskedHint,
      source: 'core-job-api',
      routing,
      imagePercents: imageModels,
      videoPercents: videoModels,
    }
  }

  if (path === '/api/media/refs' || path === '/api/backpack') {
    const rows = Array.isArray(payload.items)
      ? payload.items as Array<Record<string, unknown>>
      : []
    const assets = rows.flatMap((row) => {
      const item = normalizeGalleryItem(row)
      if (item.isProject) return []
      return [{
        id: item.id,
        type: item.kind,
        name: item.title,
        thumbnail: item.url,
        url: item.url,
        private: true,
        questId: item.questId,
        jobId: item.jobId,
        createdAt: item.createdAt,
      }]
    })
    return { assets }
  }

  if (path === '/api/projects') {
    const rows = Array.isArray(payload.items)
      ? payload.items as Array<Record<string, unknown>>
      : []
    return {
      projects: rows.flatMap((row) => {
        const item = normalizeGalleryItem(row)
        if (!item.isProject) return []
        return [{
          id: item.id,
          title: item.title,
          kind: item.kind,
          thumbnail: item.url,
          content: item.content,
          shareStatus: item.shareStatus,
          jobId: item.jobId,
        }]
      }),
    }
  }

  if (path === '/api/media/upload') {
    const item = recordValue(payload.libraryItem)
    const rawUrl = String(payload.url ?? payload.imageUrl ?? '').trim()
    let url = ''
    try {
      const parsed = new URL(rawUrl)
      if (parsed.origin === environment.storagePublicUrl) url = parsed.toString()
    } catch {
      // Must resolve to the configured storage origin
    }
    if (!url) throw new Error('StoryMee Media không trả về URL Storage hợp lệ.')
    return {
      asset: {
        id: String(item.id ?? ''),
        url,
        mediaId: String(item.id ?? ''),
        storageBackend: 'storymee-media',
      },
    }
  }

  if (path === '/api/media/promote' || path === '/api/v1/media/gallery/promote') {
    const raw = (payload && typeof payload === 'object' && 'data' in payload)
      ? (payload as any).data?.asset ?? (payload as any).data
      : (payload as any)?.asset ?? payload
    return {
      asset: {
        id: String(raw?.id ?? raw?.mediaId ?? ''),
        url: String(raw?.url ?? raw?.imageUrl ?? ''),
        mediaId: String(raw?.mediaId ?? raw?.id ?? ''),
        storageBackend: String(raw?.storageBackend ?? 'storymee-media'),
      },
    }
  }

  if (path === '/api/courses' && Array.isArray(payload.courses)) {
    return {
      courses: payload.courses.map((course) => {
        const raw = course as Record<string, unknown>
        const mapped = mapCourse(raw)
        return {
          ...mapped,
          enrolled: Boolean(raw.enrolled),
          questCount: raw.questCount != null ? Number(raw.questCount) : mapped.questCount,
          completedCount: Number(raw.completedCount ?? 0),
          progressPct: Number(raw.progressPct ?? 0),
        }
      }),
    }
  }

  if (/^\/api\/learning\/pathway(?:\?.*)?$/.test(path) &&
      Array.isArray(payload.courses)) {
    const isCanonicalPathway = Boolean(payload.student || payload.policy) ||
      payload.courses.some((course) => {
        const raw = course as Record<string, unknown>
        return typeof raw.reasonCode === 'string' || Array.isArray(raw.missingPrerequisites)
      })
    const courses = payload.courses
      .filter((course) => {
        const raw = course as Record<string, unknown>
        return isCanonicalPathway || raw.enrolled === true ||
          raw.status === 'active' ||
          raw.status === 'completed'
      })
      .map((course) => {
        const raw = course as Record<string, unknown>
        const mapped = mapCourse(raw)
        const enrolled = raw.enrolled === true
        const progressPct = Number(
          raw.completionPercent ?? raw.progressPct ?? 0,
        )
        const completed = progressPct >= 100
        const canonicalStatus =
          raw.status === 'active' || raw.status === 'completed'
            ? raw.status
            : null
        const isEnrolled =
          enrolled ||
          canonicalStatus === 'active' ||
          canonicalStatus === 'completed'
        return {
          id: mapped.id,
          title: mapped.title,
          shortTitle: mapped.shortTitle,
          enrolled: isEnrolled,
          status:
            canonicalStatus ??
            (completed ? 'completed' : enrolled ? 'active' : 'available'),
          reasonCode: completed
            ? 'completed'
            : canonicalStatus === 'active' || enrolled
              ? 'in_progress'
              : 'requirements_met',
          completionPercent: progressPct,
          questCount: Number(raw.questCount ?? mapped.questCount ?? 0),
          completedCount: Number(raw.completedCount ?? 0),
          totalStars: Number(raw.totalStars ?? 0),
          enrollmentId: raw.enrollmentId ? String(raw.enrollmentId) : null,
          programSource:
            raw.programSource === 'workspace' || raw.programSource === 'creator_marketplace'
              ? raw.programSource
              : 'aikid_official',
          workspaceId: raw.workspaceId ? String(raw.workspaceId) : null,
          programUnlockMode:
            raw.programUnlockMode === 'sequential' || raw.programUnlockMode === 'graph'
              ? raw.programUnlockMode
              : 'parallel',
          missingPrerequisites: Array.isArray(raw.missingPrerequisites)
            ? raw.missingPrerequisites.map(String)
            : [],
          coverImage: mapped.coverImage,
        }
      })
    const recommended = courses.find((course) => course.status === 'active') ??
      courses.find((course) => course.status === 'available') ??
      null
    const firstRaw = payload.courses[0] as Record<string, unknown> | undefined
    return {
      student: {
        nickname: null,
        ageBand: String(firstRaw?.ageBand ?? '8-11'),
      },
      policy: { label: 'Lộ trình học AI theo tiến độ của con' },
      regionUnlockMode:
        payload.regionUnlockMode === 'sequential' ? 'sequential' : 'parallel',
      regionUnlockModeSource: payload.regionUnlockModeSource ?? 'course',
      recommendedCourseId: recommended?.id ?? null,
      courses,
    }
  }

  if (/^\/api\/courses\/[^/?]+$/.test(path) && payload.course) {
    const raw = payload.course as Record<string, unknown>
    return {
      course: {
        ...mapCourse(raw),
        enrolled: raw.enrolled === true,
        enrollmentId: raw.enrollmentId ? String(raw.enrollmentId) : null,
        enrollmentSource: raw.enrollmentSource ? String(raw.enrollmentSource) : null,
      },
    }
  }

  if (/^\/api\/parent\/children\/[^/?]+\/progress/.test(path)) {
    const rows = Array.isArray(payload.enrollments)
      ? payload.enrollments as Array<Record<string, unknown>>
      : []
    const selectedId = new URLSearchParams(path.split('?')[1] ?? '').get('courseId')
    const selected = rows.find((row) => String(row.courseId) === selectedId) ?? rows[0]
    const progress = selected && Array.isArray(selected.progress)
      ? selected.progress as Array<Record<string, unknown>>
      : []
    return {
      child: { id: path.split('/')[4], nickname: null, level: 1, xp: 0 },
      courseId: selected ? String(selected.courseId ?? '') : null,
      courses: rows.map((row) => {
        const item = recordValue(row.course)
        const metadata = recordValue(item.metadata)
        return {
          id: String(row.courseId ?? item.id ?? ''),
          title: String(item.title ?? ''),
          shortTitle: String(item.shortTitle ?? item.title ?? ''),
          ageLabel: String(metadata.ageLabel ?? ''),
        }
      }),
      summary: {
        completed: progress.filter((row) => row.status === 'completed').length,
        total: progress.length,
        totalStars: progress.reduce((sum, row) => sum + Number(row.stars ?? 0), 0),
        currentPhase: progress.find((row) => row.status === 'in_progress')?.phase ?? null,
      },
      insights: { strengths: [], nextFocus: null, outcomes: [] },
      quests: progress.map((row, index) => ({
        id: String(row.lessonId ?? ''),
        order: Number(row.order ?? index + 1),
        title: String(row.title ?? `Trạm ${index + 1}`),
        skill: String(row.skill ?? ''),
        reward: String(row.reward ?? ''),
        duration: String(row.duration ?? ''),
        hook: String(row.hook ?? ''),
        accent: String(row.accent ?? ''),
        practiceKind: String(row.practiceKind ?? ''),
        status: String(row.status ?? 'locked'),
        phase: String(row.phase ?? 'learn'),
        stars: Number(row.stars ?? 0),
        xpEarned: Number(row.xpEarned ?? 0),
        videoUrl: typeof row.videoUrl === 'string' ? row.videoUrl : null,
        slug: (row as any).slug ? String((row as any).slug) : undefined,
        access: (row as any).access ?? ((row as any).metadata as any)?.access,
      })),
    }
  }

  if (/^\/api\/parent\/children\/[^/?]+\/courses$/.test(path)) {
    const child = recordValue(payload.child)
    const courses = Array.isArray(payload.courses)
      ? payload.courses as Array<Record<string, unknown>>
      : []
    const normalizedCourses = courses.map((row) => {
      const mapped = mapCourse(row)
      const metadata = recordValue(row.metadata)
      return {
        id: mapped.id,
        title: mapped.title,
        shortTitle: mapped.shortTitle,
        ageLabel: mapped.ageLabel,
        ageTrack: mapped.ageTrack ?? '',
        tagline: mapped.tagline,
        coverImage: mapped.coverImage,
        description: mapped.description,
        questCount: mapped.questCount,
        stations: mapped.quests.map((quest) => ({ id: quest.id, order: quest.order, title: quest.title })),
        programId: String(row.programId ?? row.programKey ?? metadata.programId ?? metadata.programKey ?? row.id ?? ''),
        programTitle: String(row.programTitle ?? metadata.programTitle ?? row.title ?? ''),
        programDescription: String(row.programDescription ?? metadata.programDescription ?? row.description ?? ''),
        programImage: row.programImage ?? metadata.programImage ?? metadata.coverImage ?? null,
        programSource: row.programSource === 'workspace' || row.programSource === 'creator_marketplace'
          ? row.programSource
          : metadata.programSource === 'workspace' || metadata.programSource === 'creator_marketplace'
            ? metadata.programSource
            : 'aikid_official',
        regionOrder: Number(row.regionOrder ?? metadata.regionOrder ?? 0),
        enrolled: row.enrolled === true,
        parentAllowed: typeof row.parentAllowed === 'boolean' ? row.parentAllowed : null,
      }
    })
    const coursesById = new Map<string, (typeof normalizedCourses)[number]>()
    for (const course of normalizedCourses) {
      const current = coursesById.get(course.id)
      coursesById.set(course.id, current
        ? { ...current, enrolled: current.enrolled || course.enrolled, parentAllowed: current.parentAllowed ?? course.parentAllowed }
        : course)
    }
    return {
      child: {
        id: String(child.id ?? ''),
        nickname: child.name ? String(child.name) : null,
        ageBand: child.ageBand ? String(child.ageBand) : null,
      },
      courses: [...coursesById.values()],
      enrolled: payload.enrolled,
      enrollment: payload.enrollment,
    }
  }

  if (/^\/api\/learning\/pathway(?:\?.*)?$/.test(path)) {
    const source = recordValue(payload.pathway ?? payload)
    const courses = Array.isArray(source.courses)
      ? source.courses as Array<Record<string, unknown>>
      : []
    const statusPriority: Record<string, number> = { completed: 4, active: 3, available: 2, locked: 1 }
    const pathwayByCourseId = new Map<string, Record<string, unknown>>()
    for (const course of courses) {
      const id = String(course.id ?? '')
      if (!id) continue
      const current = pathwayByCourseId.get(id)
      pathwayByCourseId.set(id, !current || (statusPriority[String(course.status)] ?? 0) > (statusPriority[String(current.status)] ?? 0)
        ? course
        : { ...current, completionPercent: Math.max(Number(current.completionPercent ?? 0), Number(course.completionPercent ?? 0)) })
    }
    const uniqueCourses = [...pathwayByCourseId.values()]
    const recommended = uniqueCourses.find((course) => course.status === 'active') ?? uniqueCourses.find((course) => course.status === 'available')
    return {
      ...source,
      student: {
        ...recordValue(source.student),
        ageBand: String(
          recordValue(source.student).ageBand ?? source.ageBand ?? '',
        ),
      },
      policy: source.policy ?? null,
      recommendedCourseId:
        source.recommendedCourseId ?? recommended?.id ?? null,
      courses: uniqueCourses.map((course) => ({
        ...course,
        shortTitle: String(course.shortTitle ?? course.title ?? ''),
        coverImage: course.coverImage ? String(course.coverImage) : null,
      })),
    }
  }

  if (/^\/api\/learning\/quests\/[^/]+\/notes$/.test(path)) {
    const notes = Array.isArray(payload.notes)
      ? payload.notes as Array<Record<string, unknown>>
      : []
    return {
      notes: notes.map((note) => {
        const anchor = recordValue(note.anchor)
        return {
          ...note,
          anchorType: anchor.sectionId ? 'section' : 'lesson',
          anchorValue: String(anchor.sectionId ?? anchor.blockId ?? ''),
        }
      }),
    }
  }

  if (/^\/api\/learning\/quests\/[^/]+\/bookmarks$/.test(path)) {
    const bookmarks = Array.isArray(payload.bookmarks)
      ? payload.bookmarks as Array<Record<string, unknown>>
      : []
    return {
      bookmarks: bookmarks.map((bookmark) => {
        const [anchorType, ...anchorParts] = String(
          bookmark.anchorKey ?? '',
        ).split(':')
        return {
          ...bookmark,
          anchorType: anchorType || 'section',
          anchorValue: anchorParts.join(':'),
        }
      }),
    }
  }

  if (/^\/api\/learning\/quests\/[^/]+\/offline-manifest$/.test(path)) {
    const grant = recordValue(payload.grant)
    const manifest = recordValue(grant.manifest)
    const lesson = recordValue(manifest.lesson)
    const metadata = recordValue(lesson.metadata)
    const stations = Array.isArray(lesson.stations) ? lesson.stations : []
    const media = Array.isArray(metadata.media)
      ? metadata.media.map(String)
      : []
    return {
      manifest: {
        grantId: String(grant.id ?? ''),
        questId: String(lesson.id ?? ''),
        contentVersion: Number(grant.contentVersion ?? 1),
        expiresAt: String(grant.expiresAt ?? ''),
        lesson: {
          title: String(lesson.title ?? ''),
          hook: String(metadata.hook ?? ''),
          skill: String(metadata.skill ?? ''),
          learnCards: Array.isArray(metadata.learnCards)
            ? metadata.learnCards
            : [],
          stations,
        },
        media,
      },
    }
  }

  if (/^\/api\/learning\/quests\/[^/]+\/offline-sync$/.test(path)) {
    const sync = recordValue(payload.sync)
    return {
      sync: {
        ...sync,
        duplicate: Number(sync.duplicates ?? sync.duplicate ?? 0),
      },
    }
  }

  if (/^\/api\/schedule\?/.test(path)) {
    const sessions = Array.isArray(payload.sessions)
      ? payload.sessions as Array<Record<string, unknown>>
      : []
    const byClassroom = new Map<string, Array<Record<string, unknown>>>()
    for (const session of sessions) {
      const classroomId = String(session.classroomId ?? 'unassigned')
      const rows = byClassroom.get(classroomId) ?? []
      rows.push(session)
      byClassroom.set(classroomId, rows)
    }
    return {
      classes: [...byClassroom.entries()].map(([id, rows]) => ({
        id,
        name: 'Lớp học',
        classType: 'group',
        teacher: { nickname: null },
        course: null,
        sessions: rows.map((session) => ({
          ...session,
          quest: session.lessonId
            ? { id: String(session.lessonId), title: String(session.title ?? '') }
            : null,
        })),
      })),
    }
  }

  if (/^\/api\/schedule\/placement-requests(?:\?.*)?$/.test(path)) {
    const requests = Array.isArray(payload.requests)
      ? payload.requests as Array<Record<string, unknown>>
      : []
    return {
      requests: requests.map((request) => ({
        ...request,
        course: {
          id: String(request.courseId ?? ''),
          title: 'Khóa học',
        },
        targetClass: null,
      })),
    }
  }

  if (/^\/api\/assessments\/[^/]+\/attempts$/.test(path)) {
    return {
      attempt: mapAssessmentAttempt(recordValue(payload.attempt)),
    }
  }

  if (/^\/api\/assessment-attempts\/[^/]+\/responses\/[^/]+$/.test(path)) {
    const response = recordValue(payload.response)
    return {
      saved: {
        responseVersion: Number(response.version ?? 0),
      },
    }
  }

  if (/^\/api\/assessment-attempts\/[^/]+\/submit$/.test(path)) {
    return {
      attempt: mapAssessmentAttempt(recordValue(payload.attempt)),
    }
  }

  if (/^\/api\/assessment-attempts\/[^/]+\/result$/.test(path)) {
    const attempt = mapAssessmentAttempt(recordValue(payload.attempt))
    const items = Array.isArray(attempt.items)
      ? attempt.items as Array<Record<string, unknown>>
      : []
    return {
      result: {
        ...attempt,
        responses: items.map((item) => {
          const response = recordValue(item.response)
          return {
            question: recordValue(item.question),
            points: Number(item.points ?? 0),
            ratio: null,
            feedback:
              typeof response.feedback === 'string'
                ? response.feedback
                : null,
          }
        }),
      },
    }
  }

  if (path.startsWith('/api/notifications')) {
    if (Array.isArray(payload.items)) {
      return {
        notifications: payload.items.map((item) => {
          const row = item as Record<string, unknown>
          const rawData = row.data ?? row.metadata ?? null
          return {
            id: String(row.id ?? ''),
            type: String(row.type ?? row.eventType ?? 'general'),
            title: String(row.title ?? ''),
            body: String(row.body ?? row.message ?? ''),
            read: typeof row.read === 'boolean' ? row.read : Boolean(row.readAt ?? row.read_at),
            data: rawData && typeof rawData === 'object' && !Array.isArray(rawData)
              ? rawData as Record<string, unknown>
              : null,
            createdAt: String(row.createdAt ?? row.created_at ?? ''),
          }
        }),
        unreadCount: Number(payload.unreadCount ?? payload.unread_count),
      }
    }
  }

  if (path.startsWith('/api/learning/age-policy')) {
    return payload
  }

  return payload
}
