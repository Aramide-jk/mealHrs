import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { asAreaId } from "@mealhrs/domain";
import { CustomerContextProvider } from "@/lib/customer-context";
import { AuthScreen } from "./auth-screen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("auth screen document structure", () => {
  it("keeps the account title as the first and only heading", () => {
    render(
      <CustomerContextProvider initialAreas={[{ id: asAreaId("area-ikotun"), name: "Ikotun", state: "Lagos" }]}>
        <AuthScreen />
      </CustomerContextProvider>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });
});
