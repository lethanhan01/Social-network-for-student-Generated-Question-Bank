import type { ReactNode } from 'react'
import {
  Home,
  Users,
  HelpCircle,
  Gamepad2,
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Search,
  CheckSquare,
  ShieldAlert,
  Play,
} from 'lucide-react'
import type { Role } from '@/stores/authStore'

export interface NavItemConfig {
  id: string
  labelKey: string
  defaultLabel: string
  to: string
  icon: ReactNode
}

/** 5 Phân hệ chính mặc định hiển thị trên Topbar (Desktop) và BottomNavBar (Mobile) */
export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'feed',
    labelKey: 'nav.feed',
    defaultLabel: 'Mạng xã hội học tập',
    to: '/feed',
    icon: <Home size={26} />,
  },
  {
    id: 'friends',
    labelKey: 'nav.friends',
    defaultLabel: 'Bạn bè & kết nối',
    to: '/friends',
    icon: <Users size={24} />,
  },
  {
    id: 'questions',
    labelKey: 'nav.questions',
    defaultLabel: 'Ngân hàng câu hỏi',
    to: '/student/subjects',
    icon: <HelpCircle size={24} />,
  },
  {
    id: 'exams',
    labelKey: 'nav.exams',
    defaultLabel: 'Ngân hàng đề thi',
    to: '/student/practice',
    icon: <BookOpen size={24} />,
  },
  {
    id: 'minigames',
    labelKey: 'nav.minigames',
    defaultLabel: 'Đấu trường Minigame',
    to: '/student/gamification/minigames',
    icon: <Gamepad2 size={24} />,
  },
]

/** 5 Phân hệ chính dành riêng cho Giảng viên */
export const TEACHER_PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'feed',
    labelKey: 'nav.feed',
    defaultLabel: 'Mạng xã hội học tập',
    to: '/feed',
    icon: <Home size={26} />,
  },
  {
    id: 'classes',
    labelKey: 'nav.classes',
    defaultLabel: 'Lớp học phần',
    to: '/teacher/classes',
    icon: <Users size={24} />,
  },
  {
    id: 'reviews',
    labelKey: 'nav.reviews',
    defaultLabel: 'Thẩm định câu hỏi',
    to: '/teacher/reviews',
    icon: <CheckSquare size={24} />,
  },
  {
    id: 'exams',
    labelKey: 'nav.exams',
    defaultLabel: 'Ngân hàng đề thi',
    to: '/teacher/exams',
    icon: <BookOpen size={24} />,
  },
  {
    id: 'academic',
    labelKey: 'nav.academic',
    defaultLabel: 'Quản trị đào tạo',
    to: '/teacher/academic',
    icon: <Play size={24} />,
  },
]

/** Lối tắt tính năng phụ hiển thị trong panel Feed aside (w-72) và Mobile Drawer */
export const SECONDARY_SHORTCUT_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    labelKey: 'nav.dashboard',
    defaultLabel: 'Tổng quan học tập',
    to: '/student/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'leaderboard',
    labelKey: 'nav.leaderboard',
    defaultLabel: 'Điểm danh & Vinh danh',
    to: '/student/gamification/leaderboard',
    icon: <CalendarCheck size={18} />,
  },
  {
    id: 'search',
    labelKey: 'nav.search',
    defaultLabel: 'Tìm kiếm toàn cục',
    to: '/search',
    icon: <Search size={18} />,
  },
]

/** Lối tắt tính năng phụ dành riêng cho Giảng viên */
export const TEACHER_SECONDARY_SHORTCUT_ITEMS: NavItemConfig[] = [
  {
    id: 'teacher-dashboard',
    labelKey: 'nav.teacherDashboard',
    defaultLabel: 'Tổng quan giảng dạy',
    to: '/teacher/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'teacher-reports',
    labelKey: 'nav.teacherReports',
    defaultLabel: 'Báo cáo vi phạm',
    to: '/teacher/reports',
    icon: <ShieldAlert size={18} />,
  },
  {
    id: 'search',
    labelKey: 'nav.search',
    defaultLabel: 'Tìm kiếm toàn cục',
    to: '/search',
    icon: <Search size={18} />,
  },
]

export function getPrimaryNavItems(roles?: Role[]): NavItemConfig[] {
  if (roles?.some((r) => ['teacher', 'LECTURER', 'admin', 'ADMIN'].includes(r))) {
    return TEACHER_PRIMARY_NAV_ITEMS
  }
  return PRIMARY_NAV_ITEMS
}

export function getSecondaryShortcutItems(roles?: Role[]): NavItemConfig[] {
  if (roles?.some((r) => ['teacher', 'LECTURER', 'admin', 'ADMIN'].includes(r))) {
    return TEACHER_SECONDARY_SHORTCUT_ITEMS
  }
  return SECONDARY_SHORTCUT_ITEMS
}
