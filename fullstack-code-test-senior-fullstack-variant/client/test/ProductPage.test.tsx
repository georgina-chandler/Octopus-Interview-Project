import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockProduct = {
  id: "1",
  name: "Energy saving light bulb",
  subtitle: "25W // Packet of 4",
  description: "A great bulb",
  price: 1299,
  brand: "Philips",
  weight: 77,
  height: 12.6,
  width: 6.2,
  length: 6.2,
  model_code: "E27 ES",
  colour: "Cool daylight",
  img_url: "https://example.com/bulb.png",
};

vi.mock("../lib/graphql/products", () => ({
  getProduct: vi.fn(async () => mockProduct),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("notFound() called");
  }),
}));

describe("ProductPage", () => {
  it("renders the fetched product's details", async () => {
    const { default: ProductPage } = await import("../app/product/page");
    const ui = await ProductPage();
    render(ui);

    expect(
      screen.getByRole("heading", { name: "Energy saving light bulb", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("£12.99")).toBeInTheDocument();
    expect(screen.getByText("25W // Packet of 4")).toBeInTheDocument();
    expect(screen.getByText("A great bulb")).toBeInTheDocument();
    expect(screen.getByText("Philips")).toBeInTheDocument();
  });

  it("calls notFound when no product is returned", async () => {
    const { getProduct } = await import("../lib/graphql/products");
    vi.mocked(getProduct).mockResolvedValueOnce(null);

    const { default: ProductPage } = await import("../app/product/page");

    await expect(ProductPage()).rejects.toThrow("notFound() called");
  });
});
