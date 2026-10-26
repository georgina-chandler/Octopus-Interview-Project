import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PurchasePanel } from "../components/PurchasePanel/PurchasePanel";

const product = {
  name: "Energy saving light bulb",
  power: "25W",
  quantity: 4,
  price: 1299,
};

describe("PurchasePanel", () => {
  it("renders product name, pack summary and price", () => {
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

  it("confirms the quantity added when 'Add to cart' is clicked", async () => {
    const user = userEvent.setup();
    render(<PurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(screen.getByText("Added 2 to your cart")).toBeInTheDocument();
  });

  it("clears the confirmation once quantity changes again", async () => {
    const user = userEvent.setup();
    render(<PurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(screen.getByText("Added 1 to your cart")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.queryByText("Added 1 to your cart")).not.toBeInTheDocument();
  });
});
