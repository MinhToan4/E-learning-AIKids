import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { HeroProgressCard } from './HeroProgressCard'

describe('HeroProgressCard learning action copy', () => {
  it('shows Bắt đầu for a learner without activity', () => {
    const html = renderToStaticMarkup(
      <HeroProgressCard
        explorerLevel={1}
        overallProgressPct={0}
        xpToNextLevel={100}
        activeStationLabel="Bài 1.1"
        hasStarted={false}
        onStartLesson={() => undefined}
      />,
    )

    expect(html).toContain('Bắt đầu • Cấp 1')
    expect(html).toContain('Bắt đầu Bài 1.1')
    expect(html).not.toContain('Học tiếp Bài 1.1')
  })

  it('shows Học tiếp after the learner has activity', () => {
    const html = renderToStaticMarkup(
      <HeroProgressCard
        explorerLevel={2}
        overallProgressPct={25}
        xpToNextLevel={85}
        activeStationLabel="Bài 1.2"
        hasStarted
        onStartLesson={() => undefined}
      />,
    )

    expect(html).toContain('Học tiếp • Cấp 2')
    expect(html).toContain('Học tiếp Bài 1.2')
  })
})
