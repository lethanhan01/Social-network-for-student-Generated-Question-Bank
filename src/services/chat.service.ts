import api, { requestData, type GlobalResponse } from './api'
import { afterParams } from '@/lib/pagination'
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
  MessageListResponseDto,
  DeleteMessageResponseDto,
} from '@/types'

export const chatService = {
  async getConversations(
    params?: { after?: number; cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<ConversationListResponseDto> {
    return requestData<ConversationListResponseDto>(
      api.get<GlobalResponse<ConversationListResponseDto>>('/conversations', {
        params: afterParams(params),
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

  async getMessages(
    id: number,
    params?: { after?: number; cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<MessageListResponseDto> {
    try {
      return await requestData<MessageListResponseDto>(
        api.get<GlobalResponse<MessageListResponseDto>>(`/conversations/${id}/messages`, {
          params: afterParams(params),
          signal: options?.signal,
        })
      )
    } catch (error) {
      if (params?.after == null && params?.cursor == null && !options?.signal?.aborted) {
        const fallback = await this.recoverMessagesFallback(id, params?.limit ?? 20, options?.signal)
        if (fallback) return fallback
      }
      throw error
    }
  },

  async recoverMessagesFallback(
    id: number,
    limit: number,
    signal?: AbortSignal
  ): Promise<MessageListResponseDto | null> {
    try {
      const convsRes = await api.get<GlobalResponse<ConversationListResponseDto>>('/conversations', {
        params: { limit: 50 },
        signal,
      })
      const conv = convsRes.data.data?.items?.find((c) => c.conversation_id === id)
      const lastMsg = conv?.last_message

      if (!lastMsg?.message_id) {
        return {
          conversation_id: id,
          conversation_type: conv?.type,
          messages: [],
          pagination: { has_next: false },
        }
      }

      // Cấp 1: Probe after = lastMsg.message_id + 1 (Lấy toàn bộ tin nhắn kể cả lastMsg từ DB)
      try {
        const probeRes = await api.get<GlobalResponse<MessageListResponseDto>>(
          `/conversations/${id}/messages`,
          {
            params: { after: lastMsg.message_id + 1, limit },
            signal,
          }
        )
        const msgs = probeRes.data?.data?.messages
        if (msgs?.some((m) => m.message_id === lastMsg.message_id)) {
          return probeRes.data.data
        }
      } catch {
        // Tiếp tục dự phòng cấp 2 nếu server từ chối id + 1
      }

      // Cấp 2: Probe after = lastMsg.message_id và ghép lastMsg
      try {
        const probeRes = await api.get<GlobalResponse<MessageListResponseDto>>(
          `/conversations/${id}/messages`,
          {
            params: { after: lastMsg.message_id, limit },
            signal,
          }
        )
        if (probeRes.data?.data?.messages) {
          const data = probeRes.data.data
          const exists = data.messages?.some((m) => m.message_id === lastMsg.message_id)
          if (!exists && lastMsg.content) {
            const lastMsgMeta = lastMsg as typeof lastMsg & {
              sender_id?: number
              sender_name?: string
              avatar_url?: string
            }
            data.messages = [
              {
                message_id: lastMsg.message_id,
                content: lastMsg.content,
                message_type: lastMsg.message_type as 'TEXT' | 'IMAGE' | 'VIDEO' | 'GIF',
                created_at: lastMsg.created_at,
                sender_id: lastMsgMeta.sender_id,
                sender_name: lastMsgMeta.sender_name || conv?.display_name || 'Tin nhắn mới',
                avatar_url: lastMsgMeta.avatar_url || conv?.display_avatar_url || undefined,
              },
              ...(data.messages || []),
            ]
          }
          return data
        }
      } catch {
        // Bỏ qua nếu lỗi mạng toàn phần
      }
    } catch {
      // Bỏ qua nếu không lấy được danh sách hội thoại
    }
    return null
  },

  async recallMessage(id: number, params?: { mode?: 'ME' | 'EVERYONE' }): Promise<DeleteMessageResponseDto> {
    return requestData<DeleteMessageResponseDto>(
      api.delete<GlobalResponse<DeleteMessageResponseDto>>(`/messages/${id}`, {
        data: { scope: params?.mode ?? 'ME' },
      })
    )
  },
}
