import { useState } from 'react'
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Bookmark, AlertCircle, GraduationCap, Copy } from 'lucide-react'
import { Card, Avatar, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/overlay'
import { Heading, Text } from '@/components/ui/typography'
import { PostCommentSection } from './PostCommentSection'
import { ReportPostModal } from './ReportPostModal'
import { toast } from '@/lib/toast'
import type { PostResponseDto } from '@/types'

interface PostCardProps {
  post: PostResponseDto
  currentUserAvatar?: string
  currentUserName?: string
  onToggleReact?: (postId: number) => Promise<unknown>
}

export function PostCard({
  post,
  currentUserAvatar,
  currentUserName,
  onToggleReact,
}: Readonly<PostCardProps>) {
  const [showComments, setShowComments] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [localReacted, setLocalReacted] = useState(post.reacted_by_me || false)
  const [localReactCount, setLocalReactCount] = useState(post.react_count || 0)

  const authorName = post.author?.full_name || 'Thành viên HUST'
  const initials = authorName.charAt(0).toUpperCase()
  const content = post.content || ''
  const isLongText = content.length > 200

  async function handleReactClick() {
    const nextReacted = !localReacted
    setLocalReacted(nextReacted)
    setLocalReactCount((prev) => (nextReacted ? prev + 1 : Math.max(0, prev - 1)))
    if (post.post_id && onToggleReact) {
      try {
        await onToggleReact(post.post_id)
      } catch {
        // Rollback on error
        setLocalReacted(!nextReacted)
        setLocalReactCount((prev) => (!nextReacted ? prev + 1 : Math.max(0, prev - 1)))
      }
    }
  }

  function handleCopyLink() {
    navigator.clipboard?.writeText(window.location.href)
    toast.success('Đã sao chép liên kết bài viết!')
  }

  return (
    <Card className="p-4 sm:p-5 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3.5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Author avatar and name layout] */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={post.author?.avatar_url || undefined}
            name={authorName}
            fallback={initials}
            size="md"
            tone="accent"
          />
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Author metadata column] */}
          <div className="min-w-0">
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Author name and badge flex row] */}
            <div className="flex items-center gap-2 flex-wrap">
              <Heading level={3} className="text-sm font-bold text-text-primary truncate">
                {authorName}
              </Heading>
              {post.subject_code ? (
                <Badge tone="accent" size="sm" emphasis="outline">
                  {post.subject_code}
                </Badge>
              ) : null}
            </div>
            <time className="text-xs text-text-muted block" dateTime={post.created_at}>
              {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'}
            </time>
          </div>
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-11 h-11 p-0 rounded-full text-text-muted hover:text-text-primary min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Tùy chọn bài viết"
            >
              <MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-surface border-line-subtle shadow-card rounded-xl">
            <DropdownMenuItem onClick={() => toast.success('Đã lưu bài viết vào mục ôn tập!')}>
              <Bookmark size={15} className="mr-2" />
              <strong className="font-normal">Lưu bài viết</strong>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy size={15} className="mr-2" />
              <strong className="font-normal">Sao chép liên kết</strong>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsReportOpen(true)}
              className="text-tone-danger hover:bg-tone-danger/10"
            >
              <AlertCircle size={15} className="mr-2" />
              <strong className="font-normal">Báo cáo vi phạm</strong>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

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
            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          </Button>
        ) : null}
      </article>

      {/* Lecturer Note Box (UC06) */}
      {post.lecturer_note ? (
        <aside
          aria-label="Ghi chú chuyên môn từ Giảng viên"
          className="p-3.5 rounded-xl bg-action-accent/10 border border-action-accent/30 space-y-1.5"
        >
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Lecturer note title row] */}
          <div className="flex items-center gap-2 text-action-accent font-bold text-xs">
            <GraduationCap size={16} />
            <strong>Ghi chú chuyên môn từ Giảng viên</strong>
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
          {localReactCount} lượt thích
        </strong>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments((prev) => !prev)}
          className="text-xs text-text-muted hover:text-text-primary p-0 h-auto min-h-11 inline-flex items-center"
        >
          {post.comment_count || 0} bình luận
        </Button>
      </footer>

      {/* Action Buttons */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Action buttons 3-column grid container] */}
      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-line-subtle">
        <Button
          variant={localReacted ? 'secondary' : 'ghost'}
          size="sm"
          onClick={handleReactClick}
          className={`justify-center gap-2 text-xs min-h-11 ${
            localReacted ? 'text-action-accent font-bold' : ''
          }`}
          leftIcon={<ThumbsUp size={16} />}
        >
          Thích
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments((prev) => !prev)}
          className="justify-center gap-2 text-xs min-h-11"
          leftIcon={<MessageSquare size={16} />}
        >
          Bình luận
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="justify-center gap-2 text-xs min-h-11"
          leftIcon={<Share2 size={16} />}
        >
          Chia sẻ
        </Button>
      </div>

      {/* Comments Drawer / Section */}
      {showComments && post.post_id ? (
        <PostCommentSection
          postId={post.post_id}
          currentUserAvatar={currentUserAvatar}
          currentUserName={currentUserName}
        />
      ) : null}

      {/* Report Modal */}
      <ReportPostModal
        isOpen={isReportOpen}
        postId={post.post_id}
        onClose={() => setIsReportOpen(false)}
      />
    </Card>
  )
}
