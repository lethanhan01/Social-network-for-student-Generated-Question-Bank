import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, FormField, Input, Switch } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { useUpdatePushMutation } from '@/hooks/queries/usePortalQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { QuietHoursDto } from '@/types/api.generated'

export function QuietHoursForm({ initial }: { initial?: QuietHoursDto }) {
  const { t } = useTranslation('portal')
  const [enabled, setEnabled] = useState(initial?.enabled ?? false)
  const [start, setStart] = useState(initial?.start_time ?? '22:00')
  const [end, setEnd] = useState(initial?.end_time ?? '07:00')
  const [error, setError] = useState('')
  const mutation = useUpdatePushMutation()
  async function handleSubmit() {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end) || start === end) {
      setError(t('push.invalidTime'))
      return
    }
    try {
      await mutation.mutateAsync({ quiet_hours: { enabled, start_time: start, end_time: end } })
      toast.success(t('saved'))
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  return (
    <Form
      noValidate
      aria-label={t('push.quietHours')}
      className="space-y-4 border-t border-line-subtle pt-5"
      onSubmit={() => void handleSubmit()}
    >
      <Switch label={t('push.quietHours')} checked={enabled} onCheckedChange={setEnabled} />
      <section className="grid grid-cols-2 gap-4">
        <FormField label={t('push.start')}>
          <Input
            type="time"
            aria-label={t('push.start')}
            value={start}
            onChange={(e) => {
              setStart(e.target.value)
              setError('')
            }}
          />
        </FormField>
        <FormField label={t('push.end')} error={error}>
          <Input
            type="time"
            aria-label={t('push.end')}
            value={end}
            onChange={(e) => {
              setEnd(e.target.value)
              setError('')
            }}
          />
        </FormField>
      </section>
      <SubmitButton variant="outline" loading={mutation.isPending}>
        {t('save')}
      </SubmitButton>
    </Form>
  )
}
