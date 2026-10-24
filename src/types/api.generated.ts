/**
 * Complete OpenAPI 3.1 Type Definitions for SQB HUST
 */

/**
 * Shared Type Aliases for Common Enums and Unions
 */
export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT'
export type SystemRole = UserRole
export type Gender = 'MALE' | 'FEMALE'
export type FriendRequestStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED'
export type PostVisibility = 'PUBLIC' | 'ONLY_ME' | 'FRIENDS'
export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
export type BadgeTriggerEvent =
  | 'APPROVED_QUESTIONS'
  | 'PROPOSED_QUESTIONS'
  | 'REVIEWED_SESSIONS'
  | 'ACCEPTED_FRIENDS'
  | 'PUBLIC_POINTS'
  | 'STUDY_STREAK'
  | 'LEADERBOARD_RANK'
  | 'MANUAL_GRANT'
export type PostType =
  | 'LEARNING_VIDEO'
  | 'SOCIAL_POST'
  | 'QUESTION_APPROVED_NOTIFICATION'
  | 'LEADERBOARD_HONOR'
export type MemberRole = 'CHIEF' | 'VILLAGE_ELDER' | 'VILLAGER'
export type ReactionType = 'LIKE' | 'LOVE' | 'WOW'
export type MessageDeleteScope = 'ME' | 'EVERYONE'

/**
 * Thông tin yêu cầu cập nhật hồ sơ cá nhân
 */
export interface UpdateProfileRequest {
  /** Họ và tên hiển thị */
  full_name?: string
  /** URL ảnh đại diện mới */
  avatar_url?: string
  /** URL ảnh bìa trang cá nhân */
  cover_url?: string
  /** Tiểu sử / Giới thiệu bản thân */
  bio?: string
  /** Múi giờ người dùng */
  timezone?: string
  /** Giới tính (chỉ nhận MALE hoặc FEMALE) */
  gender?: Gender
  /** Ngày tháng năm sinh */
  date_of_birth?: string
}

/**
 * Thông tin hồ sơ chi tiết của người dùng
 */
export interface ProfileResponse {
  /** ID người dùng */
  user_id?: number
  /** Địa chỉ email (chỉ hiển thị khi xem chính mình) */
  email?: string
  /** Họ và tên đầy đủ */
  full_name?: string
  /** URL ảnh đại diện */
  avatar_url?: string
  /** URL ảnh bìa */
  cover_url?: string
  /** URL khung avatar */
  frame_url?: string
  /** Giới tính */
  gender?: Gender
  /** Ngày tháng năm sinh (chỉ hiển thị khi xem chính mình) */
  date_of_birth?: string
  /** Tiểu sử cá nhân */
  bio?: string
  /** Khoa / Viện / Trường thành viên */
  school_faculty?: string
  /** Chuyên ngành */
  major?: string
  /** Lớp sinh hoạt */
  class_name?: string
  /** Mã số sinh viên hoặc Mã cán bộ giảng viên */
  student_lecturer_code?: string
  /** Vai trò trong hệ thống */
  role?: UserRole
  /** Múi giờ */
  timezone?: string
  /** Đã hoàn thành thiết lập hồ sơ */
  profile_completed?: boolean
  /** Đã xác minh tài khoản */
  verified?: boolean
  /** Tổng số câu hỏi đã đề xuất vào ngân hàng đề */
  total_proposed_questions?: number
  /** Điểm tích lũy Gamification */
  gamification_points?: number
  /** Số lượng huy hiệu thành tích đạt được */
  badges_count?: number
  /** Số lượng bạn bè */
  friends_count?: number
  /** Số lượng người đang theo dõi */
  followers_count?: number
  /** Số lượng người mà tài khoản này đang theo dõi */
  following_count?: number
  /** Thời điểm khởi tạo tài khoản */
  created_at?: string
  relationships?: Relationship
}

/**
 * Quan hệ xã hội giữa người xem và tài khoản này (bạn bè, theo dõi...)
 */
export interface Relationship {
  is_friend?: boolean
  is_following?: boolean
  is_followed?: boolean
  friend_request_status?: FriendRequestStatus
}

/**
 * Cấu hình chi tiết cho một danh mục thông báo
 */
export interface PushCategorySettingDto {
  /** Bật/tắt thông báo cho danh mục này */
  enabled?: boolean
  /** Mô tả ý nghĩa của danh mục thông báo */
  description?: string
}

/**
 * Cấu hình khung giờ yên tĩnh
 */
export interface QuietHoursDto {
  /** Bật/tắt chế độ khung giờ yên tĩnh */
  enabled?: boolean
  /** Giờ bắt đầu chế độ yên tĩnh (định dạng HH:mm) */
  start_time?: string
  /** Giờ kết thúc chế độ yên tĩnh (định dạng HH:mm) */
  end_time?: string
}

/**
 * Yêu cầu cập nhật cấu hình thông báo đẩy
 */
export interface UpdatePushSettingsRequestDto {
  /** Bật/tắt toàn bộ thông báo đẩy */
  push_enabled?: boolean
  /** Cấu hình chi tiết theo từng danh mục thông báo cố định (SOCIAL, ACADEMIC, GAMIFICATION, SYSTEM) */
  categories?: Record<string, unknown>
  quiet_hours?: QuietHoursDto
  /** Bật/tắt âm thanh thông báo */
  sound_enabled?: boolean
  /** Bật/tắt rung khi có thông báo */
  vibration_enabled?: boolean
}

/**
 * Thông tin cấu hình thông báo đẩy của người dùng
 */
export interface PushSettingsResponseDto {
  /** Trạng thái bật/tắt toàn bộ thông báo đẩy */
  push_enabled?: boolean
  /** Cấu hình chi tiết theo từng danh mục thông báo (SOCIAL, ACADEMIC, GAMIFICATION, SYSTEM) */
  categories?: Record<string, unknown>
  quiet_hours?: QuietHoursDto
  /** Bật/tắt âm thanh thông báo */
  sound_enabled?: boolean
  /** Bật/tắt rung thông báo */
  vibration_enabled?: boolean
}

/**
 * Lựa chọn đáp án của câu hỏi trắc nghiệm
 */
export interface QuestionOption {
  /** Ký tự định danh đáp án (A, B, C, D...) */
  key?: string
  /** Nội dung văn bản của đáp án */
  text?: string
  /** Cờ đánh dấu đáp án đúng */
  is_correct?: boolean
  /** URL ảnh minh họa kèm theo đáp án (nếu có) */
  media_url?: string
  /** ID media đính kèm (nếu có) */
  media_id?: number
}

/**
 * Thông tin câu hỏi cập nhật trong phiên
 */
export interface QuestionUpdateDto {
  /** ID câu hỏi (để null nếu là câu hỏi mới thêm vào phiên) */
  question_id?: number
  /** Nội dung câu hỏi (hỗ trợ LaTeX/Markdown) */
  content?: string
  /** Danh sách URL hình ảnh minh họa cho câu hỏi */
  media_urls?: string[]
  /** Danh sách các lựa chọn đáp án */
  options?: QuestionOption[]
  /** Lời giải chi tiết cho câu hỏi */
  explanation?: string
  /** Nguồn gốc tạo câu hỏi */
  source?: 'LLM' | 'HOMO_SAPIENS'
  /** Mức độ tự tin của tác giả [0.0; 4.0] (0: sai hoàn toàn, 1: LLM bịa, 2: chưa vững, 3: cơ bản, 4: câu hỏi hay) */
  confidence?: number
}

/**
 * Yêu cầu cập nhật phiên đề xuất câu hỏi
 */
export interface UpdateSubmissionSessionRequest {
  /** Tiêu đề phiên đề xuất */
  title?: string
  /** Mô tả nội dung phiên đề xuất */
  content?: string
  /** Đường dẫn tài liệu nguồn tham khảo */
  source_url?: string
  /** ID môn học */
  subject_id?: number
  /** Danh sách câu hỏi cần cập nhật hoặc thêm mới */
  questions?: QuestionUpdateDto[]
}

/**
 * Yêu cầu giảng viên chỉnh sửa nội dung câu hỏi
 */
export interface EditQuestionRequest {
  /** Nội dung câu hỏi được biên tập lại */
  content?: string
  /** Danh sách đáp án đã được chỉnh sửa */
  options?: QuestionOption[]
  /** Lời giải chi tiết sau khi chỉnh sửa */
  explanation?: string
  /** Tự động duyệt câu hỏi vào ngân hàng đề sau khi sửa (true: duyệt ngay, false: giữ trạng thái chờ) */
  auto_approve?: boolean
}

/**
 * Kết quả chỉnh sửa câu hỏi của giảng viên
 */
export interface EditQuestionResponse {
  /** ID câu hỏi */
  question_id?: number
  /** Trạng thái câu hỏi sau khi chỉnh sửa */
  status?: string
  /** ID giảng viên thực hiện chỉnh sửa */
  reviewed_by?: number
  /** Thời gian chỉnh sửa */
  reviewed_at?: string
}

/**
 * Danh sách tệp tin đính kèm mới (thay thế danh sách cũ)
 */
export interface MediaItem {
  key?: string
  url?: string
  type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  width?: number
  height?: number
  size?: number
  duration?: number
  name?: string
  thumbnail_url?: string
}

/**
 * Yêu cầu cập nhật nội dung bài viết
 */
export interface UpdatePostRequest {
  /** Nội dung bài viết mới */
  content?: string
  /** Danh sách tệp tin đính kèm mới (thay thế danh sách cũ) */
  media_urls?: MediaItem[]
  /** Chế độ hiển thị bài viết (PUBLIC, FRIENDS, ONLY_ME) */
  visibility: PostVisibility
}

export interface UpdatePostResponseDto {
  post_id?: number
  updated_at?: string
}

/**
 * Yêu cầu thêm hoặc cập nhật ghi chú chuyên môn của Giảng viên cho bài viết
 */
export interface UpdateLecturerNoteRequest {
  /** Nội dung ghi chú hoặc lời khuyên chuyên môn của giảng viên */
  content: string
}

/**
 * Yêu cầu tháo vật phẩm trang trí đang dùng
 */
export interface UnequipCosmeticRequestDto {
  /** ID của vật phẩm muốn tháo gỡ */
  cosmetic_id: number
}

/**
 * Kết quả sau khi tháo vật phẩm trang trí
 */
export interface UnequipCosmeticResponseDto {
  /** Vị trí trang bị đã được tháo */
  slot?: string
  /** Thông tin vật phẩm vừa được tháo gỡ */
  unequipped_item?: Record<string, unknown>
  /** Các trường profile đã được xóa bỏ tương ứng */
  profile_updated?: Record<string, unknown>
}

/**
 * Yêu cầu trang bị vật phẩm trang trí
 */
export interface EquipCosmeticRequestDto {
  /** ID của vật phẩm muốn trang bị */
  cosmetic_id: number
}

/**
 * Kết quả sau khi trang bị vật phẩm trang trí
 */
export interface EquipCosmeticResponseDto {
  /** ID vật phẩm vừa được trang bị */
  cosmetic_id?: number
  /** Tên vật phẩm */
  name?: string
  /** Loại vật phẩm trang trí */
  type?: 'AVATAR_FRAME' | 'CHAT_BUBBLE'
  /** URL hình ảnh/tài nguyên vật phẩm */
  asset_url?: string
  /** Thời điểm trang bị */
  equipped_at?: string
  /** Thông tin vật phẩm cũ đã bị tháo ra (nếu có) */
  previous_item?: Record<string, unknown>
  /** Các trường profile đã được cập nhật tương ứng */
  profile_updated?: Record<string, unknown>
}

/**
 * Yêu cầu cập nhật thông tin nhóm trò chuyện
 */
export interface UpdateGroupInfoDto {
  /** Tên nhóm mới */
  name?: string
  /** URL ảnh đại diện mới của nhóm (đã upload qua R2) */
  avatar_url?: string
}

export interface ConversationDetailDto {
  conversation_id?: number
  type?: 'DIRECT' | 'GROUP'
  name?: string
  avatar_url?: string
  members?: ConversationMemberDto[]
  created_at?: string
}

/**
 * Thông tin thành viên trong cuộc hội thoại / nhóm chat
 */
export interface ConversationMemberDto {
  /** ID người dùng */
  user_id?: number
  /** Họ và tên hiển thị của thành viên */
  full_name?: string
  /** Đường dẫn ảnh đại diện */
  avatar_url?: string
  /** Đường dẫn khung viền avatar trang trí */
  frame_url?: string
  /** Vai trò trong nhóm chat (CHIEF, VILLAGE_ELDER, VILLAGER) */
  role?: MemberRole
  /** Thời điểm tham gia nhóm chat */
  created_at?: string
}

/**
 * Yêu cầu thay đổi vai trò của thành viên trong nhóm
 */
export interface UpdateMemberRoleRequestDto {
  /** Vai trò mới của thành viên (CHIEF, VILLAGE_ELDER, VILLAGER) */
  role: MemberRole
}

/**
 * Yêu cầu chỉnh sửa bình luận
 */
export interface UpdateCommentRequest {
  /** Nội dung bình luận mới */
  content?: string
  /** URL hình ảnh mới (hoặc chuỗi rỗng để gỡ bỏ ảnh cũ) */
  media_url?: string
}

export interface AuthorDto {
  user_id?: number
  full_name?: string
  avatar_url?: string
  frame_url?: string
}

export interface CommentResponseDto {
  comment_id?: number
  target_type?: string
  target_id?: number
  parent_comment_id?: number
  content?: string
  media_url?: string
  author?: AuthorDto
  created_at?: string
  deleted?: boolean
  reply_count?: number
  replies?: CommentResponseDto[]
}

/**
 * Thông tin chi tiết của một học kỳ
 */
export interface SemesterResponse {
  /** ID học kỳ */
  semester_id?: number
  /** Tên học kỳ */
  name?: string
  /** Trạng thái đang kích hoạt phục vụ học tập/thi */
  active?: boolean
  /** Trạng thái đã chốt sổ/tổng kết học kỳ (không thể kích hoạt lại) */
  is_finalize?: boolean
  /** Thời điểm khởi tạo học kỳ */
  created_at?: string
}

/**
 * Tiêu chí điều kiện xét duyệt huy hiệu
 */
export interface BadgeCriteria {
  type?: 'COUNTER_THRESHOLD' | 'STREAK' | 'SUBJECT_MASTERY' | 'LEADERBOARD_RANK' | 'MANUAL_GRANT'
}

export type CounterThresholdCriteria = Record<string, unknown>

export type LeaderboardRankCriteria = Record<string, unknown>

export type ManualGrantCriteria = Record<string, unknown>

export type StreakCriteria = Record<string, unknown>

export type SubjectMasteryCriteria = Record<string, unknown>

/**
 * Yêu cầu cập nhật thông tin huy hiệu danh hiệu
 */
export interface UpdateBadgeRequestDto {
  /** Tên huy hiệu mới */
  name?: string
  /** Mô tả ý nghĩa của huy hiệu */
  description?: string
  /** Cấp bậc huy hiệu */
  badge_tier?: BadgeTier
  /** Sự kiện kích hoạt trao huy hiệu */
  badge_trigger_event?: BadgeTriggerEvent
  /** URL hình ảnh biểu tượng huy hiệu */
  icon_url?: string
  criteria?: unknown
  /** Trạng thái kích hoạt của huy hiệu */
  active?: boolean
}

/**
 * Thông tin chi tiết huy hiệu danh hiệu
 */
export interface BadgeResponseDto {
  /** ID huy hiệu */
  badge_id?: number
  /** Tên huy hiệu */
  name?: string
  /** Mô tả ý nghĩa của huy hiệu */
  description?: string
  /** Cấp bậc huy hiệu */
  badge_tier?: BadgeTier
  /** Sự kiện kích hoạt trao huy hiệu */
  badge_trigger_event?: BadgeTriggerEvent
  /** URL hình ảnh biểu tượng huy hiệu */
  icon_url?: string
  criteria?: unknown
  /** Tổng số người dùng đã đạt huy hiệu này */
  total_earned_users?: number
  /** Huy hiệu còn đang hoạt động hay không */
  active?: boolean
  /** Thời gian tạo huy hiệu */
  created_at?: string
}

/**
 * Yêu cầu cài đặt hoặc thay đổi mã PIN kho ẩn trò chuyện
 */
export interface SetHiddenChatPinDto {
  /** Mã PIN mới gồm đúng 6 chữ số */
  pin: string
  /** Mã PIN cũ (bắt buộc nếu đã từng cài mã PIN trước đó) */
  old_pin?: string
}

/**
 * Yêu cầu từ chối phê duyệt danh sách câu hỏi đề xuất
 */
export interface RejectQuestionsRequest {
  /** Danh sách ID câu hỏi bị từ chối */
  question_ids: number[]
  /** Lý do từ chối phê duyệt */
  reason?: string
}

/**
 * Yêu cầu đề xuất phiên nộp bộ câu hỏi trắc nghiệm mới
 */
export interface ProposeSessionRequest {
  /** Tiêu đề của phiên đề xuất */
  title: string
  /** Mô tả tổng quan hoặc ghi chú thêm cho phiên */
  content?: string
  /** Nguồn tài liệu tham khảo (URL giáo trình, tài liệu tham khảo online) */
  source_url?: string
  /** ID môn học trong hệ thống mà sinh viên đang theo học */
  subject_id: number
  /** Danh sách các câu hỏi đề xuất trong phiên */
  questions: QuestionProposeDto[]
}

/**
 * Thông tin chi tiết một câu hỏi đề xuất
 */
export interface QuestionProposeDto {
  /** Nội dung câu hỏi */
  content: string
  /** Danh sách URL ảnh đính kèm minh họa đề bài */
  media_urls?: string[]
  /** Danh sách các lựa chọn đáp án */
  options: QuestionOption[]
  /** Lời giải thích chi tiết cho đáp án đúng */
  explanation?: string
  /** Đánh dấu câu hỏi do AI/LLM sinh (true) hay do tác giả tự biên soạn (false) */
  llm_generated: boolean
  /** Mức độ tự tin của tác giả [0.0; 4.0]: 0-Quá tệ/sai hoàn toàn, 1-LLM bịa ra, 2-Chưa nắm vững, 3-Cơ bản, 4-Câu hỏi hay */
  confidence?: number
}

/**
 * Kết quả sau khi nộp đề xuất phiên câu hỏi
 */
export interface ProposeSessionResponse {
  /** ID phiên đề xuất */
  session_id?: number
  /** Mã phiên nộp duy nhất */
  session_code?: string
  /** ID môn học */
  subject_id?: number
  /** Số lượng câu hỏi trong phiên */
  question_count?: number
  /** Trạng thái phiên đề xuất (PENDING, APPROVED, REJECTED, RESOLVED) */
  status?: 'PENDING' | 'REVIEWING' | 'RESOLVED'
  /** Thời điểm khởi tạo phiên */
  created_at?: string
}

/**
 * Yêu cầu phê duyệt danh sách câu hỏi đề xuất
 */
export interface ApproveQuestionsRequest {
  /** Danh sách ID câu hỏi cần phê duyệt */
  question_ids: number[]
}

/**
 * Kết quả phê duyệt câu hỏi
 */
export interface ApproveQuestionsResponse {
  /** Tổng điểm thưởng đã cộng cho tác giả */
  points_earned?: number
}

/**
 * Yêu cầu gửi báo cáo vi phạm nội dung hoặc hành vi người dùng
 */
export interface CreateReportRequestDto {
  /** Loại vi phạm nội dung (SPAM, HARASSMENT, HATE_SPEECH, INAPPROPRIATE_CONTENT, COPYRIGHT, OTHER) */
  violation_type: 'HARASSMENT' | 'HATE_STATEMENT' | 'SPAM' | 'OTHER'
  /** Mô tả chi tiết nội dung vi phạm */
  description?: string
  /** Danh sách URL hình ảnh bằng chứng (nếu có) */
  evidence_urls?: string[]
  /** Loại đối tượng bị báo cáo (USER, POST, COMMENT) */
  target_type: 'POST' | 'COMMENT' | 'USER'
  /** ID của đối tượng bị báo cáo */
  target_id: number
}

/**
 * Kết quả ghi nhận đơn báo cáo vi phạm
 */
export interface ReportResponseDto {
  /** ID bản ghi đơn báo cáo */
  report_id?: number
  /** Loại đối tượng bị báo cáo */
  target_type?: 'POST' | 'COMMENT' | 'USER'
  /** ID đối tượng bị báo cáo */
  target_id?: number
  /** Trạng thái xử lý báo cáo (PENDING, RESOLVED) */
  status?: 'PENDING' | 'RESOLVED'
  /** Thời điểm gửi báo cáo */
  created_at?: string
}

/**
 * Yêu cầu thả hoặc gỡ cảm xúc
 */
export interface ReactRequest {
  /** Loại đối tượng (POST, COMMENT, QUESTION, SESSION) */
  target_type: 'POST' | 'SESSION' | 'QUESTION'
  /** ID của đối tượng cần thả cảm xúc */
  target_id: number
  /** Loại cảm xúc tích cực (LIKE, LOVE, WOW) */
  reaction_type: ReactionType
}

export interface ReactResponseDto {
  my_reaction?: string
  reaction_counts?: Record<string, unknown>
  total_count?: number
}

/**
 * Yêu cầu giảng viên/quản trị viên thẩm định báo lỗi câu hỏi (Game 5)
 */
export interface ReviewErrorRequest {
  /** Xác nhận câu hỏi có bị lỗi thực sự hay không (true: chấp nhận lỗi và thưởng điểm người báo, phạt tác giả; false: từ chối) */
  is_comfirmed: boolean
  /** Ghi chú hoặc giải thích của người thẩm định */
  notes?: string
}

/**
 * Yêu cầu đánh giá chất lượng câu hỏi
 */
export interface RateQuestionRequest {
  /** Mức điểm đánh giá [0; 4] (0: sai hoàn toàn, 1: LLM bịa, 2: người hỏi chưa vững kiến thức, 3: kiến thức cơ bản, 4: câu hỏi hay) */
  rating: number
  /** Đánh dấu câu hỏi bị sai đề hoặc lỗi kiến thức (nếu true, điểm đánh giá tự động là 0) */
  is_error?: boolean
  /** Bình luận hoặc góp ý chi tiết cho câu hỏi */
  comment?: string
}

/**
 * Kết quả sau khi đánh giá câu hỏi
 */
export interface RateQuestionResponse {
  /** Điểm đánh giá trung bình mới của câu hỏi */
  new_avg_rating?: number
  /** Tổng số lượt đánh giá mới */
  new_rating_count?: number
}

/**
 * Yêu cầu trả lời câu hỏi trắc nghiệm
 */
export interface AnswerQuestionRequest {
  /** Danh sách các khóa đáp án được chọn (A, B, C...) */
  selected_options: string[]
  /** Thời điểm cập nhật câu hỏi gần nhất được cache tại client (dùng chống stale data) */
  question_updated_at?: string
}

/**
 * Kết quả chấm câu trả lời
 */
export interface AnswerQuestionResponse {
  /** Kết quả trả lời đúng hay sai */
  is_correct?: boolean
  /** Khóa đáp án đúng */
  correct_answer?: string
  /** Lời giải chi tiết câu hỏi */
  explanation?: string
}

/**
 * Yêu cầu AI tinh chỉnh câu hỏi trắc nghiệm
 */
export interface AiRefineRequest {
  /** Chỉ thị tinh chỉnh của người dùng (ví dụ: làm rõ câu hỏi, viết lại giải thích, sửa phương án gây nhiễu) */
  prompt: string
  /** ID phiên chat AI liên quan (nếu có) */
  chat_session_id?: string
}

/**
 * Thông tin kỹ thuật phản hồi từ mô hình AI (Model metadata)
 */
export interface AiMetadataDto {
  /** Tên mô hình AI được sử dụng */
  model?: string
  /** Số lượng tokens đã tiêu thụ */
  tokens_used?: number
  /** Thời gian xử lý của AI (ms) */
  processing_time_ms?: number
}

/**
 * Kết quả AI tinh chỉnh câu hỏi kèm kiểm định ảo giác Btprop
 */
export interface AiRefineResponse {
  /** ID nhật ký chỉnh sửa đã ghi nhận */
  edit_log_id?: number
  suggested_question?: SuggestedQuestionDto
  hallucination_audit?: BtpropAuditDto
  ai_metadata?: AiMetadataDto
}

/**
 * Kết quả đánh giá độ tin cậy và ảo giác (Hallucination Audit)
 */
export interface BtpropAuditDto {
  /** Có phát hiện ảo giác/thông tin sai lệch hay không */
  is_hallucinated?: boolean
  /** Điểm tin cậy của câu hỏi do AI đề xuất [0.0 - 1.0] */
  confidence_score?: number
  /** Độ sâu của cây niềm tin kiểm định */
  belief_tree_depth?: number
  /** Danh sách các vi phạm logic nếu có */
  violations?: ViolationDto[]
}

/**
 * Chi tiết câu hỏi do AI đề xuất
 */
export interface SuggestedQuestionDto {
  /** Nội dung đề bài mới */
  content?: string
  /** Danh sách các phương án trả lời mới */
  options?: QuestionOption[]
  /** Giải thích chi tiết cho đáp án đúng */
  explanation?: string
  /** Lý do từ chối nếu yêu cầu vi phạm chính sách */
  refusal_reason?: string
}

/**
 * Thông tin vi phạm logic được phát hiện
 */
export interface ViolationDto {
  /** Loại vi phạm */
  type?: string
  /** Mệnh đề logic trong cây niềm tin */
  node_statement?: string
  /** Chi tiết vi phạm */
  detail?: string
  /** Mức độ nghiêm trọng (LOW, MEDIUM, HIGH, CRITICAL) */
  severity?: string
}

/**
 * Yêu cầu phê duyệt hoặc hủy bỏ kết quả chỉnh sửa câu hỏi của AI
 */
export interface AiApplyRequest {
  /** ID nhật ký chỉnh sửa AI cần phê duyệt/hủy bỏ */
  edit_log_id: number
  /** true: Áp dụng chỉnh sửa vào câu hỏi gốc, false: Loại bỏ */
  approve: boolean
}

/**
 * Kết quả áp dụng/loại bỏ chỉnh sửa AI
 */
export interface AiApplyResponse {
  /** ID câu hỏi */
  question_id?: number
  /** Trạng thái sau khi áp dụng (APPLIED hoặc DISCARDED) */
  status?: string
  /** Điểm tin cậy của mô hình */
  confidence_score?: number
  /** Có bị đánh dấu ảo giác hay không */
  hallucination?: boolean
}

/**
 * Yêu cầu tạo mới bài viết thảo luận hoặc video bài giảng
 */
export interface CreatePostRequest {
  /** Nội dung bài viết */
  content?: string
  /** Danh sách tệp tin đính kèm (ảnh hoặc video) */
  media_urls?: MediaItem[]
  /** Chế độ hiển thị bài viết (PUBLIC, FRIENDS, ONLY_ME) */
  visibility: PostVisibility
  /** ID môn học (Bắt buộc nếu post_type là LEARNING_VIDEO dành cho Giảng viên) */
  subject_id?: number
  /** Loại bài viết (SOCIAL_POST, LEARNING_VIDEO) */
  post_type?: PostType
}

export interface PostResponseDto {
  post_id?: number
  content?: string
  post_type?: PostType
  media_urls?: MediaItem[]
  visibility?: PostVisibility
  author?: AuthorDto
  react_count?: number
  comment_count?: number
  reacted_by_me?: boolean
  created_at?: string
  updated_at?: string
  lecturer_note?: string
  lecturer_note_added_at?: string
  noted_lecturer?: AuthorDto
  subject_id?: number
  subject_name?: string
  subject_code?: string
  session_id?: number
}

export interface ReadNotificationResponseDto {
  notification_id?: number
  read_at?: string
  unread_count?: number
  read?: boolean
}

export interface MediaVerifyRequest {
  urls: string[]
}

export interface MediaVerifyResponse {
  missing_urls?: string[]
}

export interface MediaUploadResponse {
  object_key?: string
  url?: string
  file_size?: number
  content_type?: string
  media_type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  width?: number
  height?: number
}

/**
 * Thông tin một tệp tin cần xin presigned URL
 */
export interface PresignFileItem {
  /** Tên gốc của tệp tin */
  file_name: string
  /** Kích thước tệp tính bằng byte (tối đa 15MB) */
  file_size: number
  /** MIME Content-Type của tệp */
  content_type: string
  /** Mục đích tải lên (AVATAR, COVER, POST, QUESTION, CHAT...) */
  purpose: 'AVATAR' | 'COVER' | 'QUESTION' | 'POST' | 'COMMENT' | 'CHAT' | 'DOCUMENT'
}

/**
 * Yêu cầu cấp URL ký trước (Presigned URL) để tải media trực tiếp lên Cloudflare R2
 */
export interface PresignMediaRequest {
  /** Danh sách các tệp tin cần tải lên (tối đa 10 tệp) */
  files: PresignFileItem[]
}

/**
 * Phản hồi danh sách URL ký trước để tải tệp lên Cloudflare R2
 */
export interface PresignMediaResponse {
  /** Danh sách URL ký trước tương ứng với từng tệp yêu cầu */
  presigned_urls?: PresignedUrlItem[]
}

/**
 * Thông tin chi tiết đường dẫn tải lên cho một tệp
 */
export interface PresignedUrlItem {
  /** Mã khóa đối tượng duy nhất trên R2 S3 */
  object_key?: string
  /** URL ký trước phương thức PUT để Client upload trực tiếp lên R2 */
  upload_url?: string
  /** URL công khai của tệp sau khi upload thành công */
  public_url?: string
  /** Thời gian hết hạn của link ký tính bằng giây */
  expires_in_seconds?: number
}

/**
 * Yêu cầu tạo lớp học phần mới
 */
export interface CreateCourseClassRequest {
  /** Mã lớp học phần (VD: 171146) */
  class_code: string
  /** ID môn học */
  subject_id: number
  /** ID học kỳ (để trống sẽ tự động lấy học kỳ đang kích hoạt) */
  semester_id?: number
  /** ID giảng viên phụ trách (chỉ Admin mới có quyền gán, để trống sẽ tự lấy ID người tạo) */
  lecturer_id?: number
}

/**
 * Thông tin chi tiết của một lớp học phần
 */
export interface CourseClassResponse {
  /** ID lớp học phần */
  course_class_id?: number
  /** Mã lớp học phần */
  class_code?: string
  /** ID môn học */
  subject_id?: number
  /** Mã môn học */
  subject_code?: string
  /** Tên môn học */
  subject_name?: string
  /** ID học kỳ */
  semester_id?: number
  /** Tên học kỳ */
  semester_name?: string
  /** ID giảng viên phụ trách */
  lecturer_id?: number
  /** Họ và tên giảng viên phụ trách */
  lecturer_name?: string
  /** Tổng số sinh viên đã ghi danh vào lớp */
  total_students?: number
  /** Thời điểm khởi tạo lớp học phần */
  created_at?: string
}

/**
 * Yêu cầu gán sinh viên vào lớp học phần
 */
export interface AssignStudentsRequest {
  /** Danh sách mã số sinh viên (MSSV) */
  student_codes?: string[]
  /** Danh sách ID tài khoản người dùng trực tiếp */
  student_user_ids?: number[]
}

/**
 * Kết quả gán sinh viên vào lớp học phần
 */
export interface AssignStudentsResponse {
  /** Số lượng sinh viên mới được ghi danh thành công vào lớp */
  total_enrolled?: number
  /** Số lượng sinh viên đã có trong lớp từ trước */
  already_enrolled_count?: number
  /** Số lượng mã sinh viên không tìm thấy trong hệ thống */
  not_found_count?: number
  /** Danh sách các mã sinh viên không tồn tại trong hệ thống */
  not_found_codes?: string[]
}

/**
 * Yêu cầu nộp dự đoán Game 6: Phán đoán câu hỏi do AI tạo
 */
export interface Game6SubmitRequest {
  /** ID phiên minigame Game 6 */
  minigame_session_id: number
  /** Danh sách ID các câu hỏi mà bạn phán đoán do AI tạo */
  selected_llm_question_ids: number[]
}

/**
 * Thông tin chi tiết một lượt dự đoán minigame
 */
export interface GamePredictionResponse {
  /** ID lượt dự đoán */
  prediction_id?: number
  /** Loại trò chơi dự đoán */
  game_type?:
    | 'GAME_1_PARTICIPANTS'
    | 'GAME_2_APPROVED_QUESTIONS'
    | 'GAME_3_AUTHOR_CONFIDENCE'
    | 'GAME_4_SUBJECT_BANK_SIZE'
    | 'GAME_5_REPORT_ERROR'
    | 'GAME_6_LLM_IDENTIFICATION'
  /** Loại đối tượng dự đoán */
  target_type?: 'COURSE_CLASS' | 'SESSION' | 'SUBJECT' | 'GAME6_SESSION'
  /** ID đối tượng dự đoán */
  target_id?: number
  /** Dữ liệu người chơi đã dự đoán */
  prediction_data?: Record<string, unknown>
  /** Dữ liệu kết quả thực tế sau khi tổng kết */
  actual_data?: Record<string, unknown>
  /** Trạng thái lượt dự đoán */
  status?: 'PENDING' | 'RESOLVED'
  /** Dự đoán chính xác hay không */
  is_correct?: boolean
  /** Thời điểm đặt dự đoán */
  created_at?: string
  /** Thời điểm tổng kết kết quả */
  resolved_at?: string
}

/**
 * Yêu cầu dự đoán Game 1: Số lượng người tham gia nộp câu hỏi ngày mai của lớp học phần
 */
export interface Game1PredictionRequest {
  /** Số lượng sinh viên dự đoán sẽ đề xuất câu hỏi vào ngày mai */
  predicted_count: number
  /** ID lớp học phần */
  course_class_id: number
}

/**
 * Yêu cầu dự đoán Game 4: Tổng số câu hỏi ngân hàng đề môn học khi kết thúc kỳ
 */
export interface Game4PredictionRequest {
  /** ID môn học */
  subject_id: number
  /** Dự đoán tổng số lượng câu hỏi được duyệt trong ngân hàng đề */
  predicted_bank_size: number
}

/**
 * Yêu cầu dự đoán Game 2: Số câu hỏi LLM và Con người được phê duyệt vào ngân hàng đề
 */
export interface Game2PredictionRequest {
  /** ID phiên đề xuất */
  session_id: number
  /** Số câu hỏi do LLM tạo được duyệt (APPROVED) */
  predicted_llm_count?: number
  /** Số câu hỏi do con người tạo được duyệt (APPROVED) */
  predicted_human_count?: number
}

/**
 * Kết quả điểm danh chuyên cần hàng ngày
 */
export interface CheckInResponse {
  /** Số xu nhận được từ lượt điểm danh này */
  coin_earned?: number
  /** Tổng số dư xu mới sau điểm danh */
  current_coin_balance?: number
  /** Số ngày điểm danh liên tiếp hiện tại (Streak) */
  current_streak?: number
  /** Ngày điểm danh */
  check_in_date?: string
  /** Thông báo kết quả điểm danh */
  message?: string
}

/**
 * Yêu cầu gửi lời mời kết bạn
 */
export interface SendFriendRequestDto {
  /** ID người nhận lời mời (phải cùng vai trò Sinh viên hoặc Giảng viên) */
  addressee_id: number
}

export interface FriendshipResponseDto {
  requester_id?: number
  addressee_id?: number
  status?: FriendRequestStatus
  created_at?: string
  accepted_at?: string
}

/**
 * Yêu cầu từ chối lời mời kết bạn
 */
export interface DeclineFriendRequestDto {
  /** ID người đã gửi lời mời kết bạn */
  requester_id: number
}

/**
 * Yêu cầu chấp nhận lời mời kết bạn
 */
export interface AcceptFriendRequestDto {
  /** ID người đã gửi lời mời kết bạn */
  requester_id: number
}

export interface FollowResponseDto {
  target_user_id?: number
  new_followers_count?: number
  followed_at?: string
  following?: boolean
}

/**
 * Tỉ lệ phân bổ độ khó (tổng các giá trị tương đương 1.0)
 */
export interface DifficultyDistribution {
  /** Tỉ lệ câu dễ (0.0 - 1.0) */
  easy?: number
  /** Tỉ lệ câu trung bình (0.0 - 1.0) */
  medium?: number
  /** Tỉ lệ câu khó (0.0 - 1.0) */
  hard?: number
  /** Tỉ lệ câu chưa phân loại */
  unclassified?: number
}

/**
 * Yêu cầu tạo đề thi tự động từ ngân hàng câu hỏi
 */
export interface GenerateExamRequest {
  /** ID môn học tạo đề */
  subject_id: number
  /** Tiêu đề đề thi (nếu để trống hệ thống sẽ tự sinh) */
  title?: string
  /** Số lượng câu hỏi trong đề thi */
  question_count?: number
  difficulty_distribution?: DifficultyDistribution
  /** Trọng số các chủ đề/chương (tùy chọn) */
  topic_weights?: Record<string, unknown>
  /** Đảo ngẫu nhiên thứ tự các phương án lựa chọn A, B, C, D */
  shuffle_options?: boolean
  /** Có xuất kèm bảng đáp án hay không */
  include_answer_key?: boolean
  /** Danh sách ID các lớp học phần được áp dụng đề thi này */
  class_ids: number[]
}

/**
 * Thông tin chi tiết đề thi
 */
export interface ExamDetailResponse {
  /** ID đề thi */
  exam_id?: number
  /** Tiêu đề đề thi */
  title?: string
  /** Tên môn học */
  subject_name?: string
  /** Tổng số lượng câu hỏi trong đề */
  question_count?: number
  /** Danh sách câu hỏi trong đề thi */
  questions?: ExamQuestionDto[]
  statistic?: Statistic
  /** Thời gian tạo đề */
  created_at?: string
}

/**
 * Chi tiết câu hỏi trong đề thi
 */
export interface ExamQuestionDto {
  /** Thứ tự câu hỏi trong đề thi */
  order?: number
  /** ID câu hỏi */
  question_id?: number
  /** Nội dung câu hỏi (hỗ trợ LaTeX/Markdown) */
  content?: string
  /** Danh sách URL hình ảnh minh họa cho câu hỏi */
  image_urls?: string[]
  /** Danh sách các lựa chọn đáp án */
  options?: OptionDto[]
  /** Độ khó của câu hỏi */
  difficulty?: 'UNCLASSIFIED' | 'EASY' | 'MEDIUM' | 'HARD'
  /** Tên chủ đề / chương */
  topic?: string
}

/**
 * Chi tiết phương án lựa chọn
 */
export interface OptionDto {
  /** Khóa phương án */
  key?: string
  /** Nội dung phương án */
  text?: string
  /** URL hình ảnh đáp án (nếu có) */
  media_url?: string
  /** Đáp án này có đúng hay không */
  is_correct?: boolean
}

/**
 * Thống kê số lượng câu hỏi theo độ khó
 */
export interface Statistic {
  /** Số câu mức độ Dễ */
  easy_count?: number
  /** Số câu mức độ Trung bình */
  medium_count?: number
  /** Số câu mức độ Khó */
  hard_count?: number
  /** Số câu chưa phân loại độ khó */
  unclassified_count?: number
}

export interface SyncFidRequest {
  /** Firebase Installation ID (FID) cần đồng bộ hoặc cập nhật */
  fid: string
}

export interface UnregisterFidRequest {
  /** Firebase Installation ID (FID) cần hủy đăng ký */
  fid: string
}

/**
 * Thông tin chi tiết một vật phẩm được bày bán trong cửa hàng
 */
export interface ShopItemDto {
  /** ID vật phẩm */
  cosmetic_id?: number
  /** Tên vật phẩm */
  name?: string
  /** Mô tả vật phẩm */
  description?: string
  /** Loại vật phẩm trang trí */
  type?: 'AVATAR_FRAME' | 'CHAT_BUBBLE'
  /** Độ hiếm của vật phẩm */
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  /** URL hình ảnh/tài nguyên hiển thị */
  asset_url?: string
  /** Giá bán hiện tại (SQB Coins) */
  price?: number
  /** Giá gốc trước khi giảm giá (nếu có) */
  original_price?: number
  /** Thời hạn mở bán (null nếu bán vĩnh viễn) */
  available_until?: string
  owned?: boolean
}

/**
 * Yêu cầu thêm thành viên vào nhóm chat
 */
export interface AddGroupMembersRequestDto {
  /** Danh sách ID các người dùng cần thêm vào nhóm */
  user_ids: number[]
}

export interface AddGroupMembersResponseDto {
  added_members?: ConversationMemberDto[]
  failed_members?: FailedMemberDto[]
}

export interface FailedMemberDto {
  user_id?: number
  full_name?: string
  avatar_url?: string
  frame_url?: string
  reason?: string
}

/**
 * Yêu cầu rời khỏi nhóm chat
 */
export interface LeaveGroupRequestDto {
  /** ID của thành viên được chỉ định làm Tù trưởng (CHIEF) mới (chỉ dùng khi Tù trưởng hiện tại rời nhóm) */
  new_chief_id?: number
}

/**
 * Thông tin phản hồi khi rời nhóm chat
 */
export interface LeaveGroupResponseDto {
  /** ID nhóm chat */
  conversation_id?: number
  new_chief?: ConversationMemberDto
}

/**
 * Yêu cầu mở khóa kho ẩn trò chuyện
 */
export interface UnlockHiddenChatDto {
  /** Mã PIN 6 chữ số đã thiết lập */
  pin: string
}

/**
 * Yêu cầu tạo nhóm chat mới
 */
export interface CreateGroupConversationDto {
  /** Tên nhóm trò chuyện */
  name: string
  /** URL ảnh đại diện nhóm (đã upload qua R2) */
  avatar_url?: string
  /** Danh sách ID các thành viên mời vào nhóm (tối thiểu 2 thành viên khác người tạo) */
  member_ids: number[]
}

/**
 * Yêu cầu tạo cuộc trò chuyện trực tiếp 1-1
 */
export interface CreateDirectConversationDto {
  /** ID của người dùng cần nhắn tin 1-1 */
  target_user_id: number
}

/**
 * Yêu cầu tạo bình luận mới
 */
export interface CreateCommentRequest {
  /** Loại đối tượng bình luận (POST, SESSION, QUESTION) */
  target_type: 'POST' | 'SESSION' | 'QUESTION'
  /** ID đối tượng được bình luận */
  target_id: number
  /** Nội dung bình luận bằng văn bản */
  content?: string
  /** ID của bình luận cha nếu đây là phản hồi (reply), để trống nếu là bình luận gốc */
  parent_comment_id?: number
  /** URL hình ảnh đính kèm (đã upload qua R2) */
  media_url?: string
}

export interface BlockResponseDto {
  blocked_user_id?: number
  blocked?: boolean
}

/**
 * Yêu cầu cấp mới Access Token bằng Refresh Token
 */
export interface RefreshTokenRequest {
  /** Mã Refresh Token hợp lệ còn thời hạn */
  refresh_token: string
}

/**
 * Thông tin phản hồi cấp mới bộ token truy cập
 */
export interface RefreshTokenResponse {
  /** JWT Access Token mới */
  access_token?: string
  /** Refresh Token mới */
  refresh_token?: string
}

/**
 * Thông tin yêu cầu đăng nhập hệ thống
 */
export interface LoginRequest {
  /** Địa chỉ email sinh viên hoặc giảng viên */
  email: string
  /** Mật khẩu tài khoản */
  password: string
  /** Định danh thiết bị duy nhất (UUID hoặc Device Fingerprint) */
  device_id: string
  /** Firebase Installation ID (FID) dùng để đẩy thông báo push */
  fid?: string
  /** Nền tảng thiết bị đang đăng nhập */
  platform: 'IOS' | 'ANDROID' | 'DESKTOP' | 'WEB'
  /** Tên hiển thị của thiết bị */
  device_name?: string
  /** Phiên bản hệ điều hành */
  os_version?: string
  /** Phiên bản ứng dụng client */
  app_version?: string
}

/**
 * Thông tin phản hồi xác thực và bộ mã truy cập
 */
export interface AuthResponse {
  /** ID người dùng trong hệ thống */
  user_id?: number
  /** Tên đăng nhập / Email của người dùng */
  username?: string
  /** Vai trò người dùng trong hệ thống */
  role?: UserRole
  /** JWT Access Token dùng cho các request tiếp theo */
  access_token?: string
  /** Refresh Token dùng để cấp mới Access Token */
  refresh_token?: string
  /** Đường dẫn ảnh đại diện */
  avatar_url?: string
  /** Đường dẫn ảnh bìa */
  cover_url?: string
  /** Đường dẫn khung ảnh đại diện */
  frame_url?: string
  /** Trạng thái đã xác minh tài khoản */
  verified?: boolean
  /** Trạng thái đã hoàn tất cập nhật hồ sơ cá nhân */
  profile_completed?: boolean
}

/**
 * Yêu cầu thay đổi mật khẩu người dùng
 */
export interface ChangePasswordRequest {
  /** Mật khẩu hiện tại đang sử dụng */
  old_password: string
  /** Mật khẩu mới */
  new_password: string
}

export interface VerifyOtpRequest {
  email: string
  verify_code: string
  device_id: string
}

/**
 * Yêu cầu khôi phục mật khẩu người dùng từ Quản trị viên
 */
export interface AdminResetPasswordRequest {
  /** Email của tài khoản cần đặt lại mật khẩu */
  email: string
  /** Mật khẩu mới chỉ định (để trống nếu muốn khôi phục về mật khẩu mặc định của trường) */
  new_password?: string
}

export interface ResendOtpRequest {
  email: string
}

export interface RegisterRequest {
  email: string
  password: string
  device_id: string
  role: 'LECTURER' | 'STUDENT'
  timezone?: string
}

/**
 * Yêu cầu tạo hàng loạt tài khoản người dùng
 */
export interface BulkImportRequest {
  /** Danh sách người dùng cần tạo */
  users?: SingleUserImportDto[]
}

/**
 * Thông tin chi tiết một tài khoản cần tạo mới/import
 */
export interface SingleUserImportDto {
  /** Email tài khoản */
  email: string
  /** Mật khẩu ban đầu (bỏ trống để tự sinh theo ngày sinh ddMMyyyy hoặc mã số) */
  password?: string
  /** Họ và tên đầy đủ */
  full_name: string
  /** Mã số sinh viên (MSSV) hoặc Mã số giảng viên (MSGV) */
  student_lecturer_code?: string
  /** Trường / Khoa / Viện đào tạo */
  school_faculty?: string
  /** Chuyên ngành đào tạo */
  major?: string
  /** Tên lớp sinh hoạt */
  class_name?: string
  /** Giới tính (chỉ nhận MALE hoặc FEMALE) */
  gender?: Gender
  /** Ngày tháng năm sinh (định dạng YYYY-MM-DD) */
  date_of_birth?: string
  /** Vai trò người dùng trong hệ thống (STUDENT, LECTURER, ADMIN) */
  role?: 'LECTURER' | 'STUDENT'
  /** Múi giờ hoạt động */
  timezone?: string
}

/**
 * Kết quả xử lý tạo hàng loạt người dùng
 */
export interface BulkImportResult {
  /** Tổng số tài khoản tạo thành công */
  total_success?: number
  /** Tổng số tài khoản thất bại hoặc bị trùng lặp */
  total_failed?: number
  /** Danh sách chi tiết các thông báo lỗi nếu có */
  errors?: string[]
}

/**
 * Yêu cầu tạo môn học mới trong hệ thống
 */
export interface CreateSubjectRequest {
  /** Tên môn học */
  name: string
  /** Mã môn học (duy nhất, viết hoa) */
  code: string
}

/**
 * Thông tin môn học trong hệ thống
 */
export interface SubjectResponse {
  /** ID môn học */
  subject_id?: number
  /** Mã môn học */
  code?: string
  /** Tên môn học */
  name?: string
}

/**
 * Yêu cầu tạo học kỳ mới trong hệ thống
 */
export interface CreateSemesterRequest {
  /** Tên học kỳ hiển thị */
  name: string
}

/**
 * Yêu cầu tái xây dựng lại Bảng xếp hạng trong Redis
 */
export interface RebuildLeaderboardRequest {
  /** Phạm vi bảng xếp hạng */
  type?: 'SUBJECT' | 'SEMESTER'
  /** ID môn học (nếu tái tạo bảng xếp hạng theo môn) */
  subject_id?: number
}

/**
 * Kết quả import lớp học phần và ghi danh sinh viên từ file Excel
 */
export interface ExcelImportClassResult {
  /** ID lớp học phần */
  course_class_id?: number
  /** Mã lớp học phần bóc tách từ Excel */
  class_code?: string
  /** Mã môn học bóc tách từ Excel */
  subject_code?: string
  /** Tên môn học tương ứng trong hệ thống */
  subject_name?: string
  /** Tên học kỳ đang hoạt động */
  semester_name?: string
  /** Tổng số dòng sinh viên đọc được từ file Excel */
  total_rows_in_file?: number
  /** Số lượng tài khoản sinh viên mới được tạo tự động */
  new_users_created?: number
  /** Số lượng sinh viên đã tồn tại tài khoản từ trước */
  existing_users_found?: number
  /** Số lượng sinh viên mới được ghi danh vào lớp học phần */
  new_enrollments?: number
  /** Số lượng sinh viên đã ghi danh vào lớp này từ trước */
  already_enrolled_count?: number
}

/**
 * Yêu cầu tạo mới huy hiệu danh hiệu
 */
export interface CreateBadgeRequestDto {
  /** Tên huy hiệu */
  name: string
  /** Mô tả ý nghĩa của huy hiệu */
  description?: string
  /** Cấp bậc huy hiệu */
  badge_tier: BadgeTier
  /** Sự kiện kích hoạt tự động trao huy hiệu */
  badge_trigger_event: BadgeTriggerEvent
  /** URL hình ảnh biểu tượng huy hiệu */
  icon_url?: string
  criteria: unknown
}

/**
 * Yêu cầu cấp phát huy hiệu thủ công cho người dùng (Dành cho Quản trị viên)
 */
export interface ManualGrantBadgeRequestDto {
  /** Danh sách ID người dùng được cấp huy hiệu */
  user_ids: number[]
  /** Lý do trao thưởng hoặc ghi chú của Quản trị viên */
  reason?: string
}

/**
 * Yêu cầu trò chuyện tương tác với trợ lý AI
 */
export interface AiChatRequest {
  /** Câu hỏi hoặc lời nhắc mới của người dùng */
  prompt: string
  /** ID phiên trò chuyện để tiếp tục ngữ cảnh (để trống nếu tạo phiên mới) */
  chat_session_id?: string
  /** Lịch sử 5-10 tin nhắn gần nhất do Frontend lưu giữ và gửi lên (Stateless context) */
  history?: ChatMessageDto[]
  context?: ChatContextDto
}

/**
 * Thông tin ngữ cảnh học tập
 */
export interface ChatContextDto {
  /** Tên môn học đang học/ôn tập */
  subject_name?: string
  /** Chủ đề cụ thể */
  topic?: string
}

/**
 * Một tin nhắn trong lịch sử trò chuyện
 */
export interface ChatMessageDto {
  /** Vai trò người gửi: 'user' hoặc 'assistant' */
  role: string
  /** Nội dung tin nhắn trong lịch sử */
  content: string
}

/**
 * Câu trả lời từ trợ lý AI
 */
export interface AiChatResponse {
  /** Nội dung phản hồi được định dạng Markdown của AI */
  ai_response?: string
  /** ID phiên trò chuyện */
  session_id?: string
  ai_metadata?: AiMetadataDto
}

export interface CursorPaginationDto {
  before?: number
  after?: number
  has_prev?: boolean
  has_next?: boolean
}

export interface CursorResponseVideoPostItemDto {
  items?: VideoPostItemDto[]
  pagination?: CursorPaginationDto
}

export interface VideoPostItemDto {
  post_id?: number
  content?: string
  visibility?: PostVisibility
  react_count?: number
  comment_count?: number
  media_urls?: MediaItem[]
  author?: AuthorDto
  created_at?: string
  updated_at?: string
  subject_id?: number
  subject_name?: string
  subject_code?: string
}

/**
 * Thông tin tóm tắt của một phiên nộp đề xuất
 */
export interface SubmissionSessionSummaryDto {
  /** ID phiên đề xuất */
  session_id?: number
  /** Mã phiên nộp duy nhất */
  session_code?: string
  /** Tiêu đề phiên nộp */
  title?: string
  /** Mô tả nội dung phiên */
  content?: string
  /** ID môn học */
  subject_id?: number
  /** Tên môn học */
  subject_name?: string
  /** Mã môn học */
  subject_code?: string
  /** Số lượng câu hỏi trong phiên */
  question_counts?: number
  /** Thời điểm khởi tạo phiên nộp */
  created_at?: string
  /** Số lượt thả cảm xúc (react) cho phiên */
  react_count?: number
  /** Số lượng bình luận trao đổi trong phiên */
  comment_count?: number
}

/**
 * Danh sách phiên đề xuất câu hỏi của người dùng (kèm phân trang con trỏ)
 */
export interface SubmissionsResponse {
  /** Danh sách các phiên đề xuất */
  contents?: SubmissionSessionSummaryDto[]
  pagination?: CursorPaginationDto
}

export interface Counts {
  followers_count?: number
  following_count?: number
  friends_count?: number
}

export interface RelationshipStatsResponseDto {
  user_id?: number
  counts?: Counts
  relationship_with_me?: RelationshipWithMe
}

export interface RelationshipWithMe {
  friend_request_status?: FriendRequestStatus
  friend?: boolean
  blocked?: boolean
  following?: boolean
  followed_by?: boolean
}

export interface CursorResponsePostResponseDto {
  items?: PostResponseDto[]
  pagination?: CursorPaginationDto
}

/**
 * Cảnh báo trùng lặp câu hỏi được phát hiện bởi hệ thống
 */
export interface DuplicateWarning {
  /** Thứ tự của câu hỏi trong phiên nộp */
  question_index?: number
  /** ID của câu hỏi tương đồng đã tồn tại trong ngân hàng đề */
  similar_question_id?: number
  /** Điểm số tương đồng (0.0 - 1.0) */
  similarity_score?: number
  /** Tầng phát hiện trùng lặp */
  tier?: 'RULE_BASED' | 'TRIGRAM' | 'P_HASH' | 'TEXT_EMBEDDING' | 'IMAGE_EMBEDDING'
  /** Trích đoạn nội dung bị trùng lặp */
  matched_snipet?: string
  /** URL hình ảnh bị trùng lặp (nếu phát hiện trùng qua ảnh) */
  media_url?: string
}

/**
 * Nhật ký chỉnh sửa câu hỏi
 */
export interface QuestionEditLogDto {
  /** ID nhật ký chỉnh sửa */
  edit_log_id?: number
  /** Loại đối tượng thực hiện chỉnh sửa (SYSTEM, LECTURER) */
  actor_type?: string
  /** Tên hiển thị của người/hệ thống chỉnh sửa */
  actor_name?: string
  /** Trạng thái nhật ký */
  status?: string
  /** Dữ liệu trước khi chỉnh sửa */
  before_state?: Record<string, unknown>
  /** Dữ liệu sau khi chỉnh sửa */
  after_state?: Record<string, unknown>
  /** Kết quả kiểm định ảo giác AI (Hallucination Audit) */
  hallucination_audit?: Record<string, unknown>
  /** Thời gian ghi nhận chỉnh sửa */
  created_at?: string
}

/**
 * Thông tin chi tiết phiên đề xuất dành cho giảng viên duyệt
 */
export interface SessionDetailReviewResponse {
  /** Danh sách câu hỏi cần duyệt trong phiên */
  items?: SessionQuestionReviewDto[]
  /** Danh sách cảnh báo trùng lặp được phát hiện tự động bởi hệ thống */
  duplicate_warnings?: DuplicateWarning[]
}

/**
 * Chi tiết câu hỏi để duyệt
 */
export interface SessionQuestionReviewDto {
  /** ID câu hỏi */
  question_id?: number
  /** Nội dung câu hỏi (hỗ trợ LaTeX/Markdown) */
  content?: string
  /** Danh sách URL ảnh minh họa nội dung câu hỏi */
  image_urls?: string[]
  /** Danh sách các lựa chọn đáp án */
  options?: QuestionOption[]
  /** Khóa đáp án đúng */
  correct_answer?: string
  /** Lời giải thích đáp án */
  explanation?: string
  /** Trạng thái câu hỏi (PENDING, APPROVED, REJECTED) */
  status?: string
  edit_log?: QuestionEditLogDto
}

/**
 * Các trường chỉ tiết lộ sau khi trả lời
 */
export interface HiddenFieldsDto {
  /** Đáp án đúng */
  correct_answer?: string
  /** Lời giải chi tiết câu hỏi */
  explanation?: string
}

/**
 * Trạng thái tương tác của người dùng đối với câu hỏi
 */
export interface MyInteractionDto {
  /** Người dùng đã trả lời câu hỏi này chưa */
  answered?: boolean
  /** Người dùng đã đánh giá câu hỏi này chưa */
  rated?: boolean
}

/**
 * Thông tin câu hỏi luyện tập
 */
export interface PracticeQuestionDto {
  /** ID câu hỏi */
  question_id?: number
  /** Mã định danh câu hỏi */
  question_code?: string
  /** Nội dung câu hỏi (hỗ trợ LaTeX/Markdown) */
  content?: string
  /** Danh sách URL hình ảnh minh họa cho câu hỏi */
  image_urls?: string[]
  /** Danh sách các lựa chọn đáp án (đã ẩn trường is_correct nếu chưa trả lời) */
  options?: QuestionOption[]
  /** Nguồn gốc tạo câu hỏi */
  source?: 'LLM' | 'HOMO_SAPIENS'
  /** Thời gian tạo */
  created_at?: string
  /** Thời gian cập nhật gần nhất */
  updated_at?: string
  my_interaction?: MyInteractionDto
  hidden_fields?: HiddenFieldsDto
  /** Số lượt tương tác/cảm xúc */
  react_count?: number
  /** Số lượng bình luận */
  comment_count?: number
  /** Số lượt đánh giá chất lượng */
  rating_count?: number
}

/**
 * Phản hồi danh sách câu hỏi trong phiên phục vụ luyện tập
 */
export interface SessionQuestionsResponse {
  /** ID phiên câu hỏi */
  session_id?: number
  /** Mã định danh phiên */
  session_code?: string
  /** Tiêu đề phiên câu hỏi */
  title?: string
  /** Mô tả nội dung phiên */
  content?: string
  /** ID môn học */
  subject_id?: number
  /** Tên môn học */
  subject_name?: string
  /** Mã học phần */
  subject_code?: string
  /** Thời gian tạo phiên */
  created_at?: string
  /** Tổng số câu hỏi trong phiên */
  total_questions?: number
  /** Danh sách câu hỏi luyện tập */
  questions?: PracticeQuestionDto[]
}

/**
 * Thông tin tóm tắt phiên đề xuất chờ duyệt
 */
export interface PendingSessionItemDto {
  /** ID của phiên đề xuất */
  session_id?: number
  /** Tên môn học / học phần */
  topic?: string
  /** Tiêu đề phiên đề xuất */
  title?: string
  /** Mô tả nội dung phiên */
  content?: string
  author?: AuthorDto
  /** Trạng thái phiên đề xuất */
  status?: string
  /** Thời gian tạo phiên đề xuất */
  created_at?: string
}

/**
 * Phản hồi danh sách các phiên đề xuất câu hỏi đang chờ duyệt
 */
export interface PendingSessionsResponse {
  /** Danh sách các phiên chờ duyệt */
  items?: PendingSessionItemDto[]
  pagination?: CursorPaginationDto
}

/**
 * Chi tiết phiên đề xuất câu hỏi của người dùng
 */
export interface MySubmissionDetailResponse {
  /** ID phiên đề xuất */
  session_id?: number
  /** Mã phiên nộp duy nhất */
  session_code?: string
  /** Tiêu đề phiên nộp */
  title?: string
  /** Mô tả nội dung phiên */
  content?: string
  /** ID môn học */
  subject_id?: number
  /** Tên môn học */
  subject_name?: string
  /** Mã môn học */
  subject_code?: string
  /** Số lượng bình luận */
  comment_count?: number
  /** Số lượt thả cảm xúc */
  react_count?: number
  /** Tên hoặc email giảng viên duyệt phiên (nếu đã được duyệt) */
  reviewed_by_lecturer?: string
  /** Thời điểm giảng viên hoàn tất duyệt phiên */
  reviewed_at?: string
  /** Thời điểm tạo phiên */
  created_at?: string
  /** Danh sách câu hỏi trong phiên */
  questions?: MySubmissionQuestionDto[]
}

/**
 * Chi tiết một câu hỏi trong phiên đề xuất
 */
export interface MySubmissionQuestionDto {
  /** ID câu hỏi */
  question_id?: number
  /** Nội dung câu hỏi */
  content?: string
  /** Danh sách URL ảnh đính kèm câu hỏi */
  image_urls?: string[]
  /** Danh sách các lựa chọn đáp án */
  options?: QuestionOption[]
  /** Lời giải thích chi tiết cho đáp án */
  explanation?: string
  /** Nguồn gốc câu hỏi (HOMO_SAPIENS hoặc LLM) */
  source?: 'LLM' | 'HOMO_SAPIENS'
  /** Mức độ tự tin của tác giả [0.0; 4.0] */
  confidence_score?: number
  /** Số bình luận */
  comment_count?: number
  /** Số lượt react */
  react_count?: number
  /** Số lượt đánh giá chất lượng sao */
  rating_count?: number
}

/**
 * Kết quả tìm kiếm toàn cục đa thực thể
 */
export interface GlobalSearchResponseDto {
  /** Danh sách các kết quả tìm kiếm khớp */
  items?: SearchResultItemDto[]
  pagination?: CursorPaginationDto
  /** Tổng số lượng kết quả tìm thấy */
  total_hits?: number
}

/**
 * Kết quả tìm kiếm bài viết
 */
export interface PostSearchResultDto {
  /** ID bài viết */
  post_id?: number
  /** Nội dung bài viết */
  content?: string
  /** ID tác giả */
  author_id?: number
  /** Họ và tên tác giả */
  author_name?: string
  /** URL ảnh đại diện tác giả */
  author_avatar_url?: string
  /** URL khung avatar của tác giả */
  author_frame_url?: string
  /** Loại bài viết */
  post_type?: PostType
  /** Danh sách URL hình ảnh đính kèm bài viết */
  media_urls?: string[]
  /** Số lượt tương tác cảm xúc */
  react_count?: number
  /** Số lượt bình luận */
  comment_count?: number
  /** Thời điểm đăng bài */
  created_at?: string
}

/**
 * Phương án trả lời của câu hỏi
 */
export interface QuestionOptionDto {
  /** Mã ký hiệu phương án (A, B, C, D) */
  key?: string
  /** Nội dung văn bản của phương án */
  text?: string
  /** URL hình ảnh đính kèm của phương án (nếu có) */
  media_url?: string
}

/**
 * Kết quả tìm kiếm câu hỏi trắc nghiệm
 */
export interface QuestionSearchResultDto {
  /** ID câu hỏi */
  question_id?: number
  /** Mã định danh câu hỏi */
  question_code?: string
  /** ID môn học */
  subject_id?: number
  /** Tên môn học */
  subject_name?: string
  /** ID chủ đề */
  topic_id?: number
  /** Tên chủ đề kiến thức */
  topic_name?: string
  /** Trạng thái câu hỏi */
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  /** Độ khó câu hỏi */
  difficulty?: 'UNCLASSIFIED' | 'EASY' | 'MEDIUM' | 'HARD'
  /** Nội dung câu hỏi */
  content?: string
  /** Danh sách các lựa chọn đáp án */
  options?: QuestionOptionDto[]
  /** Giải thích chi tiết cho câu hỏi */
  explanation?: string
  /** Danh sách URL hình ảnh minh họa trong câu hỏi */
  image_urls?: string[]
  /** Điểm đánh giá trung bình từ cộng đồng [1.0 - 5.0] */
  avg_rating?: number
  /** Số lượt đánh giá */
  rating_count?: number
  /** Số lượt thả biểu cảm */
  react_count?: number
  /** Số lượng bình luận thảo luận */
  comment_count?: number
  /** Thời điểm tạo câu hỏi */
  created_at?: string
}

/**
 * Chi tiết một phần tử kết quả tìm kiếm
 */
export interface SearchResultItemDto {
  /** Loại thực thể tìm thấy (POST, USER, QUESTION, SESSION, SUBJECT) */
  type?: 'ALL' | 'POST' | 'USER' | 'QUESTION' | 'SESSION' | 'SUBJECT'
  /** Điểm số độ liên quan tìm kiếm (Elasticsearch score) */
  relevance_score?: number
  post?: PostSearchResultDto
  user?: UserSearchResultDto
  question?: QuestionSearchResultDto
  session?: SessionSearchResultDto
  subject?: SubjectSearchResultDto
}

/**
 * Kết quả tìm kiếm phiên đóng góp câu hỏi
 */
export interface SessionSearchResultDto {
  /** ID phiên đóng góp */
  session_id?: number
  /** Tiêu đề phiên đóng góp */
  title?: string
  /** Mô tả chi tiết nội dung phiên */
  content?: string
  /** ID môn học */
  subject_id?: number
  /** Tên môn học */
  subject_name?: string
  /** Trạng thái phiên */
  status?: 'PENDING' | 'REVIEWING' | 'RESOLVED'
  /** Số lượng câu hỏi đã nộp vào phiên */
  question_count?: number
  /** Số lượt tương tác cảm xúc */
  react_count?: number
  /** Số bình luận */
  comment_count?: number
  /** Thời gian tạo phiên */
  created_at?: string
}

/**
 * Kết quả tìm kiếm môn học
 */
export interface SubjectSearchResultDto {
  /** ID môn học */
  subject_id?: number
  /** Mã môn học */
  subject_code?: string
  /** Tên môn học */
  subject_name?: string
}

/**
 * Kết quả tìm kiếm người dùng
 */
export interface UserSearchResultDto {
  /** ID người dùng */
  user_id?: number
  /** Họ và tên */
  full_name?: string
  /** Mã số sinh viên hoặc mã giảng viên */
  student_lecturer_code?: string
  /** Email người dùng */
  email?: string
  /** Tiểu sử cá nhân */
  bio?: string
  /** URL ảnh đại diện */
  avatar_url?: string
  /** URL khung avatar */
  avatar_frame_url?: string
  /** Trường / Viện đào tạo */
  school_faculty?: string
  /** Chuyên ngành đào tạo */
  major?: string
  /** Vai trò người dùng trong hệ thống */
  role?: UserRole
  /** Tổng số câu hỏi đã đề xuất */
  total_proposed_questions?: number
  /** Tổng số huy hiệu đã đạt được */
  badges_count?: number
  /** Số lượng người đang theo dõi */
  followers_count?: number
}

/**
 * Lịch sử tìm kiếm cá nhân và danh sách từ khóa thịnh hành
 */
export interface SavedAndTrendingSearchesResponseDto {
  /** Danh sách các từ khóa tìm kiếm gần đây của người dùng (tối đa 20) */
  saved_searches?: SavedSearchDto[]
  /** Top 10 từ khóa tìm kiếm thịnh hành nhất toàn hệ thống */
  trending_searches?: string[]
}

/**
 * Thông tin từ khóa đã lưu trong lịch sử
 */
export interface SavedSearchDto {
  /** ID từ khóa tìm kiếm */
  saved_search_id?: number
  /** Nội dung từ khóa tìm kiếm */
  query_text?: string
  /** Thời điểm tìm kiếm gần nhất */
  last_searched_at?: string
}

/**
 * Thống kê chi tiết tương tác của câu hỏi
 */
export interface QuestionStatisticsResponse {
  /** Tổng số lượt người dùng đã trả lời */
  total_answer?: number
  /** Tỷ lệ trả lời chính xác (0.0 - 1.0) */
  correct_rate?: number
  /** Phân bố số lượng lựa chọn cho từng đáp án A, B, C, D */
  option_distribution?: Record<string, unknown>
  rating_summary?: RatingSummaryDto
}

/**
 * Tóm tắt đánh giá chất lượng câu hỏi
 */
export interface RatingSummaryDto {
  /** Điểm đánh giá trung bình */
  avg_rating?: number
  /** Tổng số lượt đánh giá */
  total_ratings?: number
  /** Phân bố số lượt đánh giá theo thang điểm từ 0 đến 4 */
  distribution?: Record<string, unknown>
}

/**
 * Phản hồi danh sách đánh giá của câu hỏi
 */
export interface QuestionRatingsResponse {
  /** Danh sách chi tiết các đánh giá */
  items?: RatingItemDto[]
  pagination?: CursorPaginationDto
}

/**
 * Chi tiết một lượt đánh giá câu hỏi
 */
export interface RatingItemDto {
  /** ID người đánh giá */
  user_id?: number
  /** Điểm số đánh giá [0; 4] */
  rating?: number
  /** Có gắn cờ báo lỗi nội dung câu hỏi hay không */
  is_error?: boolean
  /** Nhận xét của người đánh giá */
  comment?: string
  /** Thời gian đánh giá */
  created_at?: string
}

export interface ConfirmedQuestionDto {
  question_id?: number
  subject_name?: string
  question_snippet?: string
  points?: number
}

export interface NotificationDto {
  notification_id?: number
  type?:
    | 'FRIEND_REQUEST'
    | 'NEW_COMMENT'
    | 'QUESTION_APPROVED'
    | 'EARNED_BADGE'
    | 'QUESTION_ERROR_PENALTY'
    | 'GAME5_SEMESTER_RECAP'
    | 'LEADERBOARD_HONOR'
  title?: string
  body?: string
  icon_url?: string
  read_at?: string
  created_at?: string
  target?: NotificationTargetDto
  actor?: UserSummaryDto
  metadata?: NotificationMetadata
}

export interface NotificationListResponseDto {
  items?: NotificationDto[]
  pagination?: CursorPaginationDto
  unread_count?: number
}

export interface NotificationMetadata {
  confirmed_questions?: ConfirmedQuestionDto[]
}

export interface NotificationTargetDto {
  type?: 'BADGE' | 'SESSION' | 'POST' | 'QUESTION' | 'USER' | 'CONVERSATION'
  target_id?: number
  url?: string
}

export interface UserSummaryDto {
  user_id?: number
  full_name?: string
  avatar_url?: string
  frame_url?: string
}

/**
 * Kết quả xuất tài liệu (PDF / Excel)
 */
export interface ExportResponse {
  /** Đường dẫn tải file trực tiếp (Presigned URL) */
  download_url?: string
  /** Dung lượng file tính bằng MB */
  file_size_mb?: number
  /** Tổng số lượng câu hỏi có trong file xuất */
  questions_count?: number
  /** Thời điểm liên kết tải hết hạn */
  expires_at?: string
}

/**
 * Thông tin chi tiết của sinh viên trong lớp học phần
 */
export interface ClassStudentResponse {
  /** ID người dùng */
  user_id?: number
  /** Mã số sinh viên (MSSV) */
  student_code?: string
  /** Họ và tên sinh viên */
  full_name?: string
  /** Email trường (@sis.hust.edu.vn) */
  email?: string
  /** Lớp sinh hoạt */
  class_name?: string
  /** Khoa/Viện đào tạo */
  school_faculty?: string
  /** Chuyên ngành */
  major?: string
  /** Ngày sinh */
  date_of_birth?: string
  /** Thời điểm ghi danh vào lớp học phần */
  enrolled_at?: string
}

/**
 * Thông tin tóm tắt của giảng viên
 */
export interface LecturerSummaryResponse {
  /** ID tài khoản giảng viên */
  id?: number
  /** Họ và tên giảng viên */
  full_name?: string
  /** Email trường (@hust.edu.vn) */
  email?: string
  /** Mã cán bộ giảng viên */
  student_lecturer_code?: string
  /** Khoa/Viện công tác */
  school_faculty?: string
}

/**
 * Thông tin lớp học phần để dự đoán Game 1
 */
export interface MyCourseClassPredictionDto {
  /** ID lớp học phần */
  course_class_id?: number
  /** Mã lớp học phần */
  class_code?: string
  /** Tên học kỳ */
  semester?: string
  /** ID môn học */
  subject_id?: number
  /** Tên môn học */
  subject_name?: string
  /** Họ tên giảng viên phụ trách */
  lecturer_name?: string
  /** Người dùng đã đặt cược cho ngày mai ở lớp này chưa */
  already_predicted?: boolean
  /** Số lượng sinh viên đã dự đoán (nếu đã đặt) */
  predicted_count?: number
}

/**
 * Thông tin phiên minigame Game 6 đang mở (Thứ 7 hàng tuần)
 */
export interface Game6ActiveSessionResponse {
  /** ID phiên minigame */
  session_id?: number
  /** Số thứ tự tuần trong năm */
  week_number?: number
  /** Năm diễn ra minigame */
  year?: number
  /** Thời điểm bắt đầu phiên */
  start_time?: string
  /** Thời điểm kết thúc phiên */
  end_time?: string
  /** Danh sách câu hỏi thử thách (gồm cả do AI và con người tạo) */
  questions?: Game6QuestionDto[]
}

/**
 * Câu hỏi trong thử thách Game 6
 */
export interface Game6QuestionDto {
  /** ID câu hỏi */
  question_id?: number
  /** Nội dung câu hỏi (hỗ trợ LaTeX/Markdown) */
  content?: string
  /** Danh sách các lựa chọn đáp án */
  options?: QuestionOption[]
  /** Lời giải chi tiết câu hỏi */
  explanation?: string
  /** Danh sách URL ảnh đính kèm (nếu có) */
  image_urls?: string[]
}

/**
 * Phản hồi danh sách các lượt dự đoán minigame của người dùng
 */
export interface MyPredictionsResponse {
  /** Danh sách các lượt dự đoán */
  contents?: GamePredictionResponse[]
  pagination?: CursorPaginationDto
}

/**
 * Mục xếp hạng trên Bảng vinh danh
 */
export interface LeaderboardEntryDto {
  /** Thứ hạng (bắt đầu từ 1) */
  rank?: number
  /** ID người dùng */
  user_id?: number
  /** Mã người dùng / Mã sinh viên */
  user_code?: string
  /** Họ và tên người dùng */
  full_name?: string
  /** URL ảnh đại diện */
  avatar_url?: string
  /** URL khung viền đại diện */
  frame_url?: string
  /** Tổng điểm tích lũy */
  total_points?: number
  /** Có phải chính người dùng đang truy cập hay không */
  is_current_user?: boolean
}

/**
 * Phản hồi Bảng xếp hạng vinh danh sinh viên
 */
export interface LeaderboardResponse {
  /** Danh sách người dùng trên bảng xếp hạng */
  entries?: LeaderboardEntryDto[]
  my_rank?: MyRankDto
  pagination?: CursorPaginationDto
}

/**
 * Thứ hạng cá nhân của người dùng hiện tại
 */
export interface MyRankDto {
  /** Thứ hạng hiện tại (1-based, trả về 0 nếu chưa có điểm) */
  rank?: number
  /** Tổng điểm tích lũy */
  total_points?: number
  /** Xếp hạng phần trăm toàn trường (ví dụ 2.5 nghĩa là Top 2.5%) */
  top_percent?: number
  /** Tổng số người tham gia xếp hạng */
  total_participants?: number
  /** Họ và tên người dùng */
  full_name?: string
  /** URL ảnh đại diện */
  avatar_url?: string
  /** URL khung viền đại diện */
  frame_url?: string
}

/**
 * Trạng thái điểm danh chuyên cần của người dùng hôm nay
 */
export interface CheckInStatusResponse {
  /** Số ngày điểm danh liên tiếp hiện tại (Streak) */
  current_streak?: number
  /** Đã điểm danh hôm nay chưa */
  has_checked_in_today?: boolean
  /** Ngày điểm danh gần nhất */
  last_check_in_date?: string
  /** Ngày hôm nay theo múi giờ của người dùng */
  today?: string
}

export interface FriendDto {
  user_id?: number
  full_name?: string
  avatar_url?: string
  frame_url?: string
  friends_since?: string
  mutual_friends_count?: number
}

export interface FriendListResponseDto {
  items?: FriendDto[]
  pagination?: CursorPaginationDto
  total_friends?: number
}

export interface FriendRequestSentDto {
  receiver?: AuthorDto
  status?: FriendRequestStatus
  created_at?: string
  mutual_friends_count?: number
}

export interface FriendRequestSentListResponseDto {
  items?: FriendRequestSentDto[]
  pagination?: CursorPaginationDto
  total_sent?: number
}

export interface FriendRequestReceivedDto {
  requester?: AuthorDto
  status?: FriendRequestStatus
  created_at?: string
  mutual_friends_count?: number
}

export interface FriendRequestReceivedListResponseDto {
  items?: FriendRequestReceivedDto[]
  pagination?: CursorPaginationDto
  total_pending?: number
}

export interface FollowingListResponseDto {
  items?: FollowingUserDto[]
  pagination?: CursorPaginationDto
  total_following?: number
}

export interface FollowingUserDto {
  user_id?: number
  full_name?: string
  avatar_url?: string
  frame_url?: string
  role?: UserRole
  school_faculty?: string
  code?: string
  followed_at?: string
  friend?: boolean
  following_me?: boolean
}

export interface FollowerListResponseDto {
  items?: FollowerUserDto[]
  pagination?: CursorPaginationDto
  total_followers?: number
}

export interface FollowerUserDto {
  user_id?: number
  full_name?: string
  avatar_url?: string
  frame_url?: string
  role?: UserRole
  school_faculty?: string
  code?: string
  followed_me_at?: string
  following_back?: boolean
  friend?: boolean
}

/**
 * Thông tin tóm tắt đề thi
 */
export interface ExamItem {
  /** ID đề thi */
  exam_id?: number
  /** Tiêu đề đề thi */
  title?: string
  /** Tên môn học */
  subject_name?: string
  /** Tổng số câu hỏi trong đề */
  question_count?: number
  /** Thời gian tạo đề thi */
  created_at?: string
  statistic?: Statistic
  /** URL tải file PDF đề thi (nếu có) */
  download_url?: string
}

/**
 * Phản hồi danh sách đề thi của giảng viên
 */
export interface ExamListResponse {
  /** Danh sách đề thi */
  items?: ExamItem[]
  pagination?: CursorPaginationDto
}

/**
 * Danh sách các thiết bị người dùng đang đăng nhập
 */
export interface DeviceListResponse {
  /** Danh sách các thiết bị */
  devices?: DeviceResponse[]
}

/**
 * Thông tin thiết bị đã đăng nhập của người dùng
 */
export interface DeviceResponse {
  /** ID thiết bị trong CSDL */
  user_device_id?: number
  /** Mã định danh duy nhất của thiết bị */
  device_id?: string
  /** Tên thiết bị hiển thị */
  device_name?: string
  /** Nền tảng thiết bị */
  platform?: 'IOS' | 'ANDROID' | 'DESKTOP' | 'WEB'
  /** Phiên bản hệ điều hành */
  os_version?: string
  /** Phiên bản ứng dụng Client */
  app_version?: string
  /** Thời điểm hoạt động gần nhất */
  last_active_at?: string
  /** Trạng thái thiết bị đang hoạt động */
  is_active?: boolean
  /** Có phải thiết bị hiện tại đang gửi request không */
  is_current_device?: boolean
}

/**
 * Kết quả truy vấn danh sách cửa hàng vật phẩm trang trí
 */
export interface CosmeticShopResponseDto {
  /** Số dư SQB Coins hiện tại của người dùng */
  user_points?: number
  /** Danh sách các vật phẩm đang được mở bán trong cửa hàng */
  items?: ShopItemDto[]
  pagination?: CursorPaginationDto
}

/**
 * Thống kê tổng quan kho vật phẩm trang trí của người dùng
 */
export interface CosmeticSummaryDto {
  /** Tổng số vật phẩm đã mở khóa */
  total_unlocked?: number
  /** Số lượng vật phẩm đã mở khóa phân theo độ hiếm */
  by_rarity?: Record<string, unknown>
  /** Tỷ lệ % hoàn thành bộ sưu tập vật phẩm */
  collection_completion_percent?: number
}

/**
 * Thông tin vật phẩm đang được trang bị
 */
export interface EquippedItemDto {
  /** ID vật phẩm */
  cosmetic_id?: number
  /** Tên vật phẩm */
  name?: string
  /** URL hình ảnh/tài nguyên vật phẩm */
  asset_url?: string
}

/**
 * Thông tin chi tiết một vật phẩm trong túi đồ của người dùng
 */
export interface InventoryItemDto {
  /** ID vật phẩm */
  cosmetic_id?: number
  /** Tên vật phẩm */
  name?: string
  /** Mô tả vật phẩm */
  description?: string
  /** Loại vật phẩm trang trí */
  type?: 'AVATAR_FRAME' | 'CHAT_BUBBLE'
  /** Độ hiếm của vật phẩm */
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  /** URL hình ảnh/tài nguyên hiển thị */
  asset_url?: string
  /** Thời điểm sở hữu vật phẩm */
  unlocked_at?: string
  /** Phương thức đạt được vật phẩm */
  acquire_method?: 'ACHIEVEMENT' | 'SHOP_PURCHASE' | 'EVENT' | 'SYSTEM_GIFT'
  /** Thời hạn sở hữu hoặc thời hạn sự kiện (null nếu vĩnh viễn) */
  available_until?: string
}

/**
 * Kết quả truy vấn túi đồ và bộ sưu tập vật phẩm của người dùng
 */
export interface MyInventoryResponseDto {
  summary?: CosmeticSummaryDto
  /** Danh sách các vật phẩm hiện đang được trang bị theo vị trí (slot) */
  currently_equipped?: Record<string, unknown>
  /** Danh sách vật phẩm trong túi đồ */
  inventory?: InventoryItemDto[]
  pagination?: CursorPaginationDto
}

export interface ConversationDto {
  conversation_id?: number
  type?: 'DIRECT' | 'GROUP'
  display_name?: string
  display_avatar_url?: string
  member_count?: number
  last_message?: LastMessageDto
  unread_count?: number
  hidden_at?: string
  updated_at?: string
  muted?: boolean
}

export interface ConversationListResponseDto {
  items?: ConversationDto[]
  pagination?: CursorPaginationDto
  total_conversations?: number
}

export interface LastMessageDto {
  message_id?: number
  content?: string
  message_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'GIF'
  created_at?: string
}

export interface MessageDto {
  message_id?: number
  sender_id?: number
  sender_name?: string
  avatar_url?: string
  frame_url?: string
  content?: string
  message_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'GIF'
  media_urls?: string[]
  reply_to_message?: ReplyMessagePreviewDto
  created_at?: string
  revoked?: boolean
  edited?: boolean
}

export interface MessageListResponseDto {
  conversation_id?: number
  conversation_type?: 'DIRECT' | 'GROUP'
  messages?: MessageDto[]
  pagination?: CursorPaginationDto
}

export interface ReplyMessagePreviewDto {
  message_id?: number
  sender_id?: number
  sender_name?: string
  content_preview?: string
}

export interface CursorResponseCommentResponseDto {
  items?: CommentResponseDto[]
  pagination?: CursorPaginationDto
}

export interface BlockedListResponseDto {
  items?: BlockedUserDto[]
  pagination?: CursorPaginationDto
  total_blocked?: number
}

export interface BlockedUserDto {
  user_id?: number
  full_name?: string
  avatar_url?: string
  frame_url?: string
  blocked_at?: string
}

/**
 * Thông tin huy hiệu mà người dùng đã sở hữu
 */
export interface UserBadgeResponseDto {
  /** ID huy hiệu */
  badge_id?: number
  /** Tên huy hiệu */
  name?: string
  /** Mô tả huy hiệu */
  description?: string
  /** Cấp bậc huy hiệu */
  badge_tier?: BadgeTier
  /** URL hình ảnh huy hiệu */
  icon_url?: string
  /** Thời điểm người dùng đạt được huy hiệu */
  earned_at?: string
}

/**
 * Tóm tắt thông tin phiên hội thoại AI của người dùng
 */
export interface AiChatSessionSummaryResponse {
  /** ID bản ghi phiên chat trong CSDL */
  chat_session_id?: number
  /** Mã định danh phiên chat (UUID/String) */
  session_id?: string
  /** Tiêu đề tóm tắt cuộc trò chuyện do hệ thống tạo */
  title?: string
  /** Thời gian bắt đầu phiên */
  created_at?: string
  /** Thời gian tương tác gần nhất */
  last_active_at?: string
}

export interface CursorResponseAiChatSessionSummaryResponse {
  items?: AiChatSessionSummaryResponse[]
  pagination?: CursorPaginationDto
}

/**
 * Tin nhắn trong lịch sử trò chuyện AI
 */
export interface AiChatHistoryResponse {
  /** ID tin nhắn */
  message_id?: number
  /** ID phiên trò chuyện */
  session_id?: string
  /** Vai trò (user hoặc assistant) */
  role?: string
  /** Nội dung tin nhắn */
  content?: string
  /** Thời điểm gửi tin nhắn */
  created_at?: string
}

export interface CursorResponseAiChatHistoryResponse {
  items?: AiChatHistoryResponse[]
  pagination?: CursorPaginationDto
}

export interface ActivityFeedItemDto {
  feed_id?: number
  target_type?: 'POST' | 'QUESTION' | 'SESSION' | 'BADGE' | 'COSMETIC' | 'USER' | 'SUBJECT'
  target_id?: number
  action_type?:
    | 'CREATED_POST'
    | 'PUBLISHED_LECTURE_VIDEO'
    | 'SESSION_RESOLVED_APPROVED'
    | 'EARNED_BADGE'
    | 'REACHED_MILESTONE'
  actor?: AuthorDto
  content?: Record<string, unknown>
  created_at?: string
  weight?: number
}

export interface CursorResponseActivityFeedItemDto {
  items?: ActivityFeedItemDto[]
  pagination?: CursorPaginationDto
}

export interface NewFeedCountResponseDto {
  new_count?: number
}

/**
 * Kết quả sau khi xóa từ khóa khỏi lịch sử tìm kiếm cá nhân
 */
export interface DeleteSavedSearchResponseDto {
  /** ID từ khóa tìm kiếm đã bị xóa */
  saved_search_id?: number
}

export interface DeletePostResponseDto {
  post_id?: number
}

/**
 * Yêu cầu xóa hoặc thu hồi tin nhắn
 */
export interface DeleteMessageRequestDto {
  /** Phạm vi xóa tin nhắn: ME (chỉ ẩn ở phía tôi) hoặc EVERYONE (thu hồi với mọi người) */
  scope: MessageDeleteScope
}

export interface DeleteMessageResponseDto {
  message_id?: number
  scope?: MessageDeleteScope
  note?: string
}

export interface UnfollowResponseDto {
  target_user_id?: number
  new_followers_count?: number
  following?: boolean
}

export interface UnblockResponseDto {
  unblocked_user_id?: number
  blocked?: boolean
}
