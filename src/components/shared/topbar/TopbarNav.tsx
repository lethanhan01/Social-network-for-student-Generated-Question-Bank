import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRIMARY_NAV_ITEMS } from '@/config/navigation.config'
import { cn } from '@/utils/cn'

interface TopbarNavProps {
  className?: string
}

export function TopbarNav({ className }: Readonly<TopbarNavProps>) {
  const { t } = useTranslation('common')

  return (
    <nav
      aria-label="Thanh điều hướng chính"
      className={cn('items-center h-16 gap-1 lg:gap-2', className)}
    >
      {PRIMARY_NAV_ITEMS.map((item) => {
        const label = t(item.labelKey, item.defaultLabel)

        return (
          <NavLink
            key={item.id}
            to={item.to}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'min-h-11 min-w-11 px-3 py-2 flex items-center justify-center gap-2 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus',
                isActive
                  ? 'border-b-2 border-action-accent bg-action-accent/10 text-action-accent font-semibold'
                  : 'text-fg-muted hover:text-fg-primary hover:bg-surface-card-hover border-b-2 border-transparent'
              )
            }
          >
            {item.icon}
            <strong className="hidden xl:inline font-medium text-xs whitespace-nowrap">
              {label}
            </strong>
          </NavLink>
        )
      })}
    </nav>
  )
}

