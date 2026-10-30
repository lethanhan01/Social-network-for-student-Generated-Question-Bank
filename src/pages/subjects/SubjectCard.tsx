import { BookOpen, GraduationCap } from 'lucide-react'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'
import { Heading, Text } from '@/components/ui/typography'
import type { SubjectResponse } from '@/types'

export interface SubjectCardProps {
  subject: SubjectResponse
}

export function SubjectCard({ subject }: Readonly<SubjectCardProps>) {
  const code = subject.code || 'HUST'
  const name = subject.name || 'Môn học'

  const department = code.startsWith('IT')
    ? 'Trường CNTT & TT'
    : code.startsWith('MI')
    ? 'Viện Toán ứng dụng & Tin học'
    : 'Đại học Bách khoa Hà Nội'

  return (
    <Card
      as="article"
      variant="default"
      padding="none"
      className="p-5 flex flex-col justify-between border-line-subtle bg-surface hover:border-line-accent-subtle transition-all duration-200"
    >
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header container for subject card] */}
      <div className="space-y-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Badge and icon row] */}
        <div className="flex items-center justify-between">
          <Badge tone="accent" size="sm" emphasis="subtle">
            {code}
          </Badge>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Book icon wrapper] */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-sunken text-action-accent">
            <BookOpen size={16} />
          </div>
        </div>

        <Heading level={3} className="text-base font-bold text-text-primary line-clamp-2">
          {name}
        </Heading>

        <Text size="xs" tone="muted">
          Đơn vị quản lý: {department}
        </Text>
      </div>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subject card footer metadata] */}
      <div className="mt-4 pt-3 border-t border-line-subtle flex items-center justify-between text-xs text-text-muted">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Semester label with icon] */}
        <div className="flex items-center gap-1.5">
          <GraduationCap size={14} />
          <span>Kỳ 2024.1</span>
        </div>
        <Badge tone="neutral" size="xs">
          Đang giảng dạy
        </Badge>
      </div>
    </Card>
  )
}
