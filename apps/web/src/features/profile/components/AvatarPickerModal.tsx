import { useRef } from 'react'
import type { ProfileAvatar } from '../profile-showcase'

export function AvatarPickerModal({
  choices,
  onChoose,
  onClose,
}: {
  choices: ProfileAvatar[]
  onChoose: (avatar: ProfileAvatar) => void
  onClose: () => void
}) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const readFile = (file: File | undefined, source: ProfileAvatar['source']) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChoose({
        id: `local-${Date.now()}`,
        url: String(reader.result ?? ''),
        label: file.name || 'Ảnh của con',
        source,
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-picker-title"
        className="ui-card max-h-[85vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Ảnh đại diện</p>
            <h2 id="avatar-picker-title" className="font-display text-3xl">Chọn ảnh của con</h2>
            <p className="text-sm text-muted">Ảnh chỉ dùng cho hồ sơ; chia sẻ công khai vẫn theo quyền phụ huynh.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 font-black" aria-label="Đóng">×</button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => cameraRef.current?.click()} className="rounded-2xl bg-sky-50 p-4 text-left">
            <span className="text-3xl">📷</span>
            <span className="mt-2 block font-extrabold">Chụp ảnh</span>
            <span className="text-xs text-muted">Mở camera thiết bị</span>
          </button>
          <button type="button" onClick={() => uploadRef.current?.click()} className="rounded-2xl bg-mint-50 p-4 text-left">
            <span className="text-3xl">⬆️</span>
            <span className="mt-2 block font-extrabold">Tải ảnh lên</span>
            <span className="text-xs text-muted">Chọn từ thiết bị</span>
          </button>
          <div className="rounded-2xl bg-brand-50 p-4 text-left">
            <span className="text-3xl">🎒</span>
            <span className="mt-2 block font-extrabold">Ảnh trong Ba lô</span>
            <span className="text-xs text-muted">{choices.length} ảnh khả dụng</span>
          </div>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(event) => readFile(event.target.files?.[0], 'upload')} />
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={(event) => readFile(event.target.files?.[0], 'upload')} />

        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => onChoose(choice)} className="rounded-2xl border-2 border-border p-2 hover:border-brand-500">
              <img src={choice.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
              <span className="mt-1 block truncate text-xs font-extrabold">{choice.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
