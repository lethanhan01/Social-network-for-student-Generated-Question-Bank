import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Search,
  Sparkles,
  Settings,
  GraduationCap,
  FileText,
  PlayCircle,
  CalendarCheck,
  ShoppingBag,
  Gamepad2
} from 'lucide-react'
import type { NavSection } from './sidebar.types'

export function getSQBNavSections(): NavSection[] {
  return [
    {
      label: 'Học thuật & Ngân hàng câu hỏi',
      items: [
        {
          label: 'Danh mục môn học',
          to: '/subjects',
          icon: <GraduationCap size={20} />,
        },
        {
          label: 'Phiên đề xuất',
          to: '/proposals',
          icon: <FileText size={20} />,
        },
        {
          label: 'Luyện tập',
          to: '/practice',
          icon: <PlayCircle size={20} />,
        },
        {
          label: 'Bảng tin & Hoạt động',
          to: '/feed',
          icon: <MessageSquare size={20} />,
        },
        {
          label: 'Bạn bè & Kết nối',
          to: '/friends',
          icon: <Users size={20} />,
        },
        {
          label: 'Tìm kiếm toàn cục',
          to: '/search',
          icon: <Search size={20} />,
        },
      ],
    },
    {
      label: 'Hệ thống & Công cụ',
      label: 'Gamification & Phần thưởng',
      items: [
        {
          label: 'Điểm danh & Vinh danh',
          to: '/gamification/leaderboard',
          icon: <CalendarCheck size={20} />,
        },
        {
          label: 'Đấu trường Minigame',
          to: '/gamification/minigames',
          icon: <Gamepad2 size={20} />,
        },
        {
          label: 'Cửa hàng & Túi đồ',
          to: '/shop',
          icon: <ShoppingBag size={20} />,
        },
      ],
    },
    {
      label: 'Công cụ & Phát triển',
      items: [
        {
          label: 'Tổng quan',
          to: '/dashboard',
          icon: <LayoutDashboard size={20} />,
        },
        {
          label: 'UI Design Showcase',
          to: '/showcase',
          icon: <Sparkles size={20} />,
        },
        {
          label: 'Cài đặt',
          to: '/settings',
          icon: <Settings size={20} />,
        },
      ],
    },
  ]
}
