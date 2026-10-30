import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { relationshipService } from '@/services/relationship.service'
import { queryKeys } from '@/lib/query-keys'
import type {
  SendFriendRequestDto,
  AcceptFriendRequestDto,
  DeclineFriendRequestDto,
} from '@/types/relationship.types'

export function useFriendsQuery(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.relationships.friends(params as Record<string, unknown>),
    queryFn: ({ signal }) => relationshipService.getMyFriends(params, { signal }),
  })
}

export function useReceivedFriendRequestsQuery(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.relationships.receivedRequests(params as Record<string, unknown>),
    queryFn: ({ signal }) => relationshipService.getReceivedFriendRequests(params, { signal }),
  })
}

export function useSentFriendRequestsQuery(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.relationships.sentRequests(params as Record<string, unknown>),
    queryFn: ({ signal }) => relationshipService.getSentFriendRequests(params, { signal }),
  })
}

export function useBlockedUsersQuery(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.relationships.blocked(params as Record<string, unknown>),
    queryFn: ({ signal }) => relationshipService.getBlockedUsers(params, { signal }),
  })
}

export function useRelationshipStatsQuery(userId: number) {
  return useQuery({
    queryKey: queryKeys.users.relationshipStats(userId),
    queryFn: ({ signal }) => relationshipService.getRelationshipStats(userId, { signal }),
    enabled: Number.isFinite(userId) && userId > 0,
  })
}

export function useSendFriendRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SendFriendRequestDto) => relationshipService.sendFriendRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.relationships.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useAcceptFriendRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AcceptFriendRequestDto) => relationshipService.acceptFriendRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.relationships.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.activity() })
    },
  })
}

export function useDeclineFriendRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeclineFriendRequestDto) =>
      relationshipService.declineFriendRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.relationships.all })
    },
  })
}

export function useUnfriendMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (friendId: number) => relationshipService.unfriend(friendId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.relationships.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useBlockUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetUserId: number) => relationshipService.blockUser(targetUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.relationships.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.activity() })
    },
  })
}

export function useUnblockUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetUserId: number) => relationshipService.unblockUser(targetUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.relationships.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
