import { describe, expect, it } from "vitest";
import { catalogueImagePath, renderCategoryImage, renderProductImage } from "../catalogue-images.js";

describe("catalogue image generation", () => {
  it("builds stable backend image paths", () => {
    expect(catalogueImagePath("products", "tomato-hybrid")).toBe("/api/catalogue/images/products/tomato-hybrid.svg");
    expect(catalogueImagePath("categories", "home-care")).toBe("/api/catalogue/images/categories/home-care.svg");
  });

  it("renders product SVGs with escaped catalogue text", () => {
    const svg = renderProductImage({
      id: "test-product",
      name: "Soap <Fresh> & Clean",
      categoryId: "personal-care",
      categoryName: "Personal Care",
      brand: "Bazaar & Co",
      unit: "100 g"
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Soap &lt;Fresh&gt; &amp; Clean");
    expect(svg).toContain("Bazaar &amp; Co");
    expect(svg).not.toContain("Soap <Fresh> & Clean");
  });

  it("renders category SVGs for all seeded category cards", () => {
    const svg = renderCategoryImage({ id: "staples", name: "Staples", icon: "rice" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("Staples");
    expect(svg).toContain("Bazaar Setu catalogue");
  });
});
