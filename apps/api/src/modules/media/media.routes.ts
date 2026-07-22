import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  can,
  isCourseCreatedAsset,
  isUsableImageReference,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import {
  assertImageUpload,
  uploadStudentMedia,
} from '../../infrastructure/generation/vidtory.media.js'
import { requireRole, requireUser } from '../../infrastructure/session/session.js'

function parseMeta(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

function courseAssetFilter(a: {
  questId: string | null
  type: string
  metaJson: string | null
}): boolean {
  return isCourseCreatedAsset({
    questId: a.questId,
    type: a.type,
    meta: parseMeta(a.metaJson),
  })
}

/**
 * Media policy (kids safety):
 * - Students may NOT upload arbitrary photos.
 * - Only course-created assets (quest gen / practice / sketch-in-lesson) can be refs.
 * - Promote: push an existing course asset to Vidtory media.upload for a CDN URL/media id.
 * - Free multipart upload: teacher/admin CMS only.
 */
export async function mediaRoutes(app: FastifyInstance) {
  try {
    const multipart = await import('@fastify/multipart')
    await app.register(multipart.default, {
      limits: { fileSize: 20 * 1024 * 1024, files: 1 },
    })
  } catch {
    app.log.warn('@fastify/multipart missing — CMS upload may need base64')
  }

  /**
   * List only course-created assets of the student (for ref picker).
   */
  app.get('/api/media/refs', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'portfolio:read') && !can(user.role, 'media:upload')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }

    const rows = await prisma.asset.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 80,
    })

    const assets = rows
      .filter((a) => courseAssetFilter(a) && isUsableImageReference(a.thumbnail))
      .map((a) => {
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        url: a.thumbnail,
        questId: a.questId,
        private: a.private,
        createdAt: a.createdAt,
      }
      })

    return { assets }
  })

  /** @deprecated name kept for FE; same as /refs (course-only). */
  app.get('/api/media/mine', async (request, reply) => {
    // Reuse refs logic
    const user = requireUser(request)
    if (!can(user.role, 'portfolio:read') && !can(user.role, 'media:upload')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const rows = await prisma.asset.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 80,
    })
    return {
      assets: rows.filter(courseAssetFilter).map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        url: a.thumbnail,
        private: a.private,
        questId: a.questId,
        createdAt: a.createdAt,
        meta: parseMeta(a.metaJson),
      })),
    }
  })

  /**
   * Promote an existing course asset to Vidtory media (get media id / CDN URL).
   * Does NOT accept arbitrary new files from students.
   */
  app.post('/api/media/promote', async (request, reply) => {
    const user = requireUser(request)
    if (!can(user.role, 'media:upload') && !can(user.role, 'progress:write')) {
      return reply.code(403).send({ error: 'Không có quyền' })
    }

    const body = z
      .object({
        assetId: z.string().uuid(),
        purpose: z.string().max(80).optional(),
      })
      .parse(request.body)

    const asset = await prisma.asset.findFirst({
      where: { id: body.assetId, userId: user.id },
    })
    if (!asset) {
      return reply.code(404).send({ error: 'Không tìm thấy vật phẩm của con' })
    }

    const meta = parseMeta(asset.metaJson)
    if (
      !isCourseCreatedAsset({
        questId: asset.questId,
        type: asset.type,
        meta,
      })
    ) {
      return reply.code(403).send({
        error:
          'Chỉ dùng ảnh/sản phẩm tạo trong bài học (vẽ/gen trong khóa), không upload ảnh ngoài.',
        code: 'NOT_COURSE_CREATED',
      })
    }

    // Already promoted
    if (
      typeof meta.vidtoryMediaId === 'string' &&
      typeof asset.thumbnail === 'string' &&
      asset.thumbnail.startsWith('http')
    ) {
      return {
        asset: {
          id: asset.id,
          url: asset.thumbnail,
          mediaId: meta.vidtoryMediaId,
          storageBackend: meta.storageBackend ?? 'vidtory_cdn',
          alreadyPromoted: true,
        },
      }
    }

    const file = await loadBytesFromThumbnail(asset.thumbnail)
    if (!file) {
      return reply.code(400).send({
        error: 'Sản phẩm này chưa sẵn sàng. Con hãy chọn một sản phẩm khác nhé!',
        code: 'REFERENCE_NOT_READY',
      })
    }

    try {
      const uploaded = await uploadStudentMedia({
        userId: user.id,
        file: file.buffer,
        fileName: file.fileName,
        mime: file.mime,
        purpose: body.purpose ?? 'course_ref_promote',
        questId: asset.questId,
        assetId: asset.id,
      })

      const nextMeta = {
        ...meta,
        provider: 'vidtory',
        storageBackend: uploaded.storageBackend,
        vidtoryMediaId: uploaded.mediaId,
        purpose: body.purpose ?? meta.purpose ?? 'course_ref_promote',
        courseCreated: true,
        aikids_user_id: user.id,
        aikids_asset_id: asset.id,
        vidtoryMetadata: uploaded.metadata,
        previousThumbnail: asset.thumbnail.startsWith('data:')
          ? 'data-url-omitted'
          : asset.thumbnail,
      }

      const updated = await prisma.asset.update({
        where: { id: asset.id },
        data: {
          thumbnail: uploaded.url,
          metaJson: JSON.stringify(nextMeta),
        },
      })

      return {
        asset: {
          id: updated.id,
          url: updated.thumbnail,
          mediaId: uploaded.mediaId,
          storageBackend: uploaded.storageBackend,
          alreadyPromoted: false,
          storageNote:
            'url_is_vidtory_cdn_temporary_no_aikids_object_storage_yet',
        },
      }
    } catch (e) {
      const err = e as Error & { statusCode?: number }
      request.log.error(
        { err, userId: user.id, assetId: asset.id },
        'course_reference_promotion_failed',
      )
      return reply
        .code(err.statusCode ?? 500)
        .send({
          error: 'Sản phẩm này chưa sẵn sàng. Con hãy thử lại sau nhé!',
          code: 'REFERENCE_PREPARATION_FAILED',
        })
    }
  })

  /**
   * Free-form file upload — TEACHER/ADMIN only (CMS / curriculum media).
   * Students cannot use this to inject arbitrary photos into gen.
   */
  app.post('/api/media/upload', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'media:upload')) {
      return reply.code(403).send({ error: 'Không có quyền upload' })
    }

    let fileBuf: Buffer | null = null
    let fileName = 'cms-upload.png'
    let mime = 'image/png'
    let purpose = 'cms_media'
    let questId: string | null = null

    const isMultipart =
      typeof (request as { isMultipart?: () => boolean }).isMultipart ===
        'function' &&
      (request as { isMultipart: () => boolean }).isMultipart()

    if (isMultipart) {
      const parts = request.parts()
      for await (const part of parts) {
        if (part.type === 'file') {
          fileName = part.filename || fileName
          mime = part.mimetype || mime
          fileBuf = await part.toBuffer()
        } else if (part.fieldname === 'purpose' && typeof part.value === 'string') {
          purpose = part.value
        } else if (part.fieldname === 'questId' && typeof part.value === 'string') {
          questId = part.value || null
        }
      }
    } else {
      const body = z
        .object({
          fileBase64: z.string().min(8),
          fileName: z.string().min(1).max(200).optional(),
          mime: z.string().min(3).max(80).optional(),
          purpose: z.string().max(80).optional(),
          questId: z.string().max(80).optional().nullable(),
        })
        .parse(request.body)
      const raw = body.fileBase64.replace(/^data:[^;]+;base64,/, '')
      fileBuf = Buffer.from(raw, 'base64')
      fileName = body.fileName ?? fileName
      mime = body.mime ?? mime
      purpose = body.purpose ?? purpose
      questId = body.questId ?? null
    }

    if (!fileBuf) {
      return reply.code(400).send({ error: 'Thiếu file upload' })
    }

    try {
      assertImageUpload({ mime, size: fileBuf.byteLength })
    } catch (e) {
      const err = e as Error & { statusCode?: number }
      return reply.code(err.statusCode ?? 400).send({ error: err.message })
    }

    try {
      const uploaded = await uploadStudentMedia({
        userId: user.id,
        file: fileBuf,
        fileName,
        mime,
        purpose,
        questId,
      })

      const asset = await prisma.asset.create({
        data: {
          userId: user.id,
          type: 'panel',
          name: fileName.slice(0, 80),
          questId: questId || null,
          thumbnail: uploaded.url,
          private: true,
          metaJson: JSON.stringify({
            provider: 'vidtory',
            storageBackend: uploaded.storageBackend,
            vidtoryMediaId: uploaded.mediaId,
            purpose,
            courseCreated: Boolean(questId),
            cmsUpload: true,
            aikids_user_id: user.id,
            vidtoryMetadata: uploaded.metadata,
          }),
        },
      })

      return reply.code(201).send({
        asset: {
          id: asset.id,
          url: uploaded.url,
          mediaId: uploaded.mediaId,
          name: asset.name,
          storageBackend: uploaded.storageBackend,
          note: 'cms_or_admin_upload_only_not_student_freeform',
        },
      })
    } catch (e) {
      const err = e as Error & { statusCode?: number }
      return reply
        .code(err.statusCode ?? 500)
        .send({ error: err.message || 'Upload thất bại' })
    }
  })
}

async function loadBytesFromThumbnail(
  thumbnail: string,
): Promise<{ buffer: Buffer; mime: string; fileName: string } | null> {
  if (thumbnail.startsWith('data:')) {
    const m = /^data:([^;]+);base64,(.+)$/s.exec(thumbnail)
    if (!m) return null
    const mime = m[1] || 'image/png'
    const buffer = Buffer.from(m[2]!, 'base64')
    const ext = mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png'
    return { buffer, mime, fileName: `course-asset.${ext}` }
  }
  if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
    try {
      const res = await fetch(thumbnail, { signal: AbortSignal.timeout(20_000) })
      if (!res.ok) return null
      const mime = res.headers.get('content-type') || 'image/png'
      if (!mime.startsWith('image/')) return null
      const ab = await res.arrayBuffer()
      const buffer = Buffer.from(ab)
      if (buffer.byteLength > 20 * 1024 * 1024) return null
      return { buffer, mime, fileName: 'course-asset-remote.png' }
    } catch {
      return null
    }
  }
  // Local public path e.g. /assets/... — not re-uploaded; caller may still use path as ref if absolute later
  return null
}
