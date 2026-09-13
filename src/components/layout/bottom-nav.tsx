"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  House,
  Megaphone,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const TABS: Tab[] = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/submissions", label: "Clips", icon: Clapperboard },
  { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

/**
 * The whole navigation model, in one element.
 *
 * Below `sm` it is a full-width bar pinned to the bottom edge - thumb range on
 * a phone, and the shape every app a creator already uses puts its tabs in.
 * At `sm` and up the same element becomes a floating pill centred above the
 * bottom edge: still a tab bar, not a sidebar, because the desktop view is the
 * same three surfaces and a sidebar would imply an admin tool.
 *
 * The safe-area padding matters on iOS - without it the bar sits under the
 * home indicator and the labels are unreadable.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transform-gpu border-t bg-background/80 backdrop-blur-sm",
        "pb-[env(safe-area-inset-bottom)]",
        "sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2",
        "sm:rounded-full sm:border sm:pb-0 sm:shadow-lg sm:shadow-black/5"
      )}
    >
      <ul className="flex items-stretch sm:gap-1 sm:p-1.5">
        {TABS.map((tab) => {
          const active =
            tab.href === "/dashboard"
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1 sm:flex-none">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                  "sm:h-10 sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:text-sm",
                  active
                    ? "text-primary sm:bg-primary sm:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground sm:hover:bg-muted"
                )}
              >
                <Icon className="size-5 sm:size-4" />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
