import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requestData, type GlobalResponse } from './api'
import { useAuthStore } from '@/stores/authStore'
import * as deviceUtil from '@/utils/device'

describe('api core service & requestData helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
  })

  it('unwraps data correctly from GlobalResponse envelope via requestData', async () => {
    const mockResponse: { data: GlobalResponse<{ id: number; title: string }> } = {
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: { id: 42, title: 'Test Item' },
      },
    }

    const result = await requestData(Promise.resolve(mockResponse))
    expect(result).toEqual({ id: 42, title: 'Test Item' })
  })

  it('rejects when underlying promise throws an error', async () => {
    const failedPromise = Promise.reject(new Error('Network Error'))
    await expect(requestData(failedPromise)).rejects.toThrow('Network Error')
  })

  it('provides stable deviceId via getDeviceId utility', () => {
    const deviceId1 = deviceUtil.getDeviceId()
    const deviceId2 = deviceUtil.getDeviceId()
    expect(deviceId1).toBeDefined()
    expect(deviceId1).toBe(deviceId2)
    expect(deviceId1.startsWith('web-')).toBe(true)
  })
})
