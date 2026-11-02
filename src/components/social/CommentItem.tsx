import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'
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
    <article className="space-y-3 rounded-xl bg-surface-hover p-3">
      <header className="flex items-center justify-between gap-2">
        <Avatar name={author} src={comment.author?.avatar_url || undefined} size="sm" />
        <ButtonLink
          to={`/profile/${comment.author?.user_id ?? 'me'}`}
          variant="ghost"
          className="min-w-0 flex-1 justify-start truncate text-sm"
        >
          {author}
        </ButtonLink>
        <time className="text-xs text-text-muted">{formatDateTime(comment.created_at)}</time>
        {!comment.deleted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" aria-label={t('social.commentOptions')}>
                <MoreHorizontal size={18} />
              </Button>
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
        <p className="whitespace-pre-wrap break-words text-sm">{comment.content}</p>
      )}
      {!comment.deleted && comment.media_url ? (
        <Image
          src={comment.media_url}
          alt={t('social.attachment')}
          className="max-h-64 rounded-xl object-contain"
        />
      ) : null}
      <footer className="flex flex-wrap gap-2">
        {!comment.deleted ? (
          <Button variant="ghost" onClick={() => setMode(mode === 'reply' ? 'view' : 'reply')}>
            {t('comment.reply')}
          </Button>
        ) : null}
        {(comment.reply_count ?? comment.replies?.length ?? 0) > 0 ? (
          <Button
            variant="ghost"
            aria-expanded={expanded}
            onClick={() => setExpanded((previous) => !previous)}
          >
            {t('social.replies', { count: comment.reply_count ?? comment.replies?.length ?? 0 })}
          </Button>
        ) : null}
      </footer>
      {mode === 'reply' ? (
        <CommentForm
          label={t('social.replyInput')}
          onCancel={() => setMode('view')}
          onSend={async (text, media) => {
            await onReply(comment.comment_id!, text, media)
            setMode('view')
            setExpanded(true)
          }}
        />
      ) : null}
      {expanded ? (
        <section className={depth < 2 ? 'space-y-3 border-l border-line-subtle pl-3' : 'space-y-3'}>
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
    </article>
  )
}
