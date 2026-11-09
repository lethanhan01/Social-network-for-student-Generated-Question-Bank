import { Users, Plus, FileText } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'

export default function TeacherClassesPage() {
  const sampleClasses = [
    {
      code: 'IT4409.2026.1',
      name: 'Phát triển ứng dụng Web',
      studentsCount: 65,
      schedule: 'Thứ 4 (Tiết 1-3) - D9-501',
      semester: '2026.1',
    },
    {
      code: 'IT3080.2026.1',
      name: 'Mạng máy tính',
      studentsCount: 58,
      schedule: 'Thứ 6 (Tiết 4-6) - B1-302',
      semester: '2026.1',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="text-action-accent" size={26} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              Quản Lý Lớp Học Phần (SCR-19)
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            Theo dõi phân công giảng dạy, danh sách sinh viên và các hoạt động luyện tập theo lớp.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" className="min-h-11 gap-2 rounded-xl text-xs sm:text-sm" leftIcon={<Plus size={18} />}>
            Thêm lớp mới
          </Button>
        </div>
      </header>

      {/* Class list cards */}
      <section aria-label="Danh sách lớp học phần" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sampleClasses.map((cls) => (
          <Card key={cls.code} as="article" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
            <header className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <Badge tone="accent" emphasis="subtle" size="sm">
                  {cls.code}
                </Badge>
                <Heading level={2} className="text-lg font-bold text-fg-primary">
                  {cls.name}
                </Heading>
              </div>
              <Badge tone="neutral" emphasis="outline" size="sm">
                {cls.semester}
              </Badge>
            </header>

            <div className="space-y-1 text-sm text-fg-muted">
              <p>Thời khóa biểu: <strong className="text-fg-primary font-medium">{cls.schedule}</strong></p>
              <p>Sĩ số: <strong className="text-fg-primary font-medium">{cls.studentsCount} sinh viên</strong></p>
            </div>

            <footer className="pt-3 border-t border-line-subtle flex items-center justify-between gap-2">
              <Button variant="secondary" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<Users size={16} />}>
                Danh sách SV
              </Button>
              <Button variant="outline" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<FileText size={16} />}>
                Hoạt động luyện tập
              </Button>
            </footer>
          </Card>
        ))}
      </section>
    </section>
  )
}
