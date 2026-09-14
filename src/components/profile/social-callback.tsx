"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { platformLabel } from "@/lib/format";
import { socialAccountsKeys } from "@/hooks/use-social-accounts";
import { socialConnectErrorMessage } from "@/schemas/social-account";

const PROFILE_PATH = "/dashboard/profile";

export function SocialCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const reason = searchParams.get("reason");

  // A ref, not state: React 19 runs effects twice in development, and without
  // this the creator gets two toasts for one connection.
  const handled = React.useRef(false);

  React.useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // Nothing to report: this path is only ever reached with a result on the
    // query string, so a bare visit is someone who navigated here, not a
    // connection that failed.
    if (!status) {
      router.replace(PROFILE_PATH);
      return;
    }

    const name = platform ? platformLabel(platform) : "Account";

    if (status === "connected") {
      toast.success(`${name} connected`);
      // The list was fetched before the round trip, so it still shows this
      // platform as unconnected.
      queryClient.invalidateQueries({ queryKey: socialAccountsKeys.all });
    } else {
      toast.error(`Couldn't connect ${name}`, {
        description: socialConnectErrorMessage(reason),
      });
    }

    router.replace(PROFILE_PATH);
  }, [status, platform, reason, router, queryClient]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Finishing up…
    </div>
  );
}
