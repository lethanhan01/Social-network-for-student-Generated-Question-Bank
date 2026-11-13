import { useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { GraduationCap, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { Separator } from '@/components/ui/layout'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/overlay/Sheet'
import { getPrimaryNavItems, resolveUserRoles } from '@/config/navigation.config'
import { FeatureShortcutsNav } from './FeatureShortcutsNav'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavDrawer({ isOpen, onClose }: Readonly<MobileNavDrawerProps>) {
  const { t } = useTranslation('common')
  const { pathname } = useLocation()
  const prevPathRef = useRef(pathname)
  const user = useAuthStore((state) => state.user)
  const effectiveRoles = resolveUserRoles(user?.roles, user?.role)
  const primaryNavItems = getPrimaryNavItems(effectiveRoles)

  // Close drawer strictly when route changes
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      onClose()
    }
  }, [pathname, onClose])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-72 p-4 bg-surface-card border-r border-line-subtle shadow-card flex flex-col z-50 md:hidden"
      >
        {/* Drawer Header */}
        <SheetHeader className="pb-3 border-b border-line-subtle">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-action-accent flex items-center justify-center text-fg-on-solid font-bold shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <strong className="text-sm font-bold text-fg-primary leading-tight block">
                SQB HUST
              </strong>
              <strong className="text-xs font-normal text-fg-muted block">
                Question Bank
              </strong>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Content List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-4">
          {/* Primary Navigation Modules */}
          <nav aria-label={t('nav.primaryModules')} className="space-y-1">
            <Text size="xs" tone="muted" className="font-semibold uppercase tracking-wider px-2 mb-2 block">
              {t('nav.primaryModules')}
            </Text>
            {primaryNavItems.map((item) => {
              const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`)
              return (
                <ButtonLink
                  key={item.id}
                  to={item.to}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={onClose}
                  className={cn(
                    'w-full justify-start gap-3 min-h-11 text-xs',
                    isActive ? 'font-semibold text-action-accent' : 'text-fg-primary'
                  )}
                >
                  <span className="shrink-0 text-action-accent">{item.icon}</span>
                  <strong className="font-normal truncate">{t(item.labelKey)}</strong>
                </ButtonLink>
              )
            })}
          </nav>

          <Separator />

          {/* Secondary Shortcuts */}
          <FeatureShortcutsNav roles={effectiveRoles} onNavigate={onClose} />

          <ButtonLink
            to="/settings"
            variant={pathname === '/settings' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onClose}
            className={cn(
              'w-full justify-start gap-3 min-h-11 text-xs',
              pathname === '/settings' ? 'font-semibold text-action-accent' : 'text-fg-primary'
            )}
          >
            <span className="shrink-0 text-action-accent"><Settings size={18} /></span>
            <strong className="font-normal truncate">{t('nav.settings')}</strong>
          </ButtonLink>
        </div>
      </SheetContent>
    </Sheet>
  )
}
