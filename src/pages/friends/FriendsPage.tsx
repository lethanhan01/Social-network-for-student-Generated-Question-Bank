import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heading } from '@/components/ui/typography/Heading'
import { Button } from '@/components/ui/actions/Button'
import { ConfirmDialog } from '@/components/ui/overlay/ConfirmDialog'
import { QueryFeedback } from '@/components/social/QueryFeedback'
import { LoadMore } from '@/components/social/LoadMore'
import {
  useConnectionsQuery,
  useFollowMutation,
  type ConnectionTab,
} from '@/hooks/queries/useSocialListsQuery'
import {
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useUnfriendMutation,
  useUnblockUserMutation,
} from '@/hooks/queries/useRelationshipsQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { ConnectionCard, type ConnectionAction } from './ConnectionCard'

const TABS: ConnectionTab[] = ['FRIENDS', 'RECEIVED', 'SENT', 'FOLLOWING', 'FOLLOWERS', 'BLOCKED']
export default function FriendsPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab = TABS.find((value) => value === params.get('tab')) ?? 'FRIENDS'
  const query = useConnectionsQuery(tab)
  const accept = useAcceptFriendRequestMutation()
  const decline = useDeclineFriendRequestMutation()
  const unfriend = useUnfriendMutation()
  const unblock = useUnblockUserMutation()
  const follow = useFollowMutation()
  const [confirmation, setConfirmation] = useState<{ action: ConnectionAction; id: number }>()
  const busy =
    accept.isPending ||
    decline.isPending ||
    unfriend.isPending ||
    unblock.isPending ||
    follow.isPending
  const entries = query.data?.pages.flatMap((page) => page.items ?? []) ?? []
  async function perform(action: ConnectionAction, id: number) {
    if (busy) return
    try {
      if (action === 'accept') await accept.mutateAsync({ requester_id: id })
      else if (action === 'decline') await decline.mutateAsync({ requester_id: id })
      else if (action === 'unfriend') await unfriend.mutateAsync(id)
      else if (action === 'unblock') await unblock.mutateAsync(id)
      else await follow.mutateAsync({ id, following: true })
      toast.success(t('social.saved'))
      setConfirmation(undefined)
    } catch (error) {
      toast.error(getApiError(error, t('zone2.actionError')))
    }
  }
  function onAction(action: ConnectionAction, id: number) {
    if (action === 'unfriend' || action === 'unblock' || action === 'unfollow')
      setConfirmation({ action, id })
    else void perform(action, id)
  }
  return (
    <section className="space-y-5">
      <Heading level={1} className="text-2xl font-bold">
        {t('social.connectionsTitle')}
      </Heading>
      <nav aria-label={t('social.connectionsTitle')} className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((value) => (
          <Button
            key={value}
            variant={tab === value ? 'secondary' : 'ghost'}
            aria-pressed={tab === value}
            className="shrink-0"
            onClick={() => setParams({ tab: value })}
          >
            {t(`social.connections.${value}`)}
          </Button>
        ))}
      </nav>
      {query.isPending || (query.isError && !query.data) ? (
        <QueryFeedback pending={query.isPending} error={query.error} onRetry={query.refetch} />
      ) : null}
      {query.isSuccess && entries.length === 0 ? (
        <p className="py-8 text-center text-text-muted">{t('social.emptyConnections')}</p>
      ) : null}
      <section className="grid gap-4 sm:grid-cols-2">
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
      <LoadMore query={query} />
      <ConfirmDialog
        open={Boolean(confirmation)}
        title={t('social.confirmAction')}
        description={t('social.confirmConnection')}
        loading={busy}
        onClose={() => {
          if (!busy) setConfirmation(undefined)
        }}
        onConfirm={() => (confirmation ? perform(confirmation.action, confirmation.id) : undefined)}
      />
    </section>
  )
}
