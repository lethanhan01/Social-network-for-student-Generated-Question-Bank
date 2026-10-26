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
const PostDetailPage = lazy(() => import('./pages/post/PostDetailPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const FriendsPage = lazy(() => import('./pages/friends/FriendsPage'))
const SearchPage = lazy(() => import('./pages/search/SearchPage'))
const DesignSystemShowcasePage = lazy(() => import('./pages/dev/DesignSystemShowcasePage'))

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
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/search" element={<SearchPage />} />

              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/exams" element={<DashboardPage />} />
              <Route path="/questions" element={<DashboardPage />} />
              <Route path="/settings" element={<DashboardPage />} />
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
