import type { ReactNode } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay'
import { Badge, Card, Image } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useExamDetailQuery } from '@/hooks/queries/useExamQuery'
import type { ExamExportFormat } from '@/services/exam.service'
import { formatDateTime } from '@/utils/date'
import { cn } from '@/utils/cn'

interface ExamPreviewModalProps {
  examId: number
  exportingKey: string | null
  onExport: (examId: number, format: ExamExportFormat) => void
  onClose: () => void
}

export function ExamPreviewModal({
  examId,
  exportingKey,
  onExport,
  onClose,
}: Readonly<ExamPreviewModalProps>) {
  const { t } = useTranslation('academic')
  const detailQuery = useExamDetailQuery(examId)
  const exam = detailQuery.data
  const questions = [...(exam?.questions ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  let previewContent: ReactNode
  if (detailQuery.isPending) {
    previewContent = <AcademicFeedback pending />
  } else if (detailQuery.isError) {
    previewContent = <AcademicFeedback error={detailQuery.error} onRetry={detailQuery.refetch} />
  } else if (questions.length === 0) {
    previewContent = <AcademicFeedback empty={t('teacher.exams.previewModal.emptyQuestions')} />
  } else {
    previewContent = (
      <ol className="space-y-4">
        {questions.map((question, idx) => (
          <li key={question.question_id ?? `order-${question.order ?? 0}`}>
            <Card as="article" className="p-4 rounded-xl bg-surface-base border border-line-subtle space-y-3">
              <header className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="accent" emphasis="subtle" size="sm">
                  {t('teacher.exams.previewModal.questionLabel', { order: question.order ?? idx + 1 })}
                </Badge>
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question metadata badges row] */}
                <div className="flex items-center gap-1.5">
                  {question.topic ? <Badge tone="neutral" emphasis="outline" size="sm">{question.topic}</Badge> : null}
                  {question.difficulty ? (
                    <Badge tone="neutral" emphasis="subtle" size="sm">
                      {t(`teacher.exams.difficulty.${question.difficulty}`, { defaultValue: question.difficulty })}
                    </Badge>
                  ) : null}
                </div>
              </header>

              <p className="text-sm font-semibold text-fg-primary whitespace-pre-wrap">{question.content}</p>

              {(question.image_urls ?? []).length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(question.image_urls ?? []).map((url) => (
                    <li key={url}>
                      <Image
                        src={url}
                        alt={t('practice.imageAlt', { index: question.order ?? idx + 1 })}
                        fit="contain"
                        radius="lg"
                        containerClassName="max-h-48 border border-line-subtle bg-surface-card"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(question.options ?? []).map((opt) => (
                  <li
                    key={opt.key}
                    className={cn(
                      'p-2.5 rounded-lg border',
                      opt.is_correct
                        ? 'bg-action-accent-soft border-action-accent text-fg-primary font-medium'
                        : 'bg-surface-card border-line-subtle text-fg-muted'
                    )}
                  >
                    <strong>{opt.key}.</strong> {opt.text}
                    {opt.is_correct ? (
                      <Text size="xs" className="text-action-accent font-semibold mt-0.5">
                        {t('teacher.exams.previewModal.correctBadge')}
                      </Text>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <Modal
      open
      size="2xl"
      title={exam?.title ?? t('teacher.exams.previewModal.title')}
      description={
        exam
          ? [exam.subject_name, t('questionCount', { count: exam.question_count ?? questions.length }), exam.created_at ? formatDateTime(exam.created_at) : null]
              .filter(Boolean)
              .join(' · ')
          : undefined
      }
      onClose={onClose}
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 gap-1.5"
            leftIcon={<FileSpreadsheet size={16} />}
            loading={exportingKey === `${examId}-EXCEL`}
            onClick={() => onExport(examId, 'EXCEL')}
          >
            {t('teacher.exams.exportExcel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="min-h-11 gap-1.5"
            leftIcon={<Download size={16} />}
            loading={exportingKey === `${examId}-PDF`}
            onClick={() => onExport(examId, 'PDF')}
          >
            {t('teacher.exams.exportPdf')}
          </Button>
        </>
      }
    >
      {previewContent}
    </Modal>
  )
}
