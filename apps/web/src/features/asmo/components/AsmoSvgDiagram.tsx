import React from 'react'
import { AsmoDiagramEngine } from './AsmoDiagramEngine'

export type AsmoSvgDiagramProps = {
  diagramKey: string
  className?: string
  clockHour?: number
  clockMinute?: number
}

/**
 * AsmoSvgDiagram: Pure Vector SVG Diagram Component for ASMO Olympiad
 * Powered by AsmoDiagramEngine with 12 parametric SVG renderers.
 */
export function AsmoSvgDiagram({
  diagramKey,
  className,
  clockHour,
  clockMinute,
}: AsmoSvgDiagramProps): React.JSX.Element | null {
  return (
    <AsmoDiagramEngine
      diagramKey={diagramKey}
      className={className}
      clockHour={clockHour}
      clockMinute={clockMinute}
    />
  )
}
