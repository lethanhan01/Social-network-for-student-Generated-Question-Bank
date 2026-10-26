import { useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Users, Star, BarChart3 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Heading, Text } from '@/components/ui/typography'
import { Badge, StatCard, Card } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { queryKeys } from '@/lib/query-keys'
import { practiceService } from '@/services/practice.service'
import { QuestionAnalyticsCharts } from './QuestionAnalyticsCharts'
import { QuestionRatingsList } from './QuestionRatingsList'
import type { QuestionStatisticsResponse, QuestionRatingsResponse } from '@/types'

export default function QuestionAnalyticsPage() {
  const { id: paramId } = useParams()
  const questionId = paramId ? Number(paramId) : 201

  const { data: stats } = useQuery<QuestionStatisticsResponse>({
    queryKey: queryKeys.questions.statistics(questionId),
    queryFn: ({ signal }) => practiceService.getQuestionStatistics(questionId, { signal }),
    staleTime: 60 * 1000,
  })

  const { data: ratingsData } = useQuery<QuestionRatingsResponse>({
    queryKey: queryKeys.questions.ratings(questionId),
    queryFn: ({ signal }) => practiceService.getQuestionRatings(questionId, { signal }),
    staleTime: 60 * 1000,
  })

  const totalAnswer = stats?.total_answer ?? 190
  const correctRatePercent = Math.round((stats?.correct_rate ?? 0.765) * 100)
  const avgRating = stats?.rating_summary?.avg_rating ?? 3.8
  const totalRatings = stats?.rating_summary?.total_ratings ?? 73

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Analytics page vertical stack] */
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line-subtle">
        <hgroup>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Breadcrumb row] */}
          <div className="flex items-center gap-2 mb-1">
            <ButtonLink to="/practice" variant="ghost" size="xs" leftIcon={<ArrowLeft size={14} />}>
              Quay lại Luyện tập
            </ButtonLink>
            <Badge tone="accent" size="sm">PHÂN TÍCH CHẤT LƯỢNG</Badge>
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Thống kê & Phân tích Câu hỏi #{questionId}
          </Heading>
          <Text size="sm" tone="muted" className="mt-1">
            Chỉ số hiệu quả giáo dục, tỷ lệ phân bố lựa chọn và báo cáo lỗi Game 5 từ cộng đồng.
          </Text>
        </hgroup>
      </header>

      {/* Overview Card */}
      <Card as="article" variant="default" padding="md" className="bg-surface border-line-subtle space-y-2">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Badge and subject tag] */}
        <div className="flex items-center gap-2">
          <Badge tone="accent" size="xs">Mạng máy tính (IT3080)</Badge>
          <Badge tone="neutral" size="xs">Đã qua thẩm định</Badge>
        </div>
        <Heading level={3} className="text-base font-bold text-text-primary">
          Trong kiến trúc mô hình TCP/IP, giao thức nào hoạt động tại tầng Giao vận (Transport Layer) và cung cấp dịch vụ truyền dữ liệu tin cậy, hướng kết nối?
        </Heading>
        <Text size="xs" tone="muted">
          Tác giả: Sinh viên K67 • Lời giải: TCP thiết lập kết nối trước khi truyền dữ liệu qua bắt tay 3 bước.
        </Text>
      </Card>

      {/* Metric Cards Row */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Key metrics grid] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng lượt làm bài"
          value={totalAnswer}
          icon={<Users size={20} />}
          hint="Số lượt sinh viên đã trả lời"
          tone="accent"
        />
        <StatCard
          label="Tỷ lệ làm đúng"
          value={`${correctRatePercent}%`}
          icon={<CheckCircle2 size={20} />}
          hint="Độ khó: Cơ bản - Vận dụng"
          tone="success"
        />
        <StatCard
          label="Điểm chất lượng TB"
          value={`${avgRating} / 4.0`}
          icon={<Star size={20} />}
          hint="Đạt chuẩn thẩm định học thuật"
          tone="warning"
        />
        <StatCard
          label="Tổng lượt đánh giá"
          value={totalRatings}
          icon={<BarChart3 size={20} />}
          hint="Bao gồm đánh giá sao & Game 5"
          tone="info"
        />
      </div>

      {/* Analytics Charts */}
      <QuestionAnalyticsCharts
        optionDistribution={stats?.option_distribution}
        ratingDistribution={stats?.rating_summary?.distribution}
      />

      {/* Ratings and Reviews List */}
      <QuestionRatingsList ratings={ratingsData?.items || []} />
    </div>
  )
}
