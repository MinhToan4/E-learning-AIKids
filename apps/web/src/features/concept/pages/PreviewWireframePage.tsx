import React, { useState } from 'react'
import { AikiRuleWorkspace } from '@/features/rules/components/AikiRuleWorkspace'
import { SixStageJourneyView } from '@/features/lesson/components/SixStageJourneyView'
import { StudentStageBlocksView } from '@/features/lesson/components/StudentStageBlocksView'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { adaptRuleToStages } from '@/features/lesson/lib/stage-adapter'
import type { LearnCardDraft } from '@/features/teacher/lib/authoring'
import { resolveIslandLessonJourney } from '@/features/lesson/lib/island-journey-resolver'
import { HomePage } from '@/features/home/pages/HomePage'
import { KidHomeImageIcon, KidWorldImageIcon, KidBadgeImageIcon } from '@/shared/components/icons/KidImageIcons'

const SAMPLE_STAGE_CARD: any = {
  kind: 'concept',
  title: 'Bí Kíp 4 Chìa Khóa Vàng AIKids',
  tip: 'Luôn nhìn kỹ hình vẽ trước khi chọn đáp án nhé!',
  imageUrl: '/assets/aiki-rules/rule1_superhero_dad.webp',
  contentBlocks: [
    {
      id: 'block-2',
      type: 'layout-split',
      title: 'Quan Sát Hình Vẽ & Đọc Bí Kíp',
      body: 'Muốn biết kết quả phép tính, con hãy gom các cặp số tròn chục lại với nhau trước. Ví dụ 1 + 9 = 10, 2 + 8 = 10.',
      tip: 'Nhớ kiểm tra lại bằng mắt trước khi nộp bài!',
      imageUrl: '/assets/aiki-rules/rule1_superhero_dad.webp',
    },
  ],
}

export function PreviewWireframePage() {
  // Check if embedded inside an iframe
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const isEmbed = searchParams?.get('embed') === 'true'
  const initialTab = (searchParams?.get('tab') as 'home' | 'rule' | 'course' | 'blocks') || 'home'
  const initialStage = searchParams?.get('stage') ? parseInt(searchParams.get('stage')!, 10) : undefined
  const initialLesson = searchParams?.get('lesson') || 'bai-1-1'
  const [tab, setTab] = useState<'home' | 'rule' | 'course' | 'blocks'>(initialTab)
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const activeTab = tab

  // EMBED MODE: Render component directly without preview header or mockup borders
  if (isEmbed) {
    return (
      <div className="w-full h-full min-h-0 bg-[#FFF9F5] flex flex-col overflow-hidden">
        {activeTab === 'home' && (
          <div className="h-full flex flex-col justify-between w-full overflow-y-auto relative bg-[#f8fafc]">
            <main className="max-w-[1024px] mx-auto w-full px-3 sm:px-6 py-4 pb-28">
              <HomePage />
            </main>
            <nav aria-label="Student Navigation Bar" className="sticky bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] py-1.5 px-4">
              <div className="max-w-[1024px] mx-auto flex items-center justify-around">
                <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl bg-purple-100 text-purple-700 font-black shadow-xs border border-purple-200/80">
                  <KidHomeImageIcon size={22} />
                  <span className="text-[11px] font-black">Trang Chủ</span>
                </button>
                <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl text-slate-500 font-semibold hover:text-slate-800">
                  <KidWorldImageIcon size={22} />
                  <span className="text-[11px] font-bold">Bản Đồ</span>
                </button>
                <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl text-slate-500 font-semibold hover:text-slate-800">
                  <KidBadgeImageIcon size={22} />
                  <span className="text-[11px] font-bold">Hồ Sơ</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {activeTab === 'rule' && (
          <SixStageJourneyView
            lessonId="rule-1"
            lessonTitle="Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI"
            stages={adaptRuleToStages(AIKI_RULES_DATA[0])}
            initialStageIndex={0}
            studentStars={0}
            rewardXp={50}
            isCompleted={false}
            onBackToMap={() => alert('Quay lại lộ trình')}
            onFinishLesson={(res) => alert(`Hoàn thành quy tắc: ${res.stars} sao, ${res.xp} XP`)}
          />
        )}

        {activeTab === 'course' && (
          <SixStageJourneyView
            lessonId={initialLesson}
            lessonTitle={initialLesson === 'bai-1-2' ? 'Bài 2: Bốn Chiếc Chìa Khóa Vàng' : 'Bài 1: Khám Phá 4 Chiếc Chìa Khóa Vàng'}
            stages={resolveIslandLessonJourney(initialLesson)}
            initialStageIndex={initialStage ?? 2}
            studentStars={3}
            rewardXp={100}
            isCompleted={false}
            onBackToMap={() => alert('Về bản đồ')}
            onFinishLesson={(res) => alert(`Hoàn thành bài học: ${res.stars} sao, ${res.xp} XP`)}
          />
        )}

        {activeTab === 'blocks' && (
          <div className="h-full flex flex-col justify-between max-w-[1024px] mx-auto w-full p-4 overflow-y-auto">
            <StudentStageBlocksView
              card={SAMPLE_STAGE_CARD}
              stageIndex={0}
              onNextStage={() => alert('Đi tiếp sang chặng sau')}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Controller Bar for Inspecting & Screenshotting */}
      <header className="bg-slate-800 border-b border-slate-700 px-3 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-black text-amber-400 text-xs sm:text-sm">📸 AIKIDS LIVE PREVIEW:</span>
          <div className="flex rounded-xl bg-slate-700 p-0.5 border border-slate-600">
            <button
              type="button"
              onClick={() => setTab('home')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                tab === 'home' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏠 Trang Chủ &amp; Dock
            </button>
            <button
              type="button"
              onClick={() => setTab('rule')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                tab === 'rule' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              1. 10 Quy Tắc Vàng (Rule 1)
            </button>
            <button
              type="button"
              onClick={() => setTab('course')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                tab === 'course' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              2. Khóa Học 6 Bước (Stage Player)
            </button>
            <button
              type="button"
              onClick={() => setTab('blocks')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                tab === 'blocks' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              3. Khối Block Ảnh + Text
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Viewport:</span>
          <div className="flex rounded-xl bg-slate-700 p-0.5 border border-slate-600">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                viewportMode === 'desktop' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300'
              }`}
            >
              🖥️ 1024px Laptop
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                viewportMode === 'tablet' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300'
              }`}
            >
              📟 768px iPad
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                viewportMode === 'mobile' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300'
              }`}
            >
              📱 390px Mobile
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 min-h-0 bg-slate-950/80 flex flex-col overflow-hidden relative">
        {/* DESKTOP 1024px CHASSIS */}
        {viewportMode === 'desktop' && (
          <div className="h-full flex-1 flex flex-col overflow-hidden w-full max-w-[1024px] mx-auto bg-[#FFF9F5] shadow-2xl">
            {activeTab === 'home' && (
              <div className="h-full flex flex-col justify-between w-full overflow-y-auto relative bg-[#f8fafc]">
                <main className="max-w-[1024px] mx-auto w-full px-3 sm:px-6 py-4 pb-28">
                  <HomePage />
                </main>
                <nav aria-label="Student Navigation Bar" className="sticky bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] py-1.5 px-4">
                  <div className="max-w-[1024px] mx-auto flex items-center justify-around">
                    <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl bg-purple-100 text-purple-700 font-black shadow-xs border border-purple-200/80">
                      <KidHomeImageIcon size={22} />
                      <span className="text-[11px] font-black">Trang Chủ</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl text-slate-500 font-semibold hover:text-slate-800">
                      <KidWorldImageIcon size={22} />
                      <span className="text-[11px] font-bold">Bản Đồ</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl text-slate-500 font-semibold hover:text-slate-800">
                      <KidBadgeImageIcon size={22} />
                      <span className="text-[11px] font-bold">Hồ Sơ</span>
                    </button>
                  </div>
                </nav>
              </div>
            )}

            {activeTab === 'rule' && (
              <SixStageJourneyView
                lessonId="rule-1"
                lessonTitle="Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI"
                stages={adaptRuleToStages(AIKI_RULES_DATA[0])}
                initialStageIndex={0}
                studentStars={0}
                rewardXp={50}
                isCompleted={false}
                onBackToMap={() => alert('Quay lại lộ trình')}
                onFinishLesson={(res) => alert(`Hoàn thành quy tắc: ${res.stars} sao, ${res.xp} XP`)}
              />
            )}

            {activeTab === 'course' && (
              <SixStageJourneyView
                lessonId={initialLesson}
                lessonTitle={initialLesson === 'bai-1-2' ? 'Bài 2: Bốn Chiếc Chìa Khóa Vàng' : 'Bài 1: Khám Phá 4 Chiếc Chìa Khóa Vàng'}
                stages={resolveIslandLessonJourney(initialLesson)}
                initialStageIndex={initialStage ?? 2}
                studentStars={3}
                rewardXp={100}
                isCompleted={false}
                onBackToMap={() => alert('Về bản đồ')}
                onFinishLesson={(res) => alert(`Hoàn thành bài học: ${res.stars} sao, ${res.xp} XP`)}
              />
            )}

            {activeTab === 'blocks' && (
              <div className="h-full flex flex-col justify-between max-w-[1024px] mx-auto w-full p-4 overflow-y-auto">
                <StudentStageBlocksView
                  card={SAMPLE_STAGE_CARD}
                  stageIndex={0}
                  onNextStage={() => alert('Đi tiếp sang chặng sau')}
                />
              </div>
            )}
          </div>
        )}

        {/* TABLET 768px CHASSIS (RENDER VIA IFRAME FOR GENUINE MEDIA QUERIES) */}
        {viewportMode === 'tablet' && (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto">
            <div className="w-[768px] h-[920px] max-h-[calc(100vh-70px)] bg-slate-800 rounded-[32px] p-2.5 shadow-2xl border-4 border-slate-700 flex flex-col shrink-0">
              <div className="w-full flex justify-center py-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" />
              </div>
              <iframe
                key={`tablet-${tab}`}
                src={`/preview-wireframe?embed=true&tab=${tab}`}
                className="w-full flex-1 rounded-[22px] bg-[#FFF9F5] border-0 overflow-hidden"
                title="iPad Simulator"
              />
            </div>
          </div>
        )}

        {/* MOBILE 390px CHASSIS (RENDER VIA IFRAME FOR GENUINE 390px MEDIA QUERIES) */}
        {viewportMode === 'mobile' && (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto">
            <div className="w-[390px] h-[812px] max-h-[calc(100vh-70px)] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col relative shrink-0">
              {/* Dynamic Island on bezel */}
              <div className="w-full flex justify-center pb-2 shrink-0">
                <div className="w-24 h-4 bg-slate-950 rounded-full border border-slate-800" />
              </div>
              <iframe
                key={`mobile-${tab}`}
                src={`/preview-wireframe?embed=true&tab=${tab}`}
                className="w-full flex-1 rounded-[32px] bg-[#FFF9F5] border-0 overflow-hidden"
                title="Mobile iPhone Simulator"
              />
              {/* Home indicator bar */}
              <div className="w-full flex justify-center pt-2 pb-0.5 shrink-0 pointer-events-none">
                <div className="w-28 h-1 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
