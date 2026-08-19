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

    // Render $$block math$$ first
    let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        })
      } catch {
        return `<div class="katex-block-fallback">${math}</div>`
      }
    })

    // Render $inline math$
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

    // Preserve newlines
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
