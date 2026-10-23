# SQB HUST Frontend Mandatory AI Agent Rules (`AGENTS.md`)

> **Chỉ thị Cốt lõi dành cho Toàn bộ AI Coding Assistants & Subagents**  
> Áp dụng cho: Antigravity IDE, Claude Code, GitHub Copilot, và các công cụ phát triển AI trong kho lưu trữ `Social-network-for-student-Generated-Question-Bank`.

---

## 1. Tháp Ngữ Nghĩa & UI Primitives (Semantic Hierarchy)

- **TUYỆT ĐỐI CẤM** dùng trực tiếp các thẻ HTML tương tác nguyên bản trên Pages và High-level Components:
  - ❌ CẤM `<button>` ➔ ✅ BẮT BUỘC dùng `<Button>`, `<SubmitButton>`, hoặc `<BackButton>`.
  - ❌ CẤM `<a href="...">` ➔ ✅ BẮT BUỘC dùng `<ButtonLink to="...">` (nội bộ SPA) hoặc `<ButtonAnchor href="..." target="_blank" rel="noopener noreferrer">` (liên kết ngoài).
  - ❌ CẤM `<form>` ➔ ✅ BẮT BUỘC dùng `<Form onSubmit={handleSubmit} noValidate>`.
- **TUYỆT ĐỐI CẤM** dùng thẻ non-semantic (`<div>`, `<span>`, `<b>`, `<i>`, `<u>`) thiếu chú thích ngoại lệ có cấu trúc:
  - Thay thế bằng thẻ ngữ nghĩa: `<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<article>`, `<footer>`, `<p>`, `<strong>`, `<em>`...
  - Hoặc UI Primitives: `<Page>`, `<Card as="article">`, `<Card as="section">`, `<Badge>`, `<Separator>`, `<Icon>`...
  - **Bắt buộc cú pháp ngoại lệ có cấu trúc nếu dùng div/span**: `{/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Lý do kỹ thuật cụ thể] */}` ngay liền kề.

---

## 2. Kỷ Luật Màu Sắc & Cấm Tuyệt Đối Mã Màu Thô Trong JSX/TSX

- **CSS Stylesheets (`src/styles/`)**: Mọi thuộc tính màu bắt buộc dùng mã **HEX**:
  - **6-digit HEX** cho màu đặc (`#06c384`, `#ffffff`, `#080e0b`).
  - **8-digit HEX** cho màu có độ trong suốt (`#0c1611d1`, `#ffffff12`, `#42e09e1a`).
  - **CẤM TRIỆT ĐỂ**: `rgba()`, `rgb()`, `hsla()`, `hsl()`, `color-mix()`, và mã 3-digit shorthand `#fff`.
- **JSX / TSX Components**: **TUYỆT ĐỐI CẤM MÃ MÀU THÔ (HEX, RGB, RGBA, HSL)**:
  - ❌ CẤM Tailwind arbitrary color: `bg-[#0f1c16]`, `text-[rgb(6,195,132)]`, `border-[rgba(...)]`.
  - ❌ CẤM Inline style color: `style={{ color: '#06c384' }}`, `style={{ backgroundColor: '...' }}`.
  - ❌ CẤM Props màu trực tiếp: `fill="#..."`, `stroke="#..."`.
  - ✅ BẮT BUỘC dùng: Semantic Tailwind tokens (`bg-card`, `text-primary`, `border-border`), CSS Variables (`var(--rogym-*)`), hoặc `TOKEN_COLORS` từ `@/styles/token-values` (cho Canvas / Recharts).

---

## 3. Kiến Trúc Form, State & Clean Code

- **Clean Visual Architecture**:
  - ❌ CẤM Magic Dimensions / Arbitrary Spacing (`w-[327px]`, `p-[19px]`): Dùng Spacing Scale 8pt (`p-4`, `h-11`) hoặc layout variables.
  - ❌ CẤM Magic Z-Index (`z-[9999]`, `z-[100]`): Dùng thang 5 tầng chuẩn (`z-0`, `z-10`, `z-20`, `z-50`, `z-100`).
  - ❌ CẤM nhúng raw `<svg>` trực tiếp trên page: Bắt buộc dùng `lucide-react` hoặc UI primitive `<Icon>`.
  - ❌ CẤM hardcode URL API (`/api/v1/...`): Bắt buộc gọi qua Services và custom Query hooks.
  - ❌ CẤM Falsy leakage (`items.length && <Component />`): Bắt buộc viết `{items.length > 0 ? <Component /> : null}`.
  - ⚠️ Giới hạn File Size: File component `.tsx` tối đa 250 dòng vật lý; JSX nesting depth <= 4, prop drilling <= 2.
- **Form**: Dùng bộ ba `<Form>`, `<FormField>`, `<SubmitButton>`. Tích hợp xóa lỗi khi người dùng gõ phím (On-input Error Clearing).
- **Server State**: Bắt buộc dùng TanStack Query v5 kết hợp factory `@/lib/query-keys`. Cấm fetch API trực tiếp trong `useEffect`.
- **Derived State**: Tính toán trực tiếp trong render. Không dùng `useEffect` sao chép state phụ; không dùng `useMemo` sớm cho biểu thức tính toán đơn giản.

---

## 4. Đa Ngôn Ngữ (i18n), Ngày Tháng & Toast

- **i18n**: Dùng `useTranslation()` (`t('key')`). **CẤM hardcode raw text hiển thị** trong JSX trên pages.
- **Ngày tháng**: Dùng formatters từ `@/utils/date` (`formatDate`, `formatDateTime`).
- **Toast & Error**: Dùng `@/lib/toast` (Sonner), parse lỗi từ `@/lib/api-error`. Tuyệt đối cấm `console.log`.
- **Touch Targets**: Kích thước tương tác tối thiểu **44x44px** (`min-h-[44px]`).

---

## 5. Tiêu Chuẩn Kiểm Thử & Kiểm Soát Chất Lượng

- Vitest 2.1: Ưu tiên `getByRole` có accessible name. Cấm lạm dụng `getByTestId`.
- **Hệ thống 19 Rules Kiểm Toán Tĩnh & Baseline Snapshot**:
  - Boy Scout Rule: `audit:strict` cấm phát sinh bất kỳ lỗi ERROR mới nào so với baseline.
- **Bắt buộc chạy kiểm tra tự động trước khi hoàn tất**:
  ```bash
  npm run verify:docs
  npm run audit:strict
  npm test
  ```

---

## 6. Quy Chuẩn Tài Liệu Markdown & Biểu Đồ Mermaid

- **CẤM TUYỆT ĐỐI đường dẫn tuyệt đối**: Không dùng `file:///...`, `c:/...`, `C:\...` trong bất kỳ file tài liệu `.md` nào. Bắt buộc dùng đường dẫn tương đối (Relative Paths) tính từ vị trí tệp hiện tại (ví dụ: `src/components/ui/actions/Button.tsx`).
- **Đồng bộ nhãn và liên kết**: Nhãn hiển thị phải đồng bộ với đích trỏ.
- **Mermaid Syntax Safety**: Bọc nhãn node có chứa ngoặc đơn trong `["..."]` và nhãn cạnh `|...|` trong `|"..."|` để triệt tiêu lỗi cú pháp Mermaid.
- Tham chiếu chi tiết: [`.agents/rules/markdown-standards.md`](.agents/rules/markdown-standards.md).

> Tra cứu cẩm nang hướng dẫn đầy đủ qua skill `sqb-frontend-conventions` hoặc tài liệu [`FRONTEND_CONVENTIONS.md`](FRONTEND_CONVENTIONS.md).
