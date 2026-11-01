import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SocialLeftSidebar } from './SocialLeftSidebar'
import type { ProfileResponse, SubjectResponse } from '@/types'

const mockUser: ProfileResponse = {
  user_id: 1,
  email: 'student@sis.hust.edu.vn',
  full_name: 'Nguyễn Văn An',
  student_lecturer_code: '20201234',
  role: 'STUDENT',
  bio: 'Sinh viên CNTT HUST',
}

const mockSubjects: SubjectResponse[] = [
  {
    subject_id: 101,
    name: 'Công nghệ Web',
    code: 'IT4409',
  },
  {
    subject_id: 102,
    name: 'Cấu trúc dữ liệu & Giải thuật',
    code: 'IT3011',
  },
]

describe('SocialLeftSidebar', () => {
  it('renders user summary with full name, student code and role badge', () => {
    render(
      <MemoryRouter>
        <SocialLeftSidebar user={mockUser} subjects={mockSubjects} />
      </MemoryRouter>
    )

    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByText(/MSSV: 20201234/i)).toBeInTheDocument()
    expect(screen.getByText('Sinh viên')).toBeInTheDocument()
    expect(screen.getByText(/Sinh viên CNTT HUST/i)).toBeInTheDocument()
  })

  it('renders all feature shortcuts links', () => {
    render(
      <MemoryRouter>
        <SocialLeftSidebar user={mockUser} subjects={mockSubjects} />
      </MemoryRouter>
    )

    const shortcutsNav = screen.getByRole('navigation', { name: /lối tắt tính năng/i })
    expect(shortcutsNav).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /tất cả bảng tin/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tổng quan học tập/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ngân hàng đề thi/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /điểm danh & vinh danh/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tìm kiếm toàn cục/i })).toBeInTheDocument()
  })

  it('renders subjects list and calls onSelectSubject when clicked', () => {
    const onSelect = vi.fn()
    render(
      <MemoryRouter>
        <SocialLeftSidebar
          user={mockUser}
          subjects={mockSubjects}
          selectedSubjectId={undefined}
          onSelectSubject={onSelect}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Công nghệ Web')).toBeInTheDocument()
    expect(screen.getByText('IT4409')).toBeInTheDocument()

    const subjectBtn = screen.getByRole('button', { name: /công nghệ web/i })
    fireEvent.click(subjectBtn)

    expect(onSelect).toHaveBeenCalledWith(101)
  })
})

