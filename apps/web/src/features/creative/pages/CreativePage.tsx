import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ART_STYLES } from '../lib/workshop-types'
import type { WorkshopStep } from '../lib/workshop-types'
import { WorkshopHub } from '../components/WorkshopHub'
import { WorkshopStylePicker } from '../components/WorkshopStylePicker'
import { WorkshopCanvas } from '../components/WorkshopCanvas'
import { WorkshopStory } from '../components/WorkshopStory'
import { WorkshopCharacter } from '../components/WorkshopCharacter'

export function CreativePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WorkshopStep>('hub')
  const [selectedStyle, setSelectedStyle] = useState(ART_STYLES[0]!.id)

  const isCanvas = step === 'canvas'

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


      {/* ── Main content ── */}
      {step === 'hub' && (
        <div className="flex-1 p-4 sm:p-6">
          <WorkshopHub onGo={goTo} />
        </div>
      )}

      {step === 'style' && (
        <div className="flex-1 p-4 sm:p-5">
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

      {step === 'character' && (
        <div className="flex-1 p-4 sm:p-5">
          <WorkshopCharacter onBack={goTo} onSaved={handleSaved} />
        </div>
      )}

      {(step === 'story-mode' || step === 'story-genre' || step === 'story-idea' || step === 'story-library') && (
        <div className="flex-1 p-4 sm:p-5">
          <WorkshopStory
            initialStep={
              step === 'story-mode' ? 'mode'
              : step === 'story-idea' ? 'idea'
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
