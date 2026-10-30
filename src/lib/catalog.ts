import bo from "@/assets/cat-bo.jpg";
import lon from "@/assets/cat-lon.jpg";
import ga from "@/assets/cat-ga.jpg";
import cheBien from "@/assets/cat-che-bien.jpg";

export const CATEGORIES = [
  { slug: "bo", name: "Thịt bò", tagline: "Bắp, dẻ sườn, thăn, bò nhập khẩu", image: bo },
  { slug: "lon", name: "Thịt lợn", tagline: "Ba chỉ, sườn non, nạc vai, chân giò", image: lon },
  { slug: "ga", name: "Thịt gà", tagline: "Gà ta, đùi, ức, cánh, lòng gà", image: ga },
  { slug: "che-bien", name: "Chế biến sẵn", tagline: "Giò lụa, lạp xưởng, chả lá lốt", image: cheBien },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}

export const SHIPPING_FEE = 30000;
export const FREE_SHIP_FROM = 500000;
export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIP_FROM ? 0 : SHIPPING_FEE;
}
