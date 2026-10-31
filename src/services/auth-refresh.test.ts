import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import api from './api'
import { useAuthStore } from '@/stores/authStore'

const originalAdapter = api.defaults.adapter
function unauthorized(config: InternalAxiosRequestConfig): never {
  throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    status: 401, statusText: 'Unauthorized', headers: {}, config,
    data: { code: '9998', message: 'Invalid credentials', data: null },
  })
}
describe('Authentication refresh boundaries', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth({ user_id: 1, roles: ['STUDENT'] }, 'expired', 'expired-refresh')
  })
  afterEach(() => {
    api.defaults.adapter = originalAdapter
    useAuthStore.getState().clearAuth()
    vi.restoreAllMocks()
  })
  it('TC-AUTH-01: returns login failure directly without replaying with a stale refresh token', async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => unauthorized(config))
    api.defaults.adapter = adapter
    await expect(api.post('/auth/login', { email: 'test@example.test', password: 'test-only' }))
      .rejects.toMatchObject({ response: { status: 401 } })
    expect(adapter).toHaveBeenCalledTimes(1)
    expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBeUndefined()
  }, 2000)
  it('TC-AUTH-02: rejects and clears the expired session when refresh also fails instead of deadlocking', async () => {
    const urls: Array<string | undefined> = []
    api.defaults.adapter = async (config) => {
      urls.push(config.url)
      return unauthorized(config)
    }
    await expect(api.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } })
    expect(urls).toEqual(['/users/me', '/auth/refresh'])
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
  }, 2000)
})
