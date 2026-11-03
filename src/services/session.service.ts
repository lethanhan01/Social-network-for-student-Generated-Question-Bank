import api, { requestData, type GlobalResponse } from './api'
import type { EnrolledCourseClass } from '@/types/academic.types'
import type {
  ProposeSessionRequest,
  ProposeSessionResponse,
  SubmissionsResponse,
  MySubmissionDetailResponse,
  UpdateSubmissionSessionRequest,
  SubjectResponse,
} from '@/types'

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
    payload: UpdateSubmissionSessionRequest & { course_class_id?: number }
  ): Promise<void> {
    await api.put<GlobalResponse<void>>(`/sessions/my-submissions/${sessionId}`, payload)
  },

  async deleteMySubmissionSession(sessionId: number): Promise<void> {
    await api.delete<GlobalResponse<void>>(`/sessions/my-submissions/${sessionId}`)
  },

  async getMyEnrolledSubjects(options?: { signal?: AbortSignal }): Promise<SubjectResponse[]> {
    const classes = await sessionService.getMyEnrolledCourseClasses(options)
    return Array.from(new Map(classes.filter((item) => item.subject_id != null).map((item) => [item.subject_id,
      { subject_id: item.subject_id, code: item.subject_code, name: item.subject_name }])).values())
  },

  async getMyEnrolledCourseClasses(options?: { signal?: AbortSignal }): Promise<EnrolledCourseClass[]> {
    return requestData<EnrolledCourseClass[]>(api.get<GlobalResponse<EnrolledCourseClass[]>>(
      '/sessions/my-enrolled-course-classes', { signal: options?.signal }))
  },
}
