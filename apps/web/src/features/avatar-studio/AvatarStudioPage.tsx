import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Shuffle } from 'lucide-react'
import { uploadProfileAvatar, updateMyProfileAvatar } from '@/shared/lib/media-api'
import { useAuth } from '@/shared/store/auth'
import { saveProfileAvatar } from '@/features/profile/profile-showcase'
import { CLAY_READY_CATEGORIES, LayeredClayAvatar, renderLayeredClayAvatar } from './LayeredClayAvatar'
import {
  AVATAR_CATEGORIES,
  AVATAR_OPTION_COUNTS,
  DEFAULT_AVATAR_SELECTION,
  randomAvatarSelection,
  type AvatarCategory,
  type AvatarSelection,
} from './avatar-options'

export function AvatarStudioPage() {
  const user = useAuth((state) => state.user)
  const navigate = useNavigate()
  const [category, setCategory] = useState<AvatarCategory>('hair')
  const [selection, setSelection] = useState<AvatarSelection>(DEFAULT_AVATAR_SELECTION)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const save = async () => {
    if (!user || saving) return
    setSaving(true)
    setMessage('Đang tạo ảnh đại diện…')
    try {
      const asset = await uploadProfileAvatar(await renderLayeredClayAvatar(selection), {
        onStage: (stage) => setMessage(stage === 'processing' ? 'Đang kiểm tra an toàn…' : 'Đang lưu ảnh đại diện…'),
      })
      const avatar = {
        id: asset.id,
        mediaId: asset.mediaId,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        label: 'Mee do con thiết kế',
        source: 'generated' as const,
      }
      await updateMyProfileAvatar(avatar)
      saveProfileAvatar(user.id, avatar)
      useAuth.getState().setUser({ ...user, avatarId: avatar.url })
      navigate('/profile', { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chưa lưu được avatar. Con thử lại nhé.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-2.5rem)] rounded-[2rem] bg-brand-50 p-4 shadow-soft sm:p-6">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <Link to="/profile" className="inline-flex min-h-11 items-center rounded-2xl bg-white px-4 font-extrabold text-brand-700 shadow-soft">← Hồ sơ</Link>
        <div className="text-right">
          <h1 className="font-display text-3xl text-text sm:text-4xl">Xưởng tạo Mee</h1>
          <p className="text-sm font-bold text-muted">Phối một nhân vật thật giống phong cách của con.</p>
        </div>
      </header>

      <div className="mx-auto mt-5 grid max-w-6xl gap-5 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(28rem,1.15fr)]">
        <section className="relative flex min-h-[31rem] items-center justify-center overflow-hidden rounded-[2rem] bg-sky-100 p-4" aria-label="Xem trước avatar">
          <div className="absolute inset-x-8 top-7 flex justify-between" aria-hidden="true"><span className="h-16 w-16 rounded-full bg-sun-300/60" /><span className="mt-16 h-12 w-12 rounded-full bg-mint-300/60" /></div>
          <LayeredClayAvatar selection={selection} className="relative h-[29rem] max-w-full drop-shadow-xl" />
          <button type="button" onClick={() => setSelection(randomAvatarSelection())} className="absolute bottom-5 right-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 font-extrabold text-brand-700 shadow-press focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            <Shuffle size={20} aria-hidden="true" /> Ngẫu nhiên
          </button>
        </section>

        <section className="overflow-hidden rounded-[2rem] bg-white shadow-clay" aria-labelledby="wardrobe-title">
          <h2 id="wardrobe-title" className="sr-only">Tủ đồ avatar</h2>
          <div className="flex overflow-x-auto border-b border-border p-2" role="tablist" aria-label="Danh mục tạo avatar">
            {AVATAR_CATEGORIES.filter((item) => CLAY_READY_CATEGORIES.includes(item.id as typeof CLAY_READY_CATEGORIES[number])).map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={category === item.id} onClick={() => setCategory(item.id)} className={`min-h-12 shrink-0 rounded-xl px-3 text-sm font-extrabold transition-colors ${category === item.id ? 'bg-brand-100 text-brand-700' : 'text-muted hover:bg-brand-50'}`}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-6">
            <p className="font-display text-2xl text-text">{AVATAR_CATEGORIES.find((item) => item.id === category)?.label}</p>
            <p className="mt-1 text-sm font-bold text-muted">Chạm vào một mẫu để xem ngay trên nhân vật.</p>
            <div className="mt-5 grid grid-cols-3 gap-3" role="group" aria-label={`Các mẫu ${category}`}>
              {Array.from({ length: AVATAR_OPTION_COUNTS[category] }, (_, option) => (
                <button key={option} type="button" aria-pressed={selection[category] === option} aria-label={`${AVATAR_CATEGORIES.find((item) => item.id === category)?.label} mẫu ${option + 1}`} onClick={() => setSelection({ ...selection, [category]: option })} className={`relative aspect-square min-h-20 rounded-3xl border-2 transition-transform motion-reduce:transform-none ${selection[category] === option ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-200' : 'border-border bg-slate-50 hover:-translate-y-0.5 hover:border-brand-300'}`}>
                  <LayeredClayAvatar selection={{ ...selection, [category]: option }} className="mx-auto h-full max-h-28 w-full rounded-2xl" />
                  {option === 0 && (category === 'accessory' || category === 'hat') && <span className="absolute inset-x-0 bottom-2 text-xs font-extrabold text-muted">Không dùng</span>}
                </button>
              ))}
            </div>
            <button type="button" disabled={saving} onClick={() => void save()} className="mt-6 min-h-12 w-full rounded-2xl bg-brand-600 px-5 font-extrabold text-white shadow-press hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60">
              {saving ? 'Đang lưu…' : 'Lưu avatar của con'}
            </button>
            <p className="mt-3 min-h-6 text-center text-sm font-bold text-muted" role="status" aria-live="polite">{message}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
