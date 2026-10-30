import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/shared/sidebar/Sidebar'
import { Topbar } from '@/components/shared/topbar/Topbar'
import { PageLoader } from '@/components/shared/spinner/Spinner'
import { ErrorBoundary } from '@/components/shared/error-boundary/ErrorBoundary'

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Root dashboard layout flex wrapper] */
    <div className="min-h-screen bg-surface-base text-fg-primary flex flex-col">
      {/* Topbar: Fixed full-width header (h-16, z-20) */}
      <Topbar
        isMobileMenuOpen={isMobileOpen}
        onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
      />

      {/* Sidebar: Fixed below Topbar (top-16 bottom-0, z-20) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Mobile Backdrop: Covers area below Topbar (top-16, z-10) */}
      {isMobileOpen ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS, SEMANTIC_CLICK [Mobile sidebar backdrop dismiss overlay] */
        <div
          className="fixed top-16 inset-x-0 bottom-0 bg-surface-overlay z-10 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Main Content Area: Offset by Topbar (pt-16) and collapsed Sidebar (md:pl-18) */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Main content offset container] */}
      <div className="flex-1 flex flex-col pt-16 md:pl-18 min-w-0 transition-all duration-300">
        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 w-full min-w-0">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
