import api, { requestData, type GlobalResponse } from './api'
import type {
  SendFriendRequestDto,
  FriendshipResponseDto,
  DeclineFriendRequestDto,
  AcceptFriendRequestDto,
  FollowResponseDto,
  UnfollowResponseDto,
  BlockResponseDto,
  UnblockResponseDto,
  RelationshipStatsResponseDto,
  FriendListResponseDto,
  FriendRequestSentListResponseDto,
  FriendRequestReceivedListResponseDto,
  FollowingListResponseDto,
  FollowerListResponseDto,
  BlockedListResponseDto,
} from '@/types/relationship.types'

export const relationshipService = {
  async sendFriendRequest(payload: SendFriendRequestDto): Promise<FriendshipResponseDto> {
    return requestData<FriendshipResponseDto>(
      api.post<GlobalResponse<FriendshipResponseDto>>('/friendships/request', payload)
    )
  },

  async acceptFriendRequest(payload: AcceptFriendRequestDto): Promise<FriendshipResponseDto> {
    return requestData<FriendshipResponseDto>(
      api.post<GlobalResponse<FriendshipResponseDto>>('/friendships/accept', payload)
    )
  },

  async declineFriendRequest(payload: DeclineFriendRequestDto): Promise<void> {
    await api.post<GlobalResponse<void>>('/friendships/decline', payload)
  },

  async unfriend(friendId: number): Promise<void> {
    await api.delete<GlobalResponse<void>>(`/friendships/${friendId}`)
  },

  async getMyFriends(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<FriendListResponseDto> {
    return requestData<FriendListResponseDto>(
      api.get<GlobalResponse<FriendListResponseDto>>('/friendships', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getSentFriendRequests(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<FriendRequestSentListResponseDto> {
    return requestData<FriendRequestSentListResponseDto>(
      api.get<GlobalResponse<FriendRequestSentListResponseDto>>('/friendships/requests/sent', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getReceivedFriendRequests(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<FriendRequestReceivedListResponseDto> {
    return requestData<FriendRequestReceivedListResponseDto>(
      api.get<GlobalResponse<FriendRequestReceivedListResponseDto>>('/friendships/requests/received', {
        params,
        signal: options?.signal,
      })
    )
  },

  async followUser(targetUserId: number): Promise<FollowResponseDto> {
    return requestData<FollowResponseDto>(
      api.post<GlobalResponse<FollowResponseDto>>(`/follows/${targetUserId}`)
    )
  },

  async unfollowUser(targetUserId: number): Promise<UnfollowResponseDto> {
    return requestData<UnfollowResponseDto>(
      api.delete<GlobalResponse<UnfollowResponseDto>>(`/follows/${targetUserId}`)
    )
  },

  async getFollowers(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<FollowerListResponseDto> {
    return requestData<FollowerListResponseDto>(
      api.get<GlobalResponse<FollowerListResponseDto>>('/follows/followers', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getFollowing(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<FollowingListResponseDto> {
    return requestData<FollowingListResponseDto>(
      api.get<GlobalResponse<FollowingListResponseDto>>('/follows/following', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getRelationshipStats(
    userId: number,
    options?: { signal?: AbortSignal }
  ): Promise<RelationshipStatsResponseDto> {
    return requestData<RelationshipStatsResponseDto>(
      api.get<GlobalResponse<RelationshipStatsResponseDto>>(`/users/${userId}/relationship-stats`, {
        signal: options?.signal,
      })
    )
  },

  async blockUser(targetUserId: number): Promise<BlockResponseDto> {
    return requestData<BlockResponseDto>(
      api.post<GlobalResponse<BlockResponseDto>>(`/blocks/${targetUserId}`)
    )
  },

  async unblockUser(targetUserId: number): Promise<UnblockResponseDto> {
    return requestData<UnblockResponseDto>(
      api.delete<GlobalResponse<UnblockResponseDto>>(`/blocks/${targetUserId}`)
    )
  },

  async getBlockedUsers(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<BlockedListResponseDto> {
    return requestData<BlockedListResponseDto>(
      api.get<GlobalResponse<BlockedListResponseDto>>('/blocks', {
        params,
        signal: options?.signal,
      })
    )
  },
}
