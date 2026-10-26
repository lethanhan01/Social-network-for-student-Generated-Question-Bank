import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubjectCard } from './SubjectCard'

describe('SubjectCard Component', () => {
  const sampleSubject = {
    subject_id: 1,
    code: 'IT3080',
    name: 'Mạng máy tính',
  }

  it('renders subject code, name, and department cleanly for lookup', () => {
    render(<SubjectCard subject={sampleSubject} />)

    expect(screen.getByText('IT3080')).toBeInTheDocument()
    expect(screen.getByText('Mạng máy tính')).toBeInTheDocument()
    expect(screen.getByText(/Trường CNTT & TT/i)).toBeInTheDocument()
    expect(screen.getByText('Đang giảng dạy')).toBeInTheDocument()
  })

  it('does NOT render proposal or practice action buttons', () => {
    render(<SubjectCard subject={sampleSubject} />)

    expect(screen.queryByRole('link', { name: /Phiên đề xuất/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Luyện tập/i })).not.toBeInTheDocument()
  })
})
