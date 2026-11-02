import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Edit3, GraduationCap, BookOpen, Calendar } from 'lucide-react'
import { Card, Avatar, Badge, Image } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { useMyProfileQuery, useUserProfileQuery } from '@/hooks/queries/useProfileQuery'
import { useInfiniteUserPostsQuery } from '@/hooks/queries/usePostsQuery'
import { LoadMore } from '@/components/social/LoadMore'
import { ProfileActions } from './ProfileActions'
import { PostCard } from '@/components/social/PostCard'
import { ReportModal } from '@/components/social/ReportPostModal'
import { EditProfileModal } from './EditProfileModal'
import { ProfileBadgesCard } from './ProfileBadgesCard'
import { formatDate } from '@/utils/date'
import { QueryFeedback } from '@/components/social/QueryFeedback'

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { t } = useTranslation()
  const currentUser = useAuthStore((s) => s.user)
  const routeId =
    userId && /^[1-9]\d*$/.test(userId) && Number.isSafeInteger(Number(userId))
      ? Number(userId)
      : undefined
  const myProfileQuery = useMyProfileQuery()
  const currentUserId =
    currentUser?.user_id ?? (Number(currentUser?.userId) || myProfileQuery.data?.user_id)
  const isMe = !userId || userId === 'me' || routeId === currentUserId

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const userProfileQuery = useUserProfileQuery(routeId ?? 0)
  const profileQuery = isMe ? myProfileQuery : userProfileQuery
  const profile = profileQuery.data

  const targetId = profile?.user_id ?? 0
  const postsQuery = useInfiniteUserPostsQuery(targetId)

  const myRole = myProfileQuery.data?.role ?? currentUser?.role
  if (userId && userId !== 'me' && !routeId) return <p role="alert">{t('social.invalidProfile')}</p>

  if (profileQuery.isError)
    return <QueryFeedback error={profileQuery.error} onRetry={profileQuery.refetch} />

  if (profileQuery.isLoading) {
    return (
      <section className="max-w-4xl mx-auto py-8 px-4 text-center">
        <Text size="sm" tone="muted">
          {t('profile.loading', 'Đang tải thông tin hồ sơ...')}
        </Text>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="max-w-4xl mx-auto py-8 px-4 text-center space-y-4">
        <Text size="sm" tone="muted">
          {t('profile.notFound', 'Không tìm thấy hồ sơ người dùng.')}
        </Text>
        <ButtonLink to="/feed" variant="primary" className="min-h-11 px-6">
          {t('common.backToFeed', 'Về bảng tin')}
        </ButtonLink>
      </section>
    )
  }

  const posts = postsQuery.data?.pages.flatMap((page) => page.items ?? []) ?? []

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      {/* Cover and Header Profile Card */}
      <Card className="p-0 overflow-hidden bg-surface border-line-subtle shadow-card rounded-2xl">
        {/* Cover photo banner */}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Cover photo container] */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-action-accent/30 via-action-accent/10 to-surface-elevated relative">
          {profile.cover_url ? (
            <Image src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : null}
        </div>

        {/* Profile Info Row */}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Profile header info container] */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar and Title stack] */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <Avatar
              src={profile.avatar_url || undefined}
              name={profile.full_name || 'HUST'}
              fallback={(profile.full_name || 'H').charAt(0).toUpperCase()}
              size="lg"
              className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-surface"
            />
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Name and badges container] */}
            <div className="space-y-1">
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Name flex row] */}
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <Heading level={1} className="text-xl sm:text-2xl font-black text-text-primary">
                  {profile.full_name}
                </Heading>
                <Badge tone={profile.role === 'LECTURER' ? 'accent' : 'neutral'} size="sm">
                  {profile.role === 'LECTURER'
                    ? t('friends.roleLecturer', 'Giảng viên')
                    : t('friends.roleStudent', 'Sinh viên')}
                </Badge>
              </div>
              <Text size="xs" tone="muted">
                {profile.student_lecturer_code
                  ? `${t('profile.code', 'Mã số')}: ${profile.student_lecturer_code}`
                  : profile.email}
              </Text>
            </div>
          </div>

          {/* Action Buttons */}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Profile actions button row] */}
          <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
            {isMe ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="min-h-11 px-4 gap-1.5"
                leftIcon={<Edit3 size={15} />}
              >
                {t('profile.edit', 'Chỉnh sửa hồ sơ')}
              </Button>
            ) : (
              <ProfileActions
                profile={profile}
                myRole={myRole}
                onReport={() => setIsReportOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Bio and Faculty details */}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Bio and details row container] */}
        <div className="px-6 pb-6 pt-2 border-t border-line-subtle space-y-3">
          {profile.bio ? (
            <Text size="sm" className="text-text-primary leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </Text>
          ) : null}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Faculty metadata flex chips] */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-text-muted">
            {profile.school_faculty ? (
              <strong className="font-normal inline-flex items-center gap-1.5">
                <GraduationCap size={15} />
                {profile.school_faculty}
              </strong>
            ) : null}
            {profile.class_name ? (
              <strong className="font-normal inline-flex items-center gap-1.5">
                <BookOpen size={15} />
                {profile.class_name}
              </strong>
            ) : null}
            {profile.created_at ? (
              <strong className="font-normal inline-flex items-center gap-1.5">
                <Calendar size={15} />
                {t('profile.joined', 'Gia nhập')}: {formatDate(profile.created_at)}
              </strong>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Badges Section */}
      <ProfileBadgesCard userId={isMe ? undefined : profile.user_id} />

      {/* User's Posts Feed */}
      <section aria-label={t('social.profilePosts')} className="space-y-4">
        <Heading level={2} className="text-lg font-bold text-text-primary">
          {t('profile.userPosts', 'Bài viết đã chia sẻ')} ({posts.length})
        </Heading>
        {postsQuery.isPending || postsQuery.isError ? (
          <QueryFeedback
            pending={postsQuery.isPending}
            error={postsQuery.error}
            onRetry={postsQuery.refetch}
          />
        ) : posts.length > 0 ? (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User posts list stack] */
          <div className="space-y-4">
            {posts.map((p) => (
              <PostCard
                key={p.post_id}
                post={p}
                currentUserAvatar={currentUser?.avatar_url || undefined}
                currentUserName={currentUser?.fullName || 'Bạn'}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 sm:p-8 text-center bg-surface border-line-subtle rounded-2xl shadow-card">
            <Text size="sm" tone="muted">
              {t('profile.noPosts', 'Chưa có bài viết nào được đăng tải.')}
            </Text>
          </Card>
        )}
        <LoadMore query={postsQuery} />
      </section>

      {/* Modals */}
      {isMe && isEditOpen ? (
        <EditProfileModal isOpen profile={profile} onClose={() => setIsEditOpen(false)} />
      ) : null}
      <ReportModal
        isOpen={isReportOpen}
        targetType="USER"
        targetId={profile.user_id}
        onClose={() => setIsReportOpen(false)}
      />
    </section>
  )
}
