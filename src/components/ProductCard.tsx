import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/products.functions";
import { formatVnd, getProductImage } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const image = getProductImage(p.slug, p.category);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1">
      <Link
        to="/san-pham/$slug"
        params={{ slug: p.slug }}
        className="aspect-square overflow-hidden bg-muted"
      >
        {image && (
          <img
            src={image}
            alt={p.name}
            loading="lazy"
            width={816}
            height={816}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link
          to="/san-pham/$slug"
          params={{ slug: p.slug }}
          className="font-medium hover:text-primary"
        >
          {p.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="font-semibold text-meat">{formatVnd(p.price)}</p>
            <p className="text-xs text-muted-foreground">/{p.unit}</p>
          </div>
          <Button
            size="icon"
            onClick={() =>
              add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, unit: p.unit })
            }
            aria-label={`Thêm ${p.name} vào giỏ`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
