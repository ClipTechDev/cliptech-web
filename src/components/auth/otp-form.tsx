"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { safeNextPath } from "@/lib/redirect";
import { useSendOtpMutation, useVerifyOtpMutation } from "@/hooks/use-auth";
import {
  emailStepSchema,
  verifyOtpSchema,
  type EmailStepValues,
  type VerifyOtpValues,
} from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

/**
 * Sign in and sign up are the same flow: VerifyOTP calls GetOrCreateByEmail,
 * so a first-time email is an account creation and there is nothing for a
 * creator to choose between. Hence one form, two steps, no "create account"
 * link.
 */
export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = React.useState<string | null>(null);

  return email === null ? (
    <EmailStep onSent={setEmail} />
  ) : (
    <CodeStep email={email} next={next} onBack={() => setEmail(null)} router={router} />
  );
}

function EmailStep({ onSent }: { onSent: (email: string) => void }) {
  const [formError, setFormError] = React.useState<string | null>(null);
  const sendOtp = useSendOtpMutation();
  const consentTextId = React.useId();

  const form = useForm<EmailStepValues>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: { email: "", acceptedTerms: false },
  });

  function onSubmit(values: EmailStepValues) {
    setFormError(null);
    // Only the email goes upstream: SendOTPRequest has no consent field, and
    // sending one the API ignores would imply it was recorded there.
    sendOtp.mutate(
      { email: values.email },
      {
        onSuccess: () => onSent(values.email),
        onError: (error) => setFormError(signInErrorMessage(error)),
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Sign in to ClipTech
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll email you a code. No password to remember.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptedTerms"
          render={({ field }) => (
            <FormItem>
              <div className="gap-inline flex items-start">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-labelledby={consentTextId}
                    className="mt-0.5"
                  />
                </FormControl>

                {/* Not a <label>: it contains links, and interactive content
                    inside a label both breaks the accessibility contract and
                    makes tapping "Terms of Service" toggle the box on the way
                    to the page. aria-labelledby gives the checkbox the same
                    name without nesting them. */}
                <p id={consentTextId} className="text-sm text-pretty text-muted-foreground">
                  I agree to the{" "}
                  <ConsentLink href="/legal/terms">Terms of Service</ConsentLink> and{" "}
                  <ConsentLink href="/legal/privacy">Privacy Policy</ConsentLink>.
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* A failed sign-in belongs next to the field, not in a toast that
            disappears while the creator is still reading it. */}
        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" size="xl" className="w-full" disabled={sendOtp.isPending}>
          {sendOtp.isPending && <Loader2 className="animate-spin" />}
          Continue
        </Button>
      </form>
    </Form>
  );
}

/**
 * Opens in a new tab on purpose: a creator who stops to read the terms should
 * come back to the email they had already typed, not to an empty form.
 */
function ConsentLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4"
    >
      {children}
    </Link>
  );
}

function CodeStep({
  email,
  next,
  onBack,
  router,
}: {
  email: string;
  next: string;
  onBack: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const verifyOtp = useVerifyOtpMutation();
  const resendOtp = useSendOtpMutation();

  // The API enforces a cooldown between sends (OTP_RESEND_INTERVAL_SECONDS,
  // 60s by default) and answers 429 inside it. Counting down here means the
  // button is simply unavailable until it would work, rather than offering an
  // action that is guaranteed to fail.
  const { secondsLeft, restart } = useResendCountdown(RESEND_COOLDOWN_SECONDS);

  const form = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  function onSubmit(values: VerifyOtpValues) {
    setFormError(null);
    verifyOtp.mutate(
      { email, otp: values.otp },
      {
        onSuccess: () => {
          // replace, not push, so Back doesn't return to the login screen of a
          // session that now exists.
          router.replace(next);
          router.refresh();
        },
        onError: (error) => setFormError(signInErrorMessage(error)),
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Enter your code
          </h1>
          <p className="text-sm text-muted-foreground">
            Sent to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>6-digit code</FormLabel>
              <FormControl>
                <Input
                  // `inputMode="numeric"` brings up the number pad without
                  // type="number"'s spinner and scroll-to-change behaviour.
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  placeholder="123456"
                  className="h-11 text-center font-mono text-lg tracking-[0.4em]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                It expires in 10 minutes. Check your spam folder if it
                hasn&apos;t arrived.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError && <p className="text-sm text-destructive">{formError}</p>}
        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

        <Button type="submit" size="xl" className="w-full" disabled={verifyOtp.isPending}>
          {verifyOtp.isPending && <Loader2 className="animate-spin" />}
          Sign in
        </Button>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft />
            Change email
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={resendOtp.isPending || secondsLeft > 0}
            onClick={() => {
              setFormError(null);
              setNotice(null);
              resendOtp.mutate(
                { email },
                {
                  onSuccess: () => {
                    restart();
                    // The old code is dead the moment a new one is issued, so
                    // say so - otherwise the first email still on screen looks
                    // like a valid thing to type.
                    setNotice("A new code is on its way. The previous one no longer works.");
                    form.reset({ otp: "" });
                  },
                  onError: (error) => setFormError(signInErrorMessage(error)),
                }
              );
            }}
          >
            {resendOtp.isPending
              ? "Sending…"
              : secondsLeft > 0
                ? `Resend in ${secondsLeft}s`
                : "Resend code"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

/**
 * Mirrors OTP_RESEND_INTERVAL_SECONDS on the API. A mismatch is harmless in
 * one direction only: too long here just makes a creator wait, while too short
 * offers a button that answers 429.
 */
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Counts down from `seconds` to zero, starting immediately - reaching this
 * step means a code has just been sent, so the cooldown is already running.
 */
function useResendCountdown(seconds: number) {
  const [deadline, setDeadline] = React.useState(() => Date.now() + seconds * 1000);
  const [secondsLeft, setSecondsLeft] = React.useState(seconds);

  React.useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      return remaining;
    };

    tick();
    const timer = setInterval(() => {
      // Recomputed from a deadline rather than decremented, so a backgrounded
      // tab that stops firing timers does not resume with a stale count.
      if (tick() === 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  const restart = React.useCallback(
    () => setDeadline(Date.now() + seconds * 1000),
    [seconds]
  );

  return { secondsLeft, restart };
}

/**
 * The API writes copy a creator can act on for every sign-in failure - wrong
 * code, expired code, attempts spent, asked again too soon, relay down - and
 * each one implies a different next step. So its `message` is passed straight
 * through rather than flattened into a single "that didn't work".
 */
function signInErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
