import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, Textarea } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'

interface RejectQuestionsModalProps {
  questionIds: number[]
  loading: boolean
  onConfirm: (reason: string) => Promise<void>
  onClose: () => void
}

export function RejectQuestionsModal({
  questionIds,
  loading,
  onConfirm,
  onClose,
}: Readonly<RejectQuestionsModalProps>) {
  const { t } = useTranslation('academic')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | undefined>()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError(t('teacher.reviews.rejectModal.reasonRequired'))
      return
    }
    setError(undefined)
    await onConfirm(trimmed)
  }

  return (
    <Modal
      open
      size="md"
      title={t('teacher.reviews.rejectModal.title', { count: questionIds.length })}
      onClose={onClose}
    >
      <Form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label={t('teacher.reviews.rejectModal.reasonLabel')}
          error={error}
          required
        >
          <Textarea
            rows={4}
            value={reason}
            placeholder={t('teacher.reviews.rejectModal.reasonPlaceholder')}
            onChange={(event) => {
              setReason(event.target.value)
              if (error) setError(undefined)
            }}
          />
        </FormField>

        <footer className="flex items-center justify-end gap-2 pt-2 border-t border-line-subtle">
          <Button variant="outline" className="min-h-11" onClick={onClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <SubmitButton variant="danger" className="min-h-11" loading={loading}>
            {t('teacher.reviews.rejectModal.submit')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
