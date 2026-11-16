import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/actions/Button'
import { QueryFeedback } from './QueryFeedback'

export function LoadMore({
  query,
  autoLoad = false,
}: Readonly<{
  query: {
    hasNextPage: boolean
    isFetchingNextPage: boolean
    isFetchNextPageError: boolean
    isRefetching?: boolean
    error: unknown
    fetchNextPage: () => Promise<unknown>
  }
  autoLoad?: boolean
}>) {
  const { t } = useTranslation()
  const sentinelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (
      !autoLoad ||
      !query.hasNextPage ||
      query.isFetchingNextPage ||
      query.isRefetching ||
      query.isFetchNextPageError
    ) {
      return
    }
    const el = sentinelRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void query.fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [
    autoLoad,
    query.hasNextPage,
    query.isFetchingNextPage,
    query.isRefetching,
    query.isFetchNextPageError,
    query.fetchNextPage,
  ])

  return (
    <footer ref={sentinelRef} className="space-y-3 py-2">
      {query.isFetchNextPageError ? (
        <QueryFeedback error={query.error} onRetry={query.fetchNextPage} />
      ) : null}
      {autoLoad ? (
        query.isFetchingNextPage ? (
          <QueryFeedback pending onRetry={query.fetchNextPage} />
        ) : null
      ) : query.hasNextPage ? (
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
