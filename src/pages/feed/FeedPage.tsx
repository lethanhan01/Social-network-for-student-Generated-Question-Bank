import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Heading } from '@/components/ui/typography/Heading'
import { Button } from '@/components/ui/actions/Button'
import { Select } from '@/components/ui/forms/Select'
import { CreatePostBox } from '@/components/social/CreatePostBox'
import { CreatePostModal } from '@/components/social/CreatePostModal'
import { PostCard } from '@/components/social/PostCard'
import { QueryFeedback } from '@/components/social/QueryFeedback'
import { ActivityFeedEntry, ActivityPost } from '@/components/social/ActivityFeedEntry'
import { LoadMore } from '@/components/social/LoadMore'
import { useSocialFeed } from '@/hooks/useSocialFeed'
import {
  useInfiniteActivityFeedQuery,
  useInfinitePostsFeedQuery,
  useNewFeedCountQuery,
} from '@/hooks/queries/usePostsQuery'
import { queryKeys } from '@/lib/query-keys'
import type { PostResponseDto } from '@/types'

export default function FeedPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'ALL'
  const subjectId = Number(params.get('subject')) || undefined
  const [creating, setCreating] = useState(false)
  const [since, setSince] = useState(() => String(Date.now()))
  const { currentUser, subjects, createPost } = useSocialFeed()
  const activity = useInfiniteActivityFeedQuery()
  const mine = useInfinitePostsFeedQuery()
  const query = tab === 'MINE' ? mine : activity
  const counter = useNewFeedCountQuery(since)
  const recent = useQuery<PostResponseDto[]>({
    queryKey: queryKeys.posts.recentlyCreated(),
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
    enabled: false,
  })
  const posts = mine.data?.pages.flatMap((page) => page.items ?? []) ?? []
  const events = activity.data?.pages.flatMap((page) => page.items ?? []) ?? []
  const recentPosts = recent.data
  const recentIds = new Set(recentPosts.map((post) => post.post_id))
  const matches = (post: PostResponseDto) =>
    (!subjectId || post.subject_id === subjectId) &&
    (tab !== 'LECTURERS' || Boolean(post.lecturer_note))
  function update(key: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }
  async function refresh() {
    const nextSince = String(Date.now())
    const result = await query.refetch()
    if (!result.isError) setSince(nextSince)
  }
  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <Heading level={1} className="text-2xl font-bold">
        {t('feed.title')}
      </Heading>
      <CreatePostBox user={currentUser} onOpenCreateModal={() => setCreating(true)} />
      <nav aria-label={t('social.feedFilters')} className="flex gap-2 overflow-x-auto">
        {(['ALL', 'MINE', 'LECTURERS'] as const).map((value) => (
          <Button
            key={value}
            variant={tab === value ? 'secondary' : 'ghost'}
            aria-pressed={tab === value}
            onClick={() => update('tab', value)}
          >
            {t(`social.feedTabs.${value}`)}
          </Button>
        ))}
      </nav>
      <Select
        ariaLabel={t('social.subjectFilter')}
        value={subjectId ? String(subjectId) : ''}
        placeholder={t('social.allSubjects')}
        onValueChange={(value) => update('subject', value)}
        options={[
          { value: '', label: t('social.allSubjects') },
          ...subjects
            .filter((subject) => subject.subject_id)
            .map((subject) => ({
              value: String(subject.subject_id),
              label: `${subject.code} · ${subject.name}`,
            })),
        ]}
      />
      {(counter.data?.new_count ?? 0) > 0 ? (
        <Button
          variant="secondary"
          className="w-full"
          loading={query.isRefetching}
          onClick={() => {
            void refresh()
          }}
        >
          {t('feed.newPostsAvailable', { count: counter.data?.new_count })}
        </Button>
      ) : null}
      {query.isPending || (query.isError && !query.data) ? (
        <QueryFeedback pending={query.isPending} error={query.error} onRetry={query.refetch} />
      ) : null}
      {recentPosts.map((post) =>
        post.post_id ? (
          <ActivityPost
            key={post.post_id}
            postId={post.post_id}
            currentUser={currentUser}
            subjectId={subjectId}
            lecturers={tab === 'LECTURERS'}
          />
        ) : null
      )}
      {tab === 'MINE'
        ? posts
            .filter((post) => !recentIds.has(post.post_id) && matches(post))
            .map((post) => <PostCard key={post.post_id} post={post} />)
        : events
            .filter((item) => item.target_type !== 'POST' || !recentIds.has(item.target_id))
            .map((item) => (
              <ActivityFeedEntry
                key={item.feed_id}
                item={item}
                currentUser={currentUser}
                subjectId={subjectId}
                lecturers={tab === 'LECTURERS'}
              />
            ))}
      {query.isSuccess &&
      (tab === 'MINE' ? posts.length : events.length) === 0 &&
      recentPosts.length === 0 ? (
        <p className="py-8 text-center text-text-muted">{t('social.emptyFeed')}</p>
      ) : null}
      <LoadMore query={query} />
      {creating ? (
        <CreatePostModal
          isOpen
          onClose={() => setCreating(false)}
          onSubmit={createPost}
          subjects={subjects}
          authorRole={currentUser?.role}
        />
      ) : null}
    </section>
  )
}
