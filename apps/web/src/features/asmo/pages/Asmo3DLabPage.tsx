import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  ChevronLeft,
  Box,
  Compass,
  Code2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { ASMO_3D_TEMPLATES } from '../data/asmo-3d-templates'
import type { AsmoTemplateKey, AsmoVisualSpec } from '../types'
import { AsmoThreeViewer } from '../components/AsmoThreeViewer'
import { AsmoQuestionCard } from '../components/AsmoQuestionCard'
import { FlatClayIcon } from '../components/AsmoFlatClayIcons'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export function Asmo3DLabPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialKey = (searchParams.get('template') as AsmoTemplateKey) || '3D_CUBE_CLUSTER'
  const [currentKey, setCurrentKey] = useState<AsmoTemplateKey>(
    ASMO_3D_TEMPLATES[initialKey] ? initialKey : '3D_CUBE_CLUSTER',
  )
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [showJsonSpec, setShowJsonSpec] = useState(false)

  const templateConfig = ASMO_3D_TEMPLATES[currentKey]
  const templateList = Object.values(ASMO_3D_TEMPLATES)

  useEffect(() => {
    const queryKey = searchParams.get('template') as AsmoTemplateKey
    if (queryKey && ASMO_3D_TEMPLATES[queryKey]) {
      setCurrentKey(queryKey)
      setActiveStepIndex(0)
    }
  }, [searchParams])

  const handleSelectTemplate = (key: AsmoTemplateKey) => {
    setCurrentKey(key)
    setActiveStepIndex(0)
    setSearchParams({ template: key })
  }

  // Derive dynamic spec from active interactive explanation step
  const currentStepData = templateConfig.problem.explanationSteps?.[activeStepIndex]
  const dynamicSpec: AsmoVisualSpec = {
    ...templateConfig.renderSpec,
    activePathIndex: activeStepIndex,
    explanationStep: currentStepData?.layerIndex !== undefined ? currentStepData.layerIndex : activeStepIndex,
    customPathPoints: currentStepData?.points,
    hour: currentStepData?.hour !== undefined ? currentStepData.hour : templateConfig.renderSpec.hour,
    minute: currentStepData?.minute !== undefined ? currentStepData.minute : templateConfig.renderSpec.minute,
    shadedSlices: currentStepData?.shadedCount !== undefined ? currentStepData.shadedCount : templateConfig.renderSpec.shadedSlices,
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/asmo"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-white transition-all border border-slate-200"
        >
          <ChevronLeft className="size-4" />
          <span>Về Cổng Olympic ASMO</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowJsonSpec(!showJsonSpec)}
            className="gap-1.5 rounded-xl border border-slate-300 bg-white/90 text-xs font-bold text-slate-700 py-1.5 px-3"
          >
            <Code2 className="size-3.5 text-indigo-600" />
            <span>{showJsonSpec ? 'Ẩn JSON Spec' : 'Xem JSON Spec 3D'}</span>
          </Button>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-extrabold text-indigo-800 mb-1.5">
          <Box className="size-3.5" />
          <span>Phòng Thí Nghiệm Không Gian 3D</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Mô Phỏng & Giải Đố Hình Học ASMO
        </h1>
      </div>

      {/* Template Selector Bar (7 Templates Tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {templateList.map((tpl) => {
          const isActive = tpl.key === currentKey
          return (
            <button
              key={tpl.key}
              type="button"
              onClick={() => handleSelectTemplate(tpl.key)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400'
                  : 'bg-white/90 hover:bg-indigo-50/70 border border-slate-200/80 text-slate-700 shadow-xs',
              )}
            >
              <FlatClayIcon name={tpl.icon} size={20} />
              <span>{tpl.title}</span>
            </button>
          )
        })}
      </div>

      {/* Main Grid: 3D Viewport on Left, Question Card & Mee Tutor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-brand-100 bg-white p-2 shadow-clay">
            <AsmoThreeViewer
              key={`${currentKey}-${activeStepIndex}`}
              spec={dynamicSpec}
              height={420}
              interactive
              onPathChange={(idx) => setActiveStepIndex(idx)}
            />
          </div>

          {/* Interactive Actions Explanation Card */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Các tính năng tương tác với mô hình:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {templateConfig.interactiveActions.map((act) => (
                <div
                  key={act.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs"
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-0.5">
                    <FlatClayIcon name={act.icon} size={16} />
                    <span>{act.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Question Card & Solver (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <AsmoQuestionCard
            key={templateConfig.problem.id}
            question={templateConfig.problem}
            showSolutionImmediately
            activeInteractiveStep={activeStepIndex}
            onInteractiveStepChange={(idx) => setActiveStepIndex(idx)}
          />
        </div>
      </div>

      {/* Optional: JSON Render Spec Modal/Drawer */}
      {showJsonSpec && (
        <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5 text-indigo-300 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              📦 JSON 3D Render Specification
            </span>
            <span className="rounded-md bg-mint-950 border border-mint-800 px-2 py-0.5 text-[10px] font-bold text-mint-400">
              100% Valid Spec
            </span>
          </div>
          <pre className="text-xs font-mono overflow-x-auto text-sky-400 leading-relaxed bg-transparent p-2">
            {JSON.stringify(
              {
                template_key: templateConfig.key,
                topic_badge: templateConfig.topicBadge,
                render_spec: dynamicSpec,
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
