import { describe, expect, it } from "vitest";
import { assertPriceAdmin, priceUpdateSchema } from "@/lib/price-management";

describe("price management", () => {
  it("allows only admins to save prices", () => {
    expect(() => assertPriceAdmin(false)).toThrow();
    expect(() => assertPriceAdmin(true)).not.toThrow();
  });
  it("accepts integer VND amounts and rejects negative or fractional prices", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    expect(priceUpdateSchema.parse({ id, price: 25000 }).price).toBe(25000);
    expect(priceUpdateSchema.safeParse({ id, price: -1 }).success).toBe(false);
    expect(priceUpdateSchema.safeParse({ id, price: 1.5 }).success).toBe(false);
  });
});