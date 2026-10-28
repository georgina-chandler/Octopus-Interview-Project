import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuantityStepper } from "../components/QuantityStepper/QuantityStepper";

describe("QuantityStepper", () => {
  it("calls onChange with value + 1 when increased", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantityStepper value={3} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("calls onChange with value - 1 when decreased", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantityStepper value={3} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables decrease at the minimum", () => {
    render(<QuantityStepper value={1} onChange={vi.fn()} min={1} />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
  });

  it("disables increase at the maximum", () => {
    render(<QuantityStepper value={99} onChange={vi.fn()} max={99} />);
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });

  it("disables both buttons when disabled is set", () => {
    render(<QuantityStepper value={5} onChange={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });
});
