import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LockKeyhole } from 'lucide-react'
import { PortalDialog } from './PortalDialog'
import { Form, FormField, Input } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { usePinMutation } from '@/hooks/queries/usePortalQuery'
import { getApiError } from '@/lib/api-error'
import { pinSchema } from './portal.schemas'

export function PinModal({
  mode,
  onClose,
  onSuccess,
}: {
  mode: 'unlock' | 'setup' | 'change'
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useTranslation('portal')
  const [pin, setPin] = useState('')
  const [oldPin, setOldPin] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const mutation = usePinMutation(mode)
  async function handleSubmit() {
    if (!pinSchema.safeParse(pin).success || (mode === 'change' && !pinSchema.safeParse(oldPin).success)) {
      setError(t('pin.invalid'))
      return
    }
    if (mode !== 'unlock' && pin !== confirmation) {
      setError(t('pin.mismatch'))
      return
    }
    try {
      await mutation.mutateAsync({ pin, ...(mode === 'change' ? { old_pin: oldPin } : {}) })
      setPin('')
      setOldPin('')
      setConfirmation('')
      onSuccess()
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  return (
    <PortalDialog
      title={t(`pin.${mode}`)}
      description={t('pin.description')}
      onClose={() => {
        if (!mutation.isPending) onClose()
      }}
    >
      <LockKeyhole size={36} className="text-action-accent" aria-hidden="true" />
      <Form noValidate onSubmit={() => void handleSubmit()} className="space-y-4" aria-label={t(`pin.${mode}`)}>
        {mode === 'change' ? (
          <FormField label={t('pin.old')} required>
            <Input
              aria-label={t('pin.old')}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={oldPin}
              onChange={(e) => {
                setOldPin(e.target.value)
                setError('')
              }}
            />
          </FormField>
        ) : null}
        <FormField label={t('pin.code')} required error={error}>
          <Input
            aria-label={t('pin.code')}
            autoFocus
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              setError('')
            }}
          />
        </FormField>
        {mode !== 'unlock' ? (
          <FormField label={t('pin.confirm')} required>
            <Input
              aria-label={t('pin.confirm')}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value)
                setError('')
              }}
            />
          </FormField>
        ) : null}
        <SubmitButton loading={mutation.isPending} className="w-full min-h-11">
          {t(`pin.${mode}`)}
        </SubmitButton>
      </Form>
    </PortalDialog>
  )
}
