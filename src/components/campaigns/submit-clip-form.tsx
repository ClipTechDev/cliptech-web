"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

import { platformLabel } from "@/lib/format";
import { dashboardKeys } from "@/hooks/use-dashboard";
import { submissionsKeys } from "@/hooks/use-submissions";
import { campaignClosedReason, mentionEntries, type Campaign } from "@/schemas/campaign";
import { platformFromPostUrl } from "@/schemas/submission";
import type { Platform } from "@/schemas/common";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmissionIssues } from "@/components/submissions/submission-issues";
import { submitClipAction } from "@/app/(app)/dashboard/campaigns/[id]/actions";
import {
  initialSubmitClipState,
  type SubmitClipState,
} from "@/app/(app)/dashboard/campaigns/[id]/submit-clip-state";

export function SubmitClipForm({
  campaign,
  connectedPlatforms,
}: {
  campaign: Campaign;
  connectedPlatforms: Platform[] | null;
}) {
  const [state, formAction, isPending] = React.useActionState(
    submitClipAction,
    initialSubmitClipState
  );

  const [postUrl, setPostUrl] = React.useState("");
  const [editedAfter, setEditedAfter] = React.useState<SubmitClipState | null>(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (state.status !== "success") return;
    queryClient.invalidateQueries({ queryKey: submissionsKeys.lists() });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  }, [state, queryClient]);

  if (state.status === "success") {
    return (
      <section className="gap-inline p-card flex flex-col items-center rounded-xl border border-success/30 bg-success/5 text-center">
        <CheckCircle2 className="size-5 text-success" />
        <div className="space-y-tight">
          <p className="font-medium">Clip submitted</p>
          <p className="text-sm text-muted-foreground">
            Our team will review it shortly. Views count from now, and it starts
            earning once approved.
          </p>
        </div>
        <Link
          href="/dashboard/submissions"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          View your clips
        </Link>
      </section>
    );
  }

  const closedReason = campaignClosedReason(campaign);
  if (closedReason) {
    return (
      <p className="p-card rounded-xl border border-dashed text-center text-sm text-muted-foreground">
        This campaign isn&apos;t accepting submissions. {closedReason}.
      </p>
    );
  }

  const detected = platformFromPostUrl(postUrl);
  const notConnected =
    detected !== null &&
    connectedPlatforms !== null &&
    !connectedPlatforms.includes(detected);
  const notAllowed =
    detected !== null &&
    campaign.allowed_platforms.length > 0 &&
    !campaign.allowed_platforms.includes(detected);
  const postUrlPlaceholder = placeholderForPlatforms(campaign.allowed_platforms);

  const blocked = notConnected || notAllowed;
  const duplicate = state.status === "duplicate" && editedAfter !== state ? state : null;
  const failedChecks = state.status === "issues" && editedAfter !== state ? state : null;

  return (
    <form action={formAction} className="space-y-inline">
      <input type="hidden" name="campaign_id" value={campaign.id} />

      <div className="space-y-tight">
        <Label htmlFor="post_url">Post link</Label>
        <Input
          id="post_url"
          name="post_url"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          required
          placeholder={postUrlPlaceholder}
          className="h-11"
          value={postUrl}
          onChange={(event) => {
            setPostUrl(event.target.value);
            setEditedAfter(state);
          }}
          aria-invalid={
            (state.status === "error" && state.field === "post_url") ||
            duplicate !== null ||
            failedChecks !== null
          }
          aria-describedby="post_url_hint"
        />
        <p id="post_url_hint" className="text-sm text-muted-foreground">
          {campaign.allowed_platforms.length > 0
            ? campaign.allowed_platforms.map(platformLabel).join(", ")
            : "Instagram, X, TikTok or YouTube"}
          . The post must be public and posted by your connected account
          {campaign.hashtags.length > 0 &&
            `, with ${campaign.hashtags.map((tag) => `#${tag}`).join(" ")} in the caption`}
          {mentionEntries(campaign).length > 0 &&
            `. Mention ${mentionEntries(campaign)
              .map(([platform, handle]) => `@${handle} on ${platformLabel(platform)}`)
              .join(", ")}`}
          {(campaign.caption_phrases ?? []).length > 0 &&
            `. Include ${campaign.caption_phrases.map((phrase) => `"${phrase}"`).join(", ")} in the caption`}
          .
        </p>
      </div>

      {notConnected && detected && (
        <FormMessage>
          Connect your {platformLabel(detected)} account on the Profile tab before
          submitting a post from it.
        </FormMessage>
      )}

      {notAllowed && detected && (
        <FormMessage>
          This campaign doesn&apos;t accept {platformLabel(detected)} posts.
        </FormMessage>
      )}

      {state.status === "error" && <FormMessage>{state.message}</FormMessage>}

      {failedChecks && (
        <SubmissionIssues
          issues={failedChecks.issues}
          next="resubmit"
          heading="Not submitted - fix this on the post, then submit it again"
        />
      )}

      {duplicate && (
        <div className="space-y-tight">
          <FormMessage>{duplicate.message}</FormMessage>
          {duplicate.submissionId && (
            <Link
              href={`/dashboard/submissions/${duplicate.submissionId}`}
              className="text-sm font-medium underline underline-offset-4"
            >
              View that clip
            </Link>
          )}
        </div>
      )}

      <Button type="submit" size="xl" className="w-full" disabled={isPending || blocked}>
        {isPending && <Loader2 className="animate-spin" />}
        {isPending ? "Checking your post…" : "Submit clip"}
      </Button>

      {isPending && (
        <p className="text-center text-sm text-muted-foreground">
          We&apos;re fetching the post from the platform to confirm it&apos;s yours. This
          can take up to 20 seconds.
        </p>
      )}
    </form>
  );
}

function placeholderForPlatforms(platforms: Platform[]): string {
  switch (platforms[0]) {
    case "instagram":
      return "https://www.instagram.com/reel/ABC123xyz/";
    case "twitter":
      return "https://x.com/yourhandle/status/1234567890123456789";
    case "youtube":
      return "https://www.youtube.com/shorts/dQw4w9WgXcQ";
    case "tiktok":
    default:
      return "https://www.tiktok.com/@you/video/1234567890123456789";
  }
}

function FormMessage({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-sm text-destructive">
      {children}
    </p>
  );
}
