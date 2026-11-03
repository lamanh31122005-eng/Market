# Cart And Conversation

Ứng dụng thương mại điện tử bán thực phẩm, tích hợp giỏ hàng và trợ lý AI tư vấn sản phẩm, món ăn và đặt hàng.

## Tính năng chính

- Giỏ hàng được lưu trong `localStorage`, nên khách có thể giữ giỏ hàng khi đăng nhập.
- Trợ lý AI nhận catalog sản phẩm từ server và gắn sản phẩm bằng tag `[[slug]]`; giao diện hiển thị thẻ sản phẩm để thêm vào giỏ.
- Catalog, giá và gợi ý sản phẩm được lấy từ dữ liệu của ứng dụng. Nếu không xác minh được catalog, trợ lý không nên tự suy đoán giá hoặc giới thiệu sản phẩm không tồn tại.
- Thanh toán và xem đơn hàng yêu cầu đăng nhập. Sau khi đăng nhập, ứng dụng chuyển người dùng về đường dẫn được yêu cầu thông qua redirect đã được kiểm tra an toàn.
- Quản lý giá dành riêng cho tài khoản có quyền quản trị viên.

## Mô hình và cách tích hợp AI

Chatbot hiện sử dụng **Cloudflare Workers AI `@cf/meta/llama-3.1-8b-instruct`**, gọi từ server qua connector gateway của Lovable. Đây không phải mô hình OpenAI.

Luồng xử lý khái quát:

1. Server đọc catalog sản phẩm bằng publishable client theo từng request.
2. Thông tin sản phẩm và quy tắc trả lời được đưa vào system prompt cùng nội dung hội thoại.
3. Server gọi mô hình Cloudflare qua gateway; khóa kết nối chỉ được dùng phía server.
4. Các tag sản phẩm không hợp lệ được lọc trước khi trả lời về giao diện.

Các biến môi trường server cần thiết cho tích hợp chatbot gồm `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `LOVABLE_API_KEY` và `CLOUDFLARE_API_KEY`. Không đưa khóa bí mật vào mã nguồn công khai hoặc biến môi trường phía trình duyệt.

## Tài khoản demo và đăng nhập

Ứng dụng dùng **Supabase Auth**; tài khoản demo không phải tài khoản đăng nhập giả được tạo sẵn trong mã nguồn. Để thử đăng nhập, hãy tạo hoặc xác nhận một người dùng demo trong Supabase Dashboard tại **Authentication → Users**, sau đó đăng nhập bằng email và mật khẩu đã thiết lập.

Thông tin đăng nhập demo không được lưu trong README hoặc Git. Nếu tài khoản demo cũ từng được chia sẻ công khai, hãy đổi mật khẩu hoặc vô hiệu hóa tài khoản đó trước khi triển khai thật. Tài khoản demo thông thường không mặc nhiên có quyền quản trị viên.

## Quyền quản trị viên

Trang quản lý giá nằm tại `/quan-ly-gia` và yêu cầu người dùng đăng nhập. Quyền được xác minh phía server qua role `admin` trong cơ sở dữ liệu; chỉ tài khoản được cấp role này mới có thể đọc dữ liệu quản lý và cập nhật giá. Các thay đổi giá được kiểm tra ở server và cơ sở dữ liệu, không dựa vào việc ẩn/hiện nút trên giao diện.

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
