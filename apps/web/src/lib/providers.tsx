"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CustomerContextProvider } from "./customer-context";
import type { ActiveArea } from "./customer-context";
import type { AreaId } from "@mealhrs/domain";

export function Providers({ children, initialAreaId, initialAreas }: { children: ReactNode; initialAreaId: AreaId; initialAreas: readonly ActiveArea[] }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CustomerContextProvider initialAreaId={initialAreaId} initialAreas={initialAreas}>{children}</CustomerContextProvider>
    </QueryClientProvider>
  );
}
