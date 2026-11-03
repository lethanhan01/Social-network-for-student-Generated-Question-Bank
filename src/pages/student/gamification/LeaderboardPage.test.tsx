import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import LeaderboardPage from './LeaderboardPage'
import { gamificationService } from '@/services/gamification.service'

vi.mock('@/services/gamification.service', () => ({
  gamificationService: {
    getCheckInStatus: vi.fn(),
    checkInDaily: vi.fn(),
    getLeaderboard: vi.fn(),
  },
}))

const mockedService = vi.mocked(gamificationService)

function renderPage(initialEntry = '/gamification/leaderboard') {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LeaderboardPage />
    </MemoryRouter>
  )
}

describe('LeaderboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedService.getLeaderboard.mockResolvedValue({
      entries: [
        { rank: 1, user_id: 1, full_name: 'Nguyễn Văn A', user_code: '20230001', total_points: 980 },
        { rank: 2, user_id: 2, full_name: 'Lê Thành An', user_code: '20235631', total_points: 870, is_current_user: true },
      ],
      my_rank: { rank: 2, total_points: 870, top_percent: 5, total_participants: 40 },
    })
  })

  it('renders heading, leaderboard entries and my rank', async () => {
    mockedService.getCheckInStatus.mockResolvedValue({ current_streak: 3, has_checked_in_today: false })
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: /Điểm danh & Bảng vinh danh/i })).toBeInTheDocument()
    expect((await screen.findAllByText('Nguyễn Văn A')).length).toBeGreaterThan(0)
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Điểm danh ngay/i })).toBeEnabled()
  })

  it('disables the check-in button once the user has checked in today', async () => {
    mockedService.getCheckInStatus.mockResolvedValue({ current_streak: 7, has_checked_in_today: true })
    renderPage()

    expect(await screen.findByRole('button', { name: /Đã điểm danh/i })).toBeDisabled()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('requests the leaderboard for the period from the URL', async () => {
    mockedService.getCheckInStatus.mockResolvedValue({ current_streak: 0, has_checked_in_today: false })
    renderPage('/gamification/leaderboard?period=MONTHLY')

    await screen.findAllByText('Nguyễn Văn A')
    expect(mockedService.getLeaderboard).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'MONTHLY' }),
      expect.anything()
    )
  })
})
