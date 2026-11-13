import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, Send, ShieldBan, UserCheck, UserRound } from 'lucide-react'
import { Heading } from '@/components/ui/typography/Heading'
import { Page } from '@/components/ui/layout/PageUI'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/navigation/Tabs'
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
import { ConnectionGrid, type ConnectionAction } from './ConnectionCard'

const TABS: ConnectionTab[] = ['FRIENDS', 'RECEIVED', 'SENT', 'BLOCKED', 'FOLLOWING', 'FOLLOWERS']
const TAB_ICONS = {
  FRIENDS: Users, RECEIVED: UserPlus, SENT: Send, BLOCKED: ShieldBan,
  FOLLOWING: UserCheck, FOLLOWERS: UserRound,
}
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
    <Page className="max-w-5xl space-y-3">
      <header className="space-y-1 pb-3 border-b border-line-subtle">
        <Heading level={1} className="text-2xl font-bold tracking-tight">
          {t('social.connectionsTitle')}
        </Heading>
        <p className="text-sm text-fg-muted">{t('social.connectionsSubtitle')}</p>
      </header>
      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value })} variant="pills" className="space-y-3">
        <TabsList aria-label={t('social.connectionsTitle')} className="max-w-full overflow-x-auto">
          {TABS.map((value) => {
            const Icon = TAB_ICONS[value]
            return (
              <TabsTrigger key={value} value={value} leftIcon={<Icon size={16} />} className="min-h-11 text-sm shrink-0">
                {t(`social.connections.${value}`)}{tab === value && query.isSuccess ? ` (${entries.length})` : ''}
              </TabsTrigger>
            )
          })}
        </TabsList>
        <TabsContent value={tab} className="space-y-4">
          {query.isPending || (query.isError && !query.data) ? (
            <QueryFeedback pending={query.isPending} error={query.error} onRetry={query.refetch} />
          ) : null}
          {query.isSuccess && entries.length === 0 ? (
            <section className="social-card border border-line-subtle bg-surface-card p-4 text-center text-sm text-fg-muted">
              <p>{t('social.emptyConnections')}</p>
            </section>
          ) : null}
          <ConnectionGrid entries={entries} tab={tab} busy={busy} onAction={onAction} />
          <LoadMore query={query} />
        </TabsContent>
      </Tabs>
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
    </Page>
  )
}
