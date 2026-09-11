"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { onForegroundMessage, type ForegroundMessage } from "@/lib/push";

/**
 * Surfaces pushes that arrive while the app is open.
 *
 * FCM only draws a notification itself when the page is in the background;
 * with the tab focused the message is handed to the app and nothing is shown.
 * Without this, the one person who never hears about an approval is the
 * creator sitting in the app waiting for it.
 *
 * Renders nothing - it is an effect with a mount point.
 */
export function PushMessageListener() {
  const router = useRouter();

  React.useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    void onForegroundMessage((message) => show(message, router)).then((cleanup) => {
      // The subscription is set up asynchronously (the SDK is loaded on
      // demand), so an unmount can beat it. Tear down immediately if so.
      if (cancelled) cleanup();
      else unsubscribe = cleanup;
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [router]);

  return null;
}

function show(message: ForegroundMessage, router: ReturnType<typeof useRouter>) {
  const target = internalPath(message.link);

  toast(message.title ?? "ClipTech", {
    description: message.body ?? undefined,
    action: target
      ? { label: "View", onClick: () => router.push(target) }
      : undefined,
  });
}

/**
 * The in-app path a notification points at, or null if it points elsewhere.
 *
 * The API builds an absolute URL from its own FRONTEND_URL
 * (notification/dispatcher.go), which is normally this app but does not have
 * to be. Anything that is not this origin is dropped rather than pushed into
 * the router, which would 404 on a path this app does not serve.
 */
function internalPath(link: string | null): string | null {
  if (!link) return null;

  try {
    const url = new URL(link, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}
