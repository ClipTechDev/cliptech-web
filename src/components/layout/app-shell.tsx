import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
      <div style={{ paddingBottom: "var(--app-nav-clearance)" }}>{children}</div>
      <BottomNav />
    </div>
  );
}
