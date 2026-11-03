import {
  BookOpen,
  LayoutDashboard,
  CalendarCheck,
  Search,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, Avatar, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { Separator } from '@/components/ui/layout'
import type { ProfileResponse, SubjectResponse } from '@/types'

interface SocialLeftSidebarProps {
  user?: ProfileResponse
  subjects?: SubjectResponse[]
  selectedSubjectId?: number
  onSelectSubject?: (subjectId?: number) => void
}

export function SocialLeftSidebar({
  user,
  subjects = [],
  selectedSubjectId,
  onSelectSubject,
}: Readonly<SocialLeftSidebarProps>) {
  const { t } = useTranslation('common')
  const displayName = user?.full_name || user?.email || t('social.member')
  const initials = displayName.trim().charAt(0).toUpperCase()
  const studentCode = user?.student_lecturer_code || '—'

  return (
    <Card className="p-4 bg-surface-card border-line-subtle shadow-card rounded-2xl space-y-4">
      {/* User Profile Summary */}
      <header className="flex items-center gap-3">
        <Avatar
          src={user?.avatar_url || undefined}
          name={displayName}
          fallback={initials}
          size="md"
          tone="accent"
        />
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User profile text layout] */}
        <div className="min-w-0 flex-1">
          <Heading level={3} className="text-sm font-bold text-fg-primary truncate">
            {displayName}
          </Heading>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User student code and role badge flex row] */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Text size="xs" tone="muted" className="truncate">
              {t('social.studentCode', { code: studentCode })}
            </Text>
            <Badge tone="accent" size="xs">
              {t(user?.role === 'LECTURER' ? 'social.roleLecturer' : 'social.roleStudent')}
            </Badge>
          </div>
        </div>
      </header>

      {user?.bio ? (
        <Text as="p" size="xs" tone="muted" className="italic break-words px-1">
          &ldquo;{user.bio}&rdquo;
        </Text>
      ) : null}

      <Separator />

      {/* Group 1: Navigation Shortcuts */}
      <nav aria-label={t('nav.shortcuts')} className="space-y-1">
        <Text size="xs" tone="muted" className="font-semibold uppercase tracking-wider px-2 mb-2 block">
          {t('nav.shortcuts', 'Lối tắt tính năng')}
        </Text>
        <ButtonLink
          to="/feed"
          variant={!selectedSubjectId ? 'secondary' : 'ghost'}
          size="sm"
          className="w-full justify-start gap-2.5 min-h-11"
          onClick={() => onSelectSubject?.(undefined)}
        >
          <Sparkles size={18} className="text-action-accent shrink-0" />
          <strong className="font-normal">{t('feed.allPosts', 'Tất cả bảng tin')}</strong>
        </ButtonLink>
        <ButtonLink
          to="/dashboard"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 min-h-11"
        >
          <LayoutDashboard size={18} className="text-action-accent shrink-0" />
          <strong className="font-normal">{t('nav.dashboard', 'Tổng quan học tập')}</strong>
        </ButtonLink>
        <ButtonLink
          to="/exams"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 min-h-11"
        >
          <BookOpen size={18} className="text-action-accent shrink-0" />
          <strong className="font-normal">{t('nav.exams', 'Ngân hàng đề thi')}</strong>
        </ButtonLink>
        <ButtonLink
          to="/gamification/leaderboard"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 min-h-11"
        >
          <CalendarCheck size={18} className="text-action-accent shrink-0" />
          <strong className="font-normal">{t('nav.leaderboard', 'Điểm danh & Vinh danh')}</strong>
        </ButtonLink>
        <ButtonLink
          to="/search"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 min-h-11"
        >
          <Search size={18} className="text-action-accent shrink-0" />
          <strong className="font-normal">{t('nav.search', 'Tìm kiếm toàn cục')}</strong>
        </ButtonLink>
      </nav>

      <Separator />

      {/* Group 2: Real Subjects List from API */}
      <section aria-label="Môn học theo dõi" className="space-y-2">
        <Text size="xs" tone="muted" className="font-semibold uppercase tracking-wider px-2 block">
          {t('nav.mySubjects', 'Môn học theo dõi')} ({subjects.length})
        </Text>
        {subjects.length > 0 ? (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subject list buttons vertical stack] */
          <div className="space-y-1">
            {subjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.subject_id
              return (
                <Button
                  variant={isSelected ? 'primary' : 'ghost'}
                  aria-pressed={isSelected}
                  size="sm"
                  key={sub.subject_id}
                  onClick={() => onSelectSubject?.(isSelected ? undefined : sub.subject_id)}
                  className="w-full justify-between text-xs min-h-11"
                  leftIcon={<BookOpen size={16} className="shrink-0 text-action-accent" />}
                  rightIcon={<Badge size="sm" emphasis="outline" className="shrink-0 ml-1">{sub.code}</Badge>}
                >
                  <strong className="font-normal truncate text-left flex-1">{sub.name}</strong>
                </Button>
              )
            })}
          </div>
        ) : (
          <Text size="xs" tone="muted" className="px-2 italic">
            {t('social.noSubjects')}
          </Text>
        )}
      </section>
    </Card>
  )
}
