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
  MySubmissionDetailResponse,
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
    if (payload.is_error && payload.comment?.trim()) {
      await api.put<GlobalResponse<void>>(`/questions/${questionId}/report`, {
        description: payload.comment.trim(),
      })
    }
    return requestData<RateQuestionResponse>(
      api.post<GlobalResponse<RateQuestionResponse>>(`/questions/${questionId}/rate`, {
        rating: payload.rating,
        ...(payload.comment?.trim() ? { comment: payload.comment.trim() } : {}),
      })
    )
  },

  async getSessionQuestions(
    sessionId: number,
    options?: { signal?: AbortSignal }
  ): Promise<SessionQuestionsResponse> {
    const [response, submissionDetail] = await Promise.all([
      requestData<SessionQuestionsResponse>(
        api.get<GlobalResponse<SessionQuestionsResponse>>(`/sessions/${sessionId}/questions`, {
          signal: options?.signal,
        })
      ),
      requestData<MySubmissionDetailResponse>(
        api.get<GlobalResponse<MySubmissionDetailResponse>>(`/sessions/my-submissions/${sessionId}`, {
          signal: options?.signal,
        })
      ).catch(() => undefined),
    ])

    const statusById = new Map<number, string>()
    for (const q of submissionDetail?.questions ?? []) {
      const qStatus = (q as { status?: string }).status
      if (typeof q.question_id === 'number' && typeof qStatus === 'string') {
        statusById.set(q.question_id, qStatus)
      }
    }

    const filteredQuestions = (response.questions ?? []).filter((q) => {
      const inlineStatus = (q as { status?: string }).status
      const knownStatus = inlineStatus ?? (q.question_id != null ? statusById.get(q.question_id) : undefined)
      return !knownStatus || knownStatus === 'APPROVED'
    })

    if (filteredQuestions.length === (response.questions ?? []).length) {
      return response
    }

    return {
      ...response,
      total_questions: filteredQuestions.length,
      questions: filteredQuestions,
    }
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
    options?: { signal?: AbortSignal },
    params?: { cursor?: string; limit?: number }
  ): Promise<QuestionRatingsResponse> {
    return requestData<QuestionRatingsResponse>(
      api.get<GlobalResponse<QuestionRatingsResponse>>(`/questions/${questionId}/ratings`, {
        signal: options?.signal,
        params,
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
