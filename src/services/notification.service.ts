import api, { requestData, type GlobalResponse } from './api'
import type {
  NotificationListResponseDto,
  PushSettingsResponseDto,
  UpdatePushSettingsRequestDto,
} from '@/types'

export interface NotificationItem {
  id?: string | number
  title: string
  message: string
  type?: string
  metadata?: Record<string, unknown>
  read?: boolean
  created_at?: string
}

export const notificationService = {
  async getNotifications(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<NotificationListResponseDto> {
    return requestData<NotificationListResponseDto>(
      api.get<GlobalResponse<NotificationListResponseDto>>('/notifications', {
        params,
        signal: options?.signal,
      })
    )
  },

  async markAsRead(id: number): Promise<void> {
    await api.post<GlobalResponse<void>>(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.post<GlobalResponse<void>>('/notifications/read-all')
  },

  async getPushSettings(options?: { signal?: AbortSignal }): Promise<PushSettingsResponseDto> {
    return requestData<PushSettingsResponseDto>(
      api.get<GlobalResponse<PushSettingsResponseDto>>('/settings/push', {
        signal: options?.signal,
      })
    )
  },

  async updatePushSettings(payload: UpdatePushSettingsRequestDto): Promise<PushSettingsResponseDto> {
    return requestData<PushSettingsResponseDto>(
      api.put<GlobalResponse<PushSettingsResponseDto>>('/settings/push', payload)
    )
  },
}
