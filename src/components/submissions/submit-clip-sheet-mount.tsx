"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { useUiStore } from "@/stores/ui-store";

const SubmitClipSheet = dynamic(
  () =>
    import("@/components/submissions/submit-clip-sheet").then(
      (module) => module.SubmitClipSheet
    ),
  { ssr: false }
);

export function SubmitClipSheetMount() {
  const submitOpen = useUiStore((state) => state.submitOpen);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (mounted) return;

    const preload = () => {
      void import("@/components/submissions/submit-clip-sheet");
    };

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(preload, { timeout: 3000 });
      return () => window.cancelIdleCallback(handle);
    }

    const timer = setTimeout(preload, 1500);
    return () => clearTimeout(timer);
  }, [mounted]);

  if (submitOpen && !mounted) setMounted(true);

  return mounted ? <SubmitClipSheet /> : null;
}
