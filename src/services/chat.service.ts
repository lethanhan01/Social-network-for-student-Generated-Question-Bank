import api, { requestData, type GlobalResponse } from './api'
import type {
  ConversationListResponseDto,
  ConversationDetailDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  UpdateGroupInfoDto,
  ConversationMemberDto,
  AddGroupMembersRequestDto,
  AddGroupMembersResponseDto,
  LeaveGroupResponseDto,
  LeaveGroupRequestDto,
  UpdateMemberRoleRequestDto,
  UnlockHiddenChatDto,
  MessageListResponseDto,
  DeleteMessageResponseDto,
} from '@/types'

export const chatService = {
  async getConversations(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<ConversationListResponseDto> {
    return requestData<ConversationListResponseDto>(
      api.get<GlobalResponse<ConversationListResponseDto>>('/conversations', {
        params,
        signal: options?.signal,
      })
    )
  },

  async createDirectConversation(payload: CreateDirectConversationDto): Promise<ConversationDetailDto> {
    return requestData<ConversationDetailDto>(
      api.post<GlobalResponse<ConversationDetailDto>>('/conversations/direct', payload)
    )
  },

  async createGroupConversation(payload: CreateGroupConversationDto): Promise<ConversationDetailDto> {
    return requestData<ConversationDetailDto>(
      api.post<GlobalResponse<ConversationDetailDto>>('/conversations/group', payload)
    )
  },

  async updateGroupInfo(id: number, payload: UpdateGroupInfoDto): Promise<ConversationDetailDto> {
    return requestData<ConversationDetailDto>(
      api.put<GlobalResponse<ConversationDetailDto>>(`/conversations/${id}`, payload)
    )
  },

  async getGroupMembers(
    id: number,
    options?: { signal?: AbortSignal }
  ): Promise<ConversationMemberDto[]> {
    return requestData<ConversationMemberDto[]>(
      api.get<GlobalResponse<ConversationMemberDto[]>>(`/conversations/${id}/members`, {
        signal: options?.signal,
      })
    )
  },

  async addGroupMembers(id: number, payload: AddGroupMembersRequestDto): Promise<AddGroupMembersResponseDto> {
    return requestData<AddGroupMembersResponseDto>(
      api.post<GlobalResponse<AddGroupMembersResponseDto>>(`/conversations/${id}/members`, payload)
    )
  },

  async removeGroupMember(id: number, userId: number): Promise<void> {
    await api.delete<GlobalResponse<void>>(`/conversations/${id}/members/${userId}`)
  },

  async updateMemberRole(id: number, userId: number, payload: UpdateMemberRoleRequestDto): Promise<void> {
    await api.put<GlobalResponse<void>>(`/conversations/${id}/members/${userId}/role`, payload)
  },

  async leaveGroup(id: number, payload?: LeaveGroupRequestDto): Promise<LeaveGroupResponseDto> {
    return requestData<LeaveGroupResponseDto>(
      api.post<GlobalResponse<LeaveGroupResponseDto>>(`/conversations/${id}/leave`, payload)
    )
  },

  async hideConversation(id: number): Promise<void> {
    await api.patch<GlobalResponse<void>>(`/conversations/${id}/hide`)
  },

  async unhideConversation(id: number): Promise<void> {
    await api.patch<GlobalResponse<void>>(`/conversations/${id}/unhide`)
  },

  async unlockHiddenConversations(payload: UnlockHiddenChatDto): Promise<void> {
    await api.post<GlobalResponse<void>>('/conversations/hidden/unlock', payload)
  },

  async getHiddenConversations(options?: { signal?: AbortSignal }): Promise<ConversationListResponseDto> {
    return requestData<ConversationListResponseDto>(
      api.get<GlobalResponse<ConversationListResponseDto>>('/conversations/hidden', {
        signal: options?.signal,
      })
    )
  },

  async getMessages(
    id: number,
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<MessageListResponseDto> {
    return requestData<MessageListResponseDto>(
      api.get<GlobalResponse<MessageListResponseDto>>(`/conversations/${id}/messages`, {
        params,
        signal: options?.signal,
      })
    )
  },

  async recallMessage(id: number, params?: { mode?: 'ME' | 'EVERYONE' }): Promise<DeleteMessageResponseDto> {
    return requestData<DeleteMessageResponseDto>(
      api.delete<GlobalResponse<DeleteMessageResponseDto>>(`/messages/${id}`, { params })
    )
  },
}
