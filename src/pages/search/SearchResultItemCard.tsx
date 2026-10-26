import { useTranslation } from 'react-i18next'
import { FileText, HelpCircle } from 'lucide-react'
import { Card, Avatar, Badge } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import type { SearchResultItemDto } from '@/types'

interface SearchResultItemCardProps {
  item: SearchResultItemDto
}

export function SearchResultItemCard({ item }: Readonly<SearchResultItemCardProps>) {
  const { t } = useTranslation()

  if (item.user) {
    const u = item.user
    return (
      <Card className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card flex items-center justify-between gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [User info horizontal container] */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={u.avatar_url || undefined} name={u.full_name || 'HUST'} fallback={(u.full_name || 'H').charAt(0)} size="md" tone="accent" />
          <div className="min-w-0">
            <ButtonLink to={`/profile/${u.user_id}`} variant="ghost" className="p-0 h-auto font-bold text-sm text-text-primary hover:underline truncate block text-left">
              {u.full_name}
            </ButtonLink>
            <Text size="xs" tone="muted">{u.role === 'LECTURER' ? t('friends.roleLecturer', 'Giảng viên') : t('friends.roleStudent', 'Sinh viên')} • {u.school_faculty || u.student_lecturer_code || 'HUST'}</Text>
          </div>
        </div>
        <ButtonLink to={`/profile/${u.user_id}`} variant="outline" size="sm" className="min-h-11 text-xs shrink-0">
          {t('search.viewProfile', 'Xem hồ sơ')}
        </ButtonLink>
      </Card>
    )
  }

  if (item.post) {
    const p = item.post
    return (
      <Card className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card space-y-2">
        <header className="flex items-center justify-between gap-2">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Post author badge row] */}
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={16} className="text-action-accent shrink-0" />
            <Text size="xs" className="font-bold text-text-primary truncate">{p.author_name || 'Thành viên HUST'}</Text>
          </div>
          <Badge tone="accent" size="sm">{t('search.typePost', 'Bài viết')}</Badge>
        </header>
        <p className="text-xs text-text-primary line-clamp-2 leading-relaxed whitespace-pre-wrap">{p.content}</p>
        <footer className="pt-2 border-t border-line-subtle flex justify-end">
          <ButtonLink to={`/posts/${p.post_id}`} variant="ghost" size="sm" className="text-xs text-action-accent font-semibold p-0 h-auto min-h-11 inline-flex items-center">
            {t('post.viewDetail', 'Xem chi tiết bài viết')} →
          </ButtonLink>
        </footer>
      </Card>
    )
  }

  if (item.question) {
    const q = item.question
    return (
      <Card className="p-4 bg-surface border-line-subtle rounded-2xl shadow-card space-y-2">
        <header className="flex items-center justify-between gap-2">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Question header row] */}
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-tone-warning shrink-0" />
            <Text size="xs" className="font-bold text-text-primary">{q.subject_name || q.question_code || 'HUST'}</Text>
          </div>
          <Badge tone="neutral" size="sm">{t('search.typeQuestion', 'Câu hỏi ôn tập')}</Badge>
        </header>
        <p className="text-xs text-text-primary line-clamp-2 leading-relaxed">{q.content}</p>
        <footer className="pt-2 border-t border-line-subtle flex justify-end">
          <ButtonLink to="/questions" variant="ghost" size="sm" className="text-xs text-action-accent font-semibold p-0 h-auto min-h-11 inline-flex items-center">
            {t('search.viewQuestion', 'Xem câu hỏi')} →
          </ButtonLink>
        </footer>
      </Card>
    )
  }

  return null
}
