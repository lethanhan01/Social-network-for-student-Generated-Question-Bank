/**
 * Domain Types: review
 */
import type { SessionDetailReviewResponse, SessionQuestionReviewDto } from './api.generated'

export type {
  EditQuestionRequest,
  EditQuestionResponse,
  RejectQuestionsRequest,
  ApproveQuestionsRequest,
  ApproveQuestionsResponse,
  ReviewErrorRequest,
  SessionDetailReviewResponse,
  SessionQuestionReviewDto,
} from './api.generated'

export type QuestionDifficulty = 'UNCLASSIFIED' | 'EASY' | 'MEDIUM' | 'HARD'

export interface LiveSessionQuestionReviewDto extends SessionQuestionReviewDto {
  difficulty?: QuestionDifficulty
}

export interface LiveSessionDetailReviewResponse extends Omit<SessionDetailReviewResponse, 'items'> {
  session_status?: 'PENDING' | 'REVIEWING' | 'RESOLVED'
  items?: LiveSessionQuestionReviewDto[]
}
