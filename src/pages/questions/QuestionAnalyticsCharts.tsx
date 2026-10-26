import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Card } from '@/components/ui/data-display/Card'
import { Heading, Text } from '@/components/ui/typography'
import { TOKEN_COLORS } from '@/styles/token-values'

export interface QuestionAnalyticsChartsProps {
  optionDistribution?: Record<string, unknown>
  ratingDistribution?: Record<string, unknown>
}

const BAR_COLORS = [
  TOKEN_COLORS.teal,
  TOKEN_COLORS.green,
  TOKEN_COLORS.amberSoftBorder,
  TOKEN_COLORS.error,
]

export function QuestionAnalyticsCharts({
  optionDistribution,
  ratingDistribution,
}: Readonly<QuestionAnalyticsChartsProps>) {
  // Map option distribution A, B, C, D
  const optionData = [
    { name: 'Đáp án A', count: Number(optionDistribution?.A ?? 45) },
    { name: 'Đáp án B', count: Number(optionDistribution?.B ?? 120) },
    { name: 'Đáp án C', count: Number(optionDistribution?.C ?? 15) },
    { name: 'Đáp án D', count: Number(optionDistribution?.D ?? 10) },
  ]

  // Map ratings distribution 0 to 4 stars
  const ratingData = [
    { name: '0 sao (Sai)', count: Number(ratingDistribution?.['0'] ?? 2) },
    { name: '1 sao (LLM)', count: Number(ratingDistribution?.['1'] ?? 1) },
    { name: '2 sao (TB)', count: Number(ratingDistribution?.['2'] ?? 5) },
    { name: '3 sao (Đạt)', count: Number(ratingDistribution?.['3'] ?? 24) },
    { name: '4 sao (Hay)', count: Number(ratingDistribution?.['4'] ?? 42) },
  ]

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Analytics charts grid wrapper] */
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Option distribution chart */}
      <Card as="section" variant="default" padding="md" className="bg-surface border-line-subtle space-y-4">
        <Heading level={3} className="text-base font-bold text-text-primary">
          Phân bố lựa chọn phương án (A, B, C, D)
        </Heading>
        <Text size="xs" tone="muted">
          Tỷ lệ sinh viên lựa chọn các phương án qua các lần làm bài thi.
        </Text>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Option chart height container] */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={optionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke={TOKEN_COLORS.textMuted} fontSize={11} />
              <YAxis stroke={TOKEN_COLORS.textMuted} fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: TOKEN_COLORS.bgCard,
                  borderColor: TOKEN_COLORS.borderSubtle,
                  borderRadius: '12px',
                  color: TOKEN_COLORS.textPrimary,
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {optionData.map((opt, index) => (
                  <Cell key={`cell-opt-${opt.name}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Rating score distribution chart */}
      <Card as="section" variant="default" padding="md" className="bg-surface border-line-subtle space-y-4">
        <Heading level={3} className="text-base font-bold text-text-primary">
          Phân bố điểm đánh giá chất lượng (0 - 4 sao)
        </Heading>
        <Text size="xs" tone="muted">
          Điểm đánh giá từ cộng đồng sinh viên và giảng viên thẩm định.
        </Text>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Rating chart height container] */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke={TOKEN_COLORS.textMuted} fontSize={11} />
              <YAxis stroke={TOKEN_COLORS.textMuted} fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: TOKEN_COLORS.bgCard,
                  borderColor: TOKEN_COLORS.borderSubtle,
                  borderRadius: '12px',
                  color: TOKEN_COLORS.textPrimary,
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill={TOKEN_COLORS.green} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
