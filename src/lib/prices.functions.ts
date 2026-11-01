import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPriceAdmin, confirmedPriceDescription, priceUpdateSchema } from "./price-management";

export const getPriceManagement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error) throw new Error("Không thể kiểm tra quyền quản lý.");
    if (!role) return { allowed: false, products: [] };
    const { data, error: readError } = await context.supabase.from("products").select("id,slug,name,category,price,unit,description,cooking_tips").order("category").order("name");
    if (readError) throw new Error("Không thể tải sản phẩm.");
    return { allowed: true, products: data ?? [] };
  });

export const priceManagementQuery = queryOptions({ queryKey: ["price-management"], queryFn: () => getPriceManagement() });

export const updateProductPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => priceUpdateSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: role, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error) throw new Error("Không thể kiểm tra quyền quản lý.");
    assertPriceAdmin(role === true);
    const { data: product, error: readError } = await context.supabase.from("products").select("description").eq("id", data.id).single();
    if (readError || !product) throw new Error("Sản phẩm không tồn tại.");
    const { data: saved, error: saveError } = await context.supabase.from("products").update({ price: data.price, description: confirmedPriceDescription(product.description) }).eq("id", data.id).select("id,price").single();
    if (saveError || !saved) throw new Error("Chưa lưu được giá. Vui lòng thử lại.");
    return saved;
  });