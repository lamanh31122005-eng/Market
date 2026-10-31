import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { ChefHat, Send, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendChat } from "@/lib/chat.functions";
import { productsQuery, type Product } from "@/lib/products.functions";
import { useCart } from "@/lib/cart";
import { formatVnd, getCategory, getProductCategory, getProductImage } from "@/lib/catalog";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Nấu gà kho sả ớt nên chọn phần thịt nào?",
  "Có 200k muốn làm tiệc BBQ bò thì mua gì?",
  "Phí giao hàng và cách đặt hàng thế nào?",
];

function useViewingContext(products: Product[] | undefined) {
  const { pathname } = useLocation();
  const cat = pathname.match(/^\/danh-muc\/([^/]+)/)?.[1];
  if (cat) return `danh mục ${getCategory(cat)?.name ?? cat}`;
  const slug = pathname.match(/^\/san-pham\/([^/]+)/)?.[1];
  if (slug) return `sản phẩm ${products?.find((p) => p.slug === slug)?.name ?? slug}`;
  return undefined;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Xin chào! Mình là **Bếp Trưởng Sạch**. Bạn cần hỏi về sản phẩm, món ăn, đơn hàng hay vấn đề nào khác?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: products } = useQuery(productsQuery);
  const context = useViewingContext(products);
  const { add } = useCart();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => {
    if (open && !loading) inputRef.current?.focus();
  }, [open, loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    const next = [...messages, { role: "user" as const, content: t }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await sendChat({ data: { messages: next.slice(1).slice(-20), context } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Xin lỗi, có lỗi kết nối. Bạn thử lại nhé." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function renderAssistant(content: string) {
    const slugs = Array.from(
      new Set([...content.matchAll(/\[\[([a-z0-9-]+)\]\]/g)].map((m) => m[1])),
    );
    const clean = content.replace(/\s*\[\[[a-z0-9-]+\]\]/g, "");
    const recs = slugs.map((s) => products?.find((p) => p.slug === s)).filter(Boolean) as Product[];
    return (
      <>
        <div className="prose prose-sm max-w-none text-sm leading-relaxed [&_li]:my-0.5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
          <ReactMarkdown>{clean}</ReactMarkdown>
        </div>
        {recs.length > 0 && (
          <div className="mt-2 space-y-2">
            {recs.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-card p-2">
                <img
                  src={getProductImage(p.slug, p.category)}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-meat">
                    {formatVnd(p.price)}/{p.unit}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    add({
                      productId: p.id,
                      slug: p.slug,
                      name: p.name,
                      price: p.price,
                      unit: p.unit,
                    })
                  }
                  className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                >
                  <Plus className="h-3 w-3" /> Thêm vào giỏ
                </Button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          aria-label="Mở trợ lý tư vấn"
          className="fixed bottom-5 right-5 z-40 flex h-auto items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-float transition hover:scale-105"
        >
          <ChefHat className="h-5 w-5" /> Hỏi Bếp Trưởng
        </Button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[min(620px,calc(100vh-2.5rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border bg-background shadow-float">
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
              <ChefHat className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold">Bếp Trưởng Sạch</p>
              <p className="text-xs opacity-80">
                {context ? `Đang xem: ${context}` : "Tư vấn & hỗ trợ khách hàng"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="rounded-full p-1 hover:bg-primary-foreground/15"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div
                  key={i}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                >
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[95%]">
                  {renderAssistant(m.content)}
                </div>
              ),
            )}
            {loading && (
              <div className="flex gap-1 py-2">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </div>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <Button
                    variant="secondary"
                    key={s}
                    onClick={() => send(s)}
                    className="h-auto whitespace-normal rounded-full border bg-secondary px-3 py-1.5 text-left text-xs text-secondary-foreground hover:border-primary"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Nhập câu hỏi của bạn…"
              aria-label="Câu hỏi của bạn"
              maxLength={4000}
              className="max-h-28 min-w-0 flex-1 resize-none rounded-xl border bg-muted px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <Button
              size="icon"
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Gửi"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
