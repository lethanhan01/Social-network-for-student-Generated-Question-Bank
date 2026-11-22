import { lazy, type ComponentType } from 'react'
import { Navigate, useParams, useSearchParams, type RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'
import { preloadNamespaces, type AppNamespace } from '@/lib/i18n'

const lazyWithNs = <T extends { default: ComponentType }>(
  loader: () => Promise<T>,
  ns: AppNamespace[]
) => lazy(() => Promise.all([loader(), preloadNamespaces(ns)]).then(([mod]) => mod))

const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))

const DashboardPage = lazy(() => import('@/pages/student/dashboard/DashboardPage'))
const PracticePage = lazyWithNs(() => import('@/pages/student/practice/PracticePage'), ['academic', 'portal'])
const ProposalsPage = lazyWithNs(() => import('@/pages/student/proposals/ProposalsPage'), ['academic', 'portal'])
const SubjectsPage = lazyWithNs(() => import('@/pages/student/subjects/SubjectsPage'), ['academic', 'portal'])
const QuestionAnalyticsPage = lazyWithNs(() => import('@/pages/student/questions/QuestionAnalyticsPage'), ['academic', 'portal'])
const LeaderboardPage = lazyWithNs(() => import('@/pages/student/gamification/LeaderboardPage'), ['gamification'])
const MinigamesPage = lazyWithNs(() => import('@/pages/student/gamification/MinigamesPage'), ['gamification'])
const ShopPage = lazyWithNs(() => import('@/pages/student/gamification/ShopPage'), ['gamification'])

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
