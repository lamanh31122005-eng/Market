import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
    const gatewayBase = (process.env['CONNECTOR_GATEWAY_BASE_URL'] ?? "https://connector-gateway.lovable.dev").replace(/\/$/, "");
    const lovableKey = process.env['LOVABLE_API_KEY'];
    const cfKey = process.env['CLOUDFLARE_API_KEY'];
    if (!lovableKey || !cfKey) {
      console.error("Missing Cloudflare connector credentials");
      return { reply: "Xin lỗi, trợ lý đang gặp sự cố. Bạn thử lại sau nhé." };
    }
    try {
      const res = await fetch(
        `${gatewayBase}/cloudflare/client/v4/accounts/b909697c69c79f4e41437163d5273d0b/ai/run/@cf/meta/llama-3.1-8b-instruct`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": cfKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: instructions },
              ...data.messages.map((m) => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 1024,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.text();
        console.error(`Cloudflare AI failed [${res.status}]: ${body}`);
        return { reply: res.status === 429 ? "Hệ thống đang bận, bạn thử lại sau ít phút nhé." : "Xin lỗi, trợ lý đang gặp sự cố. Bạn thử lại sau nhé." };
      }
      const json = (await res.json()) as {
        success?: boolean;
        errors?: { message?: string }[];
        result?: { response?: string; choices?: { message?: { content?: string } }[] };
      };
      if (!json.success) {
        console.error(`Cloudflare AI error: ${json.errors?.[0]?.message}`);
        return { reply: "Xin lỗi, trợ lý đang gặp sự cố. Bạn thử lại sau nhé." };
      }
      const text = json.result?.response ?? json.result?.choices?.[0]?.message?.content ?? "";
      return { reply: retainCatalogTags(text, (products ?? []).map((p) => p.slug)) || "Xin lỗi, mình chưa trả lời được. Bạn hỏi lại nhé!" };
    } catch (e) {
      console.error(e);
      return { reply: "Xin lỗi, trợ lý đang gặp sự cố. Bạn thử lại sau nhé." };
    }
  });
