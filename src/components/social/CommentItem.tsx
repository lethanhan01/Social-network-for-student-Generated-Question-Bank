import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { Image } from '@/components/ui/data-display/Image'
import { Button, ButtonLink } from '@/components/ui/actions/Button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/overlay'
import { ConfirmDialog } from '@/components/ui/overlay/ConfirmDialog'
import { useInfinitePostCommentsQuery } from '@/hooks/queries/useCommentsQuery'
import { formatDateTime } from '@/utils/date'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { ReportModal } from './ReportPostModal'
import { CommentForm } from './CommentForm'
import { LoadMore } from './LoadMore'
import { QueryFeedback } from './QueryFeedback'
import type { CommentResponseDto } from '@/types'

interface CommentItemProps {
  comment: CommentResponseDto
  postId: number
  currentUserId?: number
  currentUserAvatar?: string
  currentUserName?: string
  isStaff?: boolean
  depth?: number
  onReply: (parentId: number, text: string, media?: string) => Promise<unknown>
  onUpdate: (commentId: number, text: string, media?: string) => Promise<unknown>
  onDelete: (commentId: number) => Promise<unknown>
}
export function CommentItem({
  comment,
  postId,
  currentUserId,
  currentUserAvatar,
  currentUserName,
  isStaff,
  onReply,
  onUpdate,
  onDelete,
  depth = 0,
}: Readonly<CommentItemProps>) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'view' | 'reply' | 'edit' | 'delete' | 'report'>('view')
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const replies = useInfinitePostCommentsQuery(
    postId,
    comment.comment_id,
    expanded && Boolean(comment.comment_id)
  )
  const children = expanded ? (replies.data?.pages.flatMap((page) => page.items ?? []) ?? []) : []
  const owner = Boolean(currentUserId && currentUserId === comment.author?.user_id)
  const author = comment.author?.full_name ?? t('social.member')
  const replyCount = comment.reply_count ?? comment.replies?.length ?? 0
  async function remove() {
    if (!comment.comment_id || deleting) return
    setDeleting(true)
    try {
      await onDelete(comment.comment_id)
      setMode('view')
    } catch (error) {
      toast.error(getApiError(error, t('zone2.actionError')))
    } finally {
      setDeleting(false)
    }
  }
  return (
    <article className="flex items-start gap-2.5 py-1">
      <ButtonLink
        to={`/profile/${comment.author?.user_id ?? 'me'}`}
        variant="plain"
        className="group mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0 focus-visible:ring-0"
      >
        <Avatar
          name={author}
          src={comment.author?.avatar_url || undefined}
          size="md"
        />
      </ButtonLink>
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Right-hand comment content column] */}
      <div className="min-w-0 flex-1 space-y-1">
        <header className="flex items-center gap-1.5">
          <ButtonLink
            to={`/profile/${comment.author?.user_id ?? 'me'}`}
            variant="link"
            tone="neutral"
            className="h-auto min-h-0 min-w-0 truncate p-0 text-sm font-semibold text-text-primary"
          >
            {author}
          </ButtonLink>
          <time className="mr-auto shrink-0 text-xs text-text-muted">
            · {formatDateTime(comment.created_at)}
          </time>
          {!comment.deleted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  aria-label={t('social.commentOptions')}
                  leftIcon={<MoreHorizontal size={16} />}
                  className="px-1.5 text-text-muted"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {owner ? (
                  <DropdownMenuItem onClick={() => setMode('edit')}>
                    {t('social.commentEdit')}
                  </DropdownMenuItem>
                ) : null}
                {owner || isStaff ? (
                  <DropdownMenuItem onClick={() => setMode('delete')}>
                    {t('social.deleteComment')}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => setMode('report')}>
                  {t('report.submit')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </header>
        {comment.deleted ? (
          <p className="text-sm italic text-text-muted">{t('social.commentDeleted')}</p>
        ) : mode === 'edit' ? (
          <CommentForm
            initial={comment.content ?? ''}
            label={t('social.commentEdit')}
            onCancel={() => setMode('view')}
            onSend={async (text, media) => {
              await onUpdate(comment.comment_id!, text, media)
              setMode('view')
            }}
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm text-text-primary">
            {comment.content}
          </p>
        )}
        {!comment.deleted && comment.media_url ? (
          <Image
            src={comment.media_url}
            alt={t('social.attachment')}
            className="max-h-64 rounded-xl object-contain"
          />
        ) : null}
        <footer className="flex flex-col items-start gap-0.5">
          {!comment.deleted ? (
            <Button
              variant="ghost"
              size="xs"
              className="h-auto min-h-6 px-1 py-0.5 text-xs font-medium text-text-muted"
              onClick={() => setMode(mode === 'reply' ? 'view' : 'reply')}
            >
              {t('comment.reply')}
            </Button>
          ) : null}
          {replyCount > 0 ? (
            <Button
              variant="ghost"
              size="xs"
              aria-expanded={expanded}
              leftIcon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              className="h-auto min-h-6 px-1 py-0.5 text-xs font-medium text-text-muted"
              onClick={() => setExpanded((previous) => !previous)}
            >
              {t('social.replies', { count: replyCount })}
            </Button>
          ) : null}
        </footer>
        {mode === 'reply' ? (
          <CommentForm
            label={t('social.replyInput')}
            avatarUrl={currentUserAvatar}
            avatarName={currentUserName}
            onCancel={() => setMode('view')}
            onSend={async (text, media) => {
              await onReply(comment.comment_id!, text, media)
              setMode('view')
              setExpanded(true)
            }}
          />
        ) : null}
        {expanded ? (
          <section className={depth < 2 ? 'space-y-2 border-l border-line-subtle pl-3 pt-1' : 'space-y-2 pt-1'}>
            {replies.isPending || (replies.isError && !replies.data) ? (
              <QueryFeedback
                pending={replies.isPending}
                error={replies.error}
                onRetry={replies.refetch}
              />
            ) : null}
            {children.map((child) => (
              <CommentItem
                key={child.comment_id}
                comment={child}
                postId={postId}
                currentUserId={currentUserId}
                currentUserAvatar={currentUserAvatar}
                currentUserName={currentUserName}
                isStaff={isStaff}
                onReply={onReply}
                onUpdate={onUpdate}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
            <LoadMore query={replies} />
          </section>
        ) : null}
        <ConfirmDialog
          open={mode === 'delete'}
          title={t('social.deleteComment')}
          description={t('comment.delete_confirm')}
          variant="danger"
          loading={deleting}
          onClose={() => {
            if (!deleting) setMode('view')
          }}
          onConfirm={remove}
        />
        <ReportModal
          isOpen={mode === 'report'}
          targetType="COMMENT"
          targetId={comment.comment_id}
          onClose={() => setMode('view')}
        />
      </div>
    </article>
  )
}
