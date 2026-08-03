import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const RELEASE_PATTERN = /^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*$/
const ALLOWED_KINDS = new Set([
  'avatar',
  'background',
  'companion',
  'effect',
  'event_ticket',
  'frame',
  'perk',
  'theme',
  'title',
])
const ALLOWED_VARIANTS = new Set([
  'primary',
  'plaque',
  'preview',
  'thumbnail',
])
const ALLOWED_ASSET_EXTENSIONS = new Set(['.avif', '.png', '.svg', '.webp'])
const MAX_ZIP_BYTES = 250 * 1024 * 1024
const MAX_ZIP_ENTRIES = 2_000

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

export function validateZipEntryPath(entry) {
  assert(typeof entry === 'string' && entry.length > 0, 'ZIP chứa entry rỗng.')
  assert(!entry.includes('\\'), `${entry}: ZIP path không được dùng dấu \\.`)
  assert(!entry.startsWith('/'), `${entry}: ZIP path không được là absolute path.`)
  assert(!entry.split('/').includes('..'), `${entry}: ZIP path không được chứa ...`)
  assert(!entry.startsWith('__MACOSX/'), `${entry}: hãy xóa metadata __MACOSX.`)
  return entry
}

function assetPaths(reward) {
  const assets = reward?.assets && typeof reward.assets === 'object'
    ? reward.assets
    : {}
  return Object.entries(assets)
    .filter(([variant]) => ALLOWED_VARIANTS.has(variant))
    .map(([variant, path]) => ({ variant, path }))
}

export function validateRewardPackManifest(manifest, entries) {
  assert(manifest && typeof manifest === 'object', 'manifest.json phải là object.')
  assert(manifest.schemaVersion === 1, 'schemaVersion hiện phải bằng 1.')
  assert(ID_PATTERN.test(manifest.pack?.id ?? ''), 'pack.id phải là kebab-case.')
  assert(typeof manifest.pack?.name === 'string' && manifest.pack.name.trim(),
    'pack.name là bắt buộc.')
  assert(RELEASE_PATTERN.test(manifest.pack?.release ?? ''),
    'pack.release không hợp lệ.')
  assert(['event', 'patch'].includes(manifest.pack?.channel),
    'pack.channel phải là event hoặc patch.')

  const rewards = Array.isArray(manifest.rewards) ? manifest.rewards : []
  const achievements = Array.isArray(manifest.achievements)
    ? manifest.achievements
    : []
  const bundles = Array.isArray(manifest.bundles) ? manifest.bundles : []
  assert(rewards.length > 0, 'Reward pack phải có ít nhất một reward.')

  const entrySet = new Set(entries)
  const rewardIds = new Set()
  const achievementIds = new Set()
  const bundleIds = new Set()
  const referencedAssets = new Set()

  for (const reward of rewards) {
    assert(ID_PATTERN.test(reward?.id ?? ''), 'Reward ID phải là kebab-case.')
    assert(!rewardIds.has(reward.id), `Reward ID bị trùng: ${reward.id}.`)
    rewardIds.add(reward.id)
    assert(ALLOWED_KINDS.has(reward.kind), `${reward.id}: reward kind không hợp lệ.`)
    assert(typeof reward.name === 'string' && reward.name.trim(),
      `${reward.id}: name là bắt buộc.`)

    const paths = assetPaths(reward)
    assert(paths.some(({ variant }) => variant === 'primary'),
      `${reward.id}: thiếu assets.primary.`)
    if (reward.kind === 'frame' && !/^frame-level-\d+$/.test(reward.id)) {
      assert(paths.some(({ variant }) => variant === 'plaque'),
        `${reward.id}: frame không theo Profile Composition v1 bắt buộc có assets.plaque.`)
    }
    for (const { variant, path } of paths) {
      validateZipEntryPath(path)
      assert(path.startsWith('assets/'), `${reward.id}: asset phải nằm trong assets/.`)
      assert(entrySet.has(path), `${reward.id}: ZIP thiếu ${path}.`)
      assert(!referencedAssets.has(path), `Asset path bị dùng trùng: ${path}.`)
      referencedAssets.add(path)

      const extension = extname(path).toLowerCase()
      assert(ALLOWED_ASSET_EXTENSIONS.has(extension),
        `${path}: extension asset không hợp lệ.`)
      const expectedName = variant === 'primary'
        ? `${reward.id}${extension}`
        : `${reward.id}--${variant}${extension}`
      assert(basename(path) === expectedName,
        `${path}: filename phải là ${expectedName}.`)
    }
  }

  for (const achievement of achievements) {
    assert(ID_PATTERN.test(achievement?.id ?? ''),
      'Achievement ID phải là kebab-case.')
    assert(!achievementIds.has(achievement.id),
      `Achievement ID bị trùng: ${achievement.id}.`)
    achievementIds.add(achievement.id)
    assert(Number.isInteger(achievement.points) &&
      achievement.points >= 0 &&
      achievement.points <= 1_000,
    `${achievement.id}: points phải là số nguyên 0–1000.`)
    const linkedRewards = Array.isArray(achievement.rewardIds)
      ? achievement.rewardIds
      : []
    for (const rewardId of linkedRewards) {
      assert(rewardIds.has(rewardId),
        `${achievement.id}: rewardId không tồn tại: ${rewardId}.`)
    }
  }

  for (const reward of rewards) {
    if (reward.unlock?.type === 'achievement') {
      assert(achievementIds.has(reward.unlock.achievementId),
        `${reward.id}: achievementId không tồn tại: ${
          reward.unlock.achievementId
        }.`)
    }
  }

  for (const bundle of bundles) {
    assert(ID_PATTERN.test(bundle?.id ?? ''), 'Bundle ID phải là kebab-case.')
    assert(!bundleIds.has(bundle.id), `Bundle ID bị trùng: ${bundle.id}.`)
    bundleIds.add(bundle.id)
    assert(Array.isArray(bundle.rewardIds) && bundle.rewardIds.length > 0,
      `${bundle.id}: rewardIds là bắt buộc.`)
    for (const rewardId of bundle.rewardIds) {
      assert(rewardIds.has(rewardId),
        `${bundle.id}: rewardId không tồn tại: ${rewardId}.`)
    }
  }

  for (const entry of entries) {
    if (entry.startsWith('assets/') && !entry.endsWith('/')) {
      assert(referencedAssets.has(entry),
        `Asset không được manifest tham chiếu: ${entry}.`)
    }
  }

  return {
    packId: manifest.pack.id,
    release: manifest.pack.release,
    channel: manifest.pack.channel,
    rewardCount: rewards.length,
    achievementCount: achievements.length,
    bundleCount: bundles.length,
    assetCount: referencedAssets.size,
  }
}

async function sha256File(path) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest('hex')
}

export async function inspectRewardPack(zipPath) {
  const info = await stat(zipPath)
  assert(info.isFile(), `${zipPath}: không phải file.`)
  assert(info.size > 0 && info.size <= MAX_ZIP_BYTES,
    'Reward pack ZIP phải lớn hơn 0 và không vượt quá 250 MB.')

  const listed = await execFileAsync('unzip', ['-Z1', zipPath], {
    maxBuffer: 20 * 1024 * 1024,
  })
  const entries = listed.stdout.split(/\r?\n/).filter(Boolean)
  assert(entries.length > 0 && entries.length <= MAX_ZIP_ENTRIES,
    `ZIP phải có 1–${MAX_ZIP_ENTRIES} entries.`)
  const uniqueEntries = new Set()
  for (const entry of entries) {
    validateZipEntryPath(entry)
    assert(!uniqueEntries.has(entry), `ZIP entry bị trùng: ${entry}.`)
    uniqueEntries.add(entry)
  }
  assert(uniqueEntries.has('manifest.json'),
    'ZIP phải có manifest.json ở thư mục gốc.')

  const manifestOutput = await execFileAsync(
    'unzip',
    ['-p', zipPath, 'manifest.json'],
    { maxBuffer: 5 * 1024 * 1024 },
  )
  let manifest
  try {
    manifest = JSON.parse(manifestOutput.stdout)
  } catch {
    throw new Error('manifest.json không phải JSON hợp lệ.')
  }
  const summary = validateRewardPackManifest(manifest, entries)
  return {
    ...summary,
    bytes: info.size,
    sha256: await sha256File(zipPath),
    manifest,
  }
}

function safeOrigin(value, label) {
  const url = new URL(value)
  assert(url.protocol === 'https:' ||
    (url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname)),
  `${label} phải dùng HTTPS, trừ localhost.`)
  return url.origin
}

async function backendJson(apiOrigin, path, token, options = {}) {
  const response = await fetch(`${apiOrigin}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    credentials: 'omit',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`Backend Ubuntu trả HTTP ${response.status}: ${
      data.message ?? data.error ?? 'request failed'
    }`)
  }
  return data
}

export async function uploadRewardPack(zipPath, options) {
  const apiOrigin = safeOrigin(options.apiOrigin, 'API origin')
  const storageOrigin = safeOrigin(options.storageOrigin, 'Storage origin')
  assert(typeof options.token === 'string' && options.token.trim(),
    'Thiếu STORYMEE_ADMIN_TOKEN.')
  const inspected = await inspectRewardPack(zipPath)

  const session = await backendJson(
    apiOrigin,
    '/api/v1/admin/reward-packs/upload-sessions',
    options.token,
    {
      method: 'POST',
      body: JSON.stringify({
        packId: inspected.packId,
        release: inspected.release,
        channel: inspected.channel,
        fileName: basename(zipPath),
        contentType: 'application/zip',
        size: inspected.bytes,
        sha256: inspected.sha256,
        counts: {
          rewards: inspected.rewardCount,
          achievements: inspected.achievementCount,
          bundles: inspected.bundleCount,
          assets: inspected.assetCount,
        },
      }),
    },
  )
  assert(session.uploadId && session.uploadUrl,
    'Backend Ubuntu chưa trả uploadId/uploadUrl.')
  const uploadUrl = new URL(session.uploadUrl)
  assert(uploadUrl.origin === storageOrigin,
    'Upload URL không thuộc storage VPS Đức đã cấu hình.')

  const uploadHeaders = new Headers(session.uploadHeaders ?? {})
  uploadHeaders.delete('authorization')
  uploadHeaders.delete('cookie')
  uploadHeaders.set('Content-Type', 'application/zip')
  uploadHeaders.set('Content-Length', String(inspected.bytes))
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: createReadStream(zipPath),
    headers: uploadHeaders,
    credentials: 'omit',
    redirect: 'error',
    duplex: 'half',
  })
  assert(uploadResponse.ok,
    `Storage VPS Đức trả HTTP ${uploadResponse.status} khi upload ZIP.`)

  const finalized = await backendJson(
    apiOrigin,
    `/api/v1/admin/reward-packs/upload-sessions/${
      encodeURIComponent(session.uploadId)
    }/finalize`,
    options.token,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': inspected.sha256 },
      body: JSON.stringify({ sha256: inspected.sha256 }),
    },
  )
  return {
    ...inspected,
    draftId: finalized.draftId,
    status: finalized.status,
  }
}
