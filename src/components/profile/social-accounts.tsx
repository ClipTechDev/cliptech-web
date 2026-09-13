"use client";

import * as React from "react";
import { Loader2, Plug, Plus, TriangleAlert } from "lucide-react";
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
 * One group per platform, each holding every account a creator has
 * connected to it - not just the newest. A creator can run several accounts
 * on the same platform and submit a clip from any of them, so the newest
 * connection is not allowed to hide the others.
 */
export function SocialAccounts() {
  const { data: accounts, error, isPending, refetch } = useSocialAccountsQuery();
  const connect = useConnectSocialMutation();
  const disconnect = useDisconnectSocialMutation();
  const [pendingConnect, setPendingConnect] = React.useState<string | null>(null);

  const byPlatform = new Map<Platform, SocialAccount[]>();
  for (const account of accounts ?? []) {
    if (account.status === "disconnected") continue;
    const existing = byPlatform.get(account.platform) ?? [];
    existing.push(account);
    byPlatform.set(account.platform, existing);
  }
  for (const list of byPlatform.values()) {
    list.sort((a, b) => {
      if (a.needs_reconnect !== b.needs_reconnect) return a.needs_reconnect ? -1 : 1;
      return a.connected_at < b.connected_at ? 1 : -1;
    });
  }

  function startConnect(platform: Platform, target: string) {
    setPendingConnect(target);
    connect.mutate(platform, {
      onError: (error) => {
        setPendingConnect(null);
        toast.error(errorMessage(error));
      },
    });
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
      <div className="space-y-5">
        {PLATFORMS.map((platform) => {
          const platformAccounts = byPlatform.get(platform) ?? [];
          const addTarget = `add:${platform}`;

          return (
            <div key={platform} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{platformLabel(platform)}</p>
                  {platformAccounts.length > 1 && (
                    <Badge variant="secondary">{platformAccounts.length}</Badge>
                  )}
                </div>
                {platformAccounts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={connect.isPending}
                    onClick={() => startConnect(platform, addTarget)}
                  >
                    {pendingConnect === addTarget ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Plus />
                    )}
                    Add another
                  </Button>
                )}
              </div>

              {platformAccounts.length === 0 ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed p-3">
                  <p className="text-sm text-muted-foreground">No account connected yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={connect.isPending}
                    onClick={() => startConnect(platform, addTarget)}
                  >
                    {pendingConnect === addTarget ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Plug />
                    )}
                    Connect
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {platformAccounts.map((account) => (
                    <SocialAccountRow
                      key={account.id}
                      account={account}
                      onReconnect={() => startConnect(platform, `account:${account.id}`)}
                      reconnectDisabled={connect.isPending}
                      reconnecting={pendingConnect === `account:${account.id}`}
                      onDisconnect={() =>
                        disconnect.mutate(account.id, {
                          onSuccess: () =>
                            toast.success(`${accountLabel(account)} disconnected`),
                          onError: (error) => toast.error(errorMessage(error)),
                        })
                      }
                      disconnecting={disconnect.isPending && disconnect.variables === account.id}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </QueryState>
  );
}

function accountLabel(account: SocialAccount): string {
  if (!account.platform_username) return platformLabel(account.platform);
  return account.platform_username.startsWith("@")
    ? account.platform_username
    : `@${account.platform_username}`;
}

function SocialAccountRow({
  account,
  onReconnect,
  reconnectDisabled,
  reconnecting,
  onDisconnect,
  disconnecting,
}: {
  account: SocialAccount;
  onReconnect: () => void;
  reconnectDisabled: boolean;
  reconnecting: boolean;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const [confirming, setConfirming] = React.useState(false);
  const connected = !account.needs_reconnect;
  const connectedAt = account.last_connected_at ?? account.connected_at;

  React.useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(timer);
  }, [confirming]);

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{accountLabel(account)}</p>
          {connected && <Badge variant="success">Connected</Badge>}
          {account.needs_reconnect && (
            <Badge variant="warning">
              <TriangleAlert />
              Reconnect
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {!account.platform_username && `${account.platform_account_id} · `}
          connected {formatRelative(connectedAt)}
        </p>
        {account.last_error && (
          <p className="truncate text-xs text-destructive">{account.last_error}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {account.needs_reconnect && (
          <Button
            variant="outline"
            size="sm"
            disabled={reconnectDisabled}
            onClick={onReconnect}
          >
            {reconnecting ? <Loader2 className="animate-spin" /> : <Plug />}
            Reconnect
          </Button>
        )}
        {confirming ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              disabled={disconnecting}
              onClick={onDisconnect}
            >
              {disconnecting && <Loader2 className="animate-spin" />}
              Confirm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={disconnecting}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            Remove
          </Button>
        )}
      </div>
    </li>
  );
}
