import api, { requestData, type GlobalResponse } from './api'
import type {
  GenerateExamRequest,
  ExamDetailResponse,
  ExamListResponse,
  ExportResponse,
} from '@/types'

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
    return requestData<ExamListResponse>(
      api.get<GlobalResponse<ExamListResponse>>('/exams/my-exams', {
        params,
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
    params?: { format?: 'DOCX' | 'PDF' },
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
    params: { subject_id: number; format?: 'DOCX' | 'PDF' },
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
