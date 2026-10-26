import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThumbsUp } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import { PostCommentSection } from './PostCommentSection'
import { ReportModal } from './ReportPostModal'
import { LecturerNoteModal } from './LecturerNoteModal'
import { PostMediaGrid } from './PostMediaGrid'
import { PostCardHeader } from './PostCardHeader'
import { PostCardActions } from './PostCardActions'
import { toast } from '@/lib/toast'
import { useToggleReactionMutation } from '@/hooks/queries/usePostsQuery'
import { getApiError } from '@/lib/api-error'
import type { PostResponseDto } from '@/types'

interface PostCardProps {
  post: PostResponseDto
  currentUserAvatar?: string
  currentUserName?: string
  onToggleReact?: (postId: number, reactionType?: 'LIKE' | 'LOVE' | 'WOW') => Promise<unknown>
}

export function PostCard({
  post,
  currentUserAvatar,
  currentUserName,
  onToggleReact,
}: Readonly<PostCardProps>) {
  const { t } = useTranslation()
  const currentRole = useAuthStore((s) => s.user?.role)
  const isLecturer = currentRole === 'LECTURER'

  const [showComments, setShowComments] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isLecturerNoteOpen, setIsLecturerNoteOpen] = useState(false)
  const [localReacted, setLocalReacted] = useState(post.reacted_by_me || false)
  const [localReactCount, setLocalReactCount] = useState(post.react_count || 0)
  const [reactPending, setReactPending] = useState(false)
  const reactionMutation = useToggleReactionMutation()

  const content = post.content || ''
  const isLongText = content.length > 200

  async function handleReact(type: 'LIKE' | 'LOVE' | 'WOW' = 'LIKE') {
    if (reactPending || !post.post_id) return
    setReactPending(true)
    const nextReacted = !localReacted
    setLocalReacted(nextReacted)
    setLocalReactCount((prev) => (nextReacted ? prev + 1 : Math.max(0, prev - 1)))
    try {
      if (onToggleReact) await onToggleReact(post.post_id, type)
      else await reactionMutation.mutateAsync({ target_type: 'POST', target_id: post.post_id, reaction_type: type })
    } catch (error) {
      setLocalReacted(!nextReacted)
      setLocalReactCount((prev) => (!nextReacted ? prev + 1 : Math.max(0, prev - 1)))
      toast.error(getApiError(error, t('zone2.actionError')))
    } finally {
      setReactPending(false)
    }
  }

  async function handleCopyLink() {
    const postUrl = `${window.location.origin}/posts/${post.post_id}`
    try {
      if (!navigator.clipboard) throw new Error(t('zone2.copyError'))
      await navigator.clipboard.writeText(postUrl)
      toast.success(t('post.linkCopied', 'Đã sao chép liên kết bài viết!'))
    } catch {
      toast.error(t('zone2.copyError'))
    }
  }

  return (
    <Card className="p-4 sm:p-5 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3.5">
      {/* Header */}
      <PostCardHeader
        post={post}
        isLecturer={isLecturer}
        onOpenLecturerNote={() => setIsLecturerNoteOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onCopyLink={handleCopyLink}
      />

      {/* Post Body Content */}
      <article className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
        {isLongText && !isExpanded ? `${content.slice(0, 200)}...` : content}
        {isLongText ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-action-accent font-semibold p-0 h-auto ml-1 min-h-11 inline-flex items-center"
          >
            {isExpanded ? t('common.collapse', 'Thu gọn') : t('common.expand', 'Xem thêm')}
          </Button>
        ) : null}
      </article>

      {/* Attached Media Grid */}
      <PostMediaGrid media={post.media_urls} />

      {/* Lecturer Note Box (UC06) */}
      {post.lecturer_note ? (
        <aside
          aria-label="Ghi chú chuyên môn từ Giảng viên"
          className="p-3.5 rounded-xl bg-action-accent/10 border border-action-accent/30 space-y-1.5"
        >
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Lecturer note title row] */}
          <div className="flex items-center gap-2 text-action-accent font-bold text-xs">
            <strong>{t('post.lecturerNote.title', 'Ghi chú chuyên môn từ Giảng viên')}</strong>
          </div>
          <Text size="xs" className="text-text-primary leading-relaxed">
            {post.lecturer_note}
          </Text>
        </aside>
      ) : null}

      {/* Stats Bar */}
      <footer className="flex items-center justify-between text-xs text-text-muted pt-1 border-t border-line-subtle">
        <strong className="font-normal flex items-center gap-1">
          <ThumbsUp size={13} className="text-action-accent" />
          {localReactCount} {t('post.likeCountUnit', 'lượt tương tác')}
        </strong>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments((prev) => !prev)}
          className="text-xs text-text-muted hover:text-text-primary p-0 h-auto min-h-11 inline-flex items-center"
        >
          {post.comment_count || 0} {t('post.commentCountUnit', 'bình luận')}
        </Button>
      </footer>

      {/* Action Buttons */}
      <PostCardActions
        disabled={reactPending || !post.post_id}
        localReacted={localReacted}
        onReact={handleReact}
        onToggleComments={() => setShowComments((prev) => !prev)}
        onShare={handleCopyLink}
      />

      {/* Comments Drawer / Section */}
      {showComments && post.post_id ? (
        <PostCommentSection
          postId={post.post_id}
          currentUserAvatar={currentUserAvatar}
          currentUserName={currentUserName}
        />
      ) : null}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        targetType="POST"
        targetId={post.post_id}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Lecturer Note Modal */}
      {post.post_id ? (
        <LecturerNoteModal
          isOpen={isLecturerNoteOpen}
          postId={post.post_id}
          initialNote={post.lecturer_note}
          onClose={() => setIsLecturerNoteOpen(false)}
        />
      ) : null}
    </Card>
  )
}
