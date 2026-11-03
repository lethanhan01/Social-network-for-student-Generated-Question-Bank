import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { practiceService } from '@/services/practice.service'
import { sessionService } from '@/services/session.service'
import i18n from '@/lib/i18n'
import PracticePage from './practice/PracticePage'
import QuestionAnalyticsPage from './questions/QuestionAnalyticsPage'
import ProposalsPage from './proposals/ProposalsPage'
import { positiveId, type AcademicSession } from '@/types/academic.types'

describe('Academic screen regressions', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('vi')
    vi.spyOn(sessionService, 'getMyEnrolledSubjects').mockResolvedValue([])
  })
  it('does not overwrite a rejected server status with the pending URL filter', async () => {
    const session: AcademicSession = { session_id: 1, title: 'Rejected session', status: 'REJECTED' }
    vi.spyOn(sessionService, 'getMySubmissions').mockResolvedValue({ contents: [
      session,
    ] })
    renderWithQueryClient(<MemoryRouter initialEntries={['/proposals?status=PENDING']}><ProposalsPage /></MemoryRouter>)
    expect(await screen.findByText(/Chưa có đề xuất phù hợp/)).toBeInTheDocument()
    expect(screen.queryByText('Rejected session')).not.toBeInTheDocument()
  })
  it('rejects out-of-range question URLs instead of declaring completion', async () => {
    vi.spyOn(practiceService, 'getSessionQuestions').mockResolvedValue({ questions: [{ question_id: 3, content: 'Question' }] })
    const list = vi.spyOn(sessionService, 'getMySubmissions')
    renderWithQueryClient(<MemoryRouter initialEntries={['/practice/1?question=999']}><Routes>
      <Route path="/practice/:sessionId" element={<PracticePage />} />
    </Routes></MemoryRouter>)
    expect(await screen.findByText('Đường dẫn không hợp lệ.')).toBeInTheDocument()
    expect(screen.queryByText('Bạn đã hoàn thành các câu hỏi trong phiên!')).not.toBeInTheDocument()
    expect(list).not.toHaveBeenCalled()
  })
  it('returns from analytics to the same question index', async () => {
    vi.spyOn(practiceService, 'getQuestionStatistics').mockResolvedValue({ total_answer: 2 })
    vi.spyOn(practiceService, 'getQuestionRatings').mockResolvedValue({ items: [] })
    vi.spyOn(practiceService, 'getSessionQuestions').mockResolvedValue({ questions: [] })
    renderWithQueryClient(<MemoryRouter initialEntries={['/questions/3/analytics?sessionId=1&question=4']}><Routes>
      <Route path="/questions/:id/analytics" element={<QuestionAnalyticsPage />} />
    </Routes></MemoryRouter>)
    expect(await screen.findByText('Chưa có đánh giá nào.')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Luyện tập' }).some((link) => link.getAttribute('href') === '/practice/1?question=4')).toBe(true)
  })
  it('accepts only decimal positive IDs in routes', () => {
    expect(positiveId('1e3')).toBeUndefined()
    expect(positiveId('0x10')).toBeUndefined()
    expect(positiveId('123')).toBe(123)
  })
  it('loads the next page of community ratings without dropping the first page', async () => {
    vi.spyOn(practiceService, 'getQuestionStatistics').mockResolvedValue({})
    const ratings = vi.spyOn(practiceService, 'getQuestionRatings')
      .mockResolvedValueOnce({ items: [{ user_id: 1, comment: 'First review' }], pagination: { has_next: true, after: 7 } })
      .mockResolvedValueOnce({ items: [{ user_id: 2, comment: 'Next review' }], pagination: { has_next: false } })
    const user = userEvent.setup()
    renderWithQueryClient(<MemoryRouter initialEntries={['/questions/3/analytics']}><Routes>
      <Route path="/questions/:id/analytics" element={<QuestionAnalyticsPage />} />
    </Routes></MemoryRouter>)
    expect(await screen.findByText('First review')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Xem thêm' }))
    expect(await screen.findByText('Next review')).toBeInTheDocument()
    expect(screen.getByText('First review')).toBeInTheDocument()
    expect(ratings).toHaveBeenLastCalledWith(3, expect.objectContaining({ signal: expect.any(AbortSignal) }), { cursor: '7', limit: 20 })
  })
})
