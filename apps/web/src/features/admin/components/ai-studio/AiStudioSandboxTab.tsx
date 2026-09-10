import React, { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  Save,
  Palette,
  BookOpen,
  Puzzle,
  GraduationCap,
  Video as VideoIcon,
  ShieldCheck,
  Tag,
  Play,
  Check,
  Copy,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  DEFAULT_PROMPT_FRAMEWORKS,
  PROMPT_FRAMEWORK_CATEGORIES,
  loadPromptFrameworks,
  savePromptFrameworks,
  renderPromptFramework,
  type PromptFrameworkId,
  type PromptFrameworkCategory,
  type PromptFrameworkItem,
} from '../../lib/prompt-frameworks-data'

export interface AiStudioSandboxTabProps {
  onSendToProbeTester: (promptText: string) => void
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void
}

export function AiStudioSandboxTab({ onSendToProbeTester, showToast }: AiStudioSandboxTabProps) {
  // ── Prompt Studio State ──────────────────────────────────
  const [promptFrameworks, setPromptFrameworks] = useState<PromptFrameworkItem[]>(() =>
    loadPromptFrameworks(),
  )
  const [frameworkCategoryFilter, setFrameworkCategoryFilter] = useState<'all' | PromptFrameworkCategory>('all')
  const [testVariablesState, setTestVariablesState] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {}
    for (const fw of DEFAULT_PROMPT_FRAMEWORKS) {
      initial[fw.id] = {}
      for (const v of fw.variables) {
        initial[fw.id][v.name] = v.sampleValue
      }
    }
    return initial
  })
  const [copiedFrameworkId, setCopiedFrameworkId] = useState<string | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [jsonImportText, setJsonImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  // ── Prompt Studio Handlers ────────────────────────────────
  const handleSaveAllFrameworks = useCallback(() => {
    savePromptFrameworks(promptFrameworks)
    showToast('Đã lưu cấu hình 8 khung prompt chuẩn SSOT thành công!', 'success')
  }, [promptFrameworks, showToast])

  const handleResetAllFrameworks = useCallback(() => {
    setPromptFrameworks(DEFAULT_PROMPT_FRAMEWORKS)
    savePromptFrameworks(DEFAULT_PROMPT_FRAMEWORKS)
    const resetVars: Record<string, Record<string, string>> = {}
    for (const fw of DEFAULT_PROMPT_FRAMEWORKS) {
      resetVars[fw.id] = {}
      for (const v of fw.variables) {
        resetVars[fw.id][v.name] = v.sampleValue
      }
    }
    setTestVariablesState(resetVars)
    showToast('Đã khôi phục toàn bộ 8 khung prompt về cấu hình mặc định', 'info')
  }, [showToast])

  const handleResetSingleFramework = useCallback((id: PromptFrameworkId) => {
    const defaultItem = DEFAULT_PROMPT_FRAMEWORKS.find((d) => d.id === id)
    if (!defaultItem) return
    setPromptFrameworks((prev) => prev.map((item) => (item.id === id ? { ...defaultItem } : item)))
    setTestVariablesState((prev) => {
      const nextVars = { ...prev }
      nextVars[id] = {}
      for (const v of defaultItem.variables) {
        nextVars[id][v.name] = v.sampleValue
      }
      return nextVars
    })
    showToast(`Đã khôi phục khung prompt "${defaultItem.title}" về mẫu chuẩn`, 'info')
  }, [showToast])

  const handleExportFrameworks = useCallback(() => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(promptFrameworks, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', 'aikids_prompt_frameworks_export.json')
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      showToast('Đã xuất file cấu hình prompt_frameworks_export.json thành công!', 'success')
    } catch {
      showToast('Lỗi khi xuất cấu hình JSON', 'error')
    }
  }, [promptFrameworks, showToast])

  const handleConfirmImport = useCallback(() => {
    setImportError(null)
    try {
      if (!jsonImportText.trim()) {
        setImportError('Vui lòng nhập chuỗi JSON cấu hình')
        return
      }
      const parsed = JSON.parse(jsonImportText)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setImportError('Dữ liệu JSON phải là một mảng danh sách các khung prompt')
        return
      }
      const validItems: PromptFrameworkItem[] = []
      for (const raw of parsed) {
        if (!raw.id || !raw.title || typeof raw.prefix !== 'string' || typeof raw.suffix !== 'string') {
          setImportError(
            `Mục "${raw.title || raw.id || 'không tên'}" thiếu các trường bắt buộc (id, title, prefix, suffix)`,
          )
          return
        }
        validItems.push({
          id: raw.id,
          title: raw.title,
          category: raw.category || 'art',
          appScope: raw.appScope || 'play.aikid.vn',
          description: raw.description || '',
          enabled: typeof raw.enabled === 'boolean' ? raw.enabled : true,
          prefix: raw.prefix,
          suffix: raw.suffix,
          variables: Array.isArray(raw.variables) ? raw.variables : [],
          qualityKeywords: raw.qualityKeywords || '',
          safetyNote: raw.safetyNote || '',
        })
      }
      setPromptFrameworks(validItems)
      savePromptFrameworks(validItems)
      setImportModalOpen(false)
      setJsonImportText('')
      showToast(`Đã nhập thành công ${validItems.length} khung prompt cấu hình!`, 'success')
    } catch (e) {
      setImportError(e instanceof Error ? `Lỗi cú pháp JSON: ${e.message}` : 'Cú pháp JSON không hợp lệ')
    }
  }, [jsonImportText, showToast])

  const handleInsertVariable = useCallback((frameworkId: PromptFrameworkId, varName: string) => {
    setPromptFrameworks((prev) =>
      prev.map((item) => {
        if (item.id === frameworkId) {
          const insertion = ` {${varName}}`
          return {
            ...item,
            prefix: item.prefix + insertion,
          }
        }
        return item
      }),
    )
    showToast(`Đã chèn biến {${varName}} vào tiền tố`, 'info')
  }, [showToast])

  const handleCopyFrameworkPrompt = useCallback(
    (item: PromptFrameworkItem) => {
      const fullPrompt = renderPromptFramework(item, testVariablesState[item.id])
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(fullPrompt)
      }
      setCopiedFrameworkId(item.id)
      setTimeout(() => setCopiedFrameworkId(null), 2000)
      showToast('Đã sao chép toàn bộ prompt vào bộ nhớ tạm!', 'success')
    },
    [testVariablesState, showToast],
  )

  const handleSendToProbeTester = useCallback(
    (promptText: string) => {
      onSendToProbeTester(promptText)
      showToast('Đã nạp prompt vào Probe Tester ở Tab 5!', 'info')
    },
    [onSendToProbeTester, showToast],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner - Hallmark UI Soft Clay */}
      <div className="ui-card p-4 sm:p-5 border-2 border-border/80 bg-gradient-to-r from-brand-50/80 via-surface to-sky-50/60 rounded-3xl shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-3xl">
            <div className="flex items-center gap-1.5 text-brand-600 font-extrabold text-[11px] uppercase tracking-wider">
              <Sparkles size={14} className="text-sun-500" />
              <span>PROMPT FRAMEWORKS ECOSYSTEM SSOT</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-text mt-0.5">
              Trung Tâm Quản Trị Khung Prompt Sẵn (Prompt Studio)
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Quản trị và hiệu chỉnh 8 bộ khung prompt chuẩn mực cho toàn bộ hệ sinh thái AI Kids: Vẽ tranh phác thảo, Thiết kế linh vật, Kịch bản truyện tranh, Sáng tác truyện chữ, Ghép thẻ bài học Montessori, Trực quan hóa toán ASMO, Trợ giảng Mèo Mee và Video hoạt cảnh.
            </p>
          </div>

          {/* Toolbar Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleResetAllFrameworks}
              className="flex items-center gap-1.5 min-h-8 px-3 text-xs"
              title="Khôi phục toàn bộ 8 khung prompt về mẫu mặc định ban đầu"
            >
              <RotateCcw size={13} />
              <span>Khôi phục toàn bộ mặc định</span>
            </Button>

            <Button
              variant="secondary"
              onClick={handleExportFrameworks}
              className="flex items-center gap-1.5 min-h-8 px-3 text-xs"
              title="Tải tệp cấu hình JSON về máy tính"
            >
              <Download size={13} />
              <span>Xuất cấu hình JSON</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-1.5 min-h-8 px-3 text-xs"
              title="Nhập cấu hình JSON từ clipboard hoặc file"
            >
              <Upload size={13} />
              <span>Nhập cấu hình JSON</span>
            </Button>

            <Button
              onClick={handleSaveAllFrameworks}
              className="flex items-center gap-1.5 min-h-8 px-4 text-xs font-bold shadow-clay"
            >
              <Save size={13} />
              <span>Lưu tất cả khung prompt</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface border-2 border-border/70 shadow-sm">
        {PROMPT_FRAMEWORK_CATEGORIES.map((cat) => {
          const count =
            cat.id === 'all'
              ? promptFrameworks.length
              : promptFrameworks.filter((p) => p.category === cat.id).length
          const isSelected = frameworkCategoryFilter === cat.id

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFrameworkCategoryFilter(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all duration-150',
                isSelected
                  ? 'bg-brand-500 text-white shadow-clay'
                  : 'text-text hover:bg-brand-50 hover:text-brand-600',
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-muted',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Prompt Framework Cards Grid */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        {promptFrameworks
          .filter(
            (item) => frameworkCategoryFilter === 'all' || item.category === frameworkCategoryFilter,
          )
          .map((item) => {
            const isCopied = copiedFrameworkId === item.id
            const sampleVars = testVariablesState[item.id] || {}
            const fullPrompt = renderPromptFramework(item, sampleVars)

            // Category Icon mapping
            const CategoryIcon =
              item.category === 'art'
                ? Palette
                : item.category === 'story'
                  ? BookOpen
                  : item.category === 'lesson'
                    ? Puzzle
                    : item.category === 'asmo'
                      ? GraduationCap
                      : VideoIcon

            return (
              <div
                key={item.id}
                className={cn(
                  'ui-card flex flex-col justify-between p-4 sm:p-5 border-2 rounded-3xl transition-all duration-200 shadow-soft',
                  item.enabled
                    ? 'border-border/90 bg-surface'
                    : 'border-coral-200/70 bg-coral-50/10 opacity-75',
                )}
              >
                <div className="flex flex-col gap-3.5">
                  {/* Card Top Row: Title, Category Icon, Scope Badge, Enabled Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'p-2 rounded-2xl shrink-0 mt-0.5 shadow-sm',
                          item.category === 'art' && 'bg-brand-100 text-brand-700',
                          item.category === 'story' && 'bg-sun-100 text-sun-700',
                          item.category === 'lesson' && 'bg-sky-100 text-sky-700',
                          item.category === 'asmo' && 'bg-mint-100 text-mint-700',
                          item.category === 'video' && 'bg-coral-100 text-coral-700',
                        )}
                      >
                        <CategoryIcon size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-base font-bold text-text truncate">
                            {item.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                            {item.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-mint-50 text-mint-700 border border-mint-200">
                            {item.appScope}
                          </span>
                          {item.safetyNote && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted font-medium">
                              <ShieldCheck size={11} className="text-mint-600" />
                              COPPA Compliant
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enable / Disable Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.enabled}
                      aria-label={`Bật tắt khung ${item.title}`}
                      onClick={() => {
                        setPromptFrameworks((prev) =>
                          prev.map((f) => (f.id === item.id ? { ...f, enabled: !f.enabled } : f)),
                        )
                      }}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                        item.enabled ? 'bg-mint-500' : 'bg-slate-300',
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                          item.enabled ? 'translate-x-5' : 'translate-x-0',
                        )}
                      />
                    </button>
                  </div>

                  {/* Description & Pedagogical Note */}
                  <p className="text-xs text-muted leading-relaxed">{item.description}</p>

                  {/* 1. Prefix Editor */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text flex items-center gap-1.5">
                        <span>1. Tiền tố hướng dẫn (Prefix / Base Instruction)</span>
                      </label>
                    </div>
                    <textarea
                      aria-label={`Tiền tố ${item.title}`}
                      rows={3}
                      value={item.prefix}
                      onChange={(e) => {
                        const val = e.target.value
                        setPromptFrameworks((prev) =>
                          prev.map((f) => (f.id === item.id ? { ...f, prefix: val } : f)),
                        )
                      }}
                      className="w-full rounded-xl border-2 border-border/80 bg-surface px-3 py-2 text-xs font-mono text-text focus:border-brand-400 focus:outline-none"
                    />
                  </div>

                  {/* Variable Chips Inserter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-muted flex items-center gap-1">
                      <Tag size={12} />
                      Biến số động khả dụng (Bấm vào thẻ để chèn vào tiền tố):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.variables.map((variable) => (
                        <button
                          key={variable.name}
                          type="button"
                          title={`${variable.label}: "${variable.sampleValue}"`}
                          onClick={() => handleInsertVariable(item.id, variable.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 hover:scale-[1.02] transition cursor-pointer"
                        >
                          <span>{`{${variable.name}}`}</span>
                          <span className="text-[10px] text-brand-600/70 font-sans font-normal">
                            ({variable.label})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Suffix Editor */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text">
                      2. Hậu tố chuẩn hóa &amp; An toàn trẻ em (Suffix)
                    </label>
                    <textarea
                      aria-label={`Hậu tố ${item.title}`}
                      rows={2}
                      value={item.suffix}
                      onChange={(e) => {
                        const val = e.target.value
                        setPromptFrameworks((prev) =>
                          prev.map((f) => (f.id === item.id ? { ...f, suffix: val } : f)),
                        )
                      }}
                      className="w-full rounded-xl border-2 border-border/80 bg-surface px-3 py-2 text-xs font-mono text-text focus:border-brand-400 focus:outline-none"
                    />
                  </div>

                  {/* Quality Keywords */}
                  {typeof item.qualityKeywords === 'string' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-text">
                        Từ khóa tăng cường chất lượng (Quality Booster Keywords)
                      </label>
                      <input
                        type="text"
                        aria-label={`Từ khóa chất lượng ${item.title}`}
                        value={item.qualityKeywords}
                        onChange={(e) => {
                          const val = e.target.value
                          setPromptFrameworks((prev) =>
                            prev.map((f) => (f.id === item.id ? { ...f, qualityKeywords: val } : f)),
                          )
                        }}
                        className="w-full rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-xs font-mono text-text focus:border-brand-400 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Interactive Live Tester Section */}
                  <div className="mt-1 p-3 rounded-2xl bg-surface/80 border-2 border-border/70 flex flex-col gap-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={12} />
                        Thử Nghiệm Trực Quan &amp; Ghép Biến Động (Live Tester)
                      </span>
                      <span className="text-[10px] text-muted font-medium">Thời gian thực</span>
                    </div>

                    {/* Sample variable inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.variables.map((variable) => {
                        const currentVal = sampleVars[variable.name] ?? variable.sampleValue
                        return (
                          <div key={variable.name} className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-muted truncate">
                              {variable.label} <code className="text-brand-600 font-mono">({`{${variable.name}}`})</code>
                            </span>
                            <input
                              type="text"
                              aria-label={`Giá trị thử nghiệm ${variable.name}`}
                              value={currentVal}
                              onChange={(e) => {
                                const val = e.target.value
                                setTestVariablesState((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    ...(prev[item.id] || {}),
                                    [variable.name]: val,
                                  },
                                }))
                              }}
                              className="rounded-lg border border-border/80 bg-white px-2 py-1 text-xs text-text focus:border-brand-400 focus:outline-none"
                            />
                          </div>
                        )
                      })}
                    </div>

                    {/* Live Preview Box */}
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[10px] font-bold text-muted uppercase">
                        Chuỗi Prompt Sinh Ra Thực Tế (Live Preview):
                      </span>
                      <div
                        data-testid={`live-prompt-framework-${item.id}`}
                        className="p-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-[11px] leading-relaxed max-h-32 overflow-y-auto select-all whitespace-pre-wrap"
                      >
                        {fullPrompt}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-border/70">
                  <Button
                    variant="ghost"
                    onClick={() => handleResetSingleFramework(item.id)}
                    className="text-xs min-h-8 px-2.5 text-muted hover:text-text"
                    title="Khôi phục riêng mục này về mẫu chuẩn ban đầu"
                  >
                    <RotateCcw size={12} className="mr-1" />
                    <span>Khôi phục mẫu chuẩn mục này</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleSendToProbeTester(fullPrompt)}
                      className="text-xs min-h-8 px-3 flex items-center gap-1 text-brand-700 bg-brand-50 hover:bg-brand-100 border-brand-200"
                      title="Chuyển sang Tab 5 và điền chuỗi prompt này vào Probe Tester"
                    >
                      <Play size={12} />
                      <span>Thử nghiệm qua Probe Tester</span>
                    </Button>

                    <Button
                      onClick={() => handleCopyFrameworkPrompt(item)}
                      className="text-xs min-h-8 px-3 font-bold flex items-center gap-1.5 shadow-clay"
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-mint-300" />
                          <span>Đã sao chép prompt</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Sao chép Prompt đầy đủ</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* ── Modal Nhập Cấu Hình JSON Khung Prompt (Tab 3) ─────────────── */}
      {importModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
          >
            <div className="ui-card w-full max-w-2xl p-5 border-2 border-border/80 bg-surface shadow-clay rounded-3xl flex flex-col gap-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-brand-100 text-brand-700">
                      <Upload size={16} />
                    </span>
                    <h4 id="import-modal-title" className="font-display text-base font-bold text-text">
                      Nhập Cấu Hình Khung Prompt JSON
                    </h4>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Dán nội dung JSON danh sách khung prompt hoặc chọn file JSON từ máy tính để đồng bộ vào hệ thống.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImportModalOpen(false)
                    setImportError(null)
                  }}
                  className="p-1 rounded-xl hover:bg-slate-100 text-muted hover:text-text transition cursor-pointer"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text">
                    Nội dung JSON cấu hình
                  </label>
                  <label className="text-xs text-brand-600 font-bold hover:underline cursor-pointer">
                    <span>Chọn tệp .json từ máy...</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (ev) => {
                            const content = String(ev.target?.result || '')
                            setJsonImportText(content)
                          }
                          reader.readAsText(file)
                        }
                      }}
                    />
                  </label>
                </div>
                <textarea
                  rows={8}
                  aria-label="Chuỗi JSON khung prompt"
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='[\n  {\n    "id": "sketch_to_art",\n    "title": "Phác Thảo Sang Tranh Vẽ",\n    "prefix": "...",\n    "suffix": "..."\n  }\n]'
                  className="w-full rounded-2xl border-2 border-border bg-slate-900 text-slate-100 p-3 font-mono text-xs focus:border-brand-400 focus:outline-none"
                />
                {importError && (
                  <p className="text-xs font-bold text-danger bg-coral-50 border border-coral-200 p-2.5 rounded-xl">
                    {importError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setImportModalOpen(false)
                    setImportError(null)
                  }}
                  className="text-xs min-h-8 px-3"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  className="text-xs min-h-8 px-4 font-bold flex items-center gap-1.5 shadow-clay"
                >
                  <Check size={13} />
                  <span>Xác nhận nhập cấu hình</span>
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
