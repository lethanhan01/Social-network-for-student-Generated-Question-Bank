import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/overlay'
import {
  Form,
  FormField,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { useReportMutation } from '@/hooks/queries/useReportMutation'
import { toast } from '@/lib/toast'

export interface ReportModalProps {
  isOpen: boolean
  targetType?: 'POST' | 'COMMENT' | 'USER'
  targetId?: number
  postId?: number // backward compatibility
  onClose: () => void
}

export function ReportModal({
  isOpen,
  targetType = 'POST',
  targetId,
  postId,
  onClose,
}: Readonly<ReportModalProps>) {
  const { t } = useTranslation()
  const actualTargetId = targetId ?? postId ?? 0
  const [violationType, setViolationType] = useState<
    'SPAM' | 'HARASSMENT' | 'HATE_STATEMENT' | 'OTHER'
  >('SPAM')
  const [description, setDescription] = useState('')

  const reportMutation = useReportMutation()

  async function handleSubmit() {
    if (!actualTargetId) {
      toast.error(t('report.invalidTarget', 'Mục tiêu báo cáo không hợp lệ.'))
      return
    }

    try {
      await reportMutation.mutateAsync({
        target_type: targetType,
        target_id: actualTargetId,
        violation_type: violationType,
        description: description.trim() || undefined,
      })
      toast.success(t('report.success', 'Đã gửi báo cáo vi phạm'), {
        description: t(
          'report.successDesc',
          'Đội ngũ kiểm duyệt HUST sẽ xem xét và xử lý trong 24h.'
        ),
      })
      setDescription('')
      onClose()
    } catch {
      toast.error(
        t('report.error', 'Không thể gửi báo cáo vi phạm. Vui lòng kiểm tra lại kết nối.')
      )
    }
  }

  function handleClose() {
    if (!reportMutation.isPending) {
      onClose()
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={t('report.title', 'Báo cáo vi phạm nội dung')}
      size="md"
    >
      <Form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Warning note layout] */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-tone-warning/10 border border-tone-warning/20 text-tone-warning text-xs">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <Text size="xs" className="leading-relaxed">
            {t(
              'report.guideline',
              'Hành vi báo cáo sai sự thật liên tục có thể bị trừ điểm uy tín học thuật theo quy chế SQB HUST.'
            )}
          </Text>
        </div>

        <FormField label={t('report.reason', 'Lý do báo cáo vi phạm')} required>
          <Select
            aria-label="Lý do báo cáo vi phạm"
            value={violationType}
            onValueChange={(val) =>
              setViolationType(val as 'SPAM' | 'HARASSMENT' | 'HATE_STATEMENT' | 'OTHER')
            }
          >
            <SelectTrigger aria-label="Lý do báo cáo" className="min-h-11">
              <SelectValue placeholder={t('report.selectReason', 'Chọn lý do báo cáo')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SPAM">{t('report.reasons.spam', 'Spam / Quảng cáo không phù hợp')}</SelectItem>
              <SelectItem value="HARASSMENT">{t('report.reasons.harassment', 'Quấy rối / Công kích cá nhân')}</SelectItem>
              <SelectItem value="HATE_STATEMENT">{t('report.reasons.hate', 'Ngôn từ thù ghét / Xúc phạm')}</SelectItem>
              <SelectItem value="OTHER">{t('report.reasons.other', 'Vi phạm quy chế khác')}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={t('report.detailLabel', 'Mô tả chi tiết bổ sung (Tùy chọn)')}>
          <Textarea
            aria-label="Mô tả chi tiết"
            placeholder={t(
              'report.detailPlaceholder',
              'Cung cấp thêm chi tiết để kiểm duyệt viên thẩm định chính xác hơn...'
            )}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="text-xs"
          />
        </FormField>

        <footer className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={reportMutation.isPending}
            className="min-h-11"
          >
            {t('common.cancel', 'Hủy')}
          </Button>
          <SubmitButton
            loading={reportMutation.isPending}
            variant="primary"
            className="min-h-11 bg-tone-danger hover:bg-tone-danger/90 border-transparent text-white"
          >
            {t('report.submit', 'Gửi báo cáo vi phạm')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}

// Export backward compatibility alias
export const ReportPostModal = ReportModal
