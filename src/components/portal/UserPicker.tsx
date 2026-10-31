import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { Input } from '@/components/ui/forms/Input'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { useGlobalSearchQuery } from '@/hooks/queries/useSearchQuery'
import { useDebounceValue } from '@/hooks/useDebounce'
import { useAuthStore } from '@/stores/authStore'
import { QueryFeedback } from './QueryFeedback'

export interface PickedUser {
  id: number
  name: string
}
export function UserPicker({
  selected,
  onChange,
  multiple = true,
  excluded = [],
}: {
  selected: PickedUser[]
  onChange: (users: PickedUser[]) => void
  multiple?: boolean
  excluded?: number[]
}) {
  const { t } = useTranslation('portal')
  const [keyword, setKeyword] = useState('')
  const debounced = useDebounceValue(keyword, 300)
  const me = useAuthStore((s) => Number(s.user?.user_id ?? s.user?.userId))
  const query = useGlobalSearchQuery({ keyword: debounced, type: 'USER', limit: 20 })
  const users = query.data?.items?.flatMap((item) => (item.user ? [item.user] : [])) ?? []
  function handleToggle(id: number, name: string) {
    if (selected.some((user) => user.id === id)) onChange(selected.filter((user) => user.id !== id))
    else onChange(multiple ? [...selected, { id, name }] : [{ id, name }])
  }
  return (
    <section className="space-y-3">
      <Input
        aria-label={t('messages.findPeople')}
        leadingIcon={<Search size={18} />}
        placeholder={t('messages.findPeople')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <ul className="flex flex-wrap gap-2">
        {selected.map((user) => (
          <li key={user.id}>
            <Button variant="outline" onClick={() => onChange(selected.filter((item) => item.id !== user.id))}>
              {user.name}
              <X size={14} aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      {debounced ? (
        <QueryFeedback loading={query.isFetching} error={query.error} retry={() => void query.refetch()} />
      ) : (
        <p className="text-xs text-fg-secondary">{t('messages.findHint')}</p>
      )}
      <ul className="max-h-64 overflow-y-auto space-y-1">
        {users
          .filter((user) => user.user_id && user.user_id !== me && !excluded.includes(user.user_id))
          .map((user) => (
            <li key={user.user_id}>
              <Button
                variant="ghost"
                className="w-full min-h-12 justify-start"
                aria-pressed={selected.some((item) => item.id === user.user_id)}
                onClick={() => handleToggle(user.user_id ?? 0, user.full_name ?? '')}
              >
                <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                {user.full_name}
                {selected.some((item) => item.id === user.user_id) ? <Check size={16} /> : null}
              </Button>
            </li>
          ))}
      </ul>
      {debounced && !query.isFetching && !query.error && users.length === 0 ? (
        <p className="text-sm text-fg-secondary">{t('messages.noPeople')}</p>
      ) : null}
    </section>
  )
}
