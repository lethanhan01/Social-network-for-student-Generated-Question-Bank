import api, { requestData, type GlobalResponse } from './api'
import type {
  CursorResponseActivityFeedItemDto,
  NewFeedCountResponseDto,
} from '@/types'

export const feedService = {
  async getActivityFeeds(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<CursorResponseActivityFeedItemDto> {
    return requestData<CursorResponseActivityFeedItemDto>(
      api.get<GlobalResponse<CursorResponseActivityFeedItemDto>>('/activity-feeds', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getNewFeedCount(
    params?: { since?: string },
    options?: { signal?: AbortSignal }
  ): Promise<NewFeedCountResponseDto> {
    return requestData<NewFeedCountResponseDto>(
      api.get<GlobalResponse<NewFeedCountResponseDto>>('/activity-feeds/new-count', {
        params,
        signal: options?.signal,
      })
    )
  },
}
