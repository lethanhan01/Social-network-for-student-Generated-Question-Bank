import { useTranslation } from 'react-i18next'
import {
  Users,
  CheckSquare,
  BookOpen,
  AlertTriangle,
  GraduationCap,
  Calendar,
} from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'

export default function TeacherDashboardPage() {
  const { t } = useTranslation('academic')

  const stats = [
    {
      title: 'Lớp học phần phụ trách',
      value: '4',
      description: 'Học kỳ 2026.1',
      icon: <Users size={24} />,
      link: '/teacher/classes',
    },
    {
      title: 'Câu hỏi chờ thẩm định',
      value: '18',
      description: '3 phiên đề xuất mới',
      icon: <CheckSquare size={24} />,
      link: '/teacher/reviews',
    },
    {
      title: 'Ngân hàng đề thi',
      value: '12',
      description: 'Đề thi đã khởi tạo',
      icon: <BookOpen size={24} />,
      link: '/teacher/exams',
    },
    {
      title: 'Báo cáo vi phạm',
      value: '2',
      description: 'Cần xác minh',
      icon: <AlertTriangle size={24} />,
      link: '/teacher/reports',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-action-accent" size={28} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              Cổng Giảng Viên & Quản Trị
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            Tổng quan công tác giảng dạy, thẩm định học thuật và quản lý ngân hàng đề thi.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent" emphasis="subtle" size="md" className="gap-1.5 py-1 px-3">
            <Calendar size={14} />
            Học kỳ 2026.1
          </Badge>
        </div>
      </header>

      {/* Grid of Key Stats */}
      <section aria-label="Thống kê nhanh" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} as="article" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card flex flex-col justify-between gap-4">
            <header className="flex items-center justify-between">
              <Text size="xs" className="font-semibold uppercase tracking-wider text-fg-muted">
                {stat.title}
              </Text>
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Stat icon container] */}
              <div className="w-10 h-10 rounded-xl bg-surface-card-hover flex items-center justify-center text-action-accent">
                {stat.icon}
              </div>
            </header>
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-fg-primary">
                {stat.value}
              </p>
              <Text size="xs" tone="muted" className="mt-1">
                {stat.description}
              </Text>
            </div>
            <nav aria-label={`Truy cập ${stat.title}`} className="pt-2 border-t border-line-subtle">
              <ButtonLink
                to={stat.link}
                variant="ghost"
                size="sm"
                className="w-full justify-center min-h-11 text-xs font-semibold text-action-accent hover:text-action-accent"
              >
                {t('common.details', 'Xem chi tiết')}
              </ButtonLink>
            </nav>
          </Card>
        ))}
      </section>

      {/* Quick Actions & Guidelines */}
      <section aria-label="Lối tắt quản lý học thuật" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card as="section" className="p-6 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
          <header className="space-y-1">
            <Heading level={2} className="text-lg font-bold text-fg-primary">
              Nhiệm vụ trọng tâm
            </Heading>
            <Text size="sm" tone="muted">
              Các quy trình học thuật cần Giảng viên ưu tiên xử lý trong tuần.
            </Text>
          </header>
          <ul className="space-y-3">
            <li className="flex items-center justify-between p-3 rounded-xl bg-surface-base border border-line-subtle">
              <div className="space-y-0.5">
                <strong className="text-sm font-semibold text-fg-primary block">
                  Duyệt phiên câu hỏi trắc nghiệm
                </strong>
                <Text size="xs" tone="muted">
                  3 phiên câu hỏi môn IT4409 cần thẩm định chuyên môn
                </Text>
              </div>
              <ButtonLink to="/teacher/reviews" variant="secondary" size="sm" className="min-h-11 shrink-0 text-xs">
                Thẩm định ngay
              </ButtonLink>
            </li>
            <li className="flex items-center justify-between p-3 rounded-xl bg-surface-base border border-line-subtle">
              <div className="space-y-0.5">
                <strong className="text-sm font-semibold text-fg-primary block">
                  Soạn cấu trúc đề thi giữa kỳ
                </strong>
                <Text size="xs" tone="muted">
                  Sinh đề tự động theo ma trận câu hỏi Bloom
                </Text>
              </div>
              <ButtonLink to="/teacher/exams" variant="secondary" size="sm" className="min-h-11 shrink-0 text-xs">
                Tạo đề thi
              </ButtonLink>
            </li>
          </ul>
        </Card>

        <Card as="section" className="p-6 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
          <header className="space-y-1">
            <Heading level={2} className="text-lg font-bold text-fg-primary">
              Cổng Quản Trị Hệ Thống
            </Heading>
            <Text size="sm" tone="muted">
              Công cụ quản lý danh mục môn học, học kỳ và xử lý báo cáo.
            </Text>
          </header>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <ButtonLink
              to="/teacher/classes"
              variant="outline"
              size="md"
              className="flex-col items-center justify-center min-h-[72px] rounded-xl text-center p-3 gap-2"
            >
              <Users size={20} className="text-action-accent" />
              <strong className="text-xs font-semibold">Lớp học phần</strong>
            </ButtonLink>
            <ButtonLink
              to="/teacher/academic"
              variant="outline"
              size="md"
              className="flex-col items-center justify-center min-h-[72px] rounded-xl text-center p-3 gap-2"
            >
              <BookOpen size={20} className="text-action-accent" />
              <strong className="text-xs font-semibold">Quản trị đào tạo</strong>
            </ButtonLink>
            <ButtonLink
              to="/teacher/reports"
              variant="outline"
              size="md"
              className="flex-col items-center justify-center min-h-[72px] rounded-xl text-center p-3 gap-2"
            >
              <AlertTriangle size={20} className="text-action-accent" />
              <strong className="text-xs font-semibold">Báo cáo vi phạm</strong>
            </ButtonLink>
            <ButtonLink
              to="/feed"
              variant="outline"
              size="md"
              className="flex-col items-center justify-center min-h-[72px] rounded-xl text-center p-3 gap-2"
            >
              <GraduationCap size={20} className="text-action-accent" />
              <strong className="text-xs font-semibold">Mạng xã hội</strong>
            </ButtonLink>
          </div>
        </Card>
      </section>
    </section>
  )
}
