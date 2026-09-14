"use client";

import * as React from "react";
import { KeyRound, Loader2, Plug, Plus, TriangleAlert } from "lucide-react";
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
import {
  ConnectAccountSheet,
  type ConnectTarget,
} from "@/components/profile/connect-account-sheet";
import { errorMessage, QueryState } from "@/components/shared/query-state";

/**
 * One group per platform, each holding every account a creator has
 * connected to it - not just the newest. A creator can run several accounts
 * on the same platform and submit a clip from any of them, so the newest
 * connection is not allowed to hide the others.
 */
export function SocialAccounts() {
  const { data: accounts, error, isPending, refetch } = useSocialAccountsQuery();
  const disconnect = useDisconnectSocialMutation();
  const connect = useConnectSocialMutation();
  const [connecting, setConnecting] = React.useState<ConnectTarget | null>(null);
  const [upgrading, setUpgrading] = React.useState<string | null>(null);

  // Upgrading a code account to OAuth needs no sheet: the route is already
  // decided, so it goes straight to the provider.
  function upgrade(account: SocialAccount) {
    setUpgrading(account.id);
    connect.mutate(
      { platform: account.platform, accountId: account.id },
      {
        onError: (error) => {
          setUpgrading(null);
          toast.error(errorMessage(error));
        },
      },
    );
  }

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
                    onClick={() => setConnecting({ platform })}
                  >
                    <Plus />
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
                    onClick={() => setConnecting({ platform })}
                  >
                    <Plug />
                    Connect
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {platformAccounts.map((account) => (
                    <SocialAccountRow
                      key={account.id}
                      account={account}
                      onReconnect={() =>
                        setConnecting({
                          platform,
                          accountId: account.id,
                          route: account.verification_method === "code" ? "code" : undefined,
                        })
                      }
                      onUpgrade={() => upgrade(account)}
                      upgrading={upgrading === account.id}
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

      <ConnectAccountSheet target={connecting} onClose={() => setConnecting(null)} />
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
  onUpgrade,
  upgrading,
  onDisconnect,
  disconnecting,
}: {
  account: SocialAccount;
  onReconnect: () => void;
  onUpgrade: () => void;
  upgrading: boolean;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const [confirming, setConfirming] = React.useState(false);
  const connected = !account.needs_reconnect;
  const byCode = account.verification_method === "code";
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
          {connected && byCode && (
            <Badge variant="secondary">
              <KeyRound />
              Verified by code
            </Badge>
          )}
          {account.needs_reconnect && (
            <Badge variant="warning">
              <TriangleAlert />
              {byCode ? "Re-verify" : "Reconnect"}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {!account.platform_username && `${account.platform_account_id} · `}
          connected {formatRelative(connectedAt)}
        </p>
        {account.last_error && (
          <p className="truncate text-xs text-destructive">
            We couldn&apos;t renew this connection. Reconnect to keep it tracking.
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {account.needs_reconnect && (
          <Button variant="outline" size="sm" onClick={onReconnect}>
            <Plug />
            {byCode ? "Re-verify" : "Reconnect"}
          </Button>
        )}
        {connected && byCode && (
          <Button variant="ghost" size="sm" disabled={upgrading} onClick={onUpgrade}>
            {upgrading && <Loader2 className="animate-spin" />}
            Sign in instead
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
