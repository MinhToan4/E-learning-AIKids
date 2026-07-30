export interface RewardEvent {
  key: string
  title: string
  description: string
  icon: string
  startsAt: string
  endsAt: string
  ticketRewardId?: string
  completionRewardId: string
  storybookPage?: string
}

export const REWARD_EVENTS: readonly RewardEvent[] = [
  {
    key: 'summer-cloud-school-2026',
    title: 'Hè Trên Mây',
    description: 'Sáng tạo một ngôi trường bay và hoàn thành Weekly Prompt.',
    icon: '☁️',
    startsAt: '2026-07-01T00:00:00+07:00',
    endsAt: '2026-07-31T23:59:59+07:00',
    completionRewardId: 'frame-cloud-summer',
    storybookPage: 'event-summer-2026',
  },
  {
    key: 'creative-challenge',
    title: 'Đấu Trường Ý Tưởng',
    description: 'Challenge giới hạn dành cho những Người Truyền Lửa.',
    icon: '⚡',
    startsAt: '2026-08-15T00:00:00+07:00',
    endsAt: '2026-08-31T23:59:59+07:00',
    ticketRewardId: 'ticket-creative-challenge',
    completionRewardId: 'title-creative-warrior',
  },
] as const

export type RewardEventStatus = 'upcoming' | 'active' | 'ended'

export function rewardEventStatus(
  event: RewardEvent,
  now = new Date(),
): RewardEventStatus {
  const time = now.getTime()
  if (time < new Date(event.startsAt).getTime()) return 'upcoming'
  if (time > new Date(event.endsAt).getTime()) return 'ended'
  return 'active'
}
