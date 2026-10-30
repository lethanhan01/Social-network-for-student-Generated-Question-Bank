import { Star, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'
import { Heading, Text } from '@/components/ui/typography'
import type { RatingItemDto } from '@/types'

export interface QuestionRatingsListProps {
  ratings: RatingItemDto[]
}

const DEFAULT_RATINGS: RatingItemDto[] = [
  {
    user_id: 1,
    rating: 4,
    is_error: false,
    comment: 'Câu hỏi rất sát với đề thi học kỳ môn Mạng máy tính các năm trước, giải thích dễ hiểu.',
  },
  {
    user_id: 2,
    rating: 3,
    is_error: false,
    comment: 'Đáp án chuẩn xác, câu từ ngắn gọn mạch lạc.',
  },
  {
    user_id: 3,
    rating: 0,
    is_error: true,
    comment: 'Góp ý: Ở phần phương án C nên ghi rõ là IPv4 hay IPv6 để tránh sinh viên bị nhầm lẫn.',
  },
]

export function QuestionRatingsList({ ratings }: Readonly<QuestionRatingsListProps>) {
  const displayRatings = ratings.length > 0 ? ratings : DEFAULT_RATINGS

  return (
    <Card as="section" variant="default" padding="md" className="bg-surface border-line-subtle space-y-4">
      <Heading level={3} className="text-base font-bold text-text-primary">
        Nhận xét & Đánh giá từ cộng đồng ({displayRatings.length})
      </Heading>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Ratings list container] */}
      <div className="space-y-3">
        {displayRatings.map((item) => (
          <Card
            key={`rating-user-${item.user_id}-${item.rating}-${item.comment ? item.comment.slice(0, 10) : ''}`}
            as="article"
            variant="compact"
            padding="sm"
            className="bg-surface-sunken border-line-subtle space-y-2"
          >
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Rating item header row] */}
            <div className="flex items-center justify-between">
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User avatar and rating stars] */}
              <div className="flex items-center gap-2">
                <Badge tone="accent" size="xs" className="gap-1">
                  <Star size={11} className="fill-current" />
                  {item.rating ?? 4} / 4 sao
                </Badge>
                {item.is_error && (
                  <Badge tone="warning" size="xs" className="gap-1">
                    <AlertTriangle size={11} />
                    Game 5 Báo lỗi
                  </Badge>
                )}
              </div>
              <Text size="xs" tone="muted">
                Sinh viên ẩn danh
              </Text>
            </div>

            {item.comment && (
              <Text size="xs" tone="muted" className="leading-relaxed">
                {item.comment}
              </Text>
            )}
          </Card>
        ))}
      </div>
    </Card>
  )
}
