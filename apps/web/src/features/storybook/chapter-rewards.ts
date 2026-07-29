const key = (userId: string) => `aikids.storybook.chapter-rewards.${userId}`

export function readClaimedChapterStickers(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key(userId)) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function claimChapterSticker(userId: string, stickerId: string): string[] {
  const next = [...new Set([...readClaimedChapterStickers(userId), stickerId])]
  localStorage.setItem(key(userId), JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('aikids:chapter-reward', { detail: next }))
  return next
}
