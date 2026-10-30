import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Reply, MoreHorizontal, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/data-display'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Form, FormField, Input } from '@/components/ui/forms'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/overlay'
import { formatDateTime } from '@/utils/date'
import { ReportModal } from './ReportPostModal'
import type { CommentResponseDto } from '@/types'

interface CommentItemProps {
  comment: CommentResponseDto
  currentUserId?: number
  isStaff?: boolean
  onReply: (parentId: number, text: string) => Promise<void>
  onUpdate: (commentId: number, text: string) => Promise<void>
  onDelete: (commentId: number) => Promise<void>
}

export function CommentItem({
  comment,
  currentUserId,
  isStaff = false,
  onReply,
  onUpdate,
  onDelete,
}: Readonly<CommentItemProps>) {
  const { t } = useTranslation()
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content || '')
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwner = Boolean(comment.author?.user_id && comment.author?.user_id === currentUserId)
  const canDelete = isOwner || isStaff
  const author = comment.author?.full_name || 'Người dùng HUST'
  const initials = author.charAt(0).toUpperCase()

  async function handleSendReply() {
    if (!replyText.trim() || !comment.comment_id) return
    setLoading(true)
    try {
      await onReply(comment.comment_id, replyText.trim())
      setReplyText('')
      setIsReplying(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveEdit() {
    if (!editText.trim() || !comment.comment_id) return
    setLoading(true)
    try {
      await onUpdate(comment.comment_id, editText.trim())
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!comment.comment_id) return
    if (window.confirm(t('comment.confirmDelete', 'Bạn có chắc chắn muốn xóa bình luận này?'))) {
      await onDelete(comment.comment_id)
    }
  }

  if (comment.deleted) {
    return (
      /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Deleted comment placeholder layout] */
      <div className="p-2.5 rounded-xl bg-surface-elevated text-xs text-text-muted italic border border-line-subtle">
        {t('comment.deletedMessage', 'Bình luận này đã bị xóa.')}
      </div>
    )
  }

  return (
    <article className="space-y-2">
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Comment row layout container] */}
      <div className="flex items-start gap-2.5">
        <Avatar
          src={comment.author?.avatar_url || undefined}
          name={author}
          fallback={initials}
          size="sm"
        />
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Comment bubble and actions wrapper] */}
        <div className="flex-1 min-w-0">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Bubble container] */}
          <div className="bg-surface-hover rounded-2xl p-2.5 px-3.5 border border-line-subtle text-xs relative group">
            {/* Header info */}
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Author name and options header row] */}
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <strong className="font-bold text-text-primary truncate">{author}</strong>
              <div className="flex items-center gap-1">
                <time className="text-[10px] text-text-muted">
                  {formatDateTime(comment.created_at)}
                </time>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 rounded-full text-text-muted hover:text-text-primary"
                      aria-label="Tùy chọn bình luận"
                    >
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-surface shadow-card rounded-xl">
                    {isOwner ? (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit size={13} className="mr-2" />
                        <strong className="font-normal">{t('common.edit', 'Chỉnh sửa')}</strong>
                      </DropdownMenuItem>
                    ) : null}
                    {canDelete ? (
                      <DropdownMenuItem onClick={handleDelete} className="text-tone-danger">
                        <Trash2 size={13} className="mr-2" />
                        <strong className="font-normal">{t('common.delete', 'Xóa')}</strong>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => setIsReportOpen(true)} className="text-tone-danger">
                      <AlertCircle size={13} className="mr-2" />
                      <strong className="font-normal">{t('report.submit', 'Báo cáo')}</strong>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Content / Edit Form */}
            {isEditing ? (
              <Form onSubmit={handleSaveEdit} noValidate className="space-y-2 pt-1">
                <FormField className="mb-0">
                  <Input
                    aria-label="Chỉnh sửa bình luận"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="text-xs h-8"
                  />
                </FormField>
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Edit buttons row] */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="h-7 text-xs"
                  >
                    {t('common.cancel', 'Hủy')}
                  </Button>
                  <SubmitButton loading={loading} variant="primary" size="sm" className="h-7 text-xs px-3">
                    {t('common.save', 'Lưu')}
                  </SubmitButton>
                </div>
              </Form>
            ) : (
              <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>

          {/* Reply Action Trigger */}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Reply trigger container] */}
          <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] text-text-muted">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying((prev) => !prev)}
              className="p-0 h-auto text-text-muted hover:text-text-primary inline-flex items-center gap-1 font-semibold"
            >
              <Reply size={12} />
              {t('comment.reply', 'Trả lời')}
            </Button>
          </div>

          {/* Reply Input Form */}
          {isReplying ? (
            <Form onSubmit={handleSendReply} noValidate className="mt-2 flex gap-2">
              <FormField className="flex-1 mb-0">
                <Input
                  aria-label="Viết câu trả lời"
                  placeholder={t('comment.replyPlaceholder', 'Viết câu trả lời...')}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="text-xs h-8 rounded-full bg-surface-hover"
                />
              </FormField>
              <SubmitButton
                loading={loading}
                disabled={!replyText.trim()}
                variant="primary"
                size="sm"
                className="h-8 px-3 rounded-full text-xs"
              >
                {t('comment.send', 'Gửi')}
              </SubmitButton>
            </Form>
          ) : null}

          {/* Nested Replies List */}
          {comment.replies && comment.replies.length > 0 ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Nested replies tree stack] */
            <div className="pl-6 pt-2 space-y-2 border-l border-line-subtle mt-1">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.comment_id}
                  comment={reply}
                  currentUserId={currentUserId}
                  isStaff={isStaff}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        targetType="COMMENT"
        targetId={comment.comment_id}
        onClose={() => setIsReportOpen(false)}
      />
    </article>
  )
}
