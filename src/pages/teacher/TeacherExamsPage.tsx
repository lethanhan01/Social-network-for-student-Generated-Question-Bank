import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Plus, Download, FolderDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Heading, Text } from '@/components/ui/typography'
import { Card } from '@/components/ui/data-display'
import { Button, ButtonAnchor } from '@/components/ui/actions'
import { Select, Switch } from '@/components/ui/forms'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useSubjectsQuery } from '@/hooks/queries/useCourseQuery'
import { useExportExamMutation, useInfiniteMyExamsQuery } from '@/hooks/queries/useExamQuery'
import type { ExamExportFormat } from '@/services/exam.service'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { positiveId } from '@/types/academic.types'
import { triggerExportDownload } from './exams/exam-export'
import { ExamCard } from './exams/ExamCard'
import { GenerateExamModal } from './exams/GenerateExamModal'
import { ExamPreviewModal } from './exams/ExamPreviewModal'
import { ExportQuestionBankModal } from './exams/ExportQuestionBankModal'

export default function TeacherExamsPage() {
  const { t } = useTranslation('academic')
  const [params, setParams] = useSearchParams()
  const subjectId = positiveId(params.get('subjectId'))
  const previewExamId = positiveId(params.get('preview'))

  const [includeAnswerKey, setIncludeAnswerKey] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [exportBankOpen, setExportBankOpen] = useState(false)
  const [exportingKey, setExportingKey] = useState<string | null>(null)
  const [fallbackDownloadUrl, setFallbackDownloadUrl] = useState<string | null>(null)

  const subjectsQuery = useSubjectsQuery()
  const examsQuery = useInfiniteMyExamsQuery(subjectId)
  const exportExamMutation = useExportExamMutation()

  const subjects = subjectsQuery.data ?? []
  const exams = examsQuery.data?.pages.flatMap((page) => page.items ?? []) ?? []

  const subjectOptions = [
    { value: '', label: t('teacher.exams.allSubjects') },
    ...subjects
      .filter((item) => item.subject_id != null)
      .map((item) => ({
        value: String(item.subject_id),
        label: `${item.code ?? ''} · ${item.name ?? ''}`.trim(),
      })),
  ]

  function updateParam(key: string, value?: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  async function handleExportExam(examId: number, format: ExamExportFormat) {
    const key = `${examId}-${format}`
    setExportingKey(key)
    setFallbackDownloadUrl(null)
    try {
      const result = await exportExamMutation.mutateAsync({ examId, format, includeAnswerKey })
      const blockedUrl = triggerExportDownload(result)
      if (blockedUrl) setFallbackDownloadUrl(blockedUrl)
    } catch (error) {
      toast.error(getApiError(error, t('teacher.exams.exportError')))
    } finally {
      setExportingKey(null)
    }
  }

  let examsContent: ReactNode
  if (examsQuery.isPending) {
    examsContent = <AcademicFeedback pending />
  } else if (examsQuery.isError) {
    examsContent = <AcademicFeedback error={examsQuery.error} onRetry={examsQuery.refetch} />
  } else if (exams.length === 0) {
    examsContent = <AcademicFeedback empty={t('teacher.exams.empty')} />
  } else {
    examsContent = (
      <section className="space-y-4">
        <section aria-label={t('teacher.exams.listAria')} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.exam_id}
              exam={exam}
              exportingKey={exportingKey}
              onPreview={(id) => updateParam('preview', String(id))}
              onExport={(id, format) => { void handleExportExam(id, format) }}
            />
          ))}
        </section>

        {examsQuery.hasNextPage ? (
          <Button
            variant="outline"
            className="w-full min-h-11"
            loading={examsQuery.isFetchingNextPage}
            onClick={() => { void examsQuery.fetchNextPage() }}
          >
            {t('loadMore')}
          </Button>
        ) : null}
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <section className="space-y-1">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title icon and heading row] */}
          <div className="flex items-center gap-2">
            <BookOpen className="text-action-accent" size={26} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              {t('teacher.exams.title')}
            </Heading>
          </div>
          <Text size="sm" tone="muted">{t('teacher.exams.subtitle')}</Text>
        </section>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header action buttons group] */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="md"
            className="min-h-11 gap-2 rounded-xl text-xs sm:text-sm"
            leftIcon={<FolderDown size={18} />}
            onClick={() => setExportBankOpen(true)}
          >
            {t('teacher.exams.exportBankButton')}
          </Button>
          <Button
            variant="primary"
            size="md"
            className="min-h-11 gap-2 rounded-xl text-xs sm:text-sm"
            leftIcon={<Plus size={18} />}
            onClick={() => setGenerateOpen(true)}
          >
            {t('teacher.exams.generateButton')}
          </Button>
        </div>
      </header>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subject filter select wrapper] */}
        <div className="w-full sm:max-w-sm">
          <Select
            ariaLabel={t('teacher.exams.subjectFilterAria')}
            value={subjectId ? String(subjectId) : ''}
            placeholder={t('teacher.exams.allSubjects')}
            options={subjectOptions}
            onValueChange={(value) => updateParam('subjectId', value)}
          />
        </div>
        <Switch
          checked={includeAnswerKey}
          onCheckedChange={setIncludeAnswerKey}
          label={t('teacher.exams.includeAnswerKeyToggle')}
        />
      </section>

      {fallbackDownloadUrl ? (
        <Card as="aside" role="status" className="p-4 rounded-xl bg-surface-card border border-line-subtle flex flex-wrap items-center justify-between gap-3">
          <Text size="sm" tone="muted">{t('teacher.exams.popupBlockedHint')}</Text>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Fallback download action buttons] */}
          <div className="flex items-center gap-2">
            <ButtonAnchor
              href={fallbackDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="sm"
              className="min-h-11 gap-1.5"
              leftIcon={<Download size={16} />}
            >
              {t('teacher.exams.manualDownload')}
            </ButtonAnchor>
            <Button variant="ghost" size="sm" className="min-h-11" onClick={() => setFallbackDownloadUrl(null)}>
              {t('close')}
            </Button>
          </div>
        </Card>
      ) : null}

      {examsContent}

      <GenerateExamModal
        open={generateOpen}
        subjects={subjects}
        onGenerated={(examId) => {
          setGenerateOpen(false)
          if (examId) updateParam('preview', String(examId))
        }}
        onClose={() => setGenerateOpen(false)}
      />

      {previewExamId ? (
        <ExamPreviewModal
          key={previewExamId}
          examId={previewExamId}
          exportingKey={exportingKey}
          onExport={(examId, format) => { void handleExportExam(examId, format) }}
          onClose={() => updateParam('preview')}
        />
      ) : null}

      <ExportQuestionBankModal
        open={exportBankOpen}
        subjects={subjects}
        onClose={() => setExportBankOpen(false)}
      />
    </section>
  )
}
