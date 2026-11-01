import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions/Button'
import { QueryFeedback } from './QueryFeedback'

export function LoadMore({
  query,
}: Readonly<{
  query: {
    hasNextPage: boolean
    isFetchingNextPage: boolean
    isFetchNextPageError: boolean
    error: unknown
    fetchNextPage: () => Promise<unknown>
  }
}>) {
  const { t } = useTranslation()
  return (
    <footer className="space-y-3 py-2">
      {query.isFetchNextPageError ? (
        <QueryFeedback error={query.error} onRetry={query.fetchNextPage} />
      ) : null}
      {query.hasNextPage ? (
        <Button
          variant="outline"
          className="min-h-11 w-full"
          loading={query.isFetchingNextPage}
          onClick={() => {
            void query.fetchNextPage()
          }}
        >
          {t('social.loadMore')}
        </Button>
      ) : null}
    </footer>
  )
}
