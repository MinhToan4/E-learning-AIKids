export type CreativeKind = 'character' | 'art' | 'comic' | 'video'

export type CreativeDetails = {
  appearance?: string
  personality?: string
  preserve?: string
  styleId?: 'watercolor' | 'clay' | 'paper-cut'
  panelCount?: 2 | 4 | 6
  panels?: Array<{ action: string; dialogue?: string }>
  motion?: string
}

const artStyles = {
  watercolor: 'watercolor illustration with soft brush texture',
  clay: 'soft clay illustration with rounded handmade shapes',
  'paper-cut': 'layered paper-cut illustration with clear friendly shapes',
} as const

/** The server, not the browser, owns generation framing and safety cues. */
export function buildCreativePrompt(kind: CreativeKind, title: string, idea: string, details: CreativeDetails): string {
  switch (kind) {
    case 'character':
      return `${title}: ${idea}. Character appearance: ${details.appearance || 'friendly child-safe design'}. Personality: ${details.personality || 'curious and kind'}. Full body character sheet, simple pastel background, no text, no watermark.`
    case 'art':
      return `${idea}. Redraw this child-created idea as ${artStyles[details.styleId ?? 'clay']}. Preserve: ${details.preserve || 'the main subject, its pose and the important colors'}. No text, no watermark.`
    case 'comic':
      return `${title}: ${idea}. A ${details.panelCount ?? 4}-panel children's comic page with clear left-to-right visual storytelling. Panel plan: ${(details.panels ?? []).map((panel, index) => `Panel ${index + 1}: ${panel.action}${panel.dialogue ? `; mood or dialogue: ${panel.dialogue}` : ''}`).join(' | ') || 'show a clear beginning, challenge, action and ending'}. Consistent characters, no speech bubbles, no text, no watermark.`
    case 'video':
      return `${title}: ${idea}. Motion: ${details.motion || 'a gentle wave and a small joyful movement'}. A short child-safe scene, no on-screen text, no watermark.`
  }
}
