import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Heading } from '@/components/ui/typography/Heading'
import { Button } from '@/components/ui/actions/Button'
import { Page } from '@/components/ui/layout/PageUI'
import { SocialFeedLayout } from '@/components/social/SocialFeedLayout'
import { SocialLeftSidebar } from '@/components/social/SocialLeftSidebar'
import { SocialRightSidebar } from '@/components/social/SocialRightSidebar'
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
  const [params] = useSearchParams()
  const tab = params.get('tab') ?? 'ALL'
  const [creating, setCreating] = useState(false)
  const [since, setSince] = useState(() => String(Date.now()))
  const { currentUser, subjects, friends, createPost } = useSocialFeed()
  const activity = useInfiniteActivityFeedQuery(10, tab !== 'MINE')
  const mine = useInfinitePostsFeedQuery(10, tab === 'MINE')
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
  const visibleFeedCount = tab === 'MINE' ? posts.length : events.length
  const showEmptyFeed = query.isSuccess && visibleFeedCount === 0 && recentPosts.length === 0
  async function refresh() {
    const nextSince = String(Date.now())
    const result = await query.refetch()
    if (!result.isError) setSince(nextSince)
  }
  const centerFeed = (
    <section className="space-y-3">
      <header>
        <Heading level={1} className="text-xl font-bold tracking-tight">
          {t('feed.title')}
        </Heading>
      </header>
      <CreatePostBox user={currentUser} onOpenCreateModal={() => setCreating(true)} />
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
          <ActivityPost key={post.post_id} postId={post.post_id} currentUser={currentUser} />
        ) : null
      )}
      {tab === 'MINE'
        ? posts
            .filter((post) => !recentIds.has(post.post_id))
            .map((post) => <PostCard key={post.post_id} post={post} />)
        : events
            .filter((item) => item.target_type !== 'POST' || !recentIds.has(item.target_id))
            .map((item) => (
              <ActivityFeedEntry key={item.feed_id} item={item} currentUser={currentUser} />
            ))}
      {showEmptyFeed ? (
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

  return (
    <Page maxWidth="2xl">
      <SocialFeedLayout
        leftSidebar={<SocialLeftSidebar user={currentUser} />}
        centerFeed={centerFeed}
        rightSidebar={<SocialRightSidebar friends={friends} />}
      />
    </Page>
  )
}
