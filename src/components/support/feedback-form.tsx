"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";

import { ACCEPTED_IMAGE_ACCEPT_ATTR, imageRejectionReason } from "@/lib/upload";
import { useSubmitFeedbackMutation } from "@/hooks/use-feedback";
import { feedbackFormSchema, type FeedbackFormValues } from "@/schemas/feedback";
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
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/components/shared/query-state";

/**
 * The creator's side of req #47.
 *
 * One box and an optional screenshot, because that is the whole endpoint -
 * feedback.Handler.Create takes a description and a file and nothing else.
 * There is deliberately no category picker or subject line: the admin panel
 * reads these as prose, and every extra required field is a reason not to
 * send the report at all.
 *
 * Not a Server Function, unlike the campaign submit form: this posts
 * multipart with a file, and the upload belongs on the connection the browser
 * already has to the API rather than being relayed through this app's server.
 */
export function FeedbackForm() {
  const [screenshot, setScreenshot] = React.useState<File | null>(null);
  const [screenshotError, setScreenshotError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const submitFeedback = useSubmitFeedbackMutation();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { description: "" },
  });

  function onPickScreenshot(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset immediately, or picking the same file twice after a rejection
    // fires no change event.
    event.target.value = "";
    if (!file) return;

    // The API enforces these too (storage.ValidateImage); checking first turns
    // a 400 round trip into an instant, specific message.
    const rejection = imageRejectionReason(file);
    setScreenshotError(rejection);
    setScreenshot(rejection ? null : file);
  }

  function onSubmit(values: FeedbackFormValues) {
    setFormError(null);
    submitFeedback.mutate(
      { description: values.description, screenshot },
      {
        onSuccess: () => setSent(true),
        onError: (error) => setFormError(errorMessage(error)),
      }
    );
  }

  if (sent) {
    return (
      <section className="gap-inline p-card flex flex-col items-center rounded-xl border border-success/30 bg-success/5 text-center">
        <CheckCircle2 className="size-5 text-success" />
        <div className="space-y-tight">
          <p className="font-medium">Thanks — we&apos;ve got it</p>
          <p className="text-sm text-muted-foreground">
            Our team reads every report. We&apos;ll get back to you by email if we
            need more detail.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            // A creator with a second thing to report should not have to
            // reload the page to say it.
            form.reset({ description: "" });
            setScreenshot(null);
            setScreenshotError(null);
            setSent(false);
          }}
        >
          Send another
        </Button>
      </section>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-block">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What&apos;s going on?</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="Tell us what happened, and what you expected instead."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                If it&apos;s about a specific clip or campaign, including its name
                helps us find it faster.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-tight">
          <p className="text-sm leading-none font-medium">Screenshot (optional)</p>

          {screenshot ? (
            <div className="gap-inline p-card flex items-center rounded-xl border">
              <p className="min-w-0 flex-1 truncate text-sm">{screenshot.name}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove screenshot"
                onClick={() => setScreenshot(null)}
              >
                <X />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus />
              Add a screenshot
            </Button>
          )}

          <p className="text-sm text-muted-foreground">
            JPEG, PNG or WebP, up to 5 MB.
          </p>

          {screenshotError && (
            <p role="alert" className="text-sm text-destructive">
              {screenshotError}
            </p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_ACCEPT_ATTR}
            onChange={onPickScreenshot}
            className="hidden"
          />
        </div>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={submitFeedback.isPending}
        >
          {submitFeedback.isPending && <Loader2 className="animate-spin" />}
          {submitFeedback.isPending ? "Sending…" : "Send"}
        </Button>
      </form>
    </Form>
  );
}
