"use client";

import * as React from "react";
import { Bell, Loader2, X } from "lucide-react";

import { pushConfigured } from "@/lib/env";
import { useMounted } from "@/hooks/use-mounted";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";

/** Remembers a dismissal, so the ask happens at most once per browser. */
const DISMISSED_KEY = "cliptech:push-prompt-dismissed";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function PushPermissionPrompt() {
  const { permission, isBusy, error, enable } = usePushNotifications();
  const mounted = useMounted();
  const [dismissedNow, setDismissedNow] = React.useState(false);

  const dismissed = dismissedNow || !mounted || readDismissed();

  function dismiss() {
    setDismissedNow(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // See readDismissed.
    }
  }

  // "default" is the only state with a decision in it. Granted and denied are
  // both answered, and unsupported has nothing to answer.
  if (!pushConfigured || permission !== "default" || dismissed) return null;

  return (
    <div className="gap-inline p-card mt-4 mb-block flex items-start rounded-xl border border-primary/30 bg-primary/5">
      <div className="p-tight mt-0.5 shrink-0 rounded-full bg-primary/10">
        <Bell className="size-4 text-primary" />
      </div>

      <div className="space-y-inline min-w-0 flex-1">
        <div className="space-y-tight">
          <p className="font-medium">Know when a clip gets approved</p>
          <p className="text-sm text-pretty text-muted-foreground">
            We&apos;ll notify you when your clips are approved, when views are counted,
            and when a withdrawal is paid.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="gap-tight flex flex-wrap">
          <Button size="lg" disabled={isBusy} onClick={enable}>
            {isBusy && <Loader2 className="animate-spin" />}
            Turn on
          </Button>
          <Button variant="ghost" size="lg" onClick={dismiss}>
            Not now
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss"
        className="shrink-0"
        onClick={dismiss}
      >
        <X />
      </Button>
    </div>
  );
}
