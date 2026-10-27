import { describe, expect, it } from "vitest";
import { formatDimensions, formatPrice } from "../lib/format/product";

describe("formatPrice", () => {
  it("formats pence as a GBP currency string", () => {
    expect(formatPrice(1299)).toBe("£12.99");
  });

  it("handles whole pounds", () => {
    expect(formatPrice(500)).toBe("£5.00");
  });
});

describe("formatDimensions", () => {
  it("joins height, width and length with 'x'", () => {
    expect(
      formatDimensions({ height: 12.6, width: 6.2, length: 6.2 }),
    ).toBe("12.6 x 6.2 x 6.2");
  });
});
