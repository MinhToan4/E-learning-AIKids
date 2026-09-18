import { Check, Play, Star, Trophy } from 'lucide-react'
import { NavWorldIcon } from '@/shared/components/icons/KidNavIcons'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export interface LessonCheckResult {
  stars: number
  message: string
  nextQuestId: string | null
  newAchievements?: string[]
  courseCredential?: string | null
}

export interface LessonCelebrationModalProps {
  open: boolean
  checkResult: LessonCheckResult | null
  quest: {
    reward?: string
    goals: string[]
  }
  onNextQuest?: (nextQuestId: string) => void
  onBackToMap?: () => void
  onRetry?: () => void
  onReview?: () => void
}

export function LessonCelebrationModal({
  open,
  checkResult,
  quest,
  onNextQuest,
  onBackToMap,
  onRetry,
  onReview,
}: LessonCelebrationModalProps) {
  if (!open || !checkResult) return null

  return (
    <AdventureModal
      open
      tone={checkResult.stars > 0 ? 'celebration' : 'guidance'}
      eyebrow={checkResult.stars > 0 ? 'Trạm đã hoàn thành' : 'Mee vẫn ở đây cùng con'}
      title={checkResult.stars > 0 ? 'Con đã chinh phục trạm!' : 'Mình thử thêm một lần nhé'}
      description={checkResult.message}
      className="lesson-completion-modal"
      artwork={
        <div className="lesson-result-visual">
          <div className="stars-row flex items-center justify-center gap-2" aria-label={`${checkResult.stars} sao`}>
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                size={48}
                className={cn('result-star-slot', i <= checkResult.stars && 'result-star-earned')}
                aria-hidden="true"
              />
            ))}
          </div>
          {checkResult.stars > 0 && quest.reward && (
            <div className="lesson-result-reward">
              <span className="lesson-result-reward-icon" aria-hidden="true">
                <Trophy size={27} strokeWidth={2.5} />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-xs font-extrabold uppercase tracking-wide text-sun-700">Phần thưởng mới</span>
                <strong className="mt-0.5 block text-sm leading-snug text-text">{quest.reward}</strong>
              </span>
            </div>
          )}
        </div>
      }
    >
      {/* Reflect the authored learning outcomes back to the child */}
      {checkResult.stars > 0 && quest.goals.length > 0 && (
        <section className="w-full max-w-lg rounded-2xl border-2 border-mint-200 bg-mint-50 px-4 py-3 text-left" aria-labelledby="completed-goals-title">
          <p id="completed-goals-title" className="text-xs font-extrabold uppercase tracking-wider text-mint-700">
            Hôm nay con đã học được
          </p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {quest.goals.slice(0, 4).map((goal) => (
              <li key={goal} className="flex items-start gap-2 text-sm font-bold leading-snug text-text">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white text-mint-700" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* New achievements */}
      {checkResult.newAchievements && checkResult.newAchievements.length > 0 && (
        <div className="rounded-2xl bg-sun-100 border border-sun-200 px-4 py-3 w-full max-w-sm">
          <p className="text-sm font-extrabold text-warning">
            🏆 Huy hiệu mới: {checkResult.newAchievements.join(', ')}
          </p>
        </div>
      )}

      {/* Course credential */}
      {checkResult.courseCredential && (
        <div className="rounded-3xl border-2 border-sun-200 bg-gradient-to-br from-sun-100 to-coral-50 px-5 py-4 w-full max-w-sm">
          <p className="font-display text-xl">🎓 Hoàn thành khóa học!</p>
          <p className="mt-1 text-sm font-bold">{checkResult.courseCredential}</p>
          <p className="mt-1 text-xs text-muted">
            AI Kids Creator Academy · Riêng tư & bảo mật
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {checkResult.nextQuestId && onNextQuest && (
          <Button onClick={() => onNextQuest(checkResult.nextQuestId!)}>
            <Play size={18} aria-hidden="true" />
            Trạm tiếp theo
          </Button>
        )}
        {onBackToMap && (
          <Button variant="secondary" onClick={onBackToMap}>
            <NavWorldIcon size={18} aria-hidden="true" />
            Về bản đồ
          </Button>
        )}
        {checkResult.stars < 3 && onRetry && (
          <Button onClick={onRetry}>
            <Star size={18} aria-hidden="true" />
            {checkResult.stars === 0 ? 'Thử lại để nhận sao' : 'Thử lại để nâng sao'}
          </Button>
        )}
        {onReview && (
          <Button variant="ghost" onClick={onReview}>
            Xem lại bài
          </Button>
        )}
      </div>
    </AdventureModal>
  )
}
