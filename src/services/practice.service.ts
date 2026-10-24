import api, { requestData, type GlobalResponse } from './api'
import type {
  RateQuestionRequest,
  RateQuestionResponse,
  AnswerQuestionRequest,
  AnswerQuestionResponse,
  SubmissionsResponse,
  SessionQuestionsResponse,
  QuestionStatisticsResponse,
  QuestionRatingsResponse,
} from '@/types'

export const practiceService = {
  async answerQuestion(
    questionId: number,
    payload: AnswerQuestionRequest
  ): Promise<AnswerQuestionResponse> {
    return requestData<AnswerQuestionResponse>(
      api.post<GlobalResponse<AnswerQuestionResponse>>(`/questions/${questionId}/answer`, payload)
    )
  },

  async rateQuestion(
    questionId: number,
    payload: RateQuestionRequest
  ): Promise<RateQuestionResponse> {
    return requestData<RateQuestionResponse>(
      api.post<GlobalResponse<RateQuestionResponse>>(`/questions/${questionId}/rate`, payload)
    )
  },

  async getSessionQuestions(
    sessionId: number,
    options?: { signal?: AbortSignal }
  ): Promise<SessionQuestionsResponse> {
    return requestData<SessionQuestionsResponse>(
      api.get<GlobalResponse<SessionQuestionsResponse>>(`/sessions/${sessionId}/questions`, {
        signal: options?.signal,
      })
    )
  },

  async getQuestionStatistics(
    questionId: number,
    options?: { signal?: AbortSignal }
  ): Promise<QuestionStatisticsResponse> {
    return requestData<QuestionStatisticsResponse>(
      api.get<GlobalResponse<QuestionStatisticsResponse>>(`/questions/${questionId}/statistics`, {
        signal: options?.signal,
      })
    )
  },

  async getQuestionRatings(
    questionId: number,
    options?: { signal?: AbortSignal }
  ): Promise<QuestionRatingsResponse> {
    return requestData<QuestionRatingsResponse>(
      api.get<GlobalResponse<QuestionRatingsResponse>>(`/questions/${questionId}/ratings`, {
        signal: options?.signal,
      })
    )
  },

  async getUserProposedSessions(
    userId: number,
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<SubmissionsResponse> {
    return requestData<SubmissionsResponse>(
      api.get<GlobalResponse<SubmissionsResponse>>(`/users/${userId}/sessions`, {
        params,
        signal: options?.signal,
      })
    )
  },
}
