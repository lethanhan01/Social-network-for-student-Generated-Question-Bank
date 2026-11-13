import api, { requestData, type GlobalResponse } from './api'
import type {
  ProfileResponse,
  UpdateProfileRequest,
} from '@/types/user.types'
import type {
  PushSettingsResponseDto,
  UpdatePushSettingsRequestDto,
} from '@/types/notification.types'

export const userService = {
  async getMyProfile(options?: { signal?: AbortSignal }): Promise<ProfileResponse> {
    return requestData<ProfileResponse>(
      api.get<GlobalResponse<ProfileResponse>>('/users/me', {
        signal: options?.signal,
      })
    )
  },

  async updateMyProfile(payload: UpdateProfileRequest): Promise<ProfileResponse> {
    return requestData<ProfileResponse>(
      api.put<GlobalResponse<ProfileResponse>>('/users/me', payload)
    )
  },

  async deleteMyProfile(): Promise<void> {
    await api.delete<GlobalResponse<void>>('/users/me')
  },

  async getUserProfile(userId: number, options?: { signal?: AbortSignal }): Promise<ProfileResponse> {
    return requestData<ProfileResponse>(
      api.get<GlobalResponse<ProfileResponse>>(`/users/${userId}`, {
        signal: options?.signal,
      })
    )
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
