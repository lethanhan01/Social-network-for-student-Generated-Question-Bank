import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, Send, ShieldBan, Check, X, UserMinus, Unlock, MessageSquare } from 'lucide-react'
import { Card, Avatar, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { Page } from '@/components/ui/layout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/navigation'
import { ConfirmDialog } from '@/components/ui/overlay'
import {
  useFriendsQuery,
  useReceivedFriendRequestsQuery,
  useSentFriendRequestsQuery,
  useBlockedUsersQuery,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useUnfriendMutation,
  useUnblockUserMutation,
} from '@/hooks/queries/useRelationshipsQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { QueryFeedback } from '@/components/social/QueryFeedback'

export default function FriendsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'FRIENDS' | 'RECEIVED' | 'SENT' | 'BLOCKED'>('FRIENDS')
  const [unfriendTargetId, setUnfriendTargetId] = useState<number | null>(null)

  const friendsQuery = useFriendsQuery()
  const receivedQuery = useReceivedFriendRequestsQuery()
  const sentQuery = useSentFriendRequestsQuery()
  const blockedQuery = useBlockedUsersQuery()

  const acceptMutation = useAcceptFriendRequestMutation()
  const declineMutation = useDeclineFriendRequestMutation()
  const unfriendMutation = useUnfriendMutation()
  const unblockMutation = useUnblockUserMutation()

  const friends = friendsQuery.data?.items || []
  const received = receivedQuery.data?.items || []
  const sent = sentQuery.data?.items || []
  const blocked = blockedQuery.data?.items || []
  const activeQuery = { FRIENDS: friendsQuery, RECEIVED: receivedQuery, SENT: sentQuery, BLOCKED: blockedQuery }[activeTab]

  async function performAction(action: () => Promise<unknown>, message: string) {
    try {
      await action()
      toast.success(message)
    } catch (error) {
      toast.error(getApiError(error, t('zone2.actionError')))
    }
  }

  async function handleConfirmUnfriend() {
    if (!unfriendTargetId) return
    await performAction(() => unfriendMutation.mutateAsync(unfriendTargetId), t('friends.unfriendedSuccess', 'Đã hủy kết bạn.'))
    setUnfriendTargetId(null)
  }

  function handleAccept(requesterId?: number) {
    if (requesterId) {
      performAction(() => acceptMutation.mutateAsync({ requester_id: requesterId }), t('friends.acceptedSuccess', 'Đã đồng ý kết bạn!'))
    }
  }

  function handleDecline(requesterId?: number) {
    if (requesterId) {
      performAction(() => declineMutation.mutateAsync({ requester_id: requesterId }), t('friends.declinedSuccess', 'Đã từ chối kết bạn.'))
    }
  }

  function handleUnblock(blockedId?: number) {
    if (blockedId) {
      performAction(() => unblockMutation.mutateAsync(blockedId), t('friends.unblockedSuccess', 'Đã bỏ chặn.'))
    }
  }

  return (
    <Page className="max-w-5xl py-6 px-4 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-subtle">
        <hgroup>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {t('friends.pageTitle', 'Bạn bè & Kết nối')}
          </Heading>
          <Text size="sm" tone="muted">{t('friends.pageSubtitle', 'Quản lý bạn học đồng cấp, lời mời kết bạn và danh sách hạn chế')}</Text>
        </hgroup>
      </header>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} variant="pills" className="space-y-6">
        <TabsList aria-label={t('friends.tabsAria', 'Bộ lọc quan hệ')} className="overflow-x-auto">
          <TabsTrigger value="FRIENDS" leftIcon={<Users size={16} />}>{t('friends.tabFriends', 'Bạn bè')} ({friends.length})</TabsTrigger>
          <TabsTrigger value="RECEIVED" leftIcon={<UserPlus size={16} />}>{t('friends.tabReceived', 'Lời mời nhận')} ({received.length})</TabsTrigger>
          <TabsTrigger value="SENT" leftIcon={<Send size={16} />}>{t('friends.tabSent', 'Đã gửi')} ({sent.length})</TabsTrigger>
          <TabsTrigger value="BLOCKED" leftIcon={<ShieldBan size={16} />}>{t('friends.tabBlocked', 'Đã chặn')} ({blocked.length})</TabsTrigger>
        </TabsList>

        {activeQuery.isPending || activeQuery.isError ? (
          <QueryFeedback pending={activeQuery.isPending} error={activeQuery.error} onRetry={activeQuery.refetch} />
        ) : null}

        <TabsContent value="FRIENDS">
          {!activeQuery.isPending && !activeQuery.isError && (friends.length > 0 ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Friends grid container] */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {friends.map((f) => (
                <Card key={f.user_id} className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card space-y-3">
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User info layout] */}
                  <div className="flex items-center gap-3">
                    <Avatar src={f.avatar_url || undefined} name={f.full_name || 'HUST'} fallback={(f.full_name || 'H').charAt(0)} size="md" tone="accent" />
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User text column] */}
                    <div className="min-w-0 flex-1">
                      <ButtonLink to={`/profile/${f.user_id}`} variant="ghost" className="p-0 h-auto font-bold text-xs truncate text-text-primary hover:underline block text-left" viewTransition>{f.full_name}</ButtonLink>
                      <Text size="xs" tone="muted" className="truncate">{f.mutual_friends_count ? `${f.mutual_friends_count} ${t('friends.mutualCount', 'bạn chung')}` : t('friends.connected', 'Bạn bè HUST')}</Text>
                    </div>
                  </div>
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Card actions row] */}
                  <div className="flex items-center gap-2 pt-1 border-t border-line-subtle">
                    <ButtonLink to={`/messages?userId=${f.user_id}`} variant="secondary" size="sm" className="flex-1 justify-center min-h-11 text-xs gap-1" leftIcon={<MessageSquare size={14} />}>{t('profile.message', 'Nhắn tin')}</ButtonLink>
                    <Button variant="ghost" size="sm" onClick={() => f.user_id && setUnfriendTargetId(f.user_id)} className="min-h-11 px-2.5 text-tone-danger hover:bg-tone-danger/10" aria-label="Hủy kết bạn"><UserMinus size={16} /></Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 sm:p-10 text-center bg-surface border-line-subtle rounded-2xl"><Text size="sm" tone="muted">{t('friends.noFriends', 'Bạn chưa có người bạn nào trong danh sách.')}</Text></Card>
          ))}
        </TabsContent>

        <TabsContent value="RECEIVED">
          {!activeQuery.isPending && !activeQuery.isError && (received.length > 0 ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Received requests grid] */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {received.map((req, idx) => {
                const requester = req.requester
                const keyVal = requester?.user_id ? `received-${requester.user_id}` : `req-${idx}`
                return (
                  <Card key={keyVal} className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card space-y-3">
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Requester layout] */}
                    <div className="flex items-center gap-3">
                      <Avatar src={requester?.avatar_url || undefined} name={requester?.full_name || 'HUST'} fallback={(requester?.full_name || 'H').charAt(0)} size="md" />
                      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Requester text column] */}
                      <div className="min-w-0 flex-1">
                        <ButtonLink to={`/profile/${requester?.user_id}`} variant="ghost" className="p-0 h-auto font-bold text-xs truncate text-text-primary hover:underline block text-left" viewTransition>{requester?.full_name}</ButtonLink>
                        <Text size="xs" tone="muted">{req.mutual_friends_count ? `${req.mutual_friends_count} ${t('friends.mutualCount', 'bạn chung')}` : t('friends.requestReceivedLabel', 'Lời mời kết bạn')}</Text>
                      </div>
                    </div>
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Accept/Decline buttons] */}
                    <div className="flex items-center gap-2 pt-1 border-t border-line-subtle">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(requester?.user_id)}
                        disabled={acceptMutation.isPending}
                        className="flex-1 justify-center min-h-11 text-xs gap-1"
                        leftIcon={<Check size={14} />}
                      >
                        {t('friends.accept', 'Chấp nhận')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(requester?.user_id)}
                        disabled={declineMutation.isPending}
                        className="flex-1 justify-center min-h-11 text-xs gap-1"
                        leftIcon={<X size={14} />}
                      >
                        {t('friends.decline', 'Từ chối')}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-6 sm:p-10 text-center bg-surface border-line-subtle rounded-2xl"><Text size="sm" tone="muted">{t('friends.noReceived', 'Không có lời mời kết bạn nào đang chờ phản hồi.')}</Text></Card>
          ))}
        </TabsContent>

        <TabsContent value="SENT">
          {!activeQuery.isPending && !activeQuery.isError && (sent.length > 0 ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Sent requests grid] */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sent.map((item, idx) => {
                const keyVal = item.receiver?.user_id ? `sent-${item.receiver.user_id}` : `sent-idx-${idx}`
                return (
                  <Card key={keyVal} className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card flex items-center justify-between gap-3">
                    {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Sent user info] */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={item.receiver?.avatar_url || undefined} name={item.receiver?.full_name || 'HUST'} fallback={(item.receiver?.full_name || 'H').charAt(0)} size="md" />
                      <div className="min-w-0">
                        <ButtonLink to={`/profile/${item.receiver?.user_id}`} variant="ghost" className="p-0 h-auto font-bold text-xs truncate text-text-primary hover:underline block text-left" viewTransition>{item.receiver?.full_name}</ButtonLink>
                        <Text size="xs" tone="muted">{item.mutual_friends_count ? `${item.mutual_friends_count} ${t('friends.mutualCount', 'bạn chung')}` : t('friends.requestSentLabel', 'Đã gửi lời mời')}</Text>
                      </div>
                    </div>
                    <Badge tone="neutral" size="sm">{t('friends.pendingBadge', 'Đang chờ duyệt')}</Badge>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-6 sm:p-10 text-center bg-surface border-line-subtle rounded-2xl"><Text size="sm" tone="muted">{t('friends.noSent', 'Bạn chưa gửi lời mời kết bạn nào.')}</Text></Card>
          ))}
        </TabsContent>

        <TabsContent value="BLOCKED">
          {!activeQuery.isPending && !activeQuery.isError && (blocked.length > 0 ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Blocked list container] */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blocked.map((b) => (
                <Card key={b.user_id} className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card flex items-center justify-between gap-3">
                  {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Blocked user info] */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={b.avatar_url || undefined} name={b.full_name || 'HUST'} fallback={(b.full_name || 'H').charAt(0)} size="md" tone="neutral" />
                    <div className="min-w-0">
                      <Text size="xs" className="font-bold text-text-primary truncate">{b.full_name}</Text>
                      <Text size="xs" tone="muted">{t('friends.blockedLabel', 'Đã chặn')}</Text>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(b.user_id)}
                    disabled={unblockMutation.isPending}
                    className="min-h-11 text-xs gap-1"
                    leftIcon={<Unlock size={14} />}
                  >
                    {t('friends.unblock', 'Bỏ chặn')}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 sm:p-10 text-center bg-surface border-line-subtle rounded-2xl"><Text size="sm" tone="muted">{t('friends.noBlocked', 'Danh sách chặn trống.')}</Text></Card>
          ))}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={unfriendTargetId !== null}
        onClose={() => setUnfriendTargetId(null)}
        onConfirm={handleConfirmUnfriend}
        title={t('friends.confirmUnfriendTitle', 'Hủy kết bạn')}
        description={t('friends.confirmUnfriend', 'Bạn có chắc chắn muốn hủy kết bạn với người dùng này?')}
        variant="danger"
        loading={unfriendMutation.isPending}
      />
    </Page>
  )
}
