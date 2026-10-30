import { describe, expect, it } from "vitest";
import { shippingFor } from "@/lib/catalog";

describe("shipping fee", () => {
  it("is free from 500.000₫", () => expect(shippingFor(500000)).toBe(0));
  it("costs 30.000₫ below 500.000₫", () => expect(shippingFor(499000)).toBe(30000));
});
