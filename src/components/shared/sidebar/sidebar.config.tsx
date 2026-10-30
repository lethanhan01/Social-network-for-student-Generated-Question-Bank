import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Users,
  Search,
  Sparkles,
  Settings,
  CalendarCheck,
  ShoppingBag,
  Gamepad2,
  PenLine,
  Play,
} from 'lucide-react'
import type { NavSection } from './sidebar.types'
import i18n from '@/lib/i18n'

export function getSQBNavSections(): NavSection[] {
  return [
    {
      label: 'Học tập & Đề thi',
      items: [
        { label: i18n.t('academic:subjects.title'), to: '/subjects', icon: <BookOpen size={20} /> },
        { label: i18n.t('academic:proposals.title'), to: '/proposals', icon: <PenLine size={20} /> },
        { label: i18n.t('academic:practice.title'), to: '/practice', icon: <Play size={20} /> },
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
