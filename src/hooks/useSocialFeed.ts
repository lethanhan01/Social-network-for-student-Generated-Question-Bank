import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { feedService } from '@/services/feed.service'
import { postService } from '@/services/post.service'
import { userService } from '@/services/user.service'
import { courseService } from '@/services/course.service'
import { relationshipService } from '@/services/relationship.service'
import { reactionService } from '@/services/reaction.service'
import { commentService } from '@/services/comment.service'
import { toast } from '@/lib/toast'
import type {
  CreatePostRequest,
  PostResponseDto,
  SubjectResponse,
  ProfileResponse,
  FriendListResponseDto,
  CreateCommentRequest,
} from '@/types'

export function useSocialFeed() {
  const queryClient = useQueryClient()

  // 1. Current user profile
  const userProfileQuery = useQuery<ProfileResponse>({
    queryKey: queryKeys.users.profile('me'),
    queryFn: ({ signal }) => userService.getMyProfile({ signal }),
    staleTime: 5 * 60 * 1000,
  })

  // 2. Active Subjects List for Tagging & Filters
  const subjectsQuery = useQuery<SubjectResponse[]>({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    staleTime: 10 * 60 * 1000,
  })

  // 3. Friends List for Online Buddies Widget
  const friendsQuery = useQuery<FriendListResponseDto>({
    queryKey: queryKeys.relationships.friends(),
    queryFn: ({ signal }) => relationshipService.getMyFriends(undefined, { signal }),
    staleTime: 60 * 1000,
  })

  // 4. Activity Feed Stream
  const feedQuery = useQuery({
    queryKey: queryKeys.feed.activity(),
    queryFn: ({ signal }) => feedService.getActivityFeeds({ limit: 20 }, { signal }),
    staleTime: 30 * 1000,
  })

  // 5. My Posts fallback / supplement
  const myPostsQuery = useQuery({
    queryKey: queryKeys.posts.feed(),
    queryFn: ({ signal }) => postService.getMyPosts({ limit: 20 }, { signal }),
    staleTime: 30 * 1000,
  })

  // 6. Mutation: Create Post
  const createPostMutation = useMutation({
    mutationFn: (payload: CreatePostRequest) => postService.createPost(payload),
    onSuccess: (newPost: PostResponseDto) => {
      toast.success('Đăng bài viết thành công!', {
        description: 'Bài viết của bạn đã được xuất bản trên bảng tin SQB HUST.',
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.activity() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() })
      queryClient.setQueryData(
        queryKeys.posts.feed(),
        (oldData: { items?: PostResponseDto[] } | undefined) => {
          if (!oldData?.items) return { items: [newPost] }
          return { ...oldData, items: [newPost, ...oldData.items] }
        }
      )
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể tạo bài viết. Vui lòng thử lại.'
      toast.error('Lỗi khi đăng bài', { description: errorMsg })
    },
  })

  // 7. Mutation: Toggle React
  const toggleReactMutation = useMutation({
    mutationFn: (params: { targetId: number; reactionType?: 'LIKE' | 'LOVE' | 'WOW' }) =>
      reactionService.toggleReact({
        target_type: 'POST',
        target_id: params.targetId,
        reaction_type: params.reactionType || 'LIKE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.activity() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() })
    },
  })

  // 8. Mutation: Create Comment
  const createCommentMutation = useMutation({
    mutationFn: (payload: CreateCommentRequest) => commentService.createComment(payload),
    onSuccess: (_, variables) => {
      toast.success('Đã gửi bình luận!')
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byPost(variables.target_id),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.activity() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() })
    },
    onError: () => {
      toast.error('Không thể gửi bình luận. Vui lòng thử lại.')
    },
  })

  return {
    currentUser: userProfileQuery.data,
    subjects: subjectsQuery.data || [],
    friends: friendsQuery.data?.items || [],
    activityFeeds: feedQuery.data?.items || [],
    myPosts: myPostsQuery.data?.items || [],
    isLoadingFeed: feedQuery.isLoading || myPostsQuery.isLoading,
    isRefetchingFeed: feedQuery.isRefetching,
    refetchFeed: () => {
      void feedQuery.refetch()
      void myPostsQuery.refetch()
    },
    createPost: createPostMutation.mutateAsync,
    isCreatingPost: createPostMutation.isPending,
    toggleReact: (postId: number) => toggleReactMutation.mutateAsync({ targetId: postId }),
    createComment: createCommentMutation.mutateAsync,
  }
}
