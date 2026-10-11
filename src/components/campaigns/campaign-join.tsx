"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  Settings,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatHandle,
  formatRelative,
  platformLabel,
} from "@/lib/format";
import {
  useJoinAllPagesMutation,
  useJoinCampaignMutation,
  useLeaveCampaignMutation,
  useMembershipOverviewQuery,
  useRefreshMembershipMutation,
} from "@/hooks/use-campaign-membership";
import { campaignFinished, mentionEntries, type Campaign } from "@/schemas/campaign";
import type { Platform } from "@/schemas/common";
import {
  JOIN_METHOD_COPY,
  type MembershipOverview,
  type MembershipPage,
} from "@/schemas/membership";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryState, errorMessage } from "@/components/shared/query-state";
import { SubmitClipForm } from "@/components/campaigns/submit-clip-form";

function memberPagesOf(overview: MembershipOverview): MembershipPage[] {
  return overview.pages.filter(
    (page) =>
      page.membership !== null &&
      !(page.membership.status === "removed" && page.membership.decided_by !== "admin")
  );
}

function joinedPagesOf(overview: MembershipOverview): MembershipPage[] {
  return overview.pages.filter((page) => page.membership?.status === "approved");
}

export function CampaignJoin({ campaign }: { campaign: Campaign }) {
  const overview = useMembershipOverviewQuery(campaign.id);

  if (overview.isPending) return <Skeleton className="h-24 w-full rounded-2xl" />;
  if (overview.error) {
    return (
      <QueryState isLoading={false} error={overview.error} onRetry={() => void overview.refetch()}>
        {null}
      </QueryState>
    );
  }
  if (!overview.data || joinedPagesOf(overview.data).length > 0) return null;

  return <JoinPanel campaign={campaign} overview={overview.data} />;
}

function JoinPanel({
  campaign,
  overview,
}: {
  campaign: Campaign;
  overview: MembershipOverview;
}) {
  const [choosing, setChoosing] = React.useState(false);
  const joinAll = useJoinAllPagesMutation(campaign.id);

  const copy = JOIN_METHOD_COPY[overview.join_method];
  const open = overview.join_method === "open";
  const pending = overview.pages.some((page) => page.membership?.status === "pending");
  const declined = overview.pages.filter(isDeclined);
  const canJoin = open
    ? overview.pages.some((page) => page.can_join)
    : overview.joinable;

  if (pending) {
    return (
      <div className="gap-inline p-card card-surface flex items-start">
        <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Request sent</p>
          <p className="text-sm text-muted-foreground">
            You can submit clips once your page is approved.
          </p>
        </div>
      </div>
    );
  }

  if (campaignFinished(campaign)) return null;

  const notices = declined.length > 0 && (
    <ul className="space-y-tight">
      {declined.map((page) => (
        <li key={page.social_account_id} className="p-card card-surface space-y-tight">
          <p className="text-sm font-medium">
            {formatHandle(page.username)} wasn&apos;t accepted
          </p>
          <DeclinedReason page={page} />
        </li>
      ))}
    </ul>
  );

  if (overview.pages.length > 0 && !canJoin) {
    const blocked = overview.pages.find((page) => page.blocked_reason)?.blocked_reason;
    return (
      <div className="space-y-inline">
        {notices}
        {(!notices || blocked) && (
          <p className="p-card card-surface text-sm text-muted-foreground">
            {blocked
              ? `${sentenceCase(blocked)}.`
              : "This campaign isn't taking new pages right now."}
          </p>
        )}
      </div>
    );
  }

  if (overview.pages.length === 0 && !overview.joinable) {
    return (
      <p className="p-card card-surface text-sm text-muted-foreground">
        This campaign isn&apos;t taking new pages right now.
      </p>
    );
  }

  function onJoinAll() {
    joinAll.mutate(undefined, {
      onSuccess: (response) => {
        const count = response.memberships.length;
        toast.success(
          count === 1 ? "You're in — you can submit clips now" : `You're in with ${count} pages`
        );
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <div className="space-y-inline">
      {notices}

      <section className="p-card space-y-inline card-surface">
        <div className="space-y-0.5">
          <p className="font-medium">{copy.title}</p>
          <p className="text-sm text-muted-foreground">{copy.body}</p>
        </div>

        {overview.rules.length > 0 && (
          <div className="space-y-tight">
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

        {overview.pages.length === 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              {campaign.allowed_platforms.length > 0
                ? `Connect one of your accounts (${campaign.allowed_platforms.map(platformLabel).join(", ")}) to join.`
                : "Connect one of your accounts to join."}
            </p>
            <Link
              href="/settings/socials"
              className={buttonVariants({ size: "xl", className: "w-full" })}
            >
              Connect an account
            </Link>
          </>
        ) : open ? (
          <Button size="xl" className="w-full" disabled={joinAll.isPending} onClick={onJoinAll}>
            {joinAll.isPending && <Loader2 className="animate-spin" />}
            Join campaign
          </Button>
        ) : (
          <Button size="xl" className="w-full" onClick={() => setChoosing(true)}>
            {declined.length > 0 ? "Try again" : "Join campaign"}
          </Button>
        )}

        {campaign.accepts_submissions || (
          <p className="text-xs text-muted-foreground">
            You can join now. Clips can be submitted once the campaign is open.
          </p>
        )}
      </section>

      {!open && (
        <ChoosePageSheet
          open={choosing}
          onClose={() => setChoosing(false)}
          campaignId={campaign.id}
          overview={overview}
        />
      )}
    </div>
  );
}

export function CampaignSubmit({
  campaign,
  connectedPlatforms,
}: {
  campaign: Campaign;
  connectedPlatforms: Platform[] | null;
}) {
  const overview = useMembershipOverviewQuery(campaign.id);
  const joinedPages = overview.data ? joinedPagesOf(overview.data) : [];

  if (joinedPages.length === 0 || campaignFinished(campaign)) return null;

  if (!campaign.accepts_submissions) {
    return (
      <p className="p-card card-surface text-sm text-muted-foreground">
        You&apos;re in. Clips can be submitted once the campaign is open.
      </p>
    );
  }

  const disconnected = joinedPages.filter((page) => !page.connected);

  return (
    <section className="p-card space-y-inline card-surface">
      <div className="space-y-0.5">
        <h2 className="font-heading font-semibold">Submit a clip</h2>
        <p className="text-sm text-muted-foreground">
          Post from {joinedPages.map((page) => formatHandle(page.username)).join(", ")}, then
          paste the link.
        </p>
      </div>
      {disconnected.length > 0 && (
        <div className="gap-inline p-card flex items-center justify-between rounded-2xl border border-warning/40 bg-warning/5">
          <p className="text-sm">
            {disconnected.map((page) => formatHandle(page.username)).join(", ")} needs
            reconnecting before its clips can be checked.
          </p>
          <Link
            href="/settings/socials"
            className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0" })}
          >
            Reconnect
          </Link>
        </div>
      )}
      <SubmitClipForm campaign={campaign} connectedPlatforms={connectedPlatforms} />
    </section>
  );
}

export function CampaignManage({ campaign }: { campaign: Campaign }) {
  const [managing, setManaging] = React.useState(false);
  const [choosing, setChoosing] = React.useState(false);
  const overview = useMembershipOverviewQuery(campaign.id);
  const joinAll = useJoinAllPagesMutation(campaign.id);

  const data = overview.data;
  const memberPages = data ? memberPagesOf(data) : [];
  const open = data?.join_method === "open";
  const joinablePages = data ? data.pages.filter((page) => page.can_join) : [];
  const canAdd =
    memberPages.length > 0 && (open ? joinablePages.length > 0 : (data?.joinable ?? false));

  function onAdd() {
    if (!open) {
      setManaging(false);
      setChoosing(true);
      return;
    }
    joinAll.mutate(undefined, {
      onSuccess: (response) => {
        const count = response.memberships.length;
        toast.success(count === 1 ? "Page added" : `${count} pages added`);
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full border-border"
        aria-label="Campaign settings"
        onClick={() => setManaging(true)}
      >
        <Settings />
      </Button>

      <Sheet open={managing} onOpenChange={setManaging}>
        <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Campaign settings</SheetTitle>
            <SheetDescription>{campaign.name}</SheetDescription>
          </SheetHeader>

          <div className="space-y-block px-4 pb-6">
            {memberPages.length > 0 && (
              <section className="space-y-inline">
                <h3 className="text-sm font-medium">Your pages</h3>
                <ul className="space-y-tight">
                  {memberPages.map((page) => (
                    <PageRow key={page.social_account_id} page={page} />
                  ))}
                </ul>

                {canAdd && (
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full"
                    disabled={joinAll.isPending}
                    onClick={onAdd}
                  >
                    {joinAll.isPending && <Loader2 className="animate-spin" />}
                    {open
                      ? `Add ${joinablePages.length} more ${joinablePages.length === 1 ? "page" : "pages"}`
                      : "Join with another page"}
                  </Button>
                )}
              </section>
            )}

            <section className="space-y-inline">
              <h3 className="text-sm font-medium">Details</h3>
              <dl className="card-surface divide-y text-sm">
                <DetailRow label="Started">{formatDate(campaign.starts_at)}</DetailRow>
                <DetailRow label={new Date(campaign.ends_at) < new Date() ? "Ended" : "Ends"}>
                  {formatDate(campaign.ends_at)}
                </DetailRow>
                <DetailRow label="Budget left">
                  {formatCurrency(campaign.remaining_budget)} of{" "}
                  {formatCurrency(campaign.total_budget)}
                </DetailRow>
                <DetailRow label="Budget used">
                  {campaign.budget_used_percent.toFixed(0)}%
                </DetailRow>
                <DetailRow label="Minimum views">
                  {campaign.minimum_views === null
                    ? "None"
                    : formatCompactNumber(campaign.minimum_views)}
                </DetailRow>
                <DetailRow label="Max per post">
                  {campaign.max_payout_per_post === null
                    ? "No cap"
                    : formatCurrency(campaign.max_payout_per_post)}
                </DetailRow>
                {campaign.hashtags.length > 0 && (
                  <DetailRow label="Hashtags">
                    {campaign.hashtags.map((tag) => `#${tag}`).join(" ")}
                  </DetailRow>
                )}
                {mentionEntries(campaign).length > 0 && (
                  <DetailRow label="Mention">
                    {[...new Set(mentionEntries(campaign).map(([, handle]) => `@${handle}`))].join(
                      ", "
                    )}
                  </DetailRow>
                )}
                {(campaign.caption_phrases ?? []).length > 0 && (
                  <DetailRow label="Caption text">
                    {campaign.caption_phrases.map((phrase) => `"${phrase}"`).join(", ")}
                  </DetailRow>
                )}
              </dl>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {data && !open && (
        <ChoosePageSheet
          open={choosing}
          onClose={() => setChoosing(false)}
          campaignId={campaign.id}
          overview={data}
        />
      )}
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="gap-inline px-card flex items-center justify-between py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function ChoosePageSheet({
  open,
  onClose,
  campaignId,
  overview,
}: {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  overview: MembershipOverview;
}) {
  const join = useJoinCampaignMutation(campaignId);
  const refresh = useRefreshMembershipMutation(campaignId);

  const candidates = overview.pages.filter((page) => page.can_join);
  const eligible = candidates.filter((page) => page.eligible !== false);
  const hidden = candidates.length - eligible.length;
  const needsProfile = candidates.flatMap((page) => page.unmet).find((reason) => /profile/i.test(reason));

  function onJoin(page: MembershipPage) {
    join.mutate(page.social_account_id, {
      onSuccess: (response) => {
        if (response.membership.status === "approved") {
          toast.success("You're in — you can submit clips now");
          onClose();
        } else if (response.membership.status === "pending") {
          toast.success("Request sent", {
            description: "We'll let you know when it's reviewed.",
          });
          onClose();
        } else {
          toast.error(`${formatHandle(page.username)} doesn't meet the requirements yet`);
        }
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Choose a page</SheetTitle>
          <SheetDescription>
            {overview.join_method === "manual"
              ? "Pick the page you want to join with. Our team reviews each request."
              : "These are your pages that meet this campaign's requirements."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-inline px-4 pb-6">
          {eligible.length > 0 ? (
            <ul className="space-y-tight">
              {eligible.map((page) => {
                const joining = join.isPending && join.variables === page.social_account_id;
                return (
                  <li key={page.social_account_id}>
                    <button
                      type="button"
                      disabled={join.isPending}
                      onClick={() => onJoin(page)}
                      className="gap-inline p-card flex min-h-14 w-full items-center justify-between card-surface text-left transition-colors hover:bg-muted/50 disabled:opacity-60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {formatHandle(page.username)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {platformLabel(page.platform)}
                          {page.membership?.status === "rejected" && " · try again"}
                        </span>
                      </span>
                      {joining ? (
                        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-card space-y-tight rounded-xl border border-dashed text-sm">
              <p className="font-medium">
                {candidates.length === 0
                  ? "You don't have a page that can join right now."
                  : "None of your pages meet the requirements yet."}
              </p>
              {needsProfile && <p className="text-muted-foreground">{sentenceCase(needsProfile)}.</p>}
            </div>
          )}

          {hidden > 0 && eligible.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {hidden} {hidden === 1 ? "page isn't" : "pages aren't"} shown because{" "}
              {hidden === 1 ? "it doesn't" : "they don't"} meet the requirements.
            </p>
          )}

          <div className="gap-tight flex flex-wrap">
            <Button
              variant="outline"
              size="lg"
              disabled={refresh.isPending}
              onClick={() =>
                refresh.mutate(undefined, {
                  onSuccess: () => toast.success("Your pages are up to date"),
                  onError: (error) => toast.error(errorMessage(error)),
                })
              }
            >
              {refresh.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Re-check my pages
            </Button>
            <Link
              href="/settings/socials"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Connect another account
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function sentenceCase(text: string): string {
  const trimmed = text.trim().replace(/[.!?]+$/, "");
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function isDeclined(page: MembershipPage): boolean {
  const membership = page.membership;
  if (!membership) return false;
  return (
    membership.status === "rejected" ||
    (membership.status === "removed" && membership.decided_by === "admin")
  );
}

function DeclinedReason({ page }: { page: MembershipPage }) {
  const membership = page.membership;
  const failures = (membership?.evaluation?.results ?? []).filter(
    (result) => result.outcome === "fail" || result.outcome === "missing_input"
  );

  return (
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
  );
}

function PageRow({ page }: { page: MembershipPage }) {
  const leave = useLeaveCampaignMutation();
  const [confirming, setConfirming] = React.useState(false);
  const membership = page.membership;
  const status = membership?.status;

  function onLeave() {
    if (!membership) return;
    leave.mutate(membership.id, {
      onSuccess: () => toast.success(status === "pending" ? "Request withdrawn" : "Left the campaign"),
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <li className="p-card space-y-tight card-surface">
      <div className="gap-inline flex flex-wrap items-center justify-between">
        <div className="min-w-0">
          <p className="truncate font-medium">{formatHandle(page.username)}</p>
          <p className="text-xs text-muted-foreground">{platformLabel(page.platform)}</p>
        </div>

        <div className="gap-tight flex flex-wrap items-center">
          {status === "approved" && !confirming && (
            <>
              <span className="gap-tight flex items-center text-sm font-medium text-success">
                <CheckCircle2 className="size-4" />
                Joined
              </span>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                Leave
              </Button>
            </>
          )}

          {status === "approved" && confirming && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" disabled={leave.isPending} onClick={onLeave}>
                {leave.isPending && <Loader2 className="animate-spin" />}
                Leave campaign
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

          {!page.connected && !confirming && (
            <Link
              href="/settings/socials"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Reconnect
            </Link>
          )}
        </div>
      </div>

      {confirming && (
        <p className="text-xs text-muted-foreground">
          This page won&apos;t be able to submit new clips to this campaign.
        </p>
      )}

      {isDeclined(page) && <DeclinedReason page={page} />}
    </li>
  );
}
