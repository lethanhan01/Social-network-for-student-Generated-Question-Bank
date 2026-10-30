/**
 * Dữ liệu 3 phiên đề xuất câu hỏi trắc nghiệm môn IT4409 (12 câu hỏi chuẩn mực)
 */

export const SESSIONS_DATA = [
  {
    authorId: 157, // Lê Thành An
    title: 'Bộ câu hỏi ôn tập Chương 1: Kiến trúc Web Client-Server & HTTP Protocols #SQB_SEED',
    content: 'Bộ câu hỏi trắc nghiệm ôn tập trọng tâm về giao thức HTTP 1.1/2/3, RESTful constraints và mô hình kiến trúc Web phân tán.',
    source_url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    course_class_id: 3,
    questions: [
      {
        content: 'Phương thức HTTP nào sau đây có tính chất Idempotent (Đồng nhất)?',
        options: [
          { key: 'A', text: 'POST', is_correct: false },
          { key: 'B', text: 'GET', is_correct: true },
          { key: 'C', text: 'CONNECT', is_correct: false },
          { key: 'D', text: 'PATCH', is_correct: false }
        ],
        explanation: 'GET là phương thức an toàn (Safe) và Idempotent; việc gửi yêu cầu nhiều lần liên tiếp không làm thay đổi trạng thái tài nguyên trên máy chủ.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Mã trạng thái HTTP nào sau đây biểu thị máy chủ hiểu cú pháp yêu cầu nhưng không thể xử lý do dữ liệu vi phạm ràng buộc ngữ nghĩa (Semantic Error)?',
        options: [
          { key: 'A', text: '400 Bad Request', is_correct: false },
          { key: 'B', text: '404 Not Found', is_correct: false },
          { key: 'C', text: '422 Unprocessable Content', is_correct: true },
          { key: 'D', text: '502 Bad Gateway', is_correct: false }
        ],
        explanation: 'HTTP 422 Unprocessable Content (theo RFC 9110) chỉ ra rằng nội dung request có cú pháp JSON đúng định dạng nhưng vi phạm quy tắc validation logic của nghiệp vụ.',
        llm_generated: false,
        confidence: 3.8
      },
      {
        content: 'Cơ chế Multiplexing trong giao thức HTTP/2 mang lại ưu thế vượt trội nào so với HTTP/1.1?',
        options: [
          { key: 'A', text: 'Tự động mã hóa toàn bộ dữ liệu mà không cần chứng chỉ TLS', is_correct: false },
          { key: 'B', text: 'Cho phép truyền tải đồng thời nhiều Request và Response song song trên cùng một kết nối TCP duy nhất', is_correct: true },
          { key: 'C', text: 'Thay thế hoàn toàn giao thức TCP ở tầng Transport bằng UDP', is_correct: false },
          { key: 'D', text: 'Bắt buộc phía client phải lưu đệm toàn bộ tài nguyên trên ổ đĩa', is_correct: false }
        ],
        explanation: 'Multiplexing chia nhỏ thông điệp thành các khung nhị phân (Binary Frames) có định danh Stream ID và truyền xen kẽ trên 1 TCP socket, triệt tiêu hiện tượng Head-of-Line Blocking ở tầng ứng dụng.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Khi một ứng dụng Single Page Application (SPA) gửi request có chứa Header tự định nghĩa (Custom Header) sang Origin khác, hành vi nào sẽ diễn ra trước tiên?',
        options: [
          { key: 'A', text: 'Máy chủ trả về ngay mã 200 OK và xử lý dữ liệu', is_correct: false },
          { key: 'B', text: 'Trình duyệt tự động gửi một Preflight Request với phương thức OPTIONS để kiểm tra quyền truy cập', is_correct: true },
          { key: 'C', text: 'Trình duyệt lập tức hủy bỏ request và báo lỗi Network Error trên console', is_correct: false },
          { key: 'D', text: 'Máy chủ yêu cầu người dùng phải xác thực lại bằng tài khoản quản trị', is_correct: false }
        ],
        explanation: 'Theo đặc tả CORS của W3C, bất kỳ request nào chứa header không nằm trong danh sách an toàn mặc định đều phải trải qua bước kiểm tra Preflight bằng phương thức OPTIONS.',
        llm_generated: false,
        confidence: 4.0
      }
    ]
  },
  {
    authorId: 164, // Bùi Tuấn Anh
    title: 'Bộ câu hỏi ôn tập Chương 2: RESTful API & Bảo mật Ứng dụng Web #SQB_SEED',
    content: 'Bộ câu hỏi chuyên sâu về JWT Architecture, cơ chế phòng chống tấn công XSS/CSRF và thiết kế chuẩn RESTful endpoint.',
    source_url: 'https://jwt.io/introduction',
    course_class_id: 3,
    questions: [
      {
        content: 'Trong cấu trúc chuẩn của JWT (JSON Web Token), thành phần nào đảm bảo tính toàn vẹn của dữ liệu và chống giả mạo thông tin?',
        options: [
          { key: 'A', text: 'Header', is_correct: false },
          { key: 'B', text: 'Payload', is_correct: false },
          { key: 'C', text: 'Signature (Chữ ký số)', is_correct: true },
          { key: 'D', text: 'Issuer Claim', is_correct: false }
        ],
        explanation: 'Signature được tạo ra bằng cách băm Header và Payload được mã hóa Base64Url cùng với Secret Key bí mật phía máy chủ, ngăn chặn việc sửa đổi trái phép nội dung Token.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Thuộc tính cấu hình nào của Cookie giúp bảo vệ Access Token chống lại nguy cơ bị đánh cắp bởi các đoạn mã độc XSS (Cross-Site Scripting)?',
        options: [
          { key: 'A', text: 'SameSite=Lax', is_correct: false },
          { key: 'B', text: 'Secure', is_correct: false },
          { key: 'C', text: 'HttpOnly', is_correct: true },
          { key: 'D', text: 'Path=/', is_correct: false }
        ],
        explanation: 'Cờ HttpOnly chỉ thị cho trình duyệt cấm hoàn toàn JavaScript (document.cookie) truy cập vào nội dung cookie, vô hiệu hóa việc mã độc XSS trích xuất token.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Thiết kế URI nào sau đây tuân thủ đúng nhất chuẩn RESTful API Best Practices khi muốn lấy danh sách bài viết thuộc về một người dùng cụ thể?',
        options: [
          { key: 'A', text: 'GET /getUserPosts?userId=123', is_correct: false },
          { key: 'B', text: 'POST /users/123/get-posts', is_correct: false },
          { key: 'C', text: 'GET /users/123/posts', is_correct: true },
          { key: 'D', text: 'GET /posts/action/find-by-user-id', is_correct: false }
        ],
        explanation: 'RESTful URI sử dụng danh từ số nhiều để mô tả tài nguyên và phản ánh quan hệ phân cấp tự nhiên: GET /users/{id}/posts đại diện cho tập hợp bài viết của người dùng.',
        llm_generated: false,
        confidence: 3.7
      },
      {
        content: 'Biện pháp nào sau đây là giải pháp căn cơ và hiệu quả nhất để phòng chống tấn công CSRF (Cross-Site Request Forgery) trên kiến trúc REST API hiện đại?',
        options: [
          { key: 'A', text: 'Sử dụng cờ SameSite=Strict hoặc SameSite=Lax cho Cookie kết hợp Anti-CSRF Token hoặc lưu Access Token trong Memory State', is_correct: true },
          { key: 'B', text: 'Chuyển toàn bộ các phương thức cập nhật dữ liệu sang phương thức GET', is_correct: false },
          { key: 'C', text: 'Tắt hoàn toàn tính năng bảo vệ CORS trên máy chủ backend', is_correct: false },
          { key: 'D', text: 'Bắt buộc client gửi dữ liệu dưới dạng URL-encoded thay cho JSON', is_correct: false }
        ],
        explanation: 'SameSite hạn chế gửi cookie theo ngữ cảnh trang chéo, kết hợp lưu Access Token trong bộ nhớ ứng dụng (Memory) khiến kẻ tấn công không thể kích hoạt request hợp lệ từ trang ngoài.',
        llm_generated: false,
        confidence: 3.6
      }
    ]
  },
  {
    authorId: 139, // Nguyễn Sỹ Lộc
    title: 'Bộ câu hỏi ôn tập Chương 3: CSS Modern Layout & Hiệu Năng Tải Trang Web #SQB_SEED',
    content: 'Bộ câu hỏi thực tế về CSS Flexbox vs Grid, các chỉ số Core Web Vitals (LCP, INP, CLS) và kỹ thuật chống Layout Thrashing.',
    source_url: 'https://web.dev/explore/metrics',
    course_class_id: 3,
    questions: [
      {
        content: 'Sự khác biệt căn bản nhất giữa CSS Grid và CSS Flexbox trong việc xây dựng giao diện ứng dụng web là gì?',
        options: [
          { key: 'A', text: 'CSS Flexbox chỉ hoạt động trên Chrome, còn CSS Grid tương thích mọi trình duyệt', is_correct: false },
          { key: 'B', text: 'Flexbox là hệ thống bố cục 1 chiều (hàng hoặc cột), trong khi CSS Grid là hệ thống bố cục 2 chiều (đồng thời cả hàng và cột)', is_correct: true },
          { key: 'C', text: 'CSS Grid không hỗ trợ căn chỉnh khoảng cách bằng thuộc tính gap', is_correct: false },
          { key: 'D', text: 'Flexbox không thể căn chỉnh phần tử theo chiều dọc', is_correct: false }
        ],
        explanation: 'Flexbox tập trung phân bổ không gian và căn chỉnh trên một trục duy nhất (trục chính hoặc trục phụ), trong khi Grid cho phép định vị phần tử trên cả ma trận lưới 2 chiều.',
        llm_generated: false,
        confidence: 3.8
      },
      {
        content: 'Chỉ số Core Web Vitals nào đo lường độ trễ phản hồi của trang web khi người dùng tương tác lần đầu (nhấp chuột, gõ phím)?',
        options: [
          { key: 'A', text: 'LCP (Largest Contentful Paint)', is_correct: false },
          { key: 'B', text: 'CLS (Cumulative Layout Shift)', is_correct: false },
          { key: 'C', text: 'INP (Interaction to Next Paint) / FID (First Input Delay)', is_correct: true },
          { key: 'D', text: 'FCP (First Contentful Paint)', is_correct: false }
        ],
        explanation: 'INP (và FID) đo lường khoảng thời gian tính bằng mili-giây từ khi người dùng thực hiện một tương tác đến khi trình duyệt có thể render khung hình tiếp theo phản hồi tương tác đó.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Kỹ thuật nào giúp tối ưu và giảm thiểu tối đa chỉ số CLS (Cumulative Layout Shift) khi hiển thị hình ảnh trên trang web?',
        options: [
          { key: 'A', text: 'Luôn khai báo trước kích thước width và height (hoặc thuộc tính aspect-ratio) trong thẻ ảnh hoặc CSS', is_correct: true },
          { key: 'B', text: 'Nén dung lượng ảnh xuống chất lượng thấp nhất có thể', is_correct: false },
          { key: 'C', text: 'Luôn lưu ảnh dưới định dạng ảnh động GIF', is_correct: false },
          { key: 'D', text: 'Chuyển toàn bộ hình ảnh sang inline SVG trong tài liệu HTML', is_correct: false }
        ],
        explanation: 'Khai báo trước kích thước giúp trình duyệt dự trữ sẵn không gian trên layout trước khi hình ảnh được tải về từ mạng, ngăn chặn các phần tử xung quanh bị giật nhảy vị trí.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Để ngăn ngừa hiện tượng Layout Thrashing (Reflow liên tục) làm suy giảm hiệu năng render của JavaScript, lập trình viên nên tuân thủ nguyên tắc nào?',
        options: [
          { key: 'A', text: 'Luôn gọi thuộc tính offsetWidth ngay sau mỗi câu lệnh thay đổi style.width', is_correct: false },
          { key: 'B', text: 'Gom nhóm toàn bộ các thao tác đọc kích thước DOM (Read) trước khi thực hiện các thao tác thay đổi style DOM (Write)', is_correct: true },
          { key: 'C', text: 'Sử dụng lệnh document.write thay cho cập nhật state', is_correct: false },
          { key: 'D', text: 'Tắt toàn bộ hiệu ứng chuyển động CSS Transition trong stylesheet', is_correct: false }
        ],
        explanation: 'Gom cụm các tác vụ Read và Write giúp trình duyệt tận dụng tối đa cơ chế Batch Layout Updates, tránh tình trạng ép buộc trình duyệt phải tính toán lại render tree giữa các câu lệnh.',
        llm_generated: false,
        confidence: 3.9
      }
    ]
  }
];

