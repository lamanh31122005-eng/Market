# Cart And Conversation

Dự án thương mại điện tử kết hợp giỏ hàng và trợ lý AI tư vấn đặt hàng.

## Tổng quan

- Giỏ hàng của khách lưu trong browser localStorage để giữ nguyên khi người dùng đăng nhập.
- Trợ lý AI đọc catalog sản phẩm từ dữ liệu server-side và gắn sản phẩm theo định dạng tag như [[slug]].
- Quy trình thanh toán và đơn hàng đặt trong khu vực authenticated.
- Đăng nhập được xử lý qua Supabase Auth, với redirect an toàn qua ?redirect=.

## Mô hình AI sử dụng

Dự án đang dùng mô hình AI sau trong chat assistant:

- OpenAI: openai/gpt-6-astra

Mô hình này được gọi qua AI Gateway trong phần xử lý chatbot, với dữ liệu catalog sản phẩm được chèn vào prompt để hỗ trợ gợi ý và tư vấn mua hàng.

## Tài khoản login ảo / demo

Email: demo@thitsachxanh.vn

Mật khẩu: BepTruong#Sach2026

## Hướng dẫn phát triển

Yêu cầu:
- Node.js
- npm hoặc bun

Cài đặt:

```bash
git clone <repository-url>
cd cart-and-conversation
npm install
npm run dev
