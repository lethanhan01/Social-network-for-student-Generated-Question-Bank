import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search as SearchIcon, Users, FileText, HelpCircle, Layers } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { Button } from '@/components/ui/actions'
import { SearchInput } from '@/components/ui/forms'
import { Card } from '@/components/ui/data-display'
import { useGlobalSearchQuery } from '@/hooks/queries/useSearchQuery'
import { SearchResultItemCard } from './SearchResultItemCard'
import { SearchHistorySection } from './SearchHistorySection'
import { QueryFeedback } from '@/components/social/QueryFeedback'

type SearchType = 'ALL' | 'POST' | 'QUESTION' | 'USER'

export default function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const queryParam = searchParams.get('q') || ''
  const typeParam = searchParams.get('type')
  const activeType: SearchType = typeParam === 'POST' || typeParam === 'QUESTION' || typeParam === 'USER' ? typeParam : 'ALL'

  const [keyword, setKeyword] = useState(queryParam)

  // Sync internal state when URL params change
  useEffect(() => {
    setKeyword(queryParam)
  }, [queryParam])

  // Debounced URL sync on keyword change
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get('q') || ''
      if (keyword.trim() !== current) {
        const nextParams = new URLSearchParams(searchParams)
        if (keyword.trim()) {
          nextParams.set('q', keyword.trim())
        } else {
          nextParams.delete('q')
        }
        setSearchParams(nextParams, { replace: true })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword, searchParams, setSearchParams])

  function handleTypeChange(newType: SearchType) {
    const nextParams = new URLSearchParams(searchParams)
    if (newType === 'ALL') {
      nextParams.delete('type')
    } else {
      nextParams.set('type', newType)
    }
    setSearchParams(nextParams, { replace: true })
  }

  function handleSelectHistoryKeyword(selected: string) {
    setKeyword(selected)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('q', selected)
    setSearchParams(nextParams)
  }

  const { data, isLoading, isError, error, refetch } = useGlobalSearchQuery(
    { keyword: queryParam, type: activeType === 'ALL' ? undefined : activeType, limit: 30 },
    { enabled: Boolean(queryParam.trim()) }
  )

  const items = data?.items || []
  const hasQuery = Boolean(queryParam.trim())

  return (
    <main className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {t('search.title', 'Tìm kiếm toàn cục')}
        </Heading>
        <Text size="sm" tone="muted">{t('search.subtitle', 'Tìm kiếm bạn học, giảng viên, bài viết thảo luận và ngân hàng câu hỏi ôn tập')}</Text>
      </header>

      {/* Search Input Bar */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Search input wrapper] */}
      <div className="relative">
        <SearchInput
          aria-label="Nhập từ khóa tìm kiếm"
          placeholder={t('search.inputPlaceholder', 'Nhập tên sinh viên, môn học, bài viết hoặc câu hỏi ôn tập...')}
          value={keyword}
          onChange={(val) => setKeyword(val)}
          className="w-full min-h-12 text-sm shadow-sm"
        />
      </div>

      {/* Filter Tabs */}
      <nav aria-label="Bộ lọc loại thực thể" className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-line-subtle">
        <Button variant={activeType === 'ALL' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange('ALL')} className="text-xs min-h-11" leftIcon={<Layers size={15} />}>
          {t('search.filterAll', 'Tất cả')}
        </Button>
        <Button variant={activeType === 'USER' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange('USER')} className="text-xs min-h-11" leftIcon={<Users size={15} />}>
          {t('search.filterUser', 'Người dùng')}
        </Button>
        <Button variant={activeType === 'POST' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange('POST')} className="text-xs min-h-11" leftIcon={<FileText size={15} />}>
          {t('search.filterPost', 'Bài viết')}
        </Button>
        <Button variant={activeType === 'QUESTION' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange('QUESTION')} className="text-xs min-h-11" leftIcon={<HelpCircle size={15} />}>
          {t('search.filterQuestion', 'Câu hỏi')}
        </Button>
      </nav>

      {/* Main Content: Results or History */}
      {!hasQuery ? (
        <SearchHistorySection onSelectKeyword={handleSelectHistoryKeyword} />
      ) : isError ? (
        <QueryFeedback error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Card className="p-6 sm:p-10 text-center bg-surface border-line-subtle rounded-2xl">
          <Text size="sm" tone="muted">{t('search.searching', 'Đang tìm kiếm kết quả...')}</Text>
        </Card>
      ) : items.length > 0 ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Search results stack] */
        <div className="space-y-3">
          <Text size="xs" tone="muted">
            {t('search.resultCount', { count: items.length, defaultValue: `Tìm thấy ${items.length} kết quả phù hợp` })}
          </Text>
          {items.map((item, idx) => {
            const hitKey = item.post?.post_id ? `post-${item.post.post_id}` : item.user?.user_id ? `user-${item.user.user_id}` : item.question?.question_id ? `q-${item.question.question_id}` : `hit-${idx}`
            return <SearchResultItemCard key={hitKey} item={item} />
          })}
        </div>
      ) : (
        <Card className="p-6 sm:p-10 text-center bg-surface border-line-subtle rounded-2xl space-y-2">
          <SearchIcon size={28} className="mx-auto text-text-muted" />
          <Heading level={3} className="text-base font-bold text-text-primary">
            {t('search.noResultsTitle', 'Không tìm thấy kết quả phù hợp')}
          </Heading>
          <Text size="xs" tone="muted">
            {t('search.noResultsDesc', 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển đổi loại danh mục bộ lọc.')}
          </Text>
        </Card>
      )}
    </main>
  )
}
