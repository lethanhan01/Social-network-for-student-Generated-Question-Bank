import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Settings,
  GraduationCap,
  FileText,
  PlayCircle,
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
      ],
    },
    {
      label: 'Hệ thống & Công cụ',
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
