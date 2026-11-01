import { z } from "zod";

export const priceUpdateSchema = z.object({
  id: z.string().uuid(),
  price: z.number().int().min(0).max(2147483647),
});

export function assertPriceAdmin(isAdmin: boolean) {
  if (!isAdmin) throw new Error("Bạn chưa được cấp quyền quản lý giá.");
}

export function confirmedPriceDescription(description: string) {
  return description.replace(/^Giá minh họa, chưa xác nhận giá bán\.\s*/, "");
}