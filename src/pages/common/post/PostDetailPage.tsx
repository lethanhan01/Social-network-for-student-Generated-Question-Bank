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

  async function handleToggleReact(
    targetPostId: number,
    reactionType: 'LIKE' | 'LOVE' | 'WOW' = 'LIKE'
  ) {
    return toggleReactionMutation.mutateAsync({
      target_type: 'POST',
      target_id: targetPostId,
      reaction_type: reactionType,
    })
  }

  if (isLoading) {
    return (
      <section className="max-w-3xl mx-auto py-8 px-4 space-y-4">
        <BackButton to="/feed" label={t('common.back')} className="min-h-11" />
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading skeleton container] */}
        <div className="p-6 sm:p-8 text-center bg-surface border border-line-subtle rounded-2xl shadow-card space-y-3">
          <Text size="sm" tone="muted">
            {t('post.loadingDetail')}
          </Text>
        </div>
      </section>
    )
  }

  if (isError || !post || !post.post_id) {
    const isForbidden = (error as { response?: { status?: number } })?.response?.status === 403
    return (
      <section className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <BackButton to="/feed" label={t('common.back')} className="min-h-11" />
        <Card className="p-6 sm:p-8 text-center bg-surface border-line-subtle rounded-2xl shadow-card space-y-4">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Error icon circle wrapper] */}
          <div className="w-14 h-14 mx-auto rounded-full bg-tone-danger/10 text-tone-danger flex items-center justify-center">
            {isForbidden ? <AlertCircle size={28} /> : <FileQuestion size={28} />}
          </div>
          <Heading level={2} className="text-xl font-bold text-text-primary">
            {isForbidden
              ? t('post.errorForbiddenTitle')
              : t('post.errorNotFoundTitle')}
          </Heading>
          <Text size="sm" tone="muted" className="max-w-md mx-auto">
            {isForbidden
              ? t('post.errorForbiddenDesc')
              : t('post.errorNotFoundDesc')}
          </Text>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Back to feed button wrapper] */}
          <div className="pt-2">
            <ButtonLink to="/feed" variant="primary" className="min-h-11 px-6">
              {t('common.backToFeed')}
            </ButtonLink>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <section className="max-w-2xl mx-auto space-y-3">
      {/* Navigation Header */}
      <nav aria-label="Điều hướng quay lại" className="flex items-center justify-between">
        <BackButton
          to="/feed"
          label={t('common.backToFeed')}
          className="min-h-11"
        />
        <Text size="xs" tone="muted">
          {t('post.postIdLabel')}: #{post.post_id}
        </Text>
      </nav>

      {/* Main Post Card with Comment Section Included */}
      <PostCard
        post={post}
        currentUserAvatar={currentUser?.avatar_url || undefined}
        currentUserName={currentUser?.fullName || 'Bạn'}
        onToggleReact={handleToggleReact}
      />
    </section>
  )
}
