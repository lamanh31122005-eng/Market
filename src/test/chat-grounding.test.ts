import { describe, expect, it } from "vitest";
import { retainCatalogTags } from "@/lib/chat-prompt";
import { getCategory, getProductCategory } from "@/lib/catalog";

describe("catalog recommendations", () => {
  it("does not offer an invented product for purchase", () => {
    expect(retainCatalogTags("[[ca-rot]] [[dui-ga]]", ["dui-ga"])).toBe(" [[dui-ga]]");
  });
  it("removes purchase tags when the catalog is unavailable", () => {
    expect(retainCatalogTags("[[dui-ga]]", [])).toBe("");
  });
});

describe("new categories", () => {
  it("recognizes rau củ as a product category", () => {
    expect(getCategory("rau-cu")?.name).toBe("Rau củ");
    expect(getProductCategory("ca-rot", "rau-cu")?.slug).toBe("rau-cu");
  });
  it("recognizes gia vị as a product category", () => {
    expect(getCategory("gia-vi")?.name).toBe("Gia vị");
    expect(getProductCategory("tieu", "gia-vi")?.slug).toBe("gia-vi");
  });
});