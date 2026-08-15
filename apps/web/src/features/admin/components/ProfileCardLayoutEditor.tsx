import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Layers3, LockKeyhole, RotateCcw, Save, Unlock } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { legendStudioApi } from '@/shared/lib/gamification-api'
import { DEFAULT_PROFILE_CARD_LAYOUT, PROFILE_CARD_LAYOUT_CODE, normalizeProfileCardLayout, type ProfileCardLayout } from '@/features/profile/profile-card-layout'
import type { StudioItem } from './LegendRewardStudio'
import { EquippedProfile } from '@/features/rewards/EquippedProfile'
import type { User } from '@/shared/lib/api'
import type { RewardEquipment } from '@/features/rewards/reward-equipment'

const slotLabels: Record<keyof ProfileCardLayout['slots'], string> = { frame: 'Khung', avatar: 'Avatar', effect: 'Hiệu ứng', companion: 'Bạn đồng hành', name: 'Tên', level: 'Cấp', title: 'Danh hiệu' }
const centeredAvatarPreview = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="128" fill="#dbeafe"/><circle cx="128" cy="105" r="52" fill="#f6c89f"/><path d="M72 104c0-67 112-72 112 2-25-3-46-19-58-38-11 22-31 34-54 36Z" fill="#4338ca"/><circle cx="108" cy="108" r="6" fill="#1e293b"/><circle cx="148" cy="108" r="6" fill="#1e293b"/><path d="M108 137c13 13 28 13 41 0" fill="none" stroke="#b45309" stroke-width="6" stroke-linecap="round"/><path d="M55 256c5-63 39-92 73-92s68 29 73 92" fill="#60a5fa"/></svg>')}`
const previewUser: User = { id: 'profile-layout-preview', role: 'student', email: null, name: 'Bo', nickname: 'Bo', avatarId: centeredAvatarPreview, level: 12, xp: 3200, onboarded: true, goal: null, parentId: null, classId: null }
const previewEquipment: RewardEquipment = { frame: 'frame-rainbow', companion: 'avatar-paco-blue', effect: 'perk-sticker-sparkle', title: 'title-first-light' }

export function ProfileCardLayoutEditor({ item, onChanged }: { item?: StudioItem; onChanged: () => Promise<void> }) {
  const [layout, setLayout] = useState<ProfileCardLayout>(DEFAULT_PROFILE_CARD_LAYOUT)
  const [selectedSlot, setSelectedSlot] = useState<keyof ProfileCardLayout['slots']>('frame')
  const [selectionLocked, setSelectionLocked] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ slot: keyof ProfileCardLayout['slots']; x: number; y: number; baseX: number; baseY: number } | undefined>(undefined)
  const pendingDragRef = useRef<{ x: number; y: number } | undefined>(undefined)
  const animationFrameRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    const saved = item?.displayConfig.profileCardLayout as ProfileCardLayout | undefined
    setLayout(normalizeProfileCardLayout(saved))
  }, [item])
  useEffect(() => () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current) }, [])
  const slot = layout.slots[selectedSlot]
  const selectedBinding = selectedSlot === 'avatar' ? 'avatarToFrame' : selectedSlot === 'effect' ? 'effectToFrame' : selectedSlot === 'companion' ? 'companionToFrame' : undefined
  const isBound = selectedBinding ? layout.bindings[selectedBinding] : false
  const patchSlot = (patch: Partial<typeof slot>) => setLayout((current) => {
    const slots = { ...current.slots, [selectedSlot]: { ...current.slots[selectedSlot], ...patch } }
    if (selectedSlot === 'frame' && ('offsetXPercent' in patch || 'offsetYPercent' in patch)) {
      const offsetXPercent = Number(patch.offsetXPercent ?? slots.frame.offsetXPercent)
      const offsetYPercent = Number(patch.offsetYPercent ?? slots.frame.offsetYPercent)
      if (current.bindings.avatarToFrame) slots.avatar = { ...slots.avatar, offsetXPercent, offsetYPercent }
      if (current.bindings.effectToFrame) slots.effect = { ...slots.effect, offsetXPercent, offsetYPercent }
      if (current.bindings.companionToFrame) slots.companion = { ...slots.companion, offsetXPercent, offsetYPercent }
    }
    return { ...current, slots }
  })
  const beginCanvasDrag = (event: React.PointerEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-profile-slot]')
    const hitSlot = target?.dataset.profileSlot as keyof ProfileCardLayout['slots'] | undefined
    const key = selectionLocked ? selectedSlot : hitSlot
    if (!key || !(key in layout.slots)) return
    event.preventDefault()
    if (!selectionLocked) setSelectedSlot(key)
    const binding = key === 'avatar' ? layout.bindings.avatarToFrame : key === 'effect' ? layout.bindings.effectToFrame : key === 'companion' ? layout.bindings.companionToFrame : false
    if (binding) return
    canvasRef.current?.setPointerCapture(event.pointerId)
    const current = layout.slots[key]
    dragRef.current = { slot: key, x: event.clientX, y: event.clientY, baseX: current.offsetXPercent, baseY: current.offsetYPercent }
  }
  const moveDrag = (event: React.PointerEvent) => {
    const drag = dragRef.current; const bounds = canvasRef.current?.getBoundingClientRect()
    if (!drag || !bounds) return
    pendingDragRef.current = { x: event.clientX, y: event.clientY }
    if (animationFrameRef.current) return
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = undefined
      const pending = pendingDragRef.current
      if (!pending) return
      const rawX = Math.round(drag.baseX + ((pending.x - drag.x) / bounds.width) * 100)
      const rawY = Math.round(drag.baseY + ((pending.y - drag.y) / bounds.height) * 100)
      const snap = (value: number) => Math.abs(value) <= 3 ? 0 : Math.round(value / 2) * 2
      const offsetXPercent = Math.max(-30, Math.min(30, snap(rawX)))
      const offsetYPercent = Math.max(-30, Math.min(30, snap(rawY)))
      setLayout((current) => {
        const slots = { ...current.slots, [drag.slot]: { ...current.slots[drag.slot], offsetXPercent, offsetYPercent } }
        if (drag.slot === 'frame') {
          if (current.bindings.avatarToFrame) slots.avatar = { ...slots.avatar, offsetXPercent, offsetYPercent }
          if (current.bindings.effectToFrame) slots.effect = { ...slots.effect, offsetXPercent, offsetYPercent }
          if (current.bindings.companionToFrame) slots.companion = { ...slots.companion, offsetXPercent, offsetYPercent }
        }
        return { ...current, slots }
      })
    })
  }
  const save = async () => {
    setBusy(true); setMessage('')
    try {
      const updatesDraft = item && (item.status === 'draft' || item.status === 'review')
      const payload = {
          contentType: 'reward', code: PROFILE_CARD_LAYOUT_CODE, name: 'Profile Card Layout',
          description: 'Cấu hình bố cục dùng chung cho mọi Profile Card.', kind: 'theme', rarity: 'common', assets: {},
          displayConfig: { systemConfig: true, profileCardLayout: layout },
          unlockRule: { type: 'system_config', value: 'profile_card_layout' }, content: { systemConfig: 'profile_card_layout' },
        }
      if (updatesDraft) await legendStudioApi.update(item.id, payload)
      else await legendStudioApi.create(payload)
      setMessage(updatesDraft ? 'Đã cập nhật bản nháp layout.' : 'Đã tạo bản nháp layout mới; bản đang phát hành vẫn được giữ nguyên.')
      await onChanged()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không lưu được Profile Card layout.') }
    finally { setBusy(false) }
  }
  const transition = async (action: 'review' | 'publish') => {
    if (!item) return
    setBusy(true)
    try {
      if (action === 'review') await legendStudioApi.update(item.id, { status: 'review' })
      else await legendStudioApi.transition(item.id, 'publish')
      await onChanged(); setMessage(action === 'review' ? 'Đã gửi reviewer kiểm tra layout.' : 'Đã phát hành Profile Card layout.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không đổi được trạng thái layout.') }
    finally { setBusy(false) }
  }
  return <section className="grid items-start gap-5 xl:grid-cols-[420px_minmax(640px,1fr)]">
    <div className="ui-card space-y-5 p-5">
      <div><p className="text-xs font-black uppercase tracking-wider text-sky-700">Cấu hình dùng chung</p><h2 className="font-display text-2xl">Profile Card Editor</h2><p className="text-sm text-muted">Asset chỉ chứa artwork. Kích thước và vị trí các lớp được quản lý một lần tại đây.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold">Chiều rộng canvas<input type="number" min="640" max="1400" className="field-input mt-2 min-h-12 w-full" value={layout.canvasWidth} onChange={(event) => setLayout({ ...layout, canvasWidth: Number(event.target.value) })} /></label>
        <label className="text-sm font-bold">Chiều cao canvas<input type="number" min="180" max="600" className="field-input mt-2 min-h-12 w-full" value={layout.canvasHeight} onChange={(event) => setLayout({ ...layout, canvasHeight: Number(event.target.value) })} /></label>
      </div>
      <div className="rounded-2xl border border-border bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="text-sm font-extrabold">Danh sách layer</h3><p className="text-xs text-muted">Chọn tại đây để không nhầm lớp đang chồng nhau.</p></div>
          <button type="button" aria-pressed={selectionLocked} onClick={() => setSelectionLocked((current) => !current)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${selectionLocked ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-muted'}`}>
            {selectionLocked ? <LockKeyhole className="h-4 w-4" aria-hidden="true" /> : <Unlock className="h-4 w-4" aria-hidden="true" />}
            {selectionLocked ? 'Đã khóa chọn' : 'Chọn trên canvas'}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(Object.keys(slotLabels) as Array<keyof typeof slotLabels>)
            .sort((left, right) => layout.slots[right].layer - layout.slots[left].layer)
            .map((key) => <button key={key} type="button" onClick={() => setSelectedSlot(key)} aria-pressed={selectedSlot === key} className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-left text-sm font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${selectedSlot === key ? 'border-sky-500 bg-sky-600 text-white' : 'border-border bg-slate-50 text-muted hover:bg-brand-50'}`}><span>{slotLabels[key]}</span><span className={`text-xs ${selectedSlot === key ? 'text-white/80' : 'text-muted'}`}>L{layout.slots[key].layer}</span></button>)}
        </div>
      </div>
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4">
        <h3 className="font-extrabold">{slotLabels[selectedSlot]}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {([['scalePercent', 'Kích thước', 50, 160], ['offsetXPercent', 'Dịch ngang', -30, 30], ['offsetYPercent', 'Dịch dọc', -30, 30]] as const).map(([key, label, min, max]) => <label key={key} className={`text-xs font-bold ${isBound && key !== 'scalePercent' ? 'opacity-50' : ''}`}>{label}<input disabled={isBound && key !== 'scalePercent'} type="range" min={min} max={max} step={key === 'scalePercent' ? 5 : 2} value={slot[key]} onChange={(event) => patchSlot({ [key]: Number(event.target.value) })} className="mt-3 w-full" /><output className="mt-1 block text-center font-black">{slot[key]}%</output></label>)}
        </div>
        {selectedBinding && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-white px-3 text-sm font-extrabold"><input type="checkbox" checked={layout.bindings[selectedBinding]} onChange={(event) => {
          const checked = event.target.checked
          setLayout((current) => ({ ...current, bindings: { ...current.bindings, [selectedBinding]: checked }, slots: checked ? { ...current.slots, [selectedSlot]: { ...current.slots[selectedSlot], offsetXPercent: current.slots.frame.offsetXPercent, offsetYPercent: current.slots.frame.offsetYPercent } } : current.slots }))
        }} /> Gắn {slotLabels[selectedSlot]} vào tâm Khung</label>}
        <button type="button" className="mt-3 min-h-10 rounded-xl px-3 text-xs font-extrabold text-sky-800 hover:bg-white" onClick={() => patchSlot({ offsetXPercent: 0, offsetYPercent: 0 })}>Căn giữa thành phần</button>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3"><Layers3 className="h-5 w-5 text-sky-700" /><label className="flex flex-1 items-center gap-3 text-xs font-bold">Thứ tự layer<input type="number" min="0" max="100" className="field-input min-h-10 w-24" value={slot.layer} onChange={(event) => patchSlot({ layer: Number(event.target.value) })} /></label><span className="text-xs text-muted">Số lớn nằm trên</span></div>
      </div>
      <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => { setLayout(structuredClone(DEFAULT_PROFILE_CARD_LAYOUT)); setSelectedSlot('avatar'); setMessage('Đã khôi phục preset chuẩn: Avatar và Effect được gắn tâm vào Frame.') }}><RotateCcw className="h-4 w-4" /> Khôi phục preset chuẩn</Button><Button disabled={busy} onClick={() => void save()}><Save className="h-4 w-4" /> {item?.status === 'published' ? 'Lưu thành bản nháp mới' : 'Lưu layout'}</Button>{item?.status === 'draft' && <Button variant="secondary" onClick={() => void transition('review')}>Gửi duyệt</Button>}{item?.status === 'review' && <Button onClick={() => void transition('publish')}>Phát hành</Button>}</div>
      {message && <p className="rounded-xl bg-brand-50 p-3 text-sm font-bold text-brand-700">{message}</p>}
    </div>
    <aside className="ui-card sticky top-5 p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase text-sky-700">Preview chung</p><h3 className="font-display text-xl">Profile Card</h3></div><span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-black text-success"><CheckCircle2 className="mr-1 inline h-4 w-4" />{item?.status ?? 'chưa lưu'}</span></div>
      <p className="mt-3 rounded-xl bg-sky-50 p-3 text-xs font-bold text-sky-900">{selectionLocked ? `Đang khóa ${slotLabels[selectedSlot]}: kéo ở bất kỳ đâu trên canvas chỉ di chuyển layer này.` : 'Chạm một thành phần để chọn và kéo. Nếu các layer chồng nhau, hãy chọn chính xác trong Danh sách layer.'}</p>
      <div ref={canvasRef} onPointerDownCapture={beginCanvasDrag} onPointerMove={moveDrag} onPointerUp={() => { dragRef.current = undefined }} onPointerCancel={() => { dragRef.current = undefined }} className="mx-auto mt-5 flex select-none items-center overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-violet-100 via-sky-50 to-amber-50 p-6 shadow-clay" style={{ aspectRatio: `${layout.canvasWidth}/${layout.canvasHeight}`, width: '100%', maxWidth: layout.canvasWidth, touchAction: 'none' }}>
        <EquippedProfile user={previewUser} xp={previewUser.xp} level={previewUser.level} compact equipment={previewEquipment} layoutOverride={layout} editorSelectedSlot={selectedSlot} />
      </div>
    </aside>
  </section>
}
