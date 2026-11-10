import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useBandOptions } from "@/features/bands/hooks/useBandOptions";
import * as api from "@/features/bands/services/bands.api";

vi.mock("@/features/bands/services/bands.api", async (importOriginal) => ({
  ...(await importOriginal<typeof api>()),
  getBandOptions: vi.fn(),
}));

describe("useBandOptions", () => {
  it("lists the styles in alphabetical order", async () => {
    vi.mocked(api.getBandOptions).mockResolvedValue({
      themes: [
        { id: "rock-indie", label: "Rock Indie/Psicodélico" },
        { id: "axe", label: "Axé" },
        { id: "jazz", label: "Jazz Tradicional/New Orleans" },
        { id: "indie-folk", label: "Indie Folk/Lo-fi" },
      ],
      origins: [],
      foundationYears: [],
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useBandOptions(), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.themes.map((t) => t.label)).toEqual([
      "Axé",
      "Indie Folk/Lo-fi",
      "Jazz Tradicional/New Orleans",
      "Rock Indie/Psicodélico",
    ]);
  });
});
