import { CheckSquare, Check, X, Sparkles } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'

export default function TeacherReviewsPage() {
  const pendingQuestions = [
    {
      id: 101,
      subject: 'IT4409 - Phát triển ứng dụng Web',
      creator: 'Nguyễn Văn A (20235631)',
      content: 'Trong React Router v6, hook nào được sử dụng để lấy các tham số động từ URL hiện tại?',
      options: ['A. useParams()', 'B. useRouteMatch()', 'C. useLocation()', 'D. useHistory()'],
      answer: 'A',
      explanation: 'useParams() trả về object chứa các key/value của URL dynamic segment.',
    },
    {
      id: 102,
      subject: 'IT3080 - Mạng máy tính',
      creator: 'Trần Thị B (20231234)',
      content: 'Giao thức nào sau đây hoạt động tại tầng Giao vận (Transport Layer) trong mô hình OSI?',
      options: ['A. IP', 'B. TCP', 'C. HTTP', 'D. ARP'],
      answer: 'B',
      explanation: 'TCP và UDP là 2 giao thức cốt lõi hoạt động tại tầng Giao vận.',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="text-action-accent" size={26} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              Trung Tâm Thẩm Định Câu Hỏi (SCR-20)
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            Phê duyệt câu hỏi do sinh viên khởi tạo, thẩm định báo lỗi Game 5 và tinh chỉnh chất lượng cùng Trợ lý AI.
          </Text>
        </div>
      </header>

      {/* Questions list */}
      <section aria-label="Danh sách câu hỏi chờ thẩm định" className="space-y-4">
        {pendingQuestions.map((q) => (
          <Card key={q.id} as="article" className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge tone="accent" emphasis="subtle" size="sm">
                  {q.subject}
                </Badge>
                <Text size="xs" tone="muted">
                  Người gửi: <strong className="text-fg-primary font-medium">{q.creator}</strong>
                </Text>
              </div>
              <Badge tone="warning" emphasis="subtle" size="sm">
                Chờ thẩm định
              </Badge>
            </header>

            <div className="space-y-3">
              <p className="text-base font-semibold text-fg-primary">
                {q.content}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-fg-muted">
                {q.options.map((opt) => (
                  <li key={opt} className="p-2.5 rounded-xl bg-surface-base border border-line-subtle">
                    {opt}
                  </li>
                ))}
              </ul>
              <div className="p-3 rounded-xl bg-surface-base border border-line-subtle text-xs text-fg-muted space-y-1">
                <p>Đáp án đúng đề xuất: <strong className="text-action-accent font-bold">{q.answer}</strong></p>
                <p>Giải thích: {q.explanation}</p>
              </div>
            </div>

            <footer className="pt-3 border-t border-line-subtle flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<Sparkles size={16} />}>
                Trợ lý AI Tinh Chỉnh (MODAL-06)
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<X size={16} />}>
                  Từ chối
                </Button>
                <Button variant="primary" size="sm" className="min-h-11 text-xs gap-1.5" leftIcon={<Check size={16} />}>
                  Phê duyệt vào Ngân hàng
                </Button>
              </div>
            </footer>
          </Card>
        ))}
      </section>
    </section>
  )
}
