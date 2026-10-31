import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LockKeyhole } from 'lucide-react'
import { Form, FormField, Input } from '@/components/ui/forms'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { PinModal } from '@/components/portal/PinModal'
import { passwordSchema } from '@/components/portal/portal.schemas'
import { usePasswordMutation } from '@/hooks/queries/usePortalQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'

export function SecuritySettings() {
  const { t } = useTranslation('portal')
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [pinMode, setPinMode] = useState<'setup' | 'change' | null>(null)
  const mutation = usePasswordMutation()
  async function handleSubmit() {
    if (!oldPassword || !passwordSchema.safeParse(password).success) {
      setError(t('security.invalid'))
      return
    }
    if (password !== confirmation) {
      setError(t('security.mismatch'))
      return
    }
    try {
      await mutation.mutateAsync({ old_password: oldPassword, new_password: password })
      setOldPassword('')
      setPassword('')
      setConfirmation('')
      toast.success(t('saved'))
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">{t('security.title')}</h2>
      <Form
        noValidate
        aria-label={t('security.title')}
        onSubmit={() => void handleSubmit()}
        className="space-y-4 max-w-lg"
      >
        <FormField label={t('security.old')} required>
          <Input
            aria-label={t('security.old')}
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value)
              setError('')
            }}
          />
        </FormField>
        <FormField label={t('security.new')} hint={t('security.hint')} required>
          <Input
            aria-label={t('security.new')}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
          />
        </FormField>
        <FormField label={t('security.confirm')} error={error} required>
          <Input
            aria-label={t('security.confirm')}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => {
              setConfirmation(e.target.value)
              setError('')
            }}
          />
        </FormField>
        <SubmitButton loading={mutation.isPending}>{t('security.change')}</SubmitButton>
      </Form>
      <section className="border-t border-line-subtle pt-6 space-y-3">
        <h3 className="flex gap-2 font-bold">
          <LockKeyhole size={20} />
          {t('vault.title')}
        </h3>
        <p className="text-sm text-fg-secondary">{t('pin.description')}</p>
        <footer className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setPinMode('setup')}>
            {t('pin.setup')}
          </Button>
          <Button variant="outline" onClick={() => setPinMode('change')}>
            {t('pin.change')}
          </Button>
        </footer>
      </section>
      {pinMode ? (
        <PinModal
          mode={pinMode}
          onClose={() => setPinMode(null)}
          onSuccess={() => {
            setPinMode(null)
            toast.success(t('saved'))
          }}
        />
      ) : null}
    </section>
  )
}
