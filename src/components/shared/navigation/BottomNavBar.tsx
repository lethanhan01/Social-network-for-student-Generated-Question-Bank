import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRIMARY_NAV_ITEMS } from '@/config/navigation.config'
import { cn } from '@/utils/cn'

export function BottomNavBar() {
  const { t } = useTranslation('common')

  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed bottom-0 inset-x-0 z-20 h-16 bg-surface-card border-t border-line-subtle md:hidden flex items-center justify-around px-1 transition-colors duration-200"
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
                'flex flex-col items-center justify-center min-h-11 min-w-11 px-1 py-1 rounded-lg transition-colors duration-200 flex-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus',
                isActive
                  ? 'text-action-accent font-semibold'
                  : 'text-fg-muted hover:text-fg-primary'
              )
            }
          >
            {item.icon}
            <strong className="text-xs font-medium leading-tight truncate max-w-[64px] block mt-0.5">
              {label}
            </strong>
          </NavLink>
        )
      })}
    </nav>
  )
}
