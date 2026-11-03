import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { sessionService } from '@/services/session.service'
import i18n from '@/lib/i18n'
import ProposalsPage from './ProposalsPage'

describe('Open proposal composer', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('vi')
    vi.spyOn(sessionService, 'getMySubmissions').mockResolvedValue({ contents: [] })
    vi.spyOn(sessionService, 'getMyEnrolledSubjects').mockResolvedValue([{ subject_id: 7, code: 'IT', name: 'Course' }])
    vi.spyOn(sessionService, 'getMyEnrolledCourseClasses').mockResolvedValue([
      { course_class_id: 101, subject_id: 7, subject_code: 'IT', subject_name: 'Course', can_propose: true },
    ])
  })
  afterEach(() => vi.unstubAllGlobals())
  it('opens the form even when randomUUID is unavailable in the browser', async () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })
    const user = userEvent.setup()
    renderWithQueryClient(<MemoryRouter><ProposalsPage /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'Tạo đề xuất' }))
    expect(await screen.findByRole('dialog', { name: 'Tạo đề xuất câu hỏi' })).toBeInTheDocument()
    expect(await screen.findByRole('combobox', { name: 'Lớp học phần' })).toBeInTheDocument()
  })
})
