import {
  isShareableWorkspaceKind,
  type ActivityAudience,
} from '@aikids/domain'
import type { AuthUser } from '../../infrastructure/session/session.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { publishSocialActivity } from '../social/activity.service.js'
import { accessError, audiencesForViewer } from './audience-access.js'

export async function updateWorkspaceGrants(input: {
  childId: string
  projectId: string
  grants: Array<{
    audience: ActivityAudience
    permission: 'view' | 'remix'
  }>
}) {
  const project = await ownedShareableProject(input.childId, input.projectId)
  const requested = new Map(
    input.grants.map((item) => [item.audience, item.permission]),
  )
  return prisma.$transaction(async (tx) => {
    const existing = await tx.workspaceGrant.findMany({
      where: { projectId: project.id },
    })
    for (const grant of existing) {
      if (!requested.has(grant.audience as ActivityAudience)) {
        await tx.workspaceGrant.update({
          where: { id: grant.id },
          data: {
            status: 'revoked',
            revokedAt: new Date(),
          },
        })
      }
    }
    for (const [audience, permission] of requested) {
      const old = existing.find((item) => item.audience === audience)
      const unchanged =
        old?.status === 'approved' &&
        old.permission === permission &&
        !old.revokedAt
      await tx.workspaceGrant.upsert({
        where: {
          projectId_audience: {
            projectId: project.id,
            audience,
          },
        },
        update: unchanged
          ? {}
          : {
              permission,
              status: 'pending',
              approvedById: null,
              approvedAt: null,
              revokedAt: null,
            },
        create: {
          projectId: project.id,
          audience,
          permission,
          status: 'pending',
        },
      })
    }
    await tx.project.update({
      where: { id: project.id },
      data: { shareStatus: requested.size > 0 ? 'pending' : 'private' },
    })
    return tx.workspaceGrant.findMany({
      where: { projectId: project.id, status: { not: 'revoked' } },
      orderBy: { audience: 'asc' },
    })
  })
}

export async function listWorkspaceGrants(
  childId: string,
  projectId: string,
) {
  await ownedShareableProject(childId, projectId)
  return prisma.workspaceGrant.findMany({
    where: { projectId, status: { not: 'revoked' } },
    orderBy: { audience: 'asc' },
  })
}

export async function listPendingWorkspaceGrants(parentId: string) {
  return prisma.workspaceGrant.findMany({
    where: {
      status: 'pending',
      project: { user: { parentId } },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          kind: true,
          thumbnail: true,
          user: {
            select: { id: true, nickname: true, avatarId: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function reviewWorkspaceGrant(input: {
  parentId: string
  projectId: string
  audience: ActivityAudience
  decision: 'approved' | 'declined'
}) {
  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT wg.id
      FROM workspace_grants wg
      JOIN projects p ON p.id = wg.project_id
      JOIN users u ON u.id = p.user_id
      WHERE wg.project_id = ${input.projectId}::uuid
        AND wg.audience = ${input.audience}
        AND u.parent_id = ${input.parentId}::uuid
      FOR UPDATE
    `
    if (rows.length === 0) {
      throw accessError(404, 'Không tìm thấy yêu cầu chia sẻ.')
    }
    const grant = await tx.workspaceGrant.findUnique({
      where: {
        projectId_audience: {
          projectId: input.projectId,
          audience: input.audience,
        },
      },
      include: { project: true },
    })
    if (!grant || grant.status !== 'pending') {
      throw accessError(409, 'Yêu cầu không còn chờ duyệt.')
    }
    if (!isShareableWorkspaceKind(grant.project.kind)) {
      throw accessError(403, 'Video Storybook không thể chia sẻ.')
    }
    const approved = input.decision === 'approved'
    const updated = await tx.workspaceGrant.update({
      where: { id: grant.id },
      data: {
        status: approved ? 'approved' : 'declined',
        approvedById: approved ? input.parentId : null,
        approvedAt: approved ? new Date() : null,
        revokedAt: null,
      },
    })
    const activeCount = await tx.workspaceGrant.count({
      where: { projectId: input.projectId, status: 'approved' },
    })
    await tx.project.update({
      where: { id: input.projectId },
      data: {
        shareStatus: activeCount > 0 ? 'shared' : 'private',
        private: activeCount === 0,
      },
    })
    return { grant: updated, project: grant.project }
  })

  if (result.grant.status === 'approved') {
    await publishSocialActivity({
      actorChildId: result.project.userId,
      type: 'work_shared',
      title: `Chia sẻ “${result.project.title}”`,
      summary: 'Một tác phẩm mới đã được gia đình duyệt.',
      icon: '🎨',
      referenceId: result.project.id,
      audiences: [input.audience],
      sourceEventId: `workspace-grant:${result.grant.id}:approved`,
    })
  }
  return result.grant
}

export async function revokeWorkspaceGrant(input: {
  childId: string
  projectId: string
  audience: ActivityAudience
}) {
  await ownedShareableProject(input.childId, input.projectId)
  await prisma.$transaction(async (tx) => {
    await tx.workspaceGrant.updateMany({
      where: {
        projectId: input.projectId,
        audience: input.audience,
      },
      data: { status: 'revoked', revokedAt: new Date() },
    })
    const active = await tx.workspaceGrant.count({
      where: { projectId: input.projectId, status: 'approved' },
    })
    await tx.project.update({
      where: { id: input.projectId },
      data: {
        shareStatus: active > 0 ? 'shared' : 'private',
        private: active === 0,
      },
    })
  })
}

export async function getWorkspaceProjection(
  projectId: string,
  viewer: AuthUser,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspaceGrants: {
        where: { status: 'approved', revokedAt: null },
      },
      user: {
        select: {
          id: true,
          nickname: true,
          avatarId: true,
        },
      },
    },
  })
  if (!project || !isShareableWorkspaceKind(project.kind)) {
    throw accessError(404, 'Không tìm thấy workspace.')
  }
  const access = await audiencesForViewer(project.userId, viewer)
  const grant = access.isOwner
    ? { permission: 'remix' as const }
    : project.workspaceGrants.find((item) =>
        access.audiences.has(item.audience as ActivityAudience),
      )
  if (!grant) throw accessError(404, 'Không tìm thấy workspace.')

  return {
    workspace: {
      id: project.id,
      title: project.title,
      kind: project.kind,
      thumbnail: project.thumbnail,
      permission: grant.permission,
      owner: project.user,
      updatedAt: project.updatedAt,
    },
  }
}

async function ownedShareableProject(childId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: childId },
  })
  if (!project) throw accessError(404, 'Không tìm thấy workspace.')
  if (!isShareableWorkspaceKind(project.kind)) {
    throw accessError(403, 'Video Storybook không thể chia sẻ.')
  }
  return project
}
