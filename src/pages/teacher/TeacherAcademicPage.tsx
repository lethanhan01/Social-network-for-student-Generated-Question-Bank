import { Calendar, Plus, BookOpen, Layers } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'

export default function TeacherAcademicPage() {
  const semesters = [
    { code: '2026.1', name: 'Học kỳ 1 năm học 2026-2027', status: 'ACTIVE', subjectsCount: 14 },
    { code: '2025.2', name: 'Học kỳ 2 năm học 2025-2026', status: 'CLOSED', subjectsCount: 16 },
  ]

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="text-action-accent" size={26} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              Quản Trị Đào Tạo (SCR-23)
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            Quản trị vòng đời học kỳ toàn trường, danh mục môn học và phân công giảng dạy.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" className="min-h-11 gap-2 rounded-xl text-xs sm:text-sm" leftIcon={<Plus size={18} />}>
            Thêm học kỳ mới
          </Button>
        </div>
      </header>

      {/* Semester management cards */}
      <section aria-label="Danh sách học kỳ" className="space-y-4">
        {semesters.map((sem) => (
          <Card key={sem.code} as="article" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge tone={sem.status === 'ACTIVE' ? 'success' : 'neutral'} emphasis="subtle" size="sm">
                  {sem.code}
                </Badge>
                <Heading level={2} className="text-base sm:text-lg font-bold text-fg-primary">
                  {sem.name}
                </Heading>
              </div>
              <Text size="xs" tone="muted">
                {sem.subjectsCount} môn học đang kích hoạt ngân hàng câu hỏi
              </Text>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<BookOpen size={16} />}>
                Danh mục môn học
              </Button>
              <Button variant="outline" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<Calendar size={16} />}>
                Cấu hình kỳ
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </section>
  )
}
