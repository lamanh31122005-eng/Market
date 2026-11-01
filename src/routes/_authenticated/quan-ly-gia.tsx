import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Save, Search, ShieldAlert, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, formatVnd, getProductImage } from "@/lib/catalog";
import { priceManagementQuery, updateProductPrice } from "@/lib/prices.functions";
import type { Product } from "@/lib/products.functions";

export const Route = createFileRoute("/_authenticated/quan-ly-gia")({
  head: () => ({ meta: [
    { title: "Quản lý giá — Thịt Sạch Xanh" },
    { name: "description", content: "Quản lý giá bán sản phẩm tại Thịt Sạch Xanh." },
    { property: "og:title", content: "Quản lý giá — Thịt Sạch Xanh" },
    { property: "og:description", content: "Trang quản lý giá bán dành cho quản trị viên Thịt Sạch Xanh." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(priceManagementQuery),
  component: PriceManagement,
});

function PriceRow({ product }: { product: Product }) {
  const [price, setPrice] = useState(String(product.price));
  const [busy, setBusy] = useState(false);
  const save = useServerFn(updateProductPrice);
  const client = useQueryClient();
  const number = Number(price);
  const valid = price.trim() !== "" && Number.isInteger(number) && number >= 0 && number <= 2147483647;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    try {
      await save({ data: { id: product.id, price: number } });
      await Promise.all([client.invalidateQueries({ queryKey: ["products"] }), client.invalidateQueries({ queryKey: ["price-management"] })]);
      toast.success(`Đã lưu giá ${product.name}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Chưa lưu được giá."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="grid gap-4 border-b py-4 sm:grid-cols-[1fr_130px_200px] sm:items-center">
    <div className="flex min-w-0 items-center gap-3">
      <img src={getProductImage(product.slug, product.category)} alt={product.name} width={64} height={64} loading="lazy" className="h-16 w-16 rounded-lg object-cover" />
      <div><p className="font-medium">{product.name}</p><p className="text-sm text-muted-foreground">/{product.unit}</p></div>
    </div>
    <p className="text-sm text-muted-foreground">{formatVnd(product.price)}</p>
    <div className="flex items-center gap-2">
      <Input type="number" min={0} max={2147483647} step={1} required aria-label={`Giá ${product.name}`} value={price} onChange={e => setPrice(e.target.value)} disabled={busy} className="min-w-0" />
      <Button size="icon" type="submit" title={`Lưu giá ${product.name}`} aria-label={`Lưu giá ${product.name}`} disabled={busy || !valid || number === product.price}>
        {busy ? <LoaderCircle className="animate-spin" /> : <Save />}
      </Button>
    </div>
  </form>;
}

function PriceManagement() {
  const { data } = useSuspenseQuery(priceManagementQuery);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  if (!data.allowed) return <div className="mx-auto max-w-6xl px-4 py-16"><ShieldAlert className="h-8 w-8 text-primary" /><h1 className="mt-4 text-2xl font-semibold">Chưa có quyền quản lý giá</h1><p className="mt-2 text-muted-foreground">Tài khoản này chưa được cấp quyền quản trị viên.</p></div>;
  const list = data.products.filter(p => (!category || p.category === category) && p.name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  return <div className="mx-auto max-w-6xl px-4 py-10">
    <h1 className="text-3xl font-semibold">Quản lý giá</h1>
    <div className="my-6 flex flex-wrap gap-3">
      <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm sản phẩm" placeholder="Tìm sản phẩm" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      <select aria-label="Lọc danh mục" value={category} onChange={e => setCategory(e.target.value)} className="h-9 max-w-full rounded-md border bg-background px-3 text-sm"><option value="">Tất cả danh mục</option>{CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
    </div>
    <div className="hidden grid-cols-[1fr_130px_200px] gap-4 border-b pb-3 text-sm text-muted-foreground sm:grid"><span>Sản phẩm</span><span>Giá hiện tại</span><span>Giá mới (₫)</span></div>
    {list.map(p => <PriceRow key={`${p.id}-${p.price}`} product={p} />)}
    {list.length === 0 && <p className="py-10 text-muted-foreground">Không tìm thấy sản phẩm.</p>}
  </div>;
}