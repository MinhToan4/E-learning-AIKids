export type StoryOutline = {
  opening: string
  problem: string
  ending: string
  title: string
}

export const STORY_OPENINGS = [
  { id: 'o1', label: 'Một buổi sáng trên hành tinh kẹo…', emoji: '🌅' },
  { id: 'o2', label: 'Trong thư viện mây, hai bạn gặp nhau…', emoji: '📚' },
  { id: 'o3', label: 'Tàu vũ trụ vừa đáp xuống…', emoji: '🚀' },
]

export const STORY_PROBLEMS = [
  { id: 'p1', label: 'Máy tạo cầu vồng bị hỏng!', emoji: '🌈' },
  { id: 'p2', label: 'Bản đồ ánh sáng bị mất!', emoji: '🗺️' },
  { id: 'p3', label: 'Cầu vồng bị kẹt trong đám mây!', emoji: '☁️' },
]

export const STORY_ENDINGS = [
  { id: 'e1', label: 'Hai bạn sửa máy và cầu vồng trở lại.', emoji: '✨' },
  { id: 'e2', label: 'Mọi người cùng vui mừng dưới cầu vồng.', emoji: '🎉' },
  { id: 'e3', label: 'Bạn robot được khen là anh hùng tí hon.', emoji: '🏅' },
]

/** Map 3-beat story → 4 comic panels (kids storyboard). */
export function storyToPanelHints(outline: {
  opening: string
  problem: string
  ending: string
  title: string
}): { panel: number; label: string; beat: string; tip: string }[] {
  const o = outline.opening || 'Mở đầu…'
  const p = outline.problem || 'Sự cố…'
  const e = outline.ending || 'Kết thúc…'
  return [
    {
      panel: 1,
      label: 'Mở màn',
      beat: o,
      tip: 'Giới thiệu nhân vật + nơi chốn',
    },
    {
      panel: 2,
      label: 'Sự cố',
      beat: p,
      tip: 'Cho thấy vấn đề bất ngờ',
    },
    {
      panel: 3,
      label: 'Hành động',
      beat: `Thử giải quyết: ${p}`,
      tip: 'Nhân vật làm gì để cứu tình huống?',
    },
    {
      panel: 4,
      label: 'Kết',
      beat: e,
      tip: 'Kết thúc vui + bài học nhỏ',
    },
  ]
}
