import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { queryKeys } from '@/lib/query-keys'
import { commentService } from '@/services/comment.service'
import { Form, FormField, Input } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions'
import { Avatar } from '@/components/ui/data-display'
import { Text } from '@/components/ui/typography'
import { toast } from '@/lib/toast'
import type { CommentResponseDto } from '@/types'

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
  const [commentText, setCommentText] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: ({ signal }) => commentService.getComments({ post_id: postId }, { signal }),
    staleTime: 15 * 1000,
  })

  const createCommentMutation = useMutation({
    mutationFn: (content: string) =>
      commentService.createComment({
        target_type: 'POST',
        target_id: postId,
        content,
      }),
    onSuccess: (newComment: CommentResponseDto) => {
      setCommentText('')
      queryClient.setQueryData(
        queryKeys.comments.byPost(postId),
        (old: { items?: CommentResponseDto[] } | undefined) => {
          if (!old?.items) return { items: [newComment] }
          return { ...old, items: [...old.items, newComment] }
        }
      )
    },
    onError: () => {
      toast.error('Không thể gửi bình luận. Vui lòng thử lại.')
    },
  })

  async function handleSendComment(e?: React.SubmitEvent) {
    e?.preventDefault()
    if (!commentText.trim()) return
    await createCommentMutation.mutateAsync(commentText.trim())
  }

  const comments = data?.items || []

  function renderCommentsList() {
    if (isLoading) {
      return (
        <Text size="xs" tone="muted" className="italic text-center py-2">
          Đang tải bình luận...
        </Text>
      )
    }

    if (comments.length > 0) {
      return (
        <section aria-label="Danh sách bình luận" className="space-y-2.5 pt-1">
          {comments.map((comment) => {
            const author = comment.author?.full_name || 'Người dùng HUST'
            const initials = author.charAt(0).toUpperCase()
            return (
              <article key={comment.comment_id} className="flex items-start gap-2.5">
                <Avatar
                  src={comment.author?.avatar_url || undefined}
                  name={author}
                  fallback={initials}
                  size="sm"
                />
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Comment bubble layout container] */}
                <div className="flex-1 bg-surface-hover rounded-2xl p-2.5 px-3.5 border border-line-subtle text-xs">
                  <strong className="font-bold text-text-primary block mb-0.5">
                    {author}
                  </strong>
                  <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </article>
            )
          })}
        </section>
      )
    }

    return (
      <Text size="xs" tone="muted" className="italic text-center py-1">
        Chưa có bình luận nào. Hãy là người đầu tiên phản hồi!
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
              placeholder="Viết câu trả lời hoặc thảo luận..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="text-xs h-10 rounded-full bg-surface-hover"
            />
          </FormField>
          <SubmitButton
            loading={createCommentMutation.isPending}
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
