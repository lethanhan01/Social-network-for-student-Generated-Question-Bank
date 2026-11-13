import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Form, SearchInput } from '@/components/ui/forms'
import { ButtonLink } from '@/components/ui/actions'

export function TopbarSearch() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/search')
    }
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Facebook style Topbar search container] */
    <div className="flex items-center">
      {/* Desktop Search: Pill Form with SearchInput */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Desktop pill search wrapper] */}
      <div className="hidden xl:flex items-center">
        <Form
          onSubmit={handleSubmit}
          noValidate
          aria-label={t('common.search')}
          className="flex items-center"
        >
          <SearchInput
            value={query}
            onChange={setQuery}
            onSearch={() => handleSubmit()}
            placeholder={t('common.searchPlaceholder')}
            size="sm"
            aria-label={t('common.searchPlaceholder')}
            className="w-48 2xl:w-64"
          />
        </Form>
      </div>

      {/* Tablet Search: Circular Icon Button Link */}
      <ButtonLink
        to="/search"
        variant="ghost"
        size="sm"
        aria-label={t('common.search')}
        title={t('common.search')}
        className="flex xl:hidden min-h-11 min-w-11 p-0 rounded-full items-center justify-center bg-surface-base border border-line-subtle text-fg-muted hover:text-fg-primary hover:bg-surface-card-hover"
      >
        <Search size={18} />
      </ButtonLink>
    </div>
  )
}

