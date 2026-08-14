export const ACHIEVEMENT_EVOLUTION_TIERS = [
  { key: 'sprout', label: 'Mầm xanh' },
  { key: 'companion', label: 'Đồng hành' },
  { key: 'silver', label: 'Bạc sáng' },
  { key: 'gold', label: 'Vàng rực' },
  { key: 'crystal', label: 'Pha lê' },
  { key: 'diamond', label: 'Kim cương' },
  { key: 'legend', label: 'Huyền thoại' },
] as const

export const ACHIEVEMENT_METRICS = [
  { value: 'lessons_completed', label: 'Bài học hoàn thành', unit: 'bài', source: 'LMS' },
  { value: 'perfect_lessons', label: 'Bài học đạt điểm hoàn hảo', unit: 'bài', source: 'Assessment' },
  { value: 'courses_completed', label: 'Khóa học hoàn thành', unit: 'khóa', source: 'LMS' },
  { value: 'stars', label: 'Tổng sao học tập', unit: 'sao', source: 'Gamification' },
  { value: 'xp', label: 'Tổng XP', unit: 'XP', source: 'Gamification' },
  { value: 'level', label: 'Cấp độ XP', unit: 'cấp', source: 'Gamification' },
  { value: 'streak', label: 'Chuỗi ngày học', unit: 'ngày', source: 'Gamification' },
  { value: 'quests_completed', label: 'Nhiệm vụ hoàn thành', unit: 'nhiệm vụ', source: 'Quest' },
  { value: 'challenges_completed', label: 'Thử thách hoàn thành', unit: 'thử thách', source: 'Challenge' },
  { value: 'events_joined', label: 'Sự kiện đã tham gia', unit: 'sự kiện', source: 'Event' },
  { value: 'creations_published', label: 'Tác phẩm đã xuất bản', unit: 'tác phẩm', source: 'Creative' },
  { value: 'images_created', label: 'Hình ảnh đã tạo', unit: 'ảnh', source: 'Creative' },
  { value: 'stories_created', label: 'Câu chuyện đã tạo', unit: 'truyện', source: 'Creative' },
  { value: 'code_projects_created', label: 'Dự án code đã tạo', unit: 'dự án', source: 'Creative' },
  { value: 'collaborations_completed', label: 'Lượt hợp tác hoàn thành', unit: 'lượt', source: 'Social' },
] as const

export const ACHIEVEMENT_OPERATORS = [
  { value: 'gte', label: 'Ít nhất (≥)' },
  { value: 'eq', label: 'Bằng (=)' },
] as const

export const ACHIEVEMENT_EVENT_DICTIONARY = {
  lessons_completed: { event: 'lesson.completed', scope: 'learner' },
  perfect_lessons: { event: 'assessment.perfect_score', scope: 'learner' },
  courses_completed: { event: 'course.completed', scope: 'learner' },
  stars: { event: 'gamification.stars_changed', scope: 'learner' },
  xp: { event: 'gamification.xp_changed', scope: 'learner' },
  level: { event: 'gamification.level_changed', scope: 'learner' },
  streak: { event: 'learning.streak_changed', scope: 'learner' },
  quests_completed: { event: 'quest.completed', scope: 'learner' },
  challenges_completed: { event: 'challenge.completed', scope: 'learner' },
  events_joined: { event: 'event.joined', scope: 'learner' },
  creations_published: { event: 'creation.published', scope: 'learner' },
  images_created: { event: 'creation.image_created', scope: 'learner' },
  stories_created: { event: 'creation.story_created', scope: 'learner' },
  code_projects_created: { event: 'creation.code_project_created', scope: 'learner' },
  collaborations_completed: { event: 'social.collaboration_completed', scope: 'learner' },
} as const satisfies Record<(typeof ACHIEVEMENT_METRICS)[number]['value'], { event: string; scope: 'learner' | 'course' | 'class' }>

export const ACHIEVEMENT_METRIC_REGISTRY = ACHIEVEMENT_METRICS.map((metric) => ({
  ...metric,
  ...ACHIEVEMENT_EVENT_DICTIONARY[metric.value],
  operators: ACHIEVEMENT_OPERATORS.map(({ value }) => value),
}))

export function achievementEvolutionTier(index: number) {
  return ACHIEVEMENT_EVOLUTION_TIERS[index] ?? { key: `tier-${index + 1}`, label: `Mốc ${index + 1}` }
}

export function resolveAchievementMetric(value: string): string {
  const key = value.toLowerCase().replaceAll('.', '_').replaceAll('-', '_')
  if (key.includes('perfect')) return 'perfect_lessons'
  if (key.includes('course')) return 'courses_completed'
  if (key.includes('lesson')) return 'lessons_completed'
  if (key.includes('streak')) return 'streak'
  if (key.includes('star')) return 'stars'
  if (key.includes('level')) return 'level'
  if (key.includes('xp')) return 'xp'
  if (key.includes('quest') || key.includes('mission')) return 'quests_completed'
  if (key.includes('challenge')) return 'challenges_completed'
  if (key.includes('event')) return 'events_joined'
  if (key.includes('image')) return 'images_created'
  if (key.includes('stor')) return 'stories_created'
  if (key.includes('code')) return 'code_projects_created'
  if (key.includes('collab') || key.includes('social')) return 'collaborations_completed'
  if (key.includes('creat') || key.includes('publish')) return 'creations_published'
  return ACHIEVEMENT_METRICS.some((metric) => metric.value === value) ? value : 'lessons_completed'
}
