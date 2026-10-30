import { NavLink } from 'react-router-dom'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions'
import { ThemeToggle } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
import { TopbarNav } from './TopbarNav'
import { TopbarAvatarDropdown } from './TopbarAvatarDropdown'
import type { TopbarProps } from './topbar.types'
import { cn } from '@/utils/cn'

export function Topbar({
  className,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}: Readonly<TopbarProps> = {}) {
  const { t } = useTranslation('common')
  const toggleLabel = isMobileMenuOpen
    ? t('nav.closeMenu', 'Đóng menu điều hướng')
    : t('nav.openMenu', 'Mở menu điều hướng')

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-20 h-16 px-4 sm:px-6 bg-surface-card border-b border-line-subtle flex items-center justify-between gap-2 sm:gap-4 transition-colors duration-200',
        className
      )}
    >
      {/* Left: Mobile Menu Trigger + Brand Identity */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Brand identity container] */}
      <div className="flex items-center gap-3 shrink-0">
        {onToggleMobileMenu ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMobileMenu}
            className="md:hidden min-h-11 min-w-11 p-0 shrink-0"
            aria-label={toggleLabel}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        ) : null}

        <NavLink
          to="/feed"
          aria-label="SQB HUST"
          className="flex items-center gap-3 min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
        >
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Brand logo mark] */}
          <div className="w-10 h-10 rounded-xl bg-action-accent flex items-center justify-center text-fg-on-solid font-bold shrink-0">
            <GraduationCap size={22} />
          </div>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Brand text wrapper] */}
          <div className="truncate">
            <strong className="font-extrabold text-base tracking-tight text-fg-primary block truncate">
              SQB HUST
            </strong>
            <strong className="hidden sm:block text-[11px] font-normal text-fg-muted truncate">
              Question Bank Platform
            </strong>
          </div>
        </NavLink>
      </div>

      {/* Center: Desktop Navigation Bar */}
      <TopbarNav className="hidden md:flex flex-1 justify-center max-w-2xl mx-2" />

      {/* Right: Global Actions */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Global action buttons row] */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <ThemeToggle />
        <LanguageSwitcher />
        <TopbarAvatarDropdown />
      </div>
    </header>
  )
}

export type { TopbarProps } from './topbar.types'
