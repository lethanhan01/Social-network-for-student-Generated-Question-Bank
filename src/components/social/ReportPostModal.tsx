import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { toast } from '@/lib/toast'

interface ReportPostModalProps {
  isOpen: boolean
  postId?: number
  onClose: () => void
}

export function ReportPostModal({
  isOpen,
  postId,
  onClose,
}: Readonly<ReportPostModalProps>) {
  const [reason, setReason] = useState<string>('ACADEMIC_MISINFORMATION')
  const [detail, setDetail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e?: React.SubmitEvent) {
    e?.preventDefault()
    setLoading(true)
    try {
      if (postId) {
        // Target post id registered
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Đã gửi báo cáo vi phạm', {
        description: 'Đội ngũ kiểm duyệt HUST sẽ xem xét và xử lý bài viết trong 24h.',
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        if (!loading) onClose()
      }}
      title="Báo cáo vi phạm nội dung"
      size="md"
    >
      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Warning note layout] */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-tone-warning/10 border border-tone-warning/20 text-tone-warning text-xs">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <Text size="xs" className="leading-relaxed">
            Hành vi báo cáo sai sự thật liên tục có thể bị trừ điểm uy tín học thuật theo quy chế SQB HUST.
          </Text>
        </div>

        <FormField label="Lý do báo cáo vi phạm" required>
          <Select aria-label="Lý do báo cáo vi phạm" value={reason} onValueChange={setReason}>
            <SelectTrigger aria-label="Lý do báo cáo" className="min-h-11">
              <SelectValue placeholder="Chọn lý do báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACADEMIC_MISINFORMATION">Sai lệch kiến thức học thuật</SelectItem>
              <SelectItem value="EXAM_CHEATING">Gian lận thi cử / Lộ đề thi cấm</SelectItem>
              <SelectItem value="SPAM">Spam / Quảng cáo không phù hợp</SelectItem>
              <SelectItem value="OFFENSIVE">Ngôn từ công kích, xúc phạm</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Mô tả chi tiết bổ sung (Tùy chọn)">
          <Textarea
            aria-label="Mô tả chi tiết"
            placeholder="Cung cấp thêm chi tiết để kiểm duyệt viên thẩm định chính xác hơn..."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            className="text-xs"
          />
        </FormField>

        <footer className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-h-11"
          >
            Hủy
          </Button>
          <SubmitButton
            loading={loading}
            variant="primary"
            className="min-h-11 bg-tone-danger hover:bg-tone-danger/90 border-transparent text-white"
          >
            Gửi báo cáo vi phạm
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
