import { NavLink } from 'react-router-dom'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions'
import { ThemeToggle } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
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
        'fixed top-0 left-0 right-0 z-20 h-16 px-4 sm:px-6 bg-surface-card border-b border-line-subtle flex items-center justify-between gap-4 transition-colors duration-200',
        className
      )}
    >
      {/* Left: Mobile Menu Trigger + Brand Identity */}
      <div className="flex items-center gap-3 min-w-0">
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
          to="/dashboard"
          className="flex items-center gap-3 min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
        >
          <div className="w-10 h-10 rounded-xl bg-action-accent flex items-center justify-center text-fg-on-solid font-bold shrink-0">
            <GraduationCap size={22} />
          </div>
          <div className="truncate">
            <span className="font-extrabold text-base tracking-tight text-fg-primary block truncate">
              SQB HUST
            </span>
            <span className="hidden sm:block text-[11px] text-fg-muted truncate">
              Question Bank Platform
            </span>
          </div>
        </NavLink>
      </div>

      {/* Right: Global Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <ThemeToggle />
        <LanguageSwitcher />
        <TopbarAvatarDropdown />
      </div>
    </header>
  )
}

export type { TopbarProps } from './topbar.types'
