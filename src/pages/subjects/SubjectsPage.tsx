import { useState, useMemo } from 'react'
import { BookOpen, Search, GraduationCap, Library } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Heading, Text } from '@/components/ui/typography'
import { Badge, StatCard } from '@/components/ui/data-display'
import { SearchInput } from '@/components/ui/forms'
import { EmptyState } from '@/components/ui/feedback'
import { queryKeys } from '@/lib/query-keys'
import { courseService } from '@/services/course.service'
import { SubjectCard } from './SubjectCard'
import type { SubjectResponse } from '@/types'

const DEFAULT_SUBJECTS: SubjectResponse[] = [
  { subject_id: 1, code: 'IT3080', name: 'Mạng máy tính' },
  { subject_id: 2, code: 'IT3100', name: 'Lập trình hướng đối tượng' },
  { subject_id: 3, code: 'IT3120', name: 'Hệ điều hành' },
  { subject_id: 4, code: 'IT3011', name: 'Cấu trúc dữ liệu và giải thuật' },
  { subject_id: 5, code: 'MI1110', name: 'Giải tích I' },
  { subject_id: 6, code: 'MI1120', name: 'Đại số tuyến tính' },
  { subject_id: 7, code: 'MI2020', name: 'Xác suất thống kê' },
  { subject_id: 8, code: 'IT1110', name: 'Tin học đại cương' },
]

export default function SubjectsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: apiSubjects, isLoading } = useQuery<SubjectResponse[]>({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    staleTime: 5 * 60 * 1000,
  })

  const subjectsList = useMemo(() => {
    if (apiSubjects && apiSubjects.length > 0) return apiSubjects
    return DEFAULT_SUBJECTS
  }, [apiSubjects])

  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return subjectsList
    return subjectsList.filter((s) => {
      const matchCode = (s.code || '').toLowerCase().includes(q)
      const matchName = (s.name || '').toLowerCase().includes(q)
      return matchCode || matchName
    })
  }, [subjectsList, searchQuery])

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Main page vertical stack] */
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line-subtle">
        <hgroup>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header badge container] */}
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="accent" size="sm">
              HỌC THUẬT & NGÂN HÀNG CÂU HỎI
            </Badge>
            <strong className="font-normal text-xs text-text-muted">
              {t('subjects.semester', 'Kỳ 2024.1 HUST')}
            </strong>
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {t('subjects.title', 'Danh mục Môn học & Tra cứu')}
          </Heading>
          <Text size="sm" tone="muted" className="mt-1">
            {t('subjects.subtitle', 'Tra cứu mã môn học, tên học phần và đơn vị đào tạo trực thuộc Đại học Bách khoa Hà Nội.')}
          </Text>
        </hgroup>
      </header>

      {/* Key Metric Cards */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Stats grid wrapper] */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={t('subjects.stats.total', 'Tổng số môn học')}
          value={subjectsList.length}
          icon={<BookOpen size={20} />}
          hint="Đang mở trong kỳ học 2024.1"
          tone="accent"
        />
        <StatCard
          label={t('subjects.stats.it_dept', 'Công nghệ Thông tin & TT')}
          value={subjectsList.filter((s) => (s.code || '').startsWith('IT')).length}
          icon={<GraduationCap size={20} />}
          hint="Học phần chuyên ngành IT"
          tone="info"
        />
        <StatCard
          label={t('subjects.stats.math_dept', 'Toán học & Khoa học Cơ bản')}
          value={subjectsList.filter((s) => (s.code || '').startsWith('MI')).length}
          icon={<Library size={20} />}
          hint="Học phần đại cương & cơ sở MI"
          tone="neutral"
        />
      </div>

      {/* Search and Toolbar */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Search toolbar layout container] */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-line-subtle">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Search input wrapper] */}
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('subjects.search_placeholder', 'Tìm theo mã môn (IT3080) hoặc tên môn...')}
            fullWidth
          />
        </div>
        <Text size="xs" tone="muted">
          Hiển thị {filteredSubjects.length} / {subjectsList.length} môn học
        </Text>
      </div>

      {/* Subjects Grid */}
      {isLoading ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading state container] */
        <div className="py-12 text-center">
          <Text size="sm" tone="muted">Đang tải danh mục môn học...</Text>
        </div>
      ) : filteredSubjects.length > 0 ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subjects card grid layout] */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSubjects.map((subject) => (
            <SubjectCard key={subject.subject_id ?? subject.code} subject={subject} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Search size={24} />}
          title={t('subjects.empty_title', 'Không tìm thấy môn học')}
          description={t('subjects.empty_desc', 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chọn môn học khác.')}
          actionLabel="Xóa bộ lọc"
          onAction={() => setSearchQuery('')}
        />
      )}
    </div>
  )
}
