/**
 * Danh sách 8 bài viết xã hội và các luồng tương tác bình luận, cảm xúc
 */

export const POSTS_DATA = [
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
        authorId: 139, // Nguyễn Sỹ Lộc
        content: 'Thầy trên lớp cũng vừa nhắc tuần này về Core Web Vitals và INP. Diffing nhanh nhưng main thread bị block thì điểm INP vẫn thấp.'
      },
      {
        authorId: 158, // Nguyễn Trung Kiên
        content: 'Tuyệt vời anh An ơi, note lại để tuần sau thi trắc nghiệm phần này!'
      }
    ],
    reactions: [
      { userId: 164, type: 'LOVE' },
      { userId: 139, type: 'LIKE' },
      { userId: 163, type: 'WOW' },
      { userId: 158, type: 'LIKE' }
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
        authorId: 163, // Nguyễn Mạnh Tiếp
        content: 'Cho mình hỏi nếu token hết hạn giữa chừng khi đang upload file lớn thì cơ chế retry xử lý thế nào bạn?'
      }
    ],
    reactions: [
      { userId: 157, type: 'LOVE' },
      { userId: 139, type: 'LIKE' },
      { userId: 158, type: 'WOW' }
    ]
  },
  {
    key: 'p3',
    authorId: 139, // Nguyễn Sỹ Lộc
    content: `👥 **[Tìm đồng đội] Nhóm Bài tập lớn Công nghệ Web IT4409 - Học kỳ 20261**

Chào các bạn, nhóm mình hiện có 2 thành viên đang triển khai đề tài: *"Nền tảng chia sẻ câu hỏi trắc nghiệm & mạng xã hội học tập HUST"*.

Nhóm cần tìm thêm 1 bạn cùng lớp học phần \`171146\` có thế mạnh:
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
        authorId: 157, // Lê Thành An
        content: 'Nhớ check cả allowCredentials(true) nếu dùng Cookie cho session nha bạn.'
      }
    ],
    reactions: [
      { userId: 164, type: 'LOVE' },
      { userId: 157, type: 'LIKE' },
      { userId: 158, type: 'WOW' }
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
    content: `📚 **Tổng hợp Tài liệu ôn tập Chương 1-3 Môn Công nghệ Web (IT4409)**

Gửi các bạn sinh viên lớp \`171146\` bộ tài liệu tóm tắt kiến thức trọng tâm chuẩn bị cho đợt thi trắc nghiệm giữa kỳ:

- **Chương 1**: Giao thức HTTP 1.1/2/3, RESTful constraints, Kiến trúc MVC vs Microservices.
- **Chương 2**: Quản lý trạng thái, Session/Cookie, JWT Tokens, Bảo mật XSS, CSRF, SQL Injection.
- **Chương 3**: Layout hiện đại với CSS Grid & Flexbox, Tối ưu hiệu năng tải trang và Core Web Vitals (LCP, FID/INP, CLS).

Chúc các bạn ôn thi đạt điểm A+! 💪

#SQB_SEED #IT4409 #TaiLieuOnTap #HUST`,
    visibility: 'PUBLIC',
    subjectId: 2,
    comments: [
      {
        authorId: 164, // Bùi Tuấn Anh
        content: 'Tài liệu quá đầy đủ và tâm huyết, cảm ơn An nhiều!'
      },
      {
        authorId: 139, // Nguyễn Sỹ Lộc
        content: 'Lưu về ngay để ôn, đề thi môn này phần phân biệt HTTP status code hay bẫy lắm.'
      },
      {
        authorId: 163, // Nguyễn Mạnh Tiếp
        content: 'Đã tải về, mong các bạn trong nhóm cùng đạt kết quả tốt!'
      },
      {
        authorId: 158, // Nguyễn Trung Kiên
        content: 'Tuyệt vời ạ, cảm ơn bạn đã chia sẻ cho cả lớp.'
      }
    ],
    reactions: [
      { userId: 164, type: 'LOVE' },
      { userId: 139, type: 'LOVE' },
      { userId: 163, type: 'LIKE' },
      { userId: 158, type: 'LIKE' }
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

Mời anh em thảo luận!

#SQB_SEED #WebSecurity #JWT #Authentication`,
    visibility: 'FRIENDS',
    subjectId: 2,
    comments: [
      {
        authorId: 157, // Lê Thành An
        content: 'Chuẩn bài kiến trúc của hệ thống SQB HUST luôn! Memory state chống XSS đánh cắp vĩnh viễn, còn cookie silent refresh đảm bảo UX không bị bắt đăng nhập lại.'
      },
      {
        authorId: 139, // Nguyễn Sỹ Lộc
        content: 'Một góc nhìn rất sắc bén từ chuyên gia bảo mật của lớp!'
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
    content: `📝 **Ghi chú cá nhân: Checklist hoàn thiện BTL Công nghệ Web trước ngày 15/11**

- [x] Thiết lập cấu hình dự án Vite + React 19 + Tailwind v4.
- [x] Tích hợp bộ quy chuẩn semantic HTML và kiểm soát tương phản màu sắc.
- [ ] Hoàn thiện tính năng bình luận thời gian thực qua STOMP WebSocket.
- [ ] Chạy kiểm thử tự động toàn diện: \`npm run audit:strict\` và \`npm test\`.
- [ ] Đóng gói Docker container và deploy lên staging.

Cố lên tôi ơi! 🎯

#SQB_SEED #Checklist #PersonalLog`,
    visibility: 'ONLY_ME',
    subjectId: 2,
    comments: [],
    reactions: []
  }
];

