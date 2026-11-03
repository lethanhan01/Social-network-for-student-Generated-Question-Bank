import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getNextCursor } from '@/lib/pagination'
import { relationshipService } from '@/services/relationship.service'
import { utilityService } from '@/services/utility.service'
import type { AuthorDto, CursorPaginationDto } from '@/types'

export type ConnectionEntry = AuthorDto & {
  requester?: AuthorDto
  receiver?: AuthorDto
  mutual_friends_count?: number
}

export type ConnectionTab = 'FRIENDS' | 'RECEIVED' | 'SENT' | 'BLOCKED' | 'FOLLOWING' | 'FOLLOWERS'
export function useConnectionsQuery(tab: ConnectionTab) {
  return useInfiniteQuery({
    queryKey: queryKeys.relationships.infinite(tab),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({
      pageParam,
      signal,
    }): Promise<{ items?: ConnectionEntry[]; pagination?: CursorPaginationDto }> => {
      const params = { cursor: pageParam, limit: 20 }
      const options = { signal }
      switch (tab) {
        case 'RECEIVED':
          return relationshipService.getReceivedFriendRequests(params, options)
        case 'SENT':
          return relationshipService.getSentFriendRequests(params, options)
        case 'BLOCKED':
          return relationshipService.getBlockedUsers(params, options)
        case 'FOLLOWING':
          return relationshipService.getFollowing(params, options)
        case 'FOLLOWERS':
          return relationshipService.getFollowers(params, options)
        default:
          return relationshipService.getMyFriends(params, options)
      }
    },
    getNextPageParam: (last) => getNextCursor(last.pagination),
  })
}

export function useFollowMutation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, following }: { id: number; following: boolean }) =>
      following ? relationshipService.unfollowUser(id) : relationshipService.followUser(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.users.all })
      void client.invalidateQueries({ queryKey: queryKeys.relationships.all })
      void client.invalidateQueries({ queryKey: queryKeys.feed.all })
    },
  })
}

export type SearchType = 'ALL' | 'POST' | 'USER' | 'QUESTION' | 'SESSION' | 'SUBJECT'
export function useInfiniteSearchQuery(keyword: string, type: SearchType) {
  return useInfiniteQuery({
    queryKey: queryKeys.search.results({ keyword, type, infinite: true }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      utilityService.search({ keyword, type, cursor: pageParam, limit: 20 }, { signal }),
    getNextPageParam: (last) => getNextCursor(last.pagination),
    enabled: keyword.trim().length > 0,
  })
}

export function useRecordSearchMutation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (keyword: string) => utilityService.saveSearch(keyword),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.search.saved() })
    },
  })
}
