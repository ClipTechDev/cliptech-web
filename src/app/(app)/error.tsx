"use client";

import { Button } from "@/components/ui/button";
import { ErrorPanel } from "@/components/shared/error-panel";

/**
 * Next 16 names the reset callback `retry`, not `reset`.
 */
export default function AppError({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className="py-8">
      <ErrorPanel
        title="Something went wrong"
        description="That screen failed to load. Try again, or head back to your campaigns."
      >
        <Button variant="outline" size="sm" onClick={retry}>
          Try again
        </Button>
      </ErrorPanel>
    </div>
  );
}
