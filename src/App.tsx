import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from './components/shared/protected-route/ProtectedRoute'
import { FullScreenLoader } from './components/shared/spinner/Spinner'
import { ErrorBoundary } from './components/shared/error-boundary/ErrorBoundary'
import { useTheme } from './stores/themeStore'

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const AuthLayout = lazy(() => import('./layouts/AuthLayout'))

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const FeedPage = lazy(() => import('./pages/feed/FeedPage'))
const DesignSystemShowcasePage = lazy(() => import('./pages/dev/DesignSystemShowcasePage'))
const SubjectsPage = lazy(() => import('./pages/subjects/SubjectsPage'))
const ProposalsPage = lazy(() => import('./pages/proposals/ProposalsPage'))
const PracticePage = lazy(() => import('./pages/practice/PracticePage'))
const QuestionAnalyticsPage = lazy(() => import('./pages/questions/QuestionAnalyticsPage'))
const LeaderboardPage = lazy(() => import('./pages/gamification/LeaderboardPage'))
const ShopPage = lazy(() => import('./pages/gamification/ShopPage'))
const MinigamesPage = lazy(() => import('./pages/gamification/MinigamesPage'))

export default function App() {
  // Sync global theme
  useTheme()

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* Public Authentication Flow */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Standalone Design System Showcase */}
          <Route path="/showcase" element={<DesignSystemShowcasePage />} />

          {/* Protected Application Flow */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/proposals" element={<ProposalsPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/practice/:sessionId" element={<PracticePage />} />
              <Route path="/questions" element={<SubjectsPage />} />
              <Route path="/questions/:id/analytics" element={<QuestionAnalyticsPage />} />
              <Route path="/exams" element={<DashboardPage />} />
              <Route path="/settings" element={<DashboardPage />} />
              <Route path="/gamification/leaderboard" element={<LeaderboardPage />} />
              <Route path="/gamification/minigames" element={<MinigamesPage />} />
              <Route path="/shop" element={<ShopPage />} />
            </Route>
          </Route>

          {/* Root Redirect to Social Feed */}
          <Route path="/" element={<Navigate to="/feed" replace />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </Suspense>
    </ErrorBoundary>
  )
}
