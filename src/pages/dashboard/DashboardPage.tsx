import { BookOpen, FileQuestion, MessageSquare, TrendingUp, Plus, Search } from 'lucide-react'
import { Card, StatCard, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text, Icon } from '@/components/ui/typography'
import { Page } from '@/components/ui/layout'
import { formatNumber } from '@/utils/formatters'
import { useAuthStore } from '@/stores/authStore'

const RECENT_EXAMS = [
  { id: 'ex_1', title: 'Đề thi cuối kỳ Giải tích 1 (K68)', subject: 'Giải tích 1 (MI1110)', questions: 25, term: '2023.2', downloads: 1420 },
  { id: 'ex_2', title: 'Đề thi giữa kỳ Đại số tuyến tính', subject: 'Đại số (MI1120)', questions: 20, term: '2024.1', downloads: 980 },
  { id: 'ex_3', title: 'Ngân hàng câu hỏi trắc nghiệm Tin học đại cương', subject: 'Tin học đại cương (IT1110)', questions: 120, term: '2024.1', downloads: 2150 },
  { id: 'ex_4', title: 'Đề ôn tập Cấu trúc dữ liệu & Giải thuật', subject: 'CTDL&GT (IT3011)', questions: 45, term: '2023.1', downloads: 1670 },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <Page className="space-y-8">
      {/* Welcome Banner */}
      <Card as="section" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-surface border-line-subtle shadow-sm rounded-2xl">
        <hgroup>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Badge row] */}
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="accent" size="sm">
              Kỳ học 2024.1
            </Badge>
            <Badge tone="accent" size="sm">HUST Student</Badge>
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Xin chào, {user?.fullName || 'Sinh viên HUST'}!
          </Heading>
          <Text size="sm" tone="muted" className="mt-1">
            Chào mừng bạn đến với Ngân Hàng Đề Thi & Mạng Xã Hội Học Tập SQB HUST.
          </Text>
        </hgroup>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Banner action buttons] */}
        <div className="flex items-center gap-3">
          <ButtonLink to="/showcase" variant="outline" size="md">
            UI Showcase
          </ButtonLink>
          <Button variant="primary" size="md" leftIcon={<Icon icon={Plus} size="sm" />} aria-label="Đóng góp đề thi">
            Đóng góp đề thi
          </Button>
        </div>
      </Card>

      {/* Stat Cards Grid */}
      <section aria-label="Thống kê học tập" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Đề thi đã lưu"
          value="18"
          icon={<Icon icon={BookOpen} size="md" tone="accent" />}
          hint="+3 đề thi mới trong tuần"
        />
        <StatCard
          label="Câu hỏi đã đóng góp"
          value="42"
          icon={<Icon icon={FileQuestion} size="md" tone="warning" />}
          hint="98% được cộng đồng duyệt"
        />
        <StatCard
          label="Lượt thảo luận"
          value="156"
          icon={<Icon icon={MessageSquare} size="md" tone="info" />}
          hint="+12 phản hồi mới"
        />
        <StatCard
          label="Điểm uy tín học tập"
          value="1,240"
          icon={<Icon icon={TrendingUp} size="md" tone="success" />}
          hint="Top 5% sinh viên tích cực"
        />
      </section>

      {/* Recent Exams Table */}
      <Card className="p-6 bg-surface border-line-subtle shadow-card rounded-2xl">
        <header className="flex items-center justify-between mb-4">
          <hgroup>
            <Heading level={2} className="text-lg font-bold text-text-primary">
              Đề thi & Tài liệu phổ biến gần đây
            </Heading>
            <Text size="xs" tone="muted">
              Các đề thi được sinh viên HUST tải và ôn tập nhiều nhất
            </Text>
          </hgroup>
          <Button variant="ghost" size="sm" leftIcon={<Icon icon={Search} size="xs" />} aria-label="Xem tất cả đề thi">
            Xem tất cả
          </Button>
        </header>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đề thi / Tài liệu</TableHead>
              <TableHead>Học phần</TableHead>
              <TableHead className="text-center">Số câu hỏi</TableHead>
              <TableHead className="text-center">Kỳ thi</TableHead>
              <TableHead className="text-right">Lượt tải</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RECENT_EXAMS.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium text-text-primary">
                  {exam.title}
                </TableCell>
                <TableCell>
                  <Badge tone="neutral" size="sm">{exam.subject}</Badge>
                </TableCell>
                <TableCell className="text-center text-text-secondary">
                  {exam.questions}
                </TableCell>
                <TableCell className="text-center text-text-secondary">
                  {exam.term}
                </TableCell>
                <TableCell className="text-right font-semibold text-action-accent">
                  {formatNumber(exam.downloads)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Page>
  )
}
