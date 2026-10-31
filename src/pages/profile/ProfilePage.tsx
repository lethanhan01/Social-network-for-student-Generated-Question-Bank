import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserPlus, UserCheck, UserX, Edit3, MessageCircle, GraduationCap, BookOpen, Calendar } from 'lucide-react'
import { Card, Avatar, Badge, Image } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { Page } from '@/components/ui/layout'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useAuthStore } from '@/stores/authStore'
import { useMyProfileQuery, useUserProfileQuery } from '@/hooks/queries/useProfileQuery'
import { useSendFriendRequestMutation, useUnfriendMutation, useBlockUserMutation } from '@/hooks/queries/useRelationshipsQuery'
import { useUserPostsQuery } from '@/hooks/queries/usePostsQuery'
import { PostCard } from '@/components/social/PostCard'
import { ReportModal } from '@/components/social/ReportPostModal'
import { EditProfileModal } from './EditProfileModal'
import { ProfileBadgesCard } from './ProfileBadgesCard'
import { formatDate } from '@/utils/date'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { QueryFeedback } from '@/components/social/QueryFeedback'
import type { ProfileResponse } from '@/types/user.types'
import type { PostResponseDto } from '@/types'

interface ActionProps {
  isMe: boolean; profile: ProfileResponse; isSameRole: boolean; isFriend: boolean
  reqStatus?: string; pending: boolean; blockPending: boolean
  onEdit: () => void; onReport: () => void; onFriend: () => void; onBlock: () => void
}

function ProfileActions({ isMe, profile, isSameRole, isFriend, reqStatus, pending, blockPending, onEdit, onReport, onFriend, onBlock }: Readonly<ActionProps>) {
  const { t } = useTranslation()
  if (isMe) {
    return (
      <Button variant="primary" size="sm" onClick={onEdit} className="min-h-11 px-4 gap-1.5" leftIcon={<Edit3 size={15} />}>
        {t('profile.edit', 'Chỉnh sửa hồ sơ')}
      </Button>
    )
  }

  let friendLabel: string = t('friends.addFriend', 'Kết bạn')
  if (isFriend) {
    friendLabel = t('friends.isFriend', 'Bạn bè')
  } else if (reqStatus === 'PENDING') {
    friendLabel = t('friends.pending', 'Đã gửi lời mời')
  }

  return (
    <>
      <Button variant="ghost" onClick={onReport}>{t('report.submit')}</Button>
      <ButtonLink to={`/messages?userId=${profile.user_id}`} variant="secondary" size="sm" className="min-h-11 px-4 gap-1.5" leftIcon={<MessageCircle size={15} />}>
        {t('profile.message', 'Nhắn tin')}
      </ButtonLink>
      {isSameRole ? (
        <Button variant={isFriend ? 'outline' : 'primary'} size="sm" onClick={onFriend} disabled={pending} className="min-h-11 px-4 gap-1.5" leftIcon={isFriend ? <UserCheck size={15} /> : <UserPlus size={15} />}>
          {friendLabel}
        </Button>
      ) : null}
      <Button variant="ghost" size="sm" onClick={onBlock} disabled={blockPending} className="min-h-11 px-2.5 text-tone-danger hover:bg-tone-danger/10" aria-label={t('zone2.blockUser')}>
        <UserX size={16} />
      </Button>
    </>
  )
}

interface PostsSectionProps {
  posts: PostResponseDto[]; isPending: boolean; isError: boolean; error: unknown
  onRetry: () => void; avatar?: string; name: string
}

function ProfilePostsSection({ posts, isPending, isError, error, onRetry, avatar, name }: Readonly<PostsSectionProps>) {
  const { t } = useTranslation()

  function renderContent() {
    if (isPending || isError) {
      return <QueryFeedback pending={isPending} error={error} onRetry={onRetry} />
    }
    if (posts.length === 0) {
      return (
        <Card className="p-6 sm:p-8 text-center bg-surface border-line-subtle rounded-2xl shadow-card">
          <Text size="sm" tone="muted">{t('profile.noPosts', 'Chưa có bài viết nào được đăng tải.')}</Text>
        </Card>
      )
    }
    return (
      /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User posts list stack] */
      <div className="space-y-4">
        {posts.map((p) => <PostCard key={p.post_id} post={p} currentUserAvatar={avatar} currentUserName={name} />)}
      </div>
    )
  }

  const content = renderContent()
  return (
    <section aria-label="Bài viết của người dùng" className="space-y-4">
      <Heading level={2} className="text-lg font-bold text-text-primary">
        {t('profile.userPosts', 'Bài viết đã chia sẻ')} ({posts.length})
      </Heading>
      {content}
    </section>
  )
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { t } = useTranslation()
  const currentUser = useAuthStore((s) => s.user)
  const myProfileQuery = useMyProfileQuery()
  const currentUserId = currentUser?.user_id ?? (Number(currentUser?.userId) || myProfileQuery.data?.user_id)
  const isMe = !userId || userId === 'me' || Number(userId) === currentUserId
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isConfirmUnfriendOpen, setIsConfirmUnfriendOpen] = useState(false)
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false)
  const userProfileQuery = useUserProfileQuery(Number(userId))
  const profileQuery = isMe ? myProfileQuery : userProfileQuery
  const profile = profileQuery.data
  const postsQuery = useUserPostsQuery(profile?.user_id || Number(userId) || 0)
  const sendFriendMutation = useSendFriendRequestMutation()
  const unfriendMutation = useUnfriendMutation()
  const blockMutation = useBlockUserMutation()

  const myRole = myProfileQuery.data?.role ?? currentUser?.role
  const isSameRole = Boolean((myRole === 'STUDENT' || myRole === 'LECTURER') && myRole === profile?.role)
  const isFriend = Boolean(profile?.relationships?.is_friend)
  const reqStatus = profile?.relationships?.friend_request_status

  async function handleFriendAction() {
    if (!profile?.user_id) return
    if (isFriend) {
      setIsConfirmUnfriendOpen(true)
      return
    }
    if (reqStatus === 'PENDING') {
      toast.info(t('profile.pendingNotice', 'Lời mời kết bạn đang chờ phản hồi.'))
      return
    }
    if (!isSameRole) {
      toast.error(t('friends.sameRoleNotice', 'Chỉ được kết bạn đồng cấp.'))
      return
    }
    try {
      await sendFriendMutation.mutateAsync({ addressee_id: profile.user_id })
      toast.success(t('friends.requestSentSuccess', 'Đã gửi lời mời kết bạn!'))
    } catch (error) {
      toast.error(getApiError(error, t('zone2.actionError')))
    }
  }

  async function runAction(action: () => Promise<unknown>, msg: string, setOpen: (v: boolean) => void) {
    try {
      await action()
      toast.success(msg)
      setOpen(false)
    } catch (error) {
      toast.error(getApiError(error, t('zone2.actionError')))
    }
  }

  const handleConfirmUnfriend = () => {
    const targetUserId = profile?.user_id
    if (targetUserId) void runAction(() => unfriendMutation.mutateAsync(targetUserId), t('profile.unfriended', 'Đã hủy kết bạn.'), setIsConfirmUnfriendOpen)
  }
  const handleConfirmBlock = () => {
    const targetUserId = profile?.user_id
    if (targetUserId) void runAction(() => blockMutation.mutateAsync(targetUserId), t('profile.blockedSuccess', 'Đã chặn người dùng.'), setIsConfirmBlockOpen)
  }

  if (profileQuery.isError) return <QueryFeedback error={profileQuery.error} onRetry={profileQuery.refetch} />
  if (profileQuery.isLoading) {
    return <Page className="max-w-4xl py-8 px-4 text-center"><Text size="sm" tone="muted">{t('profile.loading', 'Đang tải thông tin hồ sơ...')}</Text></Page>
  }
  if (!profile) {
    return (
      <Page className="max-w-4xl py-8 px-4 text-center space-y-4">
        <Text size="sm" tone="muted">{t('profile.notFound', 'Không tìm thấy hồ sơ người dùng.')}</Text>
        <ButtonLink to="/feed" variant="primary" className="min-h-11 px-6">{t('common.backToFeed', 'Về bảng tin')}</ButtonLink>
      </Page>
    )
  }

  return (
    <Page className="max-w-4xl py-6 px-4 space-y-6">
      <Card className="p-0 overflow-hidden bg-surface border-line-subtle shadow-card rounded-2xl">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Cover photo banner] */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-action-accent/30 via-action-accent/10 to-surface-elevated relative">
          {profile.cover_url ? <Image src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" /> : null}
        </div>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Profile header info container] */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar and Title stack] */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="vt-avatar">
              <Avatar src={profile.avatar_url || undefined} name={profile.full_name || 'HUST'} fallback={(profile.full_name || 'H').charAt(0).toUpperCase()} size="lg" className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-surface" />
            </div>
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Name and badges container] */}
            <div className="space-y-1">
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Name flex row] */}
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <Heading level={1} className="text-xl sm:text-2xl font-black text-text-primary">{profile.full_name}</Heading>
                <Badge tone={profile.role === 'LECTURER' ? 'accent' : 'neutral'} size="sm">{profile.role === 'LECTURER' ? t('friends.roleLecturer', 'Giảng viên') : t('friends.roleStudent', 'Sinh viên')}</Badge>
              </div>
              <Text size="xs" tone="muted">{profile.student_lecturer_code ? `${t('profile.code', 'Mã số')}: ${profile.student_lecturer_code}` : profile.email}</Text>
            </div>
          </div>

          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Profile actions button row] */}
          <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
            <ProfileActions
              isMe={isMe}
              profile={profile}
              isSameRole={isSameRole}
              isFriend={isFriend}
              reqStatus={reqStatus}
              pending={sendFriendMutation.isPending || unfriendMutation.isPending}
              blockPending={blockMutation.isPending}
              onEdit={() => setIsEditOpen(true)}
              onReport={() => setIsReportOpen(true)}
              onFriend={handleFriendAction}
              onBlock={() => setIsConfirmBlockOpen(true)}
            />
          </div>
        </div>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Bio and details row container] */}
        <div className="px-6 pb-6 pt-2 border-t border-line-subtle space-y-3">
          {profile.bio ? <Text size="sm" className="text-text-primary leading-relaxed whitespace-pre-wrap">{profile.bio}</Text> : null}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Faculty metadata flex chips] */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-text-muted">
            {profile.school_faculty ? <strong className="font-normal inline-flex items-center gap-1.5"><GraduationCap size={15} />{profile.school_faculty}</strong> : null}
            {profile.class_name ? <strong className="font-normal inline-flex items-center gap-1.5"><BookOpen size={15} />{profile.class_name}</strong> : null}
            {profile.created_at ? <strong className="font-normal inline-flex items-center gap-1.5"><Calendar size={15} />{t('profile.joined', 'Gia nhập')}: {formatDate(profile.created_at)}</strong> : null}
          </div>
        </div>
      </Card>

      <ProfileBadgesCard userId={isMe ? undefined : profile.user_id} />
      <ProfilePostsSection posts={postsQuery.data?.items || []} isPending={postsQuery.isPending} isError={postsQuery.isError} error={postsQuery.error} onRetry={() => { postsQuery.refetch() }} avatar={currentUser?.avatar_url || undefined} name={currentUser?.fullName || 'Bạn'} />

      {isMe && isEditOpen ? <EditProfileModal isOpen profile={profile} onClose={() => setIsEditOpen(false)} /> : null}
      <ReportModal isOpen={isReportOpen} targetType="USER" targetId={profile.user_id} onClose={() => setIsReportOpen(false)} />

      <ConfirmDialog open={isConfirmUnfriendOpen} onClose={() => setIsConfirmUnfriendOpen(false)} onConfirm={handleConfirmUnfriend} title={t('profile.confirmUnfriendTitle', 'Hủy kết bạn')} description={t('profile.confirmUnfriend', 'Bạn có chắc chắn muốn hủy kết bạn?')} variant="danger" loading={unfriendMutation.isPending} />
      <ConfirmDialog open={isConfirmBlockOpen} onClose={() => setIsConfirmBlockOpen(false)} onConfirm={handleConfirmBlock} title={t('profile.confirmBlockTitle', 'Chặn người dùng')} description={t('profile.confirmBlock', 'Bạn có chắc chắn muốn chặn người dùng này?')} variant="danger" loading={blockMutation.isPending} />
    </Page>
  )
}
