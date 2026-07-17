/** Cute deterministic SVG scenes & characters — original, kid-safe. */

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const PALETTES = [
  ['#7C6CF0', '#5ED0FF', '#FFD56A', '#FFF8FF'],
  ['#5EE4B0', '#7C6CF0', '#FF8FA3', '#F0FFF8'],
  ['#FFD56A', '#7C6CF0', '#5EE4B0', '#FFF9E8'],
  ['#5ED0FF', '#FF8FA3', '#FFD56A', '#EEF9FF'],
]

export function buildSceneSvg(seed: string, variant: number, odd?: boolean): string {
  const h = hash(seed + String(variant))
  const palette = PALETTES[h % PALETTES.length]
  const [primary, secondary, accent, bg] = palette
  const planetX = 210 + (h % 50)
  const starCount = 8 + (h % 4)
  const moons = odd ? 3 : 1

  const stars = Array.from({ length: starCount }, (_, i) => {
    const x = 18 + ((h + i * 53) % 360)
    const y = 18 + ((h + i * 31) % 160)
    const r = 1.8 + (i % 3)
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.9"/>`
  }).join('')

  const moonEls = Array.from({ length: moons }, (_, i) => {
    const x = 292 + i * 30
    const y = 44 + i * 14
    return `<g>
      <circle cx="${x}" cy="${y}" r="12" fill="#FFE9A8" stroke="#F0C14B" stroke-width="2"/>
      <circle cx="${x - 3}" cy="${y - 2}" r="2" fill="#F0C14B" opacity="0.45"/>
    </g>`
  }).join('')

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280" role="img" aria-label="Minh họa cảnh AI an toàn">
  <defs>
    <linearGradient id="sky${variant}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${secondary}" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="hill${variant}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.35"/>
    </linearGradient>
    <filter id="soft${variant}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#24304A" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="400" height="280" rx="28" fill="url(#sky${variant})"/>
  ${stars}
  ${moonEls}
  <ellipse cx="${planetX}" cy="250" rx="160" ry="70" fill="url(#hill${variant})"/>
  <circle cx="320" cy="90" r="34" fill="${accent}" opacity="0.85"/>
  <circle cx="332" cy="82" r="8" fill="#fff" opacity="0.35"/>
  <!-- Cute space cat -->
  <g filter="url(#soft${variant})" transform="translate(118,68)">
    <ellipse cx="80" cy="128" rx="58" ry="50" fill="#FFF4E8"/>
    <circle cx="80" cy="72" r="44" fill="#FFE0C2"/>
    <path d="M48 48 L38 10 L70 40 Z" fill="#FFE0C2"/>
    <path d="M112 48 L122 10 L90 40 Z" fill="#FFE0C2"/>
    <path d="M48 48 L38 10 L70 40 Z" fill="${primary}" opacity="0.25"/>
    <circle cx="64" cy="70" r="6" fill="#24304A"/>
    <circle cx="96" cy="70" r="6" fill="#24304A"/>
    <circle cx="66" cy="68" r="2" fill="#fff"/>
    <circle cx="98" cy="68" r="2" fill="#fff"/>
    <ellipse cx="56" cy="82" rx="8" ry="5" fill="#FFB4C0" opacity="0.7"/>
    <ellipse cx="104" cy="82" rx="8" ry="5" fill="#FFB4C0" opacity="0.7"/>
    <path d="M70 86 Q80 96 90 86" stroke="#24304A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <rect x="48" y="28" width="64" height="24" rx="12" fill="${secondary}"/>
    <circle cx="80" cy="40" r="7" fill="${accent}"/>
    <rect x="38" y="104" width="84" height="52" rx="20" fill="${primary}"/>
    <circle cx="44" cy="156" r="12" fill="${accent}"/>
    <circle cx="116" cy="156" r="12" fill="${accent}"/>
    <!-- sparkles -->
    <path d="M18 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="${accent}"/>
    <path d="M148 58 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" fill="#fff"/>
  </g>
  <rect x="14" y="14" width="128" height="32" rx="16" fill="#FFFFFF" opacity="0.94"/>
  <text x="28" y="35" font-family="Nunito, Baloo 2, sans-serif" font-size="14" font-weight="800" fill="#24304A">Phiên bản ${String.fromCharCode(65 + variant)}</text>
  ${
    odd
      ? `<rect x="14" y="232" width="236" height="32" rx="16" fill="#FFF0F3"/><text x="28" y="253" font-family="Nunito, sans-serif" font-size="13" font-weight="800" fill="#C24156">Chi tiết lạ: ${moons} mặt trăng!</text>`
      : ''
  }
</svg>`.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const FACE: Record<string, { ear: string; accent: string }> = {
  cloud: { ear: 'fox', accent: '#45C4F9' },
  mint: { ear: 'bot', accent: '#58D8A3' },
  sun: { ear: 'owl', accent: '#FFD166' },
  whale: { ear: 'round', accent: '#FF7A90' },
  bear: { ear: 'round', accent: '#45C4F9' },
  rabbit: { ear: 'tall', accent: '#C4B5FD' },
  panda: { ear: 'round', accent: '#58D8A3' },
  otter: { ear: 'round', accent: '#FFD166' },
}

export function buildAvatarSvg(id: string, colors: [string, string]): string {
  const [a, b] = colors
  const kind = Object.keys(FACE).find((k) => id.includes(k)) ?? 'cloud'
  const style = FACE[kind]
  const ears =
    style.ear === 'tall'
      ? `<ellipse cx="40" cy="28" rx="10" ry="22" fill="#FFF4E8"/><ellipse cx="88" cy="28" rx="10" ry="22" fill="#FFF4E8"/>`
      : style.ear === 'fox'
        ? `<path d="M34 48 L28 14 L58 42 Z" fill="#FFF4E8"/><path d="M94 48 L100 14 L70 42 Z" fill="#FFF4E8"/><path d="M34 48 L28 14 L58 42 Z" fill="${a}" opacity="0.35"/>`
        : style.ear === 'bot'
          ? `<rect x="36" y="22" width="12" height="18" rx="4" fill="${b}"/><rect x="80" y="22" width="12" height="18" rx="4" fill="${b}"/>`
          : `<circle cx="40" cy="36" r="12" fill="#FFF4E8"/><circle cx="88" cy="36" r="12" fill="#FFF4E8"/>`

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="40" fill="url(#bg${id})"/>
  <circle cx="96" cy="28" r="14" fill="#fff" opacity="0.18"/>
  ${ears}
  <circle cx="64" cy="62" r="32" fill="#FFF4E8"/>
  <circle cx="52" cy="60" r="5" fill="#24304A"/>
  <circle cx="76" cy="60" r="5" fill="#24304A"/>
  <circle cx="54" cy="58" r="1.8" fill="#fff"/>
  <circle cx="78" cy="58" r="1.8" fill="#fff"/>
  <ellipse cx="44" cy="70" rx="7" ry="4" fill="#FFB4C0" opacity="0.75"/>
  <ellipse cx="84" cy="70" rx="7" ry="4" fill="#FFB4C0" opacity="0.75"/>
  <path d="M54 74 Q64 84 74 74" stroke="#24304A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="64" cy="108" rx="30" ry="16" fill="#fff" opacity="0.28"/>
  <circle cx="64" cy="104" r="10" fill="${style.accent}"/>
</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function buildMascotSvg(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="Robot Mực Màu">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7C6CF0"/>
      <stop offset="100%" stop-color="#5ED0FF"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE8FF"/>
      <stop offset="100%" stop-color="#E0F7FF"/>
    </linearGradient>
  </defs>
  <circle cx="160" cy="160" r="140" fill="url(#glow)"/>
  <ellipse cx="160" cy="248" rx="78" ry="18" fill="#7C6CF0" opacity="0.12"/>
  <!-- soft tentacles -->
  <path d="M96 210 Q70 250 92 272" stroke="#7C6CF0" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M120 220 Q104 264 124 284" stroke="#5ED0FF" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M200 220 Q216 264 196 284" stroke="#5EE4B0" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M224 210 Q250 250 228 272" stroke="#FFD56A" stroke-width="16" fill="none" stroke-linecap="round"/>
  <!-- cute suction cups -->
  <circle cx="92" cy="272" r="7" fill="#FF8FA3"/>
  <circle cx="124" cy="284" r="6" fill="#FFD56A"/>
  <circle cx="196" cy="284" r="6" fill="#5ED0FF"/>
  <circle cx="228" cy="272" r="7" fill="#5EE4B0"/>
  <!-- body -->
  <rect x="92" y="78" width="136" height="128" rx="44" fill="url(#body)"/>
  <rect x="112" y="104" width="96" height="56" rx="22" fill="#F8FBFF"/>
  <circle cx="136" cy="130" r="10" fill="#24304A"/>
  <circle cx="184" cy="130" r="10" fill="#24304A"/>
  <circle cx="140" cy="126" r="3.5" fill="#fff"/>
  <circle cx="188" cy="126" r="3.5" fill="#fff"/>
  <rect x="142" y="148" width="36" height="10" rx="5" fill="#5EE4B0"/>
  <!-- paint palette hat -->
  <ellipse cx="160" cy="72" rx="34" ry="22" fill="#FF8FA3"/>
  <circle cx="146" cy="68" r="7" fill="#FFD56A"/>
  <circle cx="164" cy="62" r="7" fill="#5ED0FF"/>
  <circle cx="176" cy="74" r="7" fill="#5EE4B0"/>
  <circle cx="156" cy="78" r="5" fill="#7C6CF0"/>
  <!-- brush -->
  <rect x="228" y="112" width="12" height="64" rx="5" fill="#24304A"/>
  <path d="M228 112 L240 112 L252 84 L216 84 Z" fill="#FFD56A"/>
  <!-- hearts -->
  <path d="M64 96 C64 88 74 84 80 92 C86 84 96 88 96 96 C96 108 80 118 80 118 C80 118 64 108 64 96 Z" fill="#FF8FA3" opacity="0.9"/>
</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
