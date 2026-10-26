import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductSpecifications } from "../components/ProductSpecifications/ProductSpecifications";

const product = {
  brand: "Philips",
  weight: 77,
  height: 12.6,
  width: 6.2,
  length: 6.2,
  model_code: "E27 ES",
  colour: "Cool daylight",
};

describe("ProductSpecifications", () => {
  it("renders every spec label and value from the product", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Philips")).toBeInTheDocument();

    expect(screen.getByText("Item weight (g)")).toBeInTheDocument();
    expect(screen.getByText("77")).toBeInTheDocument();

    expect(screen.getByText("Dimensions (cm)")).toBeInTheDocument();
    expect(screen.getByText("12.6 x 6.2 x 6.2")).toBeInTheDocument();

    expect(screen.getByText("Item Model number")).toBeInTheDocument();
    expect(screen.getByText("E27 ES")).toBeInTheDocument();

    expect(screen.getByText("Colour")).toBeInTheDocument();
    expect(screen.getByText("Cool daylight")).toBeInTheDocument();
  });
});
