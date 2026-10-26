import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '@/services/comment.service'
import { queryKeys } from '@/lib/query-keys'
import type { CreateCommentRequest, UpdateCommentRequest } from '@/types'

export function usePostCommentsQuery(postId: number, parentCommentId?: number) {
  return useQuery({
    queryKey: parentCommentId
      ? queryKeys.comments.replies(postId, parentCommentId)
      : queryKeys.comments.byPost(postId),
    queryFn: ({ signal }) =>
      commentService.getComments(
        { post_id: postId, parent_id: parentCommentId, limit: 50 },
        { signal }
      ),
    enabled: Number.isFinite(postId) && postId > 0,
  })
}

export function useCreateCommentMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCommentRequest) => commentService.createComment(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byPost(postId),
      })
      if (variables.parent_comment_id) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.comments.replies(postId, variables.parent_comment_id),
        })
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      })
    },
  })
}

export function useUpdateCommentMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: number
      payload: UpdateCommentRequest
    }) => commentService.updateComment(commentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byPost(postId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      })
    },
  })
}

export function useDeleteCommentMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: number) => commentService.deleteComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byPost(postId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      })
    },
  })
}
