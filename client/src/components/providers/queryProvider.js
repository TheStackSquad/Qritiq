//client/components/providers/queryProvider.js

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
  // useState ensures each session gets its own QueryClient
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus — saves bandwidth on mobile
            refetchOnWindowFocus: false,
            // Retry once on failure (network blip tolerance)
            retry: 1,
            staleTime: 60 * 1000, // 1 minute default
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}