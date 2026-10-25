import api, { requestData, type GlobalResponse } from './api'
import type {
  DeviceListResponse,
  SyncFidRequest,
  UnregisterFidRequest,
} from '@/types/device.types'

export const deviceService = {
  async getMyDevices(options?: { signal?: AbortSignal }): Promise<DeviceListResponse> {
    return requestData<DeviceListResponse>(
      api.get<GlobalResponse<DeviceListResponse>>('/devices', {
        signal: options?.signal,
      })
    )
  },

  async deleteDevice(deviceId: string): Promise<void> {
    await api.delete<GlobalResponse<void>>(`/devices/${deviceId}`)
  },

  async revokeDevice(deviceId: string): Promise<void> {
    await api.post<GlobalResponse<void>>(`/devices/${deviceId}/logout`)
  },

  async syncFid(payload: SyncFidRequest): Promise<void> {
    await api.post<GlobalResponse<void>>('/devices/fid', payload)
  },

  async unregisterFid(payload: UnregisterFidRequest): Promise<void> {
    await api.post<GlobalResponse<void>>('/devices/fid/unregister', payload)
  },
}
