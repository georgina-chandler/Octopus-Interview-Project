import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BasketView } from "../components/BasketView/BasketView";
import {
  clearBasket,
  getBasket,
  removeBasketItem,
  updateBasketItemQuantity,
} from "../lib/basket/client";
import type { Basket } from "../lib/basket/types";

vi.mock("../lib/basket/client", () => ({
  getBasket: vi.fn(),
  updateBasketItemQuantity: vi.fn(),
  removeBasketItem: vi.fn(),
  clearBasket: vi.fn(),
}));

const mockGetBasket = vi.mocked(getBasket);
const mockUpdateQuantity = vi.mocked(updateBasketItemQuantity);
const mockRemoveItem = vi.mocked(removeBasketItem);
const mockClearBasket = vi.mocked(clearBasket);

const basketWithOneItem: Basket = {
  id: "basket-1",
  subtotal: 2598,
  items: [
    {
      id: "item-1",
      quantity: 2,
      lineTotal: 2598,
      product: {
        id: "1",
        name: "Energy saving light bulb",
        subtitle: "25W // Packet of 4",
        price: 1299,
        imgUrl: "https://example.com/bulb.png",
      },
    },
  ],
};

const emptyBasket: Basket = { id: "basket-1", subtotal: 0, items: [] };

beforeEach(() => {
  mockGetBasket.mockReset();
  mockUpdateQuantity.mockReset();
  mockRemoveItem.mockReset();
  mockClearBasket.mockReset();
});

describe("BasketView", () => {
  it("shows a loading state before the basket resolves", () => {
    mockGetBasket.mockReturnValue(new Promise(() => {}));
    render(<BasketView />);

    expect(screen.getByText("Loading your basket…")).toBeInTheDocument();
  });

  it("shows an empty state with a continue-shopping link", async () => {
    mockGetBasket.mockResolvedValue(emptyBasket);
    render(<BasketView />);

    await waitFor(() => expect(screen.getByText("Your basket is empty.")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute(
      "href",
      "/product",
    );
  });

  it("renders items with name, quantity and subtotal", async () => {
    mockGetBasket.mockResolvedValue(basketWithOneItem);
    render(<BasketView />);

    await waitFor(() =>
      expect(screen.getByText("Energy saving light bulb")).toBeInTheDocument(),
    );
    expect(screen.getByText("2")).toBeInTheDocument();
    // £25.98 appears twice: once as the item's lineTotal, once as the
    // (single-item) basket subtotal — both legitimate.
    expect(screen.getAllByText("£25.98")).toHaveLength(2);
  });

  it("updates quantity via the stepper", async () => {
    mockGetBasket.mockResolvedValue(basketWithOneItem);
    mockUpdateQuantity.mockResolvedValue({
      ...basketWithOneItem,
      subtotal: 3897,
      items: [{ ...basketWithOneItem.items[0], quantity: 3, lineTotal: 3897 }],
    });

    const user = userEvent.setup();
    render(<BasketView />);

    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(mockUpdateQuantity).toHaveBeenCalledWith("item-1", 3);
    await waitFor(() => expect(screen.getAllByText("£38.97")).toHaveLength(2));
  });

  it("removes an item", async () => {
    mockGetBasket.mockResolvedValue(basketWithOneItem);
    mockRemoveItem.mockResolvedValue(emptyBasket);

    const user = userEvent.setup();
    render(<BasketView />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(mockRemoveItem).toHaveBeenCalledWith("item-1");
    await waitFor(() => expect(screen.getByText("Your basket is empty.")).toBeInTheDocument());
  });

  it("clears the basket", async () => {
    mockGetBasket.mockResolvedValue(basketWithOneItem);
    mockClearBasket.mockResolvedValue(emptyBasket);

    const user = userEvent.setup();
    render(<BasketView />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Clear basket" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Clear basket" }));

    expect(mockClearBasket).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText("Your basket is empty.")).toBeInTheDocument());
  });

  it("shows an error state if the basket fails to load", async () => {
    mockGetBasket.mockRejectedValue(new Error("network error"));
    render(<BasketView />);

    await waitFor(() =>
      expect(screen.getByText(/Couldn't load your basket/)).toBeInTheDocument(),
    );
  });
});
