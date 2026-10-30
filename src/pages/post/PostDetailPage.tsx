import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle, FileQuestion } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { BackButton, ButtonLink } from '@/components/ui/actions'
import { Card } from '@/components/ui/data-display'
import { PostCard } from '@/components/social/PostCard'
import { usePostDetailQuery, useToggleReactionMutation } from '@/hooks/queries/usePostsQuery'
import { useAuthStore } from '@/stores/authStore'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const postId = Number(id)
  const { t } = useTranslation()
  const currentUser = useAuthStore((s) => s.user)

  const { data: post, isLoading, isError, error } = usePostDetailQuery(postId)
  const toggleReactionMutation = useToggleReactionMutation()

  async function handleToggleReact(targetPostId: number, reactionType: 'LIKE' | 'LOVE' | 'WOW' = 'LIKE') {
    await toggleReactionMutation.mutateAsync({
      target_type: 'POST',
      target_id: targetPostId,
      reaction_type: reactionType,
    })
  }

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto py-8 px-4 space-y-4">
        <BackButton to="/feed" label={t('common.back', 'Quay lại bảng tin')} className="min-h-11" />
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading skeleton container] */}
        <div className="p-6 sm:p-8 text-center bg-surface border border-line-subtle rounded-2xl shadow-card space-y-3">
          <Text size="sm" tone="muted">
            {t('post.loadingDetail', 'Đang tải nội dung chi tiết bài viết...')}
          </Text>
        </div>
      </main>
    )
  }

  if (isError || !post || !post.post_id) {
    const isForbidden = (error as { response?: { status?: number } })?.response?.status === 403
    return (
      <main className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <BackButton to="/feed" label={t('common.back', 'Quay lại bảng tin')} className="min-h-11" />
        <Card className="p-6 sm:p-8 text-center bg-surface border-line-subtle rounded-2xl shadow-card space-y-4">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Error icon circle wrapper] */}
          <div className="w-14 h-14 mx-auto rounded-full bg-tone-danger/10 text-tone-danger flex items-center justify-center">
            {isForbidden ? <AlertCircle size={28} /> : <FileQuestion size={28} />}
          </div>
          <Heading level={2} className="text-xl font-bold text-text-primary">
            {isForbidden
              ? t('post.errorForbiddenTitle', 'Không có quyền truy cập bài viết')
              : t('post.errorNotFoundTitle', 'Bài viết không tồn tại hoặc đã bị gỡ')}
          </Heading>
          <Text size="sm" tone="muted" className="max-w-md mx-auto">
            {isForbidden
              ? t('post.errorForbiddenDesc', 'Bài viết này được đặt ở chế độ riêng tư hoặc chỉ dành cho nhóm sinh viên cụ thể.')
              : t('post.errorNotFoundDesc', 'Liên kết bài viết có thể bị sai, hoặc tác giả đã xóa bài viết khỏi hệ thống SQB HUST.')}
          </Text>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Back to feed button wrapper] */}
          <div className="pt-2">
            <ButtonLink to="/feed" variant="primary" className="min-h-11 px-6">
              {t('common.backToFeed', 'Trở về bảng tin')}
            </ButtonLink>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Navigation Header */}
      <nav aria-label="Điều hướng quay lại" className="flex items-center justify-between">
        <BackButton to="/feed" label={t('common.backToFeed', 'Trở về bảng tin')} className="min-h-11" />
        <Text size="xs" tone="muted">
          {t('post.postIdLabel', 'Mã bài viết')}: #{post.post_id}
        </Text>
      </nav>

      {/* Main Post Card with Comment Section Included */}
      <PostCard
        post={post}
        currentUserAvatar={currentUser?.avatar_url || undefined}
        currentUserName={currentUser?.fullName || 'Bạn'}
        onToggleReact={handleToggleReact}
      />
    </main>
  )
}
