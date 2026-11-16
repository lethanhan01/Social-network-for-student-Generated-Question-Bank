import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ellipsis, Flag, UserX } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/actions/Button'
import {
  ConfirmDialog, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/overlay'
import {
  useSendFriendRequestMutation,
  useUnfriendMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useRelationshipStatsQuery,
} from '@/hooks/queries/useRelationshipsQuery'
import { useFollowMutation } from '@/hooks/queries/useSocialListsQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import type { ProfileResponse } from '@/types'

function getFriendLabelKey(isFriend: boolean, pending: boolean) {
  if (isFriend) return 'profile.is_friend' as const
  if (pending) return 'profile.cancel_friend_request' as const
  return 'profile.send_friend_request' as const
}

function getRelationshipView(
  profile: ProfileResponse,
  rel?: {
    blocked?: boolean
    friend?: boolean
    following?: boolean
    friend_request_status?: string
  },
  myRole?: string
) {
  const isFriend = rel?.friend ?? profile.relationships?.is_friend ?? false
  const following = rel?.following ?? profile.relationships?.is_following ?? false
  const pending =
    (rel?.friend_request_status ?? profile.relationships?.friend_request_status) === 'PENDING'

  return {
    blocked: rel?.blocked === true,
    isFriend,
    following,
    pending,
    sameRole: (myRole === 'STUDENT' || myRole === 'LECTURER') && myRole === profile.role,
    friendLabelKey: getFriendLabelKey(isFriend, pending),
    friendVariant: isFriend ? ('outline' as const) : ('primary' as const),
    followLabelKey: following ? ('social.unfollow' as const) : ('social.follow' as const),
  }
}

export function ProfileActions({
  profile,
  myRole,
  onReport,
}: Readonly<{ profile: ProfileResponse; myRole?: string; onReport: () => void }>) {
  const { t } = useTranslation()
  const { t: tp } = useTranslation('portal')
  const [confirm, setConfirm] = useState<'unfriend' | 'block' | 'unblock'>()
  const stats = useRelationshipStatsQuery(profile.user_id ?? 0)
  const send = useSendFriendRequestMutation()
  const unfriend = useUnfriendMutation()
  const block = useBlockUserMutation()
  const unblock = useUnblockUserMutation()
  const follow = useFollowMutation()
  const busy = [send, unfriend, block, unblock, follow].some((m) => m.isPending)
  const {
    blocked,
    isFriend,
    following,
    pending,
    sameRole,
    friendLabelKey,
    friendVariant,
    followLabelKey,
  } = getRelationshipView(profile, stats.data?.relationship_with_me, myRole)

  async function perform(action: 'send' | 'unfriend' | 'block' | 'unblock' | 'follow') {
    const userId = profile.user_id
    if (!userId || busy) return
    const handlers = {
      send: () => send.mutateAsync({ addressee_id: userId }),
      unfriend: () => unfriend.mutateAsync(userId),
      block: () => block.mutateAsync(userId),
      unblock: () => unblock.mutateAsync(userId),
      follow: () => follow.mutateAsync({ id: userId, following }),
    }
    try {
      await handlers[action]()
      toast.success(t('social.saved'))
      setConfirm(undefined)
    } catch (error) {
      toast.error(getApiError(error, t('zone2.actionError')))
    }
  }
  return (
    <section className="flex w-full min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
      {blocked ? (
        <Button disabled={busy} variant="outline" onClick={() => setConfirm('unblock')}>
          {t('profile.unblock_user')}
        </Button>
      ) : (
        <>
          <ButtonLink to={`/messages?userId=${profile.user_id}`} variant="secondary" size="sm" className="min-h-11">
            {t('profile.message_integration')}
          </ButtonLink>
          {sameRole ? (
            <Button
              size="sm"
              className="min-h-11"
              disabled={busy || pending}
              variant={friendVariant}
              onClick={() => (isFriend ? setConfirm('unfriend') : void perform('send'))}
            >
              {t(friendLabelKey)}
            </Button>
          ) : null}
          <Button
            size="sm"
            className="min-h-11"
            disabled={busy}
            variant="outline"
            onClick={() => {
              void perform('follow')
            }}
          >
            {t(followLabelKey)}
          </Button>
        </>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="min-h-11 min-w-11 px-2" aria-label={tp('profileActions')}>
            <Ellipsis size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {pending && !blocked ? (
            <DropdownMenuItem asChild className="min-h-11 justify-start">
              <ButtonLink to="/friends?tab=RECEIVED" variant="ghost" size="sm">{t('friends.tab_received')}</ButtonLink>
            </DropdownMenuItem>
          ) : null}
          {!blocked ? (
            <DropdownMenuItem disabled={busy} destructive className="min-h-11" onSelect={() => setConfirm('block')}>
              <UserX size={16} /> {t('zone2.blockUser')}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem className="min-h-11" onSelect={onReport}>
            <Flag size={16} /> {t('report.submit')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={Boolean(confirm)}
        title={t('social.confirmAction')}
        description={t('social.confirmConnection')}
        loading={busy}
        onClose={() => {
          if (!busy) setConfirm(undefined)
        }}
        onConfirm={() => (confirm ? perform(confirm) : undefined)}
      />
    </section>
  )
}
