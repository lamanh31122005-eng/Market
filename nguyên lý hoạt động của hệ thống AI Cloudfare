# nguyên lý hoạt động của hệ thống AI Cloudfare

Ứng dụng thương mại điện tử bán thực phẩm, tích hợp giỏ hàng và trợ lý AI tư vấn sản phẩm, món ăn và đặt hàng.

## Tính năng chính

- Giỏ hàng được lưu trong `localStorage`, nên khách có thể giữ giỏ hàng khi đăng nhập.
- Trợ lý AI nhận catalog sản phẩm từ server và gắn sản phẩm bằng tag `[[slug]]`; giao diện hiển thị thẻ sản phẩm để thêm vào giỏ.
- Catalog, giá và gợi ý sản phẩm được lấy từ dữ liệu của ứng dụng. Nếu không xác minh được catalog, trợ lý không nên tự suy đoán giá hoặc giới thiệu sản phẩm không tồn tại.
- Thanh toán và xem đơn hàng yêu cầu đăng nhập. Sau khi đăng nhập, ứng dụng chuyển người dùng về đường dẫn được yêu cầu thông qua redirect đã được kiểm tra an toàn.
- Quản lý giá dành riêng cho tài khoản có quyền quản trị viên.

## Mô hình và cách tích hợp AI

Chatbot hiện sử dụng **Cloudflare Workers AI `@cf/meta/llama-3.1-8b-instruct`**, gọi trực tiếp từ server qua Cloudflare API. Chatbot không phụ thuộc Lovable AI connector.

Luồng xử lý khái quát:

1. Server đọc catalog sản phẩm bằng publishable client theo từng request.
2. Thông tin sản phẩm và quy tắc trả lời được đưa vào system prompt cùng nội dung hội thoại.
3. Server gọi Cloudflare API bằng `CLOUDFLARE_API_KEY`; token chỉ được dùng phía server.
4. Các tag sản phẩm không hợp lệ được lọc trước khi trả lời về giao diện.

Các biến môi trường server cần thiết cho tích hợp chatbot gồm `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` và `CLOUDFLARE_API_KEY`. Cloudflare token cần quyền chạy Workers AI. Không đưa khóa bí mật vào mã nguồn công khai hoặc biến môi trường phía trình duyệt.

## Tài khoản demo và đăng nhập

Tài khoản login ảo / demo

Email: demo@thitsachxanh.vn
Mật khẩu: BepTruong#Sach2026

## Quyền quản trị viên

Tài khoản quản trị viên

Email: admin@thitsachxanh.vn
Mật khẩu: QuanTri#XanhSach2026

Để chuẩn bị tài khoản admin:

1. Tạo hoặc chọn một tài khoản trong Supabase Auth.
2. Cấp role `admin` cho đúng user thông qua quy trình quản trị database đã cấu hình cho dự án.
3. Đăng nhập bằng tài khoản đó và kiểm tra trang `/quan-ly-gia`.
4. Không cấp quyền admin cho tài khoản demo dùng chung; không đưa mật khẩu hoặc khóa service-role vào repository.

Nếu chưa cấu hình role `admin` trong database, tài khoản đã đăng nhập vẫn sẽ thấy thông báo chưa có quyền quản lý giá.

## Phát triển cục bộ

Yêu cầu: Node.js và npm hoặc bun.

```bash
git clone <repository-url>
cd cart-and-conversation
npm install
npm run dev
```

Cấu hình các biến môi trường Supabase và chatbot cần thiết trong môi trường server trước khi kiểm thử các tính năng tương ứng. Không commit file chứa bí mật.
