import { BookOpenCheck, MessageSquare, Pencil, Trash2, ThumbsUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Card } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { formatDate } from '@/utils/date'
import type { SubmissionSessionSummaryDto } from '@/types'

interface ProposalSessionCardProps {
  session: SubmissionSessionSummaryDto
  onEdit: (sessionId: number) => void
  onDelete: (session: SubmissionSessionSummaryDto) => void
}

interface SessionWithStatus {
  status?: string
}

export function ProposalSessionCard({ session, onEdit, onDelete }: Readonly<ProposalSessionCardProps>) {
  const { t } = useTranslation('academic')
  const sessionId = session.session_id ?? 0
  const sessionStatus = ((session as unknown as SessionWithStatus).status ?? 'PENDING').toUpperCase()

  return (
    <Card as="article" variant="compact" className="flex h-full flex-col gap-3">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="accent" size="xs">
            {session.subject_code ?? session.subject_name}
          </Badge>
          {(() => {
            if (sessionStatus === 'APPROVED' || sessionStatus === 'RESOLVED') {
              return <Badge tone="success" size="xs">{t('proposals.card.statusApproved')}</Badge>
            }
            if (sessionStatus === 'REJECTED') {
              return <Badge tone="danger" size="xs">{t('proposals.card.statusRejected')}</Badge>
            }
            if (sessionStatus === 'REVIEWING') {
              return <Badge tone="info" size="xs">{t('proposals.card.statusReviewing')}</Badge>
            }
            return <Badge tone="warning" size="xs">{t('proposals.card.statusPending')}</Badge>
          })()}
        </div>
        <Heading level={3} size="xs" truncate>
          {session.title}
        </Heading>
        {session.content ? (
          <Text size="sm" tone="muted" clamp={2}>
            {session.content}
          </Text>
        ) : null}
      </header>

      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-secondary">
        <li>{t('proposals.card.questions', { count: session.question_counts ?? 0 })}</li>
        <li className="flex items-center gap-1">
          <ThumbsUp size={14} aria-hidden="true" />
          <Text className="sr-only">{t('proposals.card.reactions')}</Text>
          {session.react_count ?? 0}
        </li>
        <li className="flex items-center gap-1">
          <MessageSquare size={14} aria-hidden="true" />
          <Text className="sr-only">{t('proposals.card.comments')}</Text>
          {session.comment_count ?? 0}
        </li>
      </ul>

      <footer className="mt-auto space-y-3">
        <Text size="xs" tone="dim">
          {session.session_code ? `${session.session_code} · ` : ''}
          {session.created_at ? formatDate(session.created_at) : null}
        </Text>
        {(() => {
          const isApproved = sessionStatus === 'APPROVED' || sessionStatus === 'RESOLVED'
          const isPending = sessionStatus === 'PENDING'

          return (
            <nav aria-label={session.title} className="flex flex-wrap gap-2">
              {isApproved ? (
                <ButtonLink to={`/practice/${sessionId}`} size="sm" leftIcon={<BookOpenCheck size={16} />} touchTarget>
                  {t('proposals.card.practice')}
                </ButtonLink>
              ) : null}
              {isPending ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    touchTarget
                    leftIcon={<Pencil size={16} />}
                    onClick={() => onEdit(sessionId)}
                    aria-label={t('proposals.card.editAria', { title: session.title })}
                  >
                    {t('proposals.card.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    tone="danger"
                    touchTarget
                    leftIcon={<Trash2 size={16} />}
                    onClick={() => onDelete(session)}
                    aria-label={t('proposals.card.deleteAria', { title: session.title })}
                  >
                    {t('proposals.card.delete')}
                  </Button>
                </>
              ) : null}
            </nav>
          )
        })()}
      </footer>
    </Card>
  )
}
