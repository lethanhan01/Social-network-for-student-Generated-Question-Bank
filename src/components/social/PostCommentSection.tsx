import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/ui/forms/Select'
import { useAuthStore } from '@/stores/authStore'
import {
  useInfinitePostCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '@/hooks/queries/useCommentsQuery'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { QueryFeedback } from './QueryFeedback'
import { LoadMore } from './LoadMore'

export function PostCommentSection({
  postId,
}: Readonly<{ postId: number; currentUserAvatar?: string; currentUserName?: string }>) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const query = useInfinitePostCommentsQuery(postId, undefined, true, sort)
  const create = useCreateCommentMutation(postId)
  const update = useUpdateCommentMutation(postId)
  const remove = useDeleteCommentMutation(postId)
  const comments = query.data?.pages.flatMap((page) => page.items ?? []) ?? []
  const send = (content: string, media_url?: string, parent_comment_id?: number) =>
    create.mutateAsync({
      target_type: 'POST',
      target_id: postId,
      content,
      media_url,
      parent_comment_id,
    })
  return (
    <section
      aria-label={t('social.comments')}
      className="space-y-4 border-t border-line-subtle pt-4"
    >
      <CommentForm label={t('social.commentInput')} onSend={(text, media) => send(text, media)} />
      <Select
        ariaLabel={t('social.commentList')}
        value={sort}
        clearable={false}
        onValueChange={(value) => setSort(value as typeof sort)}
        options={[
          { value: 'newest', label: t('social.sortNewest') },
          { value: 'oldest', label: t('social.sortOldest') },
        ]}
      />
      {query.isPending || (query.isError && !query.data) ? (
        <QueryFeedback pending={query.isPending} error={query.error} onRetry={query.refetch} />
      ) : null}
      {query.isSuccess && comments.length === 0 ? (
        <p className="text-sm text-text-muted">{t('comment.empty')}</p>
      ) : null}
      {comments.map((comment) => (
        <CommentItem
          key={comment.comment_id}
          comment={comment}
          postId={postId}
          currentUserId={user?.user_id ?? Number(user?.userId)}
          isStaff={user?.role === 'ADMIN'}
          onReply={(parentId, text, media) => send(text, media, parentId)}
          onUpdate={(commentId, content, media_url) =>
            update.mutateAsync({
              commentId,
              payload: { content, ...(media_url ? { media_url } : {}) },
            })
          }
          onDelete={(commentId) => remove.mutateAsync(commentId)}
        />
      ))}
      <LoadMore query={query} />
    </section>
  )
}
