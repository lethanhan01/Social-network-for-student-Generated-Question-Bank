import { useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/actions/Button'
import { Text } from '@/components/ui/typography/Text'
import { getSecondaryShortcutItems, resolveUserRoles } from '@/config/navigation.config'
import { useAuthStore, type Role } from '@/stores/authStore'
import { cn } from '@/utils/cn'

export interface FeatureShortcutsNavProps {
  roles?: Role[]
  showAllPosts?: boolean
  isAllPostsActive?: boolean
  onSelectAllPosts?: () => void
  onNavigate?: () => void
  className?: string
}

/** Role-aware bilingual shortcuts navigation shared across SocialLeftSidebar and MobileNavDrawer. */
export function FeatureShortcutsNav({
  roles,
  showAllPosts = false,
  isAllPostsActive = false,
  onSelectAllPosts,
  onNavigate,
  className,
}: Readonly<FeatureShortcutsNavProps>) {
  const { t } = useTranslation('common')
  const { pathname } = useLocation()
  const authUser = useAuthStore((state) => state.user)
  const effectiveRoles = resolveUserRoles(roles ?? authUser?.roles, authUser?.role)

  if (!effectiveRoles || effectiveRoles.length === 0) {
    return null
  }

  const shortcutItems = getSecondaryShortcutItems(effectiveRoles)

  return (
    <nav aria-label={t('nav.shortcuts')} className={cn('space-y-1', className)}>
      <Text size="xs" tone="muted" className="font-semibold uppercase tracking-wider px-2 mb-2 block">
        {t('nav.shortcuts')}
      </Text>
      {showAllPosts ? (
        <ButtonLink
          to="/feed"
          variant={isAllPostsActive ? 'secondary' : 'ghost'}
          size="sm"
          aria-current={isAllPostsActive && pathname === '/feed' ? 'page' : undefined}
          className="w-full justify-start gap-2.5 min-h-11"
          onClick={() => {
            onSelectAllPosts?.()
            onNavigate?.()
          }}
        >
          <Sparkles size={18} className="text-action-accent shrink-0" />
          <strong className="font-normal truncate">{t('feed.allPosts')}</strong>
        </ButtonLink>
      ) : null}
      {shortcutItems.map((item) => {
        const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`)
        return (
          <ButtonLink
            key={item.id}
            to={item.to}
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            aria-current={isActive ? 'page' : undefined}
            className="w-full justify-start gap-2.5 min-h-11"
            onClick={onNavigate}
          >
            {item.icon}
            <strong className="font-normal truncate">{t(item.labelKey)}</strong>
          </ButtonLink>
        )
      })}
    </nav>
  )
}

