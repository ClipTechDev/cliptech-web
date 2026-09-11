import { Suspense } from "react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { PushMessageListener } from "@/components/notifications/push-message-listener";
import { PushPermissionPrompt } from "@/components/notifications/push-permission-prompt";
import { SubmitClipSheet } from "@/components/submissions/submit-clip-sheet";

/**
 * Everything behind a session. AuthGuard reads `?next=` state through
 * useSearchParams, hence the Suspense boundary.
 *
 * The submit sheet is mounted once here rather than per screen, because it is
 * opened from three different tabs and should survive navigation between them.
 * The push listener is here for the same reason - a notification can arrive on
 * any tab - and the permission prompt because the ask should not be tied to
 * whichever screen a creator happened to land on.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense>
      <AuthGuard>
        <AppShell>
          <PushPermissionPrompt />
          {children}
        </AppShell>
        <SubmitClipSheet />
        <PushMessageListener />
      </AuthGuard>
    </Suspense>
  );
}
