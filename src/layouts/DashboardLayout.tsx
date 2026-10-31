import { Suspense, useState, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Topbar } from '@/components/shared/topbar/Topbar'
import { BottomNavBar } from '@/components/shared/navigation/BottomNavBar'
import { MobileNavDrawer } from '@/components/shared/navigation/MobileNavDrawer'
import { PageLoader } from '@/components/shared/spinner/Spinner'
import { ErrorBoundary } from '@/components/shared/error-boundary/ErrorBoundary'
import { cn } from '@/utils/cn'

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const isMessagesRoute = location.pathname.startsWith('/messages')

  const handleToggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const handleCloseMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Root dashboard layout flex wrapper] */
    <div className={cn('bg-surface-base text-fg-primary flex flex-col', isMessagesRoute ? 'h-screen overflow-hidden' : 'min-h-screen')}>
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
      <div className={cn('flex-1 flex flex-col pt-16 min-w-0 transition-all duration-300', isMessagesRoute && 'h-[calc(100vh-4rem)] min-h-0 overflow-hidden')}>
        {/* Page Content: Full bleed for messages, pb-20 on mobile for other pages */}
        <main
          className={cn(
            'flex-1 w-full min-w-0',
            isMessagesRoute
              ? 'p-0 h-full min-h-0 overflow-hidden flex flex-col'
              : 'px-4 sm:px-6 py-6 pb-20 md:pb-6'
          )}
        >
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Bottom Navigation Bar for Mobile Screens (< md), omitted on /messages for full-screen chat */}
      {isMessagesRoute ? null : <BottomNavBar />}
    </div>
  )
}
