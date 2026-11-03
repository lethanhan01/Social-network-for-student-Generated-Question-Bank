import { lazy } from 'react'
import { Navigate, useParams, useSearchParams, type RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'

const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))

const DashboardPage = lazy(() => import('@/pages/student/dashboard/DashboardPage'))
const PracticePage = lazy(() => import('@/pages/student/practice/PracticePage'))
const ProposalsPage = lazy(() => import('@/pages/student/proposals/ProposalsPage'))
const SubjectsPage = lazy(() => import('@/pages/student/subjects/SubjectsPage'))
const QuestionAnalyticsPage = lazy(() => import('@/pages/student/questions/QuestionAnalyticsPage'))
const LeaderboardPage = lazy(() => import('@/pages/student/gamification/LeaderboardPage'))
const MinigamesPage = lazy(() => import('@/pages/student/gamification/MinigamesPage'))
const ShopPage = lazy(() => import('@/pages/student/gamification/ShopPage'))

function LegacyPracticeRootRedirect() {
  const [params] = useSearchParams()
  const search = params.toString() ? `?${params.toString()}` : ''
  return <Navigate to={`/student/practice${search}`} replace />
}

function LegacyPracticeRedirect() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [params] = useSearchParams()
  const search = params.toString() ? `?${params.toString()}` : ''
  return <Navigate to={`/student/practice/${sessionId}${search}`} replace />
}

function LegacyProposalsRedirect() {
  const [params] = useSearchParams()
  const search = params.toString() ? `?${params.toString()}` : ''
  return <Navigate to={`/student/proposals${search}`} replace />
}

function LegacyQuestionAnalyticsRedirect() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const search = params.toString() ? `?${params.toString()}` : ''
  return <Navigate to={`/student/questions/${id}/analytics${search}`} replace />
}

export const studentRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute allowedRoles={['STUDENT', 'student']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/student/dashboard', element: <DashboardPage /> },
          { path: '/student/practice', element: <PracticePage /> },
          { path: '/student/practice/:sessionId', element: <PracticePage /> },
          { path: '/student/proposals', element: <ProposalsPage /> },
          { path: '/student/subjects', element: <SubjectsPage /> },
          { path: '/student/questions/:id/analytics', element: <QuestionAnalyticsPage /> },
          { path: '/student/gamification/leaderboard', element: <LeaderboardPage /> },
          { path: '/student/gamification/minigames', element: <MinigamesPage /> },
          { path: '/student/shop', element: <ShopPage /> },
        ],
      },
    ],
  },
  // Legacy Redirects
  { path: '/practice', element: <LegacyPracticeRootRedirect /> },
  { path: '/practice/:sessionId', element: <LegacyPracticeRedirect /> },
  { path: '/proposals', element: <LegacyProposalsRedirect /> },
  { path: '/subjects', element: <Navigate to="/student/subjects" replace /> },
  { path: '/questions', element: <Navigate to="/student/subjects" replace /> },
  { path: '/questions/:id/analytics', element: <LegacyQuestionAnalyticsRedirect /> },
  { path: '/gamification/leaderboard', element: <Navigate to="/student/gamification/leaderboard" replace /> },
  { path: '/gamification/minigames', element: <Navigate to="/student/gamification/minigames" replace /> },
  { path: '/shop', element: <Navigate to="/student/shop" replace /> },
]

