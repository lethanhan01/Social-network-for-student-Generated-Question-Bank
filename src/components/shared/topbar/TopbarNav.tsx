import { useLocation } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/actions/Button'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@/components/ui/overlay'
import { PRIMARY_NAV_ITEMS } from '@/config/navigation.config'
import { cn } from '@/utils/cn'

interface TopbarNavProps {
  className?: string
}

export function TopbarNav({ className }: Readonly<TopbarNavProps>) {
  const { t } = useTranslation('common')
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Thanh điều hướng chính"
      className={cn('flex items-center justify-center h-full gap-1 sm:gap-2', className)}
    >
      {PRIMARY_NAV_ITEMS.map((item) => {
        const label = t(item.labelKey, item.defaultLabel)
        const isActive =
          pathname === item.to ||
          (item.to !== '/feed' && pathname.startsWith(`${item.to}/`))

        return (
          <Tooltip key={item.id} content={label} side="bottom" delayDuration={300}>
            <ButtonLink
              to={item.to}
              variant="ghost"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              title={label}
              className={cn(
                'h-full flex-1 max-w-24 min-w-11 rounded-none px-2 flex items-center justify-center transition-colors duration-200 min-h-11 border-b-2',
                isActive
                  ? 'border-action-accent text-action-accent font-semibold'
                  : 'border-transparent text-fg-muted hover:text-fg-primary hover:bg-surface-card-hover'
              )}
            >
              {item.icon}
            </ButtonLink>
          </Tooltip>
        )
      })}
    </nav>
  )
}
