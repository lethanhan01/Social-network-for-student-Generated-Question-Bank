import { describe, it, expect, vi, beforeEach } from 'vitest'
import { postService } from './post.service'
import api from './api'

vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api')>()
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('postService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createPost sends payload to /posts and unwraps response', async () => {
    const mockPost = {
      id: 101,
      content: 'Hello World Post',
      created_at: '2026-10-24T12:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockPost },
    })

    const result = await postService.createPost({
      content: 'Hello World Post',
      visibility: 'PUBLIC',
    })

    expect(api.post).toHaveBeenCalledWith('/posts', {
      content: 'Hello World Post',
      visibility: 'PUBLIC',
    })
    expect(result).toEqual(mockPost)
  })

  it('getPostById passes id and signal to api.get and unwraps response', async () => {
    const mockPost = { id: 102, content: 'Single Post' }
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockPost },
    })

    const controller = new AbortController()
    const result = await postService.getPostById(102, { signal: controller.signal })

    expect(api.get).toHaveBeenCalledWith('/posts/102', { signal: controller.signal })
    expect(result).toEqual(mockPost)
  })

  it('updatePost sends PUT request to /posts/:id', async () => {
    const mockUpdated = { id: 102, content: 'Updated content' }
    vi.mocked(api.put).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockUpdated },
    })

    const result = await postService.updatePost(102, {
      content: 'Updated content',
      visibility: 'PUBLIC',
    })
    expect(api.put).toHaveBeenCalledWith('/posts/102', {
      content: 'Updated content',
      visibility: 'PUBLIC',
    })
    expect(result).toEqual(mockUpdated)
  })

  it('deletePost sends DELETE request to /posts/:id', async () => {
    const mockDeleted = { success: true }
    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockDeleted },
    })

    const result = await postService.deletePost(102)
    expect(api.delete).toHaveBeenCalledWith('/posts/102')
    expect(result).toEqual(mockDeleted)
  })

  it('getVideoPosts passes query parameters and signal to /video-posts', async () => {
    const mockCursorResponse = {
      items: [{ id: 1, video_url: 'https://example.com/video.mp4' }],
      next_cursor: 'cursor-123',
      has_more: false,
    }

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockCursorResponse },
    })

    const controller = new AbortController()
    const result = await postService.getVideoPosts(
      { cursor: 'prev-cursor', limit: 10 },
      { signal: controller.signal }
    )

    expect(api.get).toHaveBeenCalledWith('/video-posts', {
      params: { cursor: 'prev-cursor', limit: 10 },
      signal: controller.signal,
    })
    expect(result).toEqual(mockCursorResponse)
  })
})
