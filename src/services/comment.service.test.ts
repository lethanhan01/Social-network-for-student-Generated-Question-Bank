import { describe, it, expect, vi, beforeEach } from 'vitest'
import { commentService } from './comment.service'
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

describe('commentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps polymorphic query parameters correctly in getComments', async () => {
    const mockResponse = {
      items: [{ id: 1, content: 'Bình luận 1' }],
      has_more: false,
    }

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockResponse },
    })

    const result = await commentService.getComments({
      target_type: 'POST',
      target_id: 60,
      parent_comment_id: 10,
      limit: 50,
      sort: 'newest',
    })

    expect(api.get).toHaveBeenCalledWith('/comments', {
      params: {
        limit: 50,
        sort: 'newest',
        target_type: 'POST',
        target_id: 60,
        parent_comment_id: 10,
      },
      signal: undefined,
    })
    expect(result).toEqual(mockResponse)
  })

  it('maintains backward compatibility with post_id and parent_id aliases in getComments', async () => {
    const mockResponse = {
      items: [],
      has_more: false,
    }

    vi.mocked(api.get).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockResponse },
    })

    const result = await commentService.getComments({
      post_id: 60,
      parent_id: 5,
      cursor: '12',
    })

    expect(api.get).toHaveBeenCalledWith('/comments', {
      params: {
        limit: undefined,
        sort: 'newest',
        target_type: 'POST',
        target_id: 60,
        parent_comment_id: 5,
        after: '12',
      },
      signal: undefined,
    })
    expect(result).toEqual(mockResponse)
  })

  it('calls createComment with payload and unwraps response', async () => {
    const mockCreated = { id: 10, content: 'Comment test' }
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockCreated },
    })

    const result = await commentService.createComment({
      target_type: 'POST',
      target_id: 60,
      content: 'Comment test',
    })

    expect(api.post).toHaveBeenCalledWith('/comments', {
      target_type: 'POST',
      target_id: 60,
      content: 'Comment test',
    })
    expect(result).toEqual(mockCreated)
  })

  it('calls updateComment and deleteComment correctly', async () => {
    const mockUpdated = { id: 10, content: 'Updated' }
    vi.mocked(api.put).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: mockUpdated },
    })
    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { code: '1000', message: 'SUCCESS', data: null },
    })

    const updated = await commentService.updateComment(10, { content: 'Updated' })
    await commentService.deleteComment(10)

    expect(api.put).toHaveBeenCalledWith('/comments/10', { content: 'Updated' })
    expect(api.delete).toHaveBeenCalledWith('/comments/10')
    expect(updated).toEqual(mockUpdated)
  })
})

