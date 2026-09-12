"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

import { platformLabel } from "@/lib/format";
import { dashboardKeys } from "@/hooks/use-dashboard";
import { submissionsKeys } from "@/hooks/use-submissions";
import { campaignClosedReason, type Campaign } from "@/schemas/campaign";
import { platformFromPostUrl } from "@/schemas/submission";
import type { Platform } from "@/schemas/common";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitClipAction,
} from "@/app/(app)/dashboard/campaigns/[id]/actions";
import { initialSubmitClipState } from "@/app/(app)/dashboard/campaigns/[id]/submit-clip-state";

/**
 * Submit a clip to the campaign already on screen.
 *
 * A real `<form action={serverFunction}>`, so it posts and validates without
 * waiting on hydration - and because the campaign is fixed by the route, there
 * is no picker to load and nothing to choose. The sheet on the Clips tab
 * remains the path for "submit to *some* campaign"; this is the path for
 * "submit to *this* one".
 *
 * `connectedPlatforms` is fetched with the campaign on the server. The two
 * checks it powers are ones the API would also make, run here so a creator
 * finds out before waiting on a 20-second round trip to the platform. `null`
 * means that lookup failed - the check is an optimisation, so an unknown
 * answer skips it and lets the server stay the authority.
 */
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
  const queryClient = useQueryClient();

  // The Clips tab and the balance rollup are client-cached, and a submission
  // just changed both. The server half of the page is revalidated by the
  // action itself; this is the other half.
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
            We&apos;ll start tracking its views shortly.
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

  // Only the two local checks disable the button. The action's own errors do
  // not: they are answers about one attempt, and blocking a retry on them
  // would strand a creator whose post has since gone public.
  const blocked = notConnected || notAllowed;

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
          onChange={(event) => setPostUrl(event.target.value)}
          aria-invalid={state.status === "error" && state.field === "post_url"}
          aria-describedby="post_url_hint"
        />
        <p id="post_url_hint" className="text-sm text-muted-foreground">
          {campaign.allowed_platforms.length > 0
            ? campaign.allowed_platforms.map(platformLabel).join(", ")
            : "Instagram, X, TikTok or YouTube"}
          . The post must be public and posted by your connected account
          {campaign.hashtags.length > 0 &&
            `, with ${campaign.hashtags.map((tag) => `#${tag}`).join(" ")} in the caption`}
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
