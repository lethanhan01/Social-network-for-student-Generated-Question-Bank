/**
 * Danh sách 13 bài viết xã hội (8 bài Student + 5 bài Teacher),
 * luồng bình luận phân cấp cha-con, cảm xúc và ghi chú chuyên môn của Giảng viên (Lecturer Notes).
 */

export const POSTS_DATA = [
  // =========================================================================
  // 8 BÀI VIẾT CỦA 5 SINH VIÊN (Có thêm tương tác từ các Giảng viên)
  // =========================================================================
  {
    key: 'p1',
    authorId: 157, // Lê Thành An
    content: `🔥 **So sánh Kiến trúc: Virtual DOM vs Signal trong Frontend hiện đại (React 19 vs SolidJS)**

Trong học phần **IT4409 (Công nghệ Web và dịch vụ trực tuyến)**, một trong những chủ đề thú vị nhất là cơ chế Reconciliation. 

- **Virtual DOM (React)**: Giữ bản sao DOM trong bộ nhớ, tính toán cây khác biệt (Diffing) theo thuật toán $O(n)$ heuristic và gộp các thay đổi theo lô (batching).
- **Signal (Solid/Preact)**: Cập nhật hạt mịn (Fine-grained reactivity) thẳng vào Real DOM node mà không cần diffing cây ảo.

Mọi người nghĩ kiến trúc nào sẽ chiếm ưu thế trong các ứng dụng Enterprise sắp tới? Cùng thảo luận nhé! 💡

\`\`\`tsx
// Demo React 19 Action Hook
const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
  return await updateProfile(formData);
}, null);
\`\`\`

#SQB_SEED #IT4409 #WebArchitecture #HUST`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 164, // Bùi Tuấn Anh
        content: 'Bài viết rất chất lượng! Signal hiệu quả cho các widget nhỏ, nhưng với hệ sinh thái lớn của React thì React Compiler và Server Components vẫn đang là chuẩn mực thống trị.',
        replies: [
          {
            authorId: 157, // Lê Thành An (reply con)
            content: 'Chuẩn luôn Tuấn Anh, React Compiler tự động memoize code nên dev không cần lo lắng về useMemo/useCallback nữa!'
          }
        ]
      },
      {
        authorId: 252, // TS. Trần Hoàng Hải (Teacher 01)
        content: 'Chủ đề thảo luận rất đáng khen ngợi! Các em lưu ý phân tích thêm chi phí bộ nhớ của Subscriptions trong mô hình Fine-grained Reactivity khi quy mô DOM lớn nhé.'
      },
      {
        authorId: 139, // Nguyễn Sỹ Lộc
        content: 'Thầy Hải trên lớp cũng vừa nhắc tuần này về Core Web Vitals và INP. Diffing nhanh nhưng main thread bị block thì điểm INP vẫn thấp.'
      }
    ],
    reactions: [
      { userId: 164, type: 'LOVE' },
      { userId: 139, type: 'LIKE' },
      { userId: 163, type: 'WOW' },
      { userId: 158, type: 'LIKE' },
      { userId: 252, type: 'LOVE' },
      { userId: 253, type: 'LIKE' }
    ]
  },
  {
    key: 'p2',
    authorId: 164, // Bùi Tuấn Anh
    content: `🛡️ **Kinh nghiệm thiết kế RESTful API chuẩn OpenAPI 3.1 & Idempotent Methods**

Khi thiết kế backend Spring Boot kết hợp Frontend React, nhiều bạn hay nhầm lẫn giữa \`PUT\` và \`PATCH\`:
1. **PUT**: Thay thế hoàn toàn tài nguyên (Full Replacement), mang tính chất **Idempotent** (gọi 1 lần hay 100 lần cùng payload thì kết quả máy chủ vẫn đồng nhất).
2. **PATCH**: Cập nhật từng phần (Partial Update), có thể không idempotent nếu chứa các phép toán tương đối.

Đặc biệt, lưu ý xử lý hàng đợi **Mutex Silent Token Refresh** khi gặp lỗi \`HTTP 401\`: Chỉ cho phép đúng 1 request được gửi lên \`/auth/refresh\`, các request đến sau phải chờ và replay đồng loạt!

#SQB_SEED #RESTful #Security #SpringClient #OpenAPI`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 157, // Lê Thành An
        content: 'Mutex refresh trong Axios Interceptors là bài học kinh điển khi làm app SPA đa luồng. Cảm ơn Tuấn Anh chia sẻ!'
      },
      {
        authorId: 256, // TS. Đỗ Quốc Huy (Teacher 05)
        content: 'Tổng hợp rất chuẩn xác! Khi bảo vệ đồ án cuối kỳ, các nhóm áp dụng đúng Mutex Refresh và Idempotency Key sẽ được cộng điểm kiến trúc bảo mật.'
      }
    ],
    reactions: [
      { userId: 157, type: 'LOVE' },
      { userId: 139, type: 'LIKE' },
      { userId: 158, type: 'WOW' },
      { userId: 256, type: 'LOVE' }
    ]
  },
  {
    key: 'p3',
    authorId: 139, // Nguyễn Sỹ Lộc
    content: `👥 **[Tìm đồng đội] Nhóm Bài tập lớn Công nghệ Web IT4409 - Học kỳ 20261**

Chào các bạn, nhóm mình hiện có 2 thành viên đang triển khai đề tài: *"Nền tảng chia sẻ câu hỏi trắc nghiệm & mạng xã hội học tập HUST"*.

Nhóm cần tìm thêm 1 bạn cùng lớp học phần \`171150\` / \`171151\` có thế mạnh:
- Nắm vững CSS Tailwind / Responsive Design
- Có tinh thần trách nhiệm, sẵn sàng code sprint cuối kỳ
- Biết sử dụng Git/GitHub căn bản

Bạn nào quan tâm inbox trực tiếp cho mình nhé! 🚀

#SQB_SEED #BTL #IT4409 #TeamworkHUST`,
    visibility: 'FRIENDS',
    subjectId: 2,
    comments: [
      {
        authorId: 164, // Bùi Tuấn Anh
        content: 'Đề tài hay đó Lộc! Nhóm có cần tham khảo mockup UI thư viện đề thi không, mình share cho.'
      },
      {
        authorId: 157, // Lê Thành An
        content: 'Nhóm 4 bên mình cũng đang chốt đề tài, hôm nào ngồi thư viện Tạ Quang Bửu giao lưu nhé!'
      }
    ],
    reactions: [
      { userId: 157, type: 'LIKE' },
      { userId: 164, type: 'LOVE' }
    ]
  },
  {
    key: 'p4',
    authorId: 163, // Nguyễn Mạnh Tiếp
    content: `❓ **Hỏi đáp: Tại sao trình duyệt lại gửi Preflight Request OPTIONS khi gọi API?**

Mình gặp trường hợp khi thêm header tự định nghĩa \`X-Device-Id\` vào Axios config thì trình duyệt tự động gửi thêm 1 request phương thức \`OPTIONS\` trước request chính thức \`POST\`.

Nếu máy chủ không cấu hình đúng \`WebMvcConfigurer\` thì sẽ dính ngay lỗi:
\`Access-Control-Allow-Headers: X-Device-Id is not allowed\`.

Bạn nào có kinh nghiệm cấu hình CORS chuẩn cho cả WebSocket SockJS và RESTful API xin chỉ giáo thêm với ạ!

#SQB_SEED #CORS #WebSecurity #Troubleshooting`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 164, // Bùi Tuấn Anh
        content: 'Bởi vì request có chứa Custom Header không nằm trong danh sách "CORS-safelisted request-headers" (như Accept, Content-Type chuẩn), nên trình duyệt bắt buộc Preflight để bảo vệ server khỏi request không mong muốn!',
        replies: [
          {
            authorId: 163, // Tiếp reply lại
            content: 'Cảm ơn Tuấn Anh giải thích rất rõ ràng, mình đã bổ sung exposedHeaders và allowedHeaders trên Spring Security rồi, chạy mượt mà!'
          }
        ]
      },
      {
        authorId: 255, // ThS. Lê Minh Tuấn (Teacher 04)
        content: 'Em nhớ thiết lập thêm Access-Control-Max-Age (ví dụ 3600 giây) trên Nginx/Spring để trình duyệt cache lại kết quả Preflight, giảm tải số lượng request OPTIONS nhé!'
      }
    ],
    reactions: [
      { userId: 164, type: 'LOVE' },
      { userId: 157, type: 'LIKE' },
      { userId: 255, type: 'LIKE' }
    ]
  },
  {
    key: 'p5',
    authorId: 158, // Nguyễn Trung Kiên
    content: `🛠️ **Top 5 VS Code Extensions không thể thiếu cho sinh viên CNTT HUST 2026**

Sau 3 năm học tập tại Bách khoa, đây là những tiện ích đã cứu cánh mình trong hàng chục đồ án:

1. **Error Lens**: Hiển thị lỗi biên dịch ngay trên dòng code, không cần rê chuột.
2. **GitLens**: Xem git blame, lịch sử commit của đồng đội theo từng ký tự.
3. **Tailwind CSS IntelliSense**: Tự động gợi ý class và xem trước màu sắc CSS.
4. **Pretty TypeScript Errors**: Dịch thông báo lỗi phức tạp của TS thành định dạng dễ đọc.
5. **REST Client**: Thử nghiệm API trực tiếp trong editor với file \`.http\`.

Mọi người có extension nào tâm đắc nữa không?

#SQB_SEED #DevTools #Productivity #VSCode`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 139, // Nguyễn Sỹ Lộc
        content: 'Bổ sung thêm extension Thunder Client hoặc Postman tab nữa nhé Kiên, test WebSocket rất tiện.'
      },
      {
        authorId: 157, // Lê Thành An
        content: 'Error Lens đúng là chân ái, đỡ mất công mở tab Problems liên tục.'
      }
    ],
    reactions: [
      { userId: 157, type: 'LIKE' },
      { userId: 164, type: 'LOVE' },
      { userId: 139, type: 'LIKE' }
    ]
  },
  {
    key: 'p6',
    authorId: 157, // Lê Thành An
    content: `📚 **Tổng hợp Tài liệu ôn tập Chương 1-5 Môn Công nghệ Web (IT4409) & Đa nền tảng (IT4788)**

Gửi các bạn sinh viên lớp \`171150\` và \`171151\` bộ tài liệu tóm tắt kiến thức trọng tâm chuẩn bị cho đợt thi trắc nghiệm giữa kỳ:

- **IT4409**: Giao thức HTTP 1.1/2/3, RESTful constraints, Bảo mật JWT/XSS/CSRF, Layout CSS Grid & Flexbox, Core Web Vitals (LCP, INP, CLS), WebSocket STOMP & Redis Caching.
- **IT4788**: Kiến trúc React Native JSI/Fabric/TurboModules, Flutter Widget/Element/RenderObject Tree, Lưu trữ an toàn Keychain/Keystore & Offline-first Outbox.

Chúc các bạn ôn thi đạt điểm A+! 💪

#SQB_SEED #IT4409 #IT4788 #TaiLieuOnTap #HUST`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 164, // Bùi Tuấn Anh
        content: 'Tài liệu quá đầy đủ và tâm huyết, cảm ơn An nhiều!'
      },
      {
        authorId: 163, // Nguyễn Mạnh Tiếp
        content: 'Đã tải về và luyện hết bộ 30 câu hỏi trắc nghiệm trên hệ thống, cực kỳ bám sát đề cương!'
      }
    ],
    reactions: [
      { userId: 164, type: 'LOVE' },
      { userId: 139, type: 'LOVE' },
      { userId: 163, type: 'LIKE' },
      { userId: 158, type: 'LIKE' },
      { userId: 252, type: 'LOVE' }
    ]
  },
  {
    key: 'p7',
    authorId: 164, // Bùi Tuấn Anh
    content: `🔐 **Bảo mật JWT: Lưu ở HttpOnly Cookie hay Web Storage (LocalStorage)?**

Tranh cãi muôn thuở giữa cộng đồng Web Developers:
- **LocalStorage**: Dễ dùng, nhưng dễ bị đánh cắp nếu trang dính lỗi XSS.
- **HttpOnly Cookie**: Miễn nhiễm XSS đọc trực tiếp, nhưng phải đối mặt với nguy cơ CSRF nếu không có cờ SameSite chặt chẽ.

👉 **Mô hình Hybrid đề xuất cho dự án lớn**:
- Cấp \`Access Token\` lưu trong JavaScript Memory (React State / Zustand) với thời gian sống ngắn (15 phút).
- Cấp \`Refresh Token\` lưu trong \`HttpOnly Cookie\` (SameSite=Strict, Secure). Khi reload trang, gửi request silent refresh để lấy lại access token mới!

#SQB_SEED #WebSecurity #JWT #Authentication`,
    visibility: 'FRIENDS',
    subjectId: 2,
    comments: [
      {
        authorId: 157, // Lê Thành An
        content: 'Chuẩn bài kiến trúc của hệ thống SQB HUST luôn! Memory state chống XSS đánh cắp vĩnh viễn, còn cookie silent refresh đảm bảo UX không bị bắt đăng nhập lại.'
      }
    ],
    reactions: [
      { userId: 157, type: 'LOVE' },
      { userId: 139, type: 'WOW' }
    ]
  },
  {
    key: 'p8',
    authorId: 139, // Nguyễn Sỹ Lộc
    content: `📝 **Ghi chú cá nhân: Checklist hoàn thiện BTL Công nghệ Web trước hạn nộp**

- [x] Thiết lập cấu hình dự án Vite + React 19 + Tailwind v4.
- [x] Tích hợp bộ quy chuẩn semantic HTML và kiểm soát tương phản màu sắc.
- [x] Hoàn thiện tính năng bình luận thời gian thực qua STOMP WebSocket.
- [x] Chạy kiểm thử tự động toàn diện: \`npm run audit:strict\` và \`npm test\`.

Cố lên tôi ơi! 🎯

#SQB_SEED #Checklist #PersonalLog`,
    visibility: 'ONLY_ME',
    subjectId: 2,
    comments: [],
    reactions: []
  },

  // =========================================================================
  // 5 BÀI VIẾT CỦA 5 GIẢNG VIÊN (TEACHER 01..05)
  // =========================================================================
  {
    key: 'p9',
    authorId: 252, // TS. Trần Hoàng Hải (Teacher 01)
    content: `📢 **[THÔNG BÁO HỌC THUẬT] Hướng dẫn Đóng góp Ngân hàng Câu hỏi & Tiêu chí Đánh giá Học phần IT4409 (Lớp 171150) và IT4788 (Lớp 171149)**

Chào các em sinh viên Trường CNTT&TT (SoICT - HUST),

Trong học kỳ \`20261\`, thầy đã mở đầy đủ các lớp học phần **Công nghệ Web (\`171150\`)** và **Phát triển ứng dụng đa nền tảng (\`171149\`)** trên hệ thống **SQB HUST**. Khi biên soạn và đề xuất phiên câu hỏi trắc nghiệm, các em cần lưu ý 3 tiêu chuẩn chất lượng:

1. **Tính chính xác & Nguồn tham chiếu**: Mỗi câu hỏi phải có đúng 1 đáp án đúng rõ ràng và lời giải thích (Explanation) trích dẫn từ đặc tả chuẩn (MDN, W3C, RFC, React/Flutter Docs).
2. **Chất lượng phương án gây nhiễu (Distractors)**: 3 phương án sai phải phản ánh các nhầm lẫn kỹ thuật phổ biến trong thực tế, tránh đặt phương án vô nghĩa.
3. **Khai báo trung thực nguồn gốc AI (\`LLM\`) hay Tự biên soạn (\`HOMO_SAPIENS\`)**: Phục vụ hệ thống kiểm định ảo giác Btprop và trò chơi dự đoán học thuật hàng tuần.

Toàn bộ các phiên câu hỏi chất lượng cao đã được thầy thẩm định và đưa vào Ngân hàng đề thi chính thức. Chúc các em học tập hiệu quả! 🎓

#SQB_SEED #SoICT #IT4409 #IT4788 #LecturerAnnouncement`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 157, // Lê Thành An
        content: 'Em cảm ơn thầy Hải ạ! Nhóm em đã nộp các bộ câu hỏi Chương 1-2 kèm trích dẫn RFC 9110 đầy đủ và đã được thầy phê duyệt vào ngân hàng đề rồi ạ.',
        replies: [
          {
            authorId: 252, // TS. Trần Hoàng Hải reply
            content: 'Thầy đã xem và đánh giá rất cao bộ câu hỏi HTTP/2 Multiplexing và CORS của nhóm An. Tiếp tục phát huy ở các chương tiếp theo nhé!'
          }
        ]
      },
      {
        authorId: 163, // Nguyễn Mạnh Tiếp
        content: 'Thưa thầy, phần câu hỏi React Native JSI và TurboModules của lớp 171149 em cũng vừa hoàn thành luyện tập xong, rất sát nội dung thực hành ạ!'
      },
      {
        authorId: 253, // PGS.TS. Phạm Văn Đồng (Teacher 02)
        content: 'Bộ tiêu chí rất rõ ràng thầy Hải ơi, bên lớp 171151 và 171152 của tôi cũng áp dụng chung khung đánh giá này để đồng bộ ngân hàng đề toàn khoa.'
      }
    ],
    reactions: [
      { userId: 157, type: 'LOVE' },
      { userId: 164, type: 'LOVE' },
      { userId: 139, type: 'LIKE' },
      { userId: 163, type: 'LOVE' },
      { userId: 158, type: 'LIKE' },
      { userId: 253, type: 'LOVE' },
      { userId: 254, type: 'LIKE' }
    ]
  },
  {
    key: 'p10',
    authorId: 253, // PGS.TS. Phạm Văn Đồng (Teacher 02)
    content: `📱 **[CHUYÊN ĐỀ ĐA NỀN TẢNG - IT4788] Tối ưu Hiệu năng 60/120 FPS trên Thiết bị Di động: Từ Cầu nối Bất đồng bộ đến JSI & Impeller**

Khi chấm đồ án môn **Phát triển ứng dụng đa nền tảng (IT4788 - Lớp 171152)**, lỗi phổ biến nhất khiến ứng dụng của sinh viên bị giật cục (Frame Drop) là nghẽn luồng giao tiếp và dựng danh sách chưa tối ưu:

- **Tránh truyền tải JSON khổng lồ qua mỗi khung hình**: Tận dụng **JSI (JavaScript Interface)** và **MMKV** để đọc/ghi đồng bộ các trạng thái cần tốc độ cao.
- **Chiến lược Offline-first chuẩn mực**: Kết hợp SQLite cục bộ với **Outbox Queue** có gắn \`Idempotency-Key\` để đảm bảo người dùng thao tác mượt mà ngay cả khi đi vào thang máy hoặc vùng sóng yếu.
- **Bảo mật dữ liệu nhạy cảm**: Tuyệt đối không lưu Refresh Token trong \`AsyncStorage\` thuần; bắt buộc sử dụng \`Keychain\` (iOS) và \`Keystore\` (Android).

Thầy đã khởi tạo sẵn **2 đề thi chuẩn hóa** từ Ngân hàng câu hỏi của lớp để các em đối chiếu cấu trúc ôn tập. 💡

#SQB_SEED #IT4788 #MobileArchitecture #ReactNative #Flutter #SoICT`,
    visibility: 'PUBLIC',
    subjectId: 1,
    comments: [
      {
        authorId: 158, // Nguyễn Trung Kiên
        content: 'Bài tổng hợp của thầy Đồng giúp em hiểu rõ hẳn lý do tại sao phải dùng Outbox Queue kèm Idempotency Key khi đồng bộ mạng chập chờn. Em cảm ơn thầy ạ!',
        replies: [
          {
            authorId: 253, // PGS.TS. Phạm Văn Đồng reply
            content: 'Tốt lắm Kiên! Em áp dụng ngay mô hình này vào bài tập lớn của nhóm tuần tới nhé.'
          }
        ]
      },
      {
        authorId: 252, // TS. Trần Hoàng Hải
        content: 'Chia sẻ rất thiết thực cho sinh viên cả 2 lớp 171149 và 171152. Cảm ơn PGS. Đồng!'
      }
    ],
    reactions: [
      { userId: 157, type: 'LIKE' },
      { userId: 163, type: 'LOVE' },
      { userId: 158, type: 'LOVE' },
      { userId: 252, type: 'LOVE' },
      { userId: 255, type: 'WOW' }
    ]
  },
  {
    key: 'p11',
    authorId: 254, // TS. Nguyễn Thị Thanh Huyền (Teacher 03)
    content: `🤖 **[AI TRONG GIÁO DỤC] Cơ chế Kiểm định Ảo giác Btprop (Belief Tree Propagation) cho Ngân hàng Câu hỏi Sinh viên Khởi tạo**

Một thách thức thú vị của mô hình **Crowdsourced Question Bank (SQB)** là làm sao hỗ trợ sinh viên dùng AI tinh chỉnh câu hỏi mà không đưa thông tin ảo giác (Hallucination) vào ngân hàng đề:

1. **Cây niềm tin kiểm định (Belief Tree Audit)**: Phân rã đề bài, đáp án đúng và lời giải thành các mệnh đề nguyên tử để kiểm tra tính nhất quán logic.
2. **Đánh giá chéo cộng đồng (Peer Rating 0-4 sao) & Game 6**: Kết hợp đánh giá của giảng viên, đánh giá của bạn học cùng lớp và thử thách nhận diện câu hỏi AI định kỳ.

Rất ấn tượng khi thấy tỷ lệ câu hỏi đạt chuẩn của sinh viên K68 kỳ này đạt trên 95%! 🌟

#SQB_SEED #AIinEducation #Btprop #QuestionBank #HUST`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 139, // Nguyễn Sỹ Lộc
        content: 'Tính năng AI Tinh chỉnh kèm kiểm định ảo giác trên hệ thống giúp tụi em rà soát lại lời giải câu hỏi rất nhanh trước khi gửi thầy cô duyệt ạ!'
      },
      {
        authorId: 252, // TS. Trần Hoàng Hải
        content: 'Nhờ mô hình kiểm định trùng lặp và gợi ý AI của nhóm nghiên cứu cô Huyền mà khối lượng thời gian giảng viên duyệt bài giảm đi đáng kể.'
      }
    ],
    reactions: [
      { userId: 157, type: 'WOW' },
      { userId: 139, type: 'LOVE' },
      { userId: 252, type: 'LOVE' },
      { userId: 253, type: 'LIKE' }
    ]
  },
  {
    key: 'p12',
    authorId: 255, // ThS. Lê Minh Tuấn (Teacher 04)
    content: `🐳 **[HƯỚNG DẪN THỰC HÀNH] Checklist Đóng gói Docker & Triển khai Production cho Đồ án Môn học IT4409 / IT4788**

Dành cho các nhóm sinh viên chuẩn bị демо Bài tập lớn cuối kỳ tại phòng Lab Trung tâm Máy tính:

- **Frontend SPA**: Sử dụng Multi-stage Dockerfile (\`node:20-alpine\` cho bước build Vite và \`nginx:alpine\` cho bước serve tĩnh), cấu hình \`try_files $uri $uri/ /index.html;\` để không bị lỗi 404 khi F5 trên React Router.
- **Reverse Proxy & WebSocket**: Đảm bảo truyền đủ bộ header \`Upgrade: websocket\` và \`Connection: "upgrade"\` cho endpoint \`/api/v1/ws\`.
- **Kiểm tra chất lượng tự động**: Luôn chạy \`npm run audit:strict\` và \`npm test\` xanh 100% trong pipeline trước khi merge nhánh chính.

Chúc các nhóm triển khai suôn sẻ! 🚀

#SQB_SEED #DevOps #Docker #Nginx #Deployment #SoICT`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 164, // Bùi Tuấn Anh
        content: 'Checklist quá chi tiết thầy Tuấn ơi! Nhóm em vừa cấu hình xong proxy WebSocket theo đúng hướng dẫn của thầy, kết nối STOMP ổn định tuyệt đối ạ.'
      }
    ],
    reactions: [
      { userId: 157, type: 'LIKE' },
      { userId: 164, type: 'LOVE' },
      { userId: 158, type: 'LIKE' },
      { userId: 252, type: 'LIKE' }
    ]
  },
  {
    key: 'p13',
    authorId: 256, // TS. Đỗ Quốc Huy (Teacher 05)
    content: `🔒 **[GHI CHÚ HỘI ĐỒNG GIẢNG VIÊN] Thống nhất bộ câu hỏi Vấn đáp Bảo mật Web & API cho đợt bảo vệ BTL cuối kỳ**

Gửi các thầy cô trong tổ bộ môn Công nghệ Web & Phát triển Đa nền tảng:

Tôi đã rà soát các câu hỏi thuộc chủ đề **Authentication, OAuth2 PKCE, CORS, XSS/CSRF và Mobile Keychain** trong ngân hàng câu hỏi chung. Đề xuất hội đồng sử dụng trực tiếp các bộ đề thi đã kết xuất từ hệ thống SQB làm ngân hàng câu hỏi trắc nghiệm đầu giờ trước khi vào phần demo trực tiếp của từng nhóm sinh viên.

#SQB_SEED #FacultyNote #SecurityReview #SoICT`,
    visibility: 'FRIENDS',
    subjectId: 2,
    comments: [
      {
        authorId: 252, // TS. Trần Hoàng Hải
        content: 'Hoàn toàn nhất trí với thầy Huy! Tôi và PGS. Đồng đã khởi tạo sẵn 4 bộ đề thi chuẩn hóa trên hệ thống cho cả 2 môn IT4409 và IT4788.'
      },
      {
        authorId: 253, // PGS.TS. Phạm Văn Đồng
        content: 'Nhất trí cao! Các câu hỏi do sinh viên đóng góp kỳ này được biên tập rất kỹ, hoàn toàn đáp ứng yêu cầu kiểm tra đánh giá.'
      }
    ],
    reactions: [
      { userId: 252, type: 'LOVE' },
      { userId: 253, type: 'LOVE' },
      { userId: 254, type: 'LIKE' },
      { userId: 255, type: 'LIKE' }
    ]
  }
];

export const LECTURER_NOTES = [
  '🌟 [Nhận xét Giảng viên]: Bộ câu hỏi được biên soạn rất công phu, bám sát chuẩn RFC và kiến trúc thực tế. Khuyến khích cả lớp vào làm bài luyện tập! #SQB_SEED',
  '🎓 [Đánh giá Chuyên môn]: Các phương án lựa chọn có tính phân loại cao, lời giải thích mạch lạc giúp củng cố vững chắc kiến thức trọng tâm học phần. #SQB_SEED',
  '✅ [Xác nhận Ngân hàng đề]: Đã thẩm định và đưa vào danh mục câu hỏi ôn tập chính thức phục vụ kỳ thi giữa kỳ và cuối kỳ tại SoICT HUST. #SQB_SEED'
];
