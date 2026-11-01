import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, safeRedirect } from "@/lib/auth";

export const Route = createFileRoute("/dang-nhap")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Đăng nhập / Đăng ký — Thịt Sạch Xanh" },
      { name: "description", content: "Đăng nhập hoặc tạo tài khoản để thanh toán." },
      { property: "og:title", content: "Đăng nhập — Thịt Sạch Xanh" },
      { property: "og:description", content: "Đăng nhập hoặc tạo tài khoản để thanh toán." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safeRedirect(redirect);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: target });
  }, [user, target, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("Email hoặc mật khẩu chưa đúng");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + target },
      });
      if (error) toast.error(error.message);
      else if (!data.session) setSent(true);
    }
    setBusy(false);
  }

  if (sent)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Kiểm tra email</h1>
        <p className="mt-3 text-muted-foreground">
          Chúng tôi đã gửi liên kết xác nhận tới <b>{email}</b>. Bấm vào liên kết để hoàn tất — bạn sẽ quay lại thanh toán với giỏ hàng giữ nguyên.
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">{mode === "in" ? "Đăng nhập" : "Tạo tài khoản"}</h1>
        {redirect && <p className="mt-2 text-sm text-muted-foreground">{target === "/quan-ly-gia" ? "Đăng nhập bằng tài khoản quản trị viên." : "Đăng nhập để tiếp tục thanh toán. Giỏ hàng của bạn vẫn được giữ."}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border bg-muted px-4 py-3 outline-none focus:border-primary" />
          <input type="password" required minLength={6} placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border bg-muted px-4 py-3 outline-none focus:border-primary" />
          <button disabled={busy} className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground disabled:opacity-50">
            {busy ? "Đang xử lý…" : mode === "in" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-5 w-full text-sm text-primary">
          {mode === "in" ? "Chưa có tài khoản? Đăng ký nhanh" : "Đã có tài khoản? Đăng nhập"}
        </button>
      </div>
    </div>
  );
}
