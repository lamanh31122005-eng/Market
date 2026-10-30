import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9+ ]{9,15}$/),
  address: z.string().trim().min(5).max(300),
  note: z.string().max(500).optional(),
  payment_method: z.enum(["cod", "qr", "ewallet"]),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).min(1),
});

export const SHIPPING_FEE = 30000;
export const FREE_SHIP_FROM = 500000;
export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIP_FROM ? 0 : SHIPPING_FEE;
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const ids = data.items.map((i) => i.productId);
    const { data: products, error: pErr } = await supabase.from("products").select("id,name,price").in("id", ids);
    if (pErr) throw new Error(pErr.message);
    const lines = data.items.map((i) => {
      const p = products!.find((x) => x.id === i.productId);
      if (!p) throw new Error("Sản phẩm không tồn tại");
      return { product_id: p.id, product_name: p.name, price: p.price, quantity: i.quantity };
    });
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const total = subtotal + shippingFor(subtotal);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        note: data.note ?? null,
        payment_method: data.payment_method,
        total,
      })
      .select("id,total")
      .single();
    if (error) throw new Error(error.message);
    const { error: iErr } = await supabase.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (iErr) throw new Error(iErr.message);
    return order;
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id,total,status,payment_method,created_at,order_items(product_name,quantity,price)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });
