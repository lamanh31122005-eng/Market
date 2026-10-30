import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const Ctx = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={{ user, ready }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

/** Only allow same-origin relative paths as post-login destinations. */
export function safeRedirect(path: unknown): string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}
