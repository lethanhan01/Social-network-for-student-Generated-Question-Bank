import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/data-display/Card'
import { Skeleton } from '@/components/ui/feedback/Skeleton'
import { ButtonLink } from '@/components/ui/actions/Button'
import { usePostDetailQuery } from '@/hooks/queries/usePostsQuery'
import { QueryFeedback } from './QueryFeedback'
import { PostCard } from './PostCard'
import { formatDateTime } from '@/utils/date'
import type { ActivityFeedItemDto, ProfileResponse } from '@/types'

export const ActivityPost = memo(function ActivityPost({
  postId,
  currentUser,
  subjectId,
  subjectIds,
  lecturers,
  eager = false,
}: Readonly<{
  postId: number
  currentUser?: ProfileResponse
  subjectId?: number
  subjectIds?: number[]
  lecturers?: boolean
  eager?: boolean
}>) {
  const { t } = useTranslation()
  const shouldFetchImmediately = eager || Boolean(subjectId || subjectIds || lecturers)
  const [inView, setInView] = useState(
    () => shouldFetchImmediately || typeof IntersectionObserver === 'undefined'
  )
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (inView || shouldFetchImmediately) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '350px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView, shouldFetchImmediately])

  const query = usePostDetailQuery(postId, inView)
  const status = (query.error as { response?: { status?: number } })?.response?.status
  // Feed previews can be stale; only the detail endpoint authorizes displaying a post.
  if (status === 403 || status === 404) return null
  if (!inView || query.isPending)
    return (
      <section ref={containerRef}>
        <Card as="article" aria-label={t('zone2.loading')} className="social-card space-y-3 rounded-2xl">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      </section>
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
})

export const ActivityFeedEntry = memo(function ActivityFeedEntry({
  item,
  currentUser,
  subjectId,
  subjectIds,
  lecturers,
  eager = false,
}: Readonly<{
  item: ActivityFeedItemDto
  currentUser?: ProfileResponse
  subjectId?: number
  subjectIds?: number[]
  lecturers?: boolean
  eager?: boolean
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
        eager={eager}
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
    <Card as="article" className="social-card space-y-3 rounded-2xl">
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
})
