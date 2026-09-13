"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency, platformLabel } from "@/lib/format";
import { useJoinableCampaignsQuery } from "@/hooks/use-campaigns";
import { useSocialAccountsQuery } from "@/hooks/use-social-accounts";
import { useCreateSubmissionMutation } from "@/hooks/use-submissions";
import { useUiStore } from "@/stores/ui-store";
import {
  submissionFormSchema,
  type SubmissionFormValues,
} from "@/schemas/submission-form";
import { platformFromPostUrl, type SubmissionIssue } from "@/schemas/submission";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { errorMessage } from "@/components/shared/query-state";
import { SubmissionIssues } from "@/components/submissions/submission-issues";

export function SubmitClipSheet() {
  const submitOpen = useUiStore((state) => state.submitOpen);
  const submitCampaignId = useUiStore((state) => state.submitCampaignId);
  const closeSubmit = useUiStore((state) => state.closeSubmit);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [issues, setIssues] = React.useState<SubmissionIssue[]>([]);

  const campaigns = useJoinableCampaignsQuery(submitOpen);
  const accounts = useSocialAccountsQuery();
  const createSubmission = useCreateSubmissionMutation();

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: { campaign_id: submitCampaignId ?? "", post_url: "" },
  });

  React.useEffect(() => {
    if (submitOpen) {
      form.reset({ campaign_id: submitCampaignId ?? "", post_url: "" });
      setFormError(null);
      setIssues([]);
    }
  }, [submitOpen, submitCampaignId, form]);

  const postUrl = form.watch("post_url");
  const campaignId = form.watch("campaign_id");

  const detectedPlatform = platformFromPostUrl(postUrl);
  const selectedCampaign = campaigns.data?.find((campaign) => campaign.id === campaignId);

  const connectedPlatforms = new Set(
    (accounts.data ?? [])
      .filter((account) => !account.needs_reconnect)
      .map((account) => account.platform)
  );
  const notConnected = detectedPlatform !== null && !connectedPlatforms.has(detectedPlatform);
  const notAllowed =
    detectedPlatform !== null &&
    selectedCampaign !== undefined &&
    selectedCampaign.allowed_platforms.length > 0 &&
    !selectedCampaign.allowed_platforms.includes(detectedPlatform);

  function onSubmit(values: SubmissionFormValues) {
    setFormError(null);
    setIssues([]);
    createSubmission.mutate(values, {
      onSuccess: (response) => {
        if (response.submission.issues.length > 0) {
          setIssues(response.submission.issues);
          return;
        }
        toast.success("Clip submitted", {
          description: "We've started tracking its views.",
        });
        closeSubmit();
      },
      onError: (error) => setFormError(errorMessage(error)),
    });
  }

  return (
    <Sheet open={submitOpen} onOpenChange={(open) => !open && closeSubmit()}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Submit a clip</SheetTitle>
          <SheetDescription>
            Paste the link to a post you&apos;ve already published.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-4 pb-6">
            <FormField
              control={form.control}
              name="campaign_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-11 w-full">
                        {/* Base UI renders the stored value unless given a
                            render function, which would show the raw uuid. */}
                        <SelectValue placeholder="Choose a campaign">
                          {(value) =>
                            campaigns.data?.find((campaign) => campaign.id === value)?.name ??
                            "Choose a campaign"
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(campaigns.data ?? []).map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name} · {formatCurrency(campaign.cpm)}/1k
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {campaigns.isPending && (
                    <FormDescription>Loading campaigns…</FormDescription>
                  )}
                  {!campaigns.isPending && (campaigns.data?.length ?? 0) === 0 && (
                    <FormDescription>
                      No campaigns are open right now.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="post_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post link</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      inputMode="url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="https://www.tiktok.com/@you/video/123…"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instagram, X, TikTok or YouTube. The post must be public and
                    posted by your connected account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {notConnected && (
              <p className="text-sm text-destructive">
                Connect your {platformLabel(detectedPlatform)} account on the Profile
                tab before submitting a post from it.
              </p>
            )}

            {notAllowed && (
              <p className="text-sm text-destructive">
                This campaign doesn&apos;t accept {platformLabel(detectedPlatform)} posts.
              </p>
            )}

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <SubmissionIssues issues={issues} heading="Saved, but not tracking yet" />

            <Button
              type="submit"
              size="xl"
              className="w-full"
              disabled={createSubmission.isPending || notConnected || notAllowed}
            >
              {createSubmission.isPending && <Loader2 className="animate-spin" />}
              {createSubmission.isPending ? "Checking your post…" : "Submit clip"}
            </Button>

            {createSubmission.isPending && (
              <p className="text-center text-xs text-muted-foreground">
                We&apos;re fetching the post from the platform to confirm it&apos;s yours.
                This can take up to 20 seconds.
              </p>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
