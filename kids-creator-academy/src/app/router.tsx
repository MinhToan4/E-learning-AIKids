import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/navigation/AppShell'
import { LoadingCreature } from '@/components/feedback/States'
import { RouteError } from '@/components/feedback/RouteError'

const WelcomePage = lazy(() =>
  import('@/pages/WelcomePage').then((m) => ({ default: m.WelcomePage })),
)
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const OnboardingPage = lazy(() =>
  import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
)
const WorldPage = lazy(() =>
  import('@/pages/WorldPage').then((m) => ({ default: m.WorldPage })),
)
const QuestCharacterPage = lazy(() =>
  import('@/pages/quest/QuestCharacterPage').then((m) => ({
    default: m.QuestCharacterPage,
  })),
)
const QuestLearnPage = lazy(() =>
  import('@/pages/quest/QuestCharacterPage').then((m) => ({
    default: m.QuestLearnPage,
  })),
)
const GenericQuestPage = lazy(() =>
  import('@/pages/quest/QuestCharacterPage').then((m) => ({
    default: m.GenericQuestPageWrapper,
  })),
)
const PromptStudioPage = lazy(() =>
  import('@/pages/studio/PromptStudioPage').then((m) => ({
    default: m.PromptStudioPage,
  })),
)
const ComparePage = lazy(() =>
  import('@/pages/studio/ComparePage').then((m) => ({ default: m.ComparePage })),
)
const StoryStudioPage = lazy(() =>
  import('@/pages/studio/StoryStudioPage').then((m) => ({
    default: m.StoryStudioPage,
  })),
)
const ComicStudioPage = lazy(() =>
  import('@/pages/studio/ComicStudioPage').then((m) => ({
    default: m.ComicStudioPage,
  })),
)
const VideoStudioPage = lazy(() =>
  import('@/pages/studio/VideoStudioPage').then((m) => ({
    default: m.VideoStudioPage,
  })),
)
const BackpackPage = lazy(() =>
  import('@/pages/BackpackPage').then((m) => ({ default: m.BackpackPage })),
)
const PortfolioPage = lazy(() =>
  import('@/pages/PortfolioPage').then((m) => ({ default: m.PortfolioPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const StarsPage = lazy(() =>
  import('@/pages/StarsPage').then((m) => ({ default: m.StarsPage })),
)
const ChallengePage = lazy(() =>
  import('@/pages/ChallengePage').then((m) => ({ default: m.ChallengePage })),
)
const ParentOverviewPage = lazy(() =>
  import('@/pages/parent/ParentPages').then((m) => ({
    default: m.ParentOverviewPage,
  })),
)
const ParentApprovalsPage = lazy(() =>
  import('@/pages/parent/ParentPages').then((m) => ({
    default: m.ParentApprovalsPage,
  })),
)
const ParentPrivacyPage = lazy(() =>
  import('@/pages/parent/ParentPages').then((m) => ({
    default: m.ParentPrivacyPage,
  })),
)
const TeacherOverviewPage = lazy(() =>
  import('@/pages/teacher/TeacherPages').then((m) => ({
    default: m.TeacherOverviewPage,
  })),
)
const TeacherStudentsPage = lazy(() =>
  import('@/pages/teacher/TeacherPages').then((m) => ({
    default: m.TeacherStudentsPage,
  })),
)
const TeacherProjectsPage = lazy(() =>
  import('@/pages/teacher/TeacherPages').then((m) => ({
    default: m.TeacherProjectsPage,
  })),
)

function L({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md p-8">
          <LoadingCreature stage="Đang mở trang…" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: (
          <L>
            <Navigate to="/welcome" replace />
          </L>
        ),
      },
      {
        path: 'welcome',
        element: (
          <L>
            <WelcomePage />
          </L>
        ),
      },
      {
        path: 'login',
        element: (
          <L>
            <LoginPage />
          </L>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <L>
            <OnboardingPage />
          </L>
        ),
      },
      {
        path: 'world',
        element: (
          <L>
            <WorldPage />
          </L>
        ),
      },
      {
        path: 'quest/character',
        element: (
          <L>
            <QuestCharacterPage />
          </L>
        ),
      },
      {
        path: 'quest/character/learn',
        element: (
          <L>
            <QuestLearnPage />
          </L>
        ),
      },
      {
        path: 'quest/:questId',
        element: (
          <L>
            <GenericQuestPage />
          </L>
        ),
      },
      {
        path: 'studio/prompt',
        element: (
          <L>
            <PromptStudioPage />
          </L>
        ),
      },
      {
        path: 'studio/compare',
        element: (
          <L>
            <ComparePage />
          </L>
        ),
      },
      {
        path: 'studio/story',
        element: (
          <L>
            <StoryStudioPage />
          </L>
        ),
      },
      {
        path: 'studio/comic',
        element: (
          <L>
            <ComicStudioPage />
          </L>
        ),
      },
      {
        path: 'studio/video',
        element: (
          <L>
            <VideoStudioPage />
          </L>
        ),
      },
      {
        path: 'backpack',
        element: (
          <L>
            <BackpackPage />
          </L>
        ),
      },
      {
        path: 'portfolio/:projectId',
        element: (
          <L>
            <PortfolioPage />
          </L>
        ),
      },
      {
        path: 'profile',
        element: (
          <L>
            <ProfilePage />
          </L>
        ),
      },
      {
        path: 'stars',
        element: (
          <L>
            <StarsPage />
          </L>
        ),
      },
      {
        path: 'challenge/:challengeId',
        element: (
          <L>
            <ChallengePage />
          </L>
        ),
      },
      {
        path: 'parent/overview',
        element: (
          <L>
            <ParentOverviewPage />
          </L>
        ),
      },
      {
        path: 'parent/approvals',
        element: (
          <L>
            <ParentApprovalsPage />
          </L>
        ),
      },
      {
        path: 'parent/privacy',
        element: (
          <L>
            <ParentPrivacyPage />
          </L>
        ),
      },
      {
        path: 'teacher/overview',
        element: (
          <L>
            <TeacherOverviewPage />
          </L>
        ),
      },
      {
        path: 'teacher/students',
        element: (
          <L>
            <TeacherStudentsPage />
          </L>
        ),
      },
      {
        path: 'teacher/projects',
        element: (
          <L>
            <TeacherProjectsPage />
          </L>
        ),
      },
      {
        path: '*',
        element: (
          <L>
            <Navigate to="/welcome" replace />
          </L>
        ),
      },
    ],
  },
])
