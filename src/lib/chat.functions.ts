import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { supabase } from "@/integrations/supabase/client";
import { CHATBOT_SYSTEM_PROMPT } from "./chat-prompt";

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
    const { data: products } = await supabase.from("products").select("slug,name,category,price,unit,cooking_tips");
    const catalog = (products ?? [])
      .map((p) => `- ${p.slug} | ${p.name} | ${p.category} | ${p.price}đ/${p.unit} | hợp: ${p.cooking_tips}`)
      .join("\n");
    const instructions = `${CHATBOT_SYSTEM_PROMPT}\n\nDANH MỤC (slug | tên | loại | giá | món phù hợp):\n${catalog}${
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
      return { reply: text || "Xin lỗi, mình chưa trả lời được. Bạn hỏi lại nhé!" };
    } catch (e) {
      console.error(e);
      if (e instanceof GatewayError && e.code === "rate_limited")
        return { reply: "Hệ thống đang bận, bạn thử lại sau ít phút nhé." };
      return { reply: "Xin lỗi, trợ lý đang gặp sự cố. Bạn thử lại sau nhé." };
    }
  });
