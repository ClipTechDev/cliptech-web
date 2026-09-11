"use client";

import { Loader2, Plug, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { formatRelative, platformLabel } from "@/lib/format";
import {
  useConnectSocialMutation,
  useDisconnectSocialMutation,
  useSocialAccountsQuery,
} from "@/hooks/use-social-accounts";
import { PLATFORMS, type Platform } from "@/schemas/common";
import type { SocialAccount } from "@/schemas/social-account";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage, QueryState } from "@/components/shared/query-state";

/**
 * One row per platform, connected or not - rather than a list of connections
 * plus an "add" button. A creator cannot submit a TikTok clip without a TikTok
 * connection, so the four platforms are the checklist, and an unconnected one
 * is a gap worth showing.
 */
export function SocialAccounts() {
  const { data: accounts, error, isPending, refetch } = useSocialAccountsQuery();
  const connect = useConnectSocialMutation();
  const disconnect = useDisconnectSocialMutation();

  const byPlatform = new Map<Platform, SocialAccount>();
  for (const account of accounts ?? []) {
    // A platform can have an older disconnected row alongside a live one; the
    // connected record wins.
    const existing = byPlatform.get(account.platform);
    if (!existing || (existing.needs_reconnect && !account.needs_reconnect)) {
      byPlatform.set(account.platform, account);
    }
  }

  return (
    <QueryState
      isLoading={isPending}
      loadingFallback={
        <div className="space-y-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      }
      error={error}
      onRetry={() => void refetch()}
    >
      <ul className="space-y-2">
        {PLATFORMS.map((platform) => {
          const account = byPlatform.get(platform);
          const connected = account !== undefined && !account.needs_reconnect;

          return (
            <li
              key={platform}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{platformLabel(platform)}</p>
                  {connected && <Badge variant="success">Connected</Badge>}
                  {account?.needs_reconnect && (
                    <Badge variant="warning">
                      <TriangleAlert />
                      Reconnect
                    </Badge>
                  )}
                </div>
                {account?.platform_username && (
                  <p className="truncate text-xs text-muted-foreground">
                    {!account.platform_username.startsWith("@") && "@"}{account.platform_username}
                    {account.last_connected_at &&
                      ` · connected ${formatRelative(account.last_connected_at)}`}
                  </p>
                )}
                {account?.last_error && (
                  <p className="truncate text-xs text-destructive">{account.last_error}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant={connected ? "ghost" : "outline"}
                  size="sm"
                  disabled={connect.isPending}
                  onClick={() =>
                    connect.mutate(platform, {
                      onError: (error) => toast.error(errorMessage(error)),
                    })
                  }
                >
                  {connect.isPending && connect.variables === platform ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plug />
                  )}
                  {account?.needs_reconnect ? "Reconnect" : connected ? "Replace" : "Connect"}
                </Button>

                {connected && account && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disconnect.isPending}
                    onClick={() =>
                      disconnect.mutate(account.id, {
                        onSuccess: () =>
                          toast.success(`${platformLabel(platform)} disconnected`),
                        onError: (error) => toast.error(errorMessage(error)),
                      })
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </QueryState>
  );
}
