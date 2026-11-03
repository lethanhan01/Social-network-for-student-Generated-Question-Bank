import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { FullScreenLoader } from './components/shared/spinner/Spinner'
import { ErrorBoundary } from './components/shared/error-boundary/ErrorBoundary'
import { useTheme } from './stores/themeStore'
import { AppRoutes } from './routes'

export default function App() {
  // Sync global theme
  useTheme()

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <AppRoutes />

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
