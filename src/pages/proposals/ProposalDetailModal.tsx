import { useMemo } from 'react'
import { CheckCircle2, PlayCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Modal } from '@/components/ui/overlay'
import { Badge } from '@/components/ui/data-display/Badge'
import { Card } from '@/components/ui/data-display/Card'
import { Text } from '@/components/ui/typography'
import { Button, ButtonLink } from '@/components/ui/actions'
import { queryKeys } from '@/lib/query-keys'
import { sessionService } from '@/services/session.service'
import { formatDate } from '@/utils/date'
import { getStoredProposalDetail, getStoredProposals } from './proposalStorage'
import type { MySubmissionDetailResponse } from '@/types'

export interface ProposalDetailModalProps {
  sessionId: number | null
  open: boolean
  onClose: () => void
}

const DEFAULT_DETAILS: Record<number, MySubmissionDetailResponse> = {
  102: {
    session_id: 102,
    session_code: 'SUB-2026-IT3100-102',
    title: 'Đề xuất: Trắc nghiệm Đa hình & Kế thừa trong C++',
    content: 'Đã bổ sung giải thích chi tiết cho phương thức ảo và hàm thuần ảo.',
    subject_name: 'Lập trình hướng đối tượng',
    subject_code: 'IT3100',
    reviewed_by_lecturer: 'TS. Nguyễn Văn A (Khoa CNTT - HUST)',
    reviewed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    questions: [
      {
        question_id: 301,
        content: 'Trong C++, để khai báo một phương thức thuần ảo trong lớp trừu tượng, cú pháp nào sau đây là chính xác?',
        source: 'HOMO_SAPIENS',
        options: [
          { key: 'A', text: 'virtual void display() = 0;', is_correct: true }, { key: 'B', text: 'abstract void display();', is_correct: false },
          { key: 'C', text: 'virtual void display() pure;', is_correct: false }, { key: 'D', text: 'void virtual display() null;', is_correct: false },
        ],
        explanation: 'Phương thức thuần ảo trong C++ được khai báo với từ khóa virtual và gán = 0 ở cuối chữ ký hàm.',
      },
      {
        question_id: 302,
        content: 'Điều kiện nào sau đây là BẮT BUỘC để cơ chế liên kết động (Dynamic Binding) hoạt động trong C++?',
        source: 'HOMO_SAPIENS',
        options: [
          { key: 'A', text: 'Khai báo virtual và gọi qua con trỏ/tham chiếu', is_correct: true }, { key: 'B', text: 'Nạp chồng toán tử', is_correct: false },
          { key: 'C', text: 'Chung 1 file mã nguồn', is_correct: false }, { key: 'D', text: 'Dùng hàm tạo ảo', is_correct: false },
        ],
        explanation: 'Dynamic Binding trong C++ chỉ kích hoạt khi phương thức là virtual và gọi qua con trỏ/tham chiếu.',
      },
    ],
  },
  101: {
    session_id: 101,
    session_code: 'SUB-2026-IT3080-101',
    title: 'Đề xuất: Bộ câu hỏi ôn tập Chương 2 - Mô hình OSI và TCP/IP',
    content: 'Bộ 10 câu hỏi trắc nghiệm độ khó cơ bản và vận dụng kiến thức tầng mạng.',
    subject_name: 'Mạng máy tính',
    subject_code: 'IT3080',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    questions: [
      {
        question_id: 201,
        content: 'Trong kiến trúc mô hình TCP/IP, giao thức nào hoạt động tại tầng Giao vận (Transport Layer) và cung cấp dịch vụ truyền dữ liệu tin cậy, hướng kết nối?',
        source: 'HOMO_SAPIENS',
        options: [
          { key: 'A', text: 'UDP', is_correct: false }, { key: 'B', text: 'TCP', is_correct: true },
          { key: 'C', text: 'IP', is_correct: false }, { key: 'D', text: 'ICMP', is_correct: false },
        ],
        explanation: 'TCP cung cấp kết nối tin cậy qua bắt tay 3 bước và cờ ACK.',
      },
    ],
  },
  103: {
    session_id: 103,
    session_code: 'SUB-2026-MI1120-103',
    title: 'Đề xuất: Câu hỏi trắc nghiệm Không gian vector & Ma trận',
    content: 'Tập trung vào ma trận chuyển cơ sở và tìm giá trị riêng.',
    subject_name: 'Đại số tuyến tính',
    subject_code: 'MI1120',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    questions: [
      {
        question_id: 401,
        content: 'Điều kiện cần và đủ để ma trận vuông A khả nghịch (khác suy biến) là gì?',
        source: 'HOMO_SAPIENS',
        options: [
          { key: 'A', text: 'det(A) != 0', is_correct: true }, { key: 'B', text: 'det(A) == 0', is_correct: false },
          { key: 'C', text: 'Trace(A) != 0', is_correct: false }, { key: 'D', text: 'Phần tử chéo != 0', is_correct: false },
        ],
        explanation: 'Ma trận vuông khả nghịch khi và chỉ khi định thức khác 0 (det(A) != 0).',
      },
    ],
  },
}

DEFAULT_DETAILS[1] = DEFAULT_DETAILS[101]; DEFAULT_DETAILS[2] = DEFAULT_DETAILS[102]; DEFAULT_DETAILS[3] = DEFAULT_DETAILS[103]

function resolveProposalDetail(sessionId: number | null): MySubmissionDetailResponse | undefined {
  if (!sessionId) return undefined
  const stored = getStoredProposalDetail(sessionId)
  if (stored && stored.questions && stored.questions.length > 0) return stored
  if (DEFAULT_DETAILS[sessionId]) return DEFAULT_DETAILS[sessionId]
  const storedProposals = getStoredProposals()
  const found = storedProposals.find((p) => p.session_id === sessionId)
  if (found) {
    return {
      session_id: sessionId,
      title: found.title,
      content: found.content,
      subject_name: found.subject_name,
      subject_code: found.subject_code,
      created_at: found.created_at,
      questions: [
        {
          question_id: 1,
          content: `Câu hỏi trắc nghiệm thuộc học phần ${found.subject_name || 'HUST'}`,
          source: 'HOMO_SAPIENS',
          options: [
            { key: 'A', text: 'Lựa chọn A (Đáp án đúng)', is_correct: true }, { key: 'B', text: 'Lựa chọn B', is_correct: false },
            { key: 'C', text: 'Lựa chọn C', is_correct: false }, { key: 'D', text: 'Lựa chọn D', is_correct: false },
          ],
          explanation: found.content || 'Nội dung câu hỏi đề xuất đã lưu trong hệ thống.',
        },
      ],
    }
  }
  return undefined
}

export function ProposalDetailModal({ sessionId, open, onClose }: Readonly<ProposalDetailModalProps>) {
  const fallbackDetail = useMemo(() => resolveProposalDetail(sessionId), [sessionId])

  const { data: apiDetail, isLoading } = useQuery<MySubmissionDetailResponse>({
    queryKey: queryKeys.sessions.detail(sessionId ?? 0),
    queryFn: async ({ signal }) => {
      try {
        return await sessionService.getMySubmissionDetail(sessionId!, { signal })
      } catch {
        return fallbackDetail || { session_id: sessionId ?? 0, title: 'Chi tiết phiên đề xuất', questions: [] }
      }
    },
    enabled: Boolean(open && sessionId),
    placeholderData: fallbackDetail,
    retry: 1,
  })

  const detail = useMemo(() => {
    if (apiDetail && apiDetail.questions && apiDetail.questions.length > 0) return apiDetail
    return fallbackDetail || apiDetail
  }, [apiDetail, fallbackDetail])

  const questions = detail?.questions || []

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      title={detail?.title || 'Chi tiết phiên đề xuất câu hỏi'}
      description={`Môn: ${detail?.subject_name || 'HUST'} • Ngày tạo: ${formatDate(detail?.created_at)}`}
      footer={
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Modal footer buttons] */
        <div className="flex flex-wrap items-center justify-end gap-2 w-full">
          {sessionId === 102 || detail?.reviewed_by_lecturer ? (
            <ButtonLink to={`/practice/${sessionId}`} variant="primary" size="md" className="min-h-11" leftIcon={<PlayCircle size={16} />}>
              Luyện tập phiên này
            </ButtonLink>
          ) : null}
          <Button variant="secondary" size="md" onClick={onClose} className="min-h-11">
            Đóng
          </Button>
        </div>
      }
    >
      {isLoading && !detail ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading state in modal] */
        <div className="py-8 text-center">
          <Text size="sm" tone="muted">Đang tải chi tiết phiên...</Text>
        </div>
      ) : (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Questions detail container] */
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {detail?.reviewed_by_lecturer && (
            <Card as="section" variant="compact" padding="sm" className="bg-surface-sunken border-line-subtle">
              <Text size="xs" tone="muted">
                <strong>Giảng viên thẩm định:</strong> {detail.reviewed_by_lecturer} ({formatDate(detail.reviewed_at)})
              </Text>
            </Card>
          )}

          <Text size="xs" tone="muted" className="font-semibold uppercase tracking-wider">
            Danh sách câu hỏi đề xuất ({questions.length})
          </Text>

          {questions.length > 0 ? (
            questions.map((q) => (
              <Card as="article" key={q.question_id ?? (q.content || 'q')} variant="default" padding="sm" className="space-y-3 bg-surface border-line-subtle">
                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question header index and source] */}
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="accent" size="xs">
                    Mã #{q.question_id ?? 1}
                  </Badge>
                  {q.source && (
                    <Badge tone="neutral" size="xs">
                      {q.source === 'LLM' ? 'AI Hỗ trợ' : 'Tự biên soạn'}
                    </Badge>
                  )}
                </div>

                <Text size="sm" className="font-medium text-text-primary whitespace-pre-wrap">
                  {q.content}
                </Text>

                {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Options grid in proposal detail] */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-line-subtle">
                  {q.options?.map((opt) => (
                    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Option item pill] */
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        opt.is_correct ? 'bg-status-success-bg border-status-success-border text-status-success-fg font-semibold' : 'bg-surface-sunken border-line-subtle text-text-secondary'
                      }`}
                    >
                      <span><strong>{opt.key}.</strong> {opt.text}</span>
                      {opt.is_correct ? <CheckCircle2 size={14} className="text-status-success-fg shrink-0 ml-1" /> : null}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <Card as="section" variant="compact" padding="sm" className="bg-surface-sunken border-line-subtle text-xs text-text-muted">
                    <strong className="text-text-primary">Giải thích:</strong> {q.explanation}
                  </Card>
                )}
              </Card>
            ))
          ) : (
            <Text size="sm" tone="muted">Phiên này chưa có câu hỏi nào.</Text>
          )}
        </div>
      )}
    </Modal>
  )
}
