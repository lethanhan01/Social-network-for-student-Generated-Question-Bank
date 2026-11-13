import { type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heading } from '@/components/ui/typography/Heading'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { Form } from '@/components/ui/forms/Form'
import { FormField } from '@/components/ui/forms/FormField'
import { SearchInput } from '@/components/ui/forms/SearchInput'
import {
  useInfiniteSearchQuery,
  useRecordSearchMutation,
  type SearchType,
} from '@/hooks/queries/useSocialListsQuery'
import { QueryFeedback } from '@/components/social/QueryFeedback'
import { LoadMore } from '@/components/social/LoadMore'
import { SearchResultItemCard } from './SearchResultItemCard'
import { SearchHistorySection } from './SearchHistorySection'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { useDebounceValue } from '@/hooks/useDebounce'

const TYPES: SearchType[] = ['ALL', 'USER', 'POST', 'QUESTION', 'SESSION', 'SUBJECT']
function SearchBox({
  keyword,
  onSearch,
  onChange,
}: Readonly<{
  keyword: string
  onSearch: (value: string) => void
  onChange: (value: string) => void
}>) {
  const { t } = useTranslation()
  function submit(event: FormEvent) {
    event.preventDefault()
    onSearch(keyword.trim())
  }
  return (
    <Form onSubmit={submit} noValidate className="flex gap-2">
      <FormField className="flex-1">
        <SearchInput
          aria-label={t('search.placeholder')}
          value={keyword}
          onChange={onChange}
          placeholder={t('search.placeholder')}
        />
      </FormField>
      <SubmitButton>{t('social.searchSubmit')}</SubmitButton>
    </Form>
  )
}

export default function SearchPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const keyword = params.get('q') ?? ''
  const type = TYPES.find((value) => value === params.get('type')) ?? 'ALL'
  const debounced = useDebounceValue(keyword, 300)
  const query = useInfiniteSearchQuery(debounced, type)
  const record = useRecordSearchMutation()
  const items = query.data?.pages.flatMap((page) => page.items ?? []) ?? []
  function update(value: string, confirmed = false) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set('q', value)
        else next.delete('q')
        return next
      },
      { replace: !confirmed }
    )
    if (confirmed && value.length >= 2)
      record.mutate(value, {
        onError: (error) => toast.error(getApiError(error, t('zone2.actionError'))),
      })
  }
  return (
    <section className="mx-auto max-w-3xl space-y-3">
      <header className="space-y-1">
        <Heading level={1} className="text-2xl font-bold">
          {t('search.title')}
        </Heading>
        <p className="text-sm text-text-muted">{t('social.searchSubtitle')}</p>
      </header>
      <SearchBox
        keyword={keyword}
        onChange={(value) => update(value)}
        onSearch={(value) => update(value, true)}
      />
      <nav aria-label={t('search.title')} className="flex gap-2 overflow-x-auto">
        {TYPES.map((value) => (
          <Button
            key={value}
            variant={type === value ? 'secondary' : 'ghost'}
            aria-pressed={type === value}
            onClick={() =>
              setParams((previous) => {
                const next = new URLSearchParams(previous)
                next.set('type', value)
                return next
              })
            }
          >
            {value === 'SESSION'
              ? t('social.searchSession')
              : value === 'SUBJECT'
                ? t('social.searchSubject')
                : t(
                    `search.filter_${value === 'ALL' ? 'all' : value === 'USER' ? 'users' : value === 'POST' ? 'posts' : 'questions'}`
                  )}
          </Button>
        ))}
      </nav>
      {!keyword.trim() ? (
        <SearchHistorySection onSelectKeyword={(value) => update(value, true)} />
      ) : (
        <>
          {query.isPending || (query.isError && !query.data) ? (
            <QueryFeedback pending={query.isPending} error={query.error} onRetry={query.refetch} />
          ) : null}
          {query.isSuccess && items.length === 0 ? <p>{t('search.empty_results')}</p> : null}
          {items.length > 0 ? (
            <p className="text-sm text-text-muted">
              {t('social.results', {
                count: items.length,
                total: query.data?.pages[0]?.total_hits ?? items.length,
              })}
            </p>
          ) : null}
          {items.map((item) => (
            <SearchResultItemCard
              key={`${item.type}-${item.user?.user_id ?? item.post?.post_id ?? item.question?.question_id ?? item.session?.session_id ?? item.subject?.subject_id}`}
              item={item}
            />
          ))}
          <LoadMore query={query} />
        </>
      )}
    </section>
  )
}
