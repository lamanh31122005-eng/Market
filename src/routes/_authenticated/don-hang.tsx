import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listMyOrders } from "@/lib/orders.functions";
import { formatVnd } from "@/lib/catalog";

const ordersQuery = queryOptions({ queryKey: ["my-orders"], queryFn: () => listMyOrders() });
const PM: Record<string, string> = { cod: "COD", qr: "Chuyển khoản QR", ewallet: "Ví điện tử" };

export const Route = createFileRoute("/_authenticated/don-hang")({
  head: () => ({
    meta: [
      { title: "Đơn hàng của tôi — Thịt Sạch Xanh" },
      { name: "description", content: "Lịch sử đơn hàng của bạn." },
      { property: "og:title", content: "Đơn hàng — Thịt Sạch Xanh" },
      { property: "og:description", content: "Lịch sử đơn hàng của bạn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(ordersQuery),
  component: Orders,
});

function Orders() {
  const { data } = useSuspenseQuery(ordersQuery);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Đơn hàng của tôi</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground hover:text-primary">Đăng xuất</button>
      </div>
      {data.length === 0 && <p className="mt-6 text-muted-foreground">Bạn chưa có đơn hàng nào.</p>}
      <div className="mt-6 space-y-4">
        {data.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-card p-5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{new Date(o.created_at).toLocaleString("vi-VN")} · {PM[o.payment_method] ?? o.payment_method}</span>
              <span className="rounded-full bg-secondary px-2 text-secondary-foreground">{o.status === "pending" ? "Đang xử lý" : o.status}</span>
            </div>
            <ul className="mt-3 text-sm">
              {o.order_items.map((i, k) => <li key={k}>{i.product_name} × {i.quantity}</li>)}
            </ul>
            <p className="mt-3 font-semibold text-meat">{formatVnd(o.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
