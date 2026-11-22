import { useState, type SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay'
import { Checkbox, Form, FormField, Input, RadioGroup, Textarea } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { useEditQuestionMutation } from '@/hooks/queries/useReviewQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { LiveSessionQuestionReviewDto } from '@/types/review.types'

interface EditReviewQuestionModalProps {
  question: LiveSessionQuestionReviewDto
  onClose: () => void
}

export function EditReviewQuestionModal({
  question,
  onClose,
}: Readonly<EditReviewQuestionModalProps>) {
  const { t } = useTranslation('academic')
  const initialOptions = question.options ?? []
  const initialCorrect =
    initialOptions.find((opt) => opt.is_correct)?.key ??
    question.correct_answer ??
    initialOptions[0]?.key ??
    ''

  const [content, setContent] = useState(question.content ?? '')
  const [options, setOptions] = useState(() =>
    initialOptions.map((opt) => ({
      key: opt.key ?? '',
      text: opt.text ?? '',
      media_url: opt.media_url,
    }))
  )
  const [correctKey, setCorrectKey] = useState(initialCorrect)
  const [explanation, setExplanation] = useState(question.explanation ?? '')
  const [autoApprove, setAutoApprove] = useState(false)
  const [errors, setErrors] = useState<{ content?: string; options?: string; correct?: string }>({})
  const editMutation = useEditQuestionMutation()

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: { content?: string; options?: string; correct?: string } = {}
    if (!content.trim()) {
      nextErrors.content = t('teacher.reviews.editModal.contentRequired')
    }
    if (options.length === 0 || options.some((opt) => !opt.text.trim())) {
      nextErrors.options = t('teacher.reviews.editModal.optionsRequired')
    }
    if (!correctKey || !options.some((opt) => opt.key === correctKey)) {
      nextErrors.correct = t('teacher.reviews.editModal.correctRequired')
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    if (!question.question_id) return
    try {
      await editMutation.mutateAsync({
        questionId: question.question_id,
        payload: {
          content: content.trim(),
          options: options.map((opt) => ({
            key: opt.key,
            text: opt.text.trim(),
            media_url: opt.media_url,
            is_correct: opt.key === correctKey,
          })),
          explanation: explanation.trim(),
          auto_approve: autoApprove,
        },
      })
      toast.success(t('teacher.reviews.editModal.success'))
      onClose()
    } catch (error) {
      toast.error(getApiError(error, t('teacher.reviews.editModal.error')))
    }
  }

  return (
    <Modal
      open
      size="xl"
      title={t('teacher.reviews.editModal.title', { id: question.question_id ?? 0 })}
      onClose={onClose}
    >
      <Form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label={t('teacher.reviews.editModal.contentLabel')}
          error={errors.content}
          required
        >
          <Textarea
            rows={3}
            value={content}
            onChange={(event) => {
              setContent(event.target.value)
              setErrors((prev) => ({ ...prev, content: undefined }))
            }}
          />
        </FormField>

        <fieldset className="space-y-3 border border-line-subtle rounded-xl p-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-fg-secondary px-1">
            {t('teacher.reviews.editModal.optionsLegend')}
          </legend>

          <RadioGroup
            value={correctKey}
            aria-label={t('teacher.reviews.editModal.optionsLegend')}
            onValueChange={(value) => {
              setCorrectKey(value)
              setErrors((prev) => ({ ...prev, correct: undefined }))
            }}
            className="space-y-2"
          >
            {options.map((opt, index) => (
              <section key={opt.key} className="flex items-center gap-3">
                <RadioGroup.Item
                  value={opt.key}
                  aria-label={t('teacher.reviews.editModal.correctAria', { key: opt.key })}
                  label={opt.key}
                  className="shrink-0"
                />
                <Input
                  value={opt.text}
                  aria-label={t('teacher.reviews.editModal.optionPlaceholder', { key: opt.key })}
                  placeholder={t('teacher.reviews.editModal.optionPlaceholder', { key: opt.key })}
                  onChange={(event) => {
                    const nextText = event.target.value
                    setOptions((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, text: nextText } : item))
                    )
                    setErrors((prev) => ({ ...prev, options: undefined }))
                  }}
                />
              </section>
            ))}
          </RadioGroup>

          {errors.options ? (
            <p role="alert" className="text-xs text-status-danger-fg font-medium">
              {errors.options}
            </p>
          ) : null}
          {errors.correct ? (
            <p role="alert" className="text-xs text-status-danger-fg font-medium">
              {errors.correct}
            </p>
          ) : null}
        </fieldset>

        <FormField label={t('teacher.reviews.editModal.explanationLabel')}>
          <Textarea
            rows={3}
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
          />
        </FormField>

        <Checkbox
          checked={autoApprove}
          onCheckedChange={setAutoApprove}
          label={t('teacher.reviews.editModal.autoApproveLabel')}
        />

        <footer className="flex items-center justify-end gap-2 pt-2 border-t border-line-subtle">
          <Button variant="outline" className="min-h-11" onClick={onClose} disabled={editMutation.isPending}>
            {t('cancel')}
          </Button>
          <SubmitButton className="min-h-11" loading={editMutation.isPending}>
            {t('teacher.reviews.editModal.submit')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
