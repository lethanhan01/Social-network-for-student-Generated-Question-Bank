import type { ReactNode } from 'react'
import {
  MessageSquare,
  Users,
  HelpCircle,
  ShoppingBag,
  Gamepad2,
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Search,
} from 'lucide-react'

export interface NavItemConfig {
  id: string
  labelKey: string
  defaultLabel: string
  to: string
  icon: ReactNode
}

/** 5 Phân hệ chính hiển thị trên Topbar (Desktop) và BottomNavBar (Mobile) */
export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'feed',
    labelKey: 'nav.feed',
    defaultLabel: 'Mạng xã hội học tập',
    to: '/feed',
    icon: <MessageSquare size={20} />,
  },
  {
    id: 'friends',
    labelKey: 'nav.friends',
    defaultLabel: 'Bạn bè & kết nối',
    to: '/friends',
    icon: <Users size={20} />,
  },
  {
    id: 'questions',
    labelKey: 'nav.questions',
    defaultLabel: 'Ngân hàng câu hỏi',
    to: '/questions',
    icon: <HelpCircle size={20} />,
  },
  {
    id: 'shop',
    labelKey: 'nav.shop',
    defaultLabel: 'Cửa hàng & túi đồ',
    to: '/shop',
    icon: <ShoppingBag size={20} />,
  },
  {
    id: 'minigames',
    labelKey: 'nav.minigames',
    defaultLabel: 'Đấu trường Minigame',
    to: '/gamification/minigames',
    icon: <Gamepad2 size={20} />,
  },
]

/** Lối tắt tính năng phụ hiển thị trong panel Feed aside (w-72) và Mobile Drawer */
export const SECONDARY_SHORTCUT_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    labelKey: 'nav.dashboard',
    defaultLabel: 'Tổng quan học tập',
    to: '/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'exams',
    labelKey: 'nav.exams',
    defaultLabel: 'Ngân hàng đề thi',
    to: '/exams',
    icon: <BookOpen size={18} />,
  },
  {
    id: 'leaderboard',
    labelKey: 'nav.leaderboard',
    defaultLabel: 'Điểm danh & Vinh danh',
    to: '/gamification/leaderboard',
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

