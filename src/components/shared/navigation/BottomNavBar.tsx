import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPrimaryNavItems } from '@/config/navigation.config'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

export function BottomNavBar() {
  const { t } = useTranslation('common')
  const user = useAuthStore((state) => state.user)
  const navItems = getPrimaryNavItems(user?.roles)

  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed bottom-0 inset-x-0 z-20 h-16 bg-surface-card border-t border-line-subtle md:hidden flex items-center justify-around px-2 transition-colors duration-200"
    >
      {navItems.map((item) => {
        const label = t(item.labelKey, item.defaultLabel)

        return (
          <NavLink
            key={item.id}
            to={item.to}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center min-h-11 min-w-11 p-2 rounded-xl transition-colors duration-200 flex-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus',
                isActive
                  ? 'text-action-accent'
                  : 'text-fg-muted hover:text-fg-primary'
              )
            }
          >
            {item.icon}
          </NavLink>
        )
      })}
    </nav>
  )
}
