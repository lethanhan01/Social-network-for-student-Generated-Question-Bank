import api, { requestData, type GlobalResponse } from './api'
import type { ReactRequest, ReactResponseDto } from '@/types'

export const reactionService = {
  async toggleReact(payload: ReactRequest): Promise<ReactResponseDto> {
    return requestData<ReactResponseDto>(
      api.post<GlobalResponse<ReactResponseDto>>('/react', payload)
    )
  },
}
