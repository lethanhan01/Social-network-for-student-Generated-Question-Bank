import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ButtonLink } from '@/components/ui/actions/Button'
import { ConfirmDialog } from '@/components/ui/overlay/ConfirmDialog'
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

export function ProfileActions({
  profile,
  myRole,
  onReport,
}: Readonly<{ profile: ProfileResponse; myRole?: string; onReport: () => void }>) {
  const { t } = useTranslation()
  const [confirm, setConfirm] = useState<'unfriend' | 'block' | 'unblock'>()
  const stats = useRelationshipStatsQuery(profile.user_id ?? 0)
  const send = useSendFriendRequestMutation()
  const unfriend = useUnfriendMutation()
  const block = useBlockUserMutation()
  const unblock = useUnblockUserMutation()
  const follow = useFollowMutation()
  const busy =
    send.isPending || unfriend.isPending || block.isPending || unblock.isPending || follow.isPending
  const blocked = stats.data?.relationship_with_me?.blocked === true
  const isFriend =
    stats.data?.relationship_with_me?.friend ?? profile.relationships?.is_friend ?? false
  const following =
    stats.data?.relationship_with_me?.following ?? profile.relationships?.is_following ?? false
  const pending =
    (stats.data?.relationship_with_me?.friend_request_status ??
      profile.relationships?.friend_request_status) === 'PENDING'
  const sameRole = (myRole === 'STUDENT' || myRole === 'LECTURER') && myRole === profile.role
  async function perform(action: 'send' | 'unfriend' | 'block' | 'unblock' | 'follow') {
    if (!profile.user_id || busy) return
    try {
      if (action === 'send') await send.mutateAsync({ addressee_id: profile.user_id })
      else if (action === 'unfriend') await unfriend.mutateAsync(profile.user_id)
      else if (action === 'block') await block.mutateAsync(profile.user_id)
      else if (action === 'unblock') await unblock.mutateAsync(profile.user_id)
      else await follow.mutateAsync({ id: profile.user_id, following })
      toast.success(t('social.saved'))
      setConfirm(undefined)
    } catch (error) {
      toast.error(getApiError(error, t('zone2.actionError')))
    }
  }
  return (
    <section className="flex flex-wrap justify-center gap-2 sm:justify-end">
      {blocked ? (
        <Button disabled={busy} variant="outline" onClick={() => setConfirm('unblock')}>
          {t('profile.unblock_user')}
        </Button>
      ) : (
        <>
          <ButtonLink to={`/messages?userId=${profile.user_id}`} variant="secondary">
            {t('profile.message_integration')}
          </ButtonLink>
          {sameRole ? (
            <Button
              disabled={busy || pending}
              variant={isFriend ? 'outline' : 'primary'}
              onClick={() => (isFriend ? setConfirm('unfriend') : void perform('send'))}
            >
              {isFriend
                ? t('profile.is_friend')
                : pending
                  ? t('profile.cancel_friend_request')
                  : t('profile.send_friend_request')}
            </Button>
          ) : null}
          {pending ? (
            <ButtonLink to="/friends?tab=RECEIVED" variant="ghost">
              {t('friends.tab_received')}
            </ButtonLink>
          ) : null}
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => {
              void perform('follow')
            }}
          >
            {t(following ? 'social.unfollow' : 'social.follow')}
          </Button>
          <Button disabled={busy} variant="ghost" onClick={() => setConfirm('block')}>
            {t('zone2.blockUser')}
          </Button>
        </>
      )}
      <Button variant="ghost" onClick={onReport}>
        {t('report.submit')}
      </Button>
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
