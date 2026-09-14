"use client";

import * as React from "react";
import { Check, Copy, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { platformLabel } from "@/lib/format";
import {
  useCancelClaimMutation,
  useConnectSocialMutation,
  useSocialClaimsQuery,
  useStartClaimMutation,
  useVerifyClaimMutation,
} from "@/hooks/use-social-accounts";
import type { Platform } from "@/schemas/common";
import {
  supportsCodeConnect,
  type SocialClaim,
  type VerifyClaimFailure,
} from "@/schemas/social-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { errorMessage } from "@/components/shared/query-state";

export type ConnectTarget = {
  platform: Platform;
  /** Set when repairing one existing connection rather than adding one. */
  accountId?: string;
  /**
   * Skip the chooser when the row already settles the question - re-verifying
   * a code account is a code flow, and asking again would be a pointless step.
   */
  route?: "code";
};

const profilePlaceholders: Partial<Record<Platform, string>> = {
  instagram: "https://instagram.com/yourhandle",
  twitter: "https://x.com/yourhandle",
  youtube: "https://youtube.com/@yourhandle",
};

/** Extra conditions a platform puts on the code route, beyond being public. */
const profileRequirements: Partial<Record<Platform, string>> = {
  instagram:
    "Your account must be a public Business or Creator account — Instagram doesn't let us read personal ones.",
};

export function ConnectAccountSheet({
  target,
  onClose,
}: {
  target: ConnectTarget | null;
  onClose: () => void;
}) {
  if (!target) return null;

  // Keyed so that opening the sheet for a different platform or account starts
  // from a clean slate, rather than resetting five pieces of state in an
  // effect once it is already mounted.
  return (
    <ConnectFlow
      key={`${target.platform}:${target.accountId ?? "new"}:${target.route ?? "choose"}`}
      target={target}
      onClose={onClose}
    />
  );
}

function ConnectFlow({
  target,
  onClose,
}: {
  target: ConnectTarget;
  onClose: () => void;
}) {
  const { platform } = target;
  const maySupportCode = supportsCodeConnect(platform);
  const name = platformLabel(platform);

  const [route, setRoute] = React.useState<"choose" | "profile">(
    target.route === "code" ? "profile" : "choose"
  );
  const [profileUrl, setProfileUrl] = React.useState("");
  const [startedClaim, setStartedClaim] = React.useState<SocialClaim | null>(null);
  const [abandonedClaimId, setAbandonedClaimId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const claims = useSocialClaimsQuery(maySupportCode);
  const connect = useConnectSocialMutation();
  const startClaim = useStartClaimMutation();
  const verifyClaim = useVerifyClaimMutation();
  const cancelClaim = useCancelClaimMutation();

  const codeCapable =
    maySupportCode && (claims.data?.platforms.includes(platform) ?? false);

  // A verification already in flight is resumed rather than replaced: the code
  // the creator may already have pasted into their bio is the one we check.
  const resumable =
    claims.data?.claims.find((entry) => entry.platform === platform) ?? null;
  const candidate = startedClaim ?? resumable;
  const claim = candidate && candidate.id !== abandonedClaimId ? candidate : null;

  function startOAuth() {
    setError(null);
    connect.mutate(
      { platform, accountId: target.accountId },
      { onError: (err) => setError(errorMessage(err)) }
    );
  }

  function submitProfile(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startClaim.mutate(
      { platform, profile_url: profileUrl },
      {
        onSuccess: (response) => {
          setAbandonedClaimId(null);
          setStartedClaim(response.claim);
        },
        onError: (err) => setError(errorMessage(err)),
      }
    );
  }

  function check() {
    setError(null);

    verifyClaim.mutate(platform, {
      onSuccess: (response) => {
        toast.success(`${name} connected`, {
          description: response.account.platform_username
            ? `Verified @${response.account.platform_username}`
            : undefined,
        });
        onClose();
      },
      onError: (err) => setError(checkErrorMessage(err)),
    });
  }

  function abandon() {
    if (claim) setAbandonedClaimId(claim.id);
    setStartedClaim(null);
    setRoute("choose");
    cancelClaim.mutate(platform);
  }

  return (
    <Sheet open onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="flex flex-col gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {target.accountId ? `Reconnect ${name}` : `Connect ${name}`}
          </SheetTitle>
          <SheetDescription>
            {claim
              ? "Add the code to your bio, then check it."
              : "Prove the account is yours so your clips can be tracked."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          {claim ? (
            <CodeStep
              claim={claim}
              name={name}
              checking={verifyClaim.isPending}
              onCheck={check}
              onAbandon={abandon}
              abandoning={cancelClaim.isPending}
            />
          ) : route === "profile" ? (
            <form className="flex flex-col gap-3" onSubmit={submitProfile}>
              <div className="space-y-2">
                <Label htmlFor="profile-url">Your {name} profile link</Label>
                <Input
                  id="profile-url"
                  autoFocus
                  value={profileUrl}
                  placeholder={profilePlaceholders[platform]}
                  onChange={(event) => setProfileUrl(event.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  The profile must be public so we can read its bio.
                  {profileRequirements[platform]
                    ? ` ${profileRequirements[platform]}`
                    : ""}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!profileUrl.trim() || startClaim.isPending}
                >
                  {startClaim.isPending && <Loader2 className="animate-spin" />}
                  Get my code
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => (target.route === "code" ? onClose() : setRoute("choose"))}
                >
                  {target.route === "code" ? "Cancel" : "Back"}
                </Button>
              </div>
            </form>
          ) : (
            <ChooseStep
              name={name}
              codeCapable={codeCapable}
              checkingRoutes={maySupportCode && claims.isPending}
              onOAuth={startOAuth}
              onCode={() => setRoute("profile")}
              oauthPending={connect.isPending}
            />
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function checkErrorMessage(error: unknown): string {
  const failure = verifyFailure(error);
  if (!failure || failure.reason !== "code_not_found") {
    return errorMessage(error);
  }

  if (failure.attempts_remaining <= 0) {
    return "We couldn't find the code in that bio.";
  }

  const checks = failure.attempts_remaining === 1 ? "check" : "checks";
  return `We couldn't find the code in that bio yet. ${failure.attempts_remaining} ${checks} left.`;
}

function ChooseStep({
  name,
  codeCapable,
  checkingRoutes,
  onOAuth,
  onCode,
  oauthPending,
}: {
  name: string;
  codeCapable: boolean;
  checkingRoutes: boolean;
  onOAuth: () => void;
  onCode: () => void;
  oauthPending: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onOAuth}
        disabled={oauthPending}
        className="flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-accent disabled:opacity-60"
      >
        <ShieldCheck className="mt-0.5 size-5 shrink-0" />
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-medium">
            Sign in with {name}
            {oauthPending && <Loader2 className="size-4 animate-spin" />}
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            The usual route. Takes a few seconds and keeps working on its own.
          </span>
        </span>
      </button>

      {checkingRoutes && <Skeleton className="h-24 w-full rounded-xl" />}

      {!checkingRoutes && codeCapable && (
        <button
          type="button"
          onClick={onCode}
          className="hover:bg-accent flex items-start gap-3 rounded-xl border p-4 text-left transition-colors"
        >
          <KeyRound className="mt-0.5 size-5 shrink-0" />
          <span className="min-w-0">
            <span className="block font-medium">Verify with a code</span>
            <span className="text-muted-foreground mt-0.5 block text-sm">
              Put a short code in your bio instead. No sign-in, and you can take
              the code out once it&apos;s verified.
            </span>
          </span>
        </button>
      )}

      {!checkingRoutes && !codeCapable && (
        <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          {name} can only be connected by signing in.
        </p>
      )}
    </div>
  );
}

function CodeStep({
  claim,
  name,
  checking,
  onCheck,
  onAbandon,
  abandoning,
}: {
  claim: SocialClaim;
  name: string;
  checking: boolean;
  onCheck: () => void;
  onAbandon: () => void;
  abandoning: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(claim.code);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy — select the code and copy it by hand.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="space-y-1 text-sm text-muted-foreground">
        <li>1. Copy the code below.</li>
        <li>2. Paste it anywhere in your {name} bio and save.</li>
        <li>3. Come back and check it.</li>
      </ol>

      <div className="flex items-center gap-2 rounded-xl border p-3">
        <code className="min-w-0 flex-1 truncate font-mono text-sm">{claim.code}</code>
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Verifying @{claim.handle}. You can remove the code once it&apos;s verified.
      </p>

      <div className="flex gap-2">
        <Button type="button" onClick={onCheck} disabled={checking}>
          {checking && <Loader2 className="animate-spin" />}
          I&apos;ve added it
        </Button>
        <Button type="button" variant="ghost" onClick={onAbandon} disabled={abandoning}>
          Start over
        </Button>
      </div>
    </div>
  );
}

function verifyFailure(error: unknown): VerifyClaimFailure | null {
  if (!(error instanceof ApiError)) return null;

  const payload = error.payload;
  if (!payload || typeof payload !== "object") return null;
  if (!("reason" in payload)) return null;

  return payload as VerifyClaimFailure;
}
