import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ART_STYLES } from '../lib/workshop-types'
import type { WorkshopStep } from '../lib/workshop-types'
import { WorkshopHub } from '../components/WorkshopHub'
import { WorkshopStylePicker } from '../components/WorkshopStylePicker'
import { WorkshopCanvas } from '../components/WorkshopCanvas'
import { WorkshopStory } from '../components/WorkshopStory'

/**
 * Maps non-canvas steps to a single back-label for the slim top bar.
 * Canvas manages its own back navigation inside the component.
 */
const STEP_BACK: Partial<Record<WorkshopStep, { label: string; target: WorkshopStep }>> = {
  style:         { label: '← Xưởng',        target: 'hub' },
  'story-genre': { label: '← Xưởng',        target: 'hub' },
  'story-idea':  { label: '← Thể loại',     target: 'story-genre' },
  'story-library':{ label: '← Ý tưởng',    target: 'story-idea' },
}

const STEP_TITLE: Partial<Record<WorkshopStep, string>> = {
  style:          'Chọn phong cách',
  'story-genre':  'Chọn thể loại',
  'story-idea':   'Xây dựng ý tưởng',
  'story-library':'Câu chuyện của con',
}

export function CreativePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WorkshopStep>('hub')
  const [selectedStyle, setSelectedStyle] = useState(ART_STYLES[0]!.id)

  const isCanvas = step === 'canvas'
  const back = STEP_BACK[step]
  const title = STEP_TITLE[step]

  function goTo(s: WorkshopStep) { setStep(s) }
  function handleSaved() { navigate('/backpack') }

  return (
    <div
      aria-label="Xưởng Sáng Tạo"
      className="flex flex-col"
      style={{
        height: 'calc(100dvh - 64px)',
        // Canvas must not scroll — child needs known height for h-full to work
        overflow: isCanvas ? 'hidden' : 'auto',
      }}
    >
      {/* ── Slim top bar: only for non-canvas sub-steps ── */}
      {!isCanvas && back && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-4 py-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => goTo(back.target)}
            className="text-xs font-semibold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
          >
            {back.label}
          </button>
          {title && (
            <>
              <span className="text-xs text-muted" aria-hidden>›</span>
              <span className="text-xs font-extrabold text-text">{title}</span>
            </>
          )}
        </div>
      )}

      {/* ── Main content ── */}
      {step === 'hub' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <WorkshopHub onGo={goTo} />
        </div>
      )}

      {step === 'style' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <WorkshopStylePicker
            selectedStyle={selectedStyle}
            onSelect={setSelectedStyle}
            onContinue={goTo}
            onBack={() => goTo('hub')}
          />
        </div>
      )}

      {/* Canvas: no padding, overflow:hidden so flex-1/h-full work correctly inside */}
      {isCanvas && (
        <div className="min-h-0 flex-1 overflow-hidden">
          <WorkshopCanvas
            selectedStyle={selectedStyle}
            onBack={goTo}
            onSaved={handleSaved}
          />
        </div>
      )}

      {(step === 'story-genre' || step === 'story-idea' || step === 'story-library') && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <WorkshopStory
            initialStep={
              step === 'story-idea' ? 'idea'
              : step === 'story-library' ? 'result'
              : 'genre'
            }
            onBack={goTo}
            onSaved={handleSaved}
          />
        </div>
      )}
    </div>
  )
}
