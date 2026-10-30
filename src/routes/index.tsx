import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Leaf, Truck, ShieldCheck, ChefHat } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { CATEGORIES } from "@/lib/catalog";
import { productsQuery } from "@/lib/products.functions";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thịt Sạch Xanh — Thịt bò, lợn, gà sạch giao tận nhà" },
      { name: "description", content: "Thịt sạch truy xuất nguồn gốc, giao trong 2 giờ. Trợ lý AI gợi ý phần thịt và công thức nấu." },
      { property: "og:title", content: "Thịt Sạch Xanh — Thịt sạch giao tận nhà" },
      { property: "og:description", content: "Thịt bò, lợn, gà, đồ chế biến sẵn chất lượng cao. Tư vấn món ăn bằng AI." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Index,
});

function Index() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const featured = ["than-bo", "de-suon-bo", "ba-chi-lon", "suon-non", "dui-ga", "ga-nguyen-con", "gio-lua", "lap-xuong"]
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Leaf className="h-3 w-3" /> Tươi mỗi sáng · Rõ nguồn gốc
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">
            Thịt sạch cho <span className="text-primary">bữa cơm</span> nhà bạn
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Bò, lợn, gà và đồ chế biến sẵn tuyển chọn — giao lạnh trong 2 giờ. Không biết nấu gì? Hỏi Bếp Trưởng Sạch.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/danh-muc/$category" params={{ category: "bo" }} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft">
              Mua sắm ngay
            </Link>
            <span className="flex items-center gap-2 rounded-full border px-5 py-3 text-sm">
              <ChefHat className="h-4 w-4 text-primary" /> Tư vấn món ăn miễn phí
            </span>
          </div>
        </div>
        <img src={hero} alt="Thịt bò, thịt lợn và thịt gà tươi" width={1600} height={1008} className="w-full rounded-3xl shadow-float" />
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, t: "Kiểm dịch đầy đủ", d: "Mỗi lô thịt có tem truy xuất" },
          { icon: Truck, t: "Giao lạnh 2 giờ", d: "Miễn phí đơn từ 500.000₫" },
          { icon: Leaf, t: "Không chất bảo quản", d: "Sơ chế sạch, đóng gói hút chân không" },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4">
            <I className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{t}</p>
              <p className="text-xs text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="text-3xl font-semibold">Danh mục</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/danh-muc/$category" params={{ category: c.slug }} className="group overflow-hidden rounded-2xl border bg-card">
              <img src={c.image} alt={c.name} loading="lazy" width={816} height={816} className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
              <div className="p-4">
                <p className="font-display text-lg font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="text-3xl font-semibold">Bán chạy tuần này</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
