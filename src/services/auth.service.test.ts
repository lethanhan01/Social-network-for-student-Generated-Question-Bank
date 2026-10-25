import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './auth.service'
import api from './api'

vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api')>()
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login sends payload with default platform and device_id and unwraps response', async () => {
    const mockAuthResponse = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
      user_id: 1,
      email: 'test@sis.hust.edu.vn',
      username: 'teststudent',
      full_name: 'Test Student',
      role: 'STUDENT',
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: mockAuthResponse,
      },
    })

    const result = await authService.login({
      email: 'test@sis.hust.edu.vn',
      password: 'password123',
    })

    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        email: 'test@sis.hust.edu.vn',
        password: 'password123',
        platform: 'WEB',
      })
    )
    expect(result).toEqual(mockAuthResponse)
  })

  it('refreshToken calls /auth/refresh with refresh_token and unwraps response', async () => {
    const mockRefreshResponse = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: mockRefreshResponse,
      },
    })

    const result = await authService.refreshToken({ refresh_token: 'old-token' })
    expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refresh_token: 'old-token' })
    expect(result).toEqual(mockRefreshResponse)
  })

  it('changePassword posts to /auth/change-password', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: null },
    })

    await authService.changePassword({
      old_password: 'oldPassword1',
      new_password: 'newPassword1',
    })

    expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
      old_password: 'oldPassword1',
      new_password: 'newPassword1',
    })
  })

  it('logout calls /auth/logout and silently handles network errors', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Network offline'))

    // Should not throw
    await expect(authService.logout()).resolves.toBeUndefined()
    expect(api.post).toHaveBeenCalledWith('/auth/logout', null, expect.any(Object))
  })
})
