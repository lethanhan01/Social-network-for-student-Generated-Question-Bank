import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay/Modal'
import { Form } from '@/components/ui/forms/Form'
import { FormField } from '@/components/ui/forms/FormField'
import { Textarea } from '@/components/ui/forms/Textarea'
import { Select } from '@/components/ui/forms/Select'
import { Checkbox } from '@/components/ui/forms/Checkbox'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { useRateQuestionMutation } from '@/hooks/queries/useAcademicQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'

export function QuestionRatingModal({ questionId, onClose }: Readonly<{ questionId: number; onClose: () => void }>) {
  const { t } = useTranslation('academic')
  const mutation = useRateQuestionMutation(questionId)
  const [score, setScore] = useState('3')
  const [isError, setIsError] = useState(false)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (mutation.isPending) return
    if (isError && !comment.trim()) { setError(t('rating.needComment')); return }
    try {
      await mutation.mutateAsync({ rating: isError ? 0 : Number(score), is_error: isError, comment: comment.trim() || undefined })
      toast.success(t('rating.saved')); onClose()
    } catch (cause) { setError(getApiError(cause, t('saveError'))) }
  }
  return (
    <Modal open onClose={() => { if (!mutation.isPending) onClose() }} title={t('practice.rate')}>
      <Form onSubmit={submit} noValidate onInput={() => setError('')} className="space-y-4">
        <FormField label={t('rating.score')}>
          <Select ariaLabel={t('rating.score')} value={isError ? '0' : score} disabled={isError || mutation.isPending} clearable={false}
            onValueChange={(value) => { setScore(value); setError('') }} options={([0, 1, 2, 3, 4] as const).map((value) => ({ value: String(value), label: t(`rating.${value}`) }))} />
        </FormField>
        <Checkbox label={t('rating.report')} checked={isError} disabled={mutation.isPending} onChange={(event) => { setIsError(event.target.checked); setError('') }} />
        <FormField label={t('rating.comment')} required={isError}>
          <Textarea value={comment} disabled={mutation.isPending} onChange={(event) => setComment(event.target.value)} rows={4} />
        </FormField>
        {error ? <p role="alert" className="text-status-danger-fg">{error}</p> : null}
        <SubmitButton loading={mutation.isPending}>{t('rating.send')}</SubmitButton>
      </Form>
    </Modal>
  )
}
