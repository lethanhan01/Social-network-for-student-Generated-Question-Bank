import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, FileText, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Heading, Text } from '@/components/ui/typography'
import { Badge, StatCard } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { EmptyState } from '@/components/ui/feedback'
import { queryKeys } from '@/lib/query-keys'
import { sessionService } from '@/services/session.service'
import { courseService } from '@/services/course.service'
import { ProposalCard, type ProposalItem } from './ProposalCard'
import { ProposalDetailModal } from './ProposalDetailModal'
import { CreateProposalModal } from './CreateProposalModal'
import { getStoredProposals } from './proposalStorage'
import type { SubjectResponse } from '@/types'

const DEFAULT_PROPOSALS: ProposalItem[] = [
  {
    session_id: 101,
    title: 'Đề xuất: Bộ câu hỏi ôn tập Chương 2 - Mô hình OSI và TCP/IP',
    subject_name: 'Mạng máy tính (IT3080)',
    content: 'Bộ 10 câu hỏi trắc nghiệm độ khó cơ bản và vận dụng kiến thức tầng mạng.',
    status: 'PENDING',
    question_counts: 10,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    session_id: 102,
    title: 'Đề xuất: Trắc nghiệm Đa hình & Kế thừa trong C++',
    subject_name: 'Lập trình hướng đối tượng (IT3100)',
    content: 'Đã bổ sung giải thích chi tiết cho phương thức ảo và hàm thuần ảo.',
    status: 'APPROVED',
    question_counts: 8,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    session_id: 103,
    title: 'Đề xuất: Câu hỏi trắc nghiệm Không gian vector & Ma trận',
    subject_name: 'Đại số tuyến tính (MI1120)',
    content: 'Tập trung vào ma trận chuyển cơ sở và tìm giá trị riêng.',
    status: 'REJECTED',
    question_counts: 6,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
]

export default function ProposalsPage() {
  const [searchParams] = useSearchParams()
  const subjectIdParam = searchParams.get('subjectId')

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null)
  const [storageVersion, setStorageVersion] = useState(0)

  const { data: apiSubmissions, isLoading } = useQuery({
    queryKey: queryKeys.sessions.mySubmissions(),
    queryFn: ({ signal }) => sessionService.getMySubmissions(undefined, { signal }),
    staleTime: 60 * 1000,
  })

  const { data: apiSubjects } = useQuery<SubjectResponse[]>({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    staleTime: 5 * 60 * 1000,
  })

  const submissionsList = useMemo<ProposalItem[]>(() => {
    const stored = getStoredProposals()
    const baseList: ProposalItem[] =
      apiSubmissions?.contents && apiSubmissions.contents.length > 0
        ? apiSubmissions.contents.map((item) => ({
            ...item,
            status: (item as unknown as { status?: string }).status || 'PENDING',
          }))
        : DEFAULT_PROPOSALS

    const storedIds = new Set(stored.map((s) => s.session_id))
    return [...stored, ...baseList.filter((b) => !storedIds.has(b.session_id))]
  }, [apiSubmissions, storageVersion])

  const filteredSubmissions = useMemo(() => {
    let list = [...submissionsList]
    if (activeTab !== 'ALL') {
      list = list.filter((item: ProposalItem) => item.status === activeTab)
    }
    return list
  }, [submissionsList, activeTab])

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Main page vertical container] */
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line-subtle">
        <hgroup>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Breadcrumb link row] */}
          <div className="flex items-center gap-2 mb-1">
            <ButtonLink to="/subjects" variant="ghost" size="xs" leftIcon={<ArrowLeft size={14} />}>
              Danh mục môn học
            </ButtonLink>
            <Badge tone="accent" size="sm">ĐỀ XUẤT CÂU HỎI</Badge>
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Quản lý Phiên đề xuất Câu hỏi
          </Heading>
          <Text size="sm" tone="muted" className="mt-1">
            Theo dõi danh sách câu hỏi bạn đã đóng góp hoặc tạo mới đề xuất để giảng viên thẩm định.
          </Text>
        </hgroup>

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header action buttons] */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" size="md" className="min-h-11" leftIcon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>
            Tạo đề xuất mới
          </Button>
        </div>
      </header>

      {/* Stats Summary */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Stats cards row] */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Tổng phiên đã gửi" value={submissionsList.length} icon={<FileText size={20} />} tone="accent" />
        <StatCard label="Đang chờ thẩm định" value={submissionsList.filter((s) => s.status === 'PENDING').length} icon={<Clock size={20} />} tone="warning" />
        <StatCard label="Đã được phê duyệt" value={submissionsList.filter((s) => s.status === 'APPROVED').length} icon={<CheckCircle2 size={20} />} tone="success" />
      </div>

      {/* Filter Tabs */}
      <nav aria-label="Bộ lọc trạng thái phiên" className="flex items-center gap-2 border-b border-line-subtle pb-1">
        <Button variant={activeTab === 'ALL' ? 'secondary' : 'ghost'} size="sm" className="min-h-11 text-xs" onClick={() => setActiveTab('ALL')}>
          Tất cả ({submissionsList.length})
        </Button>
        <Button variant={activeTab === 'PENDING' ? 'secondary' : 'ghost'} size="sm" className="min-h-11 text-xs" onClick={() => setActiveTab('PENDING')}>
          Chờ duyệt
        </Button>
        <Button variant={activeTab === 'APPROVED' ? 'secondary' : 'ghost'} size="sm" className="min-h-11 text-xs" onClick={() => setActiveTab('APPROVED')}>
          Đã duyệt
        </Button>
        <Button variant={activeTab === 'REJECTED' ? 'secondary' : 'ghost'} size="sm" className="min-h-11 text-xs" onClick={() => setActiveTab('REJECTED')}>
          Từ chối
        </Button>
      </nav>

      {/* Proposals List */}
      {isLoading ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading state container] */
        <div className="py-12 text-center"><Text size="sm" tone="muted">Đang tải danh sách đề xuất...</Text></div>
      ) : filteredSubmissions.length > 0 ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Proposals grid layout] */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubmissions.map((session) => (
            <ProposalCard
              key={session.session_id}
              session={session}
              onViewDetail={setSelectedDetailId}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText size={24} />}
          title="Chưa có phiên đề xuất nào"
          description="Bạn chưa gửi đề xuất câu hỏi nào trong danh mục này. Hãy bắt đầu đóng góp câu hỏi đầu tiên!"
          actionLabel="Tạo đề xuất mới"
          onAction={() => setIsCreateOpen(true)}
        />
      )}

      {/* Modals */}
      <CreateProposalModal
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
          setStorageVersion((v) => v + 1)
        }}
        subjects={apiSubjects || []}
        initialSubjectId={subjectIdParam ? Number(subjectIdParam) : undefined}
      />

      <ProposalDetailModal
        sessionId={selectedDetailId}
        open={Boolean(selectedDetailId)}
        onClose={() => setSelectedDetailId(null)}
      />
    </div>
  )
}
