import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/data-display/Card'
import { Skeleton } from '@/components/ui/feedback/Skeleton'
import { ButtonLink } from '@/components/ui/actions/Button'
import { usePostDetailQuery } from '@/hooks/queries/usePostsQuery'
import { QueryFeedback } from './QueryFeedback'
import { PostCard } from './PostCard'
import { formatDateTime } from '@/utils/date'
import type { ActivityFeedItemDto, ProfileResponse } from '@/types'

export function ActivityPost({
  postId,
  currentUser,
  subjectId,
  subjectIds,
  lecturers,
}: Readonly<{
  postId: number
  currentUser?: ProfileResponse
  subjectId?: number
  subjectIds?: number[]
  lecturers?: boolean
}>) {
  const { t } = useTranslation()
  const query = usePostDetailQuery(postId)
  const status = (query.error as { response?: { status?: number } })?.response?.status
  // Feed previews can be stale; only the detail endpoint authorizes displaying a post.
  if (status === 403 || status === 404) return null
  if (query.isPending)
    return (
      <Card as="article" aria-label={t('zone2.loading')} className="space-y-3 rounded-2xl">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </Card>
    )
  if (query.isError) return <QueryFeedback error={query.error} onRetry={query.refetch} />
  if (
    !query.data ||
    (subjectId && query.data.subject_id !== subjectId) ||
    (subjectIds && !subjectIds.includes(query.data.subject_id ?? 0)) ||
    (lecturers && !query.data.lecturer_note)
  )
    return null
  return (
    <PostCard
      post={query.data}
      currentUserAvatar={currentUser?.avatar_url ?? undefined}
      currentUserName={currentUser?.full_name}
    />
  )
}

export function ActivityFeedEntry({
  item,
  currentUser,
  subjectId,
  subjectIds,
  lecturers,
}: Readonly<{
  item: ActivityFeedItemDto
  currentUser?: ProfileResponse
  subjectId?: number
  subjectIds?: number[]
  lecturers?: boolean
}>) {
  const { t } = useTranslation()
  if (item.target_type === 'POST' && item.target_id)
    return (
      <ActivityPost
        postId={item.target_id}
        currentUser={currentUser}
        subjectId={subjectId}
        subjectIds={subjectIds}
        lecturers={lecturers}
      />
    )
  if (subjectId || subjectIds || lecturers) return null
  const destination =
    item.target_type === 'SESSION'
      ? `/practice/${item.target_id}`
      : item.target_type === 'QUESTION'
        ? `/questions/${item.target_id}/analytics`
        : `/profile/${item.actor?.user_id ?? 'me'}`
  return (
    <Card as="article" className="space-y-3 rounded-2xl">
      <header className="flex justify-between gap-3 text-sm">
        <ButtonLink variant="ghost" to={`/profile/${item.actor?.user_id ?? 'me'}`}>
          {item.actor?.full_name ?? t('social.member')}
        </ButtonLink>
        <time className="text-xs text-text-muted">{formatDateTime(item.created_at)}</time>
      </header>
      <p>{t(`social.activity.${item.action_type ?? 'REACHED_MILESTONE'}`)}</p>
      <ButtonLink to={destination} variant="secondary">
        {t('social.view')}
      </ButtonLink>
    </Card>
  )
}
