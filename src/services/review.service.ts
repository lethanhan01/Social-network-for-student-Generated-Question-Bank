import api, { requestData, type GlobalResponse } from './api'
import type {
  PendingSessionsResponse,
  SessionDetailReviewResponse,
  ApproveQuestionsRequest,
  ApproveQuestionsResponse,
  RejectQuestionsRequest,
  EditQuestionRequest,
  EditQuestionResponse,
} from '@/types'

export const reviewService = {
  async getPendingSessions(
    params?: { cursor?: string; limit?: number; subject_id?: number },
    options?: { signal?: AbortSignal }
  ): Promise<PendingSessionsResponse> {
    return requestData<PendingSessionsResponse>(
      api.get<GlobalResponse<PendingSessionsResponse>>('/sessions/pending', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getSessionDetailForReview(
    sessionId: number,
    options?: { signal?: AbortSignal }
  ): Promise<SessionDetailReviewResponse> {
    return requestData<SessionDetailReviewResponse>(
      api.get<GlobalResponse<SessionDetailReviewResponse>>(`/sessions/${sessionId}`, {
        signal: options?.signal,
      })
    )
  },

  async approveQuestions(payload: ApproveQuestionsRequest): Promise<ApproveQuestionsResponse> {
    return requestData<ApproveQuestionsResponse>(
      api.post<GlobalResponse<ApproveQuestionsResponse>>('/sessions/approve', payload)
    )
  },

  async rejectQuestions(payload: RejectQuestionsRequest): Promise<void> {
    await api.post<GlobalResponse<void>>('/sessions/reject', payload)
  },

  async editQuestion(questionId: number, payload: EditQuestionRequest): Promise<EditQuestionResponse> {
    return requestData<EditQuestionResponse>(
      api.put<GlobalResponse<EditQuestionResponse>>(`/questions/${questionId}`, payload)
    )
  },

  async completeSessionReview(sessionId: number): Promise<void> {
    await api.post<GlobalResponse<void>>(`/sessions/${sessionId}/complete-review`)
  },
}
