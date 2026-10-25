import api, { requestData, type GlobalResponse } from './api'
import type {
  CreateCommentRequest,
  CommentResponseDto,
  UpdateCommentRequest,
  CursorResponseCommentResponseDto,
} from '@/types'

export const commentService = {
  async getComments(
    params: { post_id: number; parent_id?: number; cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<CursorResponseCommentResponseDto> {
    return requestData<CursorResponseCommentResponseDto>(
      api.get<GlobalResponse<CursorResponseCommentResponseDto>>('/comments', {
        params,
        signal: options?.signal,
      })
    )
  },

  async createComment(payload: CreateCommentRequest): Promise<CommentResponseDto> {
    return requestData<CommentResponseDto>(
      api.post<GlobalResponse<CommentResponseDto>>('/comments', payload)
    )
  },

  async updateComment(commentId: number, payload: UpdateCommentRequest): Promise<CommentResponseDto> {
    return requestData<CommentResponseDto>(
      api.put<GlobalResponse<CommentResponseDto>>(`/comments/${commentId}`, payload)
    )
  },

  async deleteComment(commentId: number): Promise<void> {
    await api.delete<GlobalResponse<void>>(`/comments/${commentId}`)
  },
}
