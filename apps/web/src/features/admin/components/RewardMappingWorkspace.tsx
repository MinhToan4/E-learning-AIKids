import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, ChevronDown, Gift, History, Link2, MoreHorizontal, Pencil, Plus, Search, Send, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ApiError } from '@/shared/lib/api'
import { legendStudioApi, rewardMappingApi, type RewardMapping, type RewardRequirementType } from '@/shared/lib/gamification-api'
import { ACHIEVEMENT_METRIC_REGISTRY } from '@/features/achievements/achievement-config'
import type { StudioItem } from './LegendRewardStudio'

type Props = { items: StudioItem[]; onChanged: () => Promise<void>; getArtwork?: (item: StudioItem) => string | undefined; builderOnly?: boolean; initialLevel?: number }
type DependencyReport = { canDelete: boolean; references: Array<{ type: string; label: string }> }
type AuditEntry = { id: string; action: string; actorName?: string; createdAt: string; summary?: string }
type RequirementForm = { type: RewardRequirementType; metric: string; operator: 'gte' | 'eq'; value: string; chapter: string }
type WorkspaceMapping = RewardMapping & { compatItemIds?: string[] }

const requirementLabels: Record<RewardRequirementType, string> = {
  xp_level: 'Level', action: 'Action / metric', storybook_sticker: 'Sticker Book', event: 'Sự kiện', achievement: 'Achievement',
}

export function rewardRequirementSentence(mapping: Pick<RewardMapping, 'requirement' | 'rewardIds'>): string {
  const { requirement } = mapping
  const rewardCount = mapping.rewardIds.length
  const rewardText = `${rewardCount} phần quà`
  if (requirement.type === 'xp_level') return `Khi học sinh đạt Level ${requirement.value}, trao ${rewardText}.`
  if (requirement.type === 'action') return `Khi ${requirement.metric || 'action'} ${requirement.operator === 'eq' ? '=' : '≥'} ${requirement.value}, trao ${rewardText}.`
  if (requirement.type === 'storybook_sticker') return `Khi nhận sticker ${requirement.value}${requirement.chapter ? ` thuộc ${requirement.chapter}` : ''}, trao ${rewardText}.`
  if (requirement.type === 'event') return `Khi hoàn thành sự kiện ${requirement.value}, trao ${rewardText}.`
  return `Khi đạt achievement ${requirement.value}, trao ${rewardText}.`
}

const emptyRequirement: RequirementForm = { type: 'xp_level', metric: 'lessons_completed', operator: 'gte', value: '1', chapter: '' }

function requirementFromItem(item: StudioItem): RewardMapping['requirement'] | undefined {
  const type = String(item.unlockRule.type ?? '') as RewardRequirementType
  if (!['xp_level', 'action', 'storybook_sticker', 'event', 'achievement'].includes(type)) return undefined
  return {
    type,
    metric: typeof item.unlockRule.metric === 'string' ? item.unlockRule.metric : undefined,
    operator: item.unlockRule.operator === 'eq' ? 'eq' : 'gte',
    value: type === 'xp_level' ? Number(item.unlockRule.value) : String(item.unlockRule.value ?? ''),
    chapter: typeof item.unlockRule.chapter === 'string' ? item.unlockRule.chapter : undefined,
  }
}

export function compatibilityMappings(items: StudioItem[]): WorkspaceMapping[] {
  const groups = new Map<string, WorkspaceMapping>()
  for (const item of items) {
    if (item.contentType !== 'reward' || item.source !== 'studio') continue
    const requirement = requirementFromItem(item)
    if (!requirement) continue
    const key = `${item.status}:${JSON.stringify(requirement)}`
    const current = groups.get(key)
    if (current) {
      current.rewardIds.push(item.code)
      current.compatItemIds?.push(item.id)
      current.version = Math.max(current.version, item.version)
    } else {
      groups.set(key, { id: `compat:${key}`, name: `${requirementLabels[requirement.type]} · ${String(requirement.value)}`, status: item.status, version: item.version, requirement, rewardIds: [item.code], compatItemIds: [item.id] })
    }
  }
  return [...groups.values()]
}

function studioRewardPayload(item: StudioItem, requirement: RewardMapping['requirement']) {
  return {
    contentType: item.contentType,
    code: item.code,
    name: item.name,
    description: item.description,
    kind: item.kind,
    rarity: item.rarity,
    assets: item.assets,
    displayConfig: item.displayConfig,
    unlockRule: { type: requirement.type, metric: requirement.metric, operator: requirement.operator, value: requirement.value, chapter: requirement.chapter },
    content: item.content,
  }
}

export function RewardMappingWorkspace({ items, onChanged, getArtwork, builderOnly = false, initialLevel }: Props) {
  const [mappings, setMappings] = useState<WorkspaceMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [compatibilityMode, setCompatibilityMode] = useState(false)
  const [editing, setEditing] = useState<WorkspaceMapping | null>(null)
  const [name, setName] = useState(initialLevel ? `Quà Level ${initialLevel}` : '')
  const [requirement, setRequirement] = useState<RequirementForm>(initialLevel ? { ...emptyRequirement, value: String(initialLevel) } : emptyRequirement)
  const [rewardIds, setRewardIds] = useState<string[]>([])
  const [pendingDelete, setPendingDelete] = useState<{ mapping: WorkspaceMapping; report: DependencyReport } | null>(null)
  const [audit, setAudit] = useState<{ mappingId: string; entries: AuditEntry[] } | null>(null)
  const [direction, setDirection] = useState<'requirement' | 'reward'>('requirement')
  const [query, setQuery] = useState('')
  const [builderOpen, setBuilderOpen] = useState(builderOnly)
  const [levelPickerMode, setLevelPickerMode] = useState<'unassigned' | 'move'>('unassigned')
  const [rewardQuery, setRewardQuery] = useState('')

  useEffect(() => {
    if (!initialLevel) return
    setEditing(null)
    setName(`Quà Level ${initialLevel}`)
    setRequirement({ ...emptyRequirement, value: String(initialLevel) })
    setRewardIds([])
    setLevelPickerMode('unassigned')
    setRewardQuery('')
    setBuilderOpen(true)
  }, [initialLevel])

  const rewards = useMemo(() => {
    const byCode = new Map<string, StudioItem>()
    for (const item of items.filter((entry) => entry.contentType === 'reward' && (entry.status === 'published' || entry.status === 'draft'))) {
      const current = byCode.get(item.code)
      if (!current || item.status === 'draft' || item.version > current.version) byCode.set(item.code, item)
    }
    return [...byCode.values()].sort((left, right) => left.name.localeCompare(right.name, 'vi'))
  }, [items])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await rewardMappingApi.list()
      setMappings(result.mappings ?? [])
      setCompatibilityMode(false)
    } catch (error) {
      const useCompatibility = error instanceof ApiError && [404, 405, 501].includes(error.status)
      setCompatibilityMode(useCompatibility)
      if (useCompatibility) setMappings(compatibilityMappings(items))
      setMessage(useCompatibility
        ? 'Đang dùng chế độ tương thích với Legend Studio. Mapping được lưu thật vào unlockRule của version reward, không lưu giả lập.'
        : error instanceof Error ? error.message : 'Không tải được mapping.')
    } finally { setLoading(false) }
  }, [items])

  useEffect(() => { void load() }, [load])

  const resetForm = () => {
    setEditing(null); setName(initialLevel ? `Quà Level ${initialLevel}` : ''); setRequirement(initialLevel ? { ...emptyRequirement, value: String(initialLevel) } : emptyRequirement); setRewardIds([]); setBuilderOpen(builderOnly)
  }

  const editMapping = (mapping: WorkspaceMapping) => {
    setEditing(mapping)
    setName(mapping.name)
    setRequirement({
      type: mapping.requirement.type,
      metric: mapping.requirement.metric ?? 'lessons_completed',
      operator: mapping.requirement.operator ?? 'gte',
      value: String(mapping.requirement.value),
      chapter: mapping.requirement.chapter ?? '',
    })
    setRewardIds(mapping.rewardIds)
    setBuilderOpen(true)
  }

  const save = async (publishNow = false) => {
    if (!name.trim() || !String(requirement.value).trim() || rewardIds.length === 0) {
      setMessage('Mapping cần tên, requirement và ít nhất một phần quà.')
      return
    }
    setBusy(true)
    try {
      const payload = { name: name.trim(), requirement: { ...requirement, value: requirement.type === 'xp_level' ? Number(requirement.value) : requirement.value }, rewardIds }
      if (compatibilityMode) {
        if (editing?.status === 'draft' && editing.compatItemIds) {
          const removedIds = editing.compatItemIds.filter((id) => {
            const item = items.find((entry) => entry.id === id)
            return item && !rewardIds.includes(item.code)
          })
          for (const id of removedIds) await legendStudioApi.update(id, { unlockRule: { type: 'unconfigured', value: '' } })
        }
        const publishIds: string[] = []
        for (const rewardId of rewardIds) {
          const item = rewards.find((entry) => entry.code === rewardId)
          if (!item) continue
          if (item.source === 'studio' && (item.status === 'draft' || item.status === 'review')) {
            await legendStudioApi.update(item.id, studioRewardPayload(item, payload.requirement))
            publishIds.push(item.id)
          } else {
            const result = await legendStudioApi.create<{ item?: StudioItem; id?: string }>(studioRewardPayload(item, payload.requirement))
            const createdId = result.item?.id ?? result.id
            if (createdId) publishIds.push(createdId)
          }
        }
        if (publishNow) {
          if (publishIds.length !== rewardIds.length) throw new Error('Đã lưu draft nhưng Hub chưa trả đủ ID để publish. Mở Bản đồ cấu hình và chọn “Phát hành nháp”.')
          for (const id of publishIds) await legendStudioApi.transition(id, 'publish')
        }
        setMessage(publishNow ? 'Đã lưu và phát hành mapping qua Legend Studio.' : 'Đã lưu mapping vào các version reward nháp.')
        resetForm()
        await onChanged()
        return
      }
      const result = editing
        ? await rewardMappingApi.update(editing.id, payload)
        : await rewardMappingApi.create(payload)
      const mappingId = editing?.id ?? result.mapping.id
      if (publishNow) await rewardMappingApi.transition(mappingId, 'publish')
      setMessage(publishNow ? 'Đã lưu và phát hành mapping.' : editing ? 'Đã cập nhật bản nháp mapping.' : 'Đã tạo bản nháp mapping.')
      resetForm()
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không lưu được mapping.') }
    finally { setBusy(false) }
  }

  const transition = async (mapping: WorkspaceMapping, action: 'review' | 'publish' | 'retire' | 'revert-to-draft') => {
    setBusy(true)
    try {
      if (compatibilityMode && mapping.compatItemIds) {
        for (const id of mapping.compatItemIds) {
          if (action === 'review') await legendStudioApi.update(id, { status: 'review' })
          else if (action === 'revert-to-draft') await legendStudioApi.revertToDraft(id)
          else if (action === 'publish') await legendStudioApi.transition(id, 'publish')
          else throw new Error('Chế độ tương thích không ngừng toàn bộ reward khi chỉ muốn gỡ mapping. Hãy tạo version mapping thay thế.')
        }
        setMessage(action === 'publish' ? 'Đã phát hành các reward trong mapping.' : action === 'review' ? 'Đã gửi các reward để duyệt.' : 'Đã trả các reward về bản nháp.')
        await onChanged()
        return
      }
      await rewardMappingApi.transition(mapping.id, action)
      setMessage(action === 'publish' ? 'Đã phát hành luật trao thưởng.' : action === 'review' ? 'Đã gửi mapping để duyệt.' : action === 'retire' ? 'Đã ngừng luật trao thưởng.' : 'Đã trả mapping về bản nháp.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không đổi được trạng thái mapping.') }
    finally { setBusy(false) }
  }

  const inspectDelete = async (mapping: WorkspaceMapping) => {
    setBusy(true)
    try {
      if (compatibilityMode && mapping.compatItemIds) {
        setPendingDelete({ mapping, report: { canDelete: mapping.status === 'draft', references: [] } })
        return
      }
      const report = await rewardMappingApi.dependencies<DependencyReport>(mapping.id)
      setPendingDelete({ mapping, report })
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không kiểm tra được liên kết; hệ thống không cho phép xóa.') }
    finally { setBusy(false) }
  }

  const remove = async () => {
    if (!pendingDelete?.report.canDelete) return
    setBusy(true)
    try {
      if (compatibilityMode && pendingDelete.mapping.compatItemIds) {
        for (const id of pendingDelete.mapping.compatItemIds) await legendStudioApi.update(id, { unlockRule: { type: 'unconfigured', value: '' } })
        await onChanged()
      } else {
        await rewardMappingApi.remove(pendingDelete.mapping.id)
        await load()
      }
      setPendingDelete(null)
      setMessage(compatibilityMode ? 'Đã gỡ requirement khỏi các reward nháp; asset vẫn được giữ nguyên.' : 'Đã xóa bản nháp mapping.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không xóa được mapping.') }
    finally { setBusy(false) }
  }

  const showAudit = async (mapping: WorkspaceMapping) => {
    setBusy(true)
    try {
      const result = await rewardMappingApi.audit<{ entries: AuditEntry[] }>(mapping.id)
      setAudit({ mappingId: mapping.id, entries: result.entries ?? [] })
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không tải được lịch sử thay đổi.') }
    finally { setBusy(false) }
  }

  const preview: RewardMapping = { id: 'preview', name, status: 'draft', version: 1, requirement, rewardIds }
  const normalizedQuery = query.trim().toLocaleLowerCase('vi')
  const visibleMappings = mappings.filter((mapping) => !normalizedQuery || [mapping.name, rewardRequirementSentence(mapping), ...mapping.rewardIds].some((value) => value.toLocaleLowerCase('vi').includes(normalizedQuery)))
    .sort((left, right) => left.requirement.type === 'xp_level' && right.requirement.type === 'xp_level'
      ? Number(left.requirement.value) - Number(right.requirement.value)
      : left.name.localeCompare(right.name, 'vi'))
  const rewardView = rewards.map((reward) => ({ reward, mappings: visibleMappings.filter((mapping) => mapping.rewardIds.includes(reward.code)) }))
    .filter(({ reward, mappings: linked }) => linked.length > 0 || (!normalizedQuery && direction === 'reward') || reward.name.toLocaleLowerCase('vi').includes(normalizedQuery) || reward.code.toLocaleLowerCase('vi').includes(normalizedQuery))

  const rewardAssignments = useMemo(() => {
    const result = new Map<string, RewardMapping['requirement']>()
    for (const mapping of [...mappings].sort((left, right) => left.status === 'published' && right.status !== 'published' ? -1 : 1)) {
      for (const rewardId of mapping.rewardIds) if (!result.has(rewardId)) result.set(rewardId, mapping.requirement)
    }
    for (const reward of rewards) {
      if (!result.has(reward.code)) {
        const requirement = requirementFromItem(reward)
        if (requirement) result.set(reward.code, requirement)
      }
    }
    return result
  }, [mappings, rewards])
  const normalizedRewardQuery = rewardQuery.trim().toLocaleLowerCase('vi')
  const unassignedRewards = rewards.filter((reward) => !rewardAssignments.has(reward.code))
  const movableRewards = rewards.filter((reward) => {
    const assignment = rewardAssignments.get(reward.code)
    return assignment?.type === 'xp_level' && Number(assignment.value) !== initialLevel
  })
  const levelPickerRewards = (levelPickerMode === 'unassigned' ? unassignedRewards : movableRewards)
    .filter((reward) => rewardIds.includes(reward.code) || !normalizedRewardQuery || `${reward.name} ${reward.code}`.toLocaleLowerCase('vi').includes(normalizedRewardQuery))

  const statusLabel = (status: RewardMapping['status']) => status === 'published' ? 'Đang phát hành' : status === 'review' ? 'Chờ duyệt' : status === 'retired' ? 'Đã ngừng' : 'Bản nháp'

  const MappingActions = ({ mapping }: { mapping: WorkspaceMapping }) => (
    <details className="relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50"><MoreHorizontal className="h-4 w-4" /> Thao tác <ChevronDown className="h-4 w-4" /></summary>
      <div className="absolute right-0 z-20 mt-1 grid min-w-52 gap-1 rounded-xl border border-border bg-white p-2 shadow-lg">
        <button type="button" onClick={() => editMapping(mapping)} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold hover:bg-brand-50"><Pencil className="h-4 w-4" /> Sửa mapping</button>
        {mapping.status === 'draft' && <><button type="button" disabled={busy} onClick={() => void transition(mapping, 'publish')} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold text-brand-700 hover:bg-brand-50"><CheckCircle2 className="h-4 w-4" /> Phát hành</button><button type="button" disabled={busy} onClick={() => void transition(mapping, 'review')} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold hover:bg-slate-50"><Send className="h-4 w-4" /> Gửi duyệt</button><button type="button" disabled={busy} onClick={() => void inspectDelete(mapping)} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold text-danger hover:bg-coral-50"><Trash2 className="h-4 w-4" /> Xóa bản nháp</button></>}
        {mapping.status === 'review' && <><button type="button" disabled={busy} onClick={() => void transition(mapping, 'publish')} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold text-brand-700 hover:bg-brand-50"><CheckCircle2 className="h-4 w-4" /> Phát hành</button><button type="button" onClick={() => void transition(mapping, 'revert-to-draft')} className="min-h-10 rounded-lg px-3 text-left text-sm font-bold hover:bg-slate-50">Trả về nháp</button></>}
        {mapping.status === 'published' && !compatibilityMode && <button type="button" disabled={busy} onClick={() => void transition(mapping, 'retire')} className="min-h-10 rounded-lg px-3 text-left text-sm font-bold text-danger hover:bg-coral-50">Ngừng luật</button>}
        {!compatibilityMode && <button type="button" disabled={busy} onClick={() => void showAudit(mapping)} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold hover:bg-slate-50"><History className="h-4 w-4" /> Lịch sử</button>}
      </div>
    </details>
  )

  return (
    <section className="space-y-4">
      {!builderOnly && <header className="ui-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-brand-600">Bản đồ trao thưởng</p><h2 className="font-display text-2xl">Điều kiện nào mở phần quà nào?</h2><p className="mt-1 max-w-3xl text-sm text-muted">Đổi chiều xem để kiểm tra nhanh theo mốc hoặc theo từng phần quà.</p></div><Button onClick={() => { resetForm(); setBuilderOpen(true) }}><Plus className="h-5 w-5" /> Tạo liên kết</Button></div>
        {message && <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${compatibilityMode ? 'bg-mint-50 text-emerald-900' : 'bg-sky-50 text-sky-900'}`}>{message}</p>}
      </header>}

      {!builderOnly && <div className="ui-card flex flex-wrap items-center gap-3 p-3">
        <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Chiều xem mapping"><button type="button" onClick={() => setDirection('requirement')} className={`min-h-11 rounded-lg px-4 text-sm font-extrabold ${direction === 'requirement' ? 'bg-white text-brand-700 shadow-sm' : 'text-muted'}`}>Mốc → Phần quà</button><button type="button" onClick={() => setDirection('reward')} className={`min-h-11 rounded-lg px-4 text-sm font-extrabold ${direction === 'reward' ? 'bg-white text-brand-700 shadow-sm' : 'text-muted'}`}>Phần quà → Điều kiện</button></div>
        <label className="relative ml-auto min-w-64 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" /><span className="sr-only">Tìm mapping</span><input className="field-input min-h-11 w-full pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm level, action hoặc phần quà…" /></label>
        <span className="rounded-full bg-brand-50 px-3 py-2 text-xs font-black text-brand-700">{visibleMappings.length} liên kết</span>
      </div>}

      <div className={`grid items-start gap-4 ${builderOpen && !builderOnly ? 'xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]' : ''}`}>
        {!builderOnly && <div className="space-y-3">
          {!loading && visibleMappings.length === 0 && <div className="ui-card p-10 text-center text-sm text-muted">{compatibilityMode ? 'Chưa có reward nào được gắn requirement.' : 'Không có liên kết phù hợp.'}</div>}
          {direction === 'requirement' ? visibleMappings.map((mapping) => <article key={mapping.id} className="ui-card p-4"><div className="grid items-center gap-4 md:grid-cols-[minmax(190px,0.8fr)_auto_minmax(240px,1.2fr)_auto]"><div><span className="text-xs font-black uppercase text-brand-600">{requirementLabels[mapping.requirement.type]}</span><h3 className="mt-1 text-lg font-black">{mapping.requirement.type === 'xp_level' ? `Level ${mapping.requirement.value}` : mapping.name}</h3><span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{statusLabel(mapping.status)} · v{mapping.version}</span></div><ArrowRight className="hidden h-6 w-6 text-brand-400 md:block" /><div><p className="text-xs font-bold text-muted">MỞ {mapping.rewardIds.length} PHẦN QUÀ</p><div className="mt-2 flex flex-wrap gap-2">{mapping.rewardIds.map((id) => { const reward = rewards.find((entry) => entry.code === id); const artwork = reward && getArtwork?.(reward); return <span key={id} className="inline-flex items-center gap-2 rounded-xl bg-mint-50 py-1.5 pl-1.5 pr-3 text-sm font-bold text-emerald-900">{artwork ? <img src={artwork} alt="" className="h-9 w-9 rounded-lg object-contain" /> : <Gift className="ml-1 h-4 w-4" />}{reward?.name ?? id}</span> })}</div></div><MappingActions mapping={mapping} /></div>{audit?.mappingId === mapping.id && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs"><strong>Lịch sử</strong>{audit.entries.length ? audit.entries.map((entry) => <p key={entry.id} className="mt-2">{entry.createdAt} · {entry.actorName ?? 'Hệ thống'} · {entry.action}</p>) : <p className="mt-2 text-muted">Chưa có thay đổi.</p>}</div>}</article>) : rewardView.map(({ reward, mappings: linked }) => { const artwork = getArtwork?.(reward); return <article key={reward.code} className="ui-card p-4"><div className="grid items-center gap-4 md:grid-cols-[minmax(220px,0.9fr)_auto_minmax(260px,1.1fr)]"><div className="flex items-center gap-3"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mint-50">{artwork ? <img src={artwork} alt={`Preview ${reward.name}`} className="h-full w-full object-contain" /> : <Gift className="h-6 w-6 text-emerald-700" />}</div><div><h3 className="font-black">{reward.name}</h3><code className="text-xs text-muted">{reward.code}</code></div></div><ArrowRight className="hidden h-6 w-6 rotate-180 text-brand-400 md:block" /><div>{linked.length ? linked.map((mapping) => <button key={mapping.id} type="button" onClick={() => editMapping(mapping)} className="mb-2 mr-2 min-h-11 rounded-xl border border-brand-100 bg-brand-50 px-3 text-left text-sm font-bold text-brand-800 hover:border-brand-400">{rewardRequirementSentence(mapping).replace(/, trao .*$/, '')}<span className="ml-2 text-[10px] uppercase opacity-70">{statusLabel(mapping.status)}</span></button>) : <span className="text-sm text-muted">Chưa gắn điều kiện</span>}</div></div></article> })}
        </div>}

        {builderOpen && <aside className={`ui-card space-y-4 p-4 ${builderOnly ? 'mx-auto w-full max-w-3xl' : 'sticky top-4'}`}>
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase text-brand-600">Mapping builder</p><h3 className="font-display text-xl">{editing ? 'Sửa bản mapping' : 'Tạo mapping mới'}</h3></div>{editing && <Button variant="ghost" onClick={resetForm}>Tạo mới</Button>}</div>
          {initialLevel ? <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 font-display text-lg text-white">{initialLevel}</span><span><strong className="block text-sm text-brand-900">Đích: Level {initialLevel}</strong><span className="text-xs text-brand-700">Chọn phần quà cần thêm hoặc đổi sang mốc này</span></span></div> : <>
            <label className="block text-sm font-bold">Tên luật<input className="field-input mt-2 min-h-11 w-full" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Quà Level 15" /></label>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl bg-brand-50 p-3 text-center text-xs font-black text-brand-800"><span>Requirement</span><ArrowRight className="h-4 w-4" /><span>Phần quà</span></div>
            <label className="block text-sm font-bold">Loại requirement<select className="field-input mt-2 min-h-11 w-full" value={requirement.type} onChange={(event) => setRequirement({ ...emptyRequirement, type: event.target.value as RewardRequirementType })}>{Object.entries(requirementLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            {requirement.type === 'action' && <label className="block text-sm font-bold">Action / metric<select className="field-input mt-2 min-h-11 w-full" value={requirement.metric} onChange={(event) => setRequirement({ ...requirement, metric: event.target.value })}>{ACHIEVEMENT_METRIC_REGISTRY.map((metric) => <option key={metric.value} value={metric.value}>{metric.label} · {metric.unit}</option>)}</select></label>}
            {requirement.type === 'storybook_sticker' && <label className="block text-sm font-bold">Chapter<input className="field-input mt-2 min-h-11 w-full" value={requirement.chapter} onChange={(event) => setRequirement({ ...requirement, chapter: event.target.value.toUpperCase() })} placeholder="P03" /></label>}
            <label className="block text-sm font-bold">{requirement.type === 'xp_level' ? 'Level' : requirement.type === 'action' ? 'Mục tiêu' : 'Mã tham chiếu'}<input type={requirement.type === 'xp_level' || requirement.type === 'action' ? 'number' : 'text'} min={1} className="field-input mt-2 min-h-11 w-full" value={requirement.value} onChange={(event) => setRequirement({ ...requirement, value: event.target.value })} /></label>
          </>}
          {initialLevel ? <fieldset className="space-y-3">
            <legend className="text-sm font-bold">Chọn phần quà cho Level {initialLevel}</legend>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1" role="group" aria-label="Cách thêm phần quà">
              <button type="button" onClick={() => setLevelPickerMode('unassigned')} className={`min-h-11 rounded-xl px-3 text-sm font-extrabold ${levelPickerMode === 'unassigned' ? 'bg-white text-brand-700 shadow-sm' : 'text-muted'}`}>Chưa gắn <span className="ml-1 text-xs">{unassignedRewards.length}</span></button>
              <button type="button" onClick={() => setLevelPickerMode('move')} className={`min-h-11 rounded-xl px-3 text-sm font-extrabold ${levelPickerMode === 'move' ? 'bg-white text-brand-700 shadow-sm' : 'text-muted'}`}>Đổi mốc <span className="ml-1 text-xs">{movableRewards.length}</span></button>
            </div>
            <p className="text-xs text-muted">{levelPickerMode === 'unassigned' ? 'Chỉ hiện phần quà chưa có requirement.' : `Chọn phần quà để chuyển từ Level cũ sang Level ${initialLevel}. Bản đang phát hành chỉ đổi sau khi bạn phát hành version mới.`}</p>
            <label className="relative block"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" /><span className="sr-only">Tìm phần quà</span><input className="field-input min-h-11 w-full pl-10" value={rewardQuery} onChange={(event) => setRewardQuery(event.target.value)} placeholder="Tìm tên hoặc mã phần quà…" /></label>
            {rewardIds.length > 0 && <div className="rounded-xl bg-mint-50 p-3"><p className="text-xs font-black uppercase text-emerald-800">Đã chọn · {rewardIds.length}</p><div className="mt-2 flex flex-wrap gap-2">{rewardIds.map((id) => <button key={id} type="button" onClick={() => setRewardIds(rewardIds.filter((rewardId) => rewardId !== id))} className="min-h-9 rounded-lg bg-white px-2.5 text-left text-xs font-bold text-emerald-900 shadow-sm">{rewards.find((reward) => reward.code === id)?.name ?? id} ×</button>)}</div></div>}
            <div className="max-h-72 space-y-2 overflow-auto rounded-xl border border-border p-2">
              {levelPickerRewards.length === 0 ? <p className="p-6 text-center text-sm text-muted">{rewardQuery ? 'Không tìm thấy phần quà phù hợp.' : levelPickerMode === 'unassigned' ? 'Tất cả phần quà đã có requirement.' : 'Không có phần quà ở Level khác.'}</p> : levelPickerRewards.map((reward) => {
                const artwork = getArtwork?.(reward)
                const oldRequirement = rewardAssignments.get(reward.code)
                return <label key={reward.code} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-brand-50">
                  <input type="checkbox" checked={rewardIds.includes(reward.code)} onChange={(event) => setRewardIds(event.target.checked ? [...rewardIds, reward.code] : rewardIds.filter((id) => id !== reward.code))} />
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">{artwork ? <img src={artwork} alt="" className="h-full w-full object-contain" /> : <Gift className="h-5 w-5 text-brand-600" />}</span>
                  <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{reward.name}</strong><code className="block truncate text-[10px] text-muted">{reward.code}</code></span>
                  {levelPickerMode === 'move' && <span className="shrink-0 rounded-lg bg-sun-50 px-2 py-1 text-[11px] font-black text-amber-900">Level {oldRequirement?.value} → {initialLevel}</span>}
                </label>
              })}
            </div>
          </fieldset> : <fieldset><legend className="text-sm font-bold">Chọn phần quà</legend><div className="mt-2 max-h-64 space-y-2 overflow-auto rounded-xl border border-border p-2">{rewards.map((reward) => <label key={reward.code} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-brand-50"><input type="checkbox" checked={rewardIds.includes(reward.code)} onChange={(event) => setRewardIds(event.target.checked ? [...rewardIds, reward.code] : rewardIds.filter((id) => id !== reward.code))} /><Gift className="h-4 w-4 text-brand-600" /><span className="min-w-0"><strong className="block truncate text-sm">{reward.name}</strong><code className="text-[10px] text-muted">{reward.code}</code></span></label>)}</div></fieldset>}
          <div className="rounded-2xl bg-mint-50 p-4 text-sm text-emerald-950"><Link2 className="mb-2 h-5 w-5" /><strong>Bản đọc dễ hiểu</strong><p className="mt-1">{rewardRequirementSentence(preview)}</p></div>
          <div className="grid gap-2 sm:grid-cols-2">{!builderOnly && <Button variant="secondary" disabled={busy} onClick={resetForm}>Đóng</Button>}<Button className={builderOnly ? 'sm:col-span-2' : ''} disabled={busy} onClick={() => void save(true)}><CheckCircle2 className="h-4 w-4" /> Lưu & phát hành</Button><Button variant="ghost" className="sm:col-span-2" disabled={busy} onClick={() => void save()}>{editing ? 'Chỉ lưu bản nháp' : 'Tạo bản nháp, chưa phát hành'}</Button></div>
        </aside>}
      </div>

      <ConfirmDialog open={Boolean(pendingDelete)} danger title={pendingDelete?.report.canDelete ? 'Xóa bản nháp mapping?' : 'Không thể xóa mapping'} description={pendingDelete?.report.canDelete ? 'Mapping chưa phát hành và không có dependency chặn. Thao tác này không ảnh hưởng reward asset.' : `Hệ thống tìm thấy ${pendingDelete?.report.references.length ?? 0} liên kết đang sử dụng mapping này. Hãy gỡ liên kết trước.`} confirmLabel={pendingDelete?.report.canDelete ? 'Xóa bản nháp' : 'Đã hiểu'} onConfirm={pendingDelete?.report.canDelete ? () => void remove() : () => setPendingDelete(null)} onCancel={() => setPendingDelete(null)} />
    </section>
  )
}
