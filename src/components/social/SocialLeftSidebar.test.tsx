import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/lib/i18n'
import { useAuthStore } from '@/stores/authStore'
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

const mockLecturer: ProfileResponse = {
  user_id: 2,
  email: 'lecturer@hust.edu.vn',
  full_name: 'TS. Trần Thị Bình',
  student_lecturer_code: 'GV0012',
  role: 'LECTURER',
}

describe('SocialLeftSidebar', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, hasHydrated: true })
  })

  afterEach(async () => {
    await i18n.changeLanguage('vi')
  })

  it('renders user summary with full name, student code and role badge', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SocialLeftSidebar user={mockUser} subjects={mockSubjects} />
      </MemoryRouter>
    )

    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByText(/MSSV: 20201234/i)).toBeInTheDocument()
    expect(screen.getByText('Sinh viên')).toBeInTheDocument()
    expect(screen.getByText(/Sinh viên CNTT HUST/i)).toBeInTheDocument()
  })

  it('renders student-only feature shortcuts links', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SocialLeftSidebar user={mockUser} subjects={mockSubjects} />
      </MemoryRouter>
    )

    const shortcutsNav = screen.getByRole('navigation', { name: /lối tắt tính năng/i })
    expect(shortcutsNav).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /tất cả bảng tin/i })).toHaveAttribute('href', '/feed')
    expect(screen.getByRole('link', { name: /tổng quan học tập/i })).toHaveAttribute('href', '/student/dashboard')
    expect(screen.getByRole('link', { name: /luyện đề thi/i })).toHaveAttribute('href', '/student/practice')
    expect(screen.getByRole('link', { name: /đề xuất câu hỏi/i })).toHaveAttribute('href', '/student/proposals')
    expect(screen.getByRole('link', { name: /điểm danh & vinh danh/i })).toHaveAttribute('href', '/student/gamification/leaderboard')
    expect(screen.getByRole('link', { name: /tìm kiếm toàn cục/i })).toHaveAttribute('href', '/search')
    expect(screen.queryByRole('link', { name: /báo cáo vi phạm/i })).not.toBeInTheDocument()
  })

  it('renders lecturer-only feature shortcuts links without student routes', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SocialLeftSidebar user={mockLecturer} subjects={mockSubjects} />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /tất cả bảng tin/i })).toHaveAttribute('href', '/feed')
    expect(screen.getByRole('link', { name: /tổng quan giảng dạy/i })).toHaveAttribute('href', '/teacher/dashboard')
    expect(screen.getByRole('link', { name: /báo cáo vi phạm/i })).toHaveAttribute('href', '/teacher/reports')
    expect(screen.getByRole('link', { name: /tìm kiếm toàn cục/i })).toHaveAttribute('href', '/search')
    expect(screen.queryByRole('link', { name: /điểm danh & vinh danh/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /luyện đề thi/i })).not.toBeInTheDocument()
  })

  it('renders bilingual Japanese labels when language is switched to ja', async () => {
    await i18n.changeLanguage('ja')
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SocialLeftSidebar user={mockUser} subjects={mockSubjects} />
      </MemoryRouter>
    )

    expect(screen.getByRole('navigation', { name: 'ショートカット' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'すべての投稿' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '学習概要' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '模擬試験・演習' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '問題提案' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '登録コース' })).toBeInTheDocument()
  })

  it('renders subjects list and calls onSelectSubject when clicked', () => {
    const onSelect = vi.fn()
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

