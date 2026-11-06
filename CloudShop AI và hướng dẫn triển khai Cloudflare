# AGENTS.md — CloudShop AI và hướng dẫn triển khai Cloudflare

Tài liệu này ghi lại các quy tắc quan trọng khi phát triển ứng dụng và hướng dẫn triển khai CloudShop AI lên Cloudflare. Hãy cập nhật tài liệu này khi thay đổi adapter, cấu hình runtime, tên biến môi trường hoặc quy trình deploy.

## Tổng quan dự án

- Ứng dụng thương mại điện tử dùng React, TanStack Start, Vite và Supabase.
- Dự án có server-side rendering và server functions. Đây **không phải** ứng dụng Vite tĩnh chỉ cần upload thư mục `dist` lên Cloudflare Pages.
- `vite.config.ts` dùng `@lovable.dev/vite-tanstack-config`. Cấu hình đó đã tích hợp TanStack Start, React, Tailwind, alias và Nitro; phần chú thích hiện tại cho biết Nitro dùng Cloudflare làm target mặc định. `src/server.ts` là server entry tùy chỉnh để xử lý lỗi SSR.
- `package.json` hiện có `npm run build` (`vite build`), nhưng chưa khai báo script `deploy`/`preview` cho Cloudflare và cây mã nguồn hiện chưa có `wrangler.toml`, `wrangler.jsonc` hay `wrangler.json` được commit. Không giả định các file hoặc lệnh đó đã tồn tại.

## Quy tắc nghiệp vụ cần giữ

- Giỏ hàng nằm trong browser `localStorage` (`src/lib/cart.tsx`) để khách giữ được giỏ hàng qua đăng nhập. Tổng đơn phải được tính lại phía server trong `placeOrder`; không tin tổng tiền do trình duyệt gửi.
- Chatbot trong `src/lib/chat.functions.ts` gọi Cloudflare Workers AI qua Cloudflare API, dùng model `@cf/meta/llama-3.1-8b-instruct`, không phụ thuộc Lovable AI connector.
- Chatbot đọc catalog bằng Supabase publishable client theo từng request. Prompt phải buộc mô hình chỉ dùng sản phẩm/giá đã xác minh được; lọc tag `[[slug]]` theo slug hợp lệ trước khi trả lời.
- Điều hướng danh mục và hình ảnh dùng catalog dùng chung. Danh mục rỗng vẫn có thể hiển thị; không tự tạo sản phẩm hay giá.
- Thanh toán và đơn hàng nằm dưới route `_authenticated`. Redirect sau đăng nhập phải được xác thực bằng `safeRedirect`.
- Quản lý giá phải giữ kiểm tra đăng nhập, role `admin` từ database và quyền cập nhật giới hạn theo cột. Không chỉ ẩn giao diện admin ở client.

## Triển khai CloudShop AI lên Cloudflare Workers

### 1. Chuẩn bị tài khoản và dịch vụ

1. Có tài khoản Cloudflare và quyền tạo Workers, cùng repository GitHub `lamanh31122005-eng/Market`.
2. Chuẩn bị dự án Supabase đã chạy migration cần thiết, bao gồm các migration trong `drizzle/migrations` và cấu hình role admin theo quy trình database của dự án.
3. Tạo Cloudflare API token có quyền sử dụng Workers AI cho account được cấu hình trong `src/lib/chat.functions.ts`. Không commit token hoặc giá trị secret.
4. Ghi lại URL triển khai Worker sau khi tạo; cần cấu hình URL đó trong Supabase Auth.

### 2. Kiểm tra build trước khi kết nối deploy

Dùng phiên bản Node.js được Cloudflare hỗ trợ và cài dependencies theo lockfile của dự án. Với npm:

```bash
npm ci
npm run build
```

Repo hiện có `bun.lock` nhưng không có `package-lock.json`; nếu dùng Bun thì dùng phiên bản Bun tương thích với lockfile và chạy `bun install --frozen-lockfile`, sau đó `bun run build`.

Xác nhận build thành công và xem log/đầu ra Nitro để biết Worker entry, thư mục assets và cấu hình Cloudflare thực tế mà phiên bản hiện tại sinh ra. Không mặc định rằng output là `dist`, `.output/server/index.mjs` hay một đường dẫn khác nếu chưa kiểm chứng trong build này.

### 3. Tạo và cấu hình Cloudflare Worker

1. Trong Cloudflare Dashboard, mở **Workers & Pages** và tạo Worker kết nối repository GitHub này (hoặc dùng quy trình deploy qua Wrangler nếu đã thêm cấu hình Wrangler phù hợp).
2. Chọn nhánh cần triển khai, thường là `main` cho production. Có thể dùng preview deployment cho nhánh/PR khác nếu đã bật trong dự án.
3. Thiết lập build dùng lệnh build của repo (`npm run build`, hoặc lệnh Bun tương ứng nếu hệ thống build được cấu hình dùng Bun).
4. Cấu hình bước deploy theo output Nitro/Cloudflare được tạo bởi đúng phiên bản dependency của repo. Nếu dùng Wrangler, chỉ đặt `main`, assets và các compatibility flags theo entry/output thực tế; không trỏ `main` vào `src/server.ts` hay `@tanstack/react-start/server-entry` một cách tùy ý.
5. Xác nhận Worker thực thi server-side rendering và server functions. Không chọn deploy kiểu static-only Pages hoặc chỉ upload thư mục `dist`; cách đó có thể làm trang có vẻ tải được nhưng API/server functions không hoạt động.
6. Nếu cần thêm `wrangler.jsonc`/`wrangler.toml`, adapter hoặc script deploy, hãy xác minh yêu cầu tương thích với phiên bản `nitro`, Vite và TanStack Start đang khóa trong repo; cập nhật file này cùng thay đổi cấu hình. Không cài thêm `@cloudflare/vite-plugin` hoặc thay adapter Nitro chỉ dựa trên một ví dụ chung, vì có thể tạo plugin/runtime trùng lặp hoặc xung đột.

> Nếu Cloudflare yêu cầu chỉ rõ build output, deploy command, Worker entry hoặc compatibility flags mà repo hiện tại chưa cung cấp, dừng lại để xác minh output Nitro và hướng dẫn Cloudflare tương ứng trước khi điền. Không đoán cấu hình rồi coi đó là deploy đã được kiểm chứng.

### 4. Cấu hình biến môi trường và secrets

Thêm các giá trị ở cấu hình **Worker runtime** (production và preview riêng nếu cần), không đưa secrets vào client bundle:

| Tên | Loại | Dùng cho |
| --- | --- | --- |
| `SUPABASE_URL` | Variable | URL dự án Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | Variable | Publishable/anon key dùng bởi client phù hợp; đây không phải service-role key |
| `CLOUDFLARE_API_KEY` | Secret | Token gọi Cloudflare Workers AI từ server |

Trong dashboard, đặt `CLOUDFLARE_API_KEY` là secret. Có thể dùng Wrangler secret khi dự án đã được cấu hình Wrangler:

```bash
npx wrangler secret put CLOUDFLARE_API_KEY
```

Các biến Supabase phải được cung cấp cho cả runtime phía server nếu server functions đọc chúng. Mã hiện dùng `process.env[...]` trong `src/lib/chat.functions.ts` và các server modules. Hãy xác nhận runtime Nitro/Workers của cấu hình deploy đưa các biến này vào đúng dạng mà `process.env` đọc được; nếu runtime yêu cầu Cloudflare env bindings/context thay vì `process.env`, sửa cách truy cập theo API runtime rồi cập nhật kiểm thử và tài liệu. Không chuyển `CLOUDFLARE_API_KEY` sang biến `VITE_*`, không nhúng token vào `wrangler` `vars`, và không đặt service-role key trong bất kỳ biến phía client nào.

### 5. Cấu hình Supabase cho domain triển khai

Sau khi có domain Worker (và domain riêng nếu có):

1. Trong Supabase Auth, thêm domain production vào Site URL và danh sách Redirect URLs phù hợp với luồng đăng nhập của ứng dụng.
2. Kiểm tra URL callback/redirect dùng HTTPS và khớp domain thực tế; thêm domain preview chỉ khi cần, tránh wildcard rộng không cần thiết.
3. Xác nhận RLS, quyền database, migration admin và CORS nếu dự án có endpoint cấu hình CORS.
4. Dùng tài khoản người dùng thử nghiệm riêng để kiểm tra. Không dùng chung thông tin tài khoản demo trong production.

### 6. Deploy, xác minh và vận hành

Sau deploy, kiểm tra tối thiểu:

- Trang chủ, trang sản phẩm, route danh mục và refresh trực tiếp trên các URL lồng nhau.
- Server functions (đọc sản phẩm, chatbot, đăng nhập, thanh toán/đơn hàng) chạy trên Worker, không chỉ hoạt động trên máy dev.
- Chatbot đọc được catalog; khi thiếu token, lỗi Workers AI hoặc lỗi đọc catalog, không làm lộ secret và không bịa sản phẩm/giá.
- Đăng nhập và redirect an toàn; giỏ hàng được giữ qua đăng nhập; giá/tổng tiền đơn hàng được kiểm tra phía server.
- Tài khoản không phải admin không thể đổi giá; tài khoản admin có role đúng mới thao tác được.
- Cloudflare Worker logs không có lỗi runtime, missing binding, module import hoặc vượt giới hạn CPU/request.

Theo dõi log của deployment cụ thể trong Cloudflare Dashboard. Khi đổi biến môi trường/secret, xác nhận phiên bản Worker mới đang nhận giá trị và redeploy/restart theo yêu cầu nền tảng. Tách cấu hình preview và production, không đưa dữ liệu khách hàng thật vào kiểm thử.

## Bảo mật và dữ liệu nhạy cảm

- Không commit `.env`, token Cloudflare, Supabase service-role key, mật khẩu thật, cookie, session hoặc dữ liệu cá nhân. Nếu secret từng bị commit, thu hồi/rotate ngay; xóa khỏi lịch sử không thay thế việc rotate.
- Không đưa bí mật server vào `VITE_*`; các giá trị có prefix này có thể được bundle cho trình duyệt.
- README hiện có thông tin đăng nhập demo/admin. Trước khi phát hành công khai, bỏ hoặc thay các credential dùng chung, đổi mật khẩu nếu đã được sử dụng, và không cấp role admin cho tài khoản demo.
- Không làm suy yếu RLS, kiểm tra quyền server-side, sanitization redirect hay xác minh tổng tiền để “cho deploy chạy được”.

## Lệnh kiểm tra thường dùng

```bash
npm run build
npm run lint
npm test
```

Không tuyên bố deploy thành công chỉ vì build thành công: cần kiểm tra Worker deployment và các luồng server-side trên URL Cloudflare thực tế.

## Tài khoản login ảo / demo

Email: demo@thitsachxanh.vn
Mật khẩu: BepTruong#Sach2026

## Tài khoản quản trị viên

Email: admin@thitsachxanh.vn
Mật khẩu: QuanTri#XanhSach2026 

