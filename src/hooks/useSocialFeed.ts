import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { courseService } from '@/services/course.service'
import { relationshipService } from '@/services/relationship.service'
import { useAuthStore } from '@/stores/authStore'
import { useMyProfileQuery } from './queries/useProfileQuery'
import { useCreatePostMutation } from './queries/usePostsQuery'

/** Shared sidebar data; the page owns its feed's infinite query. */
export function useSocialFeed() {
  const isAuthReady = useAuthStore((s) => s.isAuthenticated && Boolean(s.token))
  const profile = useMyProfileQuery()
  const subjects = useQuery({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    enabled: isAuthReady,
    staleTime: 300_000,
  })
  const friends = useQuery({
    queryKey: queryKeys.relationships.friends(),
    queryFn: ({ signal }) => relationshipService.getMyFriends(undefined, { signal }),
    enabled: isAuthReady,
    staleTime: 60_000,
  })
  const create = useCreatePostMutation()
  return {
    currentUser: profile.data,
    subjects: subjects.data ?? [],
    friends: friends.data?.items ?? [],
    createPost: create.mutateAsync,
    isCreatingPost: create.isPending,
  }
}
