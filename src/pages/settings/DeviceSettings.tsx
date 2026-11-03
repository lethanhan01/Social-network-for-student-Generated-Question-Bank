import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Monitor, Smartphone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { PortalDialog } from '@/components/portal/PortalDialog'
import { QueryFeedback } from '@/components/portal/QueryFeedback'
import { useDevicesQuery, useRevokeDeviceMutation } from '@/hooks/queries/usePortalQuery'
import { formatDateTime } from '@/utils/date'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { DeviceResponse } from '@/types'

export function DeviceSettings() {
  const { t } = useTranslation('portal')
  const query = useDevicesQuery()
  const revoke = useRevokeDeviceMutation()
  const [selected, setSelected] = useState<DeviceResponse | null>(null)
  async function handleRevoke() {
    if (!selected?.device_id) return
    try {
      await revoke.mutateAsync(selected.device_id)
      setSelected(null)
      toast.success(t('devices.revoked'))
    } catch (cause) {
      toast.error(getApiError(cause, t('error')))
    }
  }
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">{t('devices.title')}</h2>
      <p className="text-sm text-fg-secondary">{t('devices.description')}</p>
      <QueryFeedback loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
      {!query.isLoading && !query.error && !query.data?.devices?.length ? (
        <EmptyState title={t('devices.empty')} />
      ) : null}
      {query.data?.devices?.map((device) => (
        <article
          key={device.device_id}
          className="flex flex-wrap items-center gap-4 rounded-xl border border-line-subtle p-4"
        >
          {device.platform === 'ANDROID' || device.platform === 'IOS' ? (
            <Smartphone className="text-action-accent" />
          ) : (
            <Monitor className="text-action-accent" />
          )}
          <section className="flex-1 min-w-0">
            <h3 className="font-semibold">{device.device_name || device.platform}</h3>
            <p className="text-xs text-fg-secondary">{formatDateTime(device.last_active_at)}</p>
          </section>
          {device.is_current_device ? (
            <p className="flex gap-2 text-xs text-action-accent">
              <ShieldCheck size={16} />
              {t('devices.current')}
            </p>
          ) : (
            <Button
              variant="outline"
              disabled={!device.device_id || revoke.isPending}
              onClick={() => setSelected(device)}
            >
              {t('devices.revoke')}
            </Button>
          )}
        </article>
      ))}
      {selected ? (
        <PortalDialog
          title={t('devices.revoke')}
          description={t('devices.confirm', { name: selected.device_name || selected.platform })}
          onClose={() => {
            if (!revoke.isPending) setSelected(null)
          }}
        >
          <footer className="flex justify-end gap-3">
            <Button variant="outline" disabled={revoke.isPending} onClick={() => setSelected(null)}>
              {t('cancel')}
            </Button>
            <Button variant="danger" loading={revoke.isPending} onClick={() => void handleRevoke()}>
              {t('confirm')}
            </Button>
          </footer>
        </PortalDialog>
      ) : null}
    </section>
  )
}
