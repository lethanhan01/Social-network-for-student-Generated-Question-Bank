import { useTranslation } from 'react-i18next'
import { LoaderCircle, CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { getApiError } from '@/lib/api-error'

export function QueryFeedback({ loading, error, retry }: { loading?: boolean; error?: unknown; retry?: () => void }) {
  const { t } = useTranslation('portal')
  if (loading)
    return (
      <p role="status" className="flex items-center justify-center gap-2 p-4 sm:p-8 text-fg-secondary">
        <LoaderCircle size={20} className="motion-safe:animate-spin" />
        {t('loading')}
      </p>
    )
  if (!error) return null
  return (
    <section role="alert" className="rounded-xl border border-status-danger-border bg-status-danger-bg p-4 space-y-3">
      <p className="flex items-center gap-2 text-sm text-status-danger-fg">
        <CircleAlert size={18} />
        {getApiError(error, t('error'))}
      </p>
      {retry ? (
        <Button variant="outline" onClick={retry}>
          {t('retry')}
        </Button>
      ) : null}
    </section>
  )
}
