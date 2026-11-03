import { useTranslation } from 'react-i18next'
import { MessageSquare, UserMinus, Check, X, Unlock, UserRoundMinus } from 'lucide-react'
import { Card } from '@/components/ui/data-display/Card'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { Badge } from '@/components/ui/data-display/Badge'
import { Button, ButtonLink } from '@/components/ui/actions/Button'
import type { ConnectionEntry, ConnectionTab } from '@/hooks/queries/useSocialListsQuery'

export type ConnectionAction = 'accept' | 'decline' | 'unfriend' | 'unblock' | 'unfollow'
export function ConnectionCard({
  entry,
  tab,
  busy,
  onAction,
}: Readonly<{
  entry: ConnectionEntry
  tab: ConnectionTab
  busy: boolean
  onAction: (action: ConnectionAction, id: number) => void
}>) {
  const { t } = useTranslation()
  const person = entry.requester ?? entry.receiver ?? entry
  if (!person.user_id) return null
  return (
    <Card as="article" className="flex flex-col gap-3 p-4 bg-surface-card border-line-subtle shadow-card rounded-2xl">
      <header className="flex items-center gap-3">
        <Avatar
          src={person.avatar_url || undefined}
          name={person.full_name ?? t('social.member')}
          size="md"
          tone={tab === 'BLOCKED' ? 'neutral' : 'accent'}
        />
        <hgroup className="min-w-0 flex-1 space-y-1">
          <ButtonLink
            to={`/profile/${person.user_id}`}
            variant="link"
            tone="neutral"
            truncate
            className="max-w-full min-h-11 justify-start text-sm font-bold text-fg-primary"
            viewTransition
          >
            {person.full_name ?? t('social.member')}
          </ButtonLink>
          <p className="text-xs text-fg-muted">
            {entry.mutual_friends_count
              ? t('social.mutualFriends', { count: entry.mutual_friends_count })
              : t(`social.connectionStatus.${tab}`)}
          </p>
        </hgroup>
      </header>
      <footer className="mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-line-subtle">
        {tab === 'RECEIVED' ? (
          <>
            <Button disabled={busy} size="sm" className="flex-1 min-h-11 text-xs" leftIcon={<Check size={14} />} onClick={() => onAction('accept', person.user_id!)}>
              {t('profile.accept_friend_request')}
            </Button>
            <Button
              disabled={busy}
              variant="outline"
              size="sm"
              className="flex-1 min-h-11 text-xs"
              leftIcon={<X size={14} />}
              onClick={() => onAction('decline', person.user_id!)}
            >
              {t('profile.decline_friend_request')}
            </Button>
          </>
        ) : tab === 'BLOCKED' ? (
          <Button
            disabled={busy}
            variant="outline"
            size="sm"
            className="min-h-11 text-xs"
            leftIcon={<Unlock size={14} />}
            onClick={() => onAction('unblock', person.user_id!)}
          >
            {t('profile.unblock_user')}
          </Button>
        ) : tab === 'SENT' ? (
          <Badge tone="neutral" size="sm">{t('social.pendingConnection')}</Badge>
        ) : (
          <ButtonLink to={`/messages?userId=${person.user_id}`} variant="secondary" size="sm" className="flex-1 min-h-11 text-xs" leftIcon={<MessageSquare size={14} />}>
            {t('profile.message_integration')}
          </ButtonLink>
        )}
        {tab === 'FRIENDS' ? (
          <Button
            variant="ghost"
            disabled={busy}
            size="sm"
            aria-label={t('social.unfriend')}
            className="min-h-11 min-w-11 p-0 text-status-danger-fg hover:bg-status-danger-bg"
            onClick={() => onAction('unfriend', person.user_id!)}
          >
            <UserMinus size={16} />
          </Button>
        ) : null}
        {tab === 'FOLLOWING' ? (
          <Button
            variant="ghost"
            disabled={busy}
            size="sm"
            className="min-h-11 text-xs"
            leftIcon={<UserRoundMinus size={16} />}
            onClick={() => onAction('unfollow', person.user_id!)}
          >
            {t('social.unfollow')}
          </Button>
        ) : null}
      </footer>
    </Card>
  )
}

export function ConnectionGrid({ entries, tab, busy, onAction }: Readonly<{
  entries: ConnectionEntry[]
  tab: ConnectionTab
  busy: boolean
  onAction: (action: ConnectionAction, id: number) => void
}>) {
  return (
    <section className={`grid gap-4 sm:grid-cols-2 ${tab === 'FRIENDS' ? 'lg:grid-cols-3' : ''}`}>
      {entries.map((entry) => (
        <ConnectionCard
          key={entry.user_id ?? entry.requester?.user_id ?? entry.receiver?.user_id}
          entry={entry}
          tab={tab}
          busy={busy}
          onAction={onAction}
        />
      ))}
    </section>
  )
}
