import { useTranslation } from 'react-i18next'
import { History, TrendingUp, X } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading } from '@/components/ui/typography'
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
    <div className="space-y-6">
      {/* Saved Searches (UC30) */}
      {savedSearches.length > 0 ? (
        <Card className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card space-y-3">
          <header className="flex items-center gap-2">
            <History size={16} className="text-action-accent" />
            <Heading level={3} className="text-xs font-bold text-text-primary">
              {t('search.recentHistory', 'Lịch sử tìm kiếm gần đây')}
            </Heading>
          </header>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [History chips container] */}
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((item) => (
              /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Single search chip] */
              <div
                key={item.saved_search_id || item.query_text}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-line-subtle text-xs hover:border-action-accent/50"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => item.query_text && onSelectKeyword(item.query_text)}
                  className="p-0 h-auto font-medium text-xs text-text-primary hover:text-action-accent"
                >
                  {item.query_text}
                </Button>
                {item.saved_search_id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => item.saved_search_id && deleteMutation.mutate(item.saved_search_id)}
                    className="w-4 h-4 p-0 text-text-muted hover:text-tone-danger rounded-full"
                    aria-label={`Xóa từ khóa ${item.query_text}`}
                  >
                    <X size={11} />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Trending Searches */}
      {trendingSearches.length > 0 ? (
        <Card className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card space-y-3">
          <header className="flex items-center gap-2">
            <TrendingUp size={16} className="text-tone-warning" />
            <Heading level={3} className="text-xs font-bold text-text-primary">
              {t('search.trendingTitle', 'Xu hướng tìm kiếm thịnh hành')}
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
