"use client";

import Link from "next/link";
import { ChevronRight, LifeBuoy } from "lucide-react";

import { LEGAL_DOCUMENTS } from "@/lib/legal";
import { useMeQuery } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryState } from "@/components/shared/query-state";
import { PushNotificationsCard } from "@/components/notifications/push-notifications-card";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { PaymentMethods } from "@/components/profile/payment-methods";
import { ProfileForm } from "@/components/profile/profile-form";
import {
  ProfileSectionNav,
  type ProfileSectionLink,
} from "@/components/profile/profile-section-nav";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { SocialAccounts } from "@/components/profile/social-accounts";
import { ThemeToggle } from "@/components/profile/theme-toggle";

const SECTIONS: ProfileSectionLink[] = [
  { id: "personal-info", label: "Personal info" },
  { id: "connected-accounts", label: "Connected accounts" },
  { id: "payout-methods", label: "Payout methods" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "help", label: "Help & legal" },
  { id: "account", label: "Account" },
];

/**
 * Profile is a settings surface, not a feed: one card per concern, and a nav
 * beside them so a creator can jump straight to the one they came for instead
 * of scrolling past the other seven.
 */
export function ProfileScreen() {
  const { data: user, error, isPending, refetch } = useMeQuery();

  return (
    <QueryState
      isLoading={isPending}
      loadingFallback={<ProfileSkeleton />}
      error={error}
      onRetry={() => void refetch()}
    >
      {user && (
        <div className="gap-section mt-2 flex flex-col lg:grid lg:grid-cols-[12rem_1fr]">
          <div>
            <div className="lg:sticky lg:top-24">
              <ProfileSectionNav sections={SECTIONS} />
            </div>
          </div>

          <div className="space-y-block min-w-0">
            <Section
              id="personal-info"
              title="Personal info"
              description="Your photo and details. Only your name is shown to campaign owners."
            >
              <div className="space-y-block">
                <AvatarUpload user={user} />
                <ProfileForm user={user} />
              </div>
            </Section>

            <Section
              id="connected-accounts"
              title="Connected accounts"
              description="Link the social accounts you post from — either by signing in, or by putting a short code in your bio. You can connect more than one per platform, and a clip can only be submitted from a connected account."
            >
              <SocialAccounts />
            </Section>

            <Section
              id="payout-methods"
              title="Payout methods"
              description="Where we send your earnings. You'll need one saved before you can withdraw."
            >
              <PaymentMethods />
            </Section>

            <Section
              id="notifications"
              title="Notifications"
              description="Get told when a clip is approved or a campaign goes live."
            >
              <PushNotificationsCard />
            </Section>

            <Section
              id="appearance"
              title="Appearance"
              description="How ClipTech looks on this device."
            >
              <ThemeToggle />
            </Section>

            <Section
              id="help"
              title="Help & legal"
              description="Get in touch, or read the rules you agreed to."
            >
              <div className="space-y-inline">
                <Link
                  href="/dashboard/support"
                  className="gap-inline p-card flex items-center rounded-xl border transition-colors hover:border-primary/40"
                >
                  <LifeBuoy className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Contact support</span>
                    <span className="block text-sm text-muted-foreground">
                      Report a problem or send feedback
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>

                <ul className="gap-inline flex flex-wrap">
                  {LEGAL_DOCUMENTS.map((document) => (
                    <li key={document.href}>
                      <Link
                        href={document.href}
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {document.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>

            <Section
              id="account"
              title="Account"
              description="You'll need to sign in with an email code again."
            >
              <SignOutButton />
            </Section>
          </div>
        </div>
      )}
    </QueryState>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="p-card space-y-block scroll-mt-20 rounded-2xl border bg-card sm:p-5 lg:scroll-mt-24"
    >
      <div className="space-y-1">
        <h2 id={`${id}-heading`} className="font-heading font-semibold">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-pretty text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div
      className="gap-section mt-2 flex flex-col lg:grid lg:grid-cols-[12rem_1fr]"
      aria-busy="true"
    >
      <div className="gap-tight flex lg:flex-col">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-9 w-28 rounded-lg lg:w-full" />
        ))}
      </div>
      <div className="space-y-block min-w-0">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
