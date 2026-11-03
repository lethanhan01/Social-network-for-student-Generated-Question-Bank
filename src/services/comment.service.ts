import api, { requestData, type GlobalResponse } from './api'
import type {
  CreateCommentRequest,
  CommentResponseDto,
  UpdateCommentRequest,
  CursorResponseCommentResponseDto,
} from '@/types'

export const commentService = {
  async getComments(
    params: {
      post_id?: number
      parent_id?: number
      target_type?: 'POST'
      target_id?: number
      parent_comment_id?: number
      cursor?: string
      limit?: number
      sort?: 'newest' | 'oldest'
    },
    options?: { signal?: AbortSignal }
  ): Promise<CursorResponseCommentResponseDto> {
    return requestData<CursorResponseCommentResponseDto>(
      api.get<GlobalResponse<CursorResponseCommentResponseDto>>('/comments', {
        params: {
          target_type: params.target_type ?? 'POST',
          target_id: params.target_id ?? params.post_id,
          parent_comment_id: params.parent_comment_id ?? params.parent_id,
          after: params.cursor,
          limit: params.limit,
          sort: params.sort ?? 'newest',
        },
        signal: options?.signal,
      })
    )
  },

  async createComment(payload: CreateCommentRequest): Promise<CommentResponseDto> {
    return requestData<CommentResponseDto>(
      api.post<GlobalResponse<CommentResponseDto>>('/comments', payload)
    )
  },

  async updateComment(
    commentId: number,
    payload: UpdateCommentRequest
  ): Promise<CommentResponseDto> {
    return requestData<CommentResponseDto>(
      api.put<GlobalResponse<CommentResponseDto>>(`/comments/${commentId}`, payload)
    )
  },

  async deleteComment(commentId: number): Promise<void> {
    await api.delete<GlobalResponse<void>>(`/comments/${commentId}`)
  },
}
