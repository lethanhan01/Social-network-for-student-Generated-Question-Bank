import { Check, X, ShieldAlert } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'

export default function TeacherReportsPage() {
  const reports = [
    {
      id: 201,
      targetType: 'POST',
      reporter: 'Sinh viên A (20230001)',
      targetSummary: 'Bài viết chứa nội dung quảng cáo ngoài luồng học tập.',
      reason: 'Spam / Nội dung không phù hợp',
      createdAt: '03/11/2026 10:30',
      status: 'PENDING',
    },
    {
      id: 202,
      targetType: 'QUESTION',
      reporter: 'Sinh viên B (20230002)',
      targetSummary: 'Câu hỏi môn IT4409 sai đáp án chính thức.',
      reason: 'Sai kiến thức chuyên môn',
      createdAt: '02/11/2026 15:45',
      status: 'PENDING',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-action-accent" size={26} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              Báo Cáo Vi Phạm & Kiểm Duyệt (SCR-25)
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            Tiếp nhận, xác minh và xử lý các phản ánh vi phạm nội dung và người dùng trên hệ thống.
          </Text>
        </div>
      </header>

      {/* Reports list */}
      <section aria-label="Danh sách ticket báo cáo" className="space-y-4">
        {reports.map((rpt) => (
          <Card key={rpt.id} as="article" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge tone="danger" emphasis="subtle" size="sm">
                  {rpt.targetType}
                </Badge>
                <Text size="xs" tone="muted">
                  Người báo cáo: <strong className="text-fg-primary font-medium">{rpt.reporter}</strong>
                </Text>
                <Text size="xs" tone="muted">
                  • {rpt.createdAt}
                </Text>
              </div>
              <Badge tone="warning" emphasis="subtle" size="sm">
                Đang chờ xử lý
              </Badge>
            </header>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-fg-primary">
                Lý do: {rpt.reason}
              </p>
              <Text size="sm" tone="muted">
                {rpt.targetSummary}
              </Text>
            </div>

            <footer className="pt-3 border-t border-line-subtle flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<X size={16} />}>
                Bỏ qua
              </Button>
              <Button variant="danger" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<Check size={16} />}>
                Xử lý vi phạm
              </Button>
            </footer>
          </Card>
        ))}
      </section>
    </section>
  )
}
