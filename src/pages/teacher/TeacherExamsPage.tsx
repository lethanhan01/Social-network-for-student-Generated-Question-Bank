import { BookOpen, Plus, Download, FileSpreadsheet, Eye } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'

export default function TeacherExamsPage() {
  const sampleExams = [
    {
      id: 1,
      title: 'Đề thi giữa kỳ môn Web - Đề số 1',
      subject: 'IT4409 - Phát triển ứng dụng Web',
      questionCount: 40,
      duration: '60 phút',
      status: 'PUBLISHED',
      createdAt: '03/11/2026',
    },
    {
      id: 2,
      title: 'Đề thi trắc nghiệm cuối kỳ - Mạng máy tính',
      subject: 'IT3080 - Mạng máy tính',
      questionCount: 50,
      duration: '75 phút',
      status: 'DRAFT',
      createdAt: '01/11/2026',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="text-action-accent" size={26} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              Tạo & Xuất Đề Thi Tự Động (SCR-21)
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            Sinh đề thi theo ma trận độ khó chuẩn hóa, quản lý đề thi và xuất file PDF/Excel.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" className="min-h-11 gap-2 rounded-xl text-xs sm:text-sm" leftIcon={<Plus size={18} />}>
            Cấu hình sinh đề mới
          </Button>
        </div>
      </header>

      {/* Exam list cards */}
      <section aria-label="Danh sách đề thi" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sampleExams.map((exam) => (
          <Card key={exam.id} as="article" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
            <header className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <Badge tone="accent" emphasis="subtle" size="sm">
                  {exam.subject}
                </Badge>
                <Heading level={2} className="text-lg font-bold text-fg-primary">
                  {exam.title}
                </Heading>
              </div>
              <Badge tone={exam.status === 'PUBLISHED' ? 'success' : 'neutral'} emphasis="subtle" size="sm">
                {exam.status === 'PUBLISHED' ? 'Chính thức' : 'Bản nháp'}
              </Badge>
            </header>

            <div className="space-y-1 text-sm text-fg-muted">
              <p>Số lượng: <strong className="text-fg-primary font-medium">{exam.questionCount} câu hỏi</strong> ({exam.duration})</p>
              <p>Ngày tạo: <strong className="text-fg-primary font-medium">{exam.createdAt}</strong></p>
            </div>

            <footer className="pt-3 border-t border-line-subtle flex flex-wrap items-center justify-between gap-2">
              <Button variant="secondary" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<Eye size={16} />}>
                Xem trước
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<FileSpreadsheet size={16} />}>
                  Excel
                </Button>
                <Button variant="outline" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<Download size={16} />}>
                  PDF
                </Button>
              </div>
            </footer>
          </Card>
        ))}
      </section>
    </section>
  )
}
