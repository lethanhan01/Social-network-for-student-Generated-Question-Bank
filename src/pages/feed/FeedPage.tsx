import { useState, useMemo } from 'react'
import { Sparkles, BookOpen, GraduationCap, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Heading, Text } from '@/components/ui/typography'
import { Button } from '@/components/ui/actions'
import { Badge } from '@/components/ui/data-display'
import {
  SocialFeedLayout,
  SocialLeftSidebar,
  SocialRightSidebar,
  CreatePostBox,
  CreatePostModal,
  PostCard,
  EmptyFeedState,
} from '@/components/social'
import { useSocialFeed } from '@/hooks/useSocialFeed'
import {
  useInfinitePostsFeedQuery,
  useNewFeedCountQuery,
  useToggleReactionMutation,
} from '@/hooks/queries/usePostsQuery'
import type { PostResponseDto } from '@/types'
import { QueryFeedback } from '@/components/social/QueryFeedback'

export default function FeedPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_SUBJECTS' | 'LECTURERS'>('ALL')
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [latestLoadedTime] = useState<string>(new Date().toISOString())

  const { currentUser, subjects, friends, createPost } = useSocialFeed()

  const {
    data: infiniteFeed,
    isLoading: isLoadingFeed,
    isError: isFeedError,
    error: feedError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchFeed,
  } = useInfinitePostsFeedQuery(10)

  const { data: newFeedData } = useNewFeedCountQuery(latestLoadedTime)
  const newCount = newFeedData?.new_count || 0

  const toggleReactionMutation = useToggleReactionMutation()

  // Flatten infinite query pages
  const allPosts = useMemo(() => {
    return infiniteFeed?.pages.flatMap((page) => page.items || []) || []
  }, [infiniteFeed])

  // Filter posts based on active tab and selected subject
  const filteredPosts = useMemo(() => {
    let list: PostResponseDto[] = [...allPosts]

    if (selectedSubjectId) {
      list = list.filter((p) => p.subject_id === selectedSubjectId)
    }

    if (activeTab === 'LECTURERS') {
      list = list.filter((p) => Boolean(p.lecturer_note))
    }

    return list
  }, [allPosts, selectedSubjectId, activeTab])

  async function handleToggleReact(postId: number, reactionType: 'LIKE' | 'LOVE' | 'WOW' = 'LIKE') {
    await toggleReactionMutation.mutateAsync({
      target_type: 'POST',
      target_id: postId,
      reaction_type: reactionType,
    })
  }

  function renderFeedStream() {
    if (isFeedError) return <QueryFeedback error={feedError} onRetry={refetchFeed} />
    if (isLoadingFeed) {
      return (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading state layout container] */
        <div className="py-12 text-center space-y-2">
          <Text size="sm" tone="muted">
            {t('feed.loading', 'Đang tải dữ liệu bài viết từ máy chủ SQB HUST...')}
          </Text>
        </div>
      )
    }

    if (filteredPosts.length > 0) {
      return (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Feed list stream wrapper] */
        <div className="space-y-4">
          {newCount > 0 ? (
            <Button
              variant="secondary"
              onClick={() => refetchFeed()}
              className="w-full justify-center gap-2 py-2.5 text-xs text-action-accent border border-action-accent/30 bg-action-accent/10 hover:bg-action-accent/20 min-h-11"
            >
              <RefreshCw size={14} className="animate-spin" />
              {t('feed.newPostsAvailable', { count: newCount, defaultValue: `Có ${newCount} bài viết mới. Bấm để làm mới.` })}
            </Button>
          ) : null}

          {filteredPosts.map((post) => (
            <PostCard
              key={post.post_id || Math.random()}
              post={post}
              currentUserAvatar={currentUser?.avatar_url || undefined}
              currentUserName={currentUser?.full_name || 'Bạn'}
              onToggleReact={handleToggleReact}
            />
          ))}

          {hasNextPage ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Load more button wrapper] */
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="min-h-11 px-6 text-xs"
              >
                {isFetchingNextPage
                  ? t('common.loading', 'Đang tải thêm...')
                  : t('feed.loadMore', 'Tải thêm bài viết cũ hơn')}
              </Button>
            </div>
          ) : null}
        </div>
      )
    }

    return <EmptyFeedState onOpenCreateModal={() => setIsCreateModalOpen(true)} />
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Page vertical stack wrapper] */
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-subtle">
        <hgroup>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header badge and semester row] */}
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="accent" size="sm">
              {t('feed.network_badge', 'Mạng Xã Hội Học Tập')}
            </Badge>
            <strong className="font-normal text-xs text-text-muted">
              {t('feed.semester_badge', 'Kỳ 2024.1 HUST')}
            </strong>
          </div>
          <Heading
            level={1}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary"
          >
            {t('feed.title', 'Bảng tin & Hoạt động')}
          </Heading>
        </hgroup>
      </header>

      {/* 3-Column Social Layout */}
      <SocialFeedLayout
        leftSidebar={
          <SocialLeftSidebar
            user={currentUser}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
          />
        }
        centerFeed={
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Center column feed stream container] */
          <div className="space-y-5">
            {/* Quick Post Creator Trigger Box */}
            <CreatePostBox
              user={currentUser}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />

            {/* Filter Tabs Bar */}
            <nav
              aria-label="Bộ lọc bảng tin"
              className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-line-subtle"
            >
              <Button
                variant={activeTab === 'ALL' && !selectedSubjectId ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveTab('ALL')
                  setSelectedSubjectId(undefined)
                }}
                className="text-xs min-h-11"
                leftIcon={<Sparkles size={15} />}
              >
                {t('feed.tabs.all', 'Tất cả bảng tin')}
              </Button>
              <Button
                variant={activeTab === 'MY_SUBJECTS' || selectedSubjectId ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('MY_SUBJECTS')}
                className="text-xs min-h-11"
                leftIcon={<BookOpen size={15} />}
              >
                {t('feed.tabs.my_subjects', 'Môn học')} ({subjects.length})
              </Button>
              <Button
                variant={activeTab === 'LECTURERS' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveTab('LECTURERS')
                  setSelectedSubjectId(undefined)
                }}
                className="text-xs min-h-11"
                leftIcon={<GraduationCap size={15} />}
              >
                {t('feed.tabs.lecturers', 'Ghi chú Giảng viên')}
              </Button>
            </nav>

            {/* Posts Feed Stream */}
            {renderFeedStream()}
          </div>
        }
        rightSidebar={<SocialRightSidebar friends={friends} />}
      />

      {/* Create Post Modal (MODAL-05) */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createPost}
        subjects={subjects}
      />
    </div>
  )
}
