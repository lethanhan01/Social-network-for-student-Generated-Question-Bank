import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions'
import { Card } from '@/components/ui/data-display'
import { FormField, Input, RadioGroup, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui/forms'
import { Heading } from '@/components/ui/typography'
import {
  CONFIDENCE_LEVELS,
  OPTION_KEYS,
  type ProposalErrors,
  type QuestionDraft,
} from './proposal-form-utils'

interface ProposalQuestionFieldsProps {
  index: number
  question: QuestionDraft
  errors: ProposalErrors
  canRemove: boolean
  onChange: (uid: string, patch: Partial<QuestionDraft>) => void
  onRemove: (uid: string) => void
}

export function ProposalQuestionFields({
  index,
  question,
  errors,
  canRemove,
  onChange,
  onRemove,
}: Readonly<ProposalQuestionFieldsProps>) {
  const { t } = useTranslation('academic')
  const contentError = errors[`${question.uid}.content`]
  const optionsError = errors[`${question.uid}.options`]
  const correctError = errors[`${question.uid}.correct`]
  const label = t('proposals.form.questionLabel', { index: index + 1 })

  function updateOption(optionIndex: number, value: string) {
    onChange(question.uid, {
      options: question.options.map((current, i) => (i === optionIndex ? value : current)),
    })
  }

  return (
    <Card as="section" variant="compact" aria-label={label} className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <Heading level={3} size="xs">
          {label}
        </Heading>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            tone="danger"
            touchTarget
            leftIcon={<Trash2 size={16} />}
            onClick={() => onRemove(question.uid)}
            aria-label={t('proposals.form.removeQuestion', { index: index + 1 })}
          >
            {t('proposals.form.remove')}
          </Button>
        ) : null}
      </header>

      <FormField
        label={t('proposals.form.questionContent')}
        required
        error={contentError ? t(`proposals.form.errors.${contentError}`) : null}
      >
        <Textarea
          rows={3}
          value={question.content}
          placeholder={t('proposals.form.questionPlaceholder')}
          onChange={(event) => onChange(question.uid, { content: event.target.value })}
        />
      </FormField>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-fg-primary">{t('proposals.form.options')}</legend>
        {OPTION_KEYS.map((key, optionIndex) => (
          <FormField key={key} label={t('proposals.form.optionLabel', { key })} required>
            <Input
              value={question.options[optionIndex]}
              onChange={(event) => updateOption(optionIndex, event.target.value)}
            />
          </FormField>
        ))}
        {optionsError ? (
          <p role="alert" className="text-xs text-status-danger-fg">
            {t(`proposals.form.errors.${optionsError}`)}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-fg-primary">{t('proposals.form.correctAnswer')}</legend>
        <RadioGroup
          name={`${question.uid}-correct`}
          value={question.correctKey}
          orientation="horizontal"
          onValueChange={(value) => onChange(question.uid, { correctKey: value })}
        >
          {OPTION_KEYS.map((key) => (
            <RadioGroup.Card key={key} value={key} title={t('proposals.form.optionShort', { key })} />
          ))}
        </RadioGroup>
        {correctError ? (
          <p role="alert" className="text-xs text-status-danger-fg">
            {t(`proposals.form.errors.${correctError}`)}
          </p>
        ) : null}
      </fieldset>

      <FormField label={t('proposals.form.explanation')} hint={t('proposals.form.explanationHint')}>
        <Textarea
          rows={2}
          value={question.explanation}
          onChange={(event) => onChange(question.uid, { explanation: event.target.value })}
        />
      </FormField>

      <FormField label={t('proposals.form.confidence')} hint={t('proposals.form.confidenceHint')}>
        <Select
          value={String(question.confidence)}
          onValueChange={(value) => onChange(question.uid, { confidence: Number(value) })}
        >
          <SelectTrigger aria-label={t('proposals.form.confidence')} className="min-h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONFIDENCE_LEVELS.map((level) => (
              <SelectItem key={level} value={String(level)}>
                {t(`proposals.form.confidenceLevels.${level}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </Card>
  )
}

