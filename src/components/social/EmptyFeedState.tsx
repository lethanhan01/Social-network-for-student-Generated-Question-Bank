import { MessageSquarePlus } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'

interface EmptyFeedStateProps {
  onOpenCreateModal: () => void
}

export function EmptyFeedState({ onOpenCreateModal }: Readonly<EmptyFeedStateProps>) {
  return (
    <Card className="p-6 sm:p-12 text-center bg-surface border-line-subtle shadow-card rounded-2xl space-y-4">
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Centered circle icon container] */}
      <div className="mx-auto w-16 h-16 rounded-2xl bg-action-accent/15 text-action-accent flex items-center justify-center">
        <MessageSquarePlus size={32} />
      </div>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Empty state text stack container] */}
      <div className="max-w-md mx-auto space-y-2">
        <Heading level={3} className="text-lg font-bold text-text-primary">
          Bảng tin học tập đang chờ bài viết đầu tiên!
        </Heading>
        <Text size="sm" tone="muted">
          Hãy là người đầu tiên chia sẻ câu hỏi trắc nghiệm, thắc mắc bài giảng hoặc tài liệu ôn thi cùng cộng đồng sinh viên HUST.
        </Text>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={onOpenCreateModal}
        className="min-h-11 px-6 shadow-sm"
        leftIcon={<MessageSquarePlus size={18} />}
      >
        Tạo bài thảo luận đầu tiên
      </Button>
    </Card>
  )
}
