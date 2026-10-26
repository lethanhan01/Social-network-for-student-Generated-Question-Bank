import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, SubmitButton } from '@/components/ui/actions'
import { EmptyState } from '@/components/ui/feedback'
import { Form, FormField, NumberInput, Select, type SelectOption } from '@/components/ui/forms'
import { PageSkeleton } from '@/components/ui/layout'
import { Modal } from '@/components/ui/overlay'

export interface NumberPredictionModalProps {
  open: boolean
  onClose: () => void
  formId: string
  title: string
  description: string
  targetLabel: string
  targetPlaceholder: string
  targetRequiredMessage: string
  valueLabel: string
  valueInvalidMessage: string
  options: SelectOption[]
  optionsLoading?: boolean
  emptyMessage: string
  submitting?: boolean
  /** Gọi khi form hợp lệ; `done` đóng và reset modal sau khi gửi thành công */
  onSubmit: (targetId: number, value: number, done: () => void) => void
}

interface FieldErrors {
  target?: string
  value?: string
}

export function NumberPredictionModal({
  open,
  onClose,
  formId,
  title,
  description,
  targetLabel,
  targetPlaceholder,
  targetRequiredMessage,
  valueLabel,
  valueInvalidMessage,
  options,
  optionsLoading = false,
  emptyMessage,
  submitting = false,
  onSubmit,
}: Readonly<NumberPredictionModalProps>) {
  const { t } = useTranslation('gamification')
  const [targetId, setTargetId] = useState('')
  const [value, setValue] = useState<number | ''>('')
  const [errors, setErrors] = useState<FieldErrors>({})

  function handleClose() {
    setTargetId('')
    setValue('')
    setErrors({})
    onClose()
  }

  function handleSubmit() {
    const nextErrors: FieldErrors = {}
    if (!targetId) nextErrors.target = targetRequiredMessage
    if (value === '' || !Number.isInteger(value) || value < 0) nextErrors.value = valueInvalidMessage
    if (nextErrors.target || nextErrors.value) {
      setErrors(nextErrors)
      return
    }
    onSubmit(Number(targetId), Number(value), handleClose)
  }

  function renderBody() {
    if (optionsLoading) {
      return <PageSkeleton rows={2} />
    }
    if (options.length === 0) {
      return <EmptyState size="sm" title={emptyMessage} />
    }
    return (
      <Form id={formId} onSubmit={handleSubmit} noValidate aria-label={title} className="space-y-4">
        <FormField label={targetLabel} error={errors.target} required>
          {/* rogym-convention-exempt: FORMS_LABEL_ASSOC [Select nhận nhãn qua FormField context và prop ariaLabel] */}
          <Select
            options={options}
            value={targetId}
            placeholder={targetPlaceholder}
            ariaLabel={targetLabel}
            clearable={false}
            onValueChange={(next: string) => {
              setTargetId(next)
              if (errors.target) setErrors((prev) => ({ ...prev, target: undefined }))
            }}
          />
        </FormField>
        <FormField label={valueLabel} error={errors.value} required>
          <NumberInput
            aria-label={valueLabel}
            min={0}
            step={1}
            value={value}
            onChange={(next) => {
              setValue(Number.isNaN(next) ? '' : next)
              if (errors.value) setErrors((prev) => ({ ...prev, value: undefined }))
            }}
          />
        </FormField>
      </Form>
    )
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            {t('minigames.cancel')}
          </Button>
          <SubmitButton form={formId} loading={submitting} disabled={optionsLoading || options.length === 0}>
            {t('minigames.submit')}
          </SubmitButton>
        </>
      }
    >
      {renderBody()}
    </Modal>
  )
}
