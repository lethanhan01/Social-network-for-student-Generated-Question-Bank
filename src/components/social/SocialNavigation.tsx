import { Home, Users, Search, BookOpen, MessageCircle, Trophy } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/actions/Button'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { useMyProfileQuery } from '@/hooks/queries/useProfileQuery'

export function SocialNavigation({ compact = false }: Readonly<{ compact?: boolean }>) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const profile = useMyProfileQuery()
  const links = [
    { to: '/feed', icon: Home, label: t('feed.title') },
    { to: '/friends', icon: Users, label: t('social.connectionsTitle') },
    { to: '/search', icon: Search, label: t('search.title') },
    { to: '/messages', icon: MessageCircle, label: t('profile.message_integration') },
    { to: '/subjects', icon: BookOpen, label: t('social.study') },
    { to: '/gamification/leaderboard', icon: Trophy, label: t('social.leaderboard') },
  ]
  return (
    <nav
      aria-label={t('social.navigation')}
      className={compact ? 'flex gap-1 overflow-x-auto' : 'space-y-2'}
    >
      {!compact ? (
        <ButtonLink
          to="/profile/me"
          variant="ghost"
          className="min-h-14 w-full justify-start gap-3 rounded-xl"
        >
          <Avatar
            src={profile.data?.avatar_url || undefined}
            name={profile.data?.full_name}
            size="sm"
          />
          <strong className="truncate text-sm">
            {profile.data?.full_name ?? t('social.myProfile')}
          </strong>
        </ButtonLink>
      ) : null}
      {links.map(({ to, icon: Icon, label }) => (
        <ButtonLink
          key={to}
          to={to}
          aria-current={pathname.startsWith(to) ? 'page' : undefined}
          variant={pathname.startsWith(to) ? 'secondary' : 'ghost'}
          className={
            compact ? 'min-h-11 shrink-0' : 'min-h-12 w-full justify-start gap-3 rounded-xl'
          }
          leftIcon={<Icon size={20} />}
        >
          {label}
        </ButtonLink>
      ))}
    </nav>
  )
}
