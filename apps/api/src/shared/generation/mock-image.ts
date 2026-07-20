/**
 * Deterministic mock "AI image" as SVG data URL — teaches practice without external APIs.
 */
export function mockGenerateImage(prompt: string, seed = 'default'): {
  id: string
  title: string
  imageDataUrl: string
  matches: { character: boolean; action: boolean; environment: boolean }
  oddDetail?: string
} {
  const lower = prompt.toLowerCase()
  const hasCat = lower.includes('mèo') || lower.includes('meo')
  const hasRobot = lower.includes('robot') || lower.includes('mực')
  const hasCandy = lower.includes('kẹo') || lower.includes('keo')
  const hasRainbow = lower.includes('cầu vồng') || lower.includes('cau vong')

  // Intentionally imperfect match when prompt is thin — detective quest
  const thin = prompt.length < 40
  const character = hasCat || hasRobot
  const action = lower.includes('nhảy') || lower.includes('sửa') || lower.includes('bay')
  const environment = hasCandy || lower.includes('mây') || lower.includes('rừng')

  const hue = Math.abs(hash(prompt + seed)) % 360
  const emoji = hasCat ? '🐱' : hasRobot ? '🤖' : '✨'
  const bg1 = `hsl(${hue} 70% 85%)`
  const bg2 = `hsl(${(hue + 40) % 360} 65% 78%)`
  const title = thin ? 'Ảnh thử (có thể lệch ý)' : 'Ảnh theo mô tả của con'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="480" height="360" rx="28" fill="url(#g)"/>
  <circle cx="240" cy="150" r="64" fill="white" opacity="0.9"/>
  <text x="240" y="168" text-anchor="middle" font-size="56">${emoji}</text>
  <text x="240" y="250" text-anchor="middle" font-family="Nunito,sans-serif" font-size="18" fill="#1e2740">${escapeXml(title)}</text>
  <text x="240" y="280" text-anchor="middle" font-family="Nunito,sans-serif" font-size="12" fill="#5c657a">${escapeXml(prompt.slice(0, 60))}</text>
  ${hasRainbow ? '<path d="M80 320 Q240 200 400 320" fill="none" stroke="#ff7b93" stroke-width="8" opacity="0.7"/>' : ''}
</svg>`

  return {
    id: `gen-${hash(prompt + seed)}`,
    title,
    imageDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    matches: {
      character: character && !thin,
      action: action && !thin,
      environment: environment && !thin,
    },
    oddDetail: thin ? 'Mô tả hơi ngắn — AI dễ vẽ lệch ý' : undefined,
  }
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
