import { useRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SidebarNav } from './SidebarNav'
import { getSQBNavSections } from './sidebar.config'
import type { SidebarProps } from './sidebar.types'
import { cn } from '@/utils/cn'

/**
 * @deprecated Shell thanh điều hướng cạnh bên màn hình cũ.
 * Toàn bộ điều hướng chính của hệ thống đã được phân bố lên Topbar (TopbarNav) và BottomBar (BottomNavBar).
 */
export function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
  className,
}: Readonly<SidebarProps>) {
  const [expanded, setExpanded] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { pathname } = useLocation()
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      onCloseMobile?.()
    }
  }, [pathname, onCloseMobile])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  function handleMouseEnter() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setExpanded(true)
  }

  function handleMouseLeave() {
    closeTimerRef.current = setTimeout(() => setExpanded(false), 300)
  }

  const sections = getSQBNavSections()
  const isSidebarExpanded = expanded || isMobileOpen

  return (
    <aside
      className={cn(
        'rogym-sidebar fixed top-16 bottom-0 left-0 z-20 bg-surface-card border-r border-line-subtle transition-all duration-300 flex flex-col',
        isSidebarExpanded ? 'w-64 is-expanded shadow-card' : 'w-18',
        isMobileOpen
          ? 'translate-x-0 is-mobile-open'
          : '-translate-x-full md:translate-x-0',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Thanh điều hướng cạnh bên cũ"
    >
      {/* Nav List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-4">
        <SidebarNav sections={sections} expanded={isSidebarExpanded} />
      </div>
    </aside>
  )
}

