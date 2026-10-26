import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { getApiError } from '@/lib/api-error'

interface QueryFeedbackProps {
  pending?: boolean
  error?: unknown
  onRetry: () => unknown
}

export function QueryFeedback({ pending, error, onRetry }: Readonly<QueryFeedbackProps>) {
  const { t } = useTranslation()
  return (
    <section aria-live="polite" className="space-y-3 p-4 text-center">
      <Text role={pending ? 'status' : 'alert'}>
        {pending ? t('zone2.loading') : getApiError(error, t('zone2.loadError'))}
      </Text>
      {!pending ? <Button onClick={() => { void onRetry() }}>{t('zone2.retry')}</Button> : null}
    </section>
  )
}
