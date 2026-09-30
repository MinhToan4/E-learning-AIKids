import { useCallback } from 'react'
import type { LectureDraft, LessonFormat, LearnCardDraft, StageBlockItem } from '../../lib/authoring'
import {
  createAikiRuleLearnCards,
  createAikiRule3StepsCards,
  getStageBlocks,
  createFourKeysBlock,
} from '../../lib/authoring'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'

export interface UseLectureAuthoringOptions {
  draft: LectureDraft
  setDraft: React.Dispatch<React.SetStateAction<LectureDraft>>
  lessonFormat: LessonFormat
  activeSection: string
  courseId: string
  readOnly: boolean
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void
  setUploadingStageMedia: (media: string | null) => void
}

export function useLectureAuthoring({
  draft,
  setDraft,
  lessonFormat,
  activeSection,
  readOnly,
  showToast,
  setUploadingStageMedia,
}: UseLectureAuthoringOptions) {
  const updateLearnCard = useCallback((index: number, patch: Partial<LearnCardDraft>) => {
    if (readOnly) return
    setDraft((prev) => {
      let cards = prev.learnCards
      if (cards.length <= index) {
        cards = (lessonFormat === 'aiki-rule-3steps' ? createAikiRule3StepsCards() : createAikiRuleLearnCards()).map(
          (d, i) => cards[i] ?? d
        )
      }
      const nextCards = cards.map((c, i) => (i === index ? { ...c, ...patch } : c))
      return {
        ...prev,
        learnCards: nextCards,
        concept: nextCards.find((c) => c.kind === 'concept')?.body ?? prev.concept,
        example: nextCards.find((c) => c.kind === 'example')?.body ?? prev.example,
      }
    })
  }, [lessonFormat, readOnly, setDraft])

  const updateStageBlocks = useCallback((stageIndex: number, newBlocks: StageBlockItem[]) => {
    if (readOnly) return
    const currentCard = draft.learnCards[stageIndex]
    if (!currentCard) return
    const patch: Partial<LearnCardDraft> = {
      contentBlocks: newBlocks,
      enabledModules: Array.from(new Set(newBlocks.map((b) => b.type))),
    }
    const firstText = newBlocks.find((b) => b.type === 'text' || b.type === 'layout-text')
    if (firstText) {
      if (firstText.title !== undefined) patch.title = firstText.title
      if (firstText.body !== undefined) patch.body = firstText.body
      if (firstText.tip !== undefined) patch.tip = firstText.tip
    }
    updateLearnCard(stageIndex, patch)
  }, [draft.learnCards, readOnly, updateLearnCard])

  const updateBlockItem = useCallback((stageIndex: number, blockId: string, blockPatch: Partial<StageBlockItem>) => {
    if (readOnly) return
    const card = draft.learnCards[stageIndex]
    if (!card) return
    const blocks = getStageBlocks(card, stageIndex)
    updateStageBlocks(stageIndex, blocks.map((b) => (b.id === blockId ? { ...b, ...blockPatch } : b)))
  }, [draft.learnCards, readOnly, updateStageBlocks])

  const moveBlock = useCallback((stageIndex: number, blockIndex: number, direction: -1 | 1) => {
    if (readOnly) return
    const card = draft.learnCards[stageIndex]
    if (!card) return
    const blocks = [...getStageBlocks(card, stageIndex)]
    const target = blockIndex + direction
    if (target < 0 || target >= blocks.length) return
    const temp = blocks[blockIndex]
    blocks[blockIndex] = blocks[target]
    blocks[target] = temp
    updateStageBlocks(stageIndex, blocks)
  }, [draft.learnCards, readOnly, updateStageBlocks])

  const removeBlock = useCallback((stageIndex: number, blockId: string) => {
    if (readOnly) return
    const card = draft.learnCards[stageIndex]
    if (!card) return
    updateStageBlocks(stageIndex, getStageBlocks(card, stageIndex).filter((b) => b.id !== blockId))
    showToast('Đã xóa khối nội dung!', 'info')
  }, [draft.learnCards, readOnly, showToast, updateStageBlocks])

  const handleAddModule = useCallback((blockId: string, explicitStageIndex?: number) => {
    if (readOnly) return
    const targetIdx =
      explicitStageIndex !== undefined
        ? explicitStageIndex
        : activeSection.startsWith('stage-')
        ? parseInt(activeSection.replace('stage-', ''), 10)
        : 0
    const card = draft.learnCards[targetIdx]
    if (!card) return
    const stageBlocks = getStageBlocks(card, targetIdx)
    const ts = Date.now()
    let newBlock: StageBlockItem = {
      id: `blk-${blockId}-${ts}`,
      type: blockId as any,
      title: `Khối mới ${stageBlocks.length + 1}`,
    }
    if (blockId === 'text' || blockId === 'layout-text') {
      newBlock = { id: `blk-text-${ts}`, type: 'text', title: `Đoạn văn bản ${stageBlocks.length + 1}`, body: '' }
    } else if (blockId === 'layout-four-keys') {
      newBlock = createFourKeysBlock(`blk-four-keys-${ts}`)
    }
    updateStageBlocks(targetIdx, [...stageBlocks, newBlock])
    showToast('Đã thêm khối nội dung!', 'success')
  }, [activeSection, draft.learnCards, readOnly, showToast, updateStageBlocks])

  const uploadLearnCardMedia = useCallback(async (
    index: number,
    field: 'videoUrl' | 'imageUrl' | 'audioUrl' | 'optionImageA' | 'optionImageB' | 'compareLeft' | 'compareRight',
    file: File
  ) => {
    if (readOnly) return
    setUploadingStageMedia(`${index}:${field}`)
    try {
      const res = await uploadCmsCourseMedia({ file, purpose: `cms_${field}`, questId: draft.id })
      if (res?.url) {
        updateLearnCard(index, { [field]: res.url })
        showToast('Đã tải media lên thành công!', 'success')
      }
    } catch (err) {
      showToast(`Lỗi tải media: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
    } finally {
      setUploadingStageMedia(null)
    }
  }, [draft.id, readOnly, setUploadingStageMedia, showToast, updateLearnCard])

  const uploadAdditionalImageItem = useCallback(async (
    stageIndex: number,
    imgIndex: number,
    file: File
  ) => {
    if (readOnly) return
    setUploadingStageMedia(`${stageIndex}:additional:${imgIndex}`)
    try {
      const res = await uploadCmsCourseMedia({ file, purpose: 'cms_additional', questId: draft.id })
      if (res?.url) {
        const card = draft.learnCards[stageIndex]
        const images = [...(card?.additionalImages || [])]
        images[imgIndex] = { id: `img-${Date.now()}`, url: res.url, alt: 'Minh họa chặng', caption: '' }
        updateLearnCard(stageIndex, { additionalImages: images })
        showToast('Đã tải ảnh lên thành công!', 'success')
      }
    } catch (err) {
      showToast(`Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
    } finally {
      setUploadingStageMedia(null)
    }
  }, [draft.id, draft.learnCards, readOnly, setUploadingStageMedia, showToast, updateLearnCard])

  return {
    updateLearnCard,
    updateStageBlocks,
    updateBlockItem,
    moveBlock,
    removeBlock,
    handleAddModule,
    uploadLearnCardMedia,
    uploadAdditionalImageItem,
  }
}
