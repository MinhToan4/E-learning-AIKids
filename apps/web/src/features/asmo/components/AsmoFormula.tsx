import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

type Props = {
  text: string
  className?: string
}

const ALLOWED_MATH_FUNCS = new Set([
  'sin',
  'cos',
  'tan',
  'cot',
  'sec',
  'csc',
  'log',
  'ln',
  'exp',
  'lim',
  'max',
  'min',
  'gcd',
  'lcm',
  'arcsin',
  'arccos',
  'arctan',
  'sinh',
  'cosh',
  'tanh',
  'det',
  'deg',
])

export function isAutoWrapEligibleMath(expr: string): boolean {
  if (!expr) return false

  // If it contains non-ASCII characters (e.g. Vietnamese diacritics like á, à, ả, ã, ạ, ơ, ư, đ...), it is natural language text
  if (/[^\x00-\x7F]/.test(expr)) {
    return false
  }

  // Remove LaTeX command names (e.g., \frac, \sqrt, \alpha, \sum) so they don't count as non-math words
  const stripped = expr.replace(/\\[a-zA-Z]+/g, '')

  // Extract all remaining alphabetical words
  const words = stripped.match(/[a-zA-Z]+/g) || []

  // Check every word:
  // If any word has length >= 2 and is NOT an allowed standard math function, reject!
  for (const w of words) {
    if (w.length >= 2 && !ALLOWED_MATH_FUNCS.has(w.toLowerCase())) {
      return false
    }
  }

  // Must contain at least one mathematical indicator:
  // - LaTeX command (\)
  // - Power (^)
  // - Subscript (_)
  // - Single-letter math variable or recognized standard math function
  const hasLatexOrPowerOrSub = expr.includes('\\') || expr.includes('^') || expr.includes('_')
  const hasMathWord = words.length > 0

  return hasLatexOrPowerOrSub || hasMathWord
}

/**
 * Auto-Math Fallback Engine:
 * Intelligently scans raw strings for LaTeX commands (\ln(3), \frac{a}{b}, \sqrt{x}, \alpha, \pi...)
 * or mathematical power/algebraic expressions (e^(2x) - 4e^x + 3 = 0, a^b, x^2 - 4 = 0)
 * that lack standard '$ ... $' delimiters, and wraps them so KaTeX renders them seamlessly.
 */
export function autoWrapMath(text: string): string {
  if (!text) return ''

  // 0. Protect escaped dollar currency symbols
  const ESC_DOLLAR = '___ASMO_ESC_DOLLAR___'
  let inputStr = text.replace(/\\\$/g, ESC_DOLLAR)

  // 1. Tokenize HTML tags and existing math blocks ($$...$$ and $...$)
  const tokens: string[] = []
  const placeholder = (idx: number) => `___ASMO_MATH_TOKEN_${idx}___`

  let s = inputStr.replace(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|<[^>]+>)/g, (m) => {
    const idx = tokens.length
    tokens.push(m)
    return placeholder(idx)
  })

  // 2. Normalize ^(expression) -> ^{expression}
  s = s.replace(/\^\(([^)]+)\)/g, '^{$1}')

  // 3. Detect algebraic equations with powers, functions, variables, or latex commands:
  // e.g. e^{2x} - 4e^x + 3 = 0, x^2 - 4 = 0, 2^{2x} - 5(2^x) + 4 = 0, y = 2x^2 - 8x + 5
  s = s.replace(
    /(?:(?<=\s|^|[([«"'])(?:[a-zA-Z0-9_{}^\\()]+(?:\s*[+\-*/·×÷]\s*[a-zA-Z0-9_{}^\\()]+|\s*\([^)]+\))*\s*=\s*[a-zA-Z0-9_{}^\\()]+(?:\s*[+\-*/·×÷]\s*[a-zA-Z0-9_{}^\\()]+)*)(?=\s|$|[)\]»"';,?!]))/g,
    (m) => {
      if (isAutoWrapEligibleMath(m)) {
        return `$${m.trim()}$`
      }
      return m
    }
  )

  // 4. Detect standalone LaTeX commands like \ln(3), \frac{a}{b}, \sqrt{x}, \alpha, \beta, \pi
  // Also clauses like 0, \ln(3) or \frac{1}{2} + \frac{3}{4} or \alpha + \beta
  s = s.replace(
    /(?:(?<=\s|^|[([«"'])(?:-?[a-zA-Z0-9_{}^()]+\s*,\s*)?\\[a-zA-Z]+(?:\{[^}]*\}|\([^)]*\))*(?:\s*[+\-*/^_\\()]\s*\\?[a-zA-Z0-9_{}^\\()]+)*(?=\s|$|[)\]»"';,?!]))/g,
    (m) => {
      return `$${m.trim()}$`
    }
  )

  // 5. Detect standalone power expressions like x^2, a^b, 2^{10}, (x+1)^2
  s = s.replace(
    /(?:(?<=\s|^|[([«"'])(?:[a-zA-Z0-9()]|\([^)]+\))\^\{?[a-zA-Z0-9+-]+(?:\}?)?(?=\s|$|[)\]»"';,?!]))/g,
    (m) => {
      return `$${m.trim()}$`
    }
  )

  // Restore protected tokens
  for (let i = 0; i < tokens.length; i++) {
    s = s.replace(placeholder(i), tokens[i])
  }

  // Restore escaped dollars
  s = s.replace(new RegExp(ESC_DOLLAR, 'g'), '\\$')

  return s
}

export function AsmoFormula({ text, className }: Props) {
  const html = useMemo(() => {
    if (!text) return ''

    let input = text

    // 1. Transform vertical arithmetic blocks (e.g. 1 7 \n + C D \n ------ \n 8 2) into pixel-perfect grid aligned HTML
    const lines = input.split('\n')
    let dashIdx = -1
    for (let i = 0; i < lines.length; i++) {
      if (/^-{3,}$/.test(lines[i].trim())) {
        dashIdx = i
        break
      }
    }

    if (dashIdx >= 2 && dashIdx < lines.length - 1) {
      const topLine = lines[dashIdx - 2].trim()
      const opLine = lines[dashIdx - 1].trim()
      const resLine = lines[dashIdx + 1].trim()

      const op = opLine.includes('-') ? '−' : opLine.includes('+') ? '+' : opLine.toLowerCase().includes('x') ? '×' : '−'
      const opClean = opLine.replace(/[+\-*x−]/gi, '').trim()

      const topDigits = topLine.replace(/\s+/g, '').split('')
      const opDigits = opClean.replace(/\s+/g, '').split('')
      const numCols = Math.max(topDigits.length, opDigits.length, 2)

      const pad = (arr: string[]) => {
        const res = [...arr]
        while (res.length < numCols) res.unshift('')
        return res
      }

      const pTop = pad(topDigits)
      const pOp = pad(opDigits)

      const topTds = pTop.map(d => `<td style="width:2.25rem;height:2.75rem;text-align:center;font-size:1.75rem;font-weight:700;color:#0f172a;">${d}</td>`).join('')
      const opTds = pOp.map(d => `<td style="width:2.25rem;height:2.75rem;text-align:center;font-size:1.75rem;font-weight:700;color:#0f172a;">${d}</td>`).join('')
      
      const isMysteryResult = resLine.includes('[') || resLine.includes('?')
      const resTd = isMysteryResult
        ? `<td colspan="${numCols}" style="text-align:center;padding-top:0.35rem;"><span style="display:inline-flex;align-items:center;justify-content:center;padding:0.25rem 0.85rem;border-radius:0.75rem;background:#fff1f2;border:2px dashed #f43f5e;color:#e11d48;font-size:1.35rem;font-weight:900;">[ ? ]</span></td>`
        : pad(resLine.replace(/\s+/g, '').split('')).map(d => `<td style="width:2.25rem;height:2.75rem;text-align:center;font-size:1.75rem;font-weight:800;color:#4338ca;">${d}</td>`).join('')

      const htmlCard = `<div style="display:flex;justify-content:center;margin:1.25rem auto;"><div style="display:inline-flex;flex-direction:column;align-items:center;padding:1.25rem 2.25rem;border-radius:1.75rem;background:#ffffff;border:2px solid #e2e8f0;box-shadow:0 4px 14px rgba(0,0,0,0.06);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;user-select:none;"><table style="border-collapse:collapse;border-spacing:0;margin:0;padding:0;"><tbody><tr><td style="width:2rem;"></td>${topTds}</tr><tr><td style="width:2rem;height:2.75rem;text-align:center;font-size:2rem;font-weight:900;color:#6366f1;line-height:1;">${op}</td>${opTds}</tr><tr><td colspan="${numCols + 1}" style="border-top:3.5px solid #1e293b;height:0;padding:0;"></td></tr><tr><td></td>${resTd}</tr></tbody></table></div></div>`.replace(/\s*\n\s*/g, '')

      const before = lines.slice(0, dashIdx - 2)
      const after = lines.slice(dashIdx + 2)
      input = [...before, htmlCard, ...after].join('\n\n')
    }

    // 2. Transform Bar Chart lists into colorful Visual Mini Bar Charts
    if (input.includes('Bar Chart') || input.includes('Colours of Balloons')) {
      input = input.replace(/(?:Bar Chart[^\n]*\n)([\s\S]*?)(?=\n\n|$)/i, (full, list) => {
        const itemLines = list.split('\n').filter((l: string) => l.includes(':'))
        if (itemLines.length === 0) return full

        const colorMap: Record<string, string> = {
          red: 'bg-rose-500 text-rose-50 border-rose-600',
          yellow: 'bg-amber-400 text-amber-950 border-amber-500',
          black: 'bg-slate-800 text-white border-slate-900',
          blue: 'bg-sky-500 text-white border-sky-600',
          white: 'bg-slate-100 text-slate-800 border-slate-300',
          green: 'bg-emerald-500 text-white border-emerald-600',
          purple: 'bg-purple-500 text-white border-purple-600',
          orange: 'bg-orange-500 text-white border-orange-600',
        }

        const bars = itemLines
          .map((item: string) => {
            const [label, valStr] = item.split(':').map((s: string) => s.trim())
            const val = parseInt(valStr, 10) || 10
            const clrKey = label.toLowerCase()
            const clrClass = colorMap[clrKey] || 'bg-indigo-500 text-white border-indigo-600'
            const widthPct = Math.min(Math.max((val / 20) * 100, 15), 100)

            return `<div class="flex items-center gap-2 text-xs font-bold">
              <span class="w-16 shrink-0 text-slate-700 text-right capitalize">${label}:</span>
              <div class="flex-1 bg-slate-100 rounded-full h-6 p-0.5 overflow-hidden border border-slate-200">
                <div class="h-full rounded-full flex items-center justify-end px-2 text-[11px] font-extrabold ${clrClass} transition-all duration-500" style="width: ${widthPct}%;">
                  ${val}
                </div>
              </div>
            </div>`
          })
          .join('')

        return `<div class="my-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-2 max-w-md">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
            📊 Biểu Đồ Cột (Bar Chart)
          </div>
          ${bars}
        </div>`
      })
    }

    // 2.5 Transform Visual Geometric Sequence (e.g. [Rectangle], [Triangle], [Circle], ...) into a pure visual Shape Ribbon without text
    const shapeSequencePattern = /(\[\s*(?:Rectangle|Triangle|Circle|Square|\?)\s*\](?:[\s,]+\[\s*(?:Rectangle|Triangle|Circle|Square|\?)\s*\]){2,})/gi
    input = input.replace(shapeSequencePattern, (rawSeq) => {
      const tokens = rawSeq.match(/\[\s*(.*?)\s*\]/g) || []
      const tiles = tokens
        .map((tok, idx) => {
          const s = tok.replace(/[\[\]\s]/g, '').toLowerCase()
          let tileHtml = ''
          if (s.includes('rect')) {
            tileHtml = `<div class="size-11 sm:size-12 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-xs flex items-center justify-center shrink-0 hover:scale-105 transition-transform" title="Rectangle"><svg class="size-7 fill-sky-500 drop-shadow-xs" viewBox="0 0 24 16"><rect width="24" height="16" rx="3"/></svg></div>`
          } else if (s.includes('tri')) {
            tileHtml = `<div class="size-11 sm:size-12 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-xs flex items-center justify-center shrink-0 hover:scale-105 transition-transform" title="Triangle"><svg class="size-7 fill-emerald-500 drop-shadow-xs" viewBox="0 0 24 24"><polygon points="12,2 23,22 1,22"/></svg></div>`
          } else if (s.includes('circ')) {
            tileHtml = `<div class="size-11 sm:size-12 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs flex items-center justify-center shrink-0 hover:scale-105 transition-transform" title="Circle"><svg class="size-7 fill-amber-500 drop-shadow-xs" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></div>`
          } else if (s.includes('squ')) {
            tileHtml = `<div class="size-11 sm:size-12 rounded-2xl bg-purple-50 border-2 border-purple-300 shadow-xs flex items-center justify-center shrink-0 hover:scale-105 transition-transform" title="Square"><svg class="size-7 fill-purple-500 drop-shadow-xs" viewBox="0 0 24 24"><rect width="20" height="20" rx="3" x="2" y="2"/></svg></div>`
          } else if (s.includes('?')) {
            tileHtml = `<div class="size-11 sm:size-12 rounded-2xl bg-rose-50 border-2 border-dashed border-rose-400 shadow-xs flex items-center justify-center shrink-0 text-rose-600 font-extrabold text-xl animate-pulse ring-2 ring-rose-200" title="Missing Shape">?</div>`
          }

          return tileHtml
            ? `<div class="flex flex-col items-center gap-1"><div class="text-[10px] font-mono font-bold text-slate-400">#${idx + 1}</div>${tileHtml}</div>`
            : ''
        })
        .join('')

      return `<div class="my-3.5 p-3 sm:p-4 rounded-3xl bg-slate-50/90 border border-slate-200/80 shadow-xs flex flex-col gap-2">
        <div class="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          🧩 Dãy quy luật hình học:
        </div>
        <div class="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
          ${tiles}
        </div>
      </div>`
    })

    // 2.8 Protect escaped currency dollars
    const ESC_DOLLAR = '___ASMO_ESC_DOLLAR___'
    input = input.replace(/\\\$/g, ESC_DOLLAR)

    // 2.9 Auto-Math Fallback: Detect unwrapped LaTeX & exponents/equations
    input = autoWrapMath(input)

    // 3. Render $$block math$$ first
    let processed = input.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        })
      } catch {
        return `<div class="katex-block-fallback">${math}</div>`
      }
    })

    // 4. Render $inline math$
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        })
      } catch {
        return `<span class="katex-inline-fallback">${math}</span>`
      }
    })

    // Restore escaped dollars as plain $
    processed = processed.replace(new RegExp(ESC_DOLLAR, 'g'), '$')

    // 5. Standalone Shape Tags & Option Shape Icons
    processed = processed
      .replace(/\[\s*rectangle\s*\]/gi, '<span class="inline-flex items-center justify-center size-7 rounded-lg bg-sky-100 border border-sky-300 mx-1 align-middle"><svg class="size-4 fill-sky-600" viewBox="0 0 24 16"><rect width="24" height="16" rx="2"/></svg></span>')
      .replace(/\[\s*triangle\s*\]/gi, '<span class="inline-flex items-center justify-center size-7 rounded-lg bg-emerald-100 border border-emerald-300 mx-1 align-middle"><svg class="size-4 fill-emerald-600" viewBox="0 0 24 24"><polygon points="12,2 23,22 1,22"/></svg></span>')
      .replace(/\[\s*circle\s*\]/gi, '<span class="inline-flex items-center justify-center size-7 rounded-lg bg-amber-100 border border-amber-300 mx-1 align-middle"><svg class="size-4 fill-amber-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></span>')
      .replace(/\[\s*square\s*\]/gi, '<span class="inline-flex items-center justify-center size-7 rounded-lg bg-purple-100 border border-purple-300 mx-1 align-middle"><svg class="size-4 fill-purple-600" viewBox="0 0 24 24"><rect width="20" height="20" rx="3" x="2" y="2"/></svg></span>')
      .replace(/\[\s*\?\s*\]/gi, '<span class="inline-flex items-center justify-center size-7 rounded-lg bg-rose-50 border-2 border-dashed border-rose-400 font-extrabold text-xs text-rose-700 mx-1 align-middle animate-pulse">?</span>')
      // Shape keywords in options
      .replace(/\bRectangle\b/g, '<span class="inline-flex items-center gap-1 text-sky-700 font-bold"><svg class="size-3.5 fill-sky-500 shrink-0" viewBox="0 0 24 16"><rect width="24" height="16" rx="2"/></svg>Rectangle</span>')
      .replace(/\bTriangle\b/g, '<span class="inline-flex items-center gap-1 text-emerald-700 font-bold"><svg class="size-3.5 fill-emerald-500 shrink-0" viewBox="0 0 24 24"><polygon points="12,2 23,22 1,22"/></svg>Triangle</span>')
      .replace(/\bCircle\b/g, '<span class="inline-flex items-center gap-1 text-amber-700 font-bold"><svg class="size-3.5 fill-amber-500 shrink-0" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>Circle</span>')
      .replace(/\bSquare\b/g, '<span class="inline-flex items-center gap-1 text-purple-700 font-bold"><svg class="size-3.5 fill-purple-500 shrink-0" viewBox="0 0 24 24"><rect width="20" height="20" rx="3" x="2" y="2"/></svg>Square</span>')

    // 5.5 Markdown typography: Parse **bold** and *italic*
    processed = processed
      .replace(/\*\*([^*]+?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>')
      .replace(/(?<!\*)\*([^\s*](?:[^*]*?[^\s*])?)\*(?!\*)/g, '<em class="italic">$1</em>')

    // 6. Preserve line breaks
    processed = processed.replace(/\n/g, '<br />')

    return processed
  }, [text])

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
