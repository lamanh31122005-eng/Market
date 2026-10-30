import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/products.functions";
import { formatVnd, getCategory } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const cat = getCategory(p.category);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1">
      <Link to="/san-pham/$slug" params={{ slug: p.slug }} className="aspect-square overflow-hidden bg-muted">
        {cat && (
          <img src={cat.image} alt={p.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition group-hover:scale-105" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to="/san-pham/$slug" params={{ slug: p.slug }} className="font-medium hover:text-primary">
          {p.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="font-semibold text-meat">{formatVnd(p.price)}</p>
            <p className="text-xs text-muted-foreground">/{p.unit}</p>
          </div>
          <button
            onClick={() => add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, unit: p.unit })}
            aria-label={`Thêm ${p.name} vào giỏ`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
