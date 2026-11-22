import { useState, type FormEvent } from 'react'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, RadioGroup, Select, Switch } from '@/components/ui/forms'
import { Button, ButtonAnchor, SubmitButton } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { useExportQuestionsMutation } from '@/hooks/queries/useExamQuery'
import type { ExamExportFormat } from '@/services/exam.service'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { SubjectResponse } from '@/types'
import { triggerExportDownload } from './exam-export'

interface ExportQuestionBankModalProps {
  open: boolean
  subjects: SubjectResponse[]
  onClose: () => void
}

export function ExportQuestionBankModal({
  open,
  subjects,
  onClose,
}: Readonly<ExportQuestionBankModalProps>) {
  const { t } = useTranslation('academic')
  const [subjectId, setSubjectId] = useState('')
  const [format, setFormat] = useState<ExamExportFormat>('PDF')
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  const exportMutation = useExportQuestionsMutation()

  const subjectOptions = subjects
    .filter((item) => item.subject_id != null)
    .map((item) => ({
      value: String(item.subject_id),
      label: `${item.code ?? ''} · ${item.name ?? ''}`.trim(),
    }))

  function handleClose() {
    setError(undefined)
    setFallbackUrl(null)
    onClose()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsedSubjectId = Number(subjectId)
    if (!Number.isInteger(parsedSubjectId) || parsedSubjectId <= 0) {
      setError(t('teacher.exams.exportBankModal.subjectRequired'))
      return
    }
    setError(undefined)
    setFallbackUrl(null)

    try {
      const response = await exportMutation.mutateAsync({
        subjectId: parsedSubjectId,
        format,
        includeAnswerKey,
      })
      const blockedUrl = triggerExportDownload(response)
      if (blockedUrl) {
        setFallbackUrl(blockedUrl)
      } else {
        handleClose()
      }
    } catch (err) {
      toast.error(getApiError(err, t('teacher.exams.exportError')))
    }
  }

  return (
    <Modal open={open} size="md" title={t('teacher.exams.exportBankModal.title')} onClose={handleClose}>
      <Form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label={t('teacher.exams.exportBankModal.subjectLabel')} error={error} required>
          <Select
            ariaLabel={t('teacher.exams.exportBankModal.subjectLabel')}
            value={subjectId}
            placeholder={t('teacher.exams.exportBankModal.subjectPlaceholder')}
            options={subjectOptions}
            onValueChange={(value) => {
              setSubjectId(value)
              setError(undefined)
            }}
          />
        </FormField>

        <FormField label={t('teacher.exams.exportBankModal.formatLabel')}>
          <RadioGroup
            orientation="horizontal"
            value={format}
            aria-label={t('teacher.exams.exportBankModal.formatLabel')}
            onValueChange={(value) => setFormat(value === 'EXCEL' ? 'EXCEL' : 'PDF')}
            className="flex items-center gap-4"
          >
            <RadioGroup.Item value="PDF" label={t('teacher.exams.exportPdf')} />
            <RadioGroup.Item value="EXCEL" label={t('teacher.exams.exportExcel')} />
          </RadioGroup>
        </FormField>

        <Switch
          checked={includeAnswerKey}
          onCheckedChange={setIncludeAnswerKey}
          label={t('teacher.exams.exportBankModal.includeAnswerKey')}
        />

        {fallbackUrl ? (
          <aside role="status" className="p-3 rounded-xl bg-surface-base border border-line-subtle space-y-2">
            <Text size="xs" tone="muted">{t('teacher.exams.popupBlockedHint')}</Text>
            <ButtonAnchor
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="sm"
              className="min-h-11 gap-1.5"
              leftIcon={<Download size={16} />}
            >
              {t('teacher.exams.manualDownload')}
            </ButtonAnchor>
          </aside>
        ) : null}

        <footer className="flex items-center justify-end gap-2 pt-2 border-t border-line-subtle">
          <Button variant="outline" className="min-h-11" onClick={handleClose} disabled={exportMutation.isPending}>
            {t('cancel')}
          </Button>
          <SubmitButton className="min-h-11" loading={exportMutation.isPending}>
            {t('teacher.exams.exportBankModal.submit')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
