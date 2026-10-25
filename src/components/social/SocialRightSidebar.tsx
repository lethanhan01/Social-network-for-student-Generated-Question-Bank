import { Trophy, Flame, UserPlus, Users } from 'lucide-react'
import { Card, Avatar, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { Separator } from '@/components/ui/layout'
import type { FriendDto } from '@/types/relationship.types'

interface SocialRightSidebarProps {
  friends?: FriendDto[]
}

export function SocialRightSidebar({ friends = [] }: Readonly<SocialRightSidebarProps>) {
  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Right sidebar container] */
    <div className="space-y-4">
      {/* Gamification & Academic Streak Card */}
      <Card className="p-4 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3">
        <header className="flex items-center justify-between">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Streak icon and title layout] */}
          <div className="flex items-center gap-2">
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Flame icon square wrapper] */}
            <div className="w-8 h-8 rounded-lg bg-tone-warning/15 flex items-center justify-center text-tone-warning">
              <Flame size={18} />
            </div>
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Streak title text wrapper] */}
            <div>
              <Heading level={4} className="text-xs font-bold text-text-primary">
                Chuỗi học tập
              </Heading>
              <Text size="xs" tone="muted">
                Điểm danh hàng ngày
              </Text>
            </div>
          </div>
          <Badge tone="accent" size="sm">
            Streak: 3 ngày
          </Badge>
        </header>

        <section aria-label="Thống kê học tập" className="p-3 bg-surface-hover rounded-xl border border-line-subtle">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Coins row layout] */}
          <div className="flex items-center justify-between text-xs mb-1">
            <strong className="font-normal text-text-muted">Xu SQB tích lũy:</strong>
            <strong className="font-bold text-action-accent">150 Coins</strong>
          </div>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Rank row layout] */}
          <div className="flex items-center justify-between text-xs">
            <strong className="font-normal text-text-muted">Hạng tuần:</strong>
            <strong className="font-bold text-text-primary">#14 Toàn trường</strong>
          </div>
        </section>

        <ButtonLink
          to="/practice"
          variant="secondary"
          size="sm"
          className="w-full justify-center text-xs min-h-11"
          leftIcon={<Trophy size={14} className="text-tone-warning" />}
        >
          Tham gia Thử thách hôm nay
        </ButtonLink>
      </Card>

      {/* Online Study Buddies (Friends) Card */}
      <Card className="p-4 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3">
        <header className="flex items-center justify-between">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Friends header title flex layout] */}
          <div className="flex items-center gap-2">
            <Users size={18} className="text-action-accent" />
            <Heading level={4} className="text-sm font-bold text-text-primary">
              Bạn học trực tuyến
            </Heading>
          </div>
          <Badge emphasis="outline" size="sm">
            {friends.length} bạn
          </Badge>
        </header>

        <Separator />

        {friends.length > 0 ? (
          <section aria-label="Danh sách bạn bè" className="space-y-1">
            {friends.map((friend) => {
              const name = friend.full_name || 'Bạn học'
              const initials = name.trim().charAt(0).toUpperCase()
              return (
                <article
                  key={friend.user_id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar relative indicator container] */}
                  <div className="relative">
                    <Avatar
                      src={friend.avatar_url || undefined}
                      name={name}
                      fallback={initials}
                      size="sm"
                      tone="accent"
                    />
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Online status indicator dot] */}
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tone-success ring-2 ring-surface"
                      aria-label="Đang trực tuyến"
                    />
                  </div>
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Friend info text container] */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {name}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">
                      Sinh viên HUST
                    </p>
                  </div>
                </article>
              )
            })}
          </section>
        ) : (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Empty friends text stack] */
          <div className="text-center py-4 space-y-2">
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [UserPlus icon circle] */}
            <div className="w-10 h-10 mx-auto rounded-full bg-surface-hover flex items-center justify-center text-text-muted">
              <UserPlus size={18} />
            </div>
            <Text size="xs" tone="muted">
              Chưa có bạn học nào trực tuyến.
            </Text>
            <ButtonLink
              to="/friends"
              variant="outline"
              size="sm"
              className="text-xs w-full justify-center min-h-11"
            >
              Kết nối bạn bè HUST
            </ButtonLink>
          </div>
        )}
      </Card>
    </div>
  )
}
