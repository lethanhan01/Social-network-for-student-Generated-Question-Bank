import api, { requestData, type GlobalResponse } from './api'
import type {
  GenerateExamRequest,
  ExamDetailResponse,
  ExamListResponse,
  ExportResponse,
} from '@/types'

export type ExamExportFormat = 'PDF' | 'EXCEL'

export const examService = {
  async generateExam(payload: GenerateExamRequest): Promise<ExamDetailResponse> {
    return requestData<ExamDetailResponse>(
      api.post<GlobalResponse<ExamDetailResponse>>('/exams/generate', payload)
    )
  },

  async getMyExams(
    params?: { cursor?: string; limit?: number; subject_id?: number },
    options?: { signal?: AbortSignal }
  ): Promise<ExamListResponse> {
    const queryParams: Record<string, string | number> = {}
    if (params?.cursor) queryParams.after = params.cursor
    if (params?.limit != null) queryParams.limit = params.limit
    if (params?.subject_id != null) queryParams.subject_id = params.subject_id

    return requestData<ExamListResponse>(
      api.get<GlobalResponse<ExamListResponse>>('/exams/my-exams', {
        params: queryParams,
        signal: options?.signal,
      })
    )
  },

  async getExamDetail(
    examId: number,
    options?: { signal?: AbortSignal }
  ): Promise<ExamDetailResponse> {
    return requestData<ExamDetailResponse>(
      api.get<GlobalResponse<ExamDetailResponse>>(`/exams/${examId}`, {
        signal: options?.signal,
      })
    )
  },

  async exportExam(
    examId: number,
    params?: { format?: ExamExportFormat; include_answer_key?: boolean },
    options?: { signal?: AbortSignal }
  ): Promise<ExportResponse> {
    return requestData<ExportResponse>(
      api.get<GlobalResponse<ExportResponse>>(`/exams/${examId}/export`, {
        params,
        signal: options?.signal,
      })
    )
  },

  async exportQuestions(
    params: { subject_id: number; format?: ExamExportFormat; include_answer_key?: boolean },
    options?: { signal?: AbortSignal }
  ): Promise<ExportResponse> {
    return requestData<ExportResponse>(
      api.get<GlobalResponse<ExportResponse>>('/lecturer/questions/export', {
        params,
        signal: options?.signal,
      })
    )
  },
}
