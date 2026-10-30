import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { sessionService } from '@/services/session.service'
import { PracticeSessionSelector } from './PracticeSessionSelector'

describe('PracticeSessionSelector Component', () => {
  beforeEach(() => {
    vi.spyOn(sessionService, 'getMySubmissions').mockResolvedValue({
      contents: [],
    })
  })

  it('renders the approved sessions list with status badges and questions count', async () => {
    const handleSelect = vi.fn()
    renderWithQueryClient(
      <PracticeSessionSelector onSelectSession={handleSelect} />
    )

    expect(
      screen.getByText('Chọn phiên câu hỏi đã được phê duyệt để bắt đầu luyện tập trắc nghiệm')
    ).toBeInTheDocument()

    expect(
      await screen.findByText('Đề xuất: Trắc nghiệm Đa hình & Kế thừa trong C++')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Luyện tập: Kiến trúc Mạng & Giao thức TCP/IP')
    ).toBeInTheDocument()
  })

  it('triggers onSelectSession callback with session ID when clicking start button', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    renderWithQueryClient(
      <PracticeSessionSelector onSelectSession={handleSelect} />
    )

    const startButtons = await screen.findAllByRole('button', { name: /Bắt đầu làm bài/i })
    expect(startButtons.length).toBeGreaterThan(0)

    await user.click(startButtons[0])
    expect(handleSelect).toHaveBeenCalledWith(102)
  })

  it('filters sessions by subject code when clicking a subject filter button', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    renderWithQueryClient(
      <PracticeSessionSelector onSelectSession={handleSelect} />
    )

    await screen.findByText('Luyện tập: Kiến trúc Mạng & Giao thức TCP/IP')

    const it3080Filter = screen.getByRole('button', { name: /^IT3080/i })
    await user.click(it3080Filter)

    expect(
      screen.getByText('Luyện tập: Kiến trúc Mạng & Giao thức TCP/IP')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Luyện tập: Định lý Ma trận & Hệ phương trình tuyến tính')
    ).not.toBeInTheDocument()
  })
})
