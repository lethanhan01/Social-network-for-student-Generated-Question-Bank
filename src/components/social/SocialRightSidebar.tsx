import { useTranslation } from 'react-i18next'
import { Users, UserPlus } from 'lucide-react'
import { Card, Avatar, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { Separator } from '@/components/ui/layout'
import type { FriendDto } from '@/types/relationship.types'

interface SocialRightSidebarProps {
  friends?: FriendDto[]
}

export function SocialRightSidebar({ friends = [] }: Readonly<SocialRightSidebarProps>) {
  const { t } = useTranslation()

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Right sidebar container] */
    <div className="space-y-4">
      {/* Friends Connection Card */}
      <Card className="p-4 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3">
        <header className="flex items-center justify-between">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Friends header title flex layout] */}
          <div className="flex items-center gap-2">
            <Users size={18} className="text-action-accent" />
            <Heading level={4} className="text-sm font-bold text-text-primary">
              {t('friends.title', 'Bạn bè & Kết nối')}
            </Heading>
          </div>
          <Badge emphasis="outline" size="sm">
            {friends.length} {t('friends.friendCountUnit', 'bạn')}
          </Badge>
        </header>

        <Separator />

        {friends.length > 0 ? (
          <section aria-label="Danh sách bạn bè" className="space-y-1">
            {friends.slice(0, 8).map((friend) => {
              const name = friend.full_name || 'Bạn học SQB'
              const initials = name.trim().charAt(0).toUpperCase()
              return (
                <ButtonLink
                  key={friend.user_id}
                  to={`/profile/${friend.user_id}`}
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-3 p-2 rounded-xl hover:bg-surface-hover text-left min-h-11 h-auto"
                >
                  <Avatar
                    src={friend.avatar_url || undefined}
                    name={name}
                    fallback={initials}
                    size="sm"
                    tone="accent"
                  />
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Friend info text container] */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary truncate">{name}</p>
                    <p className="text-[11px] text-text-muted truncate">
                      {friend.mutual_friends_count
                        ? `${friend.mutual_friends_count} ${t('friends.mutualCount', 'bạn chung')}`
                        : t('friends.connected', 'Bạn bè HUST')}
                    </p>
                  </div>
                </ButtonLink>
              )
            })}

            <div className="pt-2">
              <ButtonLink
                to="/friends"
                variant="outline"
                size="sm"
                className="text-xs w-full justify-center min-h-11"
              >
                {t('friends.viewAll', 'Xem tất cả bạn bè')}
              </ButtonLink>
            </div>
          </section>
        ) : (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Empty friends text stack] */
          <div className="text-center py-4 space-y-2">
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [UserPlus icon circle] */}
            <div className="w-10 h-10 mx-auto rounded-full bg-surface-hover flex items-center justify-center text-text-muted">
              <UserPlus size={18} />
            </div>
            <Text size="xs" tone="muted">
              {t('friends.empty', 'Chưa có bạn bè nào được kết nối.')}
            </Text>
            <ButtonLink
              to="/friends"
              variant="outline"
              size="sm"
              className="text-xs w-full justify-center min-h-11"
            >
              {t('friends.findFriends', 'Tìm kiếm & Kết nối')}
            </ButtonLink>
          </div>
        )}
      </Card>
    </div>
  )
}
