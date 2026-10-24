import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postService } from '@/services/post.service'
import { reactionService } from '@/services/reaction.service'
import { queryKeys } from '@/lib/query-keys'
import type { CreatePostRequest, ReactRequest } from '@/types'

export function usePostDetailQuery(postId: number) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: ({ signal }) => postService.getPostById(postId, { signal }),
    enabled: Number.isFinite(postId) && postId > 0,
  })
}

export function useUserPostsQuery(userId: number, params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.posts.userPosts(userId, params),
    queryFn: ({ signal }) => postService.getUserPosts(userId, params, { signal }),
    enabled: Number.isFinite(userId) && userId > 0,
  })
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePostRequest) => postService.createPost(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all })
    },
  })
}

export function useToggleReactionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReactRequest) => reactionService.toggleReact(payload),
    onSuccess: (_, variables) => {
      if (variables.target_type === 'POST') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.target_id) })
      }
    },
  })
}
