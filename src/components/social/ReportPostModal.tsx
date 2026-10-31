import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Flag } from 'lucide-react'
import { Form, FormField, Textarea, Select } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { PortalDialog } from '@/components/portal/PortalDialog'
import { reportDescriptionSchema } from '@/components/portal/portal.schemas'
import { useReportMutation } from '@/hooks/queries/useReportMutation'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import type { CreateReportRequestDto } from '@/types'

export interface ReportModalProps {
  isOpen: boolean
  targetType?: 'POST' | 'COMMENT' | 'USER'
  targetId?: number
  postId?: number
  onClose: () => void
}
type Reason = CreateReportRequestDto['violation_type']
const reasons: Reason[] = ['SPAM', 'HARASSMENT', 'HATE_STATEMENT', 'OTHER']
function ReportForm({ targetType = 'POST', targetId, postId, onClose }: Omit<ReportModalProps, 'isOpen'>) {
  const { t } = useTranslation('portal')
  const [reason, setReason] = useState<Reason>('SPAM')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const mutation = useReportMutation()
  async function handleSubmit() {
    const id = targetId ?? postId ?? 0
    if (!Number.isSafeInteger(id) || id <= 0 || !reportDescriptionSchema.safeParse(description).success) {
      setError(t('report.invalid'))
      return
    }
    try {
      await mutation.mutateAsync({
        target_type: targetType,
        target_id: id,
        violation_type: reason,
        description: description.trim() || undefined,
      })
      toast.success(t('report.success'))
      onClose()
    } catch (cause) {
      setError(getApiError(cause, t('error')))
    }
  }
  const handleClose = () => {
    if (!mutation.isPending) onClose()
  }
  return (
    <PortalDialog title={t('report.title')} description={t('report.description')} onClose={handleClose}>
      <p className="flex gap-3 rounded-xl bg-action-accent-soft p-4 text-sm text-fg-secondary">
        <Flag size={22} className="shrink-0 text-action-accent" />
        {t('report.guideline')}
      </p>
      <Form noValidate aria-label={t('report.title')} onSubmit={() => void handleSubmit()} className="space-y-4">
        <FormField htmlFor="portal-reportpostmodal-0" label={t('report.reason')} required>
          <Select
            id="portal-reportpostmodal-0"
            ariaLabel={t('report.reason')}
            value={reason}
            clearable={false}
            onValueChange={(value) => {
              const match = reasons.find((item) => item === value)
              if (match) setReason(match)
              setError('')
            }}
            options={reasons.map((value) => ({ value, label: t(`report.reasons.${value}`) }))}
          />
        </FormField>
        <FormField label={t('report.details')} error={error}>
          <Textarea
            aria-label={t('report.details')}
            rows={4}
            maxLength={2000}
            value={description}
            placeholder={t('report.placeholder')}
            onChange={(e) => {
              setDescription(e.target.value)
              setError('')
            }}
          />
        </FormField>
        <footer className="flex justify-end gap-3">
          <Button variant="outline" disabled={mutation.isPending} onClick={handleClose}>
            {t('cancel')}
          </Button>
          <SubmitButton loading={mutation.isPending}>{t('report.submit')}</SubmitButton>
        </footer>
      </Form>
    </PortalDialog>
  )
}
export function ReportModal({ isOpen, ...props }: Readonly<ReportModalProps>) {
  return isOpen ? <ReportForm {...props} /> : null
}
export const ReportPostModal = ReportModal
