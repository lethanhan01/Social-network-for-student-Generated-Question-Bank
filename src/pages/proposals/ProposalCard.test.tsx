import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProposalCard, type ProposalItem } from './ProposalCard'

describe('ProposalCard Component', () => {
  const baseSession: ProposalItem = {
    session_id: 102,
    title: 'Đề xuất: Trắc nghiệm Đa hình & Kế thừa trong C++',
    subject_name: 'Lập trình hướng đối tượng (IT3100)',
    content: 'Đã bổ sung giải thích chi tiết.',
    status: 'APPROVED',
    question_counts: 8,
    created_at: new Date().toISOString(),
  }

  it('renders "Luyện tập ngay" button link when proposal is APPROVED', () => {
    const handleViewDetail = vi.fn()
    render(
      <MemoryRouter>
        <ProposalCard session={baseSession} onViewDetail={handleViewDetail} />
      </MemoryRouter>
    )

    const practiceLink = screen.getByRole('link', { name: /Luyện tập ngay/i })
    expect(practiceLink).toBeInTheDocument()
    expect(practiceLink).toHaveAttribute('href', '/practice/102')
  })

  it('does NOT render "Luyện tập ngay" button link when proposal is PENDING or REJECTED', () => {
    const handleViewDetail = vi.fn()
    const pendingSession: ProposalItem = { ...baseSession, status: 'PENDING' }

    render(
      <MemoryRouter>
        <ProposalCard session={pendingSession} onViewDetail={handleViewDetail} />
      </MemoryRouter>
    )

    expect(screen.queryByRole('link', { name: /Luyện tập ngay/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Xem chi tiết/i })).toBeInTheDocument()
  })
})
