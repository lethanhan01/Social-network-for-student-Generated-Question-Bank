import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { postService } from '@/services/post.service'
import { feedService } from '@/services/feed.service'
import { reactionService } from '@/services/reaction.service'
import { queryKeys } from '@/lib/query-keys'
import { getNextCursor } from '@/lib/pagination'
import type {
  CreatePostRequest,
  UpdatePostRequest,
  UpdateLecturerNoteRequest,
  ReactRequest,
  PostResponseDto,
} from '@/types'

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

export function useInfiniteUserPostsQuery(userId: number, limit = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.infiniteUserPosts(userId, limit),
    queryFn: ({ pageParam, signal }) =>
      postService.getUserPosts(
        userId,
        { cursor: pageParam as string | undefined, limit },
        { signal }
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pagination),
    enabled: Number.isFinite(userId) && userId > 0,
  })
}

export function useInfinitePostsFeedQuery(limit = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.infiniteFeed(limit),
    queryFn: ({ pageParam, signal }) =>
      postService.getMyPosts({ cursor: pageParam as string | undefined, limit }, { signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pagination),
  })
}

export function useInfiniteActivityFeedQuery(limit = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.infiniteActivity(limit),
    queryFn: ({ pageParam, signal }) =>
      feedService.getActivityFeeds({ cursor: pageParam as string | undefined, limit }, { signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pagination),
  })
}

export function useNewFeedCountQuery(since?: string) {
  return useQuery({
    queryKey: queryKeys.feed.newCount(since),
    queryFn: ({ signal }) => feedService.getNewFeedCount({ since }, { signal }),
    enabled: Boolean(since),
    refetchInterval: 30000,
  })
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePostRequest) => postService.createPost(payload),
    onSuccess: (post) => {
      if (post.post_id) queryClient.setQueryData(queryKeys.posts.detail(post.post_id), post)
      queryClient.setQueryData<PostResponseDto[]>(
        queryKeys.posts.recentlyCreated(),
        (previous = []) => [post, ...previous]
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all })
    },
  })
}

export function useUpdatePostMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePostRequest) => postService.updatePost(postId, payload),
    onSuccess: (updated, payload) => {
      queryClient.setQueryData<PostResponseDto[]>(
        queryKeys.posts.recentlyCreated(),
        (previous = []) =>
          previous.map((post) =>
            post.post_id === postId ? { ...post, ...payload, ...updated } : post
          )
      )
      queryClient.setQueryData<PostResponseDto>(queryKeys.posts.detail(postId), (previous) =>
        previous ? { ...previous, ...updated } : undefined
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all })
    },
  })
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) => postService.deletePost(postId),
    onSuccess: (_, postId) => {
      queryClient.setQueryData<PostResponseDto[]>(
        queryKeys.posts.recentlyCreated(),
        (previous = []) => previous.filter((post) => post.post_id !== postId)
      )
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all })
    },
  })
}

export function useUpdateLecturerNoteMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateLecturerNoteRequest) =>
      postService.updateLecturerNote(postId, payload),
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
    onSuccess: (result, variables) => {
      queryClient.setQueryData(queryKeys.posts.myReaction(variables.target_id), result)
      if (variables.target_type === 'POST') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
        void queryClient.invalidateQueries({ queryKey: queryKeys.feed.all })
      }
    },
  })
}
