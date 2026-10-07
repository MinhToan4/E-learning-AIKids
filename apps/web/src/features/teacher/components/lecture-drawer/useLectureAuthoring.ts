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
      let nextSixStage = prev.sixStageJourney

      // Auto 2-Way Sync cho Six Stage Journey
      if (nextSixStage) {
        if (index === 0 && patch.layoutMode) {
          nextSixStage = {
            ...nextSixStage,
            stage1_goal: {
              ...nextSixStage.stage1_goal,
              layoutMode: patch.layoutMode,
            },
          }
        }
      }

      if (nextSixStage && patch.contentBlocks) {
        if (index === 0) {
          const mainGoalBlock = patch.contentBlocks.find(
            (b) => b.id === 'course-goal-main' || b.type === 'layout-four-keys' || b.id.startsWith('course-goal-')
          )
          const textBlock = patch.contentBlocks.find(
            (b) => b.id.startsWith('course-goal-text') || b.type === 'text' || b.type === 'layout-text'
          )
          const fourKeysBlock = patch.contentBlocks.find(
            (b) => b.id.startsWith('course-goal-four-keys') || b.type === 'layout-four-keys'
          )
          const imageBlock = patch.contentBlocks.find(
            (b) => b.id.startsWith('course-goal-image') || b.type === 'images' || Boolean(b.imageUrl)
          )
          const voiceBlock = patch.contentBlocks.find(
            (b) => b.type === 'voice' || Boolean(b.readText)
          )
          const resolvedKeys = (mainGoalBlock?.visualItems?.length ? mainGoalBlock.visualItems : fourKeysBlock?.visualItems) || []
          nextSixStage = {
            ...nextSixStage,
            stage1_goal: {
              ...nextSixStage.stage1_goal,
              title: mainGoalBlock?.title || textBlock?.title || nextSixStage.stage1_goal?.title || '',
              goalText: mainGoalBlock?.body || textBlock?.body || nextSixStage.stage1_goal?.goalText || '',
              imageUrl: mainGoalBlock?.imageUrl || imageBlock?.imageUrl || nextSixStage.stage1_goal?.imageUrl || '',
              speech: voiceBlock?.body || voiceBlock?.readText || nextSixStage.stage1_goal?.speech || '',
              layoutMode: patch.layoutMode || nextCards[0]?.layoutMode || nextSixStage.stage1_goal?.layoutMode || '2-column',
              keyPoints: resolvedKeys.length
                ? resolvedKeys.map((v: any) => v.text || v.label).filter(Boolean)
                : (nextSixStage.stage1_goal?.keyPoints || []),
            },
          }
        } else if (index === 1) {
          const confirmBlock = patch.contentBlocks.find(
            (b) =>
              b.id === 'course-confirm-quiz' ||
              b.type === 'layout-confirm-option' ||
              b.type === 'quiz-question' ||
              b.id.startsWith('course-confirm-') ||
              Boolean(b.questionPrompt)
          )
          if (confirmBlock) {
            nextSixStage = {
              ...nextSixStage,
              stage2_confirmGoal: {
                ...nextSixStage.stage2_confirmGoal,
                id: confirmBlock.id,
                question: confirmBlock.questionPrompt || confirmBlock.title || nextSixStage.stage2_confirmGoal?.question || '',
                options: (confirmBlock.questionOptions && confirmBlock.questionOptions.length > 0)
                  ? confirmBlock.questionOptions.map((o, optIdx) => ({ id: o.id || `opt-${optIdx + 1}`, text: o.text, imageUrl: o.imageUrl }))
                  : (nextSixStage.stage2_confirmGoal?.options || []),

                correctIndex: typeof confirmBlock.correctIndex === 'number'
                  ? confirmBlock.correctIndex
                  : (nextSixStage.stage2_confirmGoal?.correctIndex ?? 0),
                explanation: confirmBlock.explanation || confirmBlock.tip || nextSixStage.stage2_confirmGoal?.explanation || '',
                visualUrl: confirmBlock.visualUrl || confirmBlock.imageUrl || nextSixStage.stage2_confirmGoal?.visualUrl || '',
                layoutMode: confirmBlock.layoutMode || nextSixStage.stage2_confirmGoal?.layoutMode || 'cards',
              },
            }
          }
        } else if (index === 2) {
          const videoBlock = patch.contentBlocks.find(
            (b) => b.type === 'video' || b.id.startsWith('course-video-')
          )
          if (videoBlock) {
            nextSixStage = {
              ...nextSixStage,
              stage3_video: {
                ...nextSixStage.stage3_video,
                title: videoBlock.title || nextSixStage.stage3_video?.title || 'Video bài giảng',
                videoUrl: videoBlock.videoUrl || nextSixStage.stage3_video?.videoUrl || '',
                posterUrl: videoBlock.posterUrl || nextSixStage.stage3_video?.posterUrl || '',
                durationSec: typeof videoBlock.durationSec === 'number' ? videoBlock.durationSec : (nextSixStage.stage3_video?.durationSec || 180),
                timestamps: videoBlock.timestamps || nextSixStage.stage3_video?.timestamps || [],
              },
            }
          }
        } else if (index === 3) {
          const quizBlocks = patch.contentBlocks.filter(
            (b) =>
              b.type === 'quiz-question' ||
              b.id.startsWith('course-quiz-') ||
              b.id.startsWith('blk-quiz-') ||
              Boolean(b.questionPrompt)
          )
          if (quizBlocks.length > 0) {
            const fallbackQuizVisual =
              nextSixStage.stage3_video?.posterUrl ||
              nextSixStage.stage1_goal?.imageUrl ||
              nextSixStage.stage2_confirmGoal?.visualUrl ||
              '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
            const primaryQuizBlock = quizBlocks.find((b) => Array.isArray(b.quizQuestions) && b.quizQuestions.length > 0) || quizBlocks[0]
            let mappedQuestions = []
            if (primaryQuizBlock && Array.isArray(primaryQuizBlock.quizQuestions) && primaryQuizBlock.quizQuestions.length > 0) {
              mappedQuestions = primaryQuizBlock.quizQuestions.map((q, qIdx) => {
                const hasOptImages = (Array.isArray(q.options) && q.options.some((o: any) => typeof o !== 'string' && Boolean(o.imageUrl))) || Boolean(q.optionImages?.some(Boolean))
                return {
                  id: q.id || `q-${qIdx + 1}`,
                  prompt: q.prompt || '',
                  options: Array.isArray(q.options) ? q.options.map((opt: any) => typeof opt === 'string' ? opt : (opt.text || '')) : ['Phương án A', 'Phương án B'],
                  correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
                  explanation: q.explanation || '',
                  visualUrl: q.visualUrl || fallbackQuizVisual,
                  layoutMode: q.layoutMode || (hasOptImages ? 'cards' : 'split'),
                  optionImages: Array.isArray(q.optionImages)
                    ? q.optionImages
                    : (Array.isArray(q.options) ? q.options.map((opt: any) => typeof opt !== 'string' ? (opt.imageUrl || '') : '') : []),
                }
              })
            } else {
              mappedQuestions = quizBlocks.map((b, qIdx) => {
                const hasOptImages = b.questionOptions?.some((o) => Boolean(o.imageUrl))
                return {
                  id: b.id.replace('course-quiz-', ''),
                  prompt: b.questionPrompt || b.title || `Câu hỏi ${qIdx + 1}`,
                  options: (b.questionOptions && b.questionOptions.length > 0)
                    ? b.questionOptions.map((o) => o.text)
                    : (b.optionLabels || ['Phương án A', 'Phương án B']),
                  correctIndex: typeof b.correctIndex === 'number' ? b.correctIndex : 0,
                  explanation: b.explanation || b.tip || '',
                  visualUrl: b.visualUrl || b.imageUrl || fallbackQuizVisual,
                  layoutMode: b.layoutMode || (hasOptImages ? 'cards' : 'split'),
                  optionImages: b.questionOptions?.map((o) => o.imageUrl || '') || b.optionImages,
                }
              })
            }
            nextSixStage = {
              ...nextSixStage,
              stage4_quiz: {
                ...nextSixStage.stage4_quiz,
                questions: mappedQuestions,
              },
            }
          }
        } else if (index === 4) {
          const practiceBlock = patch.contentBlocks.find(
            (b) => b.type === 'practice' || b.id.startsWith('course-practice-')
          )
          if (practiceBlock) {
            nextSixStage = {
              ...nextSixStage,
              stage5_practice: {
                ...nextSixStage.stage5_practice,
                ...(practiceBlock.practiceConfig || {}),
                title: practiceBlock.title || practiceBlock.practiceConfig?.title || nextSixStage.stage5_practice?.title || 'Thực hành',
              },
            }
          }
        } else if (index === 5) {
          const rewardBlock = patch.contentBlocks.find(
            (b) => b.type === 'reward' || b.id.startsWith('course-reward-')
          )
          if (rewardBlock) {
            nextSixStage = {
              ...nextSixStage,
              stage6_completion: {
                ...nextSixStage.stage6_completion,
                ...(rewardBlock.rewardConfig || {}),
                title: rewardBlock.title || rewardBlock.rewardConfig?.title || nextSixStage.stage6_completion?.title || 'Chúc mừng hoàn thành bài học!',
                congratsMessage: rewardBlock.body || rewardBlock.rewardConfig?.congratsMessage || nextSixStage.stage6_completion?.congratsMessage || '',
              },
            }
          }
        }
      }

      return {
        ...prev,
        learnCards: nextCards,
        sixStageJourney: nextSixStage,
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

  const handleAddModule = useCallback((blockId: string, explicitStageIndex?: number, insertIndex?: number) => {
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
    } else if (blockId === 'layout-callout') {
      newBlock = { id: `blk-callout-${ts}`, type: 'layout-callout', title: 'Hộp ghi nhớ AIKI', body: '', tip: 'Mẹo học tập' }
    } else if (blockId === 'dialogue') {
      newBlock = { id: `blk-dialogue-${ts}`, type: 'dialogue', title: 'Kịch bản phân vai', dialogueLines: [] }
    } else if (blockId === 'versus-ab') {
      newBlock = { id: `blk-versus-${ts}`, type: 'versus-ab', title: '2 Tranh đối đầu A/B' }
    } else if (blockId === 'compare') {
      newBlock = { id: `blk-compare-${ts}`, type: 'compare', title: 'Bảng đối chiếu 2 cột' }
    } else if (blockId === 'video') {
      newBlock = { id: `blk-video-${ts}`, type: 'video', title: 'Video bài giảng' }
    } else if (blockId === 'voice') {
      newBlock = { id: `blk-voice-${ts}`, type: 'voice', title: 'Giọng đọc & lời thoại' }
    } else if (blockId === 'layout-split') {
      newBlock = { id: `blk-split-${ts}`, type: 'layout-split', title: '2 Cột: Chữ + Ảnh', body: '' }
    } else if (blockId === 'layout-confirm-option' || blockId === 'quiz-question') {
      const defaultVisual =
        draft.sixStageJourney?.stage3_video?.posterUrl ||
        draft.sixStageJourney?.stage1_goal?.imageUrl ||
        draft.sixStageJourney?.stage2_confirmGoal?.visualUrl ||
        draft.learnCards[0]?.imageUrl ||
        '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
      newBlock = {
        id: `blk-quiz-${ts}`,
        type: 'layout-confirm-option',
        title: 'Câu hỏi trắc nghiệm mới',
        questionPrompt: 'Chọn đáp án chính xác nhất:',
        layoutMode: 'split',
        visualUrl: defaultVisual,
        imageUrl: defaultVisual,
        correctIndex: 0,
        explanation: 'Giải thích vì sao đáp án này chính xác...',
        questionOptions: [
          { id: `opt-${ts}-1`, text: 'Phương án A (Đáp án đúng)', imageUrl: '' },
          { id: `opt-${ts}-2`, text: 'Phương án B', imageUrl: '' },
        ],
        choiceItems: [
          { id: `opt-${ts}-1`, title: 'Phương án A (Đáp án đúng)', isCorrect: true },
          { id: `opt-${ts}-2`, title: 'Phương án B', isCorrect: false },
        ],
        optionLabels: ['Phương án A (Đáp án đúng)', 'Phương án B'],
        optionImages: ['', ''],
        isCorrect: true,
      } as any
    } else if (blockId === 'practice') {
      newBlock = {
        id: `blk-practice-${ts}`,
        type: 'practice',
        title: 'Thực hành sáng tạo',
        practiceConfig: {
          id: `practice-${ts}`,
          title: 'Thực hành sáng tạo',
          subjectName: 'Sáng tạo AIKI',
          badge: 'Nghệ sĩ AI nhí',
          illustrationType: 'drawing',
          lockedFeatures: [],
          akiMotto: 'Thỏa sức sáng tạo không giới hạn!',
          maxAttempts: 3,
          workflowSteps: [
            { step: 1, title: 'Bước 1: Chọn chủ đề', akiSpeech: 'Bé hãy chọn một chủ đề mà bé yêu thích nhé!', quickPrompt: 'Vẽ một chú mèo phi hành gia', instruction: 'Chọn chủ đề và nhấn bắt đầu.' }
          ],
        },
      }
    } else if (blockId === 'reward') {
      newBlock = {
        id: `blk-reward-${ts}`,
        type: 'reward',
        title: 'Chúc mừng hoàn thành bài học!',
        body: 'Bé đã hoàn thành xuất sắc các chặng thử thách!',
        rewardConfig: {
          id: `reward-${ts}`,
          title: 'Chúc mừng hoàn thành bài học!',
          congratsMessage: 'Bé đã hoàn thành xuất sắc các chặng thử thách!',
          rewardBadge: {
            name: 'Huy hiệu hoàn thành',
            iconUrl: '',
            stars: 3,
            xp: 50,
          },
        },
      }
    }

    const nextBlocks = [...stageBlocks]
    if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= nextBlocks.length) {
      nextBlocks.splice(insertIndex, 0, newBlock)
    } else {
      nextBlocks.push(newBlock)
    }

    updateStageBlocks(targetIdx, nextBlocks)
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
