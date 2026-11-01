import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search as SearchIcon, Users, FileText, HelpCircle, Layers } from 'lucide-react'
import { Heading, Text, Icon } from '@/components/ui/typography'
import { SearchInput } from '@/components/ui/forms'
import { Card } from '@/components/ui/data-display'
import { Page } from '@/components/ui/layout'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/navigation'
import { useGlobalSearchQuery } from '@/hooks/queries/useSearchQuery'
import { SearchResultItemCard } from './SearchResultItemCard'
import { SearchHistorySection } from './SearchHistorySection'
import { QueryFeedback } from '@/components/social/QueryFeedback'
import type { SearchResultItemDto } from '@/types'

type SearchType = 'ALL' | 'POST' | 'QUESTION' | 'USER'

function getSearchHitKey(item: SearchResultItemDto, idx: number): string {
  if (item.post?.post_id) return `post-${item.post.post_id}`
  if (item.user?.user_id) return `user-${item.user.user_id}`
  if (item.question?.question_id) return `q-${item.question.question_id}`
  return `hit-${idx}`
}

export default function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const queryParam = searchParams.get('q') || ''
  const typeParam = searchParams.get('type')
  const activeType: SearchType = typeParam === 'POST' || typeParam === 'QUESTION' || typeParam === 'USER' ? typeParam : 'ALL'

  const [keyword, setKeyword] = useState(queryParam)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Event-driven Debounced URL Sync (Vercel Best Practice: No Chained useEffects)
  function handleKeywordChange(val: string) {
    setKeyword(val)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      const trimmed = val.trim()
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (trimmed) {
            nextParams.set('q', trimmed)
          } else {
            nextParams.delete('q')
          }
          return nextParams
        },
        { replace: true }
      )
    }, 300)
  }

  function handleTypeChange(newType: SearchType) {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev)
        if (newType === 'ALL') {
          nextParams.delete('type')
        } else {
          nextParams.set('type', newType)
        }
        return nextParams
      },
      { replace: true }
    )
  }

  function handleSelectHistoryKeyword(selected: string) {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setKeyword(selected)
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev)
      nextParams.set('q', selected)
      return nextParams
    })
  }

  const { data, isLoading, isError, error, refetch } = useGlobalSearchQuery(
    { keyword: queryParam, type: activeType === 'ALL' ? undefined : activeType, limit: 30 },
    { enabled: Boolean(queryParam.trim()) }
  )

  const items = data?.items || []
  const hasQuery = Boolean(queryParam.trim())

  function renderContent() {
    if (!hasQuery) {
      return <SearchHistorySection onSelectKeyword={handleSelectHistoryKeyword} />
    }
    if (isError) {
      return <QueryFeedback error={error} onRetry={refetch} />
    }
    if (isLoading) {
      return (
        <Card className="p-6 sm:p-10 text-center bg-surface border-line-subtle rounded-2xl">
          <Text size="sm" tone="muted">{t('search.searching', 'Đang tìm kiếm kết quả...')}</Text>
        </Card>
      )
    }
    if (items.length > 0) {
      return (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Search results stack] */
        <div className="space-y-3">
          <Text size="xs" tone="muted">
            {t('search.resultCount', { count: items.length, defaultValue: `Tìm thấy ${items.length} kết quả phù hợp` })}
          </Text>
          {items.map((item, hitIndex) => {
            const hitKey = getSearchHitKey(item, hitIndex)
            return <SearchResultItemCard key={hitKey} item={item} />
          })}
        </div>
      )
    }
    return (
      <Card className="p-6 sm:p-10 text-center bg-surface border-line-subtle rounded-2xl space-y-2">
        <Icon icon={SearchIcon} size="xl" fg="muted" className="mx-auto" />
        <Heading level={3} className="text-base font-bold text-text-primary">
          {t('search.noResultsTitle', 'Không tìm thấy kết quả phù hợp')}
        </Heading>
        <Text size="xs" tone="muted">
          {t('search.noResultsDesc', 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển đổi loại danh mục bộ lọc.')}
        </Text>
      </Card>
    )
  }

  const content = renderContent()

  return (
    <Page className="max-w-4xl py-6 px-4 space-y-6">
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
          onChange={handleKeywordChange}
          className="w-full min-h-12 text-sm shadow-sm"
        />
      </div>

      {/* Filter Tabs Component */}
      <Tabs value={activeType} onValueChange={(val) => handleTypeChange(val as SearchType)} variant="pills">
        <TabsList aria-label={t('search.filterAria', 'Bộ lọc loại thực thể')} className="overflow-x-auto">
          <TabsTrigger value="ALL" leftIcon={<Layers size={15} />}>
            {t('search.filterAll', 'Tất cả')}
          </TabsTrigger>
          <TabsTrigger value="USER" leftIcon={<Users size={15} />}>
            {t('search.filterUser', 'Người dùng')}
          </TabsTrigger>
          <TabsTrigger value="POST" leftIcon={<FileText size={15} />}>
            {t('search.filterPost', 'Bài viết')}
          </TabsTrigger>
          <TabsTrigger value="QUESTION" leftIcon={<HelpCircle size={15} />}>
            {t('search.filterQuestion', 'Câu hỏi')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content: Results or History */}
      {content}
    </Page>
  )
}
