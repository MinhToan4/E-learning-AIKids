import { lazy } from 'react'
import { Navigate, Route } from 'react-router'
import { RouteGuard } from './RouteGuard'

const HomePage = lazy(() => import('@/features/home/pages/HomePage').then((module) => ({ default: module.HomePage })))
const WorldPage = lazy(() => import('@/features/world/pages/WorldPage').then((module) => ({ default: module.WorldPage })))
const CourseIntroPage = lazy(() => import('@/features/course/pages/CourseIntroPage').then((module) => ({ default: module.CourseIntroPage })))
const RuleLearningPage = lazy(() => import('@/features/rules/pages/RuleLearningPage').then((module) => ({ default: module.RuleLearningPage })))
const LessonPage = lazy(() => import('@/features/lesson/pages/LessonPage').then((module) => ({ default: module.LessonPage })))
const BackpackPage = lazy(() => import('@/features/backpack/pages/BackpackPage').then((module) => ({ default: module.BackpackPage })))
const CreativePage = lazy(() => import('@/features/creative/pages/CreativePage').then((module) => ({ default: module.CreativePage })))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const AvatarStudioPage = lazy(() => import('@/features/avatar-studio/AvatarStudioPage').then((module) => ({ default: module.AvatarStudioPage })))
const MeeCatStudioPage = lazy(() => import('@/features/mee-rig/pages/MeeCatStudioPage').then((module) => ({ default: module.MeeCatStudioPage })))
const AchievementsPage = lazy(() => import('@/features/achievements/pages/AchievementsPage').then((module) => ({ default: module.AchievementsPage })))
const StorybookPage = lazy(() => import('@/features/storybook/pages/StorybookPage').then((module) => ({ default: module.StorybookPage })))
const CommunityPage = lazy(() => import('@/features/storybook/pages/CommunityPage').then((module) => ({ default: module.CommunityPage })))
const ProgressPage = lazy(() => import('@/features/leaderboard/pages/LeaderboardPage').then((module) => ({ default: module.ProgressPage })))
const ExplorerLevelPage = lazy(() => import('@/features/level/pages/ExplorerLevelPage').then((module) => ({ default: module.ExplorerLevelPage })))
const EventsPage = lazy(() => import('@/features/events/pages/EventsPage').then((module) => ({ default: module.EventsPage })))
const AssessmentPage = lazy(() => import('@/features/assessment/pages/AssessmentPage').then((module) => ({ default: module.AssessmentPage })))
const AsmoHubPage = lazy(() => import('@/features/asmo/pages/AsmoHubPage').then((module) => ({ default: module.AsmoHubPage })))
const Asmo3DLabPage = lazy(() => import('@/features/asmo/pages/Asmo3DLabPage').then((module) => ({ default: module.Asmo3DLabPage })))
const AsmoExamArenaPage = lazy(() => import('@/features/asmo/pages/AsmoExamArenaPage').then((module) => ({ default: module.AsmoExamArenaPage })))
const AsmoLearningJourneyPage = lazy(() => import('@/features/asmo/pages/AsmoLearningJourneyPage').then((module) => ({ default: module.AsmoLearningJourneyPage })))
const AsmoCurriculumRoadmapPage = lazy(() => import('@/features/asmo/pages/AsmoCurriculumRoadmapPage').then((module) => ({ default: module.AsmoCurriculumRoadmapPage })))
const AsmoCurriculumLessonPage = lazy(() => import('@/features/asmo/pages/AsmoCurriculumLessonPage').then((module) => ({ default: module.AsmoCurriculumLessonPage })))

const student = (page: React.ReactNode) => (
  <RouteGuard roles={['student']} requireOnboarded>{page}</RouteGuard>
)

export function createStudentRoutes() {
  return [
    <Route key="home" path="/home" element={student(<HomePage />)} />,
    <Route key="course" path="/course/:courseId" element={student(<CourseIntroPage />)} />,
    <Route key="learn-redirect" path="/learn" element={<Navigate to="/world/program/aikid_official" replace />} />,
    <Route key="world-redirect" path="/world" element={<Navigate to="/world/program/aikid_official" replace />} />,
    <Route key="world-aikid-redirect" path="/world/aikid" element={<Navigate to="/world/program/aikid_official" replace />} />,
    <Route key="world-official-redirect" path="/world/official" element={<Navigate to="/world/program/aikid_official" replace />} />,
    <Route key="world-creator-legacy-redirect" path="/world/program/aikid_official/creator" element={<Navigate to="/world/program/aikid_official" replace />} />,
    <Route key="program" path="/world/program/:programId" element={student(<WorldPage />)} />,
    <Route key="program-track" path="/world/program/:programId/:trackId" element={student(<WorldPage />)} />,
    <Route key="world-spaces" path="/world/spaces" element={<Navigate to="/world/program/aikid_official" replace />} />,
    <Route key="world-lesson" path="/world/:courseId/lesson/:lessonId" element={student(<LessonPage />)} />,
    <Route key="world-quest" path="/world/:courseId/quests/:lessonId" element={student(<LessonPage />)} />,
    <Route key="world-rule" path="/world/:courseId/rule/:ruleId" element={student(<LessonPage />)} />,
    <Route key="world-course" path="/world/:courseId" element={student(<WorldPage />)} />,
    <Route key="rules-redirect" path="/rules" element={<Navigate to="/world/dao-1" replace />} />,
    <Route key="rule" path="/rules/:ruleId" element={student(<RuleLearningPage />)} />,
    <Route key="lesson" path="/lesson/:questId" element={student(<LessonPage />)} />,
    <Route key="lesson-studio" path="/lesson/:questId/studio" element={student(<LessonPage />)} />,
    <Route key="backpack" path="/backpack" element={student(<BackpackPage />)} />,
    <Route key="creative" path="/creative" element={student(<CreativePage />)} />,
    <Route key="profile" path="/profile" element={student(<ProfilePage />)} />,
    <Route key="avatar-studio" path="/profile/avatar-studio" element={student(<AvatarStudioPage />)} />,
    <Route key="mee-cat-lab" path="/lab/mee-cat" element={<MeeCatStudioPage />} />,
    <Route key="mee-cat-studio" path="/mee-cat-studio" element={<MeeCatStudioPage />} />,
    <Route key="community" path="/community" element={student(<CommunityPage />)} />,
    <Route key="achievements" path="/achievements" element={student(<AchievementsPage />)} />,
    <Route key="storybook" path="/storybook" element={student(<StorybookPage />)} />,
    <Route key="progress" path="/progress" element={student(<ProgressPage />)} />,
    <Route key="leaderboard-redirect" path="/leaderboard" element={<Navigate to="/progress" replace />} />,
    <Route key="level" path="/level" element={student(<ExplorerLevelPage />)} />,
    <Route key="events" path="/events" element={student(<EventsPage />)} />,
    <Route key="assessments" path="/assessments" element={student(<AssessmentPage />)} />,
    <Route key="asmo" path="/asmo" element={student(<AsmoHubPage />)} />,
    <Route key="asmo-curriculum" path="/asmo/curriculum" element={student(<AsmoCurriculumRoadmapPage />)} />,
    <Route key="asmo-curriculum-lesson" path="/asmo/curriculum/lesson/:lessonId" element={student(<AsmoCurriculumLessonPage />)} />,
    <Route key="asmo-journey" path="/asmo/journey" element={student(<AsmoLearningJourneyPage />)} />,
    <Route key="asmo-topic" path="/asmo/journey/:topicId" element={student(<AsmoLearningJourneyPage />)} />,
    <Route key="asmo-lab" path="/asmo/lab" element={student(<Asmo3DLabPage />)} />,
    <Route key="asmo-exam" path="/asmo/exam/:examId" element={student(<AsmoExamArenaPage />)} />,
  ]
}
