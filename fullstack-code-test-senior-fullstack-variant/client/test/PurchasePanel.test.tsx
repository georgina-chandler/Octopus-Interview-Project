import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PurchasePanel } from "../components/PurchasePanel/PurchasePanel";
import { addBasketItem } from "../lib/basket/client";

vi.mock("../lib/basket/client", () => ({
  addBasketItem: vi.fn(),
}));

const mockAddBasketItem = vi.mocked(addBasketItem);

const product = {
  id: "1",
  name: "Energy saving light bulb",
  subtitle: "25W // Packet of 4",
  price: 1299,
};

describe("PurchasePanel", () => {
  beforeEach(() => {
    mockAddBasketItem.mockReset();
    mockAddBasketItem.mockResolvedValue({ id: "basket-1", items: [], subtotal: 0 });
  });

  it("renders product name, subtitle and price", () => {
    render(<PurchasePanel product={product} />);

    expect(
      screen.getByRole("heading", { name: "Energy saving light bulb" }),
    ).toBeInTheDocument();
    expect(screen.getByText("25W // Packet of 4")).toBeInTheDocument();
    expect(screen.getByText("£12.99")).toBeInTheDocument();
  });

  it("starts at a quantity of 1 with decrease disabled", () => {
    render(<PurchasePanel product={product} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
  });

  it("increments and decrements quantity within bounds", async () => {
    const user = userEvent.setup();
    render(<PurchasePanel product={product} />);

    const increase = screen.getByRole("button", { name: "Increase quantity" });
    const decrease = screen.getByRole("button", { name: "Decrease quantity" });

    await user.click(increase);
    await user.click(increase);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(decrease).toBeEnabled();

    await user.click(decrease);
    await user.click(decrease);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(decrease).toBeDisabled();
  });

  it("calls addBasketItem with the product id and chosen quantity", async () => {
    const user = userEvent.setup();
    render(<PurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(mockAddBasketItem).toHaveBeenCalledWith("1", 2);
  });

  it("confirms the quantity added once the basket mutation resolves", async () => {
    const user = userEvent.setup();
    render(<PurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    await waitFor(() =>
      expect(screen.getByText(/Added 1 to your basket/)).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: "View basket" })).toHaveAttribute(
      "href",
      "/basket",
    );
  });

  it("clears the confirmation once quantity changes again", async () => {
    const user = userEvent.setup();
    render(<PurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    await waitFor(() =>
      expect(screen.getByText(/Added 1 to your basket/)).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.queryByText(/Added 1 to your basket/)).not.toBeInTheDocument();
  });

  it("shows an error and re-enables the button when the mutation fails", async () => {
    mockAddBasketItem.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    render(<PurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    await waitFor(() =>
      expect(screen.getByText(/Couldn't add to your basket/)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeEnabled();
  });
});
