import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCategory, getProductCategory } from "@/lib/catalog";
import { productsQuery } from "@/lib/products.functions";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/danh-muc/$category")({
  loader: async ({ context, params }) => {
    const cat = getCategory(params.category);
    if (!cat) throw notFound();
    await context.queryClient.ensureQueryData(productsQuery);
    return { name: cat.name, tagline: cat.tagline };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.name} sạch — Thịt Sạch Xanh`
          : "Danh mục — Thịt Sạch Xanh",
      },
      {
        name: "description",
        content: loaderData
           ? `${loaderData.name}: ${loaderData.tagline} tại Thịt Sạch Xanh.`
          : "Danh mục sản phẩm",
      },
      {
        property: "og:title",
        content: loaderData ? `${loaderData.name} — Thịt Sạch Xanh` : "Danh mục",
      },
      { property: "og:description", content: loaderData?.tagline ?? "Danh mục sản phẩm" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const cat = getCategory(category);
  const { data } = useSuspenseQuery(productsQuery);
  if (!cat) throw notFound();
  const list = data.filter((p) => getProductCategory(p.slug, p.category)?.slug === category);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-5 border-b pb-6">
        <img
          src={cat.image}
          alt={cat.name}
          width={1024}
          height={1024}
          className="h-24 w-24 shrink-0 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-3xl font-semibold">{cat.name}</h1>
          <p className="text-muted-foreground">{cat.tagline}</p>
        </div>
      </div>
      {list.length === 0 && (
        <div className="py-16 text-center">
          <Sprout className="mx-auto h-9 w-9 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Chưa có sản phẩm trong danh mục này</h2>
          <p className="mt-2 text-sm text-muted-foreground">Danh sách và giá bán chưa được cập nhật.</p>
          <Button asChild variant="outline" className="mt-6"><Link to="/">Xem danh mục khác</Link></Button>
        </div>
      )}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
