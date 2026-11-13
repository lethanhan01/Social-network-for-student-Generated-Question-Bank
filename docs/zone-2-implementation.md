# Zone 2: Mạng xã hội học tập

Zone 2 gồm bảng tin, chi tiết bài viết, hồ sơ, bạn bè và tìm kiếm trong commit `b46c1c7`. Thiết kế dùng thanh điều hướng trên cùng, menu bên trái, nội dung ở giữa và danh sách kết nối bên phải. Menu ngang phục vụ màn hình nhỏ. Các trang dùng chung [SocialLayout.tsx](../src/layouts/SocialLayout.tsx).

## Hợp đồng backend

Nguồn đối chiếu là [requirements.md](../requirements.md), [tài liệu màn hình](../t_i_li_u_to_n_di_n_s_lu_ng_m_n_h_nh_mermaid_code.md) và [OpenAPI của staging](https://snsqb.duckdns.org/api/v1/docs/openapi.json).

| Chức năng | API | Giao diện |
| --- | --- | --- |
| Bảng tin cá nhân hóa | `GET /activity-feeds` | `/feed`; lấy chi tiết bài viết để kiểm tra quyền truy cập trước khi render |
| Bài viết của tôi | `GET /posts/me` | Tab bài viết của tôi |
| Phát hiện hoạt động mới | `GET /activity-feeds/new-count` | Dùng `since` là epoch milliseconds; cập nhật mốc sau khi làm mới thành công |
| Tạo, đọc, sửa, xóa bài | `POST /posts`, `GET/PUT/DELETE /posts/{id}` | Khung soạn thảo, menu của tác giả và hộp xác nhận xóa |
| Ghi chú giảng viên | `PUT /posts/{id}/lecturer-notes` | Menu dành cho giảng viên |
| Bình luận, trả lời, sửa, xóa | `GET/POST /comments`, `PUT/DELETE /comments/{commentId}` | Bình luận phân cấp, ảnh đính kèm, thứ tự mới/cũ, phân trang và giữ bản nháp khi thất bại |
| Cảm xúc | `POST /react` | Dùng `my_reaction` và `total_count` từ phản hồi; đổi loại giữ nguyên tổng số |
| Hồ sơ | `GET/PUT /users/me`, `GET /users/{userId}` | Thông tin, ảnh đại diện/ảnh bìa, tiểu sử, giới tính, ngày sinh và múi giờ |
| Bài viết trên hồ sơ | `GET /users/{userId}/posts` | Phân trang trên dòng thời gian |
| Huy hiệu | `GET /badges/me`, `GET /badges/users/{userId}` | Bộ sưu tập huy hiệu trên hồ sơ |
| Bạn bè | `GET /friendships`, `GET /friendships/requests/received`, `GET /friendships/requests/sent` | Các tab kết nối với phân trang |
| Thao tác kết bạn | `POST /friendships/request`, `POST /friendships/accept`, `POST /friendships/decline`, `DELETE /friendships/{friendId}` | Hồ sơ và danh sách lời mời; gửi lời mời theo điều kiện đồng cấp |
| Theo dõi | `POST/DELETE /follows/{targetUserId}`, `GET /follows/following`, `GET /follows/followers` | Hồ sơ và hai tab theo dõi |
| Chặn | `POST/DELETE /blocks/{targetUserId}`, `GET /blocks` | Hồ sơ, hộp xác nhận và tab đã chặn |
| Trạng thái quan hệ | `GET /users/{userId}/relationship-stats` | Đồng bộ các nút kết bạn/theo dõi/chặn |
| Tìm kiếm | `GET /search` | Sáu loại: ALL, POST, USER, QUESTION, SESSION, SUBJECT; phân trang bằng `after` |
| Lịch sử và thịnh hành | `GET/POST /search/saved`, `DELETE /search/saved/{id}` | Chỉ ghi lịch sử khi người dùng xác nhận tìm kiếm |
| Báo cáo | `POST /report` | Báo cáo bài viết, bình luận hoặc người dùng |
| Media | `POST /medias/presign`, `POST /medias/verify`, `POST /medias/upload` | Upload, kiểm tra giới hạn 15 MB và dự phòng multipart |
| Liên kết nhắn tin | `GET /conversations`, `POST /conversations/direct`, `GET /conversations/{id}/messages`, `DELETE /messages/{id}` | `/messages?userId=...`; người dùng chủ động mở cuộc trò chuyện; gửi nội dung qua STOMP |

Các danh sách Zone 2 chuyển `cursor` của hook sang tham số `after` của backend. Tìm kiếm gửi `query`; lấy bình luận gửi `target_type`, `target_id`, `parent_comment_id`. Thu hồi tin nhắn gửi JSON `{ "scope": "ME" }` hoặc `{ "scope": "EVERYONE" }`.

Các query thường và query phân trang dùng key riêng. Bài vừa tạo nằm trong cache riêng, không ghi dữ liệu `{ items }` vào cache `{ pages, pageParams }`.

Cấu hình mẫu dùng `VITE_API_URL=/api/v1` và `API_PROXY_TARGET` trong môi trường phát triển. Proxy Vite giữ Origin khớp với Host của upstream để các thao tác POST/PUT/DELETE không bị Spring từ chối vì CORS. Khi triển khai production, cấu hình reverse proxy `/api/v1` hoặc đặt API URL và cho phép origin của frontend tại backend; proxy Vite chỉ chạy trong môi trường phát triển.

Server cung cấp SockJS tại `/api/v1/ws` (gốc trả `Welcome to SockJS!`, `/info` xác nhận hỗ trợ WebSocket). Client STOMP native kết nối transport `/api/v1/ws/websocket`, qua proxy WebSocket của Vite khi phát triển. Có thể đặt `VITE_WS_URL` nếu hạ tầng triển khai dùng URL khác. Kết nối được ngắt khi đăng xuất.

Quản lý nhóm chat, cài đặt tài khoản, thông báo, thẩm định và quản trị thuộc các màn hình/phân hệ riêng trong tài liệu màn hình. Route nhắn tin ở đây hoàn thiện liên kết từ Zone 2 và cung cấp danh sách hội thoại, nội dung, gửi văn bản và thu hồi.

## Kiểm thử

```bash
npm run type-check
npm run verify:docs
npm run audit:strict
npm test
npm run build
npm run verify:zone2-server
npm run verify:zone2-server -- --write
npm run test:ui
```

[verify-zone2-server.mjs](../scripts/verify-zone2-server.mjs) dùng cấu hình và tài khoản staging trong README, hoặc biến môi trường `SQB_API_URL`, `SQB_TEST_EMAIL`, `SQB_TEST_PASSWORD`. Script giữ token trong bộ nhớ. Chế độ mặc định chỉ đọc; `--write` tạo bài `ONLY_ME`, kiểm tra sửa bài, bình luận phân cấp, sửa/xóa bình luận, đổi/gỡ cảm xúc rồi dọn bài thử trong `finally`.

[zone2.e2e.mjs](../e2e/zone2.e2e.mjs) chạy desktop và mobile, kiểm tra route, lỗi JavaScript, tràn ngang và vòng đời bài viết qua trình duyệt. Trên Windows, cấu hình mặc định dùng Edge đã cài. Trên hệ điều hành khác, cài Chromium của Playwright hoặc chọn trình duyệt bằng `PLAYWRIGHT_CHANNEL`.

Không tự động gửi tin nhắn, lời mời kết bạn, báo cáo hoặc thay đổi quan hệ của tài khoản khác. Các luồng phân quyền giảng viên/admin cần tài khoản đúng vai trò để kiểm tra end-to-end; unit test và kiểm tra hợp đồng không thay thế xác minh các vai trò này trên staging.
