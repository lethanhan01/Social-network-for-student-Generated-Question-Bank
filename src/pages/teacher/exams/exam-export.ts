import i18n from '@/lib/i18n'
import { toast } from '@/lib/toast'
import type { ExportResponse } from '@/types'

/**
 * Mở liên kết Presigned URL Cloudflare R2 trong tab mới và báo trạng thái.
 * Trả về download_url dự phòng nếu trình duyệt chặn popup để UI hiện nút tải thủ công.
 */
export function triggerExportDownload(result: ExportResponse): string | null {
  const url = result.download_url
  if (!url) {
    toast.error(i18n.t('academic:teacher.exams.exportError'))
    return null
  }

  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (result.questions_count != null && result.file_size_mb != null) {
    toast.success(
      i18n.t('academic:teacher.exams.exportSuccess', {
        count: result.questions_count,
        size: result.file_size_mb.toFixed(2),
      })
    )
  } else {
    toast.success(i18n.t('academic:teacher.exams.exportSuccessSimple'))
  }

  return opened ? null : url
}
