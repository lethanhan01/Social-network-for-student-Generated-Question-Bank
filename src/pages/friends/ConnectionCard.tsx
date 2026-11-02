import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/data-display/Card'
import { Avatar } from '@/components/ui/data-display/Avatar'
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
    <Card as="article" className="flex flex-col gap-4 rounded-2xl">
      <header className="flex items-center gap-3">
        <Avatar
          src={person.avatar_url || undefined}
          name={person.full_name ?? t('social.member')}
          size="md"
        />
        <ButtonLink
          to={`/profile/${person.user_id}`}
          variant="ghost"
          className="min-w-0 justify-start font-bold"
        >
          {person.full_name ?? t('social.member')}
        </ButtonLink>
      </header>
      <footer className="mt-auto flex flex-wrap gap-2">
        {tab === 'RECEIVED' ? (
          <>
            <Button disabled={busy} onClick={() => onAction('accept', person.user_id!)}>
              {t('profile.accept_friend_request')}
            </Button>
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => onAction('decline', person.user_id!)}
            >
              {t('profile.decline_friend_request')}
            </Button>
          </>
        ) : tab === 'BLOCKED' ? (
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => onAction('unblock', person.user_id!)}
          >
            {t('profile.unblock_user')}
          </Button>
        ) : (
          <ButtonLink to={`/messages?userId=${person.user_id}`} variant="secondary">
            {t('profile.message_integration')}
          </ButtonLink>
        )}
        {tab === 'FRIENDS' ? (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => onAction('unfriend', person.user_id!)}
          >
            {t('social.unfriend')}
          </Button>
        ) : null}
        {tab === 'FOLLOWING' ? (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => onAction('unfollow', person.user_id!)}
          >
            {t('social.unfollow')}
          </Button>
        ) : null}
        {tab === 'SENT' ? (
          <p className="text-sm text-text-muted">{t('profile.cancel_friend_request')}</p>
        ) : null}
      </footer>
    </Card>
  )
}
