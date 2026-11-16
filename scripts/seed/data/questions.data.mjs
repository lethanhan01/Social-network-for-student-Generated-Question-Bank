/**
 * Dữ liệu 6 phiên đề xuất câu hỏi trắc nghiệm (30 câu hỏi chuẩn mực phủ IT4409 & IT4788),
 * kịch bản đặt cược Game 2, kịch bản Teacher 01 & 02 duyệt RESOLVED 100%, và 4 Đề thi mẫu.
 */

export const SESSIONS_DATA = [
  // =========================================================================
  // PHIÊN 1: Lê Thành An (157) -> Lớp IT4409 (171150) của Teacher 01 (252)
  // 5 câu (3 Human + 2 LLM) -> Teacher 01 sửa nhẹ câu 0, Approve cả 5/5 câu
  // =========================================================================
  {
    key: 'sess_1',
    authorId: 157,
    classKey: 'cls_t1_web',
    reviewerId: 252,
    subjectId: 2,
    title: 'Bộ câu hỏi Chương 1: Kiến trúc Web, HTTP/2/3 & CORS Preflight (Lớp 171150) #SQB_SEED',
    content: 'Bộ 5 câu hỏi trắc nghiệm trọng tâm Chương 1 môn IT4409: đặc tính Idempotent, HTTP 422, Multiplexing trên HTTP/2, QUIC HTTP/3 và cơ chế CORS Preflight.',
    source_url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    game2Prediction: {
      predicted_human_count: 3,
      predicted_llm_count: 2
    },
    reviewPlan: {
      editQuestionIndex: 0,
      editExplanationSuffix: ' [Đã thẩm định bởi TS. Trần Hoàng Hải: Giải thích chuẩn RFC 9110].',
      rejectQuestionIndexes: []
    },
    questions: [
      {
        content: 'Phương thức HTTP nào sau đây vừa mang tính chất Safe (An toàn) vừa có tính chất Idempotent (Đồng nhất) theo đặc tả RFC 9110?',
        options: [
          { key: 'A', text: 'POST', is_correct: false },
          { key: 'B', text: 'GET', is_correct: true },
          { key: 'C', text: 'CONNECT', is_correct: false },
          { key: 'D', text: 'PATCH', is_correct: false }
        ],
        explanation: 'GET là phương thức Safe (chỉ đọc) và Idempotent; việc gửi yêu cầu lặp lại nhiều lần không làm thay đổi trạng thái tài nguyên trên máy chủ.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Mã trạng thái HTTP nào biểu thị máy chủ hiểu đúng cú pháp JSON của request nhưng từ chối xử lý do vi phạm quy tắc nghiệp vụ (Semantic Validation Error)?',
        options: [
          { key: 'A', text: '400 Bad Request', is_correct: false },
          { key: 'B', text: '404 Not Found', is_correct: false },
          { key: 'C', text: '422 Unprocessable Content', is_correct: true },
          { key: 'D', text: '502 Bad Gateway', is_correct: false }
        ],
        explanation: 'HTTP 422 Unprocessable Content chỉ ra rằng cú pháp thực thể hoàn toàn hợp lệ nhưng dữ liệu bên trong không vượt qua bước kiểm tra ngữ nghĩa.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Cơ chế Multiplexing trong giao thức HTTP/2 giải quyết triệt để điểm nghẽn nào của HTTP/1.1 ở tầng ứng dụng?',
        options: [
          { key: 'A', text: 'Tự động nén ảnh sang định dạng WebP mà không cần cấu hình máy chủ', is_correct: false },
          { key: 'B', text: 'Cho phép truyền song song nhiều luồng Request/Response trên một kết nối TCP duy nhất, loại bỏ Application-layer Head-of-Line Blocking', is_correct: true },
          { key: 'C', text: 'Thay thế hoàn toàn tầng giao vận TCP bằng giao thức UDP', is_correct: false },
          { key: 'D', text: 'Lưu trữ vĩnh viễn mọi phản hồi API trong LocalStorage của trình duyệt', is_correct: false }
        ],
        explanation: 'HTTP/2 đóng gói thông điệp thành các khung nhị phân (Binary Frames) gắn nhãn Stream ID và truyền đan xen trên một kết nối TCP duy nhất.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Khi một ứng dụng SPA gửi request kèm Custom Header (ví dụ: X-Device-Id) sang một Origin khác, trình duyệt sẽ thực hiện bước nào trước tiên?',
        options: [
          { key: 'A', text: 'Gửi thẳng request chính và bỏ qua kiểm tra bảo mật cùng nguồn', is_correct: false },
          { key: 'B', text: 'Tự động phát một Preflight Request với phương thức OPTIONS để xác minh các header và method được máy chủ cho phép', is_correct: true },
          { key: 'C', text: 'Chặn đứng kết nối ở tầng DNS và không gửi bất kỳ gói tin nào', is_correct: false },
          { key: 'D', text: 'Tự động chuyển đổi phương thức request từ POST sang GET', is_correct: false }
        ],
        explanation: 'Theo tiêu chuẩn W3C CORS, mọi request có chứa non-safelisted header đều kích hoạt Preflight OPTIONS kiểm tra Access-Control-Allow-Headers.',
        llm_generated: true,
        confidence: 3.8
      },
      {
        content: 'Giao thức HTTP/3 (dựa trên nền tảng QUIC) cải thiện hiệu năng kết nối mạng di động như thế nào so với HTTP/2?',
        options: [
          { key: 'A', text: 'Vận hành trên giao thức UDP tích hợp TLS 1.3 giúp bắt tay 0-RTT/1-RTT và loại bỏ Transport-layer Head-of-Line Blocking khi mất gói tin', is_correct: true },
          { key: 'B', text: 'Mở đồng thời 64 kết nối TCP song song cho mỗi tab trình duyệt', is_correct: false },
          { key: 'C', text: 'Loại bỏ hoàn toàn cơ chế mã hóa để giảm độ trễ xử lý CPU', is_correct: false },
          { key: 'D', text: 'Chỉ truyền văn bản thuần túy dạng ASCII giống HTTP/0.9', is_correct: false }
        ],
        explanation: 'QUIC chạy trên UDP và quản lý luồng độc lập ở tầng giao vận, do đó một gói UDP bị thất lạc chỉ ảnh hưởng tới đúng stream chứa gói đó thay vì làm nghẽn toàn bộ các stream khác như TCP.',
        llm_generated: true,
        confidence: 3.7
      }
    ]
  },

  // =========================================================================
  // PHIÊN 2: Bùi Tuấn Anh (164) -> Lớp IT4409 (171150) của Teacher 01 (252)
  // 5 câu (3 Human + 2 LLM) -> Teacher 01 Approve 4 câu, Reject 1 câu LLM (index 4)
  // =========================================================================
  {
    key: 'sess_2',
    authorId: 164,
    classKey: 'cls_t1_web',
    reviewerId: 252,
    subjectId: 2,
    title: 'Bộ câu hỏi Chương 2: Thiết kế RESTful API & Bảo mật JWT/XSS/CSRF (Lớp 171150) #SQB_SEED',
    content: 'Bộ câu hỏi chuyên sâu về kiến trúc xác thực JWT, cơ chế Silent Token Refresh, phòng chống XSS/CSRF và thiết kế chuẩn URI RESTful.',
    source_url: 'https://owasp.org/www-project-top-ten/',
    game2Prediction: {
      predicted_human_count: 3,
      predicted_llm_count: 1
    },
    reviewPlan: {
      editQuestionIndex: null,
      rejectQuestionIndexes: [4],
      rejectReason: 'Phương án gây nhiễu C và D của câu hỏi do AI sinh ra còn chồng chéo khái niệm SameSite, cần biên tập lại rõ hơn.'
    },
    questions: [
      {
        content: 'Trong cấu trúc chuẩn của JSON Web Token (JWT - RFC 7519), thành phần nào đảm bảo tính toàn vẹn dữ liệu và giúp máy chủ phát hiện hành vi chỉnh sửa trái phép Payload?',
        options: [
          { key: 'A', text: 'Header', is_correct: false },
          { key: 'B', text: 'Payload Claims', is_correct: false },
          { key: 'C', text: 'Signature (Chữ ký mật mã)', is_correct: true },
          { key: 'D', text: 'Base64Url Padding', is_correct: false }
        ],
        explanation: 'Signature được tính toán từ Header + Payload đã mã hóa Base64Url kết hợp với khóa bí mật (HMAC) hoặc khóa riêng tư (RSA/ECDSA) của máy chủ.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Cờ cấu hình nào của HTTP Cookie ngăn chặn hoàn toàn mã JavaScript phía trình duyệt (document.cookie) truy cập vào Refresh Token khi xảy ra lỗ hổng XSS?',
        options: [
          { key: 'A', text: 'SameSite=Lax', is_correct: false },
          { key: 'B', text: 'Secure', is_correct: false },
          { key: 'C', text: 'HttpOnly', is_correct: true },
          { key: 'D', text: 'Max-Age=3600', is_correct: false }
        ],
        explanation: 'Thuộc tính HttpOnly yêu cầu trình duyệt chỉ đính kèm cookie trong các yêu cầu HTTP/HTTPS và ẩn hoàn toàn khỏi Web APIs của JavaScript.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Mẫu thiết kế URI nào sau đây tuân thủ đúng chuẩn RESTful API Best Practices khi truy vấn danh sách câu hỏi thuộc về một phiên đề xuất có ID là 53?',
        options: [
          { key: 'A', text: 'GET /getSessionQuestions?sessionId=53', is_correct: false },
          { key: 'B', text: 'POST /sessions/53/fetch-questions', is_correct: false },
          { key: 'C', text: 'GET /sessions/53/questions', is_correct: true },
          { key: 'D', text: 'GET /questions/by-session-id/53/list', is_correct: false }
        ],
        explanation: 'RESTful URI sử dụng danh từ số nhiều phân cấp để biểu diễn quan hệ tài nguyên cha-con và dùng HTTP verb GET cho thao tác đọc dữ liệu.',
        llm_generated: false,
        confidence: 3.8
      },
      {
        content: 'Tại sao trong kiến trúc Frontend SPA hiện đại cần áp dụng cơ chế Mutex Queue khi thực hiện Silent Token Refresh trong Axios Response Interceptor?',
        options: [
          { key: 'A', text: 'Để ngăn nhiều request gặp lỗi 401 cùng lúc phát sinh hàng loạt cuộc gọi /auth/refresh trùng lặp làm vô hiệu hóa Refresh Token Rotation', is_correct: true },
          { key: 'B', text: 'Để tăng tốc độ render của các component React gấp 2 lần', is_correct: false },
          { key: 'C', text: 'Để tự động nén toàn bộ JSON payload trước khi gửi lên máy chủ', is_correct: false },
          { key: 'D', text: 'Để thay thế hoàn toàn việc kiểm tra quyền truy cập ở phía Backend', is_correct: false }
        ],
        explanation: 'Khi nhiều API song song cùng nhận HTTP 401, Mutex đảm bảo chỉ có duy nhất 1 request gọi /auth/refresh; các request còn lại xếp hàng đợi token mới rồi tự động replay.',
        llm_generated: true,
        confidence: 3.9
      },
      {
        content: 'Trong cấu hình Cookie phiên làm việc, sự khác biệt chi tiết giữa các tùy chọn SameSite khi trình duyệt điều hướng liên trang là gì?',
        options: [
          { key: 'A', text: 'SameSite=Strict chỉ gửi cookie cho yêu cầu cùng site hoàn toàn', is_correct: true },
          { key: 'B', text: 'SameSite=None không cần đi kèm cờ Secure trên trình duyệt hiện đại', is_correct: false },
          { key: 'C', text: 'SameSite=Lax chặn cả liên kết điều hướng top-level GET thông thường', is_correct: false },
          { key: 'D', text: 'SameSite=Lax và Strict có hành vi hoàn toàn giống hệt nhau trong mọi trường hợp', is_correct: false }
        ],
        explanation: 'SameSite=Strict không gửi cookie ngay cả khi người dùng nhấp vào liên kết từ trang ngoài dẫn tới website.',
        llm_generated: true,
        confidence: 2.5
      }
    ]
  },

  // =========================================================================
  // PHIÊN 3: Nguyễn Sỹ Lộc (139) -> Lớp IT4409 (171151) của Teacher 02 (253)
  // 5 câu (4 Human + 1 LLM) -> Teacher 02 sửa nhẹ câu 1, Approve cả 5/5 câu
  // =========================================================================
  {
    key: 'sess_3',
    authorId: 139,
    classKey: 'cls_t2_web',
    reviewerId: 253,
    subjectId: 2,
    title: 'Bộ câu hỏi Chương 3 & 4: CSS Modern Layout, Core Web Vitals & React 19 (Lớp 171151) #SQB_SEED',
    content: 'Bộ câu hỏi ôn tập thực chiến về Flexbox vs Grid, tối ưu chỉ số LCP/INP/CLS, chống Layout Thrashing và cơ chế Reconciliation của React 19.',
    source_url: 'https://web.dev/articles/vitals',
    game2Prediction: {
      predicted_human_count: 4,
      predicted_llm_count: 1
    },
    reviewPlan: {
      editQuestionIndex: 1,
      editExplanationSuffix: ' [PGS.TS. Phạm Văn Đồng: Lưu ý INP đã chính thức thay thế FID từ tháng 3/2024].',
      rejectQuestionIndexes: []
    },
    questions: [
      {
        content: 'Sự khác biệt cốt lõi nhất giữa hệ thống bố cục CSS Flexbox và CSS Grid khi thiết kế giao diện đáp ứng (Responsive Web Design) là gì?',
        options: [
          { key: 'A', text: 'CSS Flexbox chỉ hỗ trợ trình duyệt trên máy tính, còn CSS Grid chỉ dành cho thiết bị di động', is_correct: false },
          { key: 'B', text: 'Flexbox tối ưu cho bố cục 1 chiều (theo hàng hoặc theo cột), trong khi CSS Grid kiểm soát đồng thời bố cục 2 chiều (cả hàng và cột)', is_correct: true },
          { key: 'C', text: 'CSS Grid không hỗ trợ thuộc tính gap giữa các phần tử con', is_correct: false },
          { key: 'D', text: 'Flexbox không cho phép căn giữa phần tử theo trục dọc', is_correct: false }
        ],
        explanation: 'Flexbox phân bổ không gian dọc theo một trục chính (main axis), còn Grid cho phép định nghĩa ma trận hàng và cột tường minh.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Chỉ số Core Web Vitals nào đánh giá độ trễ phản hồi tổng thể của trang web đối với các thao tác nhấp chuột, chạm và nhấn phím của người dùng trong suốt vòng đời trang?',
        options: [
          { key: 'A', text: 'LCP (Largest Contentful Paint)', is_correct: false },
          { key: 'B', text: 'CLS (Cumulative Layout Shift)', is_correct: false },
          { key: 'C', text: 'INP (Interaction to Next Paint)', is_correct: true },
          { key: 'D', text: 'TTFB (Time to First Byte)', is_correct: false }
        ],
        explanation: 'INP đo lường thời gian từ lúc người dùng bắt đầu tương tác cho tới khi trình duyệt vẽ xong khung hình tiếp theo phản ánh kết quả tương tác đó.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Giải pháp nào sau đây giúp giảm thiểu tối đa điểm phạt CLS (Cumulative Layout Shift) khi tải các hình ảnh và banner động trên trang web?',
        options: [
          { key: 'A', text: 'Luôn khai báo kích thước width/height hoặc thuộc tính CSS aspect-ratio để trình duyệt giữ chỗ trước khi ảnh tải xong', is_correct: true },
          { key: 'B', text: 'Chuyển toàn bộ định dạng ảnh sang ảnh động GIF', is_correct: false },
          { key: 'C', text: 'Xóa toàn bộ thuộc tính alt trên các thẻ img', is_correct: false },
          { key: 'D', text: 'Tải toàn bộ hình ảnh bằng JavaScript sau 10 giây', is_correct: false }
        ],
        explanation: 'Việc khai báo tỷ lệ khung hình giúp trình duyệt tính toán chính xác kích thước khung chứa ngay trong pha Layout đầu tiên, tránh đẩy lệch nội dung bên dưới.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Để phòng tránh hiện tượng Layout Thrashing (Forced Synchronous Layout) trong JavaScript, lập trình viên cần tuân thủ nguyên tắc nào?',
        options: [
          { key: 'A', text: 'Đọc thuộc tính offsetHeight xen kẽ ngay sau mỗi dòng lệnh gán style.height trong vòng lặp', is_correct: false },
          { key: 'B', text: 'Gom nhóm toàn bộ các phép đọc thông số hình học DOM (Read) trước khi thực hiện hàng loạt phép ghi thay đổi CSS (Write)', is_correct: true },
          { key: 'C', text: 'Sử dụng document.write() để cập nhật giao diện', is_correct: false },
          { key: 'D', text: 'Tắt hoàn toàn bộ nhớ đệm của trình duyệt', is_correct: false }
        ],
        explanation: 'Đọc thông số hình học ngay sau khi sửa style buộc trình duyệt phải chạy Reflow đồng bộ tức thì thay vì gom lô ở cuối khung hình.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Trong React 19, tại sao không nên sử dụng useEffect để tính toán một giá trị phụ thuộc trực tiếp vào props hoặc state sẵn có (Derived State)?',
        options: [
          { key: 'A', text: 'Vì gây ra một chu kỳ render thừa không cần thiết và dễ dẫn tới trạng thái bất đồng bộ; thay vào đó nên tính toán trực tiếp ngay trong quá trình render', is_correct: true },
          { key: 'B', text: 'Vì React 19 đã xóa hoàn toàn hook useEffect khỏi thư viện lõi', is_correct: false },
          { key: 'C', text: 'Vì useEffect chỉ chạy ở phía máy chủ chứ không chạy trên trình duyệt', is_correct: false },
          { key: 'D', text: 'Vì useEffect làm tăng dung lượng file HTML tĩnh lên gấp 10 lần', is_correct: false }
        ],
        explanation: 'Tính toán Derived State trực tiếp trong thân hàm render giúp giao diện đồng bộ tức thì trong 1 lượt render duy nhất mà không cần lưu state dư thừa.',
        llm_generated: true,
        confidence: 3.8
      }
    ]
  },

  // =========================================================================
  // PHIÊN 4: Nguyễn Mạnh Tiếp (163) -> Lớp IT4788 (171149) của Teacher 01 (252)
  // 5 câu (3 Human + 2 LLM) -> Teacher 01 Approve cả 5/5 câu
  // =========================================================================
  {
    key: 'sess_4',
    authorId: 163,
    classKey: 'cls_t1_mob',
    reviewerId: 252,
    subjectId: 1,
    title: 'Bộ câu hỏi Đa nền tảng Phần 1: React Native New Architecture (JSI, Fabric, TurboModules) #SQB_SEED',
    content: 'Bộ câu hỏi chuyên sâu học phần IT4788 về kiến trúc mới của React Native (JSI, Fabric Renderer, TurboModules) và cơ chế kết xuất đồ họa của Flutter.',
    source_url: 'https://reactnative.dev/architecture/overview',
    game2Prediction: {
      predicted_human_count: 3,
      predicted_llm_count: 2
    },
    reviewPlan: {
      editQuestionIndex: null,
      rejectQuestionIndexes: []
    },
    questions: [
      {
        content: 'Trong kiến trúc mới (New Architecture) của React Native, thành phần JSI (JavaScript Interface) thay thế cơ chế truyền thông cũ nào để cho phép JavaScript gọi trực tiếp hàm C++/Native đồng bộ?',
        options: [
          { key: 'A', text: 'Cầu nối bất đồng bộ tuần tự hóa JSON (Asynchronous JSON Bridge)', is_correct: true },
          { key: 'B', text: 'WebView iframe nhúng cục bộ', is_correct: false },
          { key: 'C', text: 'Giao thức SOAP XML qua cổng TCP 8080', is_correct: false },
          { key: 'D', text: 'Cơ chế Polling tệp văn bản trên bộ nhớ ngoài', is_correct: false }
        ],
        explanation: 'JSI cho phép JavaScript giữ tham chiếu trực tiếp (HostObject) tới các đối tượng C++, loại bỏ hoàn toàn chi phí serialize/deserialize JSON qua Bridge cũ.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Ưu điểm nổi bật nhất của cơ chế TurboModules trong React Native so với hệ thống Native Modules truyền thống là gì?',
        options: [
          { key: 'A', text: 'Bắt buộc khởi tạo toàn bộ mọi module phần cứng ngay tại thời điểm mở ứng dụng', is_correct: false },
          { key: 'B', text: 'Hỗ trợ nạp lười (Lazy Loading) các module Native khi thực sự cần dùng và kiểm tra kiểu dữ liệu tĩnh thông qua Codegen', is_correct: true },
          { key: 'C', text: 'Chuyển toàn bộ mã nguồn Objective-C/Kotlin sang ngôn ngữ Python', is_correct: false },
          { key: 'D', text: 'Không cần biên dịch lại ứng dụng khi thêm thư viện phần cứng mới', is_correct: false }
        ],
        explanation: 'TurboModules chỉ khởi tạo module khi JS gọi tới, giúp rút ngắn đáng kể thời gian khởi động ứng dụng (Cold Start Time).',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Trong kiến trúc Flutter, ba cây cấu trúc cốt lõi nào phối hợp với nhau để quản lý trạng thái cấu hình, vòng đời gắn kết và bố cục hiển thị trên màn hình?',
        options: [
          { key: 'A', text: 'HTML Tree, CSSOM Tree và JavaScript AST', is_correct: false },
          { key: 'B', text: 'Widget Tree (bất biến), Element Tree (quản lý vòng đời/trạng thái) và RenderObject Tree (tính toán bố cục & vẽ)', is_correct: true },
          { key: 'C', text: 'Activity Tree, Fragment Tree và Intent Tree', is_correct: false },
          { key: 'D', text: 'DOM Tree, Shadow DOM và Virtual DOM', is_correct: false }
        ],
        explanation: 'Flutter tách biệt cấu hình nhẹ bất biến (Widget) khỏi đối tượng giữ trạng thái trên cây (Element) và đối tượng tính toán layout/painting nặng (RenderObject).',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Khi hiển thị danh sách hàng nghìn phần tử trên ứng dụng di động React Native, tại sao bắt buộc dùng FlatList/FlashList thay vì dùng ScrollView kết hợp hàm map()?',
        options: [
          { key: 'A', text: 'Vì FlatList áp dụng kỹ thuật Virtualization (Windowing), chỉ khởi tạo và giữ trong bộ nhớ các phần tử đang nằm trong hoặc sát vùng nhìn thấy (Viewport)', is_correct: true },
          { key: 'B', text: 'Vì ScrollView không hỗ trợ cuộn theo chiều dọc trên hệ điều hành iOS', is_correct: false },
          { key: 'C', text: 'Vì FlatList tự động lưu toàn bộ dữ liệu danh sách lên đám mây', is_correct: false },
          { key: 'D', text: 'Vì hàm map() bị cấm sử dụng trong cú pháp JSX của React Native', is_correct: false }
        ],
        explanation: 'ScrollView dựng đồng loạt toàn bộ phần tử con ngay lập tức gây tràn bộ nhớ (OOM) và rớt khung hình, trong khi FlatList tái sử dụng/huỷ các item ngoài khung nhìn.',
        llm_generated: true,
        confidence: 3.9
      },
      {
        content: 'Công cụ kết xuất đồ họa (Rendering Engine) mặc định mới của Flutter được thiết kế để biên dịch trước các Shader (AOT) nhằm triệt tiêu hiện tượng giật khung hình lần đầu (Shader Compilation Jank) có tên là gì?',
        options: [
          { key: 'A', text: 'Impeller', is_correct: true },
          { key: 'B', text: 'Gecko', is_correct: false },
          { key: 'C', text: 'Trident', is_correct: false },
          { key: 'D', text: 'DirectDraw 7', is_correct: false }
        ],
        explanation: 'Impeller thay thế dần Skia trên iOS và Android bằng cách biên dịch sẵn toàn bộ tập lệnh đổ bóng (Shaders) ngay trong quá trình đóng gói ứng dụng.',
        llm_generated: true,
        confidence: 3.8
      }
    ]
  },

  // =========================================================================
  // PHIÊN 5: Nguyễn Trung Kiên (158) -> Lớp IT4788 (171152) của Teacher 02 (253)
  // 5 câu (3 Human + 2 LLM) -> Teacher 02 Approve cả 5/5 câu
  // =========================================================================
  {
    key: 'sess_5',
    authorId: 158,
    classKey: 'cls_t2_mob',
    reviewerId: 253,
    subjectId: 1,
    title: 'Bộ câu hỏi Đa nền tảng Phần 2: Lưu trữ Offline-first, Bảo mật Keychain & Push FCM #SQB_SEED',
    content: 'Bộ câu hỏi ôn tập môn IT4788 về lưu trữ cục bộ an toàn trên thiết bị di động (Keychain/Keystore), đồng bộ Offline-first, Deep Linking và thông báo đẩy FCM/APNs.',
    source_url: 'https://firebase.google.com/docs/cloud-messaging',
    game2Prediction: {
      predicted_human_count: 2, // Cố tình dự đoán lệch 1 câu để có cả case dự đoán trượt trong lịch sử
      predicted_llm_count: 2
    },
    reviewPlan: {
      editQuestionIndex: null,
      rejectQuestionIndexes: []
    },
    questions: [
      {
        content: 'Trên ứng dụng di động đa nền tảng, thông tin nhạy cảm như Refresh Token hoặc khóa giải mã cá nhân cần được lưu trữ ở đâu để đảm bảo an toàn phần cứng?',
        options: [
          { key: 'A', text: 'AsyncStorage hoặc SharedPreferences dưới dạng văn bản thuần (Plaintext)', is_correct: false },
          { key: 'B', text: 'iOS Keychain Services và Android Keystore System (thông qua SecureStore / EncryptedStorage)', is_correct: true },
          { key: 'C', text: 'Biến toàn cục trên đối tượng window của JavaScript', is_correct: false },
          { key: 'D', text: 'Tệp JSON công khai trong thư mục Download của thiết bị', is_correct: false }
        ],
        explanation: 'iOS Keychain và Android Keystore mã hóa dữ liệu bằng khóa được bảo vệ bởi phần cứng (Secure Enclave / TEE), chống trích xuất trái phép.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Sự khác biệt quan trọng giữa Universal Links (iOS) / App Links (Android) so với Custom URL Schemes truyền thống (ví dụ: myapp://profile) là gì?',
        options: [
          { key: 'A', text: 'Universal Links/App Links xác thực quyền sở hữu tên miền HTTPS thông qua tệp cấu hình trên máy chủ web, chống bị ứng dụng giả mạo chiếm quyền mở link (Scheme Hijacking)', is_correct: true },
          { key: 'B', text: 'Custom URL Schemes chỉ hoạt động khi thiết bị bật chế độ máy bay', is_correct: false },
          { key: 'C', text: 'Universal Links không thể mở màn hình chi tiết bên trong ứng dụng', is_correct: false },
          { key: 'D', text: 'App Links yêu cầu người dùng phải cài đặt lại hệ điều hành mỗi tuần', is_correct: false }
        ],
        explanation: 'Universal Links (apple-app-site-association) và Android App Links (assetlinks.json) gắn chặt với chứng chỉ HTTPS của domain chính chủ và tự động fallback về trình duyệt nếu chưa cài app.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Trong kiến trúc ứng dụng di động Offline-first, chiến lược Outbox Queue (Hàng đợi gửi đi) giải quyết bài toán nào khi người dùng thao tác trong vùng mất sóng?',
        options: [
          { key: 'A', text: 'Ghi nhận các thao tác thay đổi dữ liệu vào cơ sở dữ liệu cục bộ (SQLite/Realm) kèm trạng thái chờ, sau đó tự động đồng bộ tuần tự kèm Idempotency Key khi có mạng trở lại', is_correct: true },
          { key: 'B', text: 'Tự động xóa toàn bộ dữ liệu người dùng vừa nhập nếu mạng phản hồi chậm quá 100ms', is_correct: false },
          { key: 'C', text: 'Khóa cứng màn hình cảm ứng cho tới khi thiết bị kết nối được Wi-Fi', is_correct: false },
          { key: 'D', text: 'Bắt buộc người dùng phải khởi động lại điện thoại sau mỗi thao tác lưu', is_correct: false }
        ],
        explanation: 'Outbox Queue kết hợp Optimistic UI và Idempotency Key giúp trải nghiệm người dùng tức thì mà không bị mất hay nhân bản dữ liệu khi mạng chập chờn.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Khi tích hợp dịch vụ thông báo đẩy Firebase Cloud Messaging (FCM), sự khác nhau giữa Notification Message và Data Message khi ứng dụng đang ở trạng thái Background là gì?',
        options: [
          { key: 'A', text: 'Notification Message được hệ điều hành tự động hiển thị lên khay hệ thống, còn Data Message được chuyển cho hàm xử lý chạy nền của ứng dụng tự tùy biến', is_correct: true },
          { key: 'B', text: 'Data Message chỉ gửi được vào ban đêm, còn Notification Message chỉ gửi được vào ban ngày', is_correct: false },
          { key: 'C', text: 'Notification Message không thể chứa tiêu đề văn bản', is_correct: false },
          { key: 'D', text: 'FCM không hỗ trợ gửi thông báo tới các thiết bị chạy hệ điều hành Android', is_correct: false }
        ],
        explanation: 'System tray tự động xử lý Notification payload khi app ở nền, trong khi Data payload cho phép client chủ động đồng bộ dữ liệu ngầm hoặc dựng thông báo tùy chỉnh.',
        llm_generated: true,
        confidence: 3.8
      },
      {
        content: 'Tại sao thư viện lưu trữ khóa-giá trị MMKV trên React Native lại đạt tốc độ đọc/ghi vượt trội so với AsyncStorage truyền thống?',
        options: [
          { key: 'A', text: 'Vì MMKV sử dụng cơ chế ánh xạ bộ nhớ tệp tin (mmap) ở tầng C++ kết hợp mã hóa nhị phân protobuf và giao tiếp đồng bộ trực tiếp qua JSI', is_correct: true },
          { key: 'B', text: 'Vì MMKV lưu toàn bộ dữ liệu trên thẻ nhớ ngoài tốc độ thấp', is_correct: false },
          { key: 'C', text: 'Vì MMKV gửi mọi thao tác đọc biến cục bộ lên máy chủ từ xa qua mạng 3G', is_correct: false },
          { key: 'D', text: 'Vì MMKV không lưu dữ liệu xuống bộ nhớ thiết bị mà xóa sạch ngay khi tắt màn hình', is_correct: false }
        ],
        explanation: 'Nhờ mmap của hệ điều hành và kết nối JSI đồng bộ, MMKV tránh được hoàn toàn độ trễ cầu nối bất đồng bộ và chi phí phân tích cú pháp chuỗi JSON lớn.',
        llm_generated: true,
        confidence: 3.8
      }
    ]
  },

  // =========================================================================
  // PHIÊN 6: Lê Thành An (157) -> Lớp IT4409 (171151) của Teacher 02 (253)
  // 5 câu (3 Human + 2 LLM) -> Teacher 02 Approve cả 5/5 câu
  // =========================================================================
  {
    key: 'sess_6',
    authorId: 157,
    classKey: 'cls_t2_web',
    reviewerId: 253,
    subjectId: 2,
    title: 'Bộ câu hỏi Chương 5: Giao tiếp Thời gian thực WebSocket STOMP & Caching Redis (Lớp 171151) #SQB_SEED',
    content: 'Bộ câu hỏi nâng cao môn IT4409 về giao thức STOMP over WebSocket, Server-Sent Events (SSE), chiến lược Cache-Aside với Redis và đánh chỉ mục CSDL.',
    source_url: 'https://stomp.github.io/stomp-specification-1.2.html',
    game2Prediction: {
      predicted_human_count: 3,
      predicted_llm_count: 2
    },
    reviewPlan: {
      editQuestionIndex: null,
      rejectQuestionIndexes: []
    },
    questions: [
      {
        content: 'Vì sao trong các hệ thống nhắn tin thời gian thực quy mô lớn, người ta thường sử dụng giao thức STOMP chạy trên nền WebSocket thay vì chỉ dùng WebSocket thuần (Raw WebSocket)?',
        options: [
          { key: 'A', text: 'Vì WebSocket thuần chỉ là kênh truyền khung tin (Framing) tầng thấp, còn STOMP bổ sung ngữ nghĩa Pub/Sub theo đích đến (Destination/Topic), Header chuẩn và cơ chế ACK/Heartbeat', is_correct: true },
          { key: 'B', text: 'Vì WebSocket thuần chỉ truyền được dữ liệu một chiều từ máy chủ về trình duyệt', is_correct: false },
          { key: 'C', text: 'Vì STOMP tự động thay thế hoàn toàn cơ sở dữ liệu quan hệ PostgreSQL', is_correct: false },
          { key: 'D', text: 'Vì trình duyệt không thể mở kết nối WebSocket nếu thiếu thư viện jQuery', is_correct: false }
        ],
        explanation: 'STOMP cung cấp định dạng khung lệnh chuẩn (CONNECT, SUBSCRIBE, SEND, MESSAGE, ACK) giúp định tuyến tin nhắn theo phòng chat và thông báo cá nhân rõ ràng.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Trong trường hợp ứng dụng web chỉ cần nhận luồng dữ liệu một chiều từ máy chủ về trình duyệt (ví dụ: стриming kết quả AI hoặc bảng giá chứng khoán), công nghệ nào nhẹ và tận dụng tốt hạ tầng HTTP/2 sẵn có hơn WebSocket?',
        options: [
          { key: 'A', text: 'Server-Sent Events (SSE / EventSource) với kiểu nội dung text/event-stream', is_correct: true },
          { key: 'B', text: 'Tải lại toàn bộ trang HTML mỗi giây bằng thẻ meta refresh', is_correct: false },
          { key: 'C', text: 'Giao thức truyền tệp FTP truyền thống', is_correct: false },
          { key: 'D', text: 'Gửi email tự động qua giao thức SMTP', is_correct: false }
        ],
        explanation: 'SSE hoạt động trực tiếp trên kết nối HTTP chuẩn, hỗ trợ tự động kết nối lại (Auto-reconnect kèm Last-Event-ID) và ghép kênh hiệu quả trên HTTP/2.',
        llm_generated: false,
        confidence: 3.9
      },
      {
        content: 'Trong mô hình bộ nhớ đệm Cache-Aside (Lazy Loading) sử dụng Redis, luồng xử lý chuẩn khi ứng dụng nhận yêu cầu đọc dữ liệu bị Cache Miss là gì?',
        options: [
          { key: 'A', text: 'Trả về lỗi 500 ngay lập tức và yêu cầu người dùng thử lại sau 5 phút', is_correct: false },
          { key: 'B', text: 'Truy vấn dữ liệu từ Database gốc, ghi bản sao vào Redis kèm thời gian sống (TTL), sau đó trả kết quả về cho Client', is_correct: true },
          { key: 'C', text: 'Xóa toàn bộ các khóa đang có trong Redis bằng lệnh FLUSHALL', is_correct: false },
          { key: 'D', text: 'Ghi đè giá trị rỗng vĩnh viễn không có TTL vào bảng chính trong Database', is_correct: false }
        ],
        explanation: 'Cache-Aside giúp chỉ nạp vào Redis những dữ liệu thực sự được truy cập và dùng TTL để giới hạn thời gian tồn tại của dữ liệu cũ.',
        llm_generated: false,
        confidence: 4.0
      },
      {
        content: 'Hiện tượng Cache Stampede (Thundering Herd) xảy ra khi một khóa cache cực nóng (Hot Key) vừa hết hạn TTL cùng lúc có hàng nghìn request đổ vào. Giải pháp nào giúp khắc phục hiệu quả?',
        options: [
          { key: 'A', text: 'Sử dụng khóa phân tán (Distributed Lock / Singleflight) để chỉ 1 tiến trình đọc DB và nạp lại cache, hoặc làm mới sớm theo xác suất (Probabilistic Early Expiration)', is_correct: true },
          { key: 'B', text: 'Tắt hoàn toàn bộ nhớ đệm Redis vào giờ cao điểm', is_correct: false },
          { key: 'C', text: 'Đặt TTL của mọi khóa bằng 1 mili-giây', is_correct: false },
          { key: 'D', text: 'Chuyển toàn bộ câu lệnh SELECT sang khóa bảng độc quyền (EXCLUSIVE TABLE LOCK)', is_correct: false }
        ],
        explanation: 'Singleflight/Mutex ngăn chặn hàng nghìn truy vấn giống hệt nhau đánh sập Database gốc trong khoảnh khắc khóa cache vừa hết hạn.',
        llm_generated: true,
        confidence: 3.9
      },
      {
        content: 'Tại sao phân trang dựa trên con trỏ (Cursor-based / Keyset Pagination) lại hiệu quả và ổn định hơn phân trang OFFSET/LIMIT truyền thống đối với Bảng tin mạng xã hội (Activity Feed)?',
        options: [
          { key: 'A', text: 'Vì Cursor Pagination nhảy trực tiếp tới vị trí bản ghi qua chỉ mục (Index Seek O(log N)) và không bị trùng hay sót bài viết khi có bài mới chèn vào đầu bảng tin', is_correct: true },
          { key: 'B', text: 'Vì OFFSET/LIMIT không được hỗ trợ trong ngôn ngữ SQL chuẩn', is_correct: false },
          { key: 'C', text: 'Vì Cursor Pagination tự động nén hình ảnh trong bài viết nhỏ đi 90%', is_correct: false },
          { key: 'D', text: 'Vì Cursor Pagination không cần sử dụng bất kỳ chỉ mục (Index) nào trong CSDL', is_correct: false }
        ],
        explanation: 'OFFSET lớn buộc CSDL phải quét và bỏ qua hàng chục nghìn dòng đầu (O(N)), đồng thời dễ bị trôi dòng (Data Drift) khi có bản ghi mới thêm vào.',
        llm_generated: true,
        confidence: 4.0
      }
    ]
  }
];

export const EXAMS_DATA = [
  {
    key: 'exam_t1_web',
    lecturerId: 252, // Teacher 01
    subject_id: 2,
    classKey: 'cls_t1_web',
    title: 'Đề thi Giữa kỳ Công nghệ Web IT4409 - Ca 1 (Học kỳ 20261) #SQB_SEED',
    question_count: 8,
    shuffle_options: true,
    include_answer_key: true
  },
  {
    key: 'exam_t1_mob',
    lecturerId: 252, // Teacher 01
    subject_id: 1,
    classKey: 'cls_t1_mob',
    title: 'Đề thi Giữa kỳ Phát triển Đa nền tảng IT4788 - Ca 1 (Học kỳ 20261) #SQB_SEED',
    question_count: 5,
    shuffle_options: true,
    include_answer_key: true
  },
  {
    key: 'exam_t2_web',
    lecturerId: 253, // Teacher 02
    subject_id: 2,
    classKey: 'cls_t2_web',
    title: 'Đề thi Cuối kỳ Công nghệ Web IT4409 - Đề chuẩn hóa SoICT #SQB_SEED',
    question_count: 10,
    shuffle_options: true,
    include_answer_key: true
  },
  {
    key: 'exam_t2_mob',
    lecturerId: 253, // Teacher 02
    subject_id: 1,
    classKey: 'cls_t2_mob',
    title: 'Đề kiểm tra Thực hành Đa nền tảng IT4788 - Đề số 2 #SQB_SEED',
    question_count: 5,
    shuffle_options: false,
    include_answer_key: true
  }
];

export const PRACTICE_COMMENTS = [
  'Câu hỏi rất sát nội dung bài giảng trên lớp và giải thích rõ bản chất kỹ thuật! #SQB_SEED',
  'Các phương án gây nhiễu được thiết kế hợp lý, giúp phân biệt rõ các trường hợp biên. #SQB_SEED',
  'Rất hữu ích để ôn tập chuẩn bị cho kỳ thi giữa kỳ và cuối kỳ tại SoICT HUST. #SQB_SEED',
  'Lời giải chi tiết, có dẫn chiếu chuẩn RFC và thực tiễn triển khai dự án. #SQB_SEED'
];
