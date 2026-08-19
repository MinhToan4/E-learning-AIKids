import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

type Props = {
  text: string
  className?: string
}

export function AsmoFormula({ text, className }: Props) {
  const html = useMemo(() => {
    if (!text) return ''

    let input = text

    // 1. Transform vertical arithmetic blocks (e.g. 1 7 \n + C D \n ------ \n 8 2) into clean Native HTML
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

      const op = opLine.includes('+') ? '+' : opLine.includes('-') ? '-' : opLine.toLowerCase().includes('x') ? '×' : '+'
      const opClean = opLine.replace(/[+\-*x]/gi, '').trim()

      const htmlCard = `<div class="inline-flex flex-col items-end my-3 py-2.5 px-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-xs font-mono font-bold text-lg text-slate-800 leading-relaxed">
        <div class="tracking-widest pr-1">${topLine}</div>
        <div class="flex items-center gap-3 border-b-2 border-slate-700 pb-1 tracking-widest">
          <span class="text-indigo-600 font-extrabold text-xl">${op}</span>
          <span>${opClean}</span>
        </div>
        <div class="pt-1 text-indigo-700 font-extrabold tracking-widest pr-1">${resLine}</div>
      </div>`

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

    // 3. Render $inline math$
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

    // 4. Render Visual Geometric Shapes as colorful Clay Badges
    processed = processed
      .replace(/\[\s*rectangle\s*\]/gi, '<span class="inline-flex items-center gap-1.5 rounded-xl bg-sky-100/90 border border-sky-300 px-2.5 py-0.5 text-xs font-bold text-sky-800 shadow-xs mx-0.5 align-middle"><svg class="size-3.5 fill-sky-600 shrink-0" viewBox="0 0 24 16"><rect width="24" height="16" rx="3"/></svg>Hình chữ nhật</span>')
      .replace(/\[\s*triangle\s*\]/gi, '<span class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shadow-xs mx-0.5 align-middle"><svg class="size-3.5 fill-emerald-600 shrink-0" viewBox="0 0 24 24"><polygon points="12,2 23,22 1,22"/></svg>Hình tam giác</span>')
      .replace(/\[\s*circle\s*\]/gi, '<span class="inline-flex items-center gap-1.5 rounded-xl bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800 shadow-xs mx-0.5 align-middle"><svg class="size-3.5 fill-amber-500 shrink-0" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>Hình tròn</span>')
      .replace(/\[\s*square\s*\]/gi, '<span class="inline-flex items-center gap-1.5 rounded-xl bg-purple-100/90 border border-purple-300 px-2.5 py-0.5 text-xs font-bold text-purple-800 shadow-xs mx-0.5 align-middle"><svg class="size-3.5 fill-purple-600 shrink-0" viewBox="0 0 24 24"><rect width="20" height="20" rx="3" x="2" y="2"/></svg>Hình vuông</span>')
      .replace(/\[\s*star\s*\]/gi, '<span class="inline-flex items-center gap-1.5 rounded-xl bg-yellow-100/90 border border-yellow-300 px-2.5 py-0.5 text-xs font-bold text-yellow-800 shadow-xs mx-0.5 align-middle">⭐ Ngôi sao</span>')
      .replace(/\[\s*heart\s*\]/gi, '<span class="inline-flex items-center gap-1.5 rounded-xl bg-rose-100/90 border border-rose-300 px-2.5 py-0.5 text-xs font-bold text-rose-800 shadow-xs mx-0.5 align-middle">💖 Trái tim</span>')
      .replace(/\[\s*\?\s*\]/gi, '<span class="inline-flex items-center justify-center rounded-xl bg-rose-50 border-2 border-dashed border-rose-400 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 shadow-xs mx-0.5 align-middle animate-pulse">❓ [ ? ]</span>')

    // 5. Preserve line breaks
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
