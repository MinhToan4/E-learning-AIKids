import React from 'react'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { FullStationPreview } from './FullStationPreview'
import type { LectureDraft, LessonFormat } from '../../lib/authoring'
import type { CurriculumGameConfig } from '@/features/lesson/lib/curriculum-game'

export interface FullStationPreviewModalProps {
  open: boolean
  onClose: () => void
  draft: LectureDraft
  lessonFormat: LessonFormat
  gameConfig: CurriculumGameConfig
  isIslandCourse: boolean
}

/**
 * FullStationPreviewModal — Modal trình chiếu toàn bộ hành trình trạm học như màn hình học sinh.
 */
export function FullStationPreviewModal({
  open,
  onClose,
  draft,
  lessonFormat,
  gameConfig,
  isIslandCourse,
}: FullStationPreviewModalProps) {
  return (
    <AdventureModal
      open={open}
      tone="guidance"
      eyebrow="Xem trước như học sinh"
      title={draft.title || 'Trạm học chưa có tên'}
      description={
        lessonFormat === 'aiki-rule-3steps'
          ? 'Toàn bộ hành trình 3 bước: Bài học (Video) · Kiểm tra (Quiz) · Hoàn thành.'
          : lessonFormat === 'aiki-rule-5steps'
          ? 'Toàn bộ hành trình 5 chặng: Tình huống · Câu đố · Quy tắc · Giải thích · Chốt.'
          : 'Toàn bộ hành trình trong một trạm: Mở bài · Khám phá · Chơi · Thực hành · Thử thách.'
      }
      showMascot={false}
      className="station-preview-modal"
      onClose={onClose}
      actions={
        <button type="button" className="btn-primary" onClick={onClose}>
          Tiếp tục biên soạn
        </button>
      }
    >
      <FullStationPreview draft={draft} gameConfig={gameConfig} isIslandCourse={isIslandCourse} />
    </AdventureModal>
  )
}
