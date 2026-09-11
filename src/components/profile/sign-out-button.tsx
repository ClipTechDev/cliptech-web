"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useLogoutMutation } from "@/hooks/use-auth";
import { releasePushToken } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const logout = useLogoutMutation();

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={logout.isPending}
      onClick={async () => {
        // Before the session goes: the DELETE is authenticated, and leaving
        // the token behind would deliver this creator's notifications to
        // whoever signs in on this browser next.
        await releasePushToken();

        // onSettled, not onSuccess: the endpoint sits behind the auth
        // middleware, so an expired session answers 401 - and that creator
        // still needs to end up on the login screen.
        logout.mutate(undefined, {
          onSettled: () => {
            router.replace("/login");
            router.refresh();
          },
        });
      }}
    >
      <LogOut />
      {logout.isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
