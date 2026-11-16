import { useTranslation } from 'react-i18next'
import { Card, Avatar, Badge } from '@/components/ui/data-display'
import { Heading } from '@/components/ui/typography/Heading'
import { Text } from '@/components/ui/typography/Text'
import { Separator } from '@/components/ui/layout/Separator'
import { FeatureShortcutsNav } from '@/components/shared/navigation/FeatureShortcutsNav'
import { resolveUserRoles } from '@/config/navigation.config'
import { useAuthStore } from '@/stores/authStore'
import type { ProfileResponse } from '@/types'

interface SocialLeftSidebarProps {
  user?: ProfileResponse
}

export function SocialLeftSidebar({ user }: Readonly<SocialLeftSidebarProps>) {
  const { t } = useTranslation('common')
  const authUser = useAuthStore((state) => state.user)
  const effectiveRoles = resolveUserRoles(
    user?.role ? [user.role] : authUser?.roles,
    authUser?.role
  )
  const displayName = user?.full_name || user?.email || t('social.member')
  const initials = displayName.trim().charAt(0).toUpperCase()
  const studentCode = user?.student_lecturer_code || '—'

  return (
    <Card as="section" padding="none" className="space-y-3 border-transparent bg-transparent p-2 shadow-none">
      {/* User Profile Summary */}
      <header className="flex items-center gap-3">
        <Avatar
          src={user?.avatar_url || undefined}
          name={displayName}
          fallback={initials}
          size="lg"
          tone="accent"
        />
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User profile text layout] */}
        <div className="min-w-0 flex-1">
          <Heading level={3} className="text-sm font-bold text-fg-primary truncate">
            {displayName}
          </Heading>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User student code and role badge flex row] */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Text size="xs" tone="muted" className="truncate">
              {t('social.studentCode', { code: studentCode })}
            </Text>
            <Badge tone="accent" size="xs">
              {t(user?.role === 'LECTURER' ? 'social.roleLecturer' : 'social.roleStudent')}
            </Badge>
          </div>
        </div>
      </header>

      {user?.bio ? (
        <Text as="p" size="xs" tone="muted" className="italic break-words px-1">
          &ldquo;{user.bio}&rdquo;
        </Text>
      ) : null}

      <Separator />

      {/* Role-aware Navigation Shortcuts */}
      <FeatureShortcutsNav roles={effectiveRoles} />
    </Card>
  )
}
