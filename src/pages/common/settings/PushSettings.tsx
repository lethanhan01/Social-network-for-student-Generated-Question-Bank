import { QuietHoursForm } from './QuietHoursForm'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/forms/Switch'
import { QueryFeedback } from '@/components/portal/QueryFeedback'
import { usePushSettingsQuery, useUpdatePushMutation } from '@/hooks/queries/usePortalQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { UpdatePushSettingsRequestDto } from '@/types'

export function PushSettings() {
  const { t } = useTranslation('portal')
  const query = usePushSettingsQuery()
  const mutation = useUpdatePushMutation()
  async function handleUpdate(payload: UpdatePushSettingsRequestDto) {
    try {
      await mutation.mutateAsync(payload)
      toast.success(t('saved'))
    } catch (cause) {
      toast.error(getApiError(cause, t('error')))
    }
  }
  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold">{t('push.title')}</h2>
      <p className="text-sm text-fg-secondary">{t('push.description')}</p>
      <QueryFeedback loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
      {query.data ? (
        <section className="divide-y divide-line-subtle">
          {(['push_enabled', 'sound_enabled', 'vibration_enabled'] as const).map((key) => (
            <article key={key} className="py-5">
              <Switch
                label={t(`push.${key}`)}
                description={t(`push.${key}Description`)}
                checked={!!query.data[key]}
                disabled={mutation.isPending}
                onCheckedChange={(value) => void handleUpdate({ [key]: value })}
              />
            </article>
          ))}
        </section>
      ) : null}
      {query.data ? <QuietHoursForm initial={query.data.quiet_hours} /> : null}
    </section>
  )
}
