import api, { requestData, type GlobalResponse } from './api'
import type {
  CreatePostRequest,
  PostResponseDto,
  UpdatePostRequest,
  UpdatePostResponseDto,
  DeletePostResponseDto,
  UpdateLecturerNoteRequest,
  CursorResponseVideoPostItemDto,
  CursorResponsePostResponseDto,
} from '@/types'

export const postService = {
  async createPost(payload: CreatePostRequest): Promise<PostResponseDto> {
    return requestData<PostResponseDto>(
      api.post<GlobalResponse<PostResponseDto>>('/posts', payload)
    )
  },

  async getPostById(id: number, options?: { signal?: AbortSignal }): Promise<PostResponseDto> {
    return requestData<PostResponseDto>(
      api.get<GlobalResponse<PostResponseDto>>(`/posts/${id}`, {
        signal: options?.signal,
      })
    )
  },

  async updatePost(id: number, payload: UpdatePostRequest): Promise<UpdatePostResponseDto> {
    return requestData<UpdatePostResponseDto>(
      api.put<GlobalResponse<UpdatePostResponseDto>>(`/posts/${id}`, payload)
    )
  },

  async deletePost(id: number): Promise<DeletePostResponseDto> {
    return requestData<DeletePostResponseDto>(
      api.delete<GlobalResponse<DeletePostResponseDto>>(`/posts/${id}`)
    )
  },

  async updateLecturerNote(id: number, payload: UpdateLecturerNoteRequest): Promise<void> {
    await api.put<GlobalResponse<void>>(`/posts/${id}/lecturer-notes`, payload)
  },

  async getVideoPosts(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<CursorResponseVideoPostItemDto> {
    return requestData<CursorResponseVideoPostItemDto>(
      api.get<GlobalResponse<CursorResponseVideoPostItemDto>>('/video-posts', {
        params,
        signal: options?.signal,
      })
    )
  },

  async getUserPosts(
    userId: number,
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<CursorResponsePostResponseDto> {
    return requestData<CursorResponsePostResponseDto>(
      api.get<GlobalResponse<CursorResponsePostResponseDto>>(`/users/${userId}/posts`, {
        params,
        signal: options?.signal,
      })
    )
  },

  async getMyPosts(
    params?: { cursor?: string; limit?: number },
    options?: { signal?: AbortSignal }
  ): Promise<CursorResponsePostResponseDto> {
    return requestData<CursorResponsePostResponseDto>(
      api.get<GlobalResponse<CursorResponsePostResponseDto>>('/posts/me', {
        params,
        signal: options?.signal,
      })
    )
  },
}
