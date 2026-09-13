"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { getQueryClient } from "@/lib/query-client";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (module) => module.ReactQueryDevtools
          ),
        { ssr: false }
      )
    : null;

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  // Unlike cliptech-admin, which is pinned light, this app ships both palettes
  // and follows the device: a creator opening it on a phone at night should
  // get the dark one without being asked.
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {/* top-left, unlike the admin's bottom-left: the bottom bar spans the
            full width on a phone, and the devtools toggle lands squarely on
            the first tab. The page title it covers up here is not clickable. */}
        {ReactQueryDevtools && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
