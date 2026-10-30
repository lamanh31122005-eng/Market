import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  cooking_tips: string;
};

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("products")
    .select("id,slug,name,category,price,unit,description,cooking_tips")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data as Product[];
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => getProducts(),
  staleTime: 5 * 60_000,
});
