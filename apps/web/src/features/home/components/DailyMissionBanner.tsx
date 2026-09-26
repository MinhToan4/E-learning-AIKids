import React from 'react'
import { Link } from 'react-router'

export interface DailyMissionBannerProps {
  onStartMission?: () => void
  rewardXp?: number
  isDone?: boolean
  title?: string
  claimedAt?: string | null
  actionRoute?: string
  className?: string
}

export const DailyMissionBanner: React.FC<DailyMissionBannerProps> = ({
  onStartMission,
  rewardXp = 30,
  isDone = false,
  title = 'Hoàn thành 1 trạm thử thách để rèn luyện tư duy AI',
  claimedAt,
  actionRoute,
  className = '',
}) => {
  const isClaimed = Boolean(claimedAt || isDone)
  const xpAmount = rewardXp || 30

  const buttonContent = (
    <span>{isClaimed ? 'Đã xong' : 'Làm ngay'}</span>
  )

  const buttonClasses =
    'shrink-0 px-3.5 py-1.5 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs font-black shadow-2xs active:scale-95 transition-all flex items-center cursor-pointer whitespace-nowrap'

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#fffbeb] backdrop-blur-xs border border-amber-200/70 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
              Nhiệm vụ hôm nay:
            </span>
            <span className="text-xs font-bold text-zinc-800 truncate">
              {title}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-200/70 rounded-full px-2 py-0.5 shrink-0">
              +{xpAmount} XP
            </span>
          </div>
          {claimedAt && (
            <p className="text-[10px] font-bold text-emerald-700">✓ Đã nhận +{xpAmount} XP</p>
          )}
        </div>
      </div>

      {actionRoute ? (
        <Link
          to={actionRoute}
          onClick={onStartMission}
          className={buttonClasses}
        >
          {buttonContent}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onStartMission}
          className={buttonClasses}
        >
          {buttonContent}
        </button>
      )}
    </div>
  )
}

export default DailyMissionBanner
