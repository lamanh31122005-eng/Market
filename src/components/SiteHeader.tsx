import { Link } from "@tanstack/react-router";
import { ShoppingBasket, User, Beef } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { CATEGORIES } from "@/lib/catalog";

export function SiteHeader() {
  const { count } = useCart();
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-primary">
          <Beef className="h-6 w-6 text-meat" /> Thịt Sạch Xanh
        </Link>
        <nav className="hidden flex-1 gap-5 text-sm md:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/danh-muc/$category"
              params={{ category: c.slug }}
              className="text-muted-foreground hover:text-primary"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to={user ? "/don-hang" : "/dang-nhap"}
            className="flex items-center gap-1 rounded-full px-3 py-2 text-sm hover:bg-muted"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{user ? "Đơn hàng" : "Đăng nhập"}</span>
          </Link>
          <Link to="/gio-hang" className="relative flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
            <ShoppingBasket className="h-4 w-4" /> Giỏ hàng
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-meat px-1 text-xs text-meat-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-foreground">Thịt Sạch Xanh</p>
          <p className="mt-2">Thịt tươi truy xuất nguồn gốc, giao nhanh trong 2 giờ.</p>
        </div>
        <div>Giao hàng miễn phí cho đơn từ 500.000₫</div>
        <div>Hỗ trợ: trò chuyện với Bếp Trưởng Sạch ở góc phải màn hình</div>
      </div>
    </footer>
  );
}
