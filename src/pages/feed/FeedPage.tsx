import { useState, useMemo } from 'react'
import { Sparkles, BookOpen, GraduationCap } from 'lucide-react'
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
import type { PostResponseDto } from '@/types'

export default function FeedPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_SUBJECTS' | 'LECTURERS'>('ALL')
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { currentUser, subjects, friends, myPosts, isLoadingFeed, createPost, toggleReact } =
    useSocialFeed()

  // Filter posts based on active tab and selected subject
  const filteredPosts = useMemo(() => {
    let list: PostResponseDto[] = [...myPosts]

    if (selectedSubjectId) {
      list = list.filter((p) => p.subject_id === selectedSubjectId)
    }

    if (activeTab === 'LECTURERS') {
      list = list.filter((p) => Boolean(p.lecturer_note))
    }

    return list
  }, [myPosts, selectedSubjectId, activeTab])

  function renderFeedStream() {
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
          {filteredPosts.map((post) => (
            <PostCard
              key={post.post_id || Math.random()}
              post={post}
              currentUserAvatar={currentUser?.avatar_url || undefined}
              currentUserName={currentUser?.full_name || 'Bạn'}
              onToggleReact={toggleReact}
            />
          ))}
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
