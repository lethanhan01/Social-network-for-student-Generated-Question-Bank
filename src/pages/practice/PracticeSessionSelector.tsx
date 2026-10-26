import { useState, useMemo } from 'react'
import { ArrowRight, CheckCircle2, BookOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'
import { Heading, Text } from '@/components/ui/typography'
import { Button } from '@/components/ui/actions'
import { EmptyState } from '@/components/ui/feedback'
import { queryKeys } from '@/lib/query-keys'
import { sessionService } from '@/services/session.service'
import { getStoredProposals } from '../proposals/proposalStorage'
import type { SubjectResponse, SubmissionSessionSummaryDto } from '@/types'

export interface PracticeSessionItem {
  session_id: number
  title: string
  subject_code: string
  subject_name: string
  question_count: number
  difficulty: string
  is_approved?: boolean
}

export interface PracticeSessionSelectorProps {
  subjects?: SubjectResponse[]
  selectedSubjectId?: number | null
  onSelectSession: (sessionId: number) => void
}

const DEFAULT_APPROVED_SESSIONS: PracticeSessionItem[] = [
  {
    session_id: 102,
    title: 'Đề xuất: Trắc nghiệm Đa hình & Kế thừa trong C++',
    subject_code: 'IT3100',
    subject_name: 'Lập trình hướng đối tượng (IT3100)',
    question_count: 8,
    difficulty: 'Đã duyệt • Chuẩn HUST',
    is_approved: true,
  },
  {
    session_id: 1,
    title: 'Luyện tập: Kiến trúc Mạng & Giao thức TCP/IP',
    subject_code: 'IT3080',
    subject_name: 'Mạng máy tính',
    question_count: 10,
    difficulty: 'Cơ bản - Vận dụng',
    is_approved: true,
  },
  {
    session_id: 2,
    title: 'Luyện tập: Lập trình Hướng đối tượng C++ & Tính đa hình',
    subject_code: 'IT3100',
    subject_name: 'Lập trình hướng đối tượng',
    question_count: 8,
    difficulty: 'Trung bình',
    is_approved: true,
  },
  {
    session_id: 3,
    title: 'Luyện tập: Định lý Ma trận & Hệ phương trình tuyến tính',
    subject_code: 'MI1120',
    subject_name: 'Đại số tuyến tính',
    question_count: 12,
    difficulty: 'Nâng cao',
    is_approved: true,
  },
]

export function PracticeSessionSelector({
  subjects: _subjects,
  onSelectSession,
}: Readonly<PracticeSessionSelectorProps>) {
  const [filterSubject, setFilterSubject] = useState<string>('ALL')

  const { data: apiSubmissions, isLoading } = useQuery({
    queryKey: queryKeys.sessions.mySubmissions({ status: 'APPROVED' }),
    queryFn: ({ signal }) => sessionService.getMySubmissions({ status: 'APPROVED' }, { signal }),
    staleTime: 60 * 1000,
  })

  const sessionsList = useMemo<PracticeSessionItem[]>(() => {
    const stored = getStoredProposals()
    const storedApproved: PracticeSessionItem[] = stored
      .filter((p) => p.status === 'APPROVED' || p.status === 'RESOLVED')
      .map((item) => ({
        session_id: item.session_id ?? Date.now(),
        title: item.title || 'Phiên luyện tập đã thẩm định',
        subject_code: item.subject_code || 'HUST',
        subject_name: item.subject_name || 'Học phần',
        question_count: item.question_counts ?? 1,
        difficulty: 'Đã duyệt • Chuẩn HUST',
        is_approved: true,
      }))

    let baseApproved: PracticeSessionItem[] = DEFAULT_APPROVED_SESSIONS
    if (apiSubmissions?.contents && apiSubmissions.contents.length > 0) {
      const filtered = apiSubmissions.contents.filter(
        (item: SubmissionSessionSummaryDto & { status?: string }) =>
          !item.status || item.status === 'APPROVED' || item.status === 'RESOLVED'
      )
      if (filtered.length > 0) {
        baseApproved = filtered.map((item) => ({
          session_id: item.session_id ?? 1,
          title: item.title || 'Phiên luyện tập đã thẩm định',
          subject_code: item.subject_code || 'HUST',
          subject_name: item.subject_name || 'Học phần',
          question_count: item.question_counts ?? 1,
          difficulty: 'Đã duyệt • Chuẩn HUST',
          is_approved: true,
        }))
      }
    }

    const storedIds = new Set(storedApproved.map((s) => s.session_id))
    return [...storedApproved, ...baseApproved.filter((b) => !storedIds.has(b.session_id))]
  }, [apiSubmissions])

  const subjectCodes = useMemo(() => {
    const set = new Set<string>()
    sessionsList.forEach((s) => {
      if (s.subject_code) set.add(s.subject_code)
    })
    return Array.from(set)
  }, [sessionsList])

  const filteredSessions = useMemo(() => {
    if (filterSubject === 'ALL') return sessionsList
    return sessionsList.filter((s) => s.subject_code === filterSubject)
  }, [sessionsList, filterSubject])

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Session selector vertical stack] */
    <div className="space-y-6">
      <Card as="section" variant="default" padding="md" className="bg-surface border-line-subtle space-y-2">
        <Heading level={2} className="text-lg font-bold text-text-primary">
          Chọn phiên câu hỏi đã được phê duyệt để bắt đầu luyện tập trắc nghiệm
        </Heading>
        <Text size="sm" tone="muted">
          Các bộ câu hỏi được tổng hợp từ các phiên đề xuất đã qua thẩm định và chấp thuận của Giảng viên HUST.
        </Text>
      </Card>

      {/* Subject Filter Tabs */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Filter tabs row] */}
      <nav aria-label="Bộ lọc môn học luyện tập" className="flex flex-wrap items-center gap-2 border-b border-line-subtle pb-2">
        <Button
          variant={filterSubject === 'ALL' ? 'secondary' : 'ghost'}
          size="sm"
          className="min-h-11 text-xs"
          onClick={() => setFilterSubject('ALL')}
        >
          Tất cả môn học ({sessionsList.length})
        </Button>
        {subjectCodes.map((code) => (
          <Button
            key={code}
            variant={filterSubject === code ? 'secondary' : 'ghost'}
            size="sm"
            className="min-h-11 text-xs"
            onClick={() => setFilterSubject(code)}
          >
            {code} ({sessionsList.filter((s) => s.subject_code === code).length})
          </Button>
        ))}
      </nav>

      {/* Loading state or Grid */}
      {isLoading ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading state container] */
        <div className="py-12 text-center">
          <Text size="sm" tone="muted">Đang tải danh sách phiên đã duyệt...</Text>
        </div>
      ) : filteredSessions.length > 0 ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Sessions cards grid] */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((sess) => (
            <Card
              key={sess.session_id}
              as="article"
              variant="default"
              padding="none"
              className="p-5 flex flex-col justify-between border-line-subtle bg-surface hover:border-line-accent-subtle transition-all duration-200"
            >
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Session header and badges] */}
              <div className="space-y-3">
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Badge row] */}
                <div className="flex items-center justify-between">
                  <Badge tone="accent" size="xs">
                    {sess.subject_code}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Badge tone="success" size="xs" emphasis="subtle" className="gap-1">
                      <CheckCircle2 size={10} />
                      Đã duyệt
                    </Badge>
                    <Badge tone="neutral" size="xs">
                      {sess.question_count} câu hỏi
                    </Badge>
                  </div>
                </div>

                <Heading level={3} className="text-base font-bold text-text-primary line-clamp-2">
                  {sess.title}
                </Heading>

                <Text size="xs" tone="muted">
                  {sess.subject_name} • Mức độ: {sess.difficulty}
                </Text>
              </div>

              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Button footer container] */}
              <div className="mt-5 pt-3 border-t border-line-subtle">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full min-h-11 text-xs"
                  rightIcon={<ArrowRight size={14} />}
                  onClick={() => onSelectSession(sess.session_id)}
                >
                  Bắt đầu làm bài
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="Chưa có phiên đã duyệt nào cho môn này"
          description="Hiện tại chưa có phiên câu hỏi nào được phê duyệt cho học phần đã chọn. Hãy chuyển bộ lọc sang môn học khác!"
          actionLabel="Xem tất cả môn học"
          onAction={() => setFilterSubject('ALL')}
        />
      )}
    </div>
  )
}
