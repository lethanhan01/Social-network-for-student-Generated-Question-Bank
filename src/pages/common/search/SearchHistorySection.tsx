import { useTranslation } from 'react-i18next'
import { History, TrendingUp } from 'lucide-react'
import { Card, Chip } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Icon } from '@/components/ui/typography'
import {
  useSavedAndTrendingSearchesQuery,
  useDeleteSavedSearchMutation,
} from '@/hooks/queries/useSearchQuery'

interface SearchHistorySectionProps {
  onSelectKeyword: (keyword: string) => void
}

export function SearchHistorySection({ onSelectKeyword }: Readonly<SearchHistorySectionProps>) {
  const { t } = useTranslation()
  const { data } = useSavedAndTrendingSearchesQuery()
  const deleteMutation = useDeleteSavedSearchMutation()

  const savedSearches = data?.saved_searches || []
  const trendingSearches = data?.trending_searches || []

  if (savedSearches.length === 0 && trendingSearches.length === 0) {
    return null
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [History & trending container stack] */
    <div className="space-y-3">
      {/* Saved Searches (UC30) */}
      {savedSearches.length > 0 ? (
        <Card as="section" padding="none" className="social-card space-y-2 border-line-subtle p-3">
          <header className="flex items-center gap-2">
            <Icon icon={History} size="sm" tone="accent" />
            <Heading level={3} className="text-sm font-bold text-fg-primary">
              {t('search.recentHistory')}
            </Heading>
          </header>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [History chips container] */}
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((item) => (
              <Chip
                key={item.saved_search_id || item.query_text}
                label={item.query_text}
                tone="neutral"
                size="md"
                removable={Boolean(item.saved_search_id)}
                onClick={() => item.query_text && onSelectKeyword(item.query_text)}
                onRemove={() => item.saved_search_id && deleteMutation.mutate(item.saved_search_id)}
                className="min-h-11 cursor-pointer"
              />
            ))}
          </div>
        </Card>
      ) : null}

      {/* Trending Searches */}
      {trendingSearches.length > 0 ? (
        <Card as="section" padding="none" className="social-card space-y-2 border-line-subtle p-3">
          <header className="flex items-center gap-2">
            <Icon icon={TrendingUp} size="sm" tone="warning" />
            <Heading level={3} className="text-sm font-bold text-fg-primary">
              {t('search.trendingTitle')}
            </Heading>
          </header>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Trending chips container] */}
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term, idx) => (
              <Button
                key={`${term}-${idx}`}
                variant="outline"
                size="sm"
                onClick={() => onSelectKeyword(term)}
                className="text-xs min-h-11 rounded-full px-3.5"
              >
                #{term}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
