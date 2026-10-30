import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { relationshipService } from '@/services/relationship.service'
import FriendsPage from './FriendsPage'

vi.mock('@/services/relationship.service', () => ({
  relationshipService: {
    getMyFriends: vi.fn(),
    getReceivedFriendRequests: vi.fn(),
    getSentFriendRequests: vi.fn(),
    getBlockedUsers: vi.fn(),
    acceptFriendRequest: vi.fn(),
    declineFriendRequest: vi.fn(),
    unfriend: vi.fn(),
    unblockUser: vi.fn(),
  },
}))

describe('FriendsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(relationshipService.getMyFriends).mockResolvedValue({
      items: [
        {
          user_id: 501,
          full_name: 'Đặng Tuấn Anh',
          mutual_friends_count: 4,
        },
      ],
      total_friends: 1,
    })

    vi.mocked(relationshipService.getReceivedFriendRequests).mockResolvedValue({
      items: [
        {
          requester: { user_id: 601, full_name: 'Vũ Thị Hạnh' },
          mutual_friends_count: 2,
        },
      ],
      total_pending: 1,
    })

    vi.mocked(relationshipService.getSentFriendRequests).mockResolvedValue({
      items: [],
      total_sent: 0,
    })

    vi.mocked(relationshipService.getBlockedUsers).mockResolvedValue({
      items: [],
      total_blocked: 0,
    })
  })

  it('renders friends list and tabs', async () => {
    renderWithQueryClient(
      <BrowserRouter>
        <FriendsPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Bạn bè & Kết nối/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bạn bè/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lời mời nhận được/i })).toBeInTheDocument()
    expect(await screen.findByText(/Đặng Tuấn Anh/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Nhắn tin/i })).toBeInTheDocument()
  })

  it('does not show an empty friends list when the request fails', async () => {
    vi.mocked(relationshipService.getMyFriends).mockRejectedValue(new Error('Friends unavailable'))
    renderWithQueryClient(<BrowserRouter><FriendsPage /></BrowserRouter>)
    expect(await screen.findByRole('alert')).toHaveTextContent('Friends unavailable')
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
    expect(screen.queryByText('Bạn chưa có người bạn nào trong danh sách.')).not.toBeInTheDocument()
  })
})
