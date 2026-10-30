import { createFileRoute, notFound } from "@tanstack/react-router";
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
          ? `${loaderData.name}: ${loaderData.tagline}. Giao lạnh trong 2 giờ.`
          : "Danh mục sản phẩm",
      },
      {
        property: "og:title",
        content: loaderData ? `${loaderData.name} — Thịt Sạch Xanh` : "Danh mục",
      },
      { property: "og:description", content: loaderData?.tagline ?? "Danh mục sản phẩm" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const cat = getCategory(category)!;
  const { data } = useSuspenseQuery(productsQuery);
  const list = data.filter((p) => getProductCategory(p.slug, p.category)?.slug === category);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-5 rounded-3xl bg-secondary/60 p-6">
        <img
          src={cat.image}
          alt=""
          width={816}
          height={816}
          className="h-20 w-20 rounded-2xl object-cover"
        />
        <div>
          <h1 className="text-3xl font-semibold">{cat.name}</h1>
          <p className="text-muted-foreground">{cat.tagline}</p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
