import { Alignment, Fit, Layout, StateMachineInputType, useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect, useMemo } from 'react'
import { MEE_CATEGORIES, MEE_RIVE_CONTRACT, MEE_RIVE_SAMPLE, type MeeRiveSelection } from '../contract'

type MeeRiveCanvasProps = {
  selection: MeeRiveSelection
  onContractReady?: (ready: boolean) => void
}

export function MeeRiveCanvas({ selection, onContractReady }: MeeRiveCanvasProps) {
  const layout = useMemo(
    () => new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    [],
  )
  const { rive, RiveComponent } = useRive({
    src: MEE_RIVE_SAMPLE.src,
    artboard: MEE_RIVE_SAMPLE.artboard,
    stateMachines: MEE_RIVE_SAMPLE.stateMachine,
    autoplay: true,
    layout,
  })
  const motionInput = useStateMachineInput(rive, MEE_RIVE_CONTRACT.stateMachine, MEE_RIVE_CONTRACT.inputs.motion)
  const categoryInput = useStateMachineInput(rive, MEE_RIVE_CONTRACT.stateMachine, MEE_RIVE_CONTRACT.inputs.category)
  const equipInput = useStateMachineInput(rive, MEE_RIVE_CONTRACT.stateMachine, MEE_RIVE_CONTRACT.inputs.equip)
  const contractReady = Boolean(motionInput && categoryInput && equipInput)

  useEffect(() => onContractReady?.(contractReady), [contractReady, onContractReady])

  useEffect(() => {
    if (!contractReady || !motionInput || !categoryInput || !equipInput) return
    const categoryValue = MEE_CATEGORIES.find((item) => item.id === selection.category)?.value ?? 0
    motionInput.value = MEE_RIVE_CONTRACT.motionValues.inspect
    categoryInput.value = categoryValue
    const equipTimer = window.setTimeout(() => {
      if (equipInput.type === StateMachineInputType.Trigger) equipInput.fire()
    }, 160)
    const idleTimer = window.setTimeout(() => {
      motionInput.value = MEE_RIVE_CONTRACT.motionValues.idle
    }, 520)
    return () => {
      window.clearTimeout(equipTimer)
      window.clearTimeout(idleTimer)
    }
  }, [categoryInput, contractReady, equipInput, motionInput, selection])

  return (
    <RiveComponent
      className="h-full w-full"
      aria-label="Bản thử nghiệm nhân vật chuyển động bằng Rive"
    />
  )
}
