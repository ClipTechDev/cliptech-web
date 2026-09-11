import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorPanel } from "@/components/shared/error-panel";

export default function AppNotFound() {
  return (
    <div className="py-8">
      <ErrorPanel title="Not found" description="That page doesn't exist.">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          Back to campaigns
        </Button>
      </ErrorPanel>
    </div>
  );
}
