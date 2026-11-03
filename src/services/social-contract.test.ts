import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { utilityService } from './utility.service'
import { commentService } from './comment.service'
import { postService } from './post.service'
import { feedService } from './feed.service'
import { relationshipService } from './relationship.service'
import { chatService } from './chat.service'

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
  requestData: async (promise: Promise<{ data: { data: unknown } }>) => (await promise).data.data,
}))
describe('Zone 2 OpenAPI transport contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: { data: {} } })
    vi.mocked(api.post).mockResolvedValue({ data: { data: {} } })
    vi.mocked(api.delete).mockResolvedValue({ data: { data: {} } })
  })
  it('sends query and after for search, including additional entity types', async () => {
    await utilityService.search({ keyword: 'Web', type: 'SUBJECT', cursor: '20', limit: 20 })
    expect(api.get).toHaveBeenCalledWith('/search', {
      params: { query: 'Web', type: 'SUBJECT', after: '20', limit: 20 },
      signal: undefined,
    })
  })
  it('sends the polymorphic comment target and parent_comment_id', async () => {
    await commentService.getComments({
      post_id: 12,
      parent_id: 9,
      cursor: '3',
      limit: 20,
      sort: 'oldest',
    })
    expect(api.get).toHaveBeenCalledWith('/comments', {
      params: {
        target_type: 'POST',
        target_id: 12,
        parent_comment_id: 9,
        after: '3',
        limit: 20,
        sort: 'oldest',
      },
      signal: undefined,
    })
  })
  it('uses after on post, relationship, conversation and activity lists', async () => {
    const params = { cursor: '123', limit: 2 }
    await postService.getMyPosts(params)
    await relationshipService.getMyFriends(params)
    await chatService.getConversations(params)
    await feedService.getActivityFeeds(params)
    for (const path of ['/posts/me', '/friendships', '/conversations', '/activity-feeds']) {
      expect(api.get).toHaveBeenCalledWith(path, {
        params: { after: '123', limit: 2 },
        signal: undefined,
      })
    }
  })
  it('sends epoch milliseconds for new feed count', async () => {
    await feedService.getNewFeedCount({ since: '1793000000000' })
    expect(api.get).toHaveBeenCalledWith('/activity-feeds/new-count', {
      params: { since: 1793000000000 },
      signal: undefined,
    })
  })
  it('records only confirmed searches with the documented body', async () => {
    await utilityService.saveSearch('Web')
    expect(api.post).toHaveBeenCalledWith('/search/saved', { query: 'Web' })
  })
  it('recalls messages with a JSON scope body', async () => {
    await chatService.recallMessage(25, { mode: 'EVERYONE' })
    expect(api.delete).toHaveBeenCalledWith('/messages/25', { data: { scope: 'EVERYONE' } })
  })
})
