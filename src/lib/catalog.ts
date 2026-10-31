import bo from "@/assets/cat-bo.jpg";
import lon from "@/assets/cat-lon.jpg";
import ga from "@/assets/cat-ga.jpg";
import cheBien from "@/assets/cat-che-bien.jpg";
import rauCu from "@/assets/cat-rau-cu.jpg";
import giaVi from "@/assets/cat-gia-vi.jpg";
import bapBo from "@/assets/bap-bo.png";
import thanBo from "@/assets/than-bo.png";
import deSuonBo from "@/assets/de-suon-bo.png";
import baChiBo from "@/assets/ba-chi-bo.png";
import boXay from "@/assets/bo-xay.png";
import baChiLon from "@/assets/ba-chi-lon.png";
import suonLon from "@/assets/suon-lon.png";
import nacVai from "@/assets/nac-vai.png";
import chanGio from "@/assets/chan-gio.png";
import moLon from "@/assets/mo-lon.png";
import gaTa from "@/assets/ga-ta.png";
import duiGa from "@/assets/dui-ga.png";
import ucGa from "@/assets/uc-ga.png";
import canhGa from "@/assets/canh-ga.png";
import longGa from "@/assets/long-ga.png";
import gioLua from "@/assets/gio-lua.png";
import lapXuong from "@/assets/lap-xuong.png";
import chaLaLot from "@/assets/cha-la-lot.png";
import gioThu from "@/assets/gio-thu.png";
import thitNguoi from "@/assets/thit-nguoi.png";
import xucXich from "@/assets/xuc-xich.png";

export const CATEGORIES = [
  { slug: "bo", name: "Thịt bò", tagline: "Bắp, dẻ sườn, thăn, bò nhập khẩu", image: bo },
  { slug: "lon", name: "Thịt lợn", tagline: "Ba chỉ, sườn non, nạc vai, chân giò", image: lon },
  { slug: "ga", name: "Thịt gà", tagline: "Gà ta, đùi, ức, cánh, lòng gà", image: ga },
  {
    slug: "che-bien",
    name: "Chế biến sẵn",
    tagline: "Giò lụa, lạp xưởng, chả lá lốt",
    image: cheBien,
  },
  { slug: "rau-cu", name: "Rau củ", tagline: "Rau xanh và củ quả", image: rauCu },
  { slug: "gia-vi", name: "Gia vị", tagline: "Gia vị cho bữa cơm Việt", image: giaVi },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

const PRODUCT_CATEGORIES: Record<string, CategorySlug> = {
  "bap-bo": "bo",
  "de-suon-bo": "bo",
  "than-bo": "bo",
  "bo-xay": "bo",
  "ba-chi-bo-my": "bo",
  "ba-chi-lon": "lon",
  "suon-non": "lon",
  "nac-vai": "lon",
  "chan-gio": "lon",
  "mo-lon": "lon",
  "ga-nguyen-con": "ga",
  "dui-ga": "ga",
  "uc-ga": "ga",
  "canh-ga": "ga",
  "long-ga": "ga",
  "gio-lua": "che-bien",
  "gio-thu": "che-bien",
  "xuc-xich": "che-bien",
  "thit-nguoi": "che-bien",
  "lap-xuong": "che-bien",
  "cha-la-lot": "che-bien",
};

const PRODUCT_IMAGES: Record<string, string> = {
  "bap-bo": bapBo,
  "de-suon-bo": deSuonBo,
  "than-bo": thanBo,
  "bo-xay": boXay,
  "ba-chi-bo-my": baChiBo,
  "ba-chi-lon": baChiLon,
  "suon-non": suonLon,
  "nac-vai": nacVai,
  "chan-gio": chanGio,
  "mo-lon": moLon,
  "ga-nguyen-con": gaTa,
  "dui-ga": duiGa,
  "uc-ga": ucGa,
  "canh-ga": canhGa,
  "long-ga": longGa,
  "gio-lua": gioLua,
  "gio-thu": gioThu,
  "xuc-xich": xucXich,
  "thit-nguoi": thitNguoi,
  "lap-xuong": lapXuong,
  "cha-la-lot": chaLaLot,
};

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getProductCategory(productSlug: string, category: string) {
  return getCategory(PRODUCT_CATEGORIES[productSlug] ?? category);
}

export function getProductImage(productSlug: string, category: string) {
  return PRODUCT_IMAGES[productSlug] ?? getProductCategory(productSlug, category)?.image;
}

export function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}

export const SHIPPING_FEE = 30000;
export const FREE_SHIP_FROM = 500000;
export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIP_FROM ? 0 : SHIPPING_FEE;
}
