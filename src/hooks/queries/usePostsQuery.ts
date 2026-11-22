import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { postService } from '@/services/post.service'
import { feedService } from '@/services/feed.service'
import { reactionService } from '@/services/reaction.service'
import { queryKeys } from '@/lib/query-keys'
import { getNextCursor } from '@/lib/pagination'
import { useAuthStore } from '@/stores/authStore'
import type {
  CreatePostRequest,
  UpdatePostRequest,
  UpdateLecturerNoteRequest,
  ReactRequest,
  PostResponseDto,
  CursorResponsePostResponseDto,
  CursorResponseActivityFeedItemDto,
} from '@/types'

export function usePostDetailQuery(postId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: ({ signal }) => postService.getPostById(postId, { signal }),
    enabled: enabled && Number.isFinite(postId) && postId > 0,
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

export function useInfinitePostsFeedQuery(limit = 10, enabled = true) {
  const isAuthReady = useAuthStore((s) => s.isAuthenticated && Boolean(s.token))
  return useInfiniteQuery({
    queryKey: queryKeys.posts.infiniteFeed(limit),
    queryFn: ({ pageParam, signal }) =>
      postService.getMyPosts({ cursor: pageParam as string | undefined, limit }, { signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      getNextCursor(lastPage.pagination, lastPage.items ?? [], lastPageParam),
    enabled: isAuthReady && enabled,
  })
}

export function useInfiniteActivityFeedQuery(limit = 10, enabled = true) {
  const isAuthReady = useAuthStore((s) => s.isAuthenticated && Boolean(s.token))
  return useInfiniteQuery({
    queryKey: queryKeys.feed.infiniteActivity(limit),
    queryFn: ({ pageParam, signal }) =>
      feedService.getActivityFeeds({ cursor: pageParam as string | undefined, limit }, { signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      getNextCursor(lastPage.pagination, lastPage.items ?? [], lastPageParam),
    enabled: isAuthReady && enabled,
  })
}

export function useNewFeedCountQuery(since?: string, enabled = true) {
  const isAuthReady = useAuthStore((s) => s.isAuthenticated && Boolean(s.token))
  return useQuery({
    queryKey: queryKeys.feed.newCount(since),
    queryFn: ({ signal }) => feedService.getNewFeedCount({ since }, { signal }),
    enabled: isAuthReady && enabled && Boolean(since),
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.infiniteFeed(10) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.infiniteActivity(10) })
    },
  })
}

export function useUpdatePostMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePostRequest) => postService.updatePost(postId, payload),
    onSuccess: (updated, payload) => {
      const patch = (post: PostResponseDto): PostResponseDto =>
        post.post_id === postId ? { ...post, ...payload, ...updated } : post

      queryClient.setQueryData<PostResponseDto[]>(
        queryKeys.posts.recentlyCreated(),
        (previous = []) => previous.map(patch)
      )
      queryClient.setQueryData<PostResponseDto>(queryKeys.posts.detail(postId), (previous) =>
        previous ? { ...previous, ...payload, ...updated } : updated
      )
      queryClient.setQueriesData<InfiniteData<CursorResponsePostResponseDto>>(
        { queryKey: ['posts', 'infiniteFeed'] },
        (old) =>
          old
            ? { ...old, pages: old.pages.map((p) => ({ ...p, items: p.items?.map(patch) })) }
            : old
      )
      queryClient.setQueriesData<InfiniteData<CursorResponsePostResponseDto>>(
        { queryKey: ['posts', 'infiniteUserPosts'] },
        (old) =>
          old
            ? { ...old, pages: old.pages.map((p) => ({ ...p, items: p.items?.map(patch) })) }
            : old
      )
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
      queryClient.setQueriesData<InfiniteData<CursorResponsePostResponseDto>>(
        { queryKey: ['posts', 'infiniteFeed'] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items?.filter((post) => post.post_id !== postId),
                })),
              }
            : old
      )
      queryClient.setQueriesData<InfiniteData<CursorResponsePostResponseDto>>(
        { queryKey: ['posts', 'infiniteUserPosts'] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items?.filter((post) => post.post_id !== postId),
                })),
              }
            : old
      )
      queryClient.setQueriesData<InfiniteData<CursorResponseActivityFeedItemDto>>(
        { queryKey: ['feed', 'infiniteActivity'] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  items: p.items?.filter(
                    (item) => !(item.target_type === 'POST' && item.target_id === postId)
                  ),
                })),
              }
            : old
      )
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) })
    },
  })
}

export function useUpdateLecturerNoteMutation(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateLecturerNoteRequest) =>
      postService.updateLecturerNote(postId, payload),
    onSuccess: (_, payload) => {
      queryClient.setQueryData<PostResponseDto>(queryKeys.posts.detail(postId), (previous) =>
        previous ? { ...previous, lecturer_note: payload.content } : previous
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) })
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
        const patchPost = (post: PostResponseDto): PostResponseDto =>
          post.post_id === variables.target_id
            ? {
                ...post,
                reacted_by_me: Boolean(result.my_reaction),
                react_count: result.total_count ?? post.react_count,
              }
            : post

        queryClient.setQueryData<PostResponseDto>(
          queryKeys.posts.detail(variables.target_id),
          (prev) => (prev ? patchPost(prev) : prev)
        )
        queryClient.setQueriesData<InfiniteData<CursorResponsePostResponseDto>>(
          { queryKey: ['posts', 'infiniteFeed'] },
          (old) =>
            old
              ? { ...old, pages: old.pages.map((p) => ({ ...p, items: p.items?.map(patchPost) })) }
              : old
        )
        queryClient.setQueriesData<InfiniteData<CursorResponsePostResponseDto>>(
          { queryKey: ['posts', 'infiniteUserPosts'] },
          (old) =>
            old
              ? { ...old, pages: old.pages.map((p) => ({ ...p, items: p.items?.map(patchPost) })) }
              : old
        )
      }
    },
  })
}
