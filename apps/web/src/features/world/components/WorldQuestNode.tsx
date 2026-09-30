import React from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Star } from 'lucide-react'
import { KidLockImageIcon } from '@/shared/components/icons/KidImageIcons'
import { cn } from '@/shared/lib/cn'
import { prefetchRoute, prefetchRouteImmediately } from '@/app/route-prefetch'
import { isAikiRuleJourney } from '@/features/lesson/lib/rule-journey-identifiers'
import { type QuestProgress } from '@/shared/lib/api'
import {
  FORCE_UNLOCK_ALL_ISLANDS,
  isUserTestingUnlocked,
  getStationSlug,
} from '../lib/world-pathway-mapper'

export function StarDisplay({ count }: { count: number }) {
  const safeCount = Math.max(0, Math.min(3, count))
  return (
    <div className="flex items-center gap-1" aria-label={`${safeCount} trên 3 sao`}>
      <div className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            size={19}
            className={i <= safeCount ? 'fill-sun-400 text-sun-400' : 'fill-white text-slate-300'}
          />
        ))}
      </div>
      <span className="text-[10px] font-extrabold text-muted">{safeCount}/3</span>
    </div>
  )
}

export const STATION_X_POSITIONS = [28, 68, 74, 43, 25, 52, 72, 42, 24, 61] as const

export function getStationPoint(index: number, total: number) {
  return {
    x: STATION_X_POSITIONS[index % STATION_X_POSITIONS.length],
    y: total <= 1 ? 50 : 10 + (index * 80) / (total - 1),
  }
}

export function buildStationPath(total: number) {
  if (total === 0) return ''
  const points = Array.from({ length: total }, (_, index) => getStationPoint(index, total))
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const middleY = (previous.y + point.y) / 2
    return `${path} C ${previous.x} ${middleY}, ${point.x} ${middleY}, ${point.x} ${point.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}

export function QuestNode({
  quest,
  index,
  total,
  courseId,
}: {
  quest: QuestProgress
  index: number
  total: number
  courseId?: string
}) {
  const isDevUnlock = isUserTestingUnlocked()
  const forceUnlock = FORCE_UNLOCK_ALL_ISLANDS || isDevUnlock
  const locked = !forceUnlock && quest.status === 'locked'
  const done = quest.status === 'completed'
  const available = forceUnlock || quest.status === 'available' || quest.status === 'in_progress'

  const nodeEl = (
    <div className="quest-node-compact-wrap">
      <div
        className={cn(
          'quest-node',
          locked && 'quest-node-locked',
          available && 'quest-node-available',
          done && 'quest-node-completed',
        )}
        aria-label={`Trạm ${quest.order}: ${quest.title}`}
      >
        {locked ? (
          <KidLockImageIcon size={46} />
        ) : done ? (
          <CheckCircle2 size={32} className="text-white" aria-hidden />
        ) : (
          <span className="font-display text-2xl text-white" aria-hidden="true">
            {quest.order}
          </span>
        )}
      </div>
      {locked ? (
        <div className="quest-node-caption text-slate-400">
          <span>Trạm {quest.order}</span>
          <strong className="text-slate-400 font-bold">Chưa mở khóa</strong>
        </div>
      ) : (
        <div className={cn('quest-node-caption', available && 'quest-node-caption-current')}>
          <span>Trạm {quest.order}</span>
          {done || (quest.stars ?? 0) > 0 ? (
            <StarDisplay count={quest.stars ?? 0} />
          ) : (
            <strong>Đang học</strong>
          )}
        </div>
      )}
    </div>
  )

  const isRule = courseId ? isAikiRuleJourney(courseId) : false
  const lessonSlug = getStationSlug(quest, isRule)
  const lessonUrl = courseId ? `/world/${courseId}/lesson/${lessonSlug}` : `/lesson/${lessonSlug}`

  return (
    <li
      className="quest-map-point"
      style={{
        left: `${getStationPoint(index, total).x}%`,
        top: `${getStationPoint(index, total).y}%`,
      }}
    >
      {locked ? (
        <div
          className="cursor-not-allowed select-none"
          title={`Trạm ${quest.order}: Chưa mở khóa`}
        >
          {nodeEl}
        </div>
      ) : (
        <Link
          to={lessonUrl}
          className="block"
          onPointerEnter={() => prefetchRoute(lessonUrl)}
          onPointerDown={() => prefetchRouteImmediately(lessonUrl)}
          onFocus={() => prefetchRoute(lessonUrl)}
        >
          {nodeEl}
        </Link>
      )}
    </li>
  )
}
