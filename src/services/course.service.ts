import api, { requestData, type GlobalResponse } from './api'
import type {
  SubjectResponse,
  CourseClassResponse,
  CreateCourseClassRequest,
  ClassStudentResponse,
  AssignStudentsRequest,
  AssignStudentsResponse,
  LecturerSummaryResponse,
} from '@/types'

export const courseService = {
  async getSubjects(options?: { signal?: AbortSignal }): Promise<SubjectResponse[]> {
    return requestData<SubjectResponse[]>(
      api.get<GlobalResponse<SubjectResponse[]>>('/subjects', {
        signal: options?.signal,
      })
    )
  },

  async getCourseClasses(
    params?: { semester_id?: number },
    options?: { signal?: AbortSignal }
  ): Promise<CourseClassResponse[]> {
    return requestData<CourseClassResponse[]>(
      api.get<GlobalResponse<CourseClassResponse[]>>('/lecturer/course-classes', {
        params,
        signal: options?.signal,
      })
    )
  },

  async createCourseClass(payload: CreateCourseClassRequest): Promise<CourseClassResponse> {
    return requestData<CourseClassResponse>(
      api.post<GlobalResponse<CourseClassResponse>>('/lecturer/course-classes', payload)
    )
  },

  async getCourseClassDetail(
    courseClassId: number,
    options?: { signal?: AbortSignal }
  ): Promise<CourseClassResponse> {
    return requestData<CourseClassResponse>(
      api.get<GlobalResponse<CourseClassResponse>>(`/lecturer/course-classes/${courseClassId}`, {
        signal: options?.signal,
      })
    )
  },

  async getClassStudents(
    courseClassId: number,
    options?: { signal?: AbortSignal }
  ): Promise<ClassStudentResponse[]> {
    return requestData<ClassStudentResponse[]>(
      api.get<GlobalResponse<ClassStudentResponse[]>>(
        `/lecturer/course-classes/${courseClassId}/students`,
        { signal: options?.signal }
      )
    )
  },

  async assignStudents(
    courseClassId: number,
    payload: AssignStudentsRequest
  ): Promise<AssignStudentsResponse> {
    return requestData<AssignStudentsResponse>(
      api.post<GlobalResponse<AssignStudentsResponse>>(
        `/lecturer/course-classes/${courseClassId}/students`,
        payload
      )
    )
  },

  async getMyEnrolledClasses(options?: { signal?: AbortSignal }): Promise<CourseClassResponse[]> {
    return requestData<CourseClassResponse[]>(
      api.get<GlobalResponse<CourseClassResponse[]>>('/lecturer/course-classes/my-classes', {
        signal: options?.signal,
      })
    )
  },

  async getLecturers(options?: { signal?: AbortSignal }): Promise<LecturerSummaryResponse[]> {
    return requestData<LecturerSummaryResponse[]>(
      api.get<GlobalResponse<LecturerSummaryResponse[]>>('/lecturer/course-classes/lecturers', {
        signal: options?.signal,
      })
    )
  },
}
