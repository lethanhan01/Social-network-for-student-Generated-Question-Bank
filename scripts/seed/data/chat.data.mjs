/**
 * Kịch bản các cuộc hội thoại 1-1 và 3 nhóm chat đa vai trò (Student, Teacher, Lớp học phần)
 */

export const CHAT_DATA = {
  directs: [
    // 1. Student <-> Student: An (157) <-> Tuấn Anh (164)
    {
      userA: 157,
      userB: 164,
      messages: [
        { senderId: 157, text: 'Tuấn Anh ơi, cậu đã xem qua tài liệu TanStack Query v5 cho bài tập lớn chưa? #SQB_SEED' },
        { senderId: 164, text: 'Tớ xem rồi An! Bản v5 dùng object syntax cho useQuery với cơ chế gcTime thay cho cacheTime rất trực quan. #SQB_SEED' },
        { senderId: 157, text: 'Tuyệt vời, tí nữa họp nhóm mình phân công cậu triển khai phần auth store và Axios interceptor nhé. #SQB_SEED' },
        { senderId: 164, text: 'OK An, tớ đã chuẩn bị sẵn cơ chế Mutex silent refresh rồi, yên tâm nhé! 👍 #SQB_SEED' }
      ]
    },
    // 2. Student <-> Student: An (157) <-> Sỹ Lộc (139)
    {
      userA: 157,
      userB: 139,
      messages: [
        { senderId: 157, text: 'Lộc ơi, chiều nay cậu có lên thư viện Tạ Quang Bửu học nhóm không? #SQB_SEED' },
        { senderId: 139, text: 'Có An nhé, tớ đang ở tầng 4 phòng tự học, có đem theo cả giáo trình Web IT4409. #SQB_SEED' },
        { senderId: 157, text: 'Tầm 2h tớ qua nhé, cùng thảo luận mấy câu trắc nghiệm về CSS Grid và Flexbox nha! #SQB_SEED' },
        { senderId: 139, text: 'Nhất trí luôn An! #SQB_SEED' }
      ]
    },
    // 3. Teacher 01 (252) <-> Student 01 (157 - Lê Thành An)
    {
      userA: 252,
      userB: 157,
      messages: [
        { senderId: 157, text: 'Em chào thầy Hải ạ! Em là Lê Thành An lớp IT4409 (171150). Em vừa nộp bộ câu hỏi ôn tập Chương 1 lên hệ thống, nhờ thầy xem và góp ý giúp em ạ! #SQB_SEED' },
        { senderId: 252, text: 'Chào An, thầy vừa thẩm định và phê duyệt cả 5 câu hỏi của em vào Ngân hàng đề thi chính thức rồi nhé. Lời giải phần HTTP/2 Multiplexing rất rõ ràng! #SQB_SEED' },
        { senderId: 157, text: 'Dạ em cảm ơn thầy nhiều ạ! Nhóm em đang tiếp tục biên soạn thêm bộ câu hỏi phần WebSocket STOMP và Redis Caching ạ. #SQB_SEED' },
        { senderId: 252, text: 'Tốt lắm! Em nhắc các bạn trong nhóm vào mục Luyện tập giải thử và đánh giá chéo để củng cố kiến thức chuẩn bị thi giữa kỳ nhé. #SQB_SEED' }
      ]
    },
    // 4. Teacher 02 (253) <-> Student 04 (163 - Nguyễn Mạnh Tiếp)
    {
      userA: 253,
      userB: 163,
      messages: [
        { senderId: 163, text: 'Em chào thầy Đồng ạ! Thưa thầy, trong bài tập lớn môn Đa nền tảng IT4788, nhóm em dùng MMKV kết hợp SQLite cho chế độ Offline-first có phù hợp không ạ? #SQB_SEED' },
        { senderId: 253, text: 'Chào Tiếp, hướng tiếp cận đó rất chuẩn! Các em dùng MMKV cho cấu hình nhẹ cần đọc đồng bộ nhanh, còn dữ liệu có cấu trúc và Outbox Queue thì lưu trong SQLite nhé. #SQB_SEED' },
        { senderId: 163, text: 'Dạ vâng ạ, em đã hiểu rõ cách phân tách lưu trữ rồi. Em cảm ơn thầy đã hướng dẫn chi tiết ạ! #SQB_SEED' }
      ]
    },
    // 5. Teacher 01 (252) <-> Teacher 02 (253)
    {
      userA: 252,
      userB: 253,
      messages: [
        { senderId: 252, text: 'Chào PGS. Đồng, tôi vừa duyệt xong các phiên câu hỏi của lớp 171150 và 171149, chất lượng câu hỏi sinh viên đóng góp kỳ này rất tốt. #SQB_SEED' },
        { senderId: 253, text: 'Chào TS. Hải, bên lớp 171151 và 171152 của tôi cũng đã chốt duyệt 100% phiên và tạo sẵn bộ đề thi mẫu cho cả 2 học phần rồi! #SQB_SEED' }
      ]
    }
  ],

  groups: [
    // Nhóm 1: Nhóm học tập Sinh viên
    {
      creatorId: 157, // Lê Thành An (CHIEF)
      name: 'Nhóm Học Tập BTL Web IT4409 - Nhóm 4 #SQB_SEED',
      memberIds: [164, 139, 163],
      messages: [
        { senderId: 157, text: 'Chào mừng các bạn đến với nhóm học tập BTL Công nghệ Web IT4409 - Nhóm 4! 🎉 #SQB_SEED' },
        { senderId: 164, text: 'Chào cả nhóm! Rất vui được đồng hành cùng mọi người trong học kỳ này. #SQB_SEED' },
        { senderId: 139, text: 'Chào An, Tuấn Anh và Tiếp! Nhóm mình chốt đề tài Mạng xã hội học tập & Ngân hàng đề thi đúng không? #SQB_SEED' },
        { senderId: 157, text: 'Đúng rồi Lộc, tớ đã tạo sẵn repository trên GitHub và cấu hình Vite + React 19 + Tailwind v4. #SQB_SEED' },
        { senderId: 163, text: 'Chào mọi người! Tiếp đây, tớ sẽ phụ trách phần kiểm thử giao diện và viết tài liệu báo cáo nhé. #SQB_SEED' },
        { senderId: 164, text: 'Tớ sẽ đảm nhận phần tích hợp API backend, WebSocket STOMP và xác thực JWT. #SQB_SEED' },
        { senderId: 139, text: 'Còn tớ sẽ làm giao diện các trang Ngân hàng câu hỏi và Luyện tập trắc nghiệm nha. #SQB_SEED' },
        { senderId: 157, text: 'Phân công quá hợp lý luôn! Tối thứ 5 hàng tuần lúc 20h nhóm mình sẽ họp online để review tiến độ nhé. #SQB_SEED' }
      ]
    },
    // Nhóm 2: Hội đồng Giảng viên (5 Teacher)
    {
      creatorId: 252, // TS. Trần Hoàng Hải (CHIEF)
      name: 'Hội Đồng Giảng Viên Học Phần IT4409 & IT4788 - SoICT #SQB_SEED',
      memberIds: [253, 254, 255, 256],
      messages: [
        { senderId: 252, text: 'Chào các thầy cô trong tổ bộ môn! Tôi lập nhóm này để chúng ta điều phối công tác thẩm định ngân hàng câu hỏi và ra đề thi học kỳ 20261. #SQB_SEED' },
        { senderId: 253, text: 'Chào thầy Hải và các thầy cô, toàn bộ các phiên đóng góp câu hỏi của sinh viên ở 4 lớp học phần đều đã được duyệt hoàn tất (RESOLVED). #SQB_SEED' },
        { senderId: 254, text: 'Hệ thống kiểm định AI Btprop ghi nhận độ tin cậy của bộ 30 câu hỏi mới rất cao, lời giải rõ ràng và không có hiện tượng trùng lặp. #SQB_SEED' },
        { senderId: 255, text: 'Phòng Lab Trung tâm Máy tính cũng đã sẵn sàng môi trường mạng và Docker cho buổi chấm demo đồ án tuần tới. #SQB_SEED' },
        { senderId: 256, text: 'Tuyệt vời! Vậy chúng ta thống nhất sử dụng bộ 4 đề thi đã sinh trên hệ thống làm đề kiểm tra chuẩn hóa của kỳ này nhé. #SQB_SEED' }
      ]
    },
    // Nhóm 3: Lớp học phần IT4409 (Teacher 01 + Sinh viên - Tự động accept lời mời nhóm)
    {
      creatorId: 252, // TS. Trần Hoàng Hải (CHIEF)
      name: 'Lớp Học Phần IT4409 (171150) - Hỏi Đáp & Ôn Tập #SQB_SEED',
      memberIds: [157, 164, 139, 163, 158],
      messages: [
        { senderId: 252, text: 'Chào các em sinh viên lớp Công nghệ Web 171150! Thầy tạo nhóm chung của lớp để giải đáp thắc mắc và thông báo lịch ôn tập giữa kỳ. #SQB_SEED' },
        { senderId: 157, text: 'Em chào thầy Hải và các bạn ạ! Chúng em đã nhận được thông báo các bộ câu hỏi ôn tập Chương 1-5 được duyệt trên hệ thống rồi ạ. #SQB_SEED' },
        { senderId: 164, text: 'Thưa thầy, cấu trúc đề thi giữa kỳ tuần tới sẽ gồm cả phần giao thức HTTP, RESTful Security và React đúng không ạ? #SQB_SEED' },
        { senderId: 252, text: 'Đúng rồi Tuấn Anh! Các em ôn kỹ các phiên câu hỏi đã được đánh dấu RESOLVED trong mục Luyện tập là nắm chắc kiến thức trọng tâm nhé. #SQB_SEED' },
        { senderId: 139, text: 'Dạ vâng ạ, chúng em cảm ơn thầy nhiều ạ! Cả lớp cùng cố gắng ôn tập tốt nhé! 💪 #SQB_SEED' }
      ]
    }
  ]
};
