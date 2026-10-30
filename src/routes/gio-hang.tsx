import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatVnd } from "@/lib/catalog";
import { shippingFor, FREE_SHIP_FROM } from "@/lib/orders.functions";

export const Route = createFileRoute("/gio-hang")({
  head: () => ({
    meta: [
      { title: "Giỏ hàng — Thịt Sạch Xanh" },
      { name: "description", content: "Xem lại giỏ hàng và thanh toán." },
      { property: "og:title", content: "Giỏ hàng — Thịt Sạch Xanh" },
      { property: "og:description", content: "Xem lại giỏ hàng và thanh toán." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const ship = shippingFor(total);

  const checkout = () => {
    if (user) navigate({ to: "/thanh-toan" });
    else navigate({ to: "/dang-nhap", search: { redirect: "/thanh-toan" } });
  };

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Giỏ hàng trống</h1>
        <p className="mt-2 text-muted-foreground">Chọn vài món ngon cho bữa tối nhé.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-primary-foreground">Tiếp tục mua sắm</Link>
      </div>
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_340px]">
      <div>
        <h1 className="text-3xl font-semibold">Giỏ hàng</h1>
        <div className="mt-6 divide-y rounded-2xl border bg-card">
          {items.map((i) => (
            <div key={i.productId} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <Link to="/san-pham/$slug" params={{ slug: i.slug }} className="font-medium hover:text-primary">{i.name}</Link>
                <p className="text-sm text-muted-foreground">{formatVnd(i.price)}/{i.unit}</p>
              </div>
              <div className="flex items-center rounded-full border">
                <button onClick={() => setQty(i.productId, i.quantity - 1)} className="p-2" aria-label="Giảm"><Minus className="h-3 w-3" /></button>
                <span className="w-6 text-center text-sm">{i.quantity}</span>
                <button onClick={() => setQty(i.productId, i.quantity + 1)} className="p-2" aria-label="Tăng"><Plus className="h-3 w-3" /></button>
              </div>
              <p className="w-28 text-right font-medium">{formatVnd(i.price * i.quantity)}</p>
              <button onClick={() => setQty(i.productId, 0)} aria-label="Xóa" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex justify-between text-sm"><span>Tạm tính</span><span>{formatVnd(total)}</span></div>
        <div className="mt-2 flex justify-between text-sm"><span>Phí giao hàng</span><span>{ship === 0 ? "Miễn phí" : formatVnd(ship)}</span></div>
        {ship > 0 && <p className="mt-1 text-xs text-muted-foreground">Mua thêm {formatVnd(FREE_SHIP_FROM - total)} để được miễn phí giao hàng</p>}
        <div className="mt-4 flex justify-between border-t pt-4 font-semibold"><span>Tổng</span><span className="text-meat">{formatVnd(total + ship)}</span></div>
        <button onClick={checkout} className="mt-5 w-full rounded-full bg-primary py-3 font-medium text-primary-foreground">Thanh toán</button>
        {!user && <p className="mt-2 text-center text-xs text-muted-foreground">Bạn sẽ đăng nhập trước khi thanh toán, giỏ hàng được giữ nguyên.</p>}
      </aside>
    </div>
  );
}
