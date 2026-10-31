import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, ChefHat } from "lucide-react";
import { formatVnd, getProductCategory, getProductImage } from "@/lib/catalog";
import { productsQuery } from "@/lib/products.functions";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/san-pham/$slug")({
  loader: async ({ context, params }) => {
    const all = await context.queryClient.ensureQueryData(productsQuery);
    const p = all.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return { name: p.name, description: p.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Thịt Sạch Xanh` : "Sản phẩm — Thịt Sạch Xanh" },
      { name: "description", content: loaderData?.description ?? "Sản phẩm thịt sạch" },
      { property: "og:title", content: loaderData?.name ?? "Sản phẩm" },
      { property: "og:description", content: loaderData?.description ?? "Sản phẩm thịt sạch" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productsQuery);
  const p = data.find((x) => x.slug === slug)!;
  const cat = getProductCategory(p.slug, p.category);
  const image = getProductImage(p.slug, p.category);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const related = data.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        {image && (
          <img
            src={image}
            alt={p.name}
            width={816}
            height={816}
            className="w-full rounded-3xl object-cover shadow-soft"
          />
        )}
        <div>
          {cat && (
            <Link
              to="/danh-muc/$category"
              params={{ category: cat.slug }}
              className="text-sm text-primary"
            >
              {cat.name}
            </Link>
          )}
          <h1 className="mt-2 text-4xl font-semibold">{p.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-meat">
            {formatVnd(p.price)}{" "}
            <span className="text-base font-normal text-muted-foreground">/{p.unit}</span>
          </p>
          <p className="mt-5 text-muted-foreground">{p.description}</p>
          <div className="mt-6 rounded-2xl bg-secondary/60 p-4">
            <p className="flex items-center gap-2 font-medium">
              <ChefHat className="h-4 w-4 text-primary" /> Gợi ý chế biến
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{p.cooking_tips}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Muốn công thức chi tiết? Bấm "Hỏi Bếp Trưởng" ở góc phải.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3"
                aria-label="Giảm"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-3" aria-label="Tăng">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() =>
                add(
                  { productId: p.id, slug: p.slug, name: p.name, price: p.price, unit: p.unit },
                  qty,
                )
              }
              className="flex-1 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground"
            >
              Thêm vào giỏ · {formatVnd(p.price * qty)}
            </button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Cùng loại</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
