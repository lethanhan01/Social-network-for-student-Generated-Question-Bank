import { useLocation } from 'react-router-dom'
import { GraduationCap, Menu, X, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, ButtonLink } from '@/components/ui/actions'
import { ThemeToggle } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
import { TopbarNav } from './TopbarNav'
import { TopbarSearch } from './TopbarSearch'
import { TopbarAvatarDropdown } from './TopbarAvatarDropdown'
import type { TopbarProps } from './topbar.types'
import { cn } from '@/utils/cn'

export function Topbar({
  className,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}: Readonly<TopbarProps> = {}) {
  const { t } = useTranslation('common')
  const { pathname } = useLocation()
  const toggleLabel = isMobileMenuOpen
    ? t('nav.closeMenu')
    : t('nav.openMenu')

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-20 h-16 px-2 sm:px-6 bg-surface-card border-b border-line-subtle flex items-center justify-between gap-1 sm:gap-4 transition-colors duration-200',
        className
      )}
    >
      {/* Left: Mobile Menu Trigger + Brand Identity + Facebook-style Pill Search */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Brand identity and search container] */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
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

        <ButtonLink
          to="/feed"
          variant="ghost"
          aria-label="SQB HUST"
          className="flex items-center gap-2.5 min-w-0 rounded-xl p-0 h-auto shrink-0"
        >
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Brand logo mark] */}
          <div className="w-10 h-10 rounded-full bg-action-accent flex items-center justify-center text-fg-on-solid font-bold shrink-0">
            <GraduationCap size={22} />
          </div>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Brand text wrapper] */}
          <div className="hidden sm:block md:hidden xl:block truncate text-left">
            <strong className="font-extrabold text-base tracking-tight text-fg-primary block truncate">
              SQB HUST
            </strong>
            <strong className="text-[11px] font-normal text-fg-muted truncate block">
              Question Bank
            </strong>
          </div>
        </ButtonLink>

        <TopbarSearch />
      </div>

      {/* Center: Desktop Navigation Bar with Wide Facebook Tab Slots */}
      <TopbarNav className="hidden md:flex flex-1 max-w-xl mx-2 h-full" />

      {/* Right: Global Actions */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Global action buttons row] */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        <ButtonLink
          to="/messages"
          variant="ghost"
          size="sm"
          aria-label={t('nav.messages')}
          aria-current={pathname.startsWith('/messages') ? 'page' : undefined}
          className={cn('min-h-11 min-w-11 p-0 rounded-full hover:bg-surface-card-hover flex items-center justify-center shrink-0', pathname.startsWith('/messages') ? 'text-action-accent border-b-2 border-action-accent' : 'text-fg-muted hover:text-fg-primary')}
        >
          <MessageCircle size={20} />
        </ButtonLink>
        <ThemeToggle className="min-h-11 min-w-11" />
        <LanguageSwitcher />
        <TopbarAvatarDropdown />
      </div>
    </header>
  )
}

export type { TopbarProps } from './topbar.types'
