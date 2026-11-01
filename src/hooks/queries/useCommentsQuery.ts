import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNextCursor } from '@/lib/pagination'
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

export function useInfinitePostCommentsQuery(
  postId: number,
  parentId?: number,
  enabled = true,
  sort: 'newest' | 'oldest' = 'newest'
) {
  return useInfiniteQuery({
    queryKey: parentId
      ? queryKeys.comments.replies(postId, parentId, { infinite: true, sort })
      : queryKeys.comments.byPost(postId, { infinite: true, sort }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      commentService.getComments(
        { post_id: postId, parent_id: parentId, cursor: pageParam, limit: 20, sort },
        { signal }
      ),
    getNextPageParam: (last) => getNextCursor(last.pagination),
    enabled: enabled && postId > 0,
  })
}

export function useCreateCommentMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCommentRequest) => commentService.createComment(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all })
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
    mutationFn: ({ commentId, payload }: { commentId: number; payload: UpdateCommentRequest }) =>
      commentService.updateComment(commentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byPost(postId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      })
    },
  })
}
