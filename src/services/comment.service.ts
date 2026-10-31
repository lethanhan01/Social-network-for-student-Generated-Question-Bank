import api, { requestData, type GlobalResponse } from './api'
import type {
  CreateCommentRequest,
  CommentResponseDto,
  UpdateCommentRequest,
  CursorResponseCommentResponseDto,
} from '@/types'

export interface GetCommentsParams {
  target_type?: 'POST' | 'SESSION' | 'QUESTION'
  target_id?: number
  parent_comment_id?: number
  after?: number
  limit?: number
  sort?: 'newest' | 'oldest'
  // Backward compatibility alias fields
  post_id?: number
  parent_id?: number
  cursor?: string
}

export const commentService = {
  async getComments(
    params: GetCommentsParams,
    options?: { signal?: AbortSignal }
  ): Promise<CursorResponseCommentResponseDto> {
    const targetType = params.target_type ?? (params.post_id ? 'POST' : undefined)
    const targetId = params.target_id ?? params.post_id
    const parentCommentId = params.parent_comment_id ?? params.parent_id
    const after = params.after ?? (params.cursor ? Number(params.cursor) : undefined)

    const queryParams: Record<string, unknown> = {
      limit: params.limit ?? 50,
      sort: params.sort ?? 'newest',
    }
    if (targetType) queryParams.target_type = targetType
    if (targetId) queryParams.target_id = targetId
    if (parentCommentId) queryParams.parent_comment_id = parentCommentId
    if (after) queryParams.after = after

    return requestData<CursorResponseCommentResponseDto>(
      api.get<GlobalResponse<CursorResponseCommentResponseDto>>('/comments', {
        params: queryParams,
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
