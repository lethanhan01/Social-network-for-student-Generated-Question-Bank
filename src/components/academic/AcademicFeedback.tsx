import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions/Button'
import { Card } from '@/components/ui/data-display/Card'
import { Text } from '@/components/ui/typography/Text'
import { getApiError } from '@/lib/api-error'

export function AcademicFeedback({ pending, error, empty, onRetry }: Readonly<{
  pending?: boolean; error?: unknown; empty?: string; onRetry?: () => unknown
}>) {
  const { t } = useTranslation('academic')
  return (
    <Card as="section" className="space-y-4 rounded-2xl py-12 text-center" aria-live="polite">
      <Text role={error ? 'alert' : 'status'} tone="muted">
        {pending ? t('loading') : error ? getApiError(error, t('loadError')) : empty}
      </Text>
      {error && onRetry ? <Button variant="outline" onClick={() => { void onRetry() }}>{t('retry')}</Button> : null}
    </Card>
  )
}
