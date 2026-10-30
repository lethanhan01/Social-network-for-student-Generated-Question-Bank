import { Suspense, useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Topbar } from '@/components/shared/topbar/Topbar'
import { BottomNavBar } from '@/components/shared/navigation/BottomNavBar'
import { MobileNavDrawer } from '@/components/shared/navigation/MobileNavDrawer'
import { PageLoader } from '@/components/shared/spinner/Spinner'
import { ErrorBoundary } from '@/components/shared/error-boundary/ErrorBoundary'

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleToggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const handleCloseMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Root dashboard layout flex wrapper] */
    <div className="min-h-screen bg-surface-base text-fg-primary flex flex-col">
      {/* Topbar: Fixed full-width header (h-16, z-20) */}
      <Topbar
        isMobileMenuOpen={isMobileOpen}
        onToggleMobileMenu={handleToggleMobile}
      />

      {/* Mobile Slide-in Drawer for Secondary Shortcuts */}
      <MobileNavDrawer
        isOpen={isMobileOpen}
        onClose={handleCloseMobile}
      />

      {/* Main Content Area: Offset by Topbar (pt-16), full-width without sidebar offset */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Main content container without sidebar offset] */}
      <div className="flex-1 flex flex-col pt-16 min-w-0 transition-all duration-300">
        {/* Page Content: pb-20 on mobile to prevent BottomNavBar overlap, md:pb-6 on desktop */}
        <main className="flex-1 px-4 sm:px-6 py-6 pb-20 md:pb-6 w-full min-w-0">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Bottom Navigation Bar for Mobile Screens (< md) */}
      <BottomNavBar />
    </div>
  )
}
