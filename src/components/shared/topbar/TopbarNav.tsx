import { NavLink, useLocation } from 'react-router-dom'
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
            <NavLink
              to={item.to}
              aria-label={label}
              title={label}
              className={cn(
                'h-full flex-1 max-w-[110px] min-w-[56px] px-2 flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus min-h-11',
                isActive
                  ? 'border-b-[3px] border-action-accent text-action-accent font-semibold'
                  : 'border-b-[3px] border-transparent text-fg-muted hover:text-fg-primary hover:bg-surface-card-hover hover:rounded-xl'
              )}
            >
              {item.icon}
            </NavLink>
          </Tooltip>
        )
      })}
    </nav>
  )
}
