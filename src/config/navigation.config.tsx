import type { ReactNode } from 'react'
import type { ParseKeys } from 'i18next'
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
  ShoppingBag,
  PenLine,
} from 'lucide-react'
import type { Role } from '@/stores/authStore'

export interface NavItemConfig {
  id: string
  labelKey: ParseKeys<'common'>
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
    id: 'minigames',
    labelKey: 'nav.minigames',
    defaultLabel: 'Đấu trường Minigame',
    to: '/student/gamification/minigames',
    icon: <Gamepad2 size={24} />,
  },
  {
    id: 'shop',
    labelKey: 'nav.shop',
    defaultLabel: 'Cửa hàng & túi đồ',
    to: '/student/shop',
    icon: <ShoppingBag size={24} />,
  },
]

/** 5 Phân hệ chính dành riêng cho Giảng viên */
export const TEACHER_PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'teacher-dashboard',
    labelKey: 'nav.teacherDashboard',
    defaultLabel: 'Tổng quan giảng dạy',
    to: '/teacher/dashboard',
    icon: <LayoutDashboard size={24} />,
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
    icon: <LayoutDashboard size={18} className="text-action-accent shrink-0" />,
  },
  {
    id: 'practice',
    labelKey: 'nav.practice',
    defaultLabel: 'Luyện đề thi',
    to: '/student/practice',
    icon: <BookOpen size={18} className="text-action-accent shrink-0" />,
  },
  {
    id: 'proposals',
    labelKey: 'nav.proposals',
    defaultLabel: 'Đề xuất câu hỏi',
    to: '/student/proposals',
    icon: <PenLine size={18} className="text-action-accent shrink-0" />,
  },
  {
    id: 'leaderboard',
    labelKey: 'nav.leaderboard',
    defaultLabel: 'Điểm danh & Vinh danh',
    to: '/student/gamification/leaderboard',
    icon: <CalendarCheck size={18} className="text-action-accent shrink-0" />,
  },
  {
    id: 'search',
    labelKey: 'nav.search',
    defaultLabel: 'Tìm kiếm toàn cục',
    to: '/search',
    icon: <Search size={18} className="text-action-accent shrink-0" />,
  },
]

/** Lối tắt tính năng phụ dành riêng cho Giảng viên */
export const TEACHER_SECONDARY_SHORTCUT_ITEMS: NavItemConfig[] = [
  {
    id: 'teacher-dashboard',
    labelKey: 'nav.teacherDashboard',
    defaultLabel: 'Tổng quan giảng dạy',
    to: '/teacher/dashboard',
    icon: <LayoutDashboard size={18} className="text-action-accent shrink-0" />,
  },
  {
    id: 'teacher-reports',
    labelKey: 'nav.teacherReports',
    defaultLabel: 'Báo cáo vi phạm',
    to: '/teacher/reports',
    icon: <ShieldAlert size={18} className="text-action-accent shrink-0" />,
  },
  {
    id: 'search',
    labelKey: 'nav.search',
    defaultLabel: 'Tìm kiếm toàn cục',
    to: '/search',
    icon: <Search size={18} className="text-action-accent shrink-0" />,
  },
]

export function isTeacherRole(roles?: Role[]): boolean {
  return Boolean(
    roles?.some((r) => ['TEACHER', 'LECTURER', 'ADMIN'].includes(r.toUpperCase()))
  )
}

export function resolveUserRoles(roles?: Role[], role?: Role): Role[] | undefined {
  if (roles && roles.length > 0) return roles
  return role ? [role] : undefined
}

export function getPrimaryNavItems(roles?: Role[]): NavItemConfig[] {
  return isTeacherRole(roles) ? TEACHER_PRIMARY_NAV_ITEMS : PRIMARY_NAV_ITEMS
}

export function getSecondaryShortcutItems(roles?: Role[]): NavItemConfig[] {
  return isTeacherRole(roles) ? TEACHER_SECONDARY_SHORTCUT_ITEMS : SECONDARY_SHORTCUT_ITEMS
}
