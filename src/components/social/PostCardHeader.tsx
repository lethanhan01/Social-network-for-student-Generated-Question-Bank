import { useTranslation } from 'react-i18next'
import { MoreHorizontal, AlertCircle, GraduationCap, Copy, ExternalLink } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/overlay'
import { Heading } from '@/components/ui/typography'
import { formatDateTime } from '@/utils/date'
import type { PostResponseDto } from '@/types'

interface PostCardHeaderProps {
  post: PostResponseDto
  isLecturer: boolean
  onOpenLecturerNote: () => void
  onOpenReport: () => void
  onCopyLink: () => void
}

export function PostCardHeader({
  post,
  isLecturer,
  onOpenLecturerNote,
  onOpenReport,
  onCopyLink,
}: Readonly<PostCardHeaderProps>) {
  const { t } = useTranslation()
  const authorName = post.author?.full_name || 'Thành viên HUST'
  const authorId = post.author?.user_id
  const initials = authorName.charAt(0).toUpperCase()

  return (
    <header className="flex items-start justify-between gap-3">
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Author layout container] */}
      <div className="flex items-center gap-3 min-w-0">
        {authorId ? (
          <ButtonLink
            to={`/profile/${authorId}`}
            variant="ghost"
            className="p-0 h-auto rounded-full min-h-11 min-w-11"
          >
            <Avatar
              src={post.author?.avatar_url || undefined}
              name={authorName}
              fallback={initials}
              size="md"
              tone="accent"
            />
          </ButtonLink>
        ) : (
          <Avatar
            src={post.author?.avatar_url || undefined}
            name={authorName}
            fallback={initials}
            size="md"
            tone="accent"
          />
        )}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Author metadata column] */}
        <div className="min-w-0">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Author title and badge row] */}
          <div className="flex items-center gap-2 flex-wrap">
            {authorId ? (
              <ButtonLink
                to={`/profile/${authorId}`}
                variant="ghost"
                className="p-0 h-auto font-bold text-text-primary hover:underline text-sm truncate"
              >
                {authorName}
              </ButtonLink>
            ) : (
              <Heading level={3} className="text-sm font-bold text-text-primary truncate">
                {authorName}
              </Heading>
            )}
            {post.subject_code ? (
              <Badge tone="accent" size="sm" emphasis="outline">
                {post.subject_code}
              </Badge>
            ) : null}
          </div>
          <time className="text-xs text-text-muted block" dateTime={post.created_at}>
            {formatDateTime(post.created_at)}
          </time>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-11 h-11 p-0 rounded-full text-text-muted hover:text-text-primary min-h-11 min-w-11 flex items-center justify-center"
            aria-label={t('post.options', 'Tùy chọn bài viết')}
          >
            <MoreHorizontal size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 bg-surface border-line-subtle shadow-card rounded-xl"
        >
          {post.post_id ? (
            <DropdownMenuItem asChild>
              <ButtonLink
                to={`/posts/${post.post_id}`}
                variant="ghost"
                className="w-full justify-start p-2 h-auto text-xs"
              >
                <ExternalLink size={15} className="mr-2" />
                <strong className="font-normal">{t('post.viewDetail', 'Xem chi tiết bài viết')}</strong>
              </ButtonLink>
            </DropdownMenuItem>
          ) : null}
          {isLecturer && post.post_id ? (
            <DropdownMenuItem onClick={onOpenLecturerNote}>
              <GraduationCap size={15} className="mr-2 text-action-accent" />
              <strong className="font-normal">{t('post.lecturerNote.menu', 'Ghi chú chuyên môn')}</strong>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={onCopyLink}>
            <Copy size={15} className="mr-2" />
            <strong className="font-normal">{t('post.copyLink', 'Sao chép liên kết')}</strong>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onOpenReport}
            className="text-tone-danger hover:bg-tone-danger/10"
          >
            <AlertCircle size={15} className="mr-2" />
            <strong className="font-normal">{t('report.submit', 'Báo cáo vi phạm')}</strong>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
