import api, { requestData, type GlobalResponse } from './api'
import type {
  CheckInStatusResponse,
  CheckInResponse,
  LeaderboardResponse,
  GamePredictionResponse,
  Game1PredictionRequest,
  Game2PredictionRequest,
  Game4PredictionRequest,
  Game6SubmitRequest,
  Game6ActiveSessionResponse,
  MyPredictionsResponse,
  MyCourseClassPredictionDto,
  ReviewErrorRequest,
  BadgeResponseDto,
  UserBadgeResponseDto,
} from '@/types'

export const gamificationService = {
  async getCheckInStatus(options?: { signal?: AbortSignal }): Promise<CheckInStatusResponse> {
    return requestData<CheckInStatusResponse>(
      api.get<GlobalResponse<CheckInStatusResponse>>('/games/check-in', {
        signal: options?.signal,
      })
    )
  },

  async checkInDaily(): Promise<CheckInResponse> {
    return requestData<CheckInResponse>(
      api.post<GlobalResponse<CheckInResponse>>('/games/check-in')
    )
  },

  async getLeaderboard(
    params?: { cursor?: string; limit?: number; type?: 'WEEKLY' | 'MONTHLY' | 'ALL_TIME' },
    options?: { signal?: AbortSignal }
  ): Promise<LeaderboardResponse> {
    return requestData<LeaderboardResponse>(
      api.get<GlobalResponse<LeaderboardResponse>>('/games/leaderboard', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getActiveGameSession(options?: { signal?: AbortSignal }): Promise<Game6ActiveSessionResponse> {
    return requestData<Game6ActiveSessionResponse>(
      api.get<GlobalResponse<Game6ActiveSessionResponse>>('/games/prediction/active-session', {
        signal: options?.signal,
      })
    )
  },

  async getClassesForGame1(options?: { signal?: AbortSignal }): Promise<MyCourseClassPredictionDto[]> {
    return requestData<MyCourseClassPredictionDto[]>(
      api.get<GlobalResponse<MyCourseClassPredictionDto[]>>('/games/prediction/game-1/classes', {
        signal: options?.signal,
      })
    )
  },

  async predictGame1(payload: Game1PredictionRequest): Promise<GamePredictionResponse> {
    return requestData<GamePredictionResponse>(
      api.post<GlobalResponse<GamePredictionResponse>>('/games/prediction/participants', payload)
    )
  },

  async predictGame2(payload: Game2PredictionRequest): Promise<GamePredictionResponse> {
    return requestData<GamePredictionResponse>(
      api.post<GlobalResponse<GamePredictionResponse>>('/games/prediction/approved-questions', payload)
    )
  },

  async predictGame4(payload: Game4PredictionRequest): Promise<GamePredictionResponse> {
    return requestData<GamePredictionResponse>(
      api.post<GlobalResponse<GamePredictionResponse>>('/games/prediction/bank-size', payload)
    )
  },

  async submitGame6(payload: Game6SubmitRequest): Promise<GamePredictionResponse> {
    return requestData<GamePredictionResponse>(
      api.post<GlobalResponse<GamePredictionResponse>>('/games/prediction/submit', payload)
    )
  },

  async getMyPredictions(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<MyPredictionsResponse> {
    return requestData<MyPredictionsResponse>(
      api.get<GlobalResponse<MyPredictionsResponse>>('/games/my-predictions', {
        params,
        signal: options?.signal,
      })
    )
  },

  async reviewErrorGame5(
    questionId: number,
    ratingUserId: number,
    payload: ReviewErrorRequest
  ): Promise<string> {
    return requestData<string>(
      api.post<GlobalResponse<string>>(
        `/questions/${questionId}/ratings/${ratingUserId}/review-error`,
        payload
      )
    )
  },

  async getAllBadges(options?: { signal?: AbortSignal }): Promise<BadgeResponseDto[]> {
    return requestData<BadgeResponseDto[]>(
      api.get<GlobalResponse<BadgeResponseDto[]>>('/badges', {
        signal: options?.signal,
      })
    )
  },

  async getBadgeById(badgeId: number, options?: { signal?: AbortSignal }): Promise<BadgeResponseDto> {
    return requestData<BadgeResponseDto>(
      api.get<GlobalResponse<BadgeResponseDto>>(`/badges/${badgeId}`, {
        signal: options?.signal,
      })
    )
  },

  async getMyBadges(options?: { signal?: AbortSignal }): Promise<UserBadgeResponseDto[]> {
    return requestData<UserBadgeResponseDto[]>(
      api.get<GlobalResponse<UserBadgeResponseDto[]>>('/badges/me', {
        signal: options?.signal,
      })
    )
  },

  async getUserBadges(userId: number, options?: { signal?: AbortSignal }): Promise<UserBadgeResponseDto[]> {
    return requestData<UserBadgeResponseDto[]>(
      api.get<GlobalResponse<UserBadgeResponseDto[]>>(`/badges/users/${userId}`, {
        signal: options?.signal,
      })
    )
  },
}
