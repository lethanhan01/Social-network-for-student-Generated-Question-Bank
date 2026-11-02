import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions/Button'
import { FormField } from '@/components/ui/forms/FormField'
import { Textarea } from '@/components/ui/forms/Textarea'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'
import { Checkbox } from '@/components/ui/forms/Checkbox'
import { RadioGroup } from '@/components/ui/forms/RadioGroup'
import type { DraftQuestion } from './proposal-draft'

export function QuestionDraftEditor({ question, index, onChange, onRemove, canRemove }: Readonly<{
  question: DraftQuestion; index: number; onChange: (question: DraftQuestion) => void;
  onRemove: () => void; canRemove: boolean
}>) {
  const { t } = useTranslation('academic')
  return (
    <fieldset className="space-y-4 rounded-xl bg-surface-sunken p-4">
      <legend className="px-2 font-semibold">{t('composer.question', { number: index + 1 })}</legend>
      <FormField label={t('composer.questionContent')} required>
        <Textarea value={question.content} onChange={(event) => onChange({ ...question, content: event.target.value })} rows={3} />
      </FormField>
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold">{t('composer.options')}</legend>
        {question.options.map((option, optionIndex) => <FormField key={option.key} label={t('composer.option', { key: option.key })} required>
          <Input value={option.text ?? ''} onChange={(event) => onChange({ ...question,
            options: question.options.map((item, i) => i === optionIndex ? { ...item, text: event.target.value } : item) })} />
        </FormField>)}
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t('composer.correct')}</legend>
        <RadioGroup value={question.options.find((option) => option.is_correct)?.key ?? ''} orientation="horizontal"
          aria-label={t('composer.correctFor', { number: index + 1 })}
          onValueChange={(key) => onChange({ ...question, options: question.options.map((option) => ({ ...option, is_correct: option.key === key })) })}>
          {question.options.map((option) => <RadioGroup.Item key={option.key} value={option.key ?? ''} label={option.key} />)}
        </RadioGroup>
      </fieldset>
      <FormField label={t('composer.explanation')}>
        <Textarea value={question.explanation ?? ''} onChange={(event) => onChange({ ...question, explanation: event.target.value })} rows={2} />
      </FormField>
      <FormField label={t('composer.confidence')}>
        <Select ariaLabel={t('composer.confidence')} clearable={false} value={String(question.confidence)}
          onValueChange={(value) => onChange({ ...question, confidence: Number(value) })}
          options={([0, 1, 2, 3, 4] as const).map((value) => ({ value: String(value), label: t(`rating.${value}`) }))} />
      </FormField>
      <Checkbox label={t('composer.ai')} checked={question.llm_generated}
        onChange={(event) => onChange({ ...question, llm_generated: event.target.checked })} />
      {canRemove ? <Button variant="ghost" className="text-status-danger-fg" leftIcon={<Trash2 size={18} />}
        onClick={onRemove} type="button">{t('composer.remove')}</Button> : null}
    </fieldset>
  )
}
