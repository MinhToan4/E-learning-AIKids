/** Deterministic SVG scene cards for mock AI image generation. */

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const PALETTES = [
  ['#6C5CE7', '#45C4F9', '#FFD166', '#F7F8FC'],
  ['#58D8A3', '#45C4F9', '#FF7A90', '#F0FFFB'],
  ['#FFD166', '#6C5CE7', '#58D8A3', '#FFF8E8'],
  ['#45C4F9', '#FF7A90', '#FFD166', '#EAF8FF'],
]

export function buildSceneSvg(seed: string, variant: number, odd?: boolean): string {
  const h = hash(seed + String(variant))
  const palette = PALETTES[h % PALETTES.length]
  const [primary, secondary, accent, bg] = palette
  const planetX = 220 + (h % 40)
  const starCount = 6 + (h % 5)
  const moons = odd ? 3 : 1

  const stars = Array.from({ length: starCount }, (_, i) => {
    const x = 20 + ((h + i * 47) % 360)
    const y = 20 + ((h + i * 29) % 180)
    const r = 1.5 + (i % 3)
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.85"/>`
  }).join('')

  const moonEls = Array.from({ length: moons }, (_, i) => {
    const x = 300 + i * 28
    const y = 48 + i * 12
    return `<circle cx="${x}" cy="${y}" r="10" fill="#FFE8A3" stroke="#F0C14B" stroke-width="2"/>`
  }).join('')

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280" role="img" aria-label="Minh họa cảnh AI an toàn">
  <defs>
    <linearGradient id="g${variant}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${secondary}" stop-opacity="0.35"/>
    </linearGradient>
    <filter id="s${variant}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#24304A" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="400" height="280" rx="24" fill="url(#g${variant})"/>
  ${stars}
  ${moonEls}
  <circle cx="${planetX}" cy="210" r="90" fill="${primary}" opacity="0.2"/>
  <ellipse cx="200" cy="240" rx="150" ry="28" fill="${primary}" opacity="0.12"/>
  <!-- Character: friendly space cat -->
  <g filter="url(#s${variant})" transform="translate(120,70)">
    <ellipse cx="80" cy="120" rx="54" ry="48" fill="#FFF7ED"/>
    <circle cx="80" cy="70" r="42" fill="#FFE4C7"/>
    <path d="M50 45 L42 12 L68 38 Z" fill="#FFE4C7"/>
    <path d="M110 45 L118 12 L92 38 Z" fill="#FFE4C7"/>
    <circle cx="66" cy="68" r="5" fill="#24304A"/>
    <circle cx="94" cy="68" r="5" fill="#24304A"/>
    <path d="M72 82 Q80 90 88 82" stroke="#24304A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="52" y="28" width="56" height="22" rx="11" fill="${secondary}"/>
    <circle cx="80" cy="39" r="6" fill="${accent}"/>
    <rect x="40" y="100" width="80" height="48" rx="16" fill="${primary}"/>
    <circle cx="48" cy="148" r="10" fill="${accent}"/>
    <circle cx="112" cy="148" r="10" fill="${accent}"/>
  </g>
  <rect x="16" y="16" width="120" height="28" rx="14" fill="#FFFFFF" opacity="0.9"/>
  <text x="28" y="35" font-family="Nunito, Baloo 2, sans-serif" font-size="13" font-weight="700" fill="#24304A">Phiên bản ${String.fromCharCode(65 + variant)}</text>
  ${odd ? `<rect x="16" y="236" width="220" height="28" rx="14" fill="#FFF1F2"/><text x="28" y="255" font-family="Nunito, Baloo 2, sans-serif" font-size="12" font-weight="700" fill="#C24156">Chi tiết lạ: ${moons} mặt trăng!</text>` : ''}
</svg>`.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function buildAvatarSvg(id: string, colors: [string, string]): string {
  const [a, b] = colors
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="36" fill="${a}"/>
  <circle cx="64" cy="52" r="28" fill="#FFF7ED"/>
  <circle cx="52" cy="50" r="4" fill="#24304A"/>
  <circle cx="76" cy="50" r="4" fill="#24304A"/>
  <path d="M54 62 Q64 70 74 62" stroke="#24304A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="64" cy="104" rx="34" ry="22" fill="${b}"/>
  <text x="64" y="20" text-anchor="middle" font-size="10" fill="#fff" font-family="sans-serif">${id.slice(0, 6)}</text>
</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function buildMascotSvg(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280" viewBox="0 0 280 280" role="img" aria-label="Robot Mực Màu">
  <defs>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6C5CE7"/>
      <stop offset="100%" stop-color="#45C4F9"/>
    </linearGradient>
  </defs>
  <circle cx="140" cy="140" r="120" fill="#EEEAFF"/>
  <ellipse cx="140" cy="210" rx="70" ry="18" fill="#6C5CE7" opacity="0.12"/>
  <!-- tentacles -->
  <path d="M90 180 Q70 220 88 240" stroke="#6C5CE7" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M110 190 Q100 230 118 250" stroke="#45C4F9" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M170 190 Q180 230 162 250" stroke="#58D8A3" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M190 180 Q210 220 192 240" stroke="#FFD166" stroke-width="14" fill="none" stroke-linecap="round"/>
  <!-- body -->
  <rect x="80" y="70" width="120" height="110" rx="36" fill="url(#ink)"/>
  <rect x="98" y="92" width="84" height="48" rx="18" fill="#F7F8FC"/>
  <circle cx="118" cy="116" r="8" fill="#24304A"/>
  <circle cx="162" cy="116" r="8" fill="#24304A"/>
  <circle cx="121" cy="113" r="3" fill="#fff"/>
  <circle cx="165" cy="113" r="3" fill="#fff"/>
  <rect x="124" y="132" width="32" height="8" rx="4" fill="#58D8A3"/>
  <!-- ink hat / palette -->
  <circle cx="140" cy="62" r="22" fill="#FF7A90"/>
  <circle cx="132" cy="58" r="5" fill="#FFD166"/>
  <circle cx="148" cy="64" r="5" fill="#45C4F9"/>
  <circle cx="140" cy="70" r="4" fill="#58D8A3"/>
  <!-- brush -->
  <rect x="196" y="100" width="10" height="56" rx="4" fill="#24304A"/>
  <path d="M196 100 L206 100 L216 78 L186 78 Z" fill="#FFD166"/>
</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
