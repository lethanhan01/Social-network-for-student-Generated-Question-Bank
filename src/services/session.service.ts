import api, { requestData, type GlobalResponse } from './api'
import type {
  ProposeSessionRequest,
  ProposeSessionResponse,
  SubmissionsResponse,
  MySubmissionDetailResponse,
  UpdateSubmissionSessionRequest,
  SubjectResponse,
} from '@/types'

export interface EnrolledSubjectResponse extends SubjectResponse {
  course_class_id?: number
  class_code?: string
  subject_code?: string
  subject_name?: string
  semester_id?: number
  semester_name?: string
  active_semester?: boolean
  can_propose?: boolean
}

export const sessionService = {
  async proposeSession(payload: ProposeSessionRequest): Promise<ProposeSessionResponse> {
    return requestData<ProposeSessionResponse>(
      api.post<GlobalResponse<ProposeSessionResponse>>('/sessions/propose', payload)
    )
  },

  async getMySubmissions(
    params?: { cursor?: string; limit?: number; status?: string },
    options?: { signal?: AbortSignal }
  ): Promise<SubmissionsResponse> {
    return requestData<SubmissionsResponse>(
      api.get<GlobalResponse<SubmissionsResponse>>('/sessions/my-submissions', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getMySubmissionDetail(
    sessionId: number,
    options?: { signal?: AbortSignal }
  ): Promise<MySubmissionDetailResponse> {
    return requestData<MySubmissionDetailResponse>(
      api.get<GlobalResponse<MySubmissionDetailResponse>>(`/sessions/my-submissions/${sessionId}`, {
        signal: options?.signal,
      })
    )
  },

  async updateMySubmissionSession(
    sessionId: number,
    payload: UpdateSubmissionSessionRequest
  ): Promise<void> {
    await api.put<GlobalResponse<void>>(`/sessions/my-submissions/${sessionId}`, payload)
  },

  async deleteMySubmissionSession(sessionId: number): Promise<void> {
    await api.delete<GlobalResponse<void>>(`/sessions/my-submissions/${sessionId}`)
  },

  async getMyEnrolledSubjects(options?: { signal?: AbortSignal }): Promise<EnrolledSubjectResponse[]> {
    return requestData<EnrolledSubjectResponse[]>(
      api.get<GlobalResponse<EnrolledSubjectResponse[]>>('/sessions/my-enrolled-course-classes', {
        signal: options?.signal,
      })
    )
  },
}
