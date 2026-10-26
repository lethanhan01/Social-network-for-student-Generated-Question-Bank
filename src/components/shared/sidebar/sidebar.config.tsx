import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Users,
  Search,
  Sparkles,
  Settings,
} from 'lucide-react'
import type { NavSection } from './sidebar.types'

export function getSQBNavSections(): NavSection[] {
  return [
    {
      label: 'Học tập & Đề thi',
      items: [
        {
          label: 'Tổng quan',
          to: '/dashboard',
          icon: <LayoutDashboard size={20} />,
        },
        {
          label: 'Ngân hàng đề thi',
          to: '/exams',
          icon: <BookOpen size={20} />,
        },
        {
          label: 'Ngân hàng câu hỏi',
          to: '/questions',
          icon: <HelpCircle size={20} />,
        },
        {
          label: 'Mạng xã hội học tập',
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
      label: 'Công cụ & Phát triển',
      items: [
        {
          label: 'UI Design Showcase',
          to: '/showcase',
          icon: <Sparkles size={20} />,
        },
        {
          label: 'Cài đặt hệ thống',
          to: '/settings',
          icon: <Settings size={20} />,
        },
      ],
    },
  ]
}
