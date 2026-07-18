import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Asset,
  ComicElement,
  ComicPage,
  CreativeProject,
  GeneratedResult,
  PrivacySettings,
  PromptChip,
  PromptParts,
  PromptSlotKey,
  Role,
  ToastMessage,
  VideoScene,
} from '@/types'
import {
  createDefaultApprovals,
  createDefaultVideoScenes,
  createSeedAssets,
  DEFAULT_COMIC,
  DEFAULT_SKILLS,
  MOCK_STUDENTS,
  PROJECT_SEED,
} from '@/data/mock'
import { buildSceneSvg } from '@/lib/svg-scenes'
import { computeQuestStatuses } from '@/lib/quests'
import { getCourse } from '@/data/courses'
import type { Quest } from '@/types'

interface DemoStore {
  isLoggedIn: boolean
  currentRole: Role
  child: {
    id: string
    nickname: string
    avatarId: string
    level: number
    xp: number
    goal: 'comic' | 'video' | 'character' | null
    currentCourse: string
    onboarded: boolean
  }
  selectedCourseId: string
  enrolledCourseIds: string[]
  /** list = classic path, adventure = Mario-style map */
  coursePlayMode: 'list' | 'adventure'
  adventureIndex: number
  completedQuestIds: string[]
  currentQuestId: string | null
  currentProject: CreativeProject
  backpackAssets: Asset[]
  selectedPromptParts: PromptParts
  generatedResults: GeneratedResult[]
  selectedResultId?: string
  storyOutline: {
    title: string
    opening: string
    problem: string
    ending: string
  }
  comicPages: ComicPage[]
  comicHistory: ComicPage[][]
  comicFuture: ComicPage[][]
  videoScenes: VideoScene[]
  approvals: ReturnType<typeof createDefaultApprovals>
  students: typeof MOCK_STUDENTS
  skills: typeof DEFAULT_SKILLS
  privacy: PrivacySettings
  badges: string[]
  stars: number
  challengesPassed: string[]
  selectedVoiceId: string
  selectedMusicId: string
  subtitlesOn: boolean
  videoRendered: boolean
  generationStage: string | null
  demoErrorMode: boolean
  toasts: ToastMessage[]
  helperOpen: boolean
  selectedComicElementId: string | null
  placeAssetId: string | null

  setRole: (role: Role) => void
  setHelperOpen: (open: boolean) => void
  addStars: (n: number) => void
  passChallenge: (id: string) => void
  enrollCourse: (id: string) => void
  setCoursePlayMode: (mode: 'list' | 'adventure') => void
  setAdventureIndex: (i: number) => void
  setStoryOutline: (patch: Partial<DemoStore['storyOutline']>) => void
  loginStudent: (payload: {
    id?: string
    nickname: string
    avatarId: string
    skipOnboarding?: boolean
  }) => void
  loginAdult: (role: 'parent' | 'teacher') => void
  logout: () => void
  completeOnboarding: (payload: {
    nickname: string
    avatarId: string
    goal: 'comic' | 'video' | 'character'
  }) => void
  setSelectedCourseId: (id: string) => void
  setCurrentQuest: (id: string | null) => void
  completeQuest: (id: string, xp?: number) => void
  setPromptChip: (slot: PromptSlotKey, chip: PromptChip | undefined) => void
  setFreeText: (text: string) => void
  clearPrompt: () => void
  setGenerationStage: (stage: string | null) => void
  setGeneratedResults: (results: GeneratedResult[]) => void
  selectResult: (id: string) => void
  saveSelectedToBackpack: () => void
  addBadge: (name: string) => void
  setComicPages: (pages: ComicPage[]) => void
  pushComicHistory: () => void
  undoComic: () => void
  redoComic: () => void
  addComicElement: (el: ComicElement) => void
  updateComicElement: (id: string, patch: Partial<ComicElement>) => void
  removeComicElement: (id: string) => void
  setSelectedComicElement: (id: string | null) => void
  setPlaceAssetId: (id: string | null) => void
  autoLayoutComic: () => void
  setVideoScenes: (scenes: VideoScene[]) => void
  updateVideoScene: (id: string, patch: Partial<VideoScene>) => void
  setVoice: (id: string) => void
  setMusic: (id: string) => void
  setSubtitles: (on: boolean) => void
  setVideoRendered: (on: boolean) => void
  requestShare: (destination: 'family' | 'class') => void
  approveShare: (id: string) => void
  requestChanges: (id: string, feedback: string) => void
  setPrivacy: (patch: Partial<PrivacySettings>) => void
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  setDemoErrorMode: (on: boolean) => void
  resetDemo: () => void
  /** Prefer computeQuestStatuses + useMemo in components — do not select this in useDemoStore. */
  getQuestStatuses: () => Quest[]
}

const initialChild = {
  id: 'child_may',
  nickname: 'Mây',
  avatarId: 'cloud-fox',
  level: 1,
  xp: 100,
  goal: null as 'comic' | 'video' | 'character' | null,
  currentCourse: 'Hành trình Mèo Sao: Học AI bằng cách sáng tạo',
  onboarded: false,
}

function initialState() {
  const cover = buildSceneSvg('cover', 0)
  return {
    isLoggedIn: false,
    currentRole: 'student' as Role,
    child: { ...initialChild },
    selectedCourseId: 'course-comic',
    enrolledCourseIds: ['course-comic', 'course-safety'],
    coursePlayMode: 'adventure' as const,
    adventureIndex: 0,
    completedQuestIds: ['meet-mascot'],
    currentQuestId: 'character',
    currentProject: { ...PROJECT_SEED, cover },
    backpackAssets: createSeedAssets(),
    selectedPromptParts: {} as PromptParts,
    generatedResults: [] as GeneratedResult[],
    selectedResultId: undefined as string | undefined,
    storyOutline: {
      title: 'Mèo Sao và Hành tinh Kẹo',
      opening: '',
      problem: '',
      ending: '',
    },
    comicPages: [{ ...DEFAULT_COMIC, elements: [] }],
    comicHistory: [] as ComicPage[][],
    comicFuture: [] as ComicPage[][],
    videoScenes: createDefaultVideoScenes(cover),
    approvals: createDefaultApprovals(),
    students: MOCK_STUDENTS,
    skills: DEFAULT_SKILLS,
    privacy: {
      allowClassGallery: false,
      allowFreeText: true,
      allowAudioNarration: true,
    },
    badges: ['Thẻ Nhà sáng tạo'],
    stars: 30,
    challengesPassed: [] as string[],
    selectedVoiceId: 'voice-warm',
    selectedMusicId: 'music-soft',
    subtitlesOn: true,
    videoRendered: false,
    generationStage: null as string | null,
    demoErrorMode: false,
    toasts: [] as ToastMessage[],
    helperOpen: false,
    selectedComicElementId: null as string | null,
    placeAssetId: null as string | null,
  }
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...initialState(),

      setRole: (role) => set({ currentRole: role }),
      setHelperOpen: (open) => set({ helperOpen: open }),

      addStars: (n) =>
        set((s) => ({
          stars: Math.max(0, s.stars + n),
          child: {
            ...s.child,
            xp: s.child.xp + Math.max(0, n),
            level: Math.floor((s.child.xp + Math.max(0, n)) / 200) + 1,
          },
        })),

      passChallenge: (id) =>
        set((s) =>
          s.challengesPassed.includes(id)
            ? s
            : { challengesPassed: [...s.challengesPassed, id] },
        ),

      loginStudent: ({ id, nickname, avatarId, skipOnboarding }) =>
        set((s) => ({
          isLoggedIn: true,
          currentRole: 'student',
          child: {
            ...s.child,
            id: id ?? s.child.id,
            nickname,
            avatarId,
            onboarded: skipOnboarding ? true : s.child.onboarded,
          },
        })),

      loginAdult: (role) =>
        set({
          isLoggedIn: true,
          currentRole: role,
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          currentRole: 'student',
          helperOpen: false,
        }),

      completeOnboarding: ({ nickname, avatarId, goal }) =>
        set((s) => ({
          isLoggedIn: true,
          currentRole: 'student',
          child: {
            ...s.child,
            nickname,
            avatarId,
            goal,
            onboarded: true,
          },
        })),

      setSelectedCourseId: (id) =>
        set({
          selectedCourseId: id,
          adventureIndex: 0,
        }),

      enrollCourse: (id) =>
        set((s) =>
          s.enrolledCourseIds.includes(id)
            ? s
            : { enrolledCourseIds: [...s.enrolledCourseIds, id] },
        ),

      setCoursePlayMode: (mode) => set({ coursePlayMode: mode, adventureIndex: 0 }),

      setAdventureIndex: (i) => set({ adventureIndex: Math.max(0, i) }),

      setStoryOutline: (patch) =>
        set((s) => ({
          storyOutline: { ...s.storyOutline, ...patch },
          currentProject: {
            ...s.currentProject,
            title: patch.title ?? s.currentProject.title,
            reflection:
              patch.ending || patch.opening
                ? [
                    patch.opening || s.storyOutline.opening,
                    patch.problem || s.storyOutline.problem,
                    patch.ending || s.storyOutline.ending,
                  ]
                    .filter(Boolean)
                    .join(' ')
                : s.currentProject.reflection,
          },
        })),

      setCurrentQuest: (id) => set({ currentQuestId: id }),

      completeQuest: (id, xp = 100) =>
        set((s) => {
          if (s.completedQuestIds.includes(id)) return s
          return {
            completedQuestIds: [...s.completedQuestIds, id],
            stars: s.stars + Math.round(xp / 5),
            child: {
              ...s.child,
              xp: s.child.xp + xp,
              level: Math.floor((s.child.xp + xp) / 200) + 1,
            },
          }
        }),

      setPromptChip: (slot, chip) =>
        set((s) => ({
          selectedPromptParts: {
            ...s.selectedPromptParts,
            [slot]: chip,
          },
        })),

      setFreeText: (text) =>
        set((s) => ({
          selectedPromptParts: { ...s.selectedPromptParts, freeText: text },
        })),

      clearPrompt: () => set({ selectedPromptParts: {} }),

      setGenerationStage: (stage) => set({ generationStage: stage }),
      setGeneratedResults: (results) => set({ generatedResults: results }),
      selectResult: (id) => set({ selectedResultId: id }),

      saveSelectedToBackpack: () => {
        const s = get()
        const result = s.generatedResults.find((r) => r.id === s.selectedResultId)
        if (!result) return
        const asset: Asset = {
          id: `char-${Date.now()}`,
          type: 'character',
          name: s.selectedPromptParts.character?.label ?? 'Nhân vật mới',
          questId: 'character',
          thumbnail: result.imageDataUrl,
          createdAt: new Date().toISOString(),
          private: true,
        }
        set({
          backpackAssets: [asset, ...s.backpackAssets],
          currentProject: {
            ...s.currentProject,
            cover: result.imageDataUrl,
          },
        })
      },

      addBadge: (name) =>
        set((s) =>
          s.badges.includes(name) ? s : { badges: [...s.badges, name] },
        ),

      setComicPages: (pages) => set({ comicPages: pages }),

      pushComicHistory: () =>
        set((s) => ({
          comicHistory: [...s.comicHistory.slice(-30), s.comicPages],
          comicFuture: [],
        })),

      undoComic: () =>
        set((s) => {
          if (s.comicHistory.length === 0) return s
          const prev = s.comicHistory[s.comicHistory.length - 1]
          return {
            comicPages: prev,
            comicHistory: s.comicHistory.slice(0, -1),
            comicFuture: [s.comicPages, ...s.comicFuture],
          }
        }),

      redoComic: () =>
        set((s) => {
          if (s.comicFuture.length === 0) return s
          const [next, ...rest] = s.comicFuture
          return {
            comicPages: next,
            comicHistory: [...s.comicHistory, s.comicPages],
            comicFuture: rest,
          }
        }),

      addComicElement: (el) => {
        get().pushComicHistory()
        set((s) => ({
          comicPages: s.comicPages.map((page, i) =>
            i === 0 ? { ...page, elements: [...page.elements, el] } : page,
          ),
          selectedComicElementId: el.id,
          placeAssetId: null,
        }))
      },

      updateComicElement: (id, patch) =>
        set((s) => ({
          comicPages: s.comicPages.map((page, i) =>
            i === 0
              ? {
                  ...page,
                  elements: page.elements.map((el) =>
                    el.id === id ? { ...el, ...patch } : el,
                  ),
                }
              : page,
          ),
        })),

      removeComicElement: (id) => {
        get().pushComicHistory()
        set((s) => ({
          comicPages: s.comicPages.map((page, i) =>
            i === 0
              ? {
                  ...page,
                  elements: page.elements.filter((el) => el.id !== id),
                }
              : page,
          ),
          selectedComicElementId:
            s.selectedComicElementId === id ? null : s.selectedComicElementId,
        }))
      },

      setSelectedComicElement: (id) => set({ selectedComicElementId: id }),
      setPlaceAssetId: (id) => set({ placeAssetId: id }),

      autoLayoutComic: () => {
        get().pushComicHistory()
        set((s) => {
          const page = s.comicPages[0]
          const byPanel = new Map<string, ComicElement[]>()
          page.elements.forEach((el) => {
            const list = byPanel.get(el.panelId) ?? []
            list.push(el)
            byPanel.set(el.panelId, list)
          })
          const elements = page.elements.map((el) => {
            const siblings = byPanel.get(el.panelId) ?? []
            const idx = siblings.findIndex((x) => x.id === el.id)
            return {
              ...el,
              x: 12 + (idx % 2) * 20,
              y: 12 + Math.floor(idx / 2) * 24,
              width: el.type === 'bubble' ? 120 : 100,
              height: el.type === 'bubble' ? 56 : 100,
              rotation: 0,
            }
          })
          return {
            comicPages: [{ ...page, elements }],
          }
        })
      },

      setVideoScenes: (scenes) => set({ videoScenes: scenes }),
      updateVideoScene: (id, patch) =>
        set((s) => ({
          videoScenes: s.videoScenes.map((sc) =>
            sc.id === id ? { ...sc, ...patch } : sc,
          ),
        })),
      setVoice: (id) => set({ selectedVoiceId: id }),
      setMusic: (id) => set({ selectedMusicId: id }),
      setSubtitles: (on) => set({ subtitlesOn: on }),
      setVideoRendered: (on) =>
        set((s) => ({
          videoRendered: on,
          currentProject: {
            ...s.currentProject,
            videoReady: on,
            comicReady: true,
          },
          backpackAssets: on
            ? [
                {
                  id: `video-${Date.now()}`,
                  type: 'video' as const,
                  name: s.currentProject.title,
                  questId: 'cinema',
                  thumbnail: s.currentProject.cover,
                  createdAt: new Date().toISOString(),
                  private: true,
                },
                ...s.backpackAssets.filter((a) => a.type !== 'video'),
              ]
            : s.backpackAssets,
        })),

      requestShare: (destination) =>
        set((s) => ({
          currentProject: {
            ...s.currentProject,
            shareStatus: 'pending',
            approvalStatus: 'pending',
          },
          approvals: [
            {
              id: `ap-${Date.now()}`,
              projectId: s.currentProject.id,
              projectTitle: s.currentProject.title,
              thumbnail: s.currentProject.cover,
              destination,
              status: 'pending',
              aiAssisted: true,
              requestedAt: new Date().toISOString(),
            },
            ...s.approvals,
          ],
        })),

      approveShare: (id) =>
        set((s) => {
          const ap = s.approvals.find((a) => a.id === id)
          return {
            approvals: s.approvals.map((a) =>
              a.id === id ? { ...a, status: 'approved' as const } : a,
            ),
            currentProject: {
              ...s.currentProject,
              approvalStatus: 'approved',
              shareStatus:
                ap?.destination === 'class'
                  ? 'class'
                  : ap?.destination === 'family'
                    ? 'family'
                    : 'private',
            },
          }
        }),

      requestChanges: (id, feedback) =>
        set((s) => ({
          approvals: s.approvals.map((a) =>
            a.id === id
              ? { ...a, status: 'changes_requested' as const, feedback }
              : a,
          ),
          currentProject: {
            ...s.currentProject,
            approvalStatus: 'changes_requested',
            shareStatus: 'private',
          },
        })),

      setPrivacy: (patch) =>
        set((s) => ({ privacy: { ...s.privacy, ...patch } })),

      addToast: (toast) =>
        set((s) => ({
          toasts: [
            ...s.toasts,
            { ...toast, id: `toast-${Date.now()}-${Math.random()}` },
          ],
        })),

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      setDemoErrorMode: (on) => set({ demoErrorMode: on }),

      resetDemo: () => set({ ...initialState() }),

      getQuestStatuses: () => {
        const s = get()
        const course = getCourse(s.selectedCourseId)
        return computeQuestStatuses(
          s.completedQuestIds,
          s.currentQuestId,
          course.quests,
        )
      },
    }),
    {
      name: 'kids-creator-demo-v5',
      partialize: (s) => ({
        isLoggedIn: s.isLoggedIn,
        currentRole: s.currentRole,
        child: s.child,
        selectedCourseId: s.selectedCourseId,
        enrolledCourseIds: s.enrolledCourseIds,
        coursePlayMode: s.coursePlayMode,
        adventureIndex: s.adventureIndex,
        storyOutline: s.storyOutline,
        stars: s.stars,
        challengesPassed: s.challengesPassed,
        completedQuestIds: s.completedQuestIds,
        currentQuestId: s.currentQuestId,
        currentProject: s.currentProject,
        backpackAssets: s.backpackAssets,
        selectedPromptParts: s.selectedPromptParts,
        generatedResults: s.generatedResults,
        selectedResultId: s.selectedResultId,
        comicPages: s.comicPages,
        videoScenes: s.videoScenes,
        approvals: s.approvals,
        privacy: s.privacy,
        badges: s.badges,
        selectedVoiceId: s.selectedVoiceId,
        selectedMusicId: s.selectedMusicId,
        subtitlesOn: s.subtitlesOn,
        videoRendered: s.videoRendered,
        demoErrorMode: s.demoErrorMode,
      }),
    },
  ),
)
