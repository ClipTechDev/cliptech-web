"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { formatHandle, formatRelative, platformLabel } from "@/lib/format";
import {
  useJoinCampaignMutation,
  useLeaveCampaignMutation,
  useMembershipOverviewQuery,
} from "@/hooks/use-campaign-membership";
import type { Campaign } from "@/schemas/campaign";
import type { Platform } from "@/schemas/common";
import {
  JOIN_METHOD_COPY,
  type MembershipOverview,
  type MembershipPage,
} from "@/schemas/membership";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryState, errorMessage } from "@/components/shared/query-state";
import { SubmitClipForm } from "@/components/campaigns/submit-clip-form";

export function CampaignJoin({
  campaign,
  connectedPlatforms,
}: {
  campaign: Campaign;
  connectedPlatforms: Platform[] | null;
}) {
  const overview = useMembershipOverviewQuery(campaign.id);

  return (
    <QueryState
      isLoading={overview.isPending}
      loadingFallback={<Skeleton className="h-40 w-full rounded-xl" />}
      error={overview.error}
      onRetry={() => void overview.refetch()}
    >
      {overview.data && (
        <JoinPanel
          campaign={campaign}
          overview={overview.data}
          connectedPlatforms={connectedPlatforms}
        />
      )}
    </QueryState>
  );
}

function JoinPanel({
  campaign,
  overview,
  connectedPlatforms,
}: {
  campaign: Campaign;
  overview: MembershipOverview;
  connectedPlatforms: Platform[] | null;
}) {
  const copy = JOIN_METHOD_COPY[overview.join_method];
  const joinedPages = overview.pages.filter((page) => page.membership?.status === "approved");

  return (
    <div className="space-y-section">
      <section className="space-y-inline">
        <h2 className="font-heading font-semibold">
          {overview.joined ? "Your pages in this campaign" : "Join this campaign"}
        </h2>

        <div className="p-card space-y-tight rounded-xl border bg-card">
          <p className="font-medium">{copy.title}</p>
          <p className="text-sm text-muted-foreground">{copy.body}</p>
          {overview.rules.length > 0 && (
            <div className="space-y-tight pt-2">
              <p className="text-sm font-medium">
                {overview.eligibility_match === "any" && overview.rules.length > 1
                  ? "Your page needs to meet at least one of these:"
                  : "Your page needs to meet:"}
              </p>
              <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                {overview.rules.map((rule, index) => (
                  <li key={`${rule.rule_type}-${index}`}>{rule.description || rule.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {overview.pages.length === 0 ? (
          <div className="p-card space-y-tight rounded-xl border border-dashed text-sm">
            <p>
              Connect a {campaign.allowed_platforms.map(platformLabel).join(" or ")} account
              to join this campaign.
            </p>
            <Link
              href="/settings/socials"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Connect an account
            </Link>
          </div>
        ) : (
          <ul className="space-y-tight">
            {overview.pages.map((page) => (
              <PageRow key={page.social_account_id} campaignId={campaign.id} page={page} />
            ))}
          </ul>
        )}

        {!overview.joinable && !overview.joined && (
          <p className="text-sm text-muted-foreground">
            This campaign isn&apos;t taking new pages right now.
          </p>
        )}
      </section>

      <section className="space-y-inline">
        <h2 className="font-heading font-semibold">Submit a clip</h2>
        {joinedPages.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Clips must be posted from{" "}
              {joinedPages.map((page) => formatHandle(page.username)).join(", ")}.
            </p>
            <SubmitClipForm campaign={campaign} connectedPlatforms={connectedPlatforms} />
          </>
        ) : (
          <p className="p-card rounded-xl border border-dashed text-center text-sm text-muted-foreground">
            {overview.pages.some((page) => page.membership?.status === "pending")
              ? "You can submit clips once your page is approved."
              : "Join with one of your pages to submit clips."}
          </p>
        )}
      </section>
    </div>
  );
}

function PageRow({ campaignId, page }: { campaignId: string; page: MembershipPage }) {
  const join = useJoinCampaignMutation(campaignId);
  const leave = useLeaveCampaignMutation();
  const membership = page.membership;
  const status = membership?.status;
  const failures = (membership?.evaluation?.results ?? []).filter(
    (result) => result.outcome === "fail" || result.outcome === "missing_input"
  );

  function onJoin() {
    join.mutate(page.social_account_id, {
      onSuccess: (response) => {
        if (response.membership.status === "approved") {
          toast.success("You're in — submit your clips below");
        } else if (response.membership.status === "pending") {
          toast.success("Request sent", {
            description: "We'll let you know when it's reviewed.",
          });
        } else {
          toast.error("This page doesn't meet the requirements yet");
        }
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  function onLeave() {
    if (!membership) return;
    leave.mutate(membership.id, {
      onSuccess: () => toast.success(status === "pending" ? "Request withdrawn" : "Left the campaign"),
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <li className="p-card space-y-tight rounded-xl border bg-card">
      <div className="gap-inline flex flex-wrap items-center justify-between">
        <div className="min-w-0">
          <p className="truncate font-medium">{formatHandle(page.username)}</p>
          <p className="text-xs text-muted-foreground">{platformLabel(page.platform)}</p>
        </div>

        <div className="gap-tight flex flex-wrap items-center">
          {status === "approved" && (
            <>
              <span className="gap-tight flex items-center text-sm font-medium text-success">
                <CheckCircle2 className="size-4" />
                Joined
              </span>
              <Button variant="ghost" size="sm" disabled={leave.isPending} onClick={onLeave}>
                Leave
              </Button>
            </>
          )}

          {status === "pending" && (
            <>
              <span className="gap-tight flex items-center text-sm text-muted-foreground">
                <Clock className="size-4" />
                Waiting for review
              </span>
              <Button variant="ghost" size="sm" disabled={leave.isPending} onClick={onLeave}>
                Withdraw
              </Button>
            </>
          )}

          {page.can_join && (
            <Button size="sm" disabled={join.isPending} onClick={onJoin}>
              {join.isPending && <Loader2 className="animate-spin" />}
              {status === "rejected" ? "Try again" : "Join with this page"}
            </Button>
          )}

          {!page.connected && status !== "approved" && (
            <Link
              href="/settings/socials"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Reconnect
            </Link>
          )}
        </div>
      </div>

      {(status === "rejected" || (status === "removed" && membership?.decided_by === "admin")) && (
        <div className="gap-tight flex items-start text-sm">
          <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="space-y-0.5">
            {failures.length > 0 && membership?.decided_by === "system" ? (
              failures.map((failure, index) => (
                <p key={`${failure.rule_type}-${index}`}>
                  {failure.outcome === "missing_input"
                    ? failure.reason
                    : `Needs: ${failure.description}`}
                </p>
              ))
            ) : (
              <p>{membership?.rejection_reason ?? "Not accepted for this campaign."}</p>
            )}
            {page.retry_at && (
              <p className="text-xs text-muted-foreground">
                You can try again {formatRelative(page.retry_at)}.
              </p>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
