import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Heading, Text } from '@/components/ui/typography'
import { Badge, Card } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { ProgressBar } from '@/components/ui/feedback'
import { queryKeys } from '@/lib/query-keys'
import { practiceService } from '@/services/practice.service'
import { courseService } from '@/services/course.service'
import { PracticeSessionSelector } from './PracticeSessionSelector'
import { PracticeQuizCard } from './PracticeQuizCard'
import { QuestionReportModal } from '@/components/practice/QuestionReportModal'
import { getStoredProposalDetail } from '../proposals/proposalStorage'
import type { PracticeQuestionDto, SubjectResponse } from '@/types'

const DEFAULT_QUESTIONS: PracticeQuestionDto[] = [
  {
    question_id: 201,
    content: 'Trong kiến trúc mô hình TCP/IP, giao thức nào hoạt động tại tầng Giao vận (Transport Layer) và cung cấp dịch vụ truyền dữ liệu tin cậy, hướng kết nối?',
    source: 'HOMO_SAPIENS',
    options: [
      { key: 'A', text: 'UDP (User Datagram Protocol)', is_correct: false },
      { key: 'B', text: 'TCP (Transmission Control Protocol)', is_correct: true },
      { key: 'C', text: 'IP (Internet Protocol)', is_correct: false },
      { key: 'D', text: 'ICMP (Internet Control Message Protocol)', is_correct: false },
    ],
  },
  {
    question_id: 202,
    content: 'Giao thức phân giải địa chỉ ARP (Address Resolution Protocol) thực hiện việc ánh xạ giữa hai loại địa chỉ nào?',
    source: 'LLM',
    options: [
      { key: 'A', text: 'Ánh xạ từ tên miền (Domain Name) sang địa chỉ IP', is_correct: false },
      { key: 'B', text: 'Ánh xạ từ địa chỉ MAC sang địa chỉ IP', is_correct: false },
      { key: 'C', text: 'Ánh xạ từ địa chỉ IP sang địa chỉ vật lý MAC', is_correct: true },
      { key: 'D', text: 'Ánh xạ từ số cổng (Port) sang tiến trình ứng dụng', is_correct: false },
    ],
  },
  {
    question_id: 203,
    content: 'Cơ chế bắt tay ba bước (Three-way Handshake) của giao thức TCP sử dụng các cờ điều khiển (flags) nào theo thứ tự?',
    source: 'HOMO_SAPIENS',
    options: [
      { key: 'A', text: 'SYN -> SYN-ACK -> ACK', is_correct: true },
      { key: 'B', text: 'ACK -> SYN -> FIN', is_correct: false },
      { key: 'C', text: 'SYN -> ACK -> DATA', is_correct: false },
      { key: 'D', text: 'FIN -> FIN-ACK -> ACK', is_correct: false },
    ],
  },
]

const CPP_QUESTIONS: PracticeQuestionDto[] = [
  {
    question_id: 301,
    content: 'Trong C++, để khai báo một phương thức thuần ảo (pure virtual function) trong một lớp trừu tượng, cú pháp nào sau đây là chính xác?',
    source: 'HOMO_SAPIENS',
    options: [
      { key: 'A', text: 'virtual void display() = 0;', is_correct: true },
      { key: 'B', text: 'abstract void display();', is_correct: false },
      { key: 'C', text: 'virtual void display() pure;', is_correct: false },
      { key: 'D', text: 'void virtual display() null;', is_correct: false },
    ],
  },
  {
    question_id: 302,
    content: 'Điều kiện nào sau đây là BẮT BUỘC để cơ chế liên kết động (Dynamic Binding) hoạt động trong C++?',
    source: 'HOMO_SAPIENS',
    options: [
      { key: 'A', text: 'Khai báo virtual ở phương thức lớp cha và gọi qua con trỏ hoặc tham chiếu', is_correct: true },
      { key: 'B', text: 'Lớp con phải nạp chồng toán tử (operator overloading)', is_correct: false },
      { key: 'C', text: 'Lớp cha và lớp con phải khai báo chung trong cùng một file mã nguồn', is_correct: false },
      { key: 'D', text: 'Phải sử dụng hàm tạo ảo (virtual constructor)', is_correct: false },
    ],
  },
  {
    question_id: 303,
    content: 'Tại sao khi một lớp C++ có ít nhất một phương thức ảo thì hàm hủy (destructor) của lớp đó NÊN khai báo là virtual?',
    source: 'LLM',
    options: [
      { key: 'A', text: 'Để đảm bảo hàm hủy lớp con được gọi đúng khi giải phóng qua con trỏ lớp cha, tránh rò rỉ bộ nhớ', is_correct: true },
      { key: 'B', text: 'Để ngăn chặn lớp con ghi đè lại hàm hủy', is_correct: false },
      { key: 'C', text: 'Để trình biên dịch tự động giải phóng đối tượng trong Stack', is_correct: false },
      { key: 'D', text: 'Để cho phép khởi tạo đối tượng trực tiếp từ lớp trừu tượng', is_correct: false },
    ],
  },
]

export default function PracticePage() {
  const { sessionId: paramSessionId } = useParams()
  const [searchParams] = useSearchParams()
  const subjectIdParam = searchParams.get('subjectId')

  const [activeSessionId, setActiveSessionId] = useState<number | null>(
    paramSessionId ? Number(paramSessionId) : subjectIdParam ? 1 : null
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [reportQuestionId, setReportQuestionId] = useState<number | null>(null)

  useEffect(() => {
    if (paramSessionId) {
      setActiveSessionId(Number(paramSessionId))
      setCurrentIndex(0)
      setIsCompleted(false)
    }
  }, [paramSessionId])

  const { data: apiSessionQuestions } = useQuery({
    queryKey: queryKeys.practice.questions(activeSessionId ?? 0),
    queryFn: ({ signal }) => practiceService.getSessionQuestions(activeSessionId!, { signal }),
    enabled: Boolean(activeSessionId),
  })

  const { data: apiSubjects } = useQuery<SubjectResponse[]>({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    staleTime: 5 * 60 * 1000,
  })

  const questionsList = useMemo(() => {
    if (activeSessionId) {
      const stored = getStoredProposalDetail(activeSessionId)
      if (stored?.questions && stored.questions.length > 0) {
        return stored.questions as PracticeQuestionDto[]
      }
    }
    if (apiSessionQuestions?.questions && apiSessionQuestions.questions.length > 0) {
      return apiSessionQuestions.questions
    }
    if (activeSessionId === 102 || activeSessionId === 2) {
      return CPP_QUESTIONS
    }
    return DEFAULT_QUESTIONS
  }, [apiSessionQuestions, activeSessionId])

  const currentQuestion = questionsList[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / questionsList.length) * 100)

  function handleNextQuestion() {
    if (currentIndex + 1 < questionsList.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  function handleReset() {
    setCurrentIndex(0)
    setIsCompleted(false)
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Practice page main vertical layout] */
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line-subtle">
        <hgroup>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Breadcrumb link row] */}
          <div className="flex items-center gap-2 mb-1">
            <ButtonLink to="/subjects" variant="ghost" size="xs" leftIcon={<ArrowLeft size={14} />}>
              Danh mục môn học
            </ButtonLink>
            <Badge tone="accent" size="sm">LUYỆN TẬP TRẮC NGHIỆM</Badge>
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Không gian Luyện tập & Thi Trắc nghiệm
          </Heading>
          <Text size="sm" tone="muted" className="mt-1">
            Thực hành bộ câu hỏi từ ngân hàng đề, nhận phản hồi ngay lập tức và đánh giá chất lượng câu hỏi.
          </Text>
        </hgroup>
      </header>

      {/* Main Content: Selector or Quiz */}
      {!activeSessionId ? (
        <PracticeSessionSelector
          subjects={apiSubjects || []}
          onSelectSession={(id) => {
            setActiveSessionId(id)
            setCurrentIndex(0)
            setIsCompleted(false)
          }}
        />
      ) : isCompleted ? (
        /* Quiz Completed Screen */
        <Card as="article" variant="default" padding="lg" className="text-center space-y-4 bg-surface border-line-subtle py-12">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Trophy icon wrapper] */}
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-action-accent/15 text-action-accent">
            <Trophy size={32} />
          </div>
          <Heading level={2} className="text-xl font-bold text-text-primary">
            Chúc mừng bạn đã hoàn thành phiên luyện tập!
          </Heading>
          <Text size="sm" tone="muted" className="max-w-md mx-auto">
            Bạn đã hoàn thành toàn bộ {questionsList.length} câu hỏi. Hãy tiếp tục luyện tập các chuyên đề khác để củng cố kiến thức nhé!
          </Text>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Complete action buttons] */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button variant="outline" size="md" onClick={handleReset} leftIcon={<RotateCcw size={16} />}>
              Luyện tập lại
            </Button>
            <Button variant="primary" size="md" onClick={() => setActiveSessionId(null)}>
              Chọn phiên khác
            </Button>
          </div>
        </Card>
      ) : (
        /* Active Quiz Screen */
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Quiz active screen container] */
        <div className="space-y-4">
          {/* Progress bar */}
          <Card as="section" variant="compact" padding="sm" className="bg-surface border-line-subtle space-y-2">
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Progress bar label row] */}
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Tiến độ luyện tập</span>
              <strong>{currentIndex + 1} / {questionsList.length} ({progressPercent}%)</strong>
            </div>
            <ProgressBar value={progressPercent} tone="accent" size="sm" />
          </Card>

          {/* Question Card */}
          <PracticeQuizCard
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questionsList.length}
            onNextQuestion={handleNextQuestion}
            onOpenReportModal={(qid) => setReportQuestionId(qid)}
          />
        </div>
      )}

      {/* MODAL-07: Quality Rating and Game 5 Report */}
      {reportQuestionId && (
        <QuestionReportModal
          questionId={reportQuestionId}
          open={Boolean(reportQuestionId)}
          onClose={() => setReportQuestionId(null)}
        />
      )}
    </div>
  )
}
