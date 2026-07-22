import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  can,
  isCourseCreatedAsset,
  isCreativeWorkshopAsset,
  isUsableImageReference,
  parseCourseSketchDataUrl,
  validateChildText,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import {
  generatePracticeImage,
  generatePracticeVideo,
} from '../../infrastructure/generation/vidtory.adapter.js'
import { requireRole } from '../../infrastructure/session/session.js'
import { buildCreativePrompt, type CreativeDetails } from './creative-prompts.js'

const creativeKindSchema = z.enum(['character', 'art', 'comic', 'video'])
const creativeDetailsSchema = z.object({
  appearance: z.string().trim().max(300).optional(),
  personality: z.string().trim().max(200).optional(),
  preserve: z.string().trim().max(300).optional(),
  styleId: z.enum(['watercolor', 'clay', 'paper-cut']).optional(),
  panelCount: z.union([z.literal(2), z.literal(4), z.literal(6)]).optional(),
  panels: z.array(z.object({
    action: z.string().trim().min(1).max(240),
    dialogue: z.string().trim().max(160).optional(),
  })).max(6).optional(),
  motion: z.string().trim().max(300).optional(),
}).default({})

function parseMeta(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    const value = JSON.parse(raw)
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

async function resolveOwnedReferences(userId: string, assetIds: string[]): Promise<string[]> {
  if (!assetIds.length) return []
  const assets = await prisma.asset.findMany({
    where: { userId, id: { in: assetIds.slice(0, 4) } },
  })
  return assets.flatMap((asset) => {
    const meta = parseMeta(asset.metaJson)
    const allowed =
      isCourseCreatedAsset({ questId: asset.questId, type: asset.type, meta }) ||
      isCreativeWorkshopAsset(meta)
    return allowed && isUsableImageReference(asset.thumbnail)
      ? [asset.thumbnail]
      : []
  })
}

function assertSafeText(value: string, fallback: string): string {
  const normalized = value.trim() || fallback
  const safe = validateChildText(normalized)
  if (!safe.ok) {
    const error = new Error(safe.message) as Error & { statusCode: number }
    error.statusCode = 400
    throw error
  }
  return normalized
}

/**
 * Dedicated creative workshop API. It reuses Vidtory but records an explicit
 * provenance marker so only child-owned course/workshop output can be reused.
 */
export async function creativeRoutes(app: FastifyInstance) {
  app.post('/api/creative/sketch', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'progress:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z.object({
      title: z.string().trim().max(80).optional(),
      sketchDataUrl: z.string().max(2_500_000),
    }).parse(request.body ?? {})
    const parsed = parseCourseSketchDataUrl(body.sketchDataUrl)
    if (!parsed.ok) return reply.code(400).send({ error: parsed.message })
    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        type: 'panel',
        name: assertSafeText(body.title ?? '', 'Creative sketch'),
        thumbnail: parsed.dataUrl,
        private: true,
        metaJson: JSON.stringify({
          purpose: 'creative_workshop',
          creativeKind: 'art',
          kind: 'sketch',
          mime: parsed.mime,
          approxBytes: parsed.approxBytes,
          storageBackend: 'inline_data_url',
          aikids_user_id: user.id,
        }),
      },
    })
    return reply.code(201).send({ asset: { id: asset.id, name: asset.name, url: asset.thumbnail } })
  })

  app.post('/api/creative/create', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'progress:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        kind: creativeKindSchema,
        title: z.string().trim().max(80).optional(),
        prompt: z.string().trim().max(800).optional(),
        details: creativeDetailsSchema,
        assetIds: z.array(z.string().uuid()).max(4).default([]),
      })
      .parse(request.body ?? {})

    const title = assertSafeText(body.title ?? '', 'Tác phẩm sáng tạo của con')
    const prompt = assertSafeText(body.prompt ?? '', `Tác phẩm thiếu nhi: ${title}`)
    const details: CreativeDetails = {
      ...body.details,
      appearance: body.details.appearance ? assertSafeText(body.details.appearance, '') : undefined,
      personality: body.details.personality ? assertSafeText(body.details.personality, '') : undefined,
      preserve: body.details.preserve ? assertSafeText(body.details.preserve, '') : undefined,
      motion: body.details.motion ? assertSafeText(body.details.motion, '') : undefined,
      panels: body.details.panels?.map((panel) => ({
        action: assertSafeText(panel.action, ''),
        dialogue: panel.dialogue ? assertSafeText(panel.dialogue, '') : undefined,
      })),
    }
    const generationPrompt = buildCreativePrompt(body.kind, title, prompt, details)
    const refUrls = await resolveOwnedReferences(user.id, body.assetIds)
    const provenance = {
      purpose: 'creative_workshop',
      creativeKind: body.kind,
      provider: 'vidtory',
      refUrls,
      aikids_user_id: user.id,
    }

    if (body.kind === 'video') {
      const video = await generatePracticeVideo(generationPrompt, user.id, { refUrls })
      if (!video.videoUrl || video.mode !== 'vidtory') {
        return reply.code(503).send({ error: 'Creative video generation is not ready yet.' })
      }
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          title,
          kind: 'creative_video',
          thumbnail: video.videoUrl,
          private: true,
          dataJson: JSON.stringify({ ...provenance, generationMode: video.mode }),
        },
      })
      return reply.code(201).send({
        project: { id: project.id, title: project.title, url: project.thumbnail, kind: project.kind },
      })
    }

    const image = await generatePracticeImage(generationPrompt, user.id, { refUrls })
    if (!image.imageUrl || image.mode !== 'vidtory') {
      return reply.code(503).send({ error: 'Creative image generation is not ready yet.' })
    }
    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        type: body.kind === 'character' ? 'character' : 'panel',
        name: title,
        thumbnail: image.imageUrl,
        private: true,
        metaJson: JSON.stringify({
          ...provenance,
          prompt: generationPrompt,
          generationMode: image.mode,
          modelId: image.modelId,
          storageBackend: image.storageBackend ?? 'vidtory_cdn',
        }),
      },
    })
    const project = body.kind === 'comic'
      ? await prisma.project.create({
          data: {
            userId: user.id,
            title,
            kind: 'creative_comic',
            thumbnail: image.imageUrl,
            private: true,
            dataJson: JSON.stringify({ ...provenance, coverAssetId: asset.id, panels: details.panels ?? [] }),
          },
        })
      : null
    return reply.code(201).send({
      asset: { id: asset.id, name: asset.name, url: asset.thumbnail, type: asset.type },
      project: project ? { id: project.id, title: project.title, kind: project.kind } : null,
    })
  })
}
