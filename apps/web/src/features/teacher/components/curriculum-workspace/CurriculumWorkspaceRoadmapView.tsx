import React from 'react'
import { Shield } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { CourseVisualRoadmap } from '../CourseVisualRoadmap'
import type { LectureRow } from '@/shared/lib/api'

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-extrabold',
        status === 'open' ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning'
      )}
    >
      {status === 'open' ? 'Đang mở' : 'Đang ẩn'}
    </span>
  )
}

export type Lecture = LectureRow & {
  archived?: boolean
  stage?: string
  skill?: string
  reward?: string
  duration?: string
  accent?: string
  goals?: string[]
  concept?: string
  example?: string
  learnCards?: import('../../lib/authoring').LearnCardDraft[]
  gameType?: string
  gameInstruction?: string
  gameOutcome?: string
  gameCards?: string[]
  gameConfig?: any
  practiceInstruction?: string
  product?: string
  practiceSteps?: string[]
  successCriteria?: string[]
  reflectionPrompt?: string
  practiceConfig?: any
  checkQuestion?: string
  checkOptions?: string[]
  correctIndex?: number
  checkExplain?: string
  checkQuestions?: any
}

export type CourseLectures = {
  id: string
  title: string
  shortTitle: string
  status: string
  ageTrack?: string
  courseKey?: string
  curriculumKey?: string
  regionOrder?: number
  slug?: string
  scopeType?: 'global' | 'organization' | 'personal'
  programSource?: 'aikid_official' | 'workspace' | 'creator_marketplace'
  tagline?: string
  description?: string
  productLabel?: string
  durationLabel?: string
  skills?: string[]
  outcomes?: string[]
  credential?: string
  finalAssessment?: string
  badgeRewardId?: string
  issuerTitle?: string
  regionUnlockMode?: 'sequential' | 'parallel'
  readOnly?: boolean
  isGatekeeper?: boolean
  lectures: Lecture[]
}

export type LearningProgram = {
  id: string
  title: string
  description: string
  source: 'aikid_official' | 'workspace' | 'creator_marketplace'
  unlockMode: 'sequential' | 'parallel'
  readOnly: boolean
  imageUrl?: string
  regions: CourseLectures[]
}

export interface CurriculumWorkspaceRoadmapViewProps {
  activeCourse: CourseLectures
  focusedProgram: LearningProgram | null
  lectures: Lecture[]
  isCurrentCourseRule: boolean
  selectedCourseId: string
  handleSelectRegion: (regionId: string) => void
  setCourseModalMode: (mode: 'create' | 'edit') => void
  setCourseModalCourse: (c: CourseLectures | null) => void
  runLectureAction: (action: () => void) => void
  setDrawerMode: (m: 'create' | 'edit') => void
  setDrawerLecture: (l: Lecture | null) => void
  restoreLecture: (id: string) => Promise<void>
  setArchiveTarget: (l: Lecture | null) => void
  moveLecture: (id: string, dir: -1 | 1) => Promise<void>
  setShowScriptModal: (v: boolean) => void
  checkingCourse: boolean
  patchCourseStatus: (id: string, status: 'open' | 'soon') => Promise<void>
}

export function CurriculumWorkspaceRoadmapView({
  activeCourse,
  focusedProgram,
  lectures,
  isCurrentCourseRule,
  selectedCourseId,
  handleSelectRegion,
  setCourseModalMode,
  setCourseModalCourse,
  runLectureAction,
  setDrawerMode,
  setDrawerLecture,
  restoreLecture,
  setArchiveTarget,
  moveLecture,
  setShowScriptModal,
  checkingCourse,
  patchCourseStatus,
}: CurriculumWorkspaceRoadmapViewProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header tóm tắt Vùng đang chọn */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 text-xs font-black text-white shadow-2xs">
            3
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base font-black text-slate-900">
                {activeCourse.shortTitle || activeCourse.title}
              </h3>
              <StatusBadge status={activeCourse.status} />
            </div>
            <p className="text-xs text-muted font-bold mt-0.5">
              {focusedProgram ? `${focusedProgram.title} · ` : ''}
              {lectures.filter((l) => !l.archived).length} trạm học đang hoạt động
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!activeCourse.readOnly && (
            <button
              type="button"
              onClick={() => {
                setCourseModalMode('edit')
                setCourseModalCourse(activeCourse)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <span>Sửa thông tin vùng</span>
            </button>
          )}
        </div>
      </div>

      {/* Dải cuộn nhanh các Vùng thuộc cùng chương trình */}
      {focusedProgram && focusedProgram.regions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          <span className="text-[11px] font-black text-slate-500 whitespace-nowrap pl-1">
            Đổi vùng nhanh:
          </span>
          {focusedProgram.regions.map((region, rIdx) => {
            const isSelected = region.id === selectedCourseId
            const stationCount = region.lectures.filter((l) => !l.archived).length
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => handleSelectRegion(region.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap border',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                )}
              >
                <span>Vùng {rIdx + 1}: {region.shortTitle || region.title}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-black',
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {stationCount}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Banner Đảo Tiên Quyết Quy Tắc Vàng nếu là khóa học quy tắc */}
      {isCurrentCourseRule && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 shadow-sm animate-pop">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-amber-900 shadow-2xs">
              <Shield size={20} className="text-amber-800" />
            </span>
            <div>
              <h3 className="text-sm font-black text-amber-950">
                Đảo Tiên Quyết: Mười Quy Tắc Vàng của Xưởng sáng tạo
              </h3>
              <p className="text-xs font-semibold text-amber-800 mt-0.5">
                Vùng 1 cửa ngõ bắt buộc. Bấm vào từng trạm bên dưới để mở Focus Studio biên soạn trạm quy tắc.
              </p>
            </div>
          </div>
        </div>
      )}

      <CourseVisualRoadmap
        courseTitle={activeCourse.shortTitle || activeCourse.title}
        courseDescription={activeCourse.description}
        stations={lectures}
        readOnly={!!activeCourse.readOnly}
        onSelectStation={(stationId) => {
          const target = lectures.find((l) => l.id === stationId)
          if (target) {
            runLectureAction(() => {
              setDrawerMode('edit')
              setDrawerLecture(target)
            })
          }
        }}
        onAddStation={() => {
          runLectureAction(() => {
            setDrawerMode('create')
            setDrawerLecture(null)
          })
        }}
        onToggleArchiveStation={(station) => {
          if (station.archived) {
            void restoreLecture(station.id)
          } else {
            setArchiveTarget(station)
          }
        }}
        onMoveStation={(stationId, dir) => {
          void moveLecture(stationId, dir)
        }}
        onOpenScriptGenerator={() => setShowScriptModal(true)}
      />

      {!activeCourse.readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <StatusBadge status={activeCourse.status} />
            <span className="text-xs font-bold text-muted">
              {activeCourse.status === 'open'
                ? 'Học sinh đang có thể truy cập lộ trình này'
                : 'Lộ trình đang được ẩn với học sinh'}
            </span>
          </div>
          <Button
            variant="secondary"
            className="text-xs font-extrabold cursor-pointer"
            disabled={checkingCourse || lectures.filter((lecture) => !lecture.archived).length === 0}
            onClick={() =>
              void patchCourseStatus(
                activeCourse.id,
                activeCourse.status === 'open' ? 'soon' : 'open'
              )
            }
          >
            {checkingCourse
              ? 'Đang kiểm tra...'
              : activeCourse.status === 'open'
              ? 'Ẩn khỏi học sinh'
              : 'Mở cho học sinh'}
          </Button>
        </div>
      )}
    </div>
  )
}
