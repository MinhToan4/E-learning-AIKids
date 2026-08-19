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

    // 1. Transform vertical arithmetic blocks (e.g. 1 7 \n + C D \n ------ \n 8 2) into KaTeX
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

      const op = opLine.includes('+') ? '+' : opLine.includes('-') ? '-' : opLine.toLowerCase().includes('x') ? '\\times' : ''
      const opClean = opLine.replace(/[+\-*x]/gi, '').trim()

      const formatTokens = (str: string) => {
        return str
          .replace(/\s+/g, '')
          .split('')
          .map((c) => (/[a-zA-Z]/.test(c) ? `\\text{${c}}` : c))
          .join('\\;')
      }

      const topFmt = formatTokens(topLine)
      const opFmt = formatTokens(opClean)
      const resFmt = formatTokens(resLine)

      const latexBlock = `$$\\begin{array}{r@{\\quad}l} & ${topFmt} \\\\ ${op} & ${opFmt} \\\\ \\hline & ${resFmt} \\end{array}$$`

      const before = lines.slice(0, dashIdx - 2)
      const after = lines.slice(dashIdx + 2)
      input = [...before, latexBlock, ...after].join('\n\n')
    }

    // 2. Render $$block math$$ first
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
