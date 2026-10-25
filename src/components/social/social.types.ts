import type { PostResponseDto, SubjectResponse } from '@/types'

export type FeedTab = 'ALL' | 'MY_SUBJECTS' | 'LECTURERS'


export interface CreatePostFormValues {
  content: string
  subjectId?: number
  visibility: 'PUBLIC' | 'FRIENDS' | 'ONLY_ME'
  postType: 'SOCIAL_POST' | 'LEARNING_VIDEO'
}

export type ReportReason =
  | 'SPAM'
  | 'ACADEMIC_MISINFORMATION'
  | 'OFFENSIVE'
  | 'EXAM_CHEATING'

export interface SocialFeedProps {
  initialPosts?: PostResponseDto[]
  subjects?: SubjectResponse[]
}
