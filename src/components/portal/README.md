# Zone 2: Social & Communications

## Phạm vi

| Màn hình / popup | Điểm vào |
| --- | --- |
| SCR-07: Hộp thư | `/messages` |
| SCR-08: Kho hội thoại ẩn | `/messages/hidden-vault` |
| SCR-10: Cài đặt cá nhân và thiết bị | `/settings` |
| SCR-11: Trung tâm thông báo | `/notifications` |
| MODAL-02: Quản trị nhóm | Nút cài đặt trong hội thoại nhóm |
| MODAL-03: Báo cáo | Popup dùng chung của bài viết, bình luận, hồ sơ và người gửi tin nhắn |
| MODAL-04: PIN | Kho hội thoại ẩn và Cài đặt > Bảo mật |

## Tổ chức mã nguồn

- [Components](./): hộp thoại dùng Sheet/Radix để giữ focus, Escape và khôi phục focus; danh sách hội thoại, khung tin nhắn, bộ chọn người dùng.
- [Pages](../../pages/messages/MessagesPage.tsx): điều phối route; các trang thông báo và cài đặt nằm cạnh thư mục messages.
- [Query hooks](../../hooks/queries/usePortalQuery.ts): API state, phân trang cursor, invalidation và AbortSignal.
- [Realtime hook](../../hooks/useChatRealtime.ts): kết nối STOMP và cập nhật query cache.
- [Styles](../../styles/portal.css): bố cục hộp thư dùng semantic tokens; các primitive và thành phần khác dùng hệ thống styles có sẵn.
- [Bản dịch](../../locales/vi/portal.json): namespace portal; có bản tiếng Nhật tương ứng.

Các bộ lọc thông báo, tab cài đặt và hội thoại được chọn nằm trong URL. Dữ liệu máy chủ nằm trong TanStack Query. Các form chỉ giữ bản nháp cục bộ.

## Kho hội thoại ẩn

Không tải danh sách kho trước khi máy chủ xác thực PIN thành công. PIN không được lưu vào storage, URL hay query keys. Khi rời trang hoặc khóa kho, dữ liệu tin nhắn đã tải được loại khỏi cache. Cổng PIN phía client bổ sung trải nghiệm; backend vẫn phải kiểm tra quyền truy cập ở mọi request.

## Xác minh

- `npm run verify:docs`
- `npm run audit:strict`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`

Các test trong thư mục này bao phủ PIN sai/không khớp, cổng kho ẩn, báo cáo thất bại rồi thử lại, phân quyền quản trị nhóm, đọc thông báo và xác nhận đăng xuất thiết bị. Bản kiểm tra trình duyệt dùng API giả lập, không thay đổi dữ liệu backend thật. Cần kiểm thử tích hợp riêng với phiên đăng nhập hợp lệ để xác nhận STOMP, lưu PIN và chính sách quyền của server.
