import { Download, Eye, FileSpreadsheet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Card } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading } from '@/components/ui/typography'
import type { ExamExportFormat } from '@/services/exam.service'
import { formatDateTime } from '@/utils/date'
import type { ExamItem, Statistic } from '@/types'

interface ExamCardProps {
  exam: ExamItem
  exportingKey: string | null
  onPreview: (examId: number) => void
  onExport: (examId: number, format: ExamExportFormat) => void
}

function statEntries(stat?: Statistic): Array<{ key: 'EASY' | 'MEDIUM' | 'HARD' | 'UNCLASSIFIED'; count: number }> {
  if (!stat) return []
  return (
    [
      { key: 'EASY', count: stat.easy_count ?? 0 },
      { key: 'MEDIUM', count: stat.medium_count ?? 0 },
      { key: 'HARD', count: stat.hard_count ?? 0 },
      { key: 'UNCLASSIFIED', count: stat.unclassified_count ?? 0 },
    ] as const
  ).filter((item) => item.count > 0)
}

export function ExamCard({ exam, exportingKey, onPreview, onExport }: Readonly<ExamCardProps>) {
  const { t } = useTranslation('academic')
  const examId = exam.exam_id ?? 0
  const stats = statEntries(exam.statistic)

  return (
    <Card as="article" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
      <header className="space-y-1">
        {exam.subject_name ? (
          <Badge tone="accent" emphasis="subtle" size="sm">
            {exam.subject_name}
          </Badge>
        ) : null}
        <Heading level={2} className="text-lg font-bold text-fg-primary">
          {exam.title}
        </Heading>
      </header>

      <section className="space-y-2 text-sm text-fg-muted">
        <p>
          <strong className="text-fg-primary font-medium">
            {t('questionCount', { count: exam.question_count ?? 0 })}
          </strong>
        </p>
        {exam.created_at ? (
          <p>
            {t('teacher.exams.createdAtLabel')}{' '}
            <strong className="text-fg-primary font-medium">{formatDateTime(exam.created_at)}</strong>
          </p>
        ) : null}
        {stats.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {stats.map((item) => (
              <li key={item.key}>
                <Badge tone="neutral" emphasis="outline" size="sm">
                  {t('teacher.exams.statBadge', {
                    label: t(`teacher.exams.difficulty.${item.key}`),
                    count: item.count,
                  })}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <footer className="pt-3 border-t border-line-subtle flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="min-h-11 text-xs gap-1.5"
          leftIcon={<Eye size={16} />}
          onClick={() => onPreview(examId)}
        >
          {t('teacher.exams.previewButton')}
        </Button>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Export PDF and Excel buttons] */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 text-xs gap-1.5"
            leftIcon={<FileSpreadsheet size={16} />}
            loading={exportingKey === `${examId}-EXCEL`}
            onClick={() => onExport(examId, 'EXCEL')}
          >
            {t('teacher.exams.exportExcel')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 text-xs gap-1.5"
            leftIcon={<Download size={16} />}
            loading={exportingKey === `${examId}-PDF`}
            onClick={() => onExport(examId, 'PDF')}
          >
            {t('teacher.exams.exportPdf')}
          </Button>
        </div>
      </footer>
    </Card>
  )
}
