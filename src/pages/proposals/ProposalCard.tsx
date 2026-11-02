import { FileQuestion, Eye, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'
import { Button } from '@/components/ui/actions/Button'
import { ButtonLink } from '@/components/ui/actions/Button'
import { Heading } from '@/components/ui/typography/Heading'
import { Text } from '@/components/ui/typography/Text'
import { formatDateTime } from '@/utils/date'
import { canPracticeSession, readSessionStatus, type AcademicSession } from '@/types/academic.types'

export function ProposalCard({ session, onOpen }: Readonly<{
  session: AcademicSession; onOpen: (id: number) => void
}>) {
  const { t } = useTranslation('academic')
  const status = readSessionStatus(session)
  return (
    <Card as="article" className="space-y-4 rounded-2xl">
      <header className="flex items-start justify-between gap-3">
        <hgroup className="space-y-1">
          <Text size="sm" className="font-semibold text-action-accent">{session.subject_name ?? session.subject_code}</Text>
          <Text size="xs" tone="muted">{formatDateTime(session.created_at)}</Text>
        </hgroup>
        <Badge tone={status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'danger' : 'neutral'}>{t(`status.${status}`)}</Badge>
      </header>
      <Heading level={2} className="text-lg font-bold">{session.title ?? t('proposals.untitled')}</Heading>
      {session.content ? <Text size="sm" className="whitespace-pre-wrap">{session.content}</Text> : null}
      <Text size="sm" tone="muted" className="flex items-center gap-2"><FileQuestion size={16} />{t('questionCount', { count: session.question_counts ?? 0 })}</Text>
      <footer className="flex flex-wrap gap-2 border-t border-line-subtle pt-3">
        {session.session_id ? <Button variant="ghost" onClick={() => onOpen(session.session_id!)} leftIcon={<Eye size={18} />}>{t('proposals.detail')}</Button> : null}
        {session.session_id && canPracticeSession(session) ? <ButtonLink to={`/practice/${session.session_id}`} variant="secondary" leftIcon={<Play size={18} />}>{t('practice.open')}</ButtonLink> : null}
      </footer>
    </Card>
  )
}
