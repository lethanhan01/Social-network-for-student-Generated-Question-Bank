/**
 * Kịch bản các cuộc hội thoại 1-1 và nhóm chat học tập (15+ tin nhắn)
 */

export const CHAT_DATA = {
  directs: [
    {
      userA: 157, // Lê Thành An
      userB: 164, // Bùi Tuấn Anh
      messages: [
        { senderId: 157, text: 'Tuấn Anh ơi, cậu đã xem qua tài liệu TanStack Query v5 cho bài tập lớn chưa? #SQB_SEED' },
        { senderId: 164, text: 'Tớ xem rồi An! Bản v5 dùng object syntax cho useQuery với cơ chế gcTime thay cho cacheTime rất trực quan. #SQB_SEED' },
        { senderId: 157, text: 'Tuyệt vời, tí nữa họp nhóm mình phân công cậu triển khai phần auth store và Axios interceptor nhé. #SQB_SEED' },
        { senderId: 164, text: 'OK An, tớ đã chuẩn bị sẵn cơ chế Mutex silent refresh rồi, yên tâm nhé! 👍 #SQB_SEED' }
      ]
    },
    {
      userA: 157, // Lê Thành An
      userB: 139, // Nguyễn Sỹ Lộc
      messages: [
        { senderId: 157, text: 'Lộc ơi, chiều nay cậu có lên thư viện Tạ Quang Bửu học nhóm không? #SQB_SEED' },
        { senderId: 139, text: 'Có An nhé, tớ đang ở tầng 4 phòng tự học, có đem theo cả giáo trình Web IT4409. #SQB_SEED' },
        { senderId: 157, text: 'Tầm 2h tớ qua nhé, cùng thảo luận mấy câu trắc nghiệm về CSS Grid và Flexbox nha! #SQB_SEED' },
        { senderId: 139, text: 'Nhất trí luôn An! #SQB_SEED' }
      ]
    }
  ],
  group: {
    creatorId: 157, // Lê Thành An (CHIEF)
    name: 'Nhóm Học Tập BTL Web IT4409 - Nhóm 4 #SQB_SEED',
    memberIds: [164, 139, 163], // Tuấn Anh, Sỹ Lộc, Tiếp
    messages: [
      { senderId: 157, text: 'Chào mừng các bạn đến với nhóm học tập BTL Công nghệ Web IT4409 - Nhóm 4! 🎉 #SQB_SEED' },
      { senderId: 164, text: 'Chào cả nhóm! Rất vui được đồng hành cùng mọi người trong học kỳ này. #SQB_SEED' },
      { senderId: 139, text: 'Chào An, Tuấn Anh và Tiếp! Nhóm mình chốt đề tài Mạng xã hội học tập & Ngân hàng đề thi đúng không? #SQB_SEED' },
      { senderId: 157, text: 'Đúng rồi Lộc, tớ đã tạo sẵn repository trên GitHub và cấu hình Vite + React 19 + Tailwind v4. #SQB_SEED' },
      { senderId: 163, text: 'Chào mọi người! Tiếp đây, tớ sẽ phụ trách phần kiểm thử giao diện và viết tài liệu báo cáo nhé. #SQB_SEED' },
      { senderId: 164, text: 'Tớ sẽ đảm nhận phần tích hợp API backend, WebSocket STOMP và xác thực JWT. #SQB_SEED' },
      { senderId: 139, text: 'Còn tớ sẽ làm giao diện các trang Ngân hàng câu hỏi và Luyện tập trắc nghiệm nha. #SQB_SEED' },
      { senderId: 157, text: 'Phân công quá hợp lý luôn! Tối thứ 5 hàng tuần lúc 20h nhóm mình sẽ họp online để review tiến độ nhé. #SQB_SEED' },
      { senderId: 163, text: 'Đã nhận lịch hẹn thứ 5, chúc nhóm mình đạt điểm A+ môn này! 🚀 #SQB_SEED' },
      { senderId: 164, text: 'Cố lên cả nhóm! 💪 #SQB_SEED' }
    ]
  }
};

