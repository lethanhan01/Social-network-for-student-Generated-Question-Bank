import api, { requestData, type GlobalResponse } from './api'
import type {
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
} from '@/types/auth.types'
import { getDeviceId } from '@/utils/device'

export const authService = {
  async login(
    payload: Omit<LoginRequest, 'device_id' | 'platform'> & {
      device_id?: string
      platform?: 'WEB' | 'IOS' | 'ANDROID' | 'DESKTOP'
    }
  ): Promise<AuthResponse> {
    const fullPayload: LoginRequest = {
      email: payload.email,
      password: payload.password,
      device_id: payload.device_id || getDeviceId(),
      platform: payload.platform || 'WEB',
      device_name: payload.device_name || 'Web Browser',
    }
    return requestData<AuthResponse>(
      api.post<GlobalResponse<AuthResponse>>('/auth/login', fullPayload)
    )
  },

  async refreshToken(payload: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return requestData<RefreshTokenResponse>(
      api.post<GlobalResponse<RefreshTokenResponse>>('/auth/refresh', payload)
    )
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await api.post<GlobalResponse<void>>('/auth/change-password', payload)
  },

  async logout(options?: { signal?: AbortSignal }): Promise<void> {
    try {
      await api.post<GlobalResponse<void>>('/auth/logout', null, {
        signal: options?.signal,
      })
    } catch {
      // Ignore network errors during logout
    }
  },
}
