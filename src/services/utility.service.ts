import api, { requestData, type GlobalResponse } from './api'
import type {
  GlobalSearchResponseDto,
  SavedAndTrendingSearchesResponseDto,
  CreateReportRequestDto,
  ReportResponseDto,
  PresignMediaRequest,
  PresignMediaResponse,
  MediaUploadResponse,
  MediaVerifyRequest,
  MediaVerifyResponse,
  AiRefineRequest,
  AiRefineResponse,
  AiApplyRequest,
} from '@/types'

export const utilityService = {
  async search(
    params: { keyword: string; type?: 'ALL' | 'POST' | 'QUESTION' | 'USER'; cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<GlobalSearchResponseDto> {
    return requestData<GlobalSearchResponseDto>(
      api.get<GlobalResponse<GlobalSearchResponseDto>>('/search', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getSavedAndTrendingSearches(
    options?: { signal?: AbortSignal }
  ): Promise<SavedAndTrendingSearchesResponseDto> {
    return requestData<SavedAndTrendingSearchesResponseDto>(
      api.get<GlobalResponse<SavedAndTrendingSearchesResponseDto>>('/search/saved', {
        signal: options?.signal,
      })
    )
  },

  async deleteSavedSearch(id: number): Promise<void> {
    await api.delete<GlobalResponse<void>>(`/search/saved/${id}`)
  },

  async createReport(payload: CreateReportRequestDto): Promise<ReportResponseDto> {
    return requestData<ReportResponseDto>(
      api.post<GlobalResponse<ReportResponseDto>>('/report', payload)
    )
  },

  async getPresignedUrls(payload: PresignMediaRequest): Promise<PresignMediaResponse> {
    return requestData<PresignMediaResponse>(
      api.post<GlobalResponse<PresignMediaResponse>>('/medias/presign', payload)
    )
  },

  async uploadDirectMedia(
    file: File,
    purpose: 'AVATAR' | 'COVER' | 'QUESTION' | 'POST' | 'COMMENT' | 'CHAT' | 'DOCUMENT'
  ): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return requestData<MediaUploadResponse>(
      api.post<GlobalResponse<MediaUploadResponse>>('/medias/upload', formData, {
        params: { purpose },
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    )
  },

  async verifyMedias(payload: MediaVerifyRequest): Promise<MediaVerifyResponse> {
    return requestData<MediaVerifyResponse>(
      api.post<GlobalResponse<MediaVerifyResponse>>('/medias/verify', payload)
    )
  },

  async aiRefineQuestion(questionId: number, payload: AiRefineRequest): Promise<AiRefineResponse> {
    return requestData<AiRefineResponse>(
      api.post<GlobalResponse<AiRefineResponse>>(`/questions/${questionId}/ai-refine`, payload)
    )
  },

  async aiApplyRefinement(questionId: number, payload: AiApplyRequest): Promise<void> {
    await api.post<GlobalResponse<void>>(`/questions/${questionId}/ai-apply`, payload)
  },
}
