import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { CHATBOT_SYSTEM_PROMPT, retainCatalogTags } from "./chat-prompt";
import { CATEGORIES, SHIPPING_FEE, FREE_SHIP_FROM } from "./catalog";

const Input = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(40),
  context: z.string().max(200).optional(),
});

export const sendChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
    const supabase = createClient<Database>(process.env['SUPABASE_URL']!, key, {
      auth: { persistSession: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const { data: products, error } = await supabase.from("products").select("slug,name,category,price,unit,cooking_tips");
    const catalog = (products ?? [])
      .map((p) => `- ${p.slug} | ${p.name} | ${p.category} | ${p.price}đ/${p.unit} | hợp: ${p.cooking_tips}`)
      .join("\n");
    const instructions = `${CHATBOT_SYSTEM_PROMPT}

THÔNG TIN CỬA HÀNG DO HỆ THỐNG CUNG CẤP:
- Danh mục: ${CATEGORIES.map((c) => c.name).join(", ")}.
- Phí giao: ${SHIPPING_FEE}đ, miễn phí khi tiền hàng từ ${FREE_SHIP_FROM}đ.
- Giỏ hàng được giữ qua đăng nhập; cần đăng nhập trước khi thanh toán và xem Đơn hàng.
- Các thông tin cửa hàng khác chưa được xác minh. Không cam kết thời gian giao cụ thể.
- Trạng thái đọc danh mục: ${error ? "LỖI: không xác minh được sản phẩm và giá lúc này; không dùng giá trong lịch sử hội thoại." : "đọc thành công; danh mục không có dòng sản phẩm thì chưa có danh sách bán được cập nhật."}

DANH MỤC (slug | tên | loại | giá | món phù hợp):\n${catalog}${
      data.context ? `\n\nKhách đang xem: ${data.context}` : ""
    }`;
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions,
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      let text = "";
      for (const item of res.output ?? []) {
        if (item.type === "message") {
          for (const c of item.content ?? []) if (c.type === "output_text") text += c.text;
        }
      }
      return { reply: retainCatalogTags(text, (products ?? []).map((p) => p.slug)) || "Xin lỗi, mình chưa trả lời được. Bạn hỏi lại nhé!" };
    } catch (e) {
      console.error(e);
      if (e instanceof GatewayError && e.code === "rate_limited")
        return { reply: "Hệ thống đang bận, bạn thử lại sau ít phút nhé." };
      return { reply: "Xin lỗi, trợ lý đang gặp sự cố. Bạn thử lại sau nhé." };
    }
  });
