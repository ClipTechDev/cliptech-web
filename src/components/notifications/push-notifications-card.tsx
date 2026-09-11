"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";

import { pushConfigured } from "@/lib/env";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";

/**
 * The permanent on/off control, for the Profile tab.
 *
 * Distinct from the prompt: this is where a creator comes to change their
 * mind, so it renders in every state including the ones there is nothing to
 * do about, and it never disappears once they have answered.
 */
export function PushNotificationsCard() {
  const { permission, enabled, isBusy, error, enable, disable } = usePushNotifications();

  // Not set up on this deployment: there is no control to offer, and an
  // explanation would be about our configuration, not their account.
  if (!pushConfigured) return null;

  // Still reading the browser. One frame, and rendering a guess would mean
  // showing "off" to someone who has them on.
  if (permission === null) return null;

  return (
    <div className="gap-inline p-card flex items-start rounded-xl border">
      <div className="p-tight mt-0.5 shrink-0 rounded-full bg-muted">
        {enabled ? (
          <Bell className="size-4 text-primary" />
        ) : (
          <BellOff className="size-4 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-inline min-w-0 flex-1">
        <div className="space-y-tight">
          <p className="font-medium">Push notifications</p>
          <p className="text-sm text-pretty text-muted-foreground">
            {describe(permission, enabled)}
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <PushAction
          permission={permission}
          enabled={enabled}
          isBusy={isBusy}
          onEnable={enable}
          onDisable={disable}
        />
      </div>
    </div>
  );
}

function PushAction({
  permission,
  enabled,
  isBusy,
  onEnable,
  onDisable,
}: {
  permission: NonNullable<ReturnType<typeof usePushNotifications>["permission"]>;
  enabled: boolean;
  isBusy: boolean;
  onEnable: () => void;
  onDisable: () => void;
}) {
  // Nothing to offer: either the browser cannot do push, or it has been
  // blocked and only the creator can unblock it from browser settings.
  if (permission === "unsupported" || permission === "denied") return null;

  return (
    <Button
      variant={enabled ? "outline" : "default"}
      size="lg"
      disabled={isBusy}
      onClick={enabled ? onDisable : onEnable}
    >
      {isBusy && <Loader2 className="animate-spin" />}
      {enabled ? "Turn off" : "Turn on notifications"}
    </Button>
  );
}

function describe(
  permission: NonNullable<ReturnType<typeof usePushNotifications>["permission"]>,
  enabled: boolean
): string {
  if (permission === "unsupported") {
    return "This browser can't receive push notifications. Notifications still appear in the app.";
  }
  if (permission === "denied") {
    return "Notifications are blocked for this site. To turn them back on, allow notifications for ClipTech in your browser settings.";
  }
  if (enabled) {
    return "On for this browser. We'll tell you when a clip is approved, when views are counted, and when a withdrawal is paid.";
  }
  // Granted-but-not-registered lands here too, which is the right copy for it:
  // the browser would allow it, this browser just is not set up.
  return "Get told when a clip is approved, when views are counted, and when a withdrawal is paid — even when ClipTech isn't open.";
}
