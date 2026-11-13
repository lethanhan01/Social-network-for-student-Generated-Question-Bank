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
          <Button
            size="sm"
            className="min-h-11"
            disabled={busy}
            variant="outline"
            onClick={() => {
              void perform('follow')
            }}
          >
            {t(following ? 'social.unfollow' : 'social.follow')}
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
