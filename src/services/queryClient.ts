import { QueryClient } from "@tanstack/react-query";

/** Shared TanStack Query client (server-state cache) for the whole app. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
