import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { Form, FormField, Input } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions'
import { Avatar } from '@/components/ui/data-display'
import { Text } from '@/components/ui/typography'
import { useAuthStore } from '@/stores/authStore'
import {
  usePostCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '@/hooks/queries/useCommentsQuery'
import { CommentItem } from './CommentItem'
import { toast } from '@/lib/toast'

interface PostCommentSectionProps {
  postId: number
  currentUserAvatar?: string
  currentUserName?: string
}

export function PostCommentSection({
  postId,
  currentUserAvatar,
  currentUserName = 'Bạn',
}: Readonly<PostCommentSectionProps>) {
  const { t } = useTranslation()
  const [commentText, setCommentText] = useState('')
  const currentUser = useAuthStore((s) => s.user)
  const isStaff = currentUser?.role === 'LECTURER' || currentUser?.role === 'ADMIN'

  const { data, isLoading } = usePostCommentsQuery(postId)
  const createMutation = useCreateCommentMutation(postId)
  const updateMutation = useUpdateCommentMutation(postId)
  const deleteMutation = useDeleteCommentMutation(postId)

  async function handleSendComment(e?: React.SubmitEvent) {
    e?.preventDefault()
    if (!commentText.trim()) return
    try {
      await createMutation.mutateAsync({
        target_type: 'POST',
        target_id: postId,
        content: commentText.trim(),
      })
      setCommentText('')
    } catch {
      toast.error(t('comment.createError', 'Không thể gửi bình luận. Vui lòng thử lại.'))
    }
  }

  async function handleReply(parentId: number, text: string) {
    try {
      await createMutation.mutateAsync({
        target_type: 'POST',
        target_id: postId,
        parent_comment_id: parentId,
        content: text,
      })
    } catch {
      toast.error(t('comment.replyError', 'Không thể gửi câu trả lời.'))
    }
  }

  async function handleUpdate(commentId: number, text: string) {
    try {
      await updateMutation.mutateAsync({
        commentId,
        payload: { content: text },
      })
      toast.success(t('comment.updateSuccess', 'Đã cập nhật bình luận.'))
    } catch {
      toast.error(t('comment.updateError', 'Không thể cập nhật bình luận.'))
    }
  }

  async function handleDelete(commentId: number) {
    try {
      await deleteMutation.mutateAsync(commentId)
      toast.success(t('comment.deleteSuccess', 'Đã xóa bình luận.'))
    } catch {
      toast.error(t('comment.deleteError', 'Không thể xóa bình luận.'))
    }
  }

  const comments = data?.items || []

  function renderCommentsList() {
    if (isLoading) {
      return (
        <Text size="xs" tone="muted" className="italic text-center py-2">
          {t('comment.loading', 'Đang tải bình luận...')}
        </Text>
      )
    }

    if (comments.length > 0) {
      return (
        <section aria-label="Danh sách bình luận" className="space-y-3 pt-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.comment_id}
              comment={comment}
              currentUserId={currentUser?.user_id}
              isStaff={isStaff}
              onReply={handleReply}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )
    }

    return (
      <Text size="xs" tone="muted" className="italic text-center py-1">
        {t('comment.empty', 'Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!')}
      </Text>
    )
  }

  return (
    <section aria-label="Bình luận bài viết" className="pt-3 border-t border-line-subtle space-y-3">
      {/* Input Form */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Flex container for comment input] */}
      <div className="flex items-center gap-2.5">
        <Avatar
          src={currentUserAvatar}
          name={currentUserName}
          fallback={currentUserName.charAt(0)}
          size="sm"
          tone="accent"
        />
        <Form onSubmit={handleSendComment} noValidate className="flex-1 flex gap-2">
          <FormField className="flex-1 mb-0">
            <Input
              aria-label="Viết bình luận"
              placeholder={t('comment.inputPlaceholder', 'Viết câu trả lời hoặc thảo luận...')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="text-xs h-10 rounded-full bg-surface-hover"
            />
          </FormField>
          <SubmitButton
            loading={createMutation.isPending}
            disabled={!commentText.trim()}
            variant="primary"
            size="sm"
            className="rounded-full w-11 h-11 p-0 shrink-0 min-h-11 min-w-11"
            aria-label="Gửi bình luận"
          >
            <Send size={15} />
          </SubmitButton>
        </Form>
      </div>

      {/* Comments List */}
      {renderCommentsList()}
    </section>
  )
}
