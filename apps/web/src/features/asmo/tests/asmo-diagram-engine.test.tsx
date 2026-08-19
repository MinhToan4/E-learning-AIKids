import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  renderClockSvg,
  renderMatchstickFigureSvg,
  renderGridCheckerboardPuzzleSvg,
  renderBalanceScaleSvg,
  renderShapeEquationSvg,
  renderGridMazeSvg,
  renderGridPolylineSvg,
  renderCakePartitionSvg,
  renderSierpinskiTriangleSvg,
  renderGridShadedRatioSvg,
  renderScatteredCountingSvg,
  renderVerticalArithmeticTable,
  AsmoDiagramEngine,
} from '../components/AsmoDiagramEngine'
import { AsmoSvgDiagram } from '../components/AsmoSvgDiagram'

describe('AsmoDiagramEngine - 12 Pure Vector SVG Parametric Renderers', () => {
  it('1. renderClockSvg renders accurate clock face with hour & minute angles', () => {
    const markup = renderToStaticMarkup(renderClockSvg(5, 10))
    expect(markup).toContain('<svg')
    expect(markup).toContain('aria-label="Clock showing 5:10"')
    expect(markup).toContain('<line') // hands and ticks
    expect(markup).toContain('12') // hour numbers
    expect(markup).toContain('5')
  })

  it('2. renderMatchstickFigureSvg renders matchsticks with wooden stem and sulfur heads', () => {
    const markup = renderToStaticMarkup(renderMatchstickFigureSvg('square_flag', 6))
    expect(markup).toContain('<svg')
    expect(markup).toContain('stroke="#d97706"') // wood color
    expect(markup).toContain('url(#matchHeadGrad)') // sulfur head
  })

  it('3. renderGridCheckerboardPuzzleSvg renders 5x5 board and cut pieces', () => {
    const fullMarkup = renderToStaticMarkup(renderGridCheckerboardPuzzleSvg({ variant: 'full' }))
    expect(fullMarkup).toContain('<rect')

    const cutMarkup = renderToStaticMarkup(renderGridCheckerboardPuzzleSvg({ variant: 'puzzle_cut' }))
    expect(cutMarkup).toContain('<svg')
    expect(cutMarkup).toContain('stroke-dasharray') // dashed outline of cut piece

    const optAMarkup = renderToStaticMarkup(renderGridCheckerboardPuzzleSvg({ variant: 'opt_A' }))
    expect(optAMarkup).toContain('<rect')
  })

  it('4. renderBalanceScaleSvg renders seesaw balance scales with fruits and tilt', () => {
    const markup = renderToStaticMarkup(
      renderBalanceScaleSvg([
        { left: { emoji: '🍌' }, right: { emoji: '🍓' }, tilt: 'left' },
        { left: { emoji: '🍎' }, right: { emoji: '🍌' }, tilt: 'right' },
        { left: { emoji: '🍇' }, right: { emoji: '🍌' }, tilt: 'left' },
      ]),
    )
    expect(markup).toContain('🍌')
    expect(markup).toContain('🍓')
    expect(markup).toContain('🍎')
    expect(markup).toContain('🍇')
    expect(markup).toContain('<polygon') // fulcrum
  })

  it('5. renderShapeEquationSvg renders geometric equations and question mark box', () => {
    const markup = renderToStaticMarkup(
      renderShapeEquationSvg([
        { left: 'square', right: 'triangle', resultNested: { outer: 'square', inner: 'triangle' } },
        { left: 'pentagon', right: 'circle', resultNested: { outer: 'pentagon', inner: 'circle' } },
        { left: 'triangle', right: 'circle', isQuestion: true },
      ]),
    )
    expect(markup).toContain('<rect')
    expect(markup).toContain('<polygon')
    expect(markup).toContain('?')
  })

  it('6. renderGridMazeSvg renders vector maze with entrance and exits', () => {
    const markup = renderToStaticMarkup(renderGridMazeSvg())
    expect(markup).toContain('<svg')
    expect(markup).toContain('A')
    expect(markup).toContain('B')
    expect(markup).toContain('C')
    expect(markup).toContain('D')
    expect(markup).toContain('<line') // maze walls
  })

  it('7. renderGridPolylineSvg renders zigzag path on coordinate grid', () => {
    const markup = renderToStaticMarkup(
      renderGridPolylineSvg({
        cols: 6,
        rows: 2,
        points: [[0, 0], [2, 2], [4, 0], [5, 2], [6, 0]],
      }),
    )
    expect(markup).toContain('<polyline')
    expect(markup).toContain('<circle') // vertex dots
  })

  it('8. renderCakePartitionSvg renders equal and unequal cake partition variants', () => {
    const crossMarkup = renderToStaticMarkup(renderCakePartitionSvg({ variant: 'cross' }))
    expect(crossMarkup).toContain('stroke-dasharray')

    const unequalMarkup = renderToStaticMarkup(renderCakePartitionSvg({ variant: 'unequal_triangle', isWrong: true }))
    expect(unequalMarkup).toContain('stroke-dasharray')
  })

  it('9. renderSierpinskiTriangleSvg renders subdivided triangles', () => {
    const markup = renderToStaticMarkup(renderSierpinskiTriangleSvg({ depth: 1 }))
    expect(markup).toContain('<polygon')
  })

  it('10. renderGridShadedRatioSvg renders shaded grid areas and region labels', () => {
    const markup = renderToStaticMarkup(
      renderGridShadedRatioSvg({
        rows: 7,
        cols: 5,
        shadedCells: [[0, 0], [0, 1], [0, 2]],
        labels: [{ r: 1, c: 1, text: 'A' }],
      }),
    )
    expect(markup).toContain('fill="#94a3b8"')
    expect(markup).toContain('A')
  })

  it('11. renderScatteredCountingSvg renders black/white balls and rotated digits', () => {
    const ballsMarkup = renderToStaticMarkup(renderScatteredCountingSvg({ type: 'balls' }))
    expect(ballsMarkup).toContain('fill="#0f172a"')
    expect(ballsMarkup).toContain('fill="#ffffff"')

    const digitsMarkup = renderToStaticMarkup(renderScatteredCountingSvg({ type: 'digits' }))
    expect(digitsMarkup).toContain('rotate')
    expect(digitsMarkup).toContain('5')
    expect(digitsMarkup).toContain('9')
  })

  it('12. renderVerticalArithmeticTable renders column arithmetic with question box', () => {
    const markup = renderToStaticMarkup(renderVerticalArithmeticTable(21, '-', 17, '?'))
    expect(markup).toContain('21')
    expect(markup).toContain('-')
    expect(markup).toContain('17')
    expect(markup).toContain('?')
  })

  it('AsmoDiagramEngine and AsmoSvgDiagram resolve all ASMO diagram keys correctly', () => {
    const keys = [
      'q01_balls',
      'q02_digits',
      'q04_balance',
      'q05_grey_grid',
      'q08_shapes_equation',
      'q08_opt_A',
      'q09_opt_A',
      'q11_vertical_sub',
      'q14_puzzle',
      'q14_opt_A',
      'q15_maze',
      'q17_clock',
      'q20_opt_A',
      'q23_triangles',
      'q25_opt_A',
      'clock_3_30',
      'fraction_6_10',
    ]

    for (const key of keys) {
      const engineMarkup = renderToStaticMarkup(<AsmoDiagramEngine diagramKey={key} />)
      expect(engineMarkup.length).toBeGreaterThan(0)

      const svgMarkup = renderToStaticMarkup(<AsmoSvgDiagram diagramKey={key} />)
      expect(svgMarkup.length).toBeGreaterThan(0)
    }
  })
})
