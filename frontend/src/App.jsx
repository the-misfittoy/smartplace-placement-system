import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools }               from "@tanstack/react-query-devtools";
import { ThemeProvider }                    from "@/context/ThemeContext";
import { ToastProvider }                    from "@/components/ui/Toast";
import AppRouter                            from "@/router";
import React from "react";
import ReactDOM from "react-dom/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30_000,
      gcTime:               300_000,
      retry:                1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

