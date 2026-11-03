import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Checkbox, Form, FormField, RadioGroup, Textarea } from '@/components/ui/forms'
import { Modal } from '@/components/ui/overlay'
import { Text } from '@/components/ui/typography'
import { useRateQuestionMutation } from '@/hooks/queries'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'

const RATING_LEVELS = [0, 1, 2, 3, 4] as const

interface QuestionRatingModalProps {
  /** Question being rated; the modal is closed when undefined. */
  questionId?: number
  sessionId?: number
  onClose: () => void
  onRated: (questionId: number) => void
}

interface RatingFormProps {
  questionId: number
  sessionId?: number
  onClose: () => void
  onRated: (questionId: number) => void
}

function RatingForm({ questionId, sessionId, onClose, onRated }: Readonly<RatingFormProps>) {
  const { t } = useTranslation('academic')
  const [rating, setRating] = useState<string>('')
  const [isError, setIsError] = useState(false)
  const [comment, setComment] = useState('')
  const [validation, setValidation] = useState<string | null>(null)
  const rateMutation = useRateQuestionMutation(sessionId)

  async function handleSubmit() {
    if (!isError && rating === '') {
      setValidation(t('rating.ratingRequired'))
      return
    }
    try {
      const result = await rateMutation.mutateAsync({
        questionId,
        payload: {
          rating: isError ? 0 : Number(rating),
          is_error: isError,
          comment: comment.trim() || undefined,
        },
      })
      toast.success(t(isError ? 'rating.errorReported' : 'rating.success'), {
        description:
          result.new_avg_rating === undefined
            ? undefined
            : t('rating.newAverage', { avg: result.new_avg_rating.toFixed(1), count: result.new_rating_count ?? 0 }),
      })
      onRated(questionId)
      onClose()
    } catch (error) {
      toast.error(getApiError(error, t('rating.submitError')))
    }
  }

  return (
    <Form onSubmit={handleSubmit} noValidate aria-label={t('rating.title')} className="space-y-4">
      <fieldset className="space-y-2" disabled={isError}>
        <legend className="text-sm font-medium text-fg-primary">{t('rating.ratingLabel')}</legend>
        <RadioGroup
          name={`rating-${questionId}`}
          value={rating}
          orientation="vertical"
          onValueChange={(value) => {
            setRating(value)
            setValidation(null)
          }}
        >
          {RATING_LEVELS.map((level) => (
            <RadioGroup.Card
              key={level}
              value={String(level)}
              title={t('rating.levelTitle', { level })}
              description={t(`rating.levels.${level}`)}
            />
          ))}
        </RadioGroup>
        {validation ? (
          <Text size="xs" tone="danger" role="alert">
            {validation}
          </Text>
        ) : null}
      </fieldset>

      <Checkbox
        label={t('rating.reportError')}
        description={t('rating.reportErrorHint')}
        checked={isError}
        onCheckedChange={(checked) => {
          setIsError(checked)
          setValidation(null)
        }}
      />

      <FormField label={t('rating.comment')}>
        <Textarea
          rows={3}
          value={comment}
          placeholder={t('rating.commentPlaceholder')}
          onChange={(event) => setComment(event.target.value)}
        />
      </FormField>

      <footer className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={rateMutation.isPending}>
          {t('common.cancel')}
        </Button>
        <SubmitButton loading={rateMutation.isPending}>{t('rating.submit')}</SubmitButton>
      </footer>
    </Form>
  )
}

export function QuestionRatingModal({ questionId, sessionId, onClose, onRated }: Readonly<QuestionRatingModalProps>) {
  const { t } = useTranslation('academic')
  return (
    <Modal open={questionId !== undefined} onClose={onClose} size="md" title={t('rating.title')} description={t('rating.description')}>
      {questionId === undefined ? null : (
        <RatingForm questionId={questionId} sessionId={sessionId} onClose={onClose} onRated={onRated} />
      )}
    </Modal>
  )
}

