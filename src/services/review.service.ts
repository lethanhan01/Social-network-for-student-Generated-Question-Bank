import api, { requestData, type GlobalResponse } from './api'
import type {
  PendingSessionsResponse,
  ApproveQuestionsRequest,
  ApproveQuestionsResponse,
  RejectQuestionsRequest,
  EditQuestionRequest,
  EditQuestionResponse,
} from '@/types'
import type { LiveSessionDetailReviewResponse } from '@/types/review.types'

export const reviewService = {
  async getPendingSessions(
    params?: { cursor?: string; limit?: number; subject_id?: number },
    options?: { signal?: AbortSignal }
  ): Promise<PendingSessionsResponse> {
    const queryParams: Record<string, string | number> = {}
    if (params?.cursor) queryParams.after = params.cursor
    if (params?.limit != null) queryParams.limit = params.limit
    if (params?.subject_id != null) queryParams.subject_id = params.subject_id

    return requestData<PendingSessionsResponse>(
      api.get<GlobalResponse<PendingSessionsResponse>>('/lecturer/sessions/reviewable', {
        params: queryParams,
        signal: options?.signal,
      })
    )
  },

  async getSessionDetailForReview(
    sessionId: number,
    options?: { signal?: AbortSignal }
  ): Promise<LiveSessionDetailReviewResponse> {
    return requestData<LiveSessionDetailReviewResponse>(
      api.get<GlobalResponse<LiveSessionDetailReviewResponse>>(`/lecturer/sessions/${sessionId}`, {
        signal: options?.signal,
      })
    )
  },

  async approveQuestions(payload: ApproveQuestionsRequest): Promise<ApproveQuestionsResponse> {
    return requestData<ApproveQuestionsResponse>(
      api.post<GlobalResponse<ApproveQuestionsResponse>>('/lecturer/sessions/approve', payload)
    )
  },

  async rejectQuestions(payload: RejectQuestionsRequest): Promise<void> {
    await api.post<GlobalResponse<void>>('/lecturer/sessions/reject', payload)
  },

  async editQuestion(questionId: number, payload: EditQuestionRequest): Promise<EditQuestionResponse> {
    return requestData<EditQuestionResponse>(
      api.put<GlobalResponse<EditQuestionResponse>>(`/lecturer/questions/${questionId}`, payload)
    )
  },

  async completeSessionReview(sessionId: number): Promise<void> {
    await api.post<GlobalResponse<void>>(`/lecturer/sessions/${sessionId}/complete-review`)
  },
}
