/** Convert display/KaTeX text into a natural string for Vietnamese TTS. */
export function normalizeVietnameseSpeech(text: string): string {
  if (!text) return ''

  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\$+/g, ' ')
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '$1 phần $2')
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, 'căn bậc hai của $1')
    .replace(/\\text\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\times|×/g, ' nhân ')
    .replace(/\\div|÷|:/g, ' chia ')
    .replace(/\\geqslant|\\ge|≥/g, ' lớn hơn hoặc bằng ')
    .replace(/\\leqslant|\\le|≤/g, ' nhỏ hơn hoặc bằng ')
    .replace(/\\neq|≠/g, ' khác ')
    .replace(/(\d|\))\s*\+\s*(?=\d|\()/g, '$1 cộng ')
    .replace(/(\d|\))\s*[-−]\s*(?=\d|\()/g, '$1 trừ ')
    .replace(/(\d|\))\s*=\s*(?=\d|\(|\?)/g, '$1 bằng ')
    .replace(/\^\s*\{?([^}\s]+)\}?/g, ' mũ $1')
    .replace(/\\(?:quad|qquad|,|;|!)/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}\[\]_*#`~]/g, ' ')
    .replace(/□/g, ' ô trống ')
    .replace(/\?/g, ' bao nhiêu ')
    .replace(/🍎/g, ' táo đỏ ')
    .replace(/🍏/g, ' táo xanh ')
    .replace(/🧺/g, ' giỏ ')
    .replace(/[✨🎉⭐🏆💡🐱🎮➔]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim()
}
