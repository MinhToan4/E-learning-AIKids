import { useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { NavBackpackIcon } from '@/shared/components/icons/KidNavIcons'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { uploadProfileAvatar } from '@/shared/lib/media-api'
import type { ProfileAvatar } from '../profile-showcase'

export function AvatarPickerModal({
  choices,
  onChoose,
  onClose,
}: {
  choices: ProfileAvatar[]
  onChoose: (avatar: ProfileAvatar) => Promise<void>
  onClose: () => void
}) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadStage, setUploadStage] = useState<
    'creating_session' | 'uploading' | 'processing' | null
  >(null)

  const chooseAvatar = async (avatar: ProfileAvatar) => {
    setUploading(true)
    setMessage('')
    try {
      await onChoose(avatar)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được ảnh đại diện.')
    } finally {
      setUploading(false)
    }
  }

  const uploadFile = async (
    file: File | undefined,
    input: HTMLInputElement,
  ) => {
    if (!file) return
    setUploading(true)
    setMessage('')
    try {
      const asset = await uploadProfileAvatar(file, {
        onStage: setUploadStage,
      })
      await onChoose({
        id: asset.id,
        mediaId: asset.mediaId,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        label: file.name || 'Ảnh của con',
        source: 'upload',
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được ảnh đại diện.')
    } finally {
      setUploading(false)
      setUploadStage(null)
      input.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-picker-title"
        className="aikid-flat-modal max-h-[85vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative flex items-start justify-between gap-3">
          <div className="pr-4 sm:pr-28">
            <p className="text-sm font-extrabold text-coral-700">Ảnh đại diện</p>
            <h2 id="avatar-picker-title" className="font-display text-3xl">Chọn ảnh của con</h2>
            <p className="text-sm text-muted">Ảnh chỉ dùng cho hồ sơ; chia sẻ công khai vẫn theo quyền phụ huynh.</p>
          </div>
          <AikidCatCharacter pose="thinking" className="pointer-events-none absolute right-12 -top-3 hidden w-24 sm:block" />
          <button type="button" onClick={onClose} className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-coral-400 text-xl font-black text-white" aria-label="Đóng">×</button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button type="button" disabled={uploading} onClick={() => cameraRef.current?.click()} className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-left disabled:cursor-wait disabled:opacity-60">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sky-600"><Camera size={22} aria-hidden="true" /></span>
            <span className="mt-2 block font-extrabold">Chụp ảnh</span>
            <span className="text-xs text-muted">Mở camera thiết bị</span>
          </button>
          <button type="button" disabled={uploading} onClick={() => uploadRef.current?.click()} className="rounded-2xl border border-mint-200 bg-mint-50 p-4 text-left disabled:cursor-wait disabled:opacity-60">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-mint-700"><Upload size={22} aria-hidden="true" /></span>
            <span className="mt-2 block font-extrabold">Tải ảnh lên</span>
            <span className="text-xs text-muted">Chọn từ thiết bị</span>
          </button>
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700"><NavBackpackIcon size={24} aria-hidden="true" /></span>
            <span className="mt-2 block font-extrabold">Ảnh trong Ba lô</span>
            <span className="text-xs text-muted">{choices.length} ảnh khả dụng</span>
          </div>
        </div>
        <input ref={cameraRef} type="file" accept="image/jpeg,image/png,image/webp" capture="user" className="hidden" onChange={(event) => void uploadFile(event.target.files?.[0], event.currentTarget)} />
        <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void uploadFile(event.target.files?.[0], event.currentTarget)} />
        <p className="mt-3 min-h-5 text-sm font-bold text-muted" role="status" aria-live="polite">
          {uploading
            ? uploadStage === 'processing'
              ? 'Đang kiểm tra an toàn và tạo ảnh đại diện…'
              : uploadStage === 'uploading'
                ? 'Đang gửi ảnh tới kho lưu trữ…'
                : 'Đang tạo phiên upload an toàn…'
            : message}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {choices.map((choice) => (
            <button key={choice.id} type="button" disabled={uploading} onClick={() => void chooseAvatar(choice)} className="rounded-2xl border-2 border-border p-2 hover:border-brand-500 disabled:opacity-60">
              <img src={choice.thumbnailUrl ?? choice.url} alt="" loading="lazy" decoding="async" className="aspect-square w-full rounded-xl object-cover" />
              <span className="mt-1 block truncate text-xs font-extrabold">{choice.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
