import { FileText, Calendar, HelpCircle, CheckCircle2, Clock, XCircle, PlayCircle } from 'lucide-react'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'
import { Heading, Text } from '@/components/ui/typography'
import { Button, ButtonLink } from '@/components/ui/actions'
import { formatDate } from '@/utils/date'
import type { SubmissionSessionSummaryDto } from '@/types'

export type ProposalItem = SubmissionSessionSummaryDto & {
  status?: string
}

export interface ProposalCardProps {
  session: ProposalItem
  onViewDetail: (sessionId: number) => void
}

export function ProposalCard({ session, onViewDetail }: Readonly<ProposalCardProps>) {
  const sessionId = session.session_id ?? 0
  const title = session.title || 'Phiên đề xuất câu hỏi'
  const subjectName = session.subject_name || 'Môn học'
  const status = session.status || 'PENDING'
  const questionCount = session.question_counts ?? 1

  function renderStatusBadge() {
    if (status === 'APPROVED' || status === 'RESOLVED') {
      return (
        <Badge tone="success" size="sm" emphasis="subtle" className="gap-1">
          <CheckCircle2 size={12} />
          Đã duyệt
        </Badge>
      )
    }
    if (status === 'REJECTED') {
      return (
        <Badge tone="danger" size="sm" emphasis="subtle" className="gap-1">
          <XCircle size={12} />
          Từ chối
        </Badge>
      )
    }
    return (
      <Badge tone="warning" size="sm" emphasis="subtle" className="gap-1">
        <Clock size={12} />
        Chờ duyệt
      </Badge>
    )
  }

  return (
    <Card
      as="article"
      variant="default"
      padding="none"
      className="p-5 flex flex-col justify-between border-line-subtle bg-surface hover:border-line-accent-subtle transition-all duration-200"
    >
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Proposal card header and tags] */}
      <div className="space-y-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Badge and status row] */}
        <div className="flex items-center justify-between gap-2">
          <Badge tone="accent" size="xs">
            {subjectName}
          </Badge>
          {renderStatusBadge()}
        </div>

        <Heading level={3} className="text-base font-bold text-text-primary line-clamp-2">
          {title}
        </Heading>

        {session.content && (
          <Text size="xs" tone="muted" className="line-clamp-2">
            {session.content}
          </Text>
        )}

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Meta info row] */}
        <div className="flex items-center gap-4 text-xs text-text-muted pt-2 border-t border-line-subtle">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question counter] */}
          <div className="flex items-center gap-1.5">
            <HelpCircle size={14} />
            <strong>{questionCount} câu hỏi</strong>
          </div>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Date format item] */}
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <time>{formatDate(session.created_at)}</time>
          </div>
        </div>
      </div>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Card footer button container] */}
      <div className="mt-4 pt-3 border-t border-line-subtle flex flex-wrap items-center justify-end gap-2">
        {status === 'APPROVED' || status === 'RESOLVED' ? (
          <ButtonLink
            to={`/practice/${sessionId}`}
            variant="primary"
            size="sm"
            className="text-xs min-h-11 flex-1 sm:flex-initial"
            leftIcon={<PlayCircle size={14} />}
          >
            Luyện tập ngay
          </ButtonLink>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          className="text-xs min-h-11 flex-1 sm:flex-initial"
          onClick={() => onViewDetail(sessionId)}
          leftIcon={<FileText size={14} />}
        >
          Xem chi tiết
        </Button>
      </div>
    </Card>
  )
}
