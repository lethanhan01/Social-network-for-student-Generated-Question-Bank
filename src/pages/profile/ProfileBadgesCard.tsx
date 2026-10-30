import { useTranslation } from 'react-i18next'
import { Award, ShieldAlert } from 'lucide-react'
import { Card, Badge, Image } from '@/components/ui/data-display'
import { Heading, Text } from '@/components/ui/typography'
import { useUserBadgesQuery } from '@/hooks/queries/useGamificationQuery'
import { formatDate } from '@/utils/date'

interface ProfileBadgesCardProps {
  userId?: number
}

export function ProfileBadgesCard({ userId }: Readonly<ProfileBadgesCardProps>) {
  const { t } = useTranslation()
  const { data: badges = [], isLoading } = useUserBadgesQuery(userId)

  return (
    <Card className="p-4 sm:p-5 bg-surface border-line-subtle shadow-card rounded-2xl space-y-4">
      <header className="flex items-center justify-between">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header title flex layout] */}
        <div className="flex items-center gap-2">
          <Award size={18} className="text-tone-warning" />
          <Heading level={3} className="text-sm font-bold text-text-primary">
            {t('profile.badgesTitle', 'Huy hiệu thành tích')}
          </Heading>
        </div>
        <Badge tone="accent" size="sm">
          {badges.length} {t('profile.badgeUnit', 'huy hiệu')}
        </Badge>
      </header>

      {isLoading ? (
        <Text size="xs" tone="muted" className="italic py-2 text-center">
          {t('common.loading', 'Đang tải danh sách huy hiệu...')}
        </Text>
      ) : badges.length > 0 ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Badges grid layout] */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {badges.map((badge) => (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Single badge card container] */
            <div
              key={badge.badge_id || badge.name}
              className="flex flex-col items-center text-center p-3 rounded-xl bg-surface-elevated border border-line-subtle space-y-1.5"
            >
              {badge.icon_url ? (
                <Image
                  src={badge.icon_url}
                  alt={badge.name || 'Huy hiệu'}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Badge placeholder circle] */
                <div className="w-10 h-10 rounded-full bg-tone-warning/15 text-tone-warning flex items-center justify-center">
                  <Award size={20} />
                </div>
              )}
              <strong className="text-xs font-semibold text-text-primary line-clamp-1">
                {badge.name}
              </strong>
              {badge.description ? (
                <Text size="xs" tone="muted" className="text-[11px] line-clamp-2">
                  {badge.description}
                </Text>
              ) : null}
              {badge.earned_at ? (
                <time className="text-[10px] text-text-muted block" dateTime={badge.earned_at}>
                  {formatDate(badge.earned_at)}
                </time>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Empty badges state container] */
        <div className="text-center py-4 space-y-1">
          <ShieldAlert size={24} className="mx-auto text-text-muted" />
          <Text size="xs" tone="muted">
            {t('profile.emptyBadges', 'Chưa đạt được huy hiệu học tập nào.')}
          </Text>
        </div>
      )}
    </Card>
  )
}
