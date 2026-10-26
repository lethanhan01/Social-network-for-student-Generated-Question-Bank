import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { utilityService } from '@/services/utility.service'
import SearchPage from './SearchPage'

vi.mock('@/services/utility.service', () => ({
  utilityService: {
    search: vi.fn(),
    getSavedAndTrendingSearches: vi.fn(),
    deleteSavedSearch: vi.fn(),
  },
}))

describe('SearchPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(utilityService.getSavedAndTrendingSearches).mockResolvedValue({
      saved_searches: [
        { saved_search_id: 1, query_text: 'Giải tích 1' },
      ],
      trending_searches: ['Đề thi giữa kỳ', 'Vật lý đại cương'],
    })
  })

  it('renders search history and trending when query is empty', async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Tìm kiếm toàn cục/i })).toBeInTheDocument()
    expect(await screen.findByText(/Giải tích 1/i)).toBeInTheDocument()
    expect(screen.getByText(/#Đề thi giữa kỳ/i)).toBeInTheDocument()
  })

  it('renders search results when query parameter is provided', async () => {
    vi.mocked(utilityService.search).mockResolvedValue({
      items: [
        {
          type: 'USER',
          user: {
            user_id: 88,
            full_name: 'Phạm Nhật Nam',
            role: 'STUDENT',
            school_faculty: 'Viện Điện tử - Viễn thông',
          },
        },
      ],
      total_hits: 1,
    })

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/search?q=Nam']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Phạm Nhật Nam/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Xem hồ sơ/i })).toBeInTheDocument()
  })

  it('shows a retry action instead of an empty result when search fails', async () => {
    vi.mocked(utilityService.search).mockRejectedValue(new Error('Search unavailable'))
    renderWithQueryClient(<MemoryRouter initialEntries={['/search?q=Nam']}><SearchPage /></MemoryRouter>)
    expect(await screen.findByRole('alert')).toHaveTextContent('Search unavailable')
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
    expect(screen.queryByText('Không tìm thấy kết quả phù hợp')).not.toBeInTheDocument()
  })
})
