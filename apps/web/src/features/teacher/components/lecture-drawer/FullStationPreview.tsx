import React, { useState, useDeferredValue } from 'react'
import {
  Eye,
  HelpCircle,
  Maximize2,
  Monitor,
  Palette,
  Smartphone,
  Tablet,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { CurriculumGame } from '@/features/lesson/components/CurriculumGame'
import type { CurriculumGameConfig } from '@/features/lesson/lib/curriculum-game'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { isAikiRuleJourney } from '@/features/lesson/lib/rule-journey-identifiers'
import type { Section } from './LectureDrawerHeader'
import {
  type LectureDraft,
  detectLessonFormat,
  isAikiRuleLesson,
  ISLAND_6_STAGE_NAMES,
  resolveCourseJourneyStages,
  createAikiRuleLearnCards,
  createAikiRule3StepsCards,
} from '../../lib/authoring'
import {
  STANDARD_SECTIONS,
  goalLines,
  buildRuleSyntheticJourney,
} from './lecture-drawer-constants'
import { StudentLearnPreview } from './PracticeWorkflowStepsAccordion'
import {
  StudentStagePreview,
  PracticeKindPreview,
  type PreviewViewportMode,
} from './StudentStagePreview'

export function FullStationPreview({
  draft,
  gameConfig,
  isIslandCourse,
}: {
  draft: LectureDraft
  gameConfig: CurriculumGameConfig
  isIslandCourse?: boolean
}) {
  const deferredDraft = useDeferredValue(draft)
  const isAiki =
    deferredDraft.lessonFormat === 'aiki-rule-3steps' ||
    deferredDraft.lessonFormat === 'aiki-rule-5steps' ||
    detectLessonFormat(deferredDraft.learnCards) === 'aiki-rule-5steps' ||
    detectLessonFormat(deferredDraft.learnCards) === 'aiki-rule-3steps' ||
    isAikiRuleLesson(deferredDraft.learnCards) ||
    isAikiRuleJourney(deferredDraft)
  const isCustomJourney = Boolean(
    deferredDraft.customJourneyStages && deferredDraft.customJourneyStages.length >= 3,
  )
  const isIsland =
    !isAiki &&
    Boolean(
      isIslandCourse ||
        detectLessonFormat(deferredDraft.learnCards) === 'aiki-island-6steps' ||
        deferredDraft.sixStageJourney,
    )
  const [activeStage, setActiveStage] = useState<number>(0)
  const [previewSection, setPreviewSection] = useState<Section>('basics')
  const [viewport, setViewport] = useState<PreviewViewportMode>('pc')
  const goals = goalLines(deferredDraft.goalsText)
  const steps = goalLines(deferredDraft.practiceStepsText)
  const criteria = goalLines(deferredDraft.successCriteriaText)

  const renderViewportToolbar = () => (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-slate-100 p-2 border border-slate-200/80">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 ml-1">
          <Eye size={14} className="text-brand-600" /> Chế độ xem thiết bị:
        </span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => setViewport('mobile')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
            viewport === 'mobile'
              ? 'bg-brand-500 text-white shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60',
          )}
          title="Xem dạng Điện thoại (375px)"
        >
          <Smartphone size={14} />
          <span className="hidden sm:inline">📱 Mobile 375px</span>
          <span className="sm:hidden">Mobile</span>
        </button>
        <button
          type="button"
          onClick={() => setViewport('tablet')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
            viewport === 'tablet'
              ? 'bg-brand-500 text-white shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60',
          )}
          title="Xem dạng iPad / Máy tính bảng (768px)"
        >
          <Tablet size={14} />
          <span className="hidden sm:inline">📱 iPad / Tablet 768px</span>
          <span className="sm:hidden">Tablet</span>
        </button>
        <button
          type="button"
          onClick={() => setViewport('pc')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
            viewport === 'pc'
              ? 'bg-brand-500 text-white shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60',
          )}
          title="Xem dạng Máy tính PC (1200px)"
        >
          <Monitor size={14} />
          <span className="hidden sm:inline">💻 Máy tính PC</span>
          <span className="sm:hidden">PC</span>
        </button>
        <button
          type="button"
          onClick={() => setViewport('full')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
            viewport === 'full'
              ? 'bg-brand-500 text-white shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60',
          )}
          title="Xem dạng Tràn viền (100%)"
        >
          <Maximize2 size={14} />
          <span className="hidden sm:inline">🖥️ Full 100%</span>
          <span className="sm:hidden">Full</span>
        </button>
      </div>
    </div>
  )

  const wrapInViewport = (children: React.ReactNode) => {
    if (viewport === 'mobile') {
      return (
        <div className="w-[375px] max-w-full mx-auto rounded-[2.5rem] border-[6px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col my-3 text-left preview-viewport-mobile">
          <div className="h-5 flex justify-center items-center py-1 bg-slate-100 border-b border-slate-200 shrink-0">
            <div className="w-16 h-1 rounded-full bg-slate-300" />
          </div>
          <div className="station-preview-scroll overflow-y-auto max-h-[58vh] sm:max-h-[62vh] p-3 text-left">
            {children}
          </div>
        </div>
      )
    }

    if (viewport === 'tablet') {
      return (
        <div className="w-[768px] max-w-full mx-auto rounded-2xl border-4 border-slate-300 bg-white shadow-xl overflow-hidden p-3 sm:p-4 my-3 text-left">
          <div className="station-preview-scroll overflow-y-auto max-h-[58vh] sm:max-h-[62vh] pr-1 text-left">
            {children}
          </div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          'w-full mx-auto rounded-2xl border-2 border-slate-200 bg-white shadow-sm p-3 sm:p-5 my-3 text-left',
          viewport === 'full' ? 'max-w-full' : 'max-w-[1200px]',
        )}
      >
        <div className="station-preview-scroll overflow-y-auto max-h-[58vh] sm:max-h-[62vh] pr-1 text-left">
          {children}
        </div>
      </div>
    )
  }

  if (isIsland) {
    const currentJourney =
      deferredDraft.sixStageJourney || resolveIslandSixStageJourney(deferredDraft as any)
    const islandCard = deferredDraft.learnCards[activeStage]
    const stageIcons = ['🎯', '🎬', '🔍', '✍️', '🎨', '🏆']
    return (
      <div className="text-left">
        {renderViewportToolbar()}

        {/* Navigation 6 chặng Đảo */}
        <nav
          className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-brand-200 bg-brand-50/70 p-2"
          aria-label="Chọn chặng Đảo muốn xem trước"
        >
          {ISLAND_6_STAGE_NAMES.map((name, index) => {
            const isSelected = activeStage === index
            return (
              <button
                key={name}
                type="button"
                onClick={() => setActiveStage(index)}
                aria-current={isSelected ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-black transition cursor-pointer',
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-brand-900 bg-white/80 hover:bg-white border border-brand-200/60',
                )}
              >
                <span>{stageIcons[index]}</span>
                <span>
                  Chặng {index + 1}: {name}
                </span>
              </button>
            )
          })}
        </nav>

        {wrapInViewport(
          <div>
            <StudentStagePreview
              stageIndex={activeStage}
              isIsland={true}
              sixStageJourney={currentJourney}
              stageCard={islandCard}
              viewport={viewport}
              hideHeaderToolbar={true}
            />

            {/* Điều hướng chuyển chặng */}
            <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3">
              <button
                type="button"
                disabled={activeStage === 0}
                onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
                className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                Chặng trước
              </button>
              <span className="text-xs font-black text-brand-800">
                Chặng {activeStage + 1} / 6
              </span>
              <button
                type="button"
                disabled={activeStage === 5}
                onClick={() => setActiveStage((prev) => Math.min(5, prev + 1))}
                className="rounded-xl bg-brand-600 text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 cursor-pointer shadow-xs"
              >
                Chặng tiếp theo
              </button>
            </div>
          </div>,
        )}
      </div>
    )
  }

  if (isAiki || isCustomJourney) {
    const customStages = resolveCourseJourneyStages(
      undefined,
      deferredDraft.lessonFormat,
      deferredDraft.customJourneyStages,
    )
    const totalStages = customStages.length
    const defaultCards =
      deferredDraft.lessonFormat === 'aiki-rule-3steps'
        ? createAikiRule3StepsCards()
        : createAikiRuleLearnCards()
    const card = deferredDraft.learnCards[activeStage] ?? defaultCards[activeStage]
    const stageIcons = ['🎬', '🖼️', '📜', '⚖️', '🏆', '🎨', '🌟']
    return (
      <div className="text-left">
        {renderViewportToolbar()}

        {/* Navigation các chặng */}
        <nav
          className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-brand-200 bg-brand-50/70 p-2"
          aria-label="Chọn chặng muốn xem trước"
        >
          {customStages.map((stage, index) => {
            const isSelected = activeStage === index
            return (
              <button
                key={stage.id || index}
                type="button"
                onClick={() => setActiveStage(index)}
                aria-current={isSelected ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-black transition cursor-pointer',
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-brand-900 bg-white/80 hover:bg-white border border-brand-200/60',
                )}
              >
                <span>{stageIcons[index % stageIcons.length]}</span>
                <span>
                  {stage.index + 1}. {stage.shortTitle || stage.title}
                </span>
              </button>
            )
          })}
        </nav>

        {wrapInViewport(
          <div>
            {card && (
              <StudentStagePreview
                card={card}
                stageIndex={activeStage}
                viewport={viewport}
                hideHeaderToolbar={true}
                lessonFormat={deferredDraft.lessonFormat}
                sixStageJourney={buildRuleSyntheticJourney(deferredDraft)}
              />
            )}

            {/* Điều hướng chuyển chặng */}
            <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3">
              <button
                type="button"
                disabled={activeStage === 0}
                onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
                className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                Chặng trước
              </button>
              <span className="text-xs font-black text-brand-800">
                Chặng {activeStage + 1} / {totalStages}
              </span>
              <button
                type="button"
                disabled={activeStage === totalStages - 1}
                onClick={() => setActiveStage((prev) => Math.min(totalStages - 1, prev + 1))}
                className="rounded-xl bg-brand-600 text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 cursor-pointer shadow-xs"
              >
                Chặng tiếp theo
              </button>
            </div>
          </div>,
        )}
      </div>
    )
  }

  return (
    <div className="text-left">
      {renderViewportToolbar()}

      <nav
        className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-white p-2"
        aria-label="Chọn phần muốn xem trước"
      >
        {STANDARD_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setPreviewSection(section.id)}
            aria-current={previewSection === section.id ? 'page' : undefined}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
              previewSection === section.id
                ? 'bg-brand-600 text-white shadow-press'
                : 'text-muted hover:bg-brand-50 hover:text-brand-700',
            )}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </nav>

      {wrapInViewport(
        <div className="grid gap-4">
          {previewSection === 'basics' && (
            <section className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-5 text-center">
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">
                Câu hỏi mở trạm
              </p>
              <h3 className="mt-2 font-display text-2xl text-brand-900">
                {deferredDraft.hook.trim() || 'Chưa có câu hỏi khởi động'}
              </h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {(goals.length ? goals : ['Chưa có mục tiêu học tập']).map((goal, index) => (
                  <div
                    key={`${index}-${goal}`}
                    className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-text shadow-sm"
                  >
                    <span className="mr-2 text-coral-600">{index + 1}.</span>
                    {goal}
                  </div>
                ))}
              </div>
            </section>
          )}

          {previewSection === 'content' && <StudentLearnPreview draft={deferredDraft} />}

          {previewSection === 'game' && (
            <div className="ui-card p-5">
              <div className="mb-4">
                <div className="companion-bubble" style={{ maxWidth: 'none', width: '100%' }}>
                  <p className="text-sm font-bold">
                    {deferredDraft.gameInstruction || 'Chơi một lượt để ghi nhớ ý chính của bài!'}
                  </p>
                </div>
              </div>
              <CurriculumGame
                gameType={deferredDraft.gameType}
                gameConfig={gameConfig}
                instruction={deferredDraft.gameInstruction}
                outcome={deferredDraft.gameOutcome}
                onComplete={() => undefined}
              />
              <p className="mt-4 rounded-xl bg-sun-50 px-3 py-3 text-center text-xs font-semibold text-sun-900">
                Chế độ xem trước: giáo viên có thể chơi thử, nhưng kết quả không được ghi vào tiến độ
                học sinh.
              </p>
            </div>
          )}

          {previewSection === 'practice' && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,.85fr)]">
              <div className="grid gap-4">
                <section className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-5">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-mint-700">
                    <Palette size={16} /> Tự tay làm
                  </p>
                  <h3 className="mt-2 font-display text-xl text-text">
                    {deferredDraft.product || 'Chưa đặt tên sản phẩm'}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">
                    {deferredDraft.practiceInstruction || 'Chưa có hướng dẫn thực hành.'}
                  </p>
                  {steps.length > 0 && (
                    <ol className="mt-3 grid gap-2">
                      {steps.map((step, index) => (
                        <li key={step} className="rounded-xl bg-white px-3 py-2 text-xs font-bold">
                          <span className="mr-2 text-mint-700">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                  {criteria.length > 0 && (
                    <div className="mt-3 rounded-xl border border-mint-200 bg-white p-3 text-xs font-semibold">
                      <strong>Con tự kiểm tra:</strong> {criteria.join(' · ')}
                    </div>
                  )}
                </section>
                <PracticeKindPreview draft={deferredDraft} />
              </div>
              <aside className="rounded-3xl border-2 border-border bg-white p-5">
                <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
                  Sau khi làm xong
                </p>
                <p className="mt-3 text-sm font-bold leading-relaxed text-text">
                  Câu hỏi nhìn lại:{' '}
                  {deferredDraft.reflectionPrompt || 'Chưa có câu hỏi giúp học sinh tự nhìn lại sản phẩm.'}
                </p>
                <p className="mt-3 rounded-xl bg-sun-50 px-3 py-3 text-xs font-semibold text-sun-900">
                  Sản phẩm được lưu riêng tư và chỉ chia sẻ khi có luồng duyệt phù hợp.
                </p>
              </aside>
            </div>
          )}

          {previewSection === 'check' && (
            <section className="rounded-3xl border-2 border-coral-200 bg-coral-50 p-5">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-coral-700">
                <HelpCircle size={16} /> Thử thách cuối trạm
              </p>
              <p className="mt-2 text-sm font-bold text-text">
                {deferredDraft.checkQuestions.length || (deferredDraft.checkQuestion ? 1 : 0)} câu
                hỏi kiểm tra · Học sinh cần hoàn thành trước khi nhận thưởng.
              </p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {(deferredDraft.checkQuestions.length
                  ? deferredDraft.checkQuestions
                  : deferredDraft.checkQuestion
                  ? [
                      {
                        prompt: deferredDraft.checkQuestion,
                        options: [
                          deferredDraft.checkOption1,
                          deferredDraft.checkOption2,
                          deferredDraft.checkOption3,
                        ].filter(Boolean),
                        answer: Number(deferredDraft.correctIndex),
                        explain: deferredDraft.checkExplain,
                      },
                    ]
                  : []
                ).map((question, index) => (
                  <article
                    key={`${index}-${question.prompt}`}
                    className="rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <p className="font-extrabold text-text">
                      {index + 1}. {question.prompt}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={`${optionIndex}-${option}`}
                          className="rounded-xl border border-border px-3 py-2 text-sm font-semibold"
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </div>
                      ))}
                    </div>
                    {question.explain && (
                      <p className="mt-3 text-xs font-semibold text-muted">
                        Phản hồi sau khi trả lời: {question.explain}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>,
      )}
    </div>
  )
}
