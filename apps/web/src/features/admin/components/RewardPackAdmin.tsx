import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, FileArchive, Image, RefreshCw, Rocket, ShieldCheck, Upload } from 'lucide-react'
import { unzip } from 'fflate'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { api, uploadToStoryMeeStorage } from '@/shared/lib/api'

type ManifestReward = {
  id: string
  kind: string
  name: string
  assets: Record<string, string>
}

type RewardPackManifest = {
  schemaVersion: number
  pack: { id: string; name: string; release: string; channel: 'event' | 'patch' }
  rewards: ManifestReward[]
  achievements?: Array<{ id: string; title: string; points: number; rewardIds?: string[] }>
  bundles?: Array<{ id: string; name?: string; rewardIds: string[] }>
}

type PackRow = {
  id: string
  packId: string
  release: string
  channel: string
  status: string
  manifest: RewardPackManifest
  createdAt: string
}

type UploadRow = {
  id: string
  packId: string
  release: string
  status: string
  fileName: string
  bytes: string
  error?: string | null
  createdAt: string
}

type LocalPreview = {
  file: File
  manifest: RewardPackManifest
  entries: Record<string, Uint8Array>
  urls: Record<string, string>
  errors: string[]
}

const MAX_BYTES = 250 * 1024 * 1024
const imageType = (path: string) =>
  path.endsWith('.svg') ? 'image/svg+xml'
    : path.endsWith('.png') ? 'image/png'
      : path.endsWith('.avif') ? 'image/avif'
        : 'image/webp'

function inspectManifest(manifest: RewardPackManifest, entries: Record<string, Uint8Array>) {
  const errors: string[] = []
  if (manifest.schemaVersion !== 1) errors.push('schemaVersion phải bằng 1.')
  if (!manifest.pack?.id || !manifest.pack?.release) errors.push('Thiếu pack.id hoặc pack.release.')
  if (!Array.isArray(manifest.rewards) || manifest.rewards.length === 0) {
    errors.push('Pack phải có ít nhất một reward.')
  }
  const rewardIds = new Set<string>()
  for (const reward of manifest.rewards ?? []) {
    if (rewardIds.has(reward.id)) errors.push(`Reward bị trùng: ${reward.id}.`)
    rewardIds.add(reward.id)
    if (!reward.assets?.primary) errors.push(`${reward.id}: thiếu assets.primary.`)
    for (const path of Object.values(reward.assets ?? {})) {
      if (!entries[path]) errors.push(`${reward.id}: ZIP thiếu ${path}.`)
    }
  }
  for (const achievement of manifest.achievements ?? []) {
    for (const rewardId of achievement.rewardIds ?? []) {
      if (!rewardIds.has(rewardId)) errors.push(`${achievement.id}: reward không tồn tại: ${rewardId}.`)
    }
  }
  for (const bundle of manifest.bundles ?? []) {
    for (const rewardId of bundle.rewardIds ?? []) {
      if (!rewardIds.has(rewardId)) errors.push(`${bundle.id}: reward không tồn tại: ${rewardId}.`)
    }
  }
  return errors
}

async function unpack(file: File): Promise<LocalPreview> {
  if (file.size === 0 || file.size > MAX_BYTES) throw new Error('ZIP phải từ 1 byte đến 250 MB.')
  const compressed = new Uint8Array(await file.arrayBuffer())
  const entries = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
    unzip(compressed, (error, result) =>
      error ? reject(new Error('Không giải nén được ZIP.')) : resolve(result))
  })
  const manifestBytes = entries['manifest.json']
  if (!manifestBytes) throw new Error('ZIP thiếu manifest.json ở thư mục gốc.')
  let manifest: RewardPackManifest
  try {
    manifest = JSON.parse(new TextDecoder().decode(manifestBytes)) as RewardPackManifest
  } catch {
    throw new Error('manifest.json không phải JSON hợp lệ.')
  }
  const errors = inspectManifest(manifest, entries)
  const urls: Record<string, string> = {}
  for (const reward of manifest.rewards ?? []) {
    for (const path of Object.values(reward.assets ?? {})) {
      const bytes = entries[path]
      if (bytes && /\.(?:avif|png|svg|webp)$/i.test(path)) {
        urls[path] = URL.createObjectURL(new Blob([bytes as BlobPart], { type: imageType(path) }))
      }
    }
  }
  return { file, manifest, entries, urls, errors }
}

export function RewardPackAdmin() {
  const [preview, setPreview] = useState<LocalPreview | null>(null)
  const [packs, setPacks] = useState<PackRow[]>([])
  const [uploads, setUploads] = useState<UploadRow[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const urlsRef = useRef<Record<string, string>>({})
  const [pendingAction, setPendingAction] = useState<{ kind: 'approve' | 'publish'; pack: PackRow } | null>(null)

  const releaseUrls = useCallback(() => {
    for (const url of Object.values(urlsRef.current)) URL.revokeObjectURL(url)
    urlsRef.current = {}
  }, [])

  useEffect(() => releaseUrls, [releaseUrls])

  const load = useCallback(async () => {
    try {
      const result = await api<{ packs: PackRow[]; uploads: UploadRow[] }>(
        '/api/v1/admin/reward-packs',
      )
      setPacks(result.packs)
      setUploads(result.uploads)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được danh sách reward pack.')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const counts = useMemo(() => ({
    ready: packs.filter((pack) => pack.status === 'ready_for_review').length,
    failed: uploads.filter((upload) => upload.status === 'failed').length,
  }), [packs, uploads])

  const selectFile = async (file: File) => {
    setMessage('')
    releaseUrls()
    try {
      const next = await unpack(file)
      urlsRef.current = next.urls
      setPreview(next)
    } catch (error) {
      setPreview(null)
      setMessage(error instanceof Error ? error.message : 'Không đọc được reward pack.')
    }
  }

  const upload = async () => {
    if (!preview || preview.errors.length > 0) return
    setBusy(true)
    setMessage('')
    try {
      const digest = await crypto.subtle.digest('SHA-256', await preview.file.arrayBuffer())
      const sha256 = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
      const assetCount = Object.keys(preview.entries)
        .filter((entry) => entry.startsWith('assets/') && !entry.endsWith('/')).length
      const session = await api<{
        uploadId: string
        uploadUrl: string
        uploadHeaders?: Record<string, string>
      }>('/api/v1/admin/reward-packs/upload-sessions', {
        method: 'POST',
        body: JSON.stringify({
          packId: preview.manifest.pack.id,
          release: preview.manifest.pack.release,
          channel: preview.manifest.pack.channel,
          fileName: preview.file.name,
          contentType: 'application/zip',
          size: preview.file.size,
          sha256,
          counts: {
            rewards: preview.manifest.rewards.length,
            achievements: preview.manifest.achievements?.length ?? 0,
            bundles: preview.manifest.bundles?.length ?? 0,
            assets: assetCount,
          },
        }),
      })
      await uploadToStoryMeeStorage(
        session.uploadUrl,
        preview.file,
        session.uploadHeaders,
      )
      await api(`/api/v1/admin/reward-packs/upload-sessions/${session.uploadId}/finalize`, {
        method: 'POST',
        headers: { 'Idempotency-Key': sha256 },
        body: JSON.stringify({ sha256 }),
      })
      setMessage('Pack đã qua kiểm tra backend và được lưu ở trạng thái chờ admin xem lại.')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không upload được reward pack.')
      await load()
    } finally {
      setBusy(false)
    }
  }

  const runPackAction = async () => {
    if (!pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    setBusy(true)
    setMessage('')
    try {
      await api(`/api/v1/admin/reward-packs/${action.pack.id}/${action.kind}`, { method: 'POST' })
      setMessage(action.kind === 'approve'
        ? 'Reward Pack đã được duyệt. Kiểm tra lần cuối rồi chọn Publish.'
        : 'Reward Pack đã publish và release này đã được khóa bất biến.')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không cập nhật được Reward Pack.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="ui-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Admin only</p>
            <h2 className="font-display text-2xl">Import reward pack</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Xem trước ảnh và liên kết ngay trên máy; backend Ubuntu sẽ kiểm tra lại trước khi tạo draft.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="rounded-xl bg-mint-100 px-3 py-2 font-bold text-success">{counts.ready} chờ xem</span>
            <span className="rounded-xl bg-coral-50 px-3 py-2 font-bold text-danger">{counts.failed} lỗi</span>
          </div>
        </div>

        <label className="mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/40 p-5 text-center focus-within:ring-2 focus-within:ring-focus">
          <FileArchive className="h-8 w-8 text-brand-600" aria-hidden="true" />
          <span className="mt-2 font-extrabold">Chọn file .reward-pack.zip</span>
          <span className="mt-1 text-sm text-muted">Tối đa 250 MB · chưa publish tự động</span>
          <input
            type="file"
            accept=".zip,.reward-pack.zip,application/zip"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void selectFile(file)
            }}
          />
        </label>
      </section>

      {preview && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="ui-card overflow-hidden">
            <header className="border-b border-border p-5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Preview cục bộ</p>
              <h3 className="font-display text-xl">{preview.manifest.pack.name}</h3>
              <p className="text-sm text-muted">
                {preview.manifest.pack.id} · {preview.manifest.pack.release} · {preview.file.name}
              </p>
            </header>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {preview.manifest.rewards.map((reward) => {
                const imagePath = reward.assets.preview ?? reward.assets.thumbnail ?? reward.assets.primary
                return (
                  <article key={reward.id} className="rounded-2xl border border-border bg-white p-4">
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-page">
                      {preview.urls[imagePath]
                        ? <img src={preview.urls[imagePath]} alt={`Preview ${reward.name}`} className="h-full w-full object-contain" />
                        : <Image className="h-8 w-8 text-muted" aria-hidden="true" />}
                    </div>
                    <p className="mt-3 font-extrabold">{reward.name}</p>
                    <p className="break-all text-xs text-muted">{reward.id} · {reward.kind}</p>
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer font-bold text-brand-600">Các file asset</summary>
                      <ul className="mt-2 space-y-1 text-muted">
                        {Object.entries(reward.assets).map(([variant, path]) => (
                          <li key={variant} className="break-all">{variant}: {path}</li>
                        ))}
                      </ul>
                    </details>
                  </article>
                )
              })}
            </div>
          </div>

          <aside className="ui-card h-fit p-5 xl:sticky xl:top-5">
            <h3 className="font-display text-xl">Kết quả kiểm tra</h3>
            {preview.errors.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-mint-100 p-4 text-success">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                <p className="mt-2 font-extrabold">Có thể upload</p>
                <p className="text-sm">Manifest, asset và liên kết cơ bản hợp lệ.</p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-coral-50 p-4 text-danger">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
                <p className="mt-2 font-extrabold">{preview.errors.length} lỗi cần sửa</p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                  {preview.errors.map((error) => <li key={error}>{error}</li>)}
                </ul>
              </div>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Rewards</dt><dd className="font-extrabold">{preview.manifest.rewards.length}</dd></div>
              <div><dt className="text-muted">Assets</dt><dd className="font-extrabold">{Object.keys(preview.urls).length}</dd></div>
              <div><dt className="text-muted">Achievements</dt><dd className="font-extrabold">{preview.manifest.achievements?.length ?? 0}</dd></div>
              <div><dt className="text-muted">Bundles</dt><dd className="font-extrabold">{preview.manifest.bundles?.length ?? 0}</dd></div>
            </dl>
            <Button className="mt-5 w-full" disabled={busy || preview.errors.length > 0} onClick={() => void upload()}>
              <Upload className="h-5 w-5" aria-hidden="true" />
              {busy ? 'Đang kiểm tra backend…' : 'Upload thành draft'}
            </Button>
          </aside>
        </section>
      )}

      <section className="ui-card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Review & Publish</p>
            <h3 className="font-display text-xl">Các release Reward Pack</h3>
            <p className="text-sm text-muted">Duyệt nội dung trước; Publish là bước riêng và không thể sửa release sau đó.</p>
          </div>
          <Button variant="secondary" onClick={() => void load()} disabled={busy}>
            <RefreshCw className={`h-5 w-5 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" /> Làm mới
          </Button>
        </header>
        <div className="divide-y divide-border">
          {packs.length === 0 && <p className="p-8 text-center text-muted">Chưa có Reward Pack chờ quản lý.</p>}
          {packs.map((pack) => (
            <article key={pack.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-extrabold">{pack.manifest.pack.name}</h4>
                  <span className={`rounded-xl px-3 py-1 text-xs font-extrabold ${
                    pack.status === 'published' ? 'bg-mint-100 text-success'
                      : pack.status === 'approved' ? 'bg-sky-100 text-sky-800'
                        : 'bg-brand-50 text-brand-700'
                  }`}>{pack.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{pack.packId} · release {pack.release} · {pack.channel}</p>
                <p className="mt-2 text-sm">{pack.manifest.rewards.length} rewards · {pack.manifest.achievements?.length ?? 0} achievements · {pack.manifest.bundles?.length ?? 0} bundles</p>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-bold text-brand-700">Xem danh sách reward</summary>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {pack.manifest.rewards.map((reward) => <li key={reward.id} className="rounded-xl bg-page p-3"><strong>{reward.name}</strong><span className="block break-all text-xs text-muted">{reward.id} · {reward.kind}</span></li>)}
                  </ul>
                </details>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {pack.status === 'ready_for_review' && <Button disabled={busy} variant="secondary" onClick={() => setPendingAction({ kind: 'approve', pack })}><ShieldCheck className="h-5 w-5" aria-hidden="true" /> Approve</Button>}
                {pack.status === 'approved' && <Button disabled={busy} onClick={() => setPendingAction({ kind: 'publish', pack })}><Rocket className="h-5 w-5" aria-hidden="true" /> Publish</Button>}
                {pack.status === 'published' && <span className="flex min-h-11 items-center rounded-xl bg-mint-100 px-4 text-sm font-extrabold text-success"><CheckCircle2 className="mr-2 h-5 w-5" aria-hidden="true" /> Đã phát hành</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ui-card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h3 className="font-display text-xl">Lịch sử kiểm tra</h3>
            <p className="text-sm text-muted">Lỗi backend được giữ lại để admin đối chiếu theo pack và release.</p>
          </div>
          <Button variant="secondary" onClick={() => void load()}>
            <RefreshCw className="h-5 w-5" aria-hidden="true" /> Làm mới
          </Button>
        </header>
        <div className="divide-y divide-border">
          {uploads.length === 0 && <p className="p-8 text-center text-muted">Chưa có lần upload nào.</p>}
          {uploads.map((uploadRow) => (
            <article key={uploadRow.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-extrabold">{uploadRow.packId} · {uploadRow.release}</p>
                <p className="text-xs text-muted">{uploadRow.fileName} · {(Number(uploadRow.bytes) / 1024 / 1024).toFixed(2)} MB</p>
                {uploadRow.error && (
                  <p className="mt-2 rounded-xl bg-coral-50 p-3 text-sm font-bold text-danger">
                    {uploadRow.error}
                  </p>
                )}
              </div>
              <span className={`rounded-xl px-3 py-2 text-sm font-extrabold ${
                uploadRow.status === 'failed' ? 'bg-coral-50 text-danger'
                  : uploadRow.status === 'ready_for_review' ? 'bg-mint-100 text-success'
                    : 'bg-brand-50 text-brand-700'
              }`}>
                {uploadRow.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      {message && <p className="rounded-2xl bg-brand-50 p-4 text-sm font-bold text-brand-700" aria-live="polite">{message}</p>}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.kind === 'publish' ? 'Publish Reward Pack?' : 'Duyệt Reward Pack?'}
        description={pendingAction?.kind === 'publish'
          ? `Release ${pendingAction.pack.release} sẽ trở thành bất biến sau khi publish.`
          : 'Xác nhận manifest, reward và liên kết asset đã được kiểm tra trước khi duyệt.'}
        confirmLabel={pendingAction?.kind === 'publish' ? 'Publish release' : 'Approve'}
        onConfirm={() => void runPackAction()}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}
