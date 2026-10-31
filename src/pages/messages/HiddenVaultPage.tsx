import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { Page, PageHeader } from '@/components/ui/layout'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Card } from '@/components/ui/data-display/Card'
import { PinModal } from '@/components/portal/PinModal'
import { queryKeys } from '@/lib/query-keys'
import { Inbox } from './MessagesPage'

export default function HiddenVaultPage() {
  const { t } = useTranslation('portal')
  const client = useQueryClient()
  const [unlocked, setUnlocked] = useState(false)
  const [mode, setMode] = useState<'unlock' | 'setup' | null>(null)
  useEffect(
    () => () => {
      client.removeQueries({ queryKey: queryKeys.conversations.hidden() })
      client.removeQueries({
        predicate: (query) => query.queryKey[0] === 'conversations' && query.queryKey[1] === 'messages',
      })
    },
    [client]
  )
  function handleLock() {
    setUnlocked(false)
    client.removeQueries({ queryKey: queryKeys.conversations.hidden() })
    client.removeQueries({
      predicate: (query) => query.queryKey[0] === 'conversations' && query.queryKey[1] === 'messages',
    })
  }
  return (
    <Page>
      <PageHeader eyebrow={t('eyebrow')} title={t('vault.title')} description={t('vault.description')} />
      <nav className="mb-4 flex justify-between gap-3">
        <ButtonLink to="/messages" variant="outline">
          {t('messages.title')}
        </ButtonLink>
        {unlocked ? (
          <Button variant="outline" onClick={handleLock}>
            <LockKeyhole size={18} />
            {t('vault.lock')}
          </Button>
        ) : null}
      </nav>
      {unlocked ? (
        <Inbox hidden />
      ) : (
        <Card as="section" className="mx-auto max-w-xl p-5 sm:p-12 text-center space-y-6">
          <ShieldCheck size={56} className="mx-auto text-action-accent" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('vault.locked')}</h2>
          <p className="text-sm leading-relaxed text-fg-secondary">{t('vault.explanation')}</p>
          <footer className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => setMode('unlock')}>
              <LockKeyhole size={18} />
              {t('pin.unlock')}
            </Button>
            <Button variant="outline" onClick={() => setMode('setup')}>
              {t('pin.setup')}
            </Button>
          </footer>
        </Card>
      )}
      {mode ? (
        <PinModal
          mode={mode}
          onClose={() => setMode(null)}
          onSuccess={() => {
            if (mode === 'unlock') setUnlocked(true)
            setMode(null)
          }}
        />
      ) : null}
    </Page>
  )
}
