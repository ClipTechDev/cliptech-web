"use client";

import Link from "next/link";
import { ChevronRight, LifeBuoy } from "lucide-react";

import { LEGAL_DOCUMENTS } from "@/lib/legal";
import { useMeQuery } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryState } from "@/components/shared/query-state";
import { PushNotificationsCard } from "@/components/notifications/push-notifications-card";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { BalanceSummary } from "@/components/profile/balance-summary";
import { ProfileForm } from "@/components/profile/profile-form";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { SocialAccounts } from "@/components/profile/social-accounts";
import { ThemeToggle } from "@/components/profile/theme-toggle";

/**
 * Profile is three things a creator came here for, in the order they matter:
 * what they've earned, which accounts are connected (the thing that blocks
 * submitting), and their details.
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
        <div className="space-y-8">
          <AvatarUpload user={user} />

          <Section title="Earnings">
            <BalanceSummary />
          </Section>

          <Section
            title="Connected accounts"
            description="You can only submit clips from an account you've connected."
          >
            <SocialAccounts />
          </Section>

          <Section title="Notifications">
            <PushNotificationsCard />
          </Section>

          <Section title="Your details">
            <ProfileForm user={user} />
          </Section>

          <Section title="Appearance">
            <ThemeToggle />
          </Section>

          <Section title="Help">
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
          </Section>

          <Section title="Legal">
            <ul className="space-y-tight">
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
          </Section>

          <SignOutButton />
        </div>
      )}
    </QueryState>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h2 className="font-heading font-semibold">{title}</h2>
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
    <div className="space-y-8" aria-busy="true">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
