import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Banknote, QrCode, Wallet } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatVnd } from "@/lib/catalog";
import { placeOrder, shippingFor } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/thanh-toan")({
  head: () => ({
    meta: [
      { title: "Thanh toán — Thịt Sạch Xanh" },
      { name: "description", content: "Nhập địa chỉ giao hàng và chọn phương thức thanh toán." },
      { property: "og:title", content: "Thanh toán — Thịt Sạch Xanh" },
      { property: "og:description", content: "Hoàn tất đơn hàng thịt sạch." },
    ],
  }),
  component: Checkout,
});

const METHODS = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: Banknote },
  { id: "qr", label: "Chuyển khoản QR", icon: QrCode },
  { id: "ewallet", label: "Ví điện tử (MoMo, ZaloPay)", icon: Wallet },
] as const;

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("cod");
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", note: "" });
  const [busy, setBusy] = useState(false);
  const ship = shippingFor(total);

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Giỏ hàng trống</h1>
        <Link to="/" className="mt-4 inline-flex text-primary">Về trang chủ</Link>
      </div>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await placeOrder({
        data: { ...form, payment_method: method, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
      });
      clear();
      toast.success("Đặt hàng thành công!");
      navigate({ to: "/don-hang" });
    } catch {
      toast.error("Vui lòng kiểm tra lại thông tin (SĐT 9–15 số, địa chỉ đầy đủ).");
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-xl border bg-muted px-4 py-3 outline-none focus:border-primary";
  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Thanh toán</h1>
        <div className="space-y-3 rounded-2xl border bg-card p-5">
          <p className="font-medium">Địa chỉ giao hàng</p>
          <input required placeholder="Họ và tên" className={field} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input required placeholder="Số điện thoại" className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input required placeholder="Địa chỉ (số nhà, đường, phường, quận)" className={field} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <textarea placeholder="Ghi chú (không bắt buộc)" className={field} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <div className="space-y-3 rounded-2xl border bg-card p-5">
          <p className="font-medium">Phương thức thanh toán</p>
          {METHODS.map(({ id, label, icon: I }) => (
            <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${method === id ? "border-primary bg-secondary" : ""}`}>
              <input type="radio" name="pm" checked={method === id} onChange={() => setMethod(id)} className="accent-primary" />
              <I className="h-5 w-5 text-primary" /> {label}
            </label>
          ))}
          {method !== "cod" && <p className="text-xs text-muted-foreground">Mã QR / liên kết thanh toán sẽ được gửi sau khi bạn đặt hàng.</p>}
        </div>
      </div>
      <aside className="h-fit rounded-2xl border bg-card p-5 shadow-soft">
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between py-1 text-sm">
            <span>{i.name} × {i.quantity}</span>
            <span>{formatVnd(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t pt-3 text-sm"><span>Phí giao hàng</span><span>{ship === 0 ? "Miễn phí" : formatVnd(ship)}</span></div>
        <div className="mt-2 flex justify-between font-semibold"><span>Tổng</span><span className="text-meat">{formatVnd(total + ship)}</span></div>
        <button disabled={busy} className="mt-5 w-full rounded-full bg-primary py-3 font-medium text-primary-foreground disabled:opacity-50">
          {busy ? "Đang đặt hàng…" : "Đặt hàng"}
        </button>
      </aside>
    </form>
  );
}
